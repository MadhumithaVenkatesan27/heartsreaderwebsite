const PhysicalOrder = require("../models/PhysicalOrder");
const PhysicalProduct = require("../models/PhysicalProduct");
const PreorderBook = require("../models/PreorderBook");
const User = require("../models/User");
const PaymentTransaction = require("../models/PaymentTransaction");
const crypto = require("crypto");
const mongoose = require("mongoose");
const { sendEmail, emailTemplates } = require("../services/emailService");
const {
  buildPhysicalOrderInvoicePdf,
} = require("../services/invoicePdfService");
const { createManyNotifications } = require("../services/notificationService");
const { catchAsync, createError } = require("../middleware/errorMiddleware");
const { logActivity } = require("../utils/activityLogger");

const stripe = require("stripe")(
  process.env.STRIPE_SECRET_KEY || "sk_test_missing",
);

const getRazorpayKeyId = () => String(process.env.RAZORPAY_KEY_ID || "").trim();
const getRazorpayKeySecret = () =>
  String(process.env.RAZORPAY_KEY_SECRET || "").trim();

const isRazorpayConfigured = () =>
  Boolean(getRazorpayKeyId() && getRazorpayKeySecret());

const razorpayKeyDiagnostics = () => {
  const keyId = getRazorpayKeyId();
  return {
    keyLoaded: Boolean(keyId),
    keyMode: keyId.startsWith("rzp_test_")
      ? "test"
      : keyId.startsWith("rzp_live_")
        ? "live"
        : "unknown",
  };
};

const getRazorpayUsdToInrRate = () => {
  const rate = Number(process.env.RAZORPAY_INR_PER_USD);
  return Number.isFinite(rate) && rate > 0 ? rate : null;
};

const razorpayRequest = async (pathName, { method = "GET", body } = {}) => {
  const auth = Buffer.from(
    `${getRazorpayKeyId()}:${getRazorpayKeySecret()}`,
  ).toString("base64");
  const response = await fetch(`https://api.razorpay.com/v1${pathName}`, {
    method,
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      payload?.error?.description ||
      payload?.error?.reason ||
      "Razorpay request failed.";
    console.error("Razorpay API request failed:", {
      pathName,
      method,
      status: response.status,
      keyMode: razorpayKeyDiagnostics().keyMode,
      errorCode: payload?.error?.code,
      errorReason: payload?.error?.reason,
    });
    throw Object.assign(new Error(message), {
      statusCode: response.status,
      payload,
    });
  }
  return payload;
};

const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  if (!orderId || !paymentId || !signature) return false;
  const expected = crypto
    .createHmac("sha256", getRazorpayKeySecret())
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature),
    );
  } catch (err) {
    return false;
  }
};

const assertRazorpayOrderIntegrity = (order, { orderId, expectedAmount }) => {
  if (!order || order.id !== orderId) {
    throw Object.assign(new Error("Razorpay order could not be verified."), {
      statusCode: 400,
      securityReason: "razorpay_order_id_mismatch",
    });
  }
  if (String(order.currency || "").toUpperCase() !== "INR") {
    throw Object.assign(new Error("Razorpay order currency is invalid."), {
      statusCode: 400,
      securityReason: "razorpay_order_currency_mismatch",
    });
  }
  if (Number(order.amount) !== Number(expectedAmount)) {
    throw Object.assign(new Error("Razorpay order amount is invalid."), {
      statusCode: 400,
      securityReason: "razorpay_order_amount_mismatch",
    });
  }
};

const assertRazorpayPaymentIntegrity = (
  payment,
  { orderId, paymentId, expectedAmount },
) => {
  if (!payment || payment.id !== paymentId) {
    throw Object.assign(new Error("Razorpay payment could not be verified."), {
      statusCode: 400,
      securityReason: "razorpay_payment_id_mismatch",
    });
  }
  if (payment.order_id !== orderId) {
    throw Object.assign(new Error("Payment does not match this order."), {
      statusCode: 400,
      securityReason: "razorpay_payment_order_mismatch",
    });
  }
  if (String(payment.currency || "").toUpperCase() !== "INR") {
    throw Object.assign(
      new Error("Payment currency does not match server price."),
      {
        statusCode: 400,
        securityReason: "razorpay_payment_currency_mismatch",
      },
    );
  }
  if (Number(payment.amount) !== Number(expectedAmount)) {
    throw Object.assign(
      new Error("Payment amount does not match server price."),
      {
        statusCode: 400,
        securityReason: "razorpay_payment_amount_mismatch",
      },
    );
  }
};

const SHIPPING_RULES = {
  "United States": { code: "US", fee: 6 },
  Canada: { code: "CA", fee: 9.99 },
  India: { code: "IN", fee: 0 },
  "United Kingdom": { code: "GB", fee: 9.99 },
  Australia: { code: "AU", fee: 9.99 },
  "New Zealand": { code: "NZ", fee: 9.99 },
};

const COUNTRY_ALIASES = {
  us: "United States",
  usa: "United States",
  "united states": "United States",
  "united states of america": "United States",
  canada: "Canada",
  india: "India",
  uk: "United Kingdom",
  "united kingdom": "United Kingdom",
  australia: "Australia",
  newzealand: "New Zealand",
  "new zealand": "New Zealand",
};

const getAllowedPaymentCurrencies = () =>
  String(process.env.PAYMENT_ALLOWED_CURRENCIES || "usd")
    .split(",")
    .map((currency) => currency.trim().toLowerCase())
    .filter(Boolean);

const cleanString = (value) => String(value || "").trim();

const recordRazorpayTransaction = async ({
  userId,
  providerPaymentId,
  type,
  status,
  amount = 0,
  currency = "INR",
  raw,
  metadata = {},
}) => {
  try {
    if (!providerPaymentId) {
      await PaymentTransaction.create({
        userId,
        provider: "razorpay",
        type,
        status,
        amount,
        currency,
        raw,
        metadata,
      });
      return;
    }
    await PaymentTransaction.findOneAndUpdate(
      {
        provider: "razorpay",
        providerPaymentId,
        type,
      },
      {
        $set: {
          userId,
          provider: "razorpay",
          providerPaymentId,
          type,
          status,
          amount,
          currency,
          raw,
          metadata,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  } catch (err) {
    console.error("Razorpay payment transaction log failed:", err.message);
  }
};

const normaliseShippingCountry = (country) => {
  const clean = cleanString(country);
  const normalised = COUNTRY_ALIASES[clean.toLowerCase()] || clean;
  return SHIPPING_RULES[normalised] ? normalised : null;
};

const calculateShippingFee = (country, subtotal) => {
  if (Number(subtotal || 0) >= 100) return 0;
  return SHIPPING_RULES[country]?.fee ?? null;
};

const makeOrderNumber = () =>
  `CHP-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;

const normaliseProductLookupKey = (value) => cleanString(value).toUpperCase();

const normaliseItems = async (items = []) => {
  const list = Array.isArray(items)
    ? items
    : items && typeof items === "object"
      ? Object.values(items)
      : [];

  const identifiers = list
    .map((item) => cleanString(item.sku || item.productId || item.id))
    .filter(Boolean);

  const products = await PhysicalProduct.find({
    active: true,
    $or: [
      {
        sku: {
          $in: identifiers.map((item) => normaliseProductLookupKey(item)),
        },
      },
      {
        productId: {
          $in: identifiers.map((item) => cleanString(item).toLowerCase()),
        },
      },
    ],
  }).lean();

  const bySku = new Map(
    products.map((product) => [
      normaliseProductLookupKey(product.sku),
      product,
    ]),
  );
  const byProductId = new Map(
    products.map((product) => [
      cleanString(product.productId).toLowerCase(),
      product,
    ]),
  );

  return list.map((item) => {
    const requested = cleanString(item.sku || item.productId || item.id);
    const product =
      bySku.get(normaliseProductLookupKey(requested)) ||
      byProductId.get(requested.toLowerCase());

    if (!product) {
      throw createError(
        `Physical product ${requested || "item"} is not available.`,
        400,
      );
    }

    const quantity = Math.min(
      Math.max(parseInt(item.quantity, 10) || 1, 1),
      20,
    );
    return {
      bookId: mongoose.isValidObjectId(product.bookId)
        ? product.bookId
        : undefined,
      sku: product.sku,
      title: product.title,
      edition: product.edition || "Standard Paperback",
      format: product.format || product.edition || "Standard Paperback",
      quantity,
      unitPrice: Number(product.price),
      price: Number(product.price),
      coverImageUrl: cleanString(product.coverImageUrl),
      isPreorder: Boolean(product.isPreorder),
      preorderStatus: product.isPreorder ? "preorder" : "available",
    };
  });
};

const syncPreorderBooks = async (items = [], currency = "USD") => {
  const preorderItems = items.filter((item) => item.isPreorder);
  if (!preorderItems.length) return;

  await Promise.all(
    preorderItems.map((item) =>
      PreorderBook.findOneAndUpdate(
        { sku: item.sku },
        {
          sku: item.sku,
          title: item.title,
          edition: item.edition,
          price: item.unitPrice,
          currency,
          coverImageUrl: item.coverImageUrl,
          status: "preorder",
        },
        { upsert: true, new: true, runValidators: true },
      ),
    ),
  );
};

const sendPhysicalOrderInvoiceEmail = async (order) => {
  const invoicePdf = await buildPhysicalOrderInvoicePdf({ order });
  await sendEmail({
    to: order.shippingAddress.email,
    type: "physical_order",
    userId: order.userId,
    metadata: { orderId: order._id, orderNumber: order.orderNumber },
    attachments: [
      {
        filename: `invoice_${order.orderNumber}.pdf`,
        content: invoicePdf,
        contentType: "application/pdf",
      },
    ],
    ...emailTemplates.physicalOrderConfirmation({
      name: order.shippingAddress.fullName,
      orderNumber: order.orderNumber,
      items: order.items,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      total: order.total,
      currency: order.currency,
      shippingAddress: order.shippingAddress,
    }),
  });
};

const notifyAdminsAboutPhysicalOrder = async (order) => {
  const admins = await User.find({
    role: "admin",
    isActive: true,
    status: "active",
  }).select("_id");

  if (!admins.length) return [];

  return createManyNotifications(
    admins.map((admin) => ({
      userId: admin._id,
      type: "physical_order",
      title: "New physical order received",
      message: `${order.orderNumber} was paid by ${order.shippingAddress?.email || "a customer"} for ${order.currency} ${Number(order.total || 0).toFixed(2)}.`,
      link: "/dashboard.html#physical-orders",
      metadata: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        total: order.total,
        currency: order.currency,
        customerEmail: order.shippingAddress?.email,
        source: "physical_order_paid",
      },
    })),
  );
};

const markPhysicalOrderPaidFromStripe = async ({
  paymentIntent,
  metadata,
  req,
}) => {
  if (!metadata.userId || !metadata.orderId) {
    await logActivity({
      type: "payment_security_blocked",
      req,
      metadata: {
        reason: "missing_physical_order_metadata",
        stripePaymentIntentId: paymentIntent.id,
      },
    });
    throw createError("Physical order payment metadata is incomplete.", 400);
  }

  const order = await PhysicalOrder.findOne({
    _id: metadata.orderId,
    userId: metadata.userId,
  });

  if (!order) throw createError("Physical order not found for payment.", 404);

  const expectedAmount = Math.round(Number(order.total || 0) * 100);
  const paidAmount = Number(
    paymentIntent.amount_received || paymentIntent.amount || 0,
  );
  const expectedCurrency = String(order.currency || "USD").toLowerCase();
  const paidCurrency = String(paymentIntent.currency || "usd").toLowerCase();

  if (expectedAmount !== paidAmount || expectedCurrency !== paidCurrency) {
    await logActivity({
      userId: order.userId,
      type: "payment_security_blocked",
      req,
      metadata: {
        reason: "physical_order_amount_or_currency_mismatch",
        orderId: order._id,
        expectedAmount,
        paidAmount,
        expectedCurrency,
        paidCurrency,
        stripePaymentIntentId: paymentIntent.id,
      },
    });
    throw createError(
      "Physical order payment does not match server price.",
      400,
    );
  }

  if (order.paymentStatus === "paid") return order;

  order.paymentStatus = "paid";
  order.paymentProvider = "stripe";
  order.paymentReference = paymentIntent.id;
  order.orderStatus = "processing";
  await order.save({ validateBeforeSave: false });

  try {
    await sendPhysicalOrderInvoiceEmail(order);
  } catch (err) {
    console.error("Physical order paid email failed:", err.message);
  }

  try {
    await notifyAdminsAboutPhysicalOrder(order);
  } catch (err) {
    console.error("Admin physical order notification failed:", err.message);
  }

  await logActivity({
    userId: order.userId,
    type: "purchase_completed",
    req,
    metadata: {
      source: "physical_order_paid",
      orderId: order._id,
      orderNumber: order.orderNumber,
      amount: order.total,
      currency: order.currency,
      stripePaymentIntentId: paymentIntent.id,
    },
  });

  return order;
};

const markPhysicalOrderPaidFromRazorpay = async ({
  order,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  gatewayAmount,
  gatewayCurrency,
  req,
}) => {
  if (order.paymentStatus === "paid") return order;

  if (razorpayPaymentId) {
    const duplicate = await PhysicalOrder.findOne({
      _id: { $ne: order._id },
      razorpayPaymentId,
    });
    if (duplicate) {
      throw createError(
        "This Razorpay payment is already linked to another order.",
        409,
      );
    }
  }

  order.paymentStatus = "paid";
  order.paymentProvider = "razorpay";
  order.paymentReference = razorpayPaymentId || razorpayOrderId;
  order.razorpayOrderId = razorpayOrderId;
  order.razorpayPaymentId = razorpayPaymentId;
  order.razorpaySignature = razorpaySignature;
  order.gatewayAmount = gatewayAmount;
  order.gatewayCurrency = gatewayCurrency;
  order.orderStatus = "processing";
  await order.save({ validateBeforeSave: false });

  await recordRazorpayTransaction({
    userId: order.userId,
    providerPaymentId: razorpayPaymentId,
    type: "payment_success",
    status: "succeeded",
    amount: gatewayAmount,
    currency: gatewayCurrency,
    metadata: {
      source: "physical_order",
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      razorpayOrderId,
    },
  });

  try {
    await sendPhysicalOrderInvoiceEmail(order);
  } catch (err) {
    console.error("Physical order paid email failed:", err.message);
  }

  try {
    await notifyAdminsAboutPhysicalOrder(order);
  } catch (err) {
    console.error("Admin physical order notification failed:", err.message);
  }

  await logActivity({
    userId: order.userId,
    type: "purchase_completed",
    req,
    metadata: {
      source: "physical_order_paid",
      provider: "razorpay",
      orderId: order._id,
      orderNumber: order.orderNumber,
      amount: order.total,
      currency: order.currency,
      razorpayOrderId,
      razorpayPaymentId,
      gatewayAmount,
      gatewayCurrency,
    },
  });

  return order;
};

const buildPhysicalOrderPayload = async (req) => {
  const items = await normaliseItems(req.body.items);
  const address = req.body.shippingAddress || {};

  if (!items.length || items.some((item) => !item.sku || !item.title)) {
    throw createError("At least one valid physical book is required.", 400);
  }

  const country = normaliseShippingCountry(address.country || "India");
  if (!country) {
    throw createError(
      "Shipping is currently available only for United States, Canada, India, United Kingdom, Australia, and New Zealand.",
      400,
    );
  }

  const shippingAddress = {
    fullName: cleanString(address.fullName || req.user.name),
    phone: cleanString(address.phone),
    email: cleanString(address.email || req.user.email).toLowerCase(),
    addressLine1: cleanString(address.addressLine1 || address.line1),
    addressLine2: cleanString(address.addressLine2 || address.line2),
    line1: cleanString(address.line1 || address.addressLine1),
    line2: cleanString(address.line2 || address.addressLine2),
    city: cleanString(address.city),
    state: cleanString(address.state),
    postalCode: cleanString(address.postalCode),
    country,
  };

  const missing = [
    "fullName",
    "phone",
    "email",
    "line1",
    "city",
    "state",
    "postalCode",
    "country",
  ].find((key) => !shippingAddress[key]);
  if (missing) throw createError(`Shipping ${missing} is required.`, 400);

  const subtotal = items.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0,
  );
  const shippingFee =
    subtotal > 0 ? calculateShippingFee(country, subtotal) : 0;
  const total = subtotal + shippingFee;
  const customer = {
    name: shippingAddress.fullName,
    email: shippingAddress.email,
    phone: shippingAddress.phone,
  };

  return {
    items,
    customer,
    shippingAddress,
    currency: cleanString(req.body.currency || "USD").toUpperCase(),
    subtotal,
    shippingFee,
    total,
  };
};

const createPhysicalOrder = catchAsync(async (req, res, next) => {
  if (process.env.ALLOW_MANUAL_PHYSICAL_ORDERS !== "true") {
    return next(createError("Physical orders require online payment.", 402));
  }

  const {
    items,
    customer,
    shippingAddress,
    currency,
    subtotal,
    shippingFee,
    total,
  } = buildPhysicalOrderPayload(req);

  const order = await PhysicalOrder.create({
    orderNumber: makeOrderNumber(),
    userId: req.user._id,
    customer,
    items,
    shippingAddress,
    currency,
    subtotal,
    shippingFee,
    total,
    paymentStatus: "pending",
    fulfillmentStatus: "received",
    paymentProvider: cleanString(req.body.paymentProvider || "manual"),
    notes: cleanString(req.body.notes),
  });
  await syncPreorderBooks(items, currency);

  try {
    await sendPhysicalOrderInvoiceEmail(order);
  } catch (err) {
    console.error("Physical order email failed:", err.message);
  }

  res.status(201).json({
    status: "success",
    message: "Physical order received.",
    data: { order },
  });
});

const createPhysicalOrderPaymentIntent = catchAsync(async (req, res, next) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return next(createError("Stripe is not configured yet.", 503));
  }
  if (!process.env.STRIPE_PUBLISHABLE_KEY) {
    return next(
      createError("Stripe publishable key is not configured yet.", 503),
    );
  }

  const {
    items,
    customer,
    shippingAddress,
    currency,
    subtotal,
    shippingFee,
    total,
  } = buildPhysicalOrderPayload(req);
  const normalizedCurrency = currency.toLowerCase();
  const allowedCurrencies = getAllowedPaymentCurrencies();

  if (!allowedCurrencies.includes(normalizedCurrency)) {
    await logActivity({
      userId: req.user._id,
      type: "payment_security_blocked",
      email: req.user.email,
      req,
      metadata: {
        reason: "unsupported_currency",
        requestedCurrency: normalizedCurrency,
        allowedCurrencies,
        source: "physical_order",
      },
    });
    return next(createError("Unsupported payment currency.", 400));
  }

  const amountInSmallestUnit = Math.round(Number(total) * 100);
  if (!Number.isFinite(amountInSmallestUnit) || amountInSmallestUnit < 50) {
    return next(createError("Invalid physical order amount.", 400));
  }

  const order = await PhysicalOrder.create({
    orderNumber: makeOrderNumber(),
    userId: req.user._id,
    customer,
    items,
    shippingAddress,
    currency,
    subtotal,
    shippingFee,
    total,
    paymentStatus: "pending",
    fulfillmentStatus: "received",
    paymentProvider: "stripe",
  });
  await syncPreorderBooks(items, currency);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInSmallestUnit,
    currency: normalizedCurrency,
    automatic_payment_methods: { enabled: true },
    receipt_email: shippingAddress.email,
    metadata: {
      purchaseType: "physical_order",
      userId: req.user._id.toString(),
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      expectedAmount: String(amountInSmallestUnit),
      expectedCurrency: normalizedCurrency,
      pricingSource: "server",
    },
  });

  order.paymentReference = paymentIntent.id;
  await order.save({ validateBeforeSave: false });

  await logActivity({
    userId: req.user._id,
    type: "payment_intent_created",
    email: req.user.email,
    req,
    metadata: {
      source: "physical_order",
      orderId: order._id,
      orderNumber: order.orderNumber,
      amountInSmallestUnit,
      currency: normalizedCurrency,
      stripePaymentIntentId: paymentIntent.id,
    },
  });

  res.status(201).json({
    status: "success",
    data: {
      order,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: total,
      currency: normalizedCurrency,
    },
  });
});

const confirmPhysicalOrderPayment = catchAsync(async (req, res, next) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return next(createError("Stripe is not configured yet.", 503));
  }

  const paymentIntentId = cleanString(req.body.paymentIntentId);
  if (!paymentIntentId)
    return next(createError("Payment intent is required.", 400));

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  const metadata = paymentIntent.metadata || {};

  if (metadata.purchaseType !== "physical_order") {
    return next(
      createError("Payment intent is not for a physical order.", 400),
    );
  }

  if (String(metadata.userId) !== String(req.user._id)) {
    await logActivity({
      userId: req.user._id,
      type: "payment_security_blocked",
      email: req.user.email,
      req,
      metadata: {
        reason: "physical_order_confirm_user_mismatch",
        stripePaymentIntentId: paymentIntent.id,
      },
    });
    return next(createError("Payment does not belong to this account.", 403));
  }

  if (paymentIntent.status !== "succeeded") {
    return next(createError("Payment is not complete yet.", 402));
  }

  const order = await markPhysicalOrderPaidFromStripe({
    paymentIntent,
    metadata,
    req,
  });

  res.status(200).json({
    status: "success",
    message: "Physical order payment confirmed.",
    data: { order },
  });
});

const createPhysicalOrderRazorpayOrder = catchAsync(async (req, res, next) => {
  if (!isRazorpayConfigured()) {
    return next(createError("Razorpay is not configured yet.", 503));
  }

  const exchangeRate = getRazorpayUsdToInrRate();
  if (!exchangeRate) {
    return next(
      createError("Razorpay INR conversion rate is not configured yet.", 503),
    );
  }

  const {
    items,
    customer,
    shippingAddress,
    currency,
    subtotal,
    shippingFee,
    total,
  } = buildPhysicalOrderPayload(req);

  if (shippingAddress.country !== "India") {
    return next(
      createError(
        "Razorpay is available only for Indian shipping addresses.",
        400,
      ),
    );
  }

  const amountInPaise = Math.round(Number(total) * exchangeRate * 100);
  if (!Number.isFinite(amountInPaise) || amountInPaise < 100) {
    return next(createError("Invalid Razorpay physical order amount.", 400));
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("Creating Razorpay physical order:", {
      keyMode: razorpayKeyDiagnostics().keyMode,
      amountInPaise,
      currency: "INR",
      itemCount: items.length,
      shippingCountry: shippingAddress.country,
    });
  }

  const order = await PhysicalOrder.create({
    orderNumber: makeOrderNumber(),
    userId: req.user._id,
    customer,
    items,
    shippingAddress,
    currency,
    subtotal,
    shippingFee,
    total,
    paymentStatus: "pending",
    fulfillmentStatus: "received",
    orderStatus: "pending",
    paymentProvider: "razorpay",
  });
  await syncPreorderBooks(items, currency);

  let razorpayOrder;
  try {
    razorpayOrder = await razorpayRequest("/orders", {
      method: "POST",
      body: {
        amount: amountInPaise,
        currency: "INR",
        receipt: order.orderNumber.slice(0, 40),
        notes: {
          purchaseType: "physical_order",
          userId: req.user._id.toString(),
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          canonicalAmount: String(total),
          canonicalCurrency: currency,
          expectedAmount: String(amountInPaise),
          expectedCurrency: "INR",
          exchangeRate: String(exchangeRate),
          pricingSource: "server",
        },
      },
    });
  } catch (err) {
    order.paymentStatus = "failed";
    order.failedReason = `razorpay_order_create_failed:${err.message || "unknown"}`;
    await order.save({ validateBeforeSave: false });
    await recordRazorpayTransaction({
      userId: req.user._id,
      type: "payment_failed",
      status: "failed",
      amount: amountInPaise / 100,
      currency: "INR",
      raw: err.payload,
      metadata: {
        source: "physical_order",
        reason: "razorpay_order_create_failed",
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
      },
    });
    throw err;
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("Razorpay physical order created:", {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      status: razorpayOrder.status,
    });
  }

  order.paymentReference = razorpayOrder.id;
  order.razorpayOrderId = razorpayOrder.id;
  await order.save({ validateBeforeSave: false });

  await logActivity({
    userId: req.user._id,
    type: "payment_intent_created",
    email: req.user.email,
    req,
    metadata: {
      source: "physical_order",
      provider: "razorpay",
      orderId: order._id,
      orderNumber: order.orderNumber,
      amountInSmallestUnit: amountInPaise,
      currency: "INR",
      razorpayOrderId: razorpayOrder.id,
    },
  });

  res.status(201).json({
    status: "success",
    data: {
      order,
      provider: "razorpay",
      keyId: getRazorpayKeyId(),
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: "INR",
      displayAmount: amountInPaise / 100,
      canonicalAmount: total,
      canonicalCurrency: currency,
    },
  });
});

const confirmPhysicalOrderRazorpayPayment = catchAsync(
  async (req, res, next) => {
    if (!isRazorpayConfigured()) {
      return next(createError("Razorpay is not configured yet.", 503));
    }

    const {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    } = req.body;

    if (
      !verifyRazorpaySignature({
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature,
      })
    ) {
      await PhysicalOrder.findOneAndUpdate(
        { razorpayOrderId },
        {
          $set: {
            paymentStatus: "failed",
            failedReason: "razorpay_signature_mismatch",
          },
        },
        { runValidators: true },
      );
      await recordRazorpayTransaction({
        userId: req.user._id,
        providerPaymentId: razorpayPaymentId,
        type: "payment_failed",
        status: "failed",
        metadata: {
          source: "physical_order",
          reason: "razorpay_signature_mismatch",
          razorpayOrderId,
        },
      });
      await logActivity({
        userId: req.user._id,
        type: "payment_security_blocked",
        email: req.user.email,
        req,
        metadata: {
          provider: "razorpay",
          reason: "physical_order_razorpay_signature_mismatch",
          razorpayOrderId,
          razorpayPaymentId,
        },
      });
      return next(createError("Payment verification failed.", 400));
    }

    const [razorpayOrder, payment] = await Promise.all([
      razorpayRequest(`/orders/${encodeURIComponent(razorpayOrderId)}`),
      razorpayRequest(`/payments/${encodeURIComponent(razorpayPaymentId)}`),
    ]);
    const notes = razorpayOrder.notes || {};
    const expectedAmount = Number(notes.expectedAmount);

    try {
      assertRazorpayOrderIntegrity(razorpayOrder, {
        orderId: razorpayOrderId,
        expectedAmount,
      });
      assertRazorpayPaymentIntegrity(payment, {
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        expectedAmount,
      });
    } catch (err) {
      await PhysicalOrder.findOneAndUpdate(
        { razorpayOrderId },
        {
          $set: {
            paymentStatus: "failed",
            failedReason:
              err.securityReason || "razorpay_integrity_check_failed",
          },
        },
      );
      await recordRazorpayTransaction({
        userId: req.user._id,
        providerPaymentId: razorpayPaymentId,
        type: "payment_failed",
        status: "failed",
        amount: Number(payment?.amount || 0) / 100,
        currency: payment?.currency || "INR",
        raw: payment,
        metadata: {
          source: "physical_order",
          reason: err.securityReason || "razorpay_integrity_check_failed",
          razorpayOrderId,
        },
      });
      await logActivity({
        userId: req.user._id,
        type: "payment_security_blocked",
        email: req.user.email,
        req,
        metadata: {
          provider: "razorpay",
          reason: err.securityReason || "razorpay_integrity_check_failed",
          razorpayOrderId,
          razorpayPaymentId,
        },
      });
      return next(
        createError(
          err.message || "Payment verification failed.",
          err.statusCode || 400,
        ),
      );
    }

    if (payment.order_id !== razorpayOrderId) {
      await PhysicalOrder.findOneAndUpdate(
        { razorpayOrderId },
        {
          $set: {
            paymentStatus: "failed",
            failedReason: "payment_order_mismatch",
          },
        },
      );
      await recordRazorpayTransaction({
        userId: req.user._id,
        providerPaymentId: razorpayPaymentId,
        type: "payment_failed",
        status: "failed",
        amount: Number(payment.amount || 0) / 100,
        currency: payment.currency || "INR",
        raw: payment,
        metadata: {
          source: "physical_order",
          reason: "payment_order_mismatch",
          razorpayOrderId,
        },
      });
      return next(createError("Payment does not match this order.", 400));
    }
    if (notes.purchaseType !== "physical_order") {
      return next(
        createError("Razorpay order is not for a physical order.", 400),
      );
    }
    if (String(notes.userId) !== String(req.user._id)) {
      await logActivity({
        userId: req.user._id,
        type: "payment_security_blocked",
        email: req.user.email,
        req,
        metadata: {
          provider: "razorpay",
          reason: "physical_order_razorpay_user_mismatch",
          razorpayOrderId,
          razorpayPaymentId,
        },
      });
      return next(createError("Payment does not belong to this account.", 403));
    }

    const order = await PhysicalOrder.findOne({
      _id: notes.orderId,
      userId: req.user._id,
      paymentProvider: "razorpay",
    });
    if (!order)
      return next(createError("Physical order not found for payment.", 404));

    if (
      Number(payment.amount) !== expectedAmount ||
      payment.currency !== "INR"
    ) {
      order.paymentStatus = "failed";
      order.failedReason = "amount_or_currency_mismatch";
      await order.save({ validateBeforeSave: false });
      await recordRazorpayTransaction({
        userId: req.user._id,
        providerPaymentId: razorpayPaymentId,
        type: "payment_failed",
        status: "failed",
        amount: Number(payment.amount || 0) / 100,
        currency: payment.currency || "INR",
        raw: payment,
        metadata: {
          source: "physical_order",
          reason: "amount_or_currency_mismatch",
          orderId: order._id.toString(),
          razorpayOrderId,
        },
      });
      return next(
        createError("Payment amount does not match server price.", 400),
      );
    }

    let verifiedPayment = payment;
    if (verifiedPayment.status === "authorized") {
      verifiedPayment = await razorpayRequest(
        `/payments/${encodeURIComponent(razorpayPaymentId)}/capture`,
        {
          method: "POST",
          body: { amount: expectedAmount, currency: "INR" },
        },
      );
      try {
        assertRazorpayPaymentIntegrity(verifiedPayment, {
          orderId: razorpayOrderId,
          paymentId: razorpayPaymentId,
          expectedAmount,
        });
      } catch (err) {
        order.paymentStatus = "failed";
        order.failedReason =
          err.securityReason || "razorpay_capture_integrity_check_failed";
        await order.save({ validateBeforeSave: false });
        await recordRazorpayTransaction({
          userId: req.user._id,
          providerPaymentId: razorpayPaymentId,
          type: "payment_failed",
          status: "failed",
          amount: Number(verifiedPayment?.amount || 0) / 100,
          currency: verifiedPayment?.currency || "INR",
          raw: verifiedPayment,
          metadata: {
            source: "physical_order",
            reason:
              err.securityReason || "razorpay_capture_integrity_check_failed",
            orderId: order._id.toString(),
            razorpayOrderId,
          },
        });
        await logActivity({
          userId: req.user._id,
          type: "payment_security_blocked",
          email: req.user.email,
          req,
          metadata: {
            provider: "razorpay",
            reason:
              err.securityReason || "razorpay_capture_integrity_check_failed",
            razorpayOrderId,
            razorpayPaymentId,
          },
        });
        return next(
          createError(
            err.message || "Payment verification failed.",
            err.statusCode || 400,
          ),
        );
      }
    }
    if (
      verifiedPayment.status !== "captured" &&
      verifiedPayment.captured !== true
    ) {
      order.paymentStatus = "failed";
      order.failedReason = `payment_not_captured:${verifiedPayment.status || "unknown"}`;
      await order.save({ validateBeforeSave: false });
      await recordRazorpayTransaction({
        userId: req.user._id,
        providerPaymentId: razorpayPaymentId,
        type: "payment_failed",
        status: "failed",
        amount: Number(verifiedPayment.amount || 0) / 100,
        currency: verifiedPayment.currency || "INR",
        raw: verifiedPayment,
        metadata: {
          source: "physical_order",
          reason: "payment_not_captured",
          orderId: order._id.toString(),
          razorpayOrderId,
        },
      });
      return next(createError("Payment is not complete yet.", 402));
    }

    const paidOrder = await markPhysicalOrderPaidFromRazorpay({
      order,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      gatewayAmount: Number(verifiedPayment.amount) / 100,
      gatewayCurrency: verifiedPayment.currency,
      req,
    });

    res.status(200).json({
      status: "success",
      message: "Physical order payment confirmed.",
      data: { order: paidOrder },
    });
  },
);

const getMyPhysicalOrders = catchAsync(async (req, res) => {
  const orders = await PhysicalOrder.find({ userId: req.user._id }).sort({
    createdAt: -1,
  });
  res.status(200).json({ status: "success", data: { orders } });
});

module.exports = {
  createPhysicalOrder,
  createPhysicalOrderPaymentIntent,
  confirmPhysicalOrderPayment,
  createPhysicalOrderRazorpayOrder,
  confirmPhysicalOrderRazorpayPayment,
  getMyPhysicalOrders,
  markPhysicalOrderPaidFromStripe,
  markPhysicalOrderPaidFromRazorpay,
};

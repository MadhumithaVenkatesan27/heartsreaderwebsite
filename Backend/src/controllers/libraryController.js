const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const User = require("../models/User");
const Book = require("../models/Book");
const Purchase = require("../models/Purchase");
const BookAccess = require("../models/BookAccess");
const ReadingProgress = require("../models/ReadingProgress");
const RefundRequest = require("../models/RefundRequest");
const { sendEmail, emailTemplates } = require("../services/emailService");
const {
  buildPreviewWatermarkedPdf,
  buildReaderWatermarkedPdf,
  generateWatermarkedPdf,
} = require("../services/pdfService");
const {
  isR2StorageEnabled,
  withChapterPdfPath,
} = require("../services/pdfStorageService");
const {
  signReadToken,
  verifyReadToken,
  setSecurePdfHeaders,
} = require("../services/readerSecurityService");
const { catchAsync, createError } = require("../middleware/errorMiddleware");
const { logActivity } = require("../utils/activityLogger");
const { createRefundRequest } = require("../services/refundService");
const { buildInvoicePdf } = require("../services/invoicePdfService");
const { fulfillPurchase } = require("../services/purchaseFulfillmentService");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || "sk_test_missing");
const mongoose = require("mongoose");

const getAllowedPaymentCurrencies = () =>
  String(process.env.PAYMENT_ALLOWED_CURRENCIES || "usd")
    .split(",")
    .map((currency) => currency.trim().toLowerCase())
    .filter(Boolean);

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
    `${getRazorpayKeyId()}:${getRazorpayKeySecret()}`
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
      payload?.error?.description || payload?.error?.reason || "Razorpay request failed.";
    console.error("Razorpay API request failed:", {
      pathName,
      method,
      status: response.status,
      keyMode: razorpayKeyDiagnostics().keyMode,
      errorCode: payload?.error?.code,
      errorReason: payload?.error?.reason,
    });
    throw Object.assign(new Error(message), { statusCode: response.status, payload });
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
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
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

const assertRazorpayPaymentIntegrity = (payment, { orderId, paymentId, expectedAmount }) => {
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
    throw Object.assign(new Error("Payment currency does not match server price."), {
      statusCode: 400,
      securityReason: "razorpay_payment_currency_mismatch",
    });
  }
  if (Number(payment.amount) !== Number(expectedAmount)) {
    throw Object.assign(new Error("Payment amount does not match server price."), {
      statusCode: 400,
      securityReason: "razorpay_payment_amount_mismatch",
    });
  }
};

const buildDigitalPurchaseDetails = ({ book, user, chapterId }) => {
  let amount = book.price;
  const metadata = {
    userId: user._id.toString(),
    bookId: book._id.toString(),
    purchaseType: "book",
  };

  if (chapterId) {
    const chapter = resolveChapter(book, chapterId);
    if (!chapter) return { error: createError("Chapter not found.", 404) };
    if (isFreeChapter(book, chapter)) {
      return { error: createError("This chapter is already free to read.", 400) };
    }
    if (user.ownsChapter(book._id, chapter._id)) {
      return { error: createError("You already own this chapter.", 400) };
    }
    amount = chapter.price;
    metadata.chapterId = chapter._id.toString();
    metadata.purchaseType = "chapter";
  } else if (user.ownsBook(book._id)) {
    return { error: createError("You already own this book.", 400) };
  }

  return { amount, metadata };
};

const makeInvoiceNumber = () =>
  `CH-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;

const isFreeChapter = (book, chapter) => {
  return Number(chapter?.chapterNumber || chapter?.order) === 1;
};

const resolveBook = async (identifier) => {
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    const bookById = await Book.findById(identifier);
    if (bookById) return bookById;
  }

  const raw = String(identifier || "").toLowerCase().trim();
  const aliases = {
    "abandoned-v1": [
      "abandoned-villainess-zombie-v1",
      "the-abandoned-villainess-became-a-zombie-vol-1",
    ],
    "zombie-v1": [
      "abandoned-villainess-zombie-v1",
      "the-abandoned-villainess-became-a-zombie-vol-1",
    ],
    "abandoned-v2": ["the-abandoned-villainess-became-a-zombie-vol-2"],
    "zombie-v2": ["the-abandoned-villainess-became-a-zombie-vol-2"],
    "matchmaker-v1": ["the-matchmaker-s-fiance-vol-1"],
    "chigaya-v1": [
      "you-re-way-too-cheeky-chigaya-kun-vol-1",
      "youre-way-too-cheeky-chigaya-kun-vol-1",
    ],
    "chigaya-v2": [
      "you-re-way-too-cheeky-chigaya-kun-vol-2",
      "youre-way-too-cheeky-chigaya-kun-vol-2",
    ],
    "grenimal-v1": ["the-executioner-of-grenimal-vol-1"],
    "grenimal-v2": ["the-executioner-of-grenimal-vol-2"],
    "connie-v1": ["all-rounder-maid-connie-ville-vol-1"],
    "connie-v2": ["all-rounder-maid-connie-ville-vol-2"],
    "raeliana-v1": ["why-raeliana-ended-up-at-the-duke-s-mansion-vol-1"],
    "raeliana-v2": ["why-raeliana-ended-up-at-the-duke-s-mansion-vol-2"],
  };

  return Book.findOne({ slug: { $in: [raw, ...(aliases[raw] || [])] } });
};

const resolveChapter = (book, chapterIdentifier) => {
  if (!chapterIdentifier) return null;

  const raw = String(chapterIdentifier).trim();
  if (mongoose.Types.ObjectId.isValid(raw)) {
    const chapterById = book.chapters.id(raw);
    if (chapterById) return chapterById;
  }

  const orderMatch = raw.match(/^(?:ch|chapter|ep|episode)-?(\d+)$/i);
  if (orderMatch) {
    const chapterNumber = Number(orderMatch[1]);
    return book.chapters.find(
      (chapter) =>
        Number(chapter.chapterNumber || chapter.order) === chapterNumber,
    );
  }

  return book.chapters.find(
    (chapter) =>
      String(chapter.title || "").toLowerCase() === raw.toLowerCase() ||
      String(chapter.chapterTitle || "").toLowerCase() === raw.toLowerCase()
  );
};

const userOwnsResolvedChapter = (user, book, chapter) =>
  user.ownsChapter(book._id, chapter._id);

const logUnauthorizedChapterAccess = async ({ req, book, chapter, reason }) => {
  await logActivity({
    userId: req.user?._id,
    type: "suspicious_activity",
    email: req.user?.email,
    req,
    metadata: {
      reason,
      bookId: book?._id,
      bookSlug: book?.slug,
      chapterId: chapter?._id,
      chapterNumber: chapter?.chapterNumber || chapter?.order,
      r2KeyPresent: Boolean(chapter?.r2Key),
      path: req.originalUrl,
    },
  });
};

const verifyRequiredReadToken = (req, bookId, chapterId) => {
  const token = req.query.readToken || req.query.token;
  const tokenRequired = process.env.REQUIRE_READ_TOKEN === "true";

  if (!token && !tokenRequired) return null;
  if (!token) return "Read token is required.";

  try {
    const decoded = verifyReadToken(token);
    if (
      decoded.purpose !== "read_chapter" ||
      decoded.userId !== req.user._id.toString() ||
      decoded.bookId !== bookId.toString() ||
      decoded.chapterId !== chapterId.toString()
    ) {
      return "Read token is invalid for this chapter.";
    }
    return null;
  } catch (err) {
    return "Read token is invalid or expired.";
  }
};

// GET /api/library  — list all purchased books for logged-in user
const getMyLibrary = catchAsync(async (req, res) => {
  const purchases = await Purchase.find({ userId: req.user._id })
    .populate("bookId", "title slug author coverImageUrl chapters")
    .sort({ paidAt: -1, createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: purchases.length,
    data: { purchases },
  });
});

const purchaseBook = catchAsync(async (req, res, next) => {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_MANUAL_PURCHASE !== "true"
  ) {
    return next(
      createError(
        "Manual purchases are disabled in production. Use the payment webhook flow.",
        403
      )
    );
  }

  const { bookId } = req.params;
  const { chapterId, amount, currency = "USD", stripePaymentIntentId } = req.body;
  const book = await resolveBook(bookId);

  if (!book || !book.isPublished) {
    return next(createError("Book not found.", 404));
  }

  let purchasedChapter;
  let purchaseType = "book";
  let chapterTitles = [];
  let chapterIds = [];

  if (chapterId) {
    const chapter = resolveChapter(book, chapterId);
    if (!chapter) {
      return next(createError("Chapter not found.", 404));
    }
    if (isFreeChapter(book, chapter)) {
      return next(createError("This chapter is already free to read.", 400));
    }
    if (req.user.ownsChapter(book._id, chapter._id)) {
      return next(createError("You already own this chapter.", 400));
    }

    purchasedChapter = chapter;
    purchaseType = "chapter";
    chapterIds = [chapter._id];
    chapterTitles = [chapter.title];
  } else if (req.user.ownsBook(book._id)) {
    return next(createError("You already own this book.", 400));
  } else {
    chapterTitles = book.chapters
      .filter((chapter) => !isFreeChapter(book, chapter))
      .map((chapter) => chapter.title);
  }

  const totalAmount =
    typeof amount === "number"
      ? amount
      : purchasedChapter?.price || book.price;
  const invoiceNumber = makeInvoiceNumber();
  const purchasedAt = new Date();
  const paidChapterIds =
    purchaseType === "chapter"
      ? chapterIds
      : book.chapters
          .filter((chapter) => !isFreeChapter(book, chapter))
          .map((chapter) => chapter._id);

  const purchaseRecord = await Purchase.create({
    userId: req.user._id,
    bookId: book._id,
    chapterIds: paidChapterIds,
    purchaseType,
    amount: totalAmount,
    currency,
    invoiceNumber,
    bookTitle: book.title,
    chapterTitles,
    stripePaymentIntentId,
    paidAt: purchasedAt,
  });

  req.user.purchases.push({
    bookId: book._id,
    chapterIds,
    purchaseType,
    amount: totalAmount,
    currency,
    invoiceNumber,
    bookTitle: book.title,
    chapterTitles,
    purchasedAt,
    stripePaymentIntentId,
  });
  await req.user.save();

  await Promise.all(
    paidChapterIds.map((paidChapterId) =>
      BookAccess.updateOne(
        {
          userId: req.user._id,
          bookId: book._id,
          chapterId: paidChapterId,
          accessType:
            purchaseType === "chapter" ? "chapter_purchase" : "full_book_purchase",
        },
        {
          $setOnInsert: {
            purchaseId: purchaseRecord._id,
            grantedAt: purchasedAt,
          },
        },
        { upsert: true }
      )
    )
  );

  book.analytics = book.analytics || { purchases: 0 };
  book.analytics.purchases = (book.analytics.purchases || 0) + 1;
  await book.save({ validateBeforeSave: false });

  try {
    await sendEmail({
      to: req.user.email,
      type: "purchase_invoice",
      userId: req.user._id,
      metadata: { purchaseId: purchaseRecord._id, invoiceNumber },
      ...emailTemplates.purchaseConfirmation({
        name: req.user.name,
        bookTitle: book.title,
        chapterTitles: purchaseType === "chapter" ? chapterTitles : [],
        amount: totalAmount,
        currency,
        invoiceNumber,
        purchasedAt,
      }),
    });
  } catch (emailErr) {
    console.error("Purchase invoice email failed:", emailErr.message);
  }

  await logActivity({
    userId: req.user._id,
    type: "purchase_completed",
    email: req.user.email,
    req,
    metadata: {
      purchaseId: purchaseRecord._id,
      bookId: book._id,
      chapterIds: paidChapterIds,
      purchaseType,
      invoiceNumber,
      amount: totalAmount,
      currency,
    },
  });

  res.status(201).json({
    status: "success",
    message:
      purchaseType === "chapter"
        ? "Purchase complete. The chapter has been added to your library."
        : "Purchase complete. The book has been added to your library.",
    data: {
      bookId: book._id,
      chapterId: purchasedChapter?._id,
      purchaseType,
      amount: totalAmount,
      currency,
      invoiceNumber,
      purchaseId: purchaseRecord._id,
    },
  });
});

const getPaymentConfig = catchAsync(async (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
      stripe: {
        enabled: Boolean(process.env.STRIPE_PUBLISHABLE_KEY),
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
      },
      razorpay: {
        enabled: isRazorpayConfigured() && Boolean(getRazorpayUsdToInrRate()),
        keyId: getRazorpayKeyId(),
        currency: "INR",
        exchangeRate: getRazorpayUsdToInrRate(),
        exchangeRateConfigured: Boolean(getRazorpayUsdToInrRate()),
      },
    },
  });
});

const createPaymentIntent = catchAsync(async (req, res, next) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return next(createError("Stripe is not configured yet.", 503));
  }
  if (!process.env.STRIPE_PUBLISHABLE_KEY) {
    return next(createError("Stripe publishable key is not configured yet.", 503));
  }

  const { bookId } = req.params;
  const { chapterId, currency = "usd" } = req.body;
  const normalizedCurrency = String(currency || "usd").toLowerCase();
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
      },
    });
    return next(createError("Unsupported payment currency.", 400));
  }

  const book = await resolveBook(bookId);

  if (!book || !book.isPublished) {
    return next(createError("Book not found.", 404));
  }

  const details = buildDigitalPurchaseDetails({ book, user: req.user, chapterId });
  if (details.error) return next(details.error);
  const { amount, metadata } = details;

  const amountInSmallestUnit = Math.round(Number(amount) * 100);
  if (!Number.isFinite(amountInSmallestUnit) || amountInSmallestUnit < 50) {
    return next(createError("Invalid payment amount.", 400));
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInSmallestUnit,
    currency: normalizedCurrency,
    automatic_payment_methods: { enabled: true },
    metadata: {
      ...metadata,
      expectedAmount: String(amountInSmallestUnit),
      expectedCurrency: normalizedCurrency,
      pricingSource: "server",
    },
  });

  await logActivity({
    userId: req.user._id,
    type: "payment_intent_created",
    email: req.user.email,
    req,
    metadata: {
      bookId: book._id,
      chapterId: metadata.chapterId,
      purchaseType: metadata.purchaseType,
      amountInSmallestUnit,
      currency: normalizedCurrency,
      stripePaymentIntentId: paymentIntent.id,
    },
  });

  res.status(201).json({
    status: "success",
    data: {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount,
      currency: normalizedCurrency,
    },
  });
});

const confirmDigitalPayment = catchAsync(async (req, res, next) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return next(createError("Stripe is not configured yet.", 503));
  }

  const { bookId } = req.params;
  const { paymentIntentId } = req.body;
  if (!paymentIntentId) return next(createError("Payment intent is required.", 400));

  const book = await resolveBook(bookId);
  if (!book || !book.isPublished) return next(createError("Book not found.", 404));

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  const metadata = paymentIntent.metadata || {};

  if (paymentIntent.status !== "succeeded") {
    return next(createError("Payment is not complete yet.", 402));
  }
  if (metadata.userId !== req.user._id.toString()) {
    await logActivity({
      userId: req.user._id,
      type: "payment_security_blocked",
      email: req.user.email,
      req,
      metadata: {
        reason: "digital_payment_user_mismatch",
        stripePaymentIntentId: paymentIntent.id,
        metadataUserId: metadata.userId,
      },
    });
    return next(createError("Payment does not belong to this account.", 403));
  }
  if (metadata.bookId !== book._id.toString()) {
    return next(createError("Payment does not match this book.", 400));
  }
  if (!["book", "chapter"].includes(metadata.purchaseType)) {
    return next(createError("Payment metadata is incomplete.", 400));
  }
  if (metadata.purchaseType === "chapter" && !resolveChapter(book, metadata.chapterId)) {
    return next(createError("Payment does not match a valid chapter.", 400));
  }

  const { purchase, alreadyFulfilled } = await fulfillPurchase({
    userId: req.user._id,
    bookId: metadata.bookId,
    chapterId: metadata.chapterId,
    amount: Number(paymentIntent.amount_received || paymentIntent.amount) / 100,
    currency: String(paymentIntent.currency || "usd").toUpperCase(),
    stripePaymentIntentId: paymentIntent.id,
    paymentProvider: "stripe",
    paymentReference: paymentIntent.id,
    req,
  });

  res.status(200).json({
    status: "success",
    message: alreadyFulfilled
      ? "Digital purchase was already confirmed."
      : "Digital purchase confirmed.",
    data: { purchase },
  });
});

const createRazorpayOrder = catchAsync(async (req, res, next) => {
  if (!isRazorpayConfigured()) {
    return next(createError("Razorpay is not configured yet.", 503));
  }

  const exchangeRate = getRazorpayUsdToInrRate();
  if (!exchangeRate) {
    return next(createError("Razorpay INR conversion rate is not configured yet.", 503));
  }

  const { bookId } = req.params;
  const { chapterId } = req.body;
  const book = await resolveBook(bookId);

  if (!book || !book.isPublished) {
    return next(createError("Book not found.", 404));
  }

  const details = buildDigitalPurchaseDetails({ book, user: req.user, chapterId });
  if (details.error) return next(details.error);
  const { amount, metadata } = details;
  const amountInPaise = Math.round(Number(amount) * exchangeRate * 100);

  if (!Number.isFinite(amountInPaise) || amountInPaise < 100) {
    return next(createError("Invalid Razorpay payment amount.", 400));
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("Creating Razorpay digital order:", {
      keyMode: razorpayKeyDiagnostics().keyMode,
      bookId: book._id.toString(),
      purchaseType: metadata.purchaseType,
      amountInPaise,
      currency: "INR",
    });
  }

  const order = await razorpayRequest("/orders", {
    method: "POST",
    body: {
      amount: amountInPaise,
      currency: "INR",
      receipt: `ch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`.slice(0, 40),
      notes: {
        ...metadata,
        canonicalAmount: String(amount),
        canonicalCurrency: "USD",
        expectedAmount: String(amountInPaise),
        expectedCurrency: "INR",
        exchangeRate: String(exchangeRate),
        pricingSource: "server",
      },
    },
  });

  if (process.env.NODE_ENV !== "production") {
    console.log("Razorpay digital order created:", {
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
    });
  }

  await logActivity({
    userId: req.user._id,
    type: "payment_intent_created",
    email: req.user.email,
    req,
    metadata: {
      provider: "razorpay",
      bookId: book._id,
      chapterId: metadata.chapterId,
      purchaseType: metadata.purchaseType,
      amountInSmallestUnit: amountInPaise,
      currency: "INR",
      razorpayOrderId: order.id,
    },
  });

  res.status(201).json({
    status: "success",
    data: {
      provider: "razorpay",
      keyId: getRazorpayKeyId(),
      razorpayOrderId: order.id,
      amount: amountInPaise,
      currency: "INR",
      displayAmount: amountInPaise / 100,
      canonicalAmount: amount,
      canonicalCurrency: "USD",
    },
  });
});

const confirmRazorpayPayment = catchAsync(async (req, res, next) => {
  if (!isRazorpayConfigured()) {
    return next(createError("Razorpay is not configured yet.", 503));
  }

  const { bookId } = req.params;
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
    await logActivity({
      userId: req.user._id,
      type: "payment_security_blocked",
      email: req.user.email,
      req,
      metadata: {
        provider: "razorpay",
        reason: "razorpay_signature_mismatch",
        razorpayOrderId,
        razorpayPaymentId,
      },
    });
    return next(createError("Payment verification failed.", 400));
  }

  const [book, order] = await Promise.all([
    resolveBook(bookId),
    razorpayRequest(`/orders/${encodeURIComponent(razorpayOrderId)}`),
  ]);
  if (!book || !book.isPublished) return next(createError("Book not found.", 404));

  let payment = await razorpayRequest(`/payments/${encodeURIComponent(razorpayPaymentId)}`);
  const notes = order.notes || {};
  const expectedAmount = Number(notes.expectedAmount);

  try {
    assertRazorpayOrderIntegrity(order, {
      orderId: razorpayOrderId,
      expectedAmount,
    });
    assertRazorpayPaymentIntegrity(payment, {
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      expectedAmount,
    });
  } catch (err) {
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
    return next(createError(err.message || "Payment verification failed.", err.statusCode || 400));
  }

  if (payment.order_id !== razorpayOrderId) {
    return next(createError("Payment does not match this order.", 400));
  }
  if (notes.userId !== req.user._id.toString()) {
    await logActivity({
      userId: req.user._id,
      type: "payment_security_blocked",
      email: req.user.email,
      req,
      metadata: {
        provider: "razorpay",
        reason: "razorpay_user_mismatch",
        razorpayOrderId,
        razorpayPaymentId,
        metadataUserId: notes.userId,
      },
    });
    return next(createError("Payment does not belong to this account.", 403));
  }
  if (notes.bookId !== book._id.toString()) {
    return next(createError("Payment does not match this book.", 400));
  }
  if (!["book", "chapter"].includes(notes.purchaseType)) {
    return next(createError("Payment metadata is incomplete.", 400));
  }
  if (notes.purchaseType === "chapter" && !resolveChapter(book, notes.chapterId)) {
    return next(createError("Payment does not match a valid chapter.", 400));
  }
  if (Number(payment.amount) !== expectedAmount || payment.currency !== "INR") {
    return next(createError("Payment amount does not match server price.", 400));
  }

  if (payment.status === "authorized") {
    payment = await razorpayRequest(
      `/payments/${encodeURIComponent(razorpayPaymentId)}/capture`,
      {
        method: "POST",
        body: { amount: expectedAmount, currency: "INR" },
      }
    );
    try {
      assertRazorpayPaymentIntegrity(payment, {
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        expectedAmount,
      });
    } catch (err) {
      await logActivity({
        userId: req.user._id,
        type: "payment_security_blocked",
        email: req.user.email,
        req,
        metadata: {
          provider: "razorpay",
          reason: err.securityReason || "razorpay_capture_integrity_check_failed",
          razorpayOrderId,
          razorpayPaymentId,
        },
      });
      return next(createError(err.message || "Payment verification failed.", err.statusCode || 400));
    }
  }

  if (payment.status !== "captured" && payment.captured !== true) {
    return next(createError("Payment is not complete yet.", 402));
  }

  const { purchase, alreadyFulfilled } = await fulfillPurchase({
    userId: req.user._id,
    bookId: notes.bookId,
    chapterId: notes.chapterId,
    amount: Number(notes.canonicalAmount),
    currency: notes.canonicalCurrency || "USD",
    paymentProvider: "razorpay",
    paymentReference: razorpayPaymentId,
    razorpayOrderId,
    razorpayPaymentId,
    gatewayAmount: Number(payment.amount) / 100,
    gatewayCurrency: payment.currency,
    req,
  });

  res.status(200).json({
    status: "success",
    message: alreadyFulfilled
      ? "Digital purchase was already confirmed."
      : "Digital purchase confirmed.",
    data: { purchase },
  });
});

const requestRefund = catchAsync(async (req, res, next) => {
  const { purchaseId } = req.params;
  const { issueType = "payment_gateway_issue", reason } = req.body;

  if (!reason || String(reason).trim().length < 10) {
    return next(createError("Payment issue details must be at least 10 characters.", 400));
  }

  const refund = await createRefundRequest({
    user: req.user,
    purchaseId,
    issueType: String(issueType).trim(),
    reason: String(reason).trim(),
    req,
  });

  res.status(201).json({
    status: "success",
    message: "Payment issue refund request submitted for admin review.",
    data: { refund },
  });
});

const getMyRefunds = catchAsync(async (req, res) => {
  const refunds = await RefundRequest.find({ userId: req.user._id })
    .populate("purchaseId", "bookTitle chapterTitles invoiceNumber amount currency status")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: refunds.length,
    data: { refunds },
  });
});

const downloadMyInvoice = catchAsync(async (req, res, next) => {
  const purchase = await Purchase.findOne({
    _id: req.params.purchaseId,
    userId: req.user._id,
  }).populate("userId", "name email");

  if (!purchase) {
    return next(createError("Invoice not found.", 404));
  }

  const pdf = await buildInvoicePdf({
    purchase,
    user: purchase.userId || req.user,
  });

  const filename = `invoice_${purchase.invoiceNumber || purchase._id}.pdf`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.status(200).send(pdf);
});

const getWishlist = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    "wishlist",
    "title slug author coverImageUrl price genres ratingAverage ratingCount"
  );

  res.status(200).json({
    status: "success",
    results: user.wishlist.length,
    data: { wishlist: user.wishlist },
  });
});

const addToWishlist = catchAsync(async (req, res, next) => {
  const book = await Book.findOne({ _id: req.params.bookId, isPublished: true });
  if (!book) return next(createError("Book not found.", 404));

  await User.updateOne(
    { _id: req.user._id },
    { $addToSet: { wishlist: book._id } }
  );

  res.status(200).json({
    status: "success",
    message: "Book added to wishlist.",
  });
});

const removeFromWishlist = catchAsync(async (req, res) => {
  await User.updateOne(
    { _id: req.user._id },
    { $pull: { wishlist: req.params.bookId } }
  );

  res.status(200).json({
    status: "success",
    message: "Book removed from wishlist.",
  });
});

const getReadingProgress = catchAsync(async (req, res) => {
  const progress = await ReadingProgress.find({ userId: req.user._id })
    .populate("bookId", "title slug author coverImageUrl")
    .sort({ lastReadAt: -1 });

  res.status(200).json({
    status: "success",
    results: progress.length,
    data: { progress },
  });
});

const saveReadingProgress = catchAsync(async (req, res, next) => {
  const { bookId, chapterId } = req.params;
  const { page = 1, percentage = 0 } = req.body;

  const book = await resolveBook(bookId);
  if (!book) return next(createError("Book not found.", 404));

  const chapter = resolveChapter(book, chapterId);
  if (!chapter) return next(createError("Chapter not found.", 404));

  const isAdminPreview = req.user?.role === "admin";

  if (
    !isAdminPreview &&
    !isFreeChapter(book, chapter) &&
    !userOwnsResolvedChapter(req.user, book, chapter)
  ) {
    await logUnauthorizedChapterAccess({
      req,
      book,
      chapter,
      reason: "progress_update_without_purchase",
    });
    return next(createError("You do not own this chapter.", 403));
  }

  const progress = await ReadingProgress.findOneAndUpdate(
    { userId: req.user._id, bookId: book._id },
    {
      chapterId: chapter._id,
      page: Math.max(Number(page) || 1, 1),
      percentage: Math.min(Math.max(Number(percentage) || 0, 0), 100),
      lastReadAt: new Date(),
    },
    { new: true, upsert: true, runValidators: true }
  );

  res.status(200).json({
    status: "success",
    message: "Reading progress saved.",
    data: { progress },
  });
});

const issueReadToken = catchAsync(async (req, res, next) => {
  const { bookId, chapterId } = req.params;

  const book = await resolveBook(bookId);
  if (!book) return next(createError("Book not found.", 404));

  const chapter = resolveChapter(book, chapterId);
  if (!chapter) return next(createError("Chapter not found.", 404));

  const isAdminPreview = req.user?.role === "admin";

  if (
    !isAdminPreview &&
    !isFreeChapter(book, chapter) &&
    !userOwnsResolvedChapter(req.user, book, chapter)
  ) {
    await logUnauthorizedChapterAccess({
      req,
      book,
      chapter,
      reason: "read_token_without_purchase",
    });
    return next(createError("You do not own this chapter.", 403));
  }

  const readToken = signReadToken({
    userId: req.user._id,
    bookId,
    chapterId,
  });

  await logActivity({
    userId: req.user._id,
    type: "read_token_issued",
    email: req.user.email,
    req,
    metadata: { bookId, chapterId },
  });

  res.status(200).json({
    status: "success",
    expiresIn: process.env.READ_TOKEN_EXPIRES_IN || "2m",
    data: { readToken },
  });
});

// GET /api/library/:bookId/read/:chapterId
// Streams the watermarked PDF for a chapter the user owns
const readChapter = catchAsync(async (req, res, next) => {
  const { bookId, chapterId } = req.params;

  const book = await resolveBook(bookId);
  if (!book) return next(createError("Book not found.", 404));

  const chapter = resolveChapter(book, chapterId);
  if (!chapter) return next(createError("Chapter not found.", 404));

  if (!isFreeChapter(book, chapter) && !userOwnsResolvedChapter(req.user, book, chapter)) {
    await logUnauthorizedChapterAccess({
      req,
      book,
      chapter,
      reason: "paid_chapter_without_purchase",
    });
    return next(createError("You do not own this chapter.", 403));
  }

  const tokenError = verifyRequiredReadToken(req, bookId, chapterId);
  if (tokenError) return next(createError(tokenError, 403));

  await withChapterPdfPath(chapter, async (masterPath) => {
    const isAdminPreview = req.user?.role === "admin";
    if (isFreeChapter(book, chapter) || isAdminPreview) {
      await BookAccess.updateOne(
        {
          userId: req.user._id,
          bookId: book._id,
          chapterId: chapter._id,
          accessType: isAdminPreview ? "admin_grant" : "free",
        },
        {
          $setOnInsert: {
            grantedAt: new Date(),
          },
        },
        { upsert: true }
      );
      await logActivity({
        userId: req.user._id,
        type: "chapter_opened",
        email: req.user.email,
        req,
        metadata: {
          bookId: book._id,
          chapterId: chapter._id,
          accessType: isAdminPreview ? "admin_grant" : "free",
        },
      });
      setSecurePdfHeaders(res, `${isAdminPreview ? "admin_preview" : "preview"}_${chapter.title}.pdf`);
      const previewPdf = await buildPreviewWatermarkedPdf(masterPath, {
        bookTitle: book.title,
      });
      return res.status(200).send(Buffer.from(previewPdf));
    }

    const purchase = req.user.purchases.find(
      (p) =>
        p.bookId.toString() === book._id.toString() &&
        ((p.purchaseType || "book") === "book" ||
          (p.chapterIds || []).some((id) => id.toString() === chapter._id.toString()))
    );

    setSecurePdfHeaders(res, `${chapter.title}.pdf`);
    await logActivity({
      userId: req.user._id,
      type: "chapter_opened",
      email: req.user.email,
      req,
      metadata: {
        bookId: book._id,
        chapterId: chapter._id,
        accessType: (purchase?.purchaseType || "book") === "chapter"
          ? "chapter_purchase"
          : "full_book_purchase",
      },
    });

    if (isR2StorageEnabled()) {
      const watermarkedPdf = await buildReaderWatermarkedPdf(
        masterPath,
        req.user._id.toString(),
        req.user.name,
        req.user.email,
        {
          bookTitle: book.title,
          invoiceNumber: purchase?.invoiceNumber,
        }
      );
      return res.status(200).send(Buffer.from(watermarkedPdf));
    }

    let watermarkedKey = purchase?.watermarkedPdfKey;
    if (!watermarkedKey || !watermarkedKey.includes("_v3_")) {
      watermarkedKey = await generateWatermarkedPdf(
        masterPath,
        req.user._id.toString(),
        req.user.name,
        req.user.email,
        {
          bookTitle: book.title,
          invoiceNumber: purchase?.invoiceNumber,
        }
      );

      await User.updateOne(
        { _id: req.user._id, "purchases.bookId": bookId },
        { $set: { "purchases.$.watermarkedPdfKey": watermarkedKey } }
      );
    }

    const pdfPath = path.resolve(
      process.env.PDF_STORAGE_PATH || "./uploads/pdfs",
      watermarkedKey
    );
    return fs.createReadStream(pdfPath).pipe(res);
  });
});

// GET /api/library/:bookId/read/:chapterId/preview
// Streams preview chapters with Crossed Hearts preview watermark
const readPreviewChapter = catchAsync(async (req, res, next) => {
  const { bookId, chapterId } = req.params;

  const book = await resolveBook(bookId);
  if (!book) return next(createError("Book not found.", 404));

  const chapter = resolveChapter(book, chapterId);
  if (!chapter) return next(createError("Chapter not found.", 404));

  if (!isFreeChapter(book, chapter)) {
    await logActivity({
      userId: req.user?._id,
      type: "suspicious_activity",
      email: req.user?.email,
      req,
      metadata: {
        reason: "paid_chapter_preview_attempt",
        bookId: book._id,
        bookSlug: book.slug,
        chapterId: chapter._id,
        chapterNumber: chapter.chapterNumber || chapter.order,
        path: req.originalUrl,
      },
    });
    return next(createError("This chapter is not available for preview.", 403));
  }

  await withChapterPdfPath(chapter, async (masterPath) => {
    setSecurePdfHeaders(res, `preview_${chapter.title}.pdf`);
    const previewPdf = await buildPreviewWatermarkedPdf(masterPath, {
      bookTitle: book.title,
    });
    return res.status(200).send(Buffer.from(previewPdf));
  });
});

module.exports = {
  getMyLibrary,
  purchaseBook,
  getPaymentConfig,
  createPaymentIntent,
  confirmDigitalPayment,
  createRazorpayOrder,
  confirmRazorpayPayment,
  requestRefund,
  getMyRefunds,
  downloadMyInvoice,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getReadingProgress,
  saveReadingProgress,
  issueReadToken,
  readChapter,
  readPreviewChapter,
};

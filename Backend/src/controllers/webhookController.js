const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || "sk_test_missing");
const crypto = require("crypto");
const { fulfillPurchase } = require("../services/purchaseFulfillmentService");
const CampaignPledge = require("../models/CampaignPledge");
const CampaignBacker = require("../models/CampaignBacker");
const { sendEmail, emailTemplates } = require("../services/emailService");
const { logActivity } = require("../utils/activityLogger");
const {
  markPhysicalOrderPaidFromStripe,
  markPhysicalOrderPaidFromRazorpay,
} = require("./physicalOrderController");
const PhysicalOrder = require("../models/PhysicalOrder");
const Subscription = require("../models/Subscription");
const PaymentTransaction = require("../models/PaymentTransaction");
const {
  activateSubscription,
  grantCredits,
  syncSubscriptionMember,
} = require("../services/subscriptionService");
const SubscriptionPlan = require("../models/SubscriptionPlan");

const handlePhysicalOrderPayment = async ({ paymentIntent, metadata, req }) => {
  return markPhysicalOrderPaidFromStripe({ paymentIntent, metadata, req });
};

const getRazorpayKeyId = () => String(process.env.RAZORPAY_KEY_ID || "").trim();
const getRazorpayKeySecret = () =>
  String(process.env.RAZORPAY_KEY_SECRET || "").trim();
const getRazorpayWebhookSecret = () =>
  String(process.env.RAZORPAY_WEBHOOK_SECRET || "").trim();

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
      payload?.error?.description || payload?.error?.reason || "Razorpay request failed.";
    throw Object.assign(new Error(message), { statusCode: response.status, payload });
  }
  return payload;
};

const verifyRazorpayWebhookSignature = (rawBody, signature) => {
  const secret = getRazorpayWebhookSecret();
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch (err) {
    return false;
  }
};

const getRazorpayWebhookEventId = (req, event) => {
  const headerEventId = String(req.headers["x-razorpay-event-id"] || "").trim();
  if (headerEventId) return headerEventId;

  const entity =
    event?.payload?.payment?.entity ||
    event?.payload?.refund?.entity ||
    event?.payload?.order?.entity;
  if (entity?.id) return `${event.event}:${entity.id}`;

  return `${event.event || "unknown"}:${crypto
    .createHash("sha256")
    .update(req.body)
    .digest("hex")}`;
};

const getRazorpayWebhookTransactionMeta = (event) => {
  const payment = event?.payload?.payment?.entity;
  const refund = event?.payload?.refund?.entity;

  if (event.event === "payment.captured" && payment) {
    return { entity: payment, type: "payment_success", status: "succeeded" };
  }

  if (event.event === "payment.failed" && payment) {
    return { entity: payment, type: "payment_failed", status: "failed" };
  }

  if (event.event && event.event.startsWith("refund.") && refund) {
    return { entity: refund, type: "refund", status: "refunded" };
  }

  return null;
};

const logRazorpayWebhookTransaction = async ({ event, eventId }) => {
  const meta = getRazorpayWebhookTransactionMeta(event);
  if (!meta) return;

  const { entity, type, status } = meta;
  try {
    await PaymentTransaction.findOneAndUpdate(
      { provider: "razorpay", providerEventId: eventId },
      {
        $setOnInsert: {
          provider: "razorpay",
          providerEventId: eventId,
          providerPaymentId: entity.payment_id || entity.id,
          type,
          status,
          amount: Number(entity.amount || 0) / 100,
          currency: String(entity.currency || "INR").toUpperCase(),
          raw: entity,
          metadata: {
            razorpayEvent: event.event,
            razorpayOrderId: entity.order_id,
            razorpayRefundId: entity.id && entity.id.startsWith("rfnd_") ? entity.id : undefined,
          },
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  } catch (err) {
    if (err.code !== 11000) {
      console.error("Razorpay webhook transaction log failed:", err.message);
    }
  }
};

const handleCampaignPledgePayment = async ({ paymentIntent, metadata, req }) => {
  if (!metadata.userId || !metadata.pledgeId) {
    await logActivity({
      type: "payment_security_blocked",
      req,
      metadata: {
        reason: "missing_campaign_pledge_metadata",
        stripePaymentIntentId: paymentIntent.id,
      },
    });
    const err = new Error("Campaign pledge payment metadata is incomplete.");
    err.statusCode = 400;
    throw err;
  }

  const pledge = await CampaignPledge.findOne({
    _id: metadata.pledgeId,
    userId: metadata.userId,
  });

  if (!pledge) {
    const err = new Error("Campaign pledge not found for payment.");
    err.statusCode = 404;
    throw err;
  }

  const expectedAmount = Math.round(Number(pledge.amount || 0) * 100);
  const paidAmount = Number(paymentIntent.amount_received || paymentIntent.amount || 0);
  const expectedCurrency = String(pledge.currency || "USD").toLowerCase();
  const paidCurrency = String(paymentIntent.currency || "usd").toLowerCase();

  if (expectedAmount !== paidAmount || expectedCurrency !== paidCurrency) {
    await logActivity({
      userId: pledge.userId,
      type: "payment_security_blocked",
      req,
      metadata: {
        reason: "campaign_pledge_amount_or_currency_mismatch",
        pledgeId: pledge._id,
        expectedAmount,
        paidAmount,
        expectedCurrency,
        paidCurrency,
        stripePaymentIntentId: paymentIntent.id,
      },
    });
    const err = new Error("Campaign pledge payment does not match server price.");
    err.statusCode = 400;
    throw err;
  }

  if (pledge.paymentStatus === "paid") return pledge;

  pledge.paymentStatus = "paid";
  pledge.paymentProvider = "stripe";
  pledge.paymentReference = paymentIntent.id;
  pledge.paidAt = new Date();
  await pledge.save({ validateBeforeSave: false });

  await CampaignBacker.updateOne(
    { campaignSlug: pledge.campaignSlug, userId: pledge.userId },
    {
      $setOnInsert: {
        campaignSlug: pledge.campaignSlug,
        campaignTitle: pledge.campaignTitle,
        userId: pledge.userId,
        name: pledge.backerName,
        email: pledge.backerEmail,
        firstPledgedAt: pledge.createdAt || new Date(),
      },
      $set: {
        campaignTitle: pledge.campaignTitle,
        name: pledge.backerName,
        email: pledge.backerEmail,
        latestTier: pledge.tier,
        latestTierName: pledge.tierName,
        currency: pledge.currency,
        status: "paid",
        lastPledgedAt: pledge.createdAt || new Date(),
        lastPaidAt: pledge.paidAt,
      },
      $inc: {
        paidPledgeCount: 1,
        totalPaidAmount: pledge.amount,
      },
    },
    { upsert: true },
  );

  try {
    await sendEmail({
      to: pledge.backerEmail,
      type: "campaign_pledge",
      userId: pledge.userId,
      metadata: { pledgeId: pledge._id, pledgeNumber: pledge.pledgeNumber },
      ...emailTemplates.campaignPledgeConfirmation({
        name: pledge.backerName,
        pledgeNumber: pledge.pledgeNumber,
        campaignTitle: pledge.campaignTitle,
        tierName: pledge.tierName,
        amount: pledge.amount,
        currency: pledge.currency,
        shippingAddress: pledge.shippingAddress,
      }),
    });
  } catch (err) {
    console.error("Campaign pledge paid email failed:", err.message);
  }

  await logActivity({
    userId: pledge.userId,
    type: "purchase_completed",
    req,
    metadata: {
      source: "campaign_pledge_webhook",
      pledgeId: pledge._id,
      pledgeNumber: pledge.pledgeNumber,
      amount: pledge.amount,
      currency: pledge.currency,
      stripePaymentIntentId: paymentIntent.id,
    },
  });

  return pledge;
};

const logStripeSubscriptionTransaction = async ({ event, object, type, status, subscription }) => {
  try {
    await PaymentTransaction.findOneAndUpdate(
      { providerEventId: event.id },
      {
        $setOnInsert: {
          userId: subscription?.userId,
          subscriptionId: subscription?._id,
          provider: "stripe",
          providerEventId: event.id,
          providerPaymentId: object.id,
          providerSubscriptionId: object.subscription || object.id,
          type,
          status,
          amount: Number(object.amount_paid || object.amount_due || object.amount || 0) / 100,
          currency: String(object.currency || "usd").toUpperCase(),
          raw: object,
        },
      },
      { upsert: true, new: true },
    );
  } catch (err) {
    if (err.code !== 11000) console.error("Subscription payment log failed:", err.message);
  }
};

const handleSubscriptionPaymentIntent = async ({ paymentIntent, metadata, event, req }) => {
  const subscription = await Subscription.findOne({
    _id: metadata.subscriptionId,
    userId: metadata.userId,
  });
  if (!subscription) {
    const err = new Error("Subscription payment metadata did not match a subscription.");
    err.statusCode = 404;
    throw err;
  }

  const expectedAmount = Number(metadata.expectedAmount || 0);
  const expectedCurrency = String(metadata.expectedCurrency || "").toLowerCase();
  if (
    expectedAmount &&
    (Number(paymentIntent.amount_received || paymentIntent.amount || 0) !== expectedAmount ||
      String(paymentIntent.currency || "").toLowerCase() !== expectedCurrency)
  ) {
    const err = new Error("Subscription payment amount or currency mismatch.");
    err.statusCode = 400;
    err.securityReason = "subscription_amount_or_currency_mismatch";
    throw err;
  }

  await logStripeSubscriptionTransaction({
    event,
    object: paymentIntent,
    type: "payment_success",
    status: "succeeded",
    subscription,
  });
  await activateSubscription({ subscription, referenceId: paymentIntent.id, req });
};

const handleInvoicePaid = async ({ invoice, event, req }) => {
  const stripeSubscriptionId = invoice.subscription;
  if (!stripeSubscriptionId) return;
  const subscription = await Subscription.findOne({ stripeSubscriptionId });
  if (!subscription) return;

  const plan = await SubscriptionPlan.findOne({ planId: subscription.planId });
  subscription.status = "active";
  subscription.currentPeriodStart = invoice.period_start ? new Date(invoice.period_start * 1000) : subscription.currentPeriodStart;
  subscription.currentPeriodEnd = invoice.period_end ? new Date(invoice.period_end * 1000) : subscription.currentPeriodEnd;
  await subscription.save({ validateBeforeSave: false });
  await syncSubscriptionMember({ subscription });

  await logStripeSubscriptionTransaction({
    event,
    object: invoice,
    type: "invoice_paid",
    status: "succeeded",
    subscription,
  });

  if (plan) {
    await grantCredits({
      userId: subscription.userId,
      subscription,
      plan,
      source: "stripe_invoice_paid",
      referenceId: invoice.id,
      grantedAt: invoice.period_start ? new Date(invoice.period_start * 1000) : new Date(),
    });
  }
};

const handleInvoiceFailed = async ({ invoice, event, req }) => {
  const subscription = await Subscription.findOne({ stripeSubscriptionId: invoice.subscription });
  if (!subscription) return;
  subscription.status = "past_due";
  await subscription.save({ validateBeforeSave: false });
  await syncSubscriptionMember({ subscription });
  await logStripeSubscriptionTransaction({
    event,
    object: invoice,
    type: "invoice_failed",
    status: "failed",
    subscription,
  });
  await logActivity({
    userId: subscription.userId,
    type: "subscription_payment_failed",
    req,
    metadata: { subscriptionId: subscription._id, invoiceId: invoice.id },
  });
};

const handleStripeSubscriptionUpdated = async ({ stripeSubscription, event }) => {
  const subscription = await Subscription.findOne({ stripeSubscriptionId: stripeSubscription.id });
  if (!subscription) return;
  const statusMap = {
    active: "active",
    trialing: "active",
    past_due: "past_due",
    unpaid: "past_due",
    canceled: "cancelled",
    incomplete: "incomplete",
    incomplete_expired: "expired",
  };
  subscription.status = statusMap[stripeSubscription.status] || subscription.status;
  subscription.cancelAtPeriodEnd = Boolean(stripeSubscription.cancel_at_period_end);
  subscription.cancelledAt = stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000) : subscription.cancelledAt;
  subscription.currentPeriodStart = stripeSubscription.current_period_start ? new Date(stripeSubscription.current_period_start * 1000) : subscription.currentPeriodStart;
  subscription.currentPeriodEnd = stripeSubscription.current_period_end ? new Date(stripeSubscription.current_period_end * 1000) : subscription.currentPeriodEnd;
  await subscription.save({ validateBeforeSave: false });
  await syncSubscriptionMember({ subscription });
  await logStripeSubscriptionTransaction({
    event,
    object: stripeSubscription,
    type: stripeSubscription.status === "canceled" ? "payment_failed" : "card_updated",
    status: subscription.status === "cancelled" ? "cancelled" : "succeeded",
    subscription,
  });
};

const handleRazorpayCapturedPayment = async ({ payment, req }) => {
  if (!payment?.id || !payment?.order_id) {
    const err = new Error("Razorpay payment payload is incomplete.");
    err.statusCode = 400;
    throw err;
  }

  const razorpayOrder = await razorpayRequest(
    `/orders/${encodeURIComponent(payment.order_id)}`,
  );
  const notes = razorpayOrder.notes || {};

  if (Number(payment.amount) !== Number(notes.expectedAmount) || payment.currency !== "INR") {
    await logActivity({
      userId: notes.userId,
      type: "payment_security_blocked",
      req,
      metadata: {
        provider: "razorpay",
        reason: "razorpay_webhook_amount_or_currency_mismatch",
        razorpayOrderId: payment.order_id,
        razorpayPaymentId: payment.id,
        expectedAmount: notes.expectedAmount,
        paidAmount: payment.amount,
        currency: payment.currency,
      },
    });
    const err = new Error("Razorpay webhook amount does not match server price.");
    err.statusCode = 400;
    throw err;
  }

  if (notes.purchaseType === "physical_order") {
    const order = await PhysicalOrder.findOne({
      _id: notes.orderId,
      userId: notes.userId,
      paymentProvider: "razorpay",
    });
    if (!order) {
      const err = new Error("Physical order not found for Razorpay webhook.");
      err.statusCode = 404;
      throw err;
    }
    await markPhysicalOrderPaidFromRazorpay({
      order,
      razorpayOrderId: payment.order_id,
      razorpayPaymentId: payment.id,
      gatewayAmount: Number(payment.amount) / 100,
      gatewayCurrency: payment.currency,
      req,
    });
    return;
  }

  if (["book", "chapter"].includes(notes.purchaseType)) {
    await fulfillPurchase({
      userId: notes.userId,
      bookId: notes.bookId,
      chapterId: notes.chapterId,
      amount: Number(notes.canonicalAmount),
      currency: notes.canonicalCurrency || "USD",
      paymentProvider: "razorpay",
      paymentReference: payment.id,
      razorpayOrderId: payment.order_id,
      razorpayPaymentId: payment.id,
      gatewayAmount: Number(payment.amount) / 100,
      gatewayCurrency: payment.currency,
      req,
    });
    return;
  }

  await logActivity({
    userId: notes.userId,
    type: "suspicious_activity",
    req,
    metadata: {
      provider: "razorpay",
      reason: "unknown_razorpay_purchase_type",
      purchaseType: notes.purchaseType,
      razorpayOrderId: payment.order_id,
      razorpayPaymentId: payment.id,
    },
  });
};

const handleRazorpayWebhook = async (req, res) => {
  if (!getRazorpayWebhookSecret()) {
    return res.status(503).json({
      status: "error",
      message: "Razorpay webhook secret is not configured.",
    });
  }

  const signature = req.headers["x-razorpay-signature"];
  if (!verifyRazorpayWebhookSignature(req.body, signature)) {
    await logActivity({
      type: "payment_security_blocked",
      req,
      metadata: {
        provider: "razorpay",
        reason: "razorpay_webhook_signature_failed",
      },
    });
    return res.status(400).json({
      status: "error",
      message: "Razorpay webhook signature verification failed.",
    });
  }

  let event;
  try {
    event = JSON.parse(req.body.toString("utf8"));
  } catch (err) {
    return res.status(400).json({
      status: "error",
      message: "Invalid Razorpay webhook payload.",
    });
  }

  const eventId = getRazorpayWebhookEventId(req, event);
  const alreadyProcessed = await PaymentTransaction.findOne({
    provider: "razorpay",
    providerEventId: eventId,
  }).select("_id");
  if (alreadyProcessed) {
    return res.status(200).json({ received: true, duplicate: true });
  }

  try {
    const payment = event?.payload?.payment?.entity;
    const refund = event?.payload?.refund?.entity;

    if (event.event === "payment.captured" && payment) {
      await handleRazorpayCapturedPayment({ payment, req });
    }

    if (event.event === "payment.failed" && payment) {
      await logActivity({
        type: "payment_security_blocked",
        req,
        metadata: {
          provider: "razorpay",
          reason: "razorpay_payment_failed",
          razorpayOrderId: payment.order_id,
          razorpayPaymentId: payment.id,
          errorCode: payment.error_code,
          errorDescription: payment.error_description,
        },
      });
    }

    if (event.event && event.event.startsWith("refund.") && refund) {
      await logActivity({
        type: "refund_updated",
        req,
        metadata: {
          provider: "razorpay",
          event: event.event,
          razorpayRefundId: refund.id,
          razorpayPaymentId: refund.payment_id,
          amount: refund.amount,
          status: refund.status,
        },
      });
    }

    await logRazorpayWebhookTransaction({ event, eventId });

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Razorpay webhook processing failed:", err.message);
    return res.status(err.statusCode || 500).json({
      status: "error",
      message: err.message || "Razorpay webhook processing failed.",
    });
  }
};

const handleStripeWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return res.status(503).json({
      status: "error",
      message: "Stripe webhook secret is not configured.",
    });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err) {
    await logActivity({
      type: "payment_security_blocked",
      req,
      metadata: {
        provider: "stripe",
        reason: "stripe_webhook_signature_failed",
        message: err.message,
      },
    });
    return res.status(400).json({
      status: "error",
      message: `Webhook signature verification failed: ${err.message}`,
    });
  }

  try {
    const alreadyProcessed = await PaymentTransaction.findOne({
      provider: "stripe",
      providerEventId: event.id,
    }).select("_id");
    if (alreadyProcessed) {
      return res.status(200).json({ received: true, duplicate: true });
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const metadata = paymentIntent.metadata || {};

      if (metadata.purchaseType === "physical_order") {
        await handlePhysicalOrderPayment({ paymentIntent, metadata, req });
        return res.status(200).json({ received: true });
      }

      if (metadata.purchaseType === "campaign_pledge") {
        await handleCampaignPledgePayment({ paymentIntent, metadata, req });
        return res.status(200).json({ received: true });
      }

      if (metadata.purchaseType === "subscription_annual") {
        await handleSubscriptionPaymentIntent({ paymentIntent, metadata, event, req });
        return res.status(200).json({ received: true });
      }

      if (!metadata.userId || !metadata.bookId || !metadata.purchaseType) {
        await logActivity({
          type: "payment_security_blocked",
          email: undefined,
          req,
          metadata: {
            reason: "missing_payment_metadata",
            stripePaymentIntentId: paymentIntent.id,
            eventId: event.id,
          },
        });
        return res.status(400).json({
          status: "error",
          message: "Payment metadata is incomplete.",
        });
      }

      await fulfillPurchase({
        userId: metadata.userId,
        bookId: metadata.bookId,
        chapterId: metadata.chapterId,
        amount: Number(paymentIntent.amount_received || paymentIntent.amount) / 100,
        currency: String(paymentIntent.currency || "usd").toUpperCase(),
        stripePaymentIntentId: paymentIntent.id,
        paymentProvider: "stripe",
        paymentReference: paymentIntent.id,
        req,
      });
    }

    if (event.type === "invoice.paid") {
      await handleInvoicePaid({ invoice: event.data.object, event, req });
    }

    if (event.type === "invoice.payment_failed") {
      await handleInvoiceFailed({ invoice: event.data.object, event, req });
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      await handleStripeSubscriptionUpdated({ stripeSubscription: event.data.object, event });
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Stripe webhook processing failed:", err.message);
    if (err.securityReason) {
      const paymentIntent = event?.data?.object;
      await logActivity({
        userId: paymentIntent?.metadata?.userId,
        type: "payment_security_blocked",
        email: undefined,
        req,
        metadata: {
          reason: err.securityReason,
          message: err.message,
          stripePaymentIntentId: paymentIntent?.id,
          eventId: event?.id,
          amount: paymentIntent?.amount_received || paymentIntent?.amount,
          currency: paymentIntent?.currency,
          bookId: paymentIntent?.metadata?.bookId,
          chapterId: paymentIntent?.metadata?.chapterId,
        },
      });
    }
    return res.status(err.statusCode || 500).json({
      status: "error",
      message: err.message || "Webhook processing failed.",
    });
  }
};

module.exports = { handleStripeWebhook, handleRazorpayWebhook };

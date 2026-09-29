const RefundRequest = require("../models/RefundRequest");
const Purchase = require("../models/Purchase");
const BookAccess = require("../models/BookAccess");
const User = require("../models/User");
const { sendEmail, emailTemplates } = require("./emailService");
const { logActivity } = require("../utils/activityLogger");
const { createNotification } = require("./notificationService");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || "sk_test_missing");

const PAYMENT_REFUND_ISSUE_TYPES = new Set([
  "duplicate_charge",
  "charged_no_access",
  "wrong_amount",
  "network_payment_issue",
  "payment_gateway_issue",
]);

const validatePaymentRefundIssue = (issueType) => {
  if (!PAYMENT_REFUND_ISSUE_TYPES.has(issueType)) {
    const err = new Error(
      "Refunds are only available for payment issues such as duplicate charge, failed access after payment, wrong amount, or network/payment gateway issue."
    );
    err.statusCode = 400;
    throw err;
  }
};

const sendRefundEmail = async (refund, status, adminNote) => {
  const user = await User.findById(refund.userId);
  if (!user) return;

  try {
    await sendEmail({
      to: user.email,
      type: "refund_update",
      userId: user._id,
      metadata: { refundId: refund._id, purchaseId: refund.purchaseId, status },
      ...emailTemplates.refundUpdate({
        name: user.name,
        invoiceNumber: refund.invoiceNumber,
        status,
        amount: refund.amount,
        currency: refund.currency,
        adminNote,
      }),
    });
  } catch (err) {
    console.error("Refund email failed:", err.message);
  }
};

const revokeRefundedAccess = async (purchase) => {
  const accessTypes =
    purchase.purchaseType === "chapter"
      ? ["chapter_purchase"]
      : ["full_book_purchase"];

  await BookAccess.deleteMany({
    userId: purchase.userId,
    bookId: purchase.bookId,
    purchaseId: purchase._id,
    accessType: { $in: accessTypes },
  });

  await User.updateOne(
    { _id: purchase.userId },
    {
      $pull: {
        purchases: {
          invoiceNumber: purchase.invoiceNumber,
        },
      },
    }
  );
};

const createRefundRequest = async ({ user, purchaseId, issueType, reason, req }) => {
  validatePaymentRefundIssue(issueType);

  const purchase = await Purchase.findOne({
    _id: purchaseId,
    userId: user._id,
    status: "paid",
  });

  if (!purchase) {
    const err = new Error("Paid purchase not found.");
    err.statusCode = 404;
    throw err;
  }

  const refund = await RefundRequest.create({
    userId: user._id,
    purchaseId: purchase._id,
    invoiceNumber: purchase.invoiceNumber,
    issueType,
    reason,
    amount: purchase.amount,
    currency: purchase.currency,
  });

  await logActivity({
    userId: user._id,
    type: "refund_requested",
    email: user.email,
    req,
    metadata: { refundId: refund._id, purchaseId: purchase._id, issueType },
  });

  return refund;
};

const processStripeRefund = async ({ purchase, refund, paymentRefundId }) => {
  if (paymentRefundId) {
    return paymentRefundId;
  }

  if (!purchase.stripePaymentIntentId) {
    if (process.env.NODE_ENV === "production") {
      const err = new Error("This purchase has no Stripe payment reference.");
      err.statusCode = 400;
      throw err;
    }
    return undefined;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    const err = new Error("Stripe is not configured.");
    err.statusCode = 503;
    throw err;
  }

  const stripeRefund = await stripe.refunds.create({
    payment_intent: purchase.stripePaymentIntentId,
    reason: "requested_by_customer",
    metadata: {
      refundId: refund._id.toString(),
      purchaseId: purchase._id.toString(),
      invoiceNumber: purchase.invoiceNumber,
    },
  });

  return stripeRefund.id;
};

const updateRefundStatus = async ({ refundId, status, admin, adminNote, paymentRefundId, req }) => {
  const refund = await RefundRequest.findById(refundId);
  if (!refund) {
    const err = new Error("Refund request not found.");
    err.statusCode = 404;
    throw err;
  }

  if (refund.status === "processed") {
    const err = new Error("Refund is already processed.");
    err.statusCode = 400;
    throw err;
  }

  if (status === "approved" && refund.status !== "requested") {
    const err = new Error("Only requested refunds can be approved.");
    err.statusCode = 400;
    throw err;
  }

  if (status === "rejected" && !["requested", "approved"].includes(refund.status)) {
    const err = new Error("Only requested or approved refunds can be rejected.");
    err.statusCode = 400;
    throw err;
  }

  if (status === "processed" && !["requested", "approved"].includes(refund.status)) {
    const err = new Error("Only requested or approved refunds can be processed.");
    err.statusCode = 400;
    throw err;
  }

  refund.status = status;
  refund.adminNote = adminNote;
  refund.reviewedBy = admin._id;
  refund.reviewedAt = new Date();

  if (status === "processed") {
    const purchase = await Purchase.findById(refund.purchaseId);
    if (!purchase) {
      const err = new Error("Purchase not found for refund.");
      err.statusCode = 404;
      throw err;
    }

    const resolvedPaymentRefundId = await processStripeRefund({
      purchase,
      refund,
      paymentRefundId,
    });

    purchase.status = "refunded";
    purchase.metadata = {
      ...(purchase.metadata || {}),
      refundId: refund._id,
      refundedAt: new Date(),
      paymentRefundId: resolvedPaymentRefundId,
    };
    await purchase.save({ validateBeforeSave: false });
    await revokeRefundedAccess(purchase);

    refund.processedBy = admin._id;
    refund.processedAt = new Date();
    refund.paymentRefundId = resolvedPaymentRefundId;
  }

  await refund.save();
  await sendRefundEmail(refund, status, adminNote);
  await createNotification({
    userId: refund.userId,
    type: "refund",
    title: `Refund ${status}`,
    message: `Your refund request for invoice ${refund.invoiceNumber} is now ${status}.`,
    link: `/refunds/${refund._id}`,
    metadata: {
      refundId: refund._id,
      purchaseId: refund.purchaseId,
      status,
    },
  });

  await logActivity({
    userId: refund.userId,
    type: status === "processed" ? "refund_processed" : "refund_updated",
    email: admin.email,
    req,
    metadata: {
      refundId: refund._id,
      purchaseId: refund.purchaseId,
      status,
      adminUserId: admin._id,
    },
  });

  return refund;
};

module.exports = {
  createRefundRequest,
  updateRefundStatus,
};

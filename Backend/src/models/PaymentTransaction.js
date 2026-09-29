const mongoose = require("mongoose");

const paymentTransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription", index: true },
    provider: { type: String, enum: ["stripe", "razorpay", "manual"], default: "stripe", index: true },
    providerEventId: { type: String, trim: true },
    providerPaymentId: { type: String, trim: true, sparse: true, index: true },
    providerSubscriptionId: { type: String, trim: true, sparse: true, index: true },
    type: {
      type: String,
      enum: ["subscription_create", "invoice_paid", "invoice_failed", "payment_success", "payment_failed", "refund", "card_updated"],
      required: true,
      index: true,
    },
    status: { type: String, enum: ["pending", "succeeded", "failed", "cancelled", "refunded"], default: "pending", index: true },
    amount: { type: Number, default: 0 },
    currency: { type: String, default: "USD", uppercase: true, trim: true },
    raw: { type: mongoose.Schema.Types.Mixed },
    metadata: { type: Map, of: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
);

paymentTransactionSchema.index(
  { providerEventId: 1 },
  { sparse: true, name: "providerEventId_1" },
);
paymentTransactionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("PaymentTransaction", paymentTransactionSchema);

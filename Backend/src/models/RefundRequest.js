const mongoose = require("mongoose");

const refundRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    purchaseId: { type: mongoose.Schema.Types.ObjectId, ref: "Purchase", required: true },
    invoiceNumber: { type: String, required: true, index: true },
    issueType: {
      type: String,
      enum: [
        "duplicate_charge",
        "charged_no_access",
        "wrong_amount",
        "network_payment_issue",
        "payment_gateway_issue",
      ],
      required: true,
      default: "payment_gateway_issue",
      index: true,
    },
    reason: { type: String, required: true, trim: true, maxlength: 1000 },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD" },
    status: {
      type: String,
      enum: ["requested", "approved", "rejected", "processed"],
      default: "requested",
      index: true,
    },
    adminNote: { type: String, trim: true, maxlength: 1000 },
    requestedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    processedAt: { type: Date },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    paymentRefundId: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

refundRequestSchema.index({ userId: 1, createdAt: -1 });
refundRequestSchema.index({ purchaseId: 1, status: 1 });
refundRequestSchema.index(
  { purchaseId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["requested", "approved"] } },
  }
);

module.exports = mongoose.model("RefundRequest", refundRequestSchema);

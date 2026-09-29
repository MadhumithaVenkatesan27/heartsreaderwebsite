const mongoose = require("mongoose");

const redemptionHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription", required: true, index: true },
    titleId: { type: String, required: true, trim: true, index: true },
    titleSnapshot: { type: mongoose.Schema.Types.Mixed },
    format: { type: String, enum: ["manga", "novel", "print", "digital"], required: true },
    creditCost: { type: Number, default: 1, min: 1 },
    creditLedgerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "CreditLedger" }],
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "SubscriptionOrder" },
    status: { type: String, enum: ["redeemed", "cancelled", "refunded"], default: "redeemed", index: true },
  },
  { timestamps: true },
);

redemptionHistorySchema.index(
  { userId: 1, titleId: 1, subscriptionId: 1 },
  { unique: true, partialFilterExpression: { status: "redeemed" } },
);

module.exports = mongoose.model("RedemptionHistory", redemptionHistorySchema);

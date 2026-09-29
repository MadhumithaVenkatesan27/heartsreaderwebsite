const mongoose = require("mongoose");

const creditLedgerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription", index: true },
    planId: { type: String, lowercase: true, trim: true, index: true },
    type: {
      type: String,
      enum: ["grant", "bonus", "redeem", "expire", "forfeit", "adjustment", "carry_forward"],
      required: true,
      index: true,
    },
    format: { type: String, enum: ["manga", "novel", "print", "digital", "any"], default: "any", index: true },
    amount: { type: Number, required: true },
    remaining: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "used", "expired", "forfeited"], default: "active", index: true },
    source: { type: String, trim: true },
    referenceId: { type: String, trim: true, index: true },
    redemptionId: { type: mongoose.Schema.Types.ObjectId, ref: "RedemptionHistory", index: true },
    expiresAt: { type: Date, index: true },
    metadata: { type: Map, of: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
);

creditLedgerSchema.index({ userId: 1, status: 1, expiresAt: 1 });
creditLedgerSchema.index({ referenceId: 1, type: 1 }, { sparse: true });

module.exports = mongoose.model("CreditLedger", creditLedgerSchema);

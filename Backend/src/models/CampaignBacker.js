const mongoose = require("mongoose");

const campaignBackerSchema = new mongoose.Schema(
  {
    campaignSlug: {
      type: String,
      required: true,
      trim: true,
      index: true,
      default: "borrowing-your-textbook-print-run",
    },
    campaignTitle: { type: String, required: true, trim: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    latestTier: { type: String, enum: ["digital", "both"], required: true },
    latestTierName: { type: String, required: true, trim: true },
    pledgeCount: { type: Number, default: 0, min: 0 },
    paidPledgeCount: { type: Number, default: 0, min: 0 },
    totalPledgedAmount: { type: Number, default: 0, min: 0 },
    totalPaidAmount: { type: Number, default: 0, min: 0 },
    totalRefundedAmount: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: "USD", uppercase: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "paid", "refunded", "cancelled"],
      default: "pending",
      index: true,
    },
    firstPledgedAt: { type: Date, default: Date.now },
    lastPledgedAt: { type: Date, default: Date.now },
    lastPaidAt: { type: Date },
    lastRefundedAt: { type: Date },
  },
  { timestamps: true },
);

campaignBackerSchema.index({ campaignSlug: 1, userId: 1 }, { unique: true });
campaignBackerSchema.index({ campaignSlug: 1, status: 1 });

module.exports = mongoose.model("CampaignBacker", campaignBackerSchema);

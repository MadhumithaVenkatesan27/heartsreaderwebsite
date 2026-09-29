const mongoose = require("mongoose");

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    line1: { type: String, trim: true },
    city: { type: String, trim: true },
    country: { type: String, trim: true },
  },
  { _id: false },
);

const campaignPledgeSchema = new mongoose.Schema(
  {
    pledgeNumber: { type: String, required: true, unique: true, index: true },
    campaignSlug: {
      type: String,
      required: true,
      trim: true,
      default: "borrowing-your-textbook-print-run",
      index: true,
    },
    campaignTitle: {
      type: String,
      required: true,
      trim: true,
      default: "Borrowing Your Textbook - First English Print Run",
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    backerName: { type: String, required: true, trim: true },
    backerEmail: { type: String, required: true, trim: true, lowercase: true },
    tier: {
      type: String,
      enum: ["digital", "both"],
      required: true,
      index: true,
    },
    tierName: { type: String, required: true, trim: true },
    quantity: { type: Number, min: 1, default: 1 },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD", uppercase: true, trim: true },
    shippingAddress: shippingAddressSchema,
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled", "refunded"],
      default: "pending",
      index: true,
    },
    fulfillmentStatus: {
      type: String,
      enum: ["pledged", "digital_granted", "production", "packed", "shipped", "delivered", "cancelled"],
      default: "pledged",
      index: true,
    },
    paymentProvider: { type: String, default: "manual", trim: true },
    paymentReference: { type: String, trim: true },
    paidAt: { type: Date },
    refundStatus: {
      type: String,
      enum: ["none", "pending", "refunded", "failed"],
      default: "none",
      index: true,
    },
    refundReference: { type: String, trim: true },
    refundedAt: { type: Date },
    refundReason: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);

campaignPledgeSchema.index({ userId: 1, createdAt: -1 });
campaignPledgeSchema.index({ campaignSlug: 1, paymentStatus: 1 });

module.exports = mongoose.model("CampaignPledge", campaignPledgeSchema);

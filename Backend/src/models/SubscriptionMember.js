const mongoose = require("mongoose");

const subscriptionMemberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
      index: true,
    },
    name: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true, index: true },
    planId: { type: String, required: true, lowercase: true, trim: true, index: true },
    billingCycle: {
      type: String,
      enum: ["monthly", "annual"],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["incomplete", "active", "past_due", "cancelled", "paused", "expired"],
      default: "incomplete",
      index: true,
    },
    startedAt: { type: Date },
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date },
    cancelledAt: { type: Date },
    stripeCustomerId: { type: String, trim: true, index: true },
    stripeSubscriptionId: { type: String, trim: true, sparse: true, index: true },
    lastSyncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

subscriptionMemberSchema.index({ status: 1, billingCycle: 1 });
subscriptionMemberSchema.index({ planId: 1, status: 1 });

module.exports = mongoose.model("SubscriptionMember", subscriptionMemberSchema);

const mongoose = require("mongoose");

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    line1: { type: String, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, default: "US", uppercase: true, trim: true },
  },
  { _id: false },
);

const subscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    planId: { type: String, required: true, lowercase: true, trim: true, index: true },
    planSnapshot: { type: mongoose.Schema.Types.Mixed },
    billingCycle: { type: String, enum: ["monthly", "annual"], required: true, index: true },
    status: {
      type: String,
      enum: ["incomplete", "active", "past_due", "cancelled", "paused", "expired"],
      default: "incomplete",
      index: true,
    },
    stripeCustomerId: { type: String, trim: true, index: true },
    stripeSubscriptionId: { type: String, trim: true, sparse: true, index: true },
    stripePaymentIntentId: { type: String, trim: true, sparse: true, index: true },
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    cancelledAt: { type: Date },
    lastCreditGrantAt: { type: Date },
    nextCreditGrantAt: { type: Date },
    shippingAddress: shippingAddressSchema,
    paymentMethodBrand: { type: String, trim: true },
    paymentMethodLast4: { type: String, trim: true },
    metadata: { type: Map, of: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
);

subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ status: 1, nextCreditGrantAt: 1 });

module.exports = mongoose.model("Subscription", subscriptionSchema);

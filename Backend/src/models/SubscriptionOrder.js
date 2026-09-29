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

const subscriptionOrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription", index: true },
    redemptionId: { type: mongoose.Schema.Types.ObjectId, ref: "RedemptionHistory", index: true },
    titleId: { type: String, trim: true, index: true },
    titleSnapshot: { type: mongoose.Schema.Types.Mixed },
    edition: { type: String, default: "Standard", trim: true },
    shippingAddress: shippingAddressSchema,
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    trackingNumber: { type: String, trim: true },
    carrier: { type: String, trim: true },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);

subscriptionOrderSchema.index({ userId: 1, createdAt: -1 });
subscriptionOrderSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("SubscriptionOrder", subscriptionOrderSchema);

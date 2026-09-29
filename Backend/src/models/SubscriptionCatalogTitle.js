const mongoose = require("mongoose");

const subscriptionCatalogTitleSchema = new mongoose.Schema(
  {
    titleId: { type: String, required: true, unique: true, lowercase: true, trim: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", index: true },
    title: { type: String, required: true, trim: true },
    format: { type: String, enum: ["manga", "novel", "print", "digital"], required: true, index: true },
    volume: { type: String, trim: true },
    edition: { type: String, default: "Standard", trim: true },
    coverImageUrl: { type: String, trim: true },
    releaseStatus: {
      type: String,
      enum: ["available", "preorder", "coming_soon", "paused"],
      default: "available",
      index: true,
    },
    releaseDate: { type: Date, index: true },
    availability: {
      inStock: { type: Boolean, default: true },
      quantity: { type: Number, default: 0, min: 0 },
      regions: [{ type: String, trim: true, uppercase: true }],
    },
    pricing: {
      retail: { type: Number, default: 0, min: 0 },
      currency: { type: String, default: "USD", uppercase: true, trim: true },
      creditCost: { type: Number, default: 1, min: 1 },
    },
    allowedPlanIds: [{ type: String, lowercase: true, trim: true, index: true }],
    bonusEligible: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    metadata: { type: Map, of: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
);

subscriptionCatalogTitleSchema.index({ isActive: 1, format: 1, releaseStatus: 1 });
subscriptionCatalogTitleSchema.index({ title: "text", volume: "text", edition: "text" });

module.exports = mongoose.model("SubscriptionCatalogTitle", subscriptionCatalogTitleSchema);

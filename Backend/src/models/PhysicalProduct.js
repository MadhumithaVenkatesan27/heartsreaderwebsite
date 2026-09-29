const mongoose = require("mongoose");

const physicalProductSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true, trim: true, uppercase: true, index: true },
    productId: { type: String, required: true, trim: true, lowercase: true, index: true },
    title: { type: String, required: true, trim: true },
    volume: { type: Number, min: 1 },
    edition: { type: String, default: "Standard Paperback", trim: true },
    editionType: {
      type: String,
      enum: ["regular", "limited"],
      default: "regular",
      index: true,
    },
    format: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD", uppercase: true, trim: true },
    coverImageUrl: { type: String, trim: true },
    isPreorder: { type: Boolean, default: false, index: true },
    active: { type: Boolean, default: true, index: true },
    source: { type: String, default: "frontend_print_catalog", trim: true },
  },
  { timestamps: true },
);

physicalProductSchema.index({ active: 1, productId: 1 });
physicalProductSchema.index({ active: 1, sku: 1 });

module.exports = mongoose.model("PhysicalProduct", physicalProductSchema);

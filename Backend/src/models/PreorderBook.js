const mongoose = require("mongoose");

const preorderBookSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true, trim: true, index: true },
    title: { type: String, required: true, trim: true },
    volume: { type: String, trim: true },
    edition: { type: String, default: "Regular Print Edition", trim: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD", uppercase: true, trim: true },
    coverImageUrl: { type: String, trim: true },
    status: {
      type: String,
      enum: ["preorder", "available", "closed"],
      default: "preorder",
      index: true,
    },
    source: { type: String, default: "print_catalog", trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("PreorderBook", preorderBookSchema);

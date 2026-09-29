const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    chapterIds: [{ type: mongoose.Schema.Types.ObjectId }],
    purchaseType: {
      type: String,
      enum: ["book", "chapter"],
      required: true,
      index: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    invoiceNumber: { type: String, required: true, unique: true },
    bookTitle: { type: String, required: true },
    chapterTitles: [{ type: String }],
    paymentProvider: {
      type: String,
      enum: ["manual", "stripe", "razorpay"],
      default: "manual",
      index: true,
    },
    paymentReference: { type: String },
    stripePaymentIntentId: { type: String },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    status: {
      type: String,
      enum: ["paid", "refunded", "cancelled"],
      default: "paid",
      index: true,
    },
    paidAt: { type: Date, default: Date.now },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

purchaseSchema.index({ userId: 1, createdAt: -1 });
purchaseSchema.index({ bookId: 1, purchaseType: 1 });
purchaseSchema.index({ status: 1, createdAt: -1 });
purchaseSchema.index({ razorpayOrderId: 1 }, { sparse: true });
purchaseSchema.index(
  { stripePaymentIntentId: 1 },
  { unique: true, sparse: true }
);
purchaseSchema.index(
  { razorpayPaymentId: 1 },
  { unique: true, sparse: true }
);
purchaseSchema.index(
  { paymentProvider: 1, paymentReference: 1 },
  {
    unique: true,
    partialFilterExpression: { paymentReference: { $type: "string" } },
  }
);

module.exports = mongoose.model("Purchase", purchaseSchema);

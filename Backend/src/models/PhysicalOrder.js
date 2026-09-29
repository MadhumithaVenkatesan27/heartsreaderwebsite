const mongoose = require("mongoose");

const physicalOrderItemSchema = new mongoose.Schema(
  {
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
    sku: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    edition: { type: String, default: "Standard", trim: true },
    format: { type: String, trim: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    price: { type: Number, min: 0 },
    coverImageUrl: { type: String, trim: true },
    isPreorder: { type: Boolean, default: false },
    preorderStatus: {
      type: String,
      enum: ["available", "preorder"],
      default: "available",
      index: true,
    },
  },
  { _id: false },
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    addressLine1: { type: String, trim: true },
    addressLine2: { type: String, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: "India" },
  },
  { _id: false },
);

const customerDetailsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const physicalOrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    customer: { type: customerDetailsSchema, required: true },
    items: { type: [physicalOrderItemSchema], validate: (items) => items.length > 0 },
    shippingAddress: { type: shippingAddressSchema, required: true },
    currency: { type: String, default: "USD", uppercase: true, trim: true },
    subtotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    fulfillmentStatus: {
      type: String,
      enum: ["received", "processing", "packed", "shipped", "delivered", "cancelled"],
      default: "received",
      index: true,
    },
    paymentProvider: { type: String, default: "manual", trim: true },
    paymentReference: { type: String, trim: true },
    razorpayOrderId: { type: String, trim: true },
    razorpayPaymentId: { type: String, trim: true },
    razorpaySignature: { type: String, trim: true },
    gatewayAmount: { type: Number, min: 0 },
    gatewayCurrency: { type: String, uppercase: true, trim: true },
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    trackingNumber: { type: String, trim: true },
    shippedDate: { type: Date },
    deliveredDate: { type: Date },
    failedReason: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);

physicalOrderItemSchema.pre("validate", function syncItemAliases() {
  if (this.price === undefined || this.price === null) this.price = this.unitPrice;
  if (!this.format) this.format = this.edition;
});

physicalOrderSchema.pre("validate", function syncOrderAliases() {
  if (this.shippingAddress) {
    this.shippingAddress.addressLine1 =
      this.shippingAddress.addressLine1 || this.shippingAddress.line1;
    this.shippingAddress.addressLine2 =
      this.shippingAddress.addressLine2 || this.shippingAddress.line2;
  }
  if (!this.customer && this.shippingAddress) {
    this.customer = {
      name: this.shippingAddress.fullName,
      email: this.shippingAddress.email,
      phone: this.shippingAddress.phone,
    };
  }
  if (this.fulfillmentStatus === "shipped") this.orderStatus = "shipped";
  if (this.fulfillmentStatus === "delivered") this.orderStatus = "delivered";
  if (this.fulfillmentStatus === "cancelled") this.orderStatus = "cancelled";
  if (this.paymentStatus === "paid" && this.orderStatus === "pending") {
    this.orderStatus = "processing";
  }
});

physicalOrderSchema.index({ userId: 1, createdAt: -1 });
physicalOrderSchema.index({ paymentStatus: 1, fulfillmentStatus: 1 });
physicalOrderSchema.index({ paymentStatus: 1, createdAt: -1 });
physicalOrderSchema.index({ orderStatus: 1, createdAt: -1 });
physicalOrderSchema.index({ paymentProvider: 1, paymentReference: 1 });
physicalOrderSchema.index({ razorpayPaymentId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("PhysicalOrder", physicalOrderSchema);

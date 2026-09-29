const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const purchaseSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  chapterIds: [{ type: mongoose.Schema.Types.ObjectId }],
  purchaseType: {
    type: String,
    enum: ["book", "chapter"],
    default: "book",
  },
  amount: { type: Number, default: 0 },
  currency: { type: String, default: "USD" },
  invoiceNumber: { type: String },
  bookTitle: { type: String },
  chapterTitles: [{ type: String }],
  purchasedAt: { type: Date, default: Date.now },
  paymentProvider: {
    type: String,
    enum: ["manual", "stripe", "razorpay"],
    default: "manual",
  },
  paymentReference: { type: String },
  stripePaymentIntentId: { type: String },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  watermarkedPdfKey: { type: String },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [254, "Email address is too long"],
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin", "licensor"],
      default: "user",
      index: true,
    },
    licensorId: {
      type: String,
      uppercase: true,
      trim: true,
      sparse: true,
      index: true,
      match: [/^LIC-[A-Z0-9-]{2,40}$/, "Licensor ID must look like LIC-TYNA"],
    },
    status: {
      type: String,
      enum: ["active", "blocked", "deleted"],
      default: "active",
      index: true,
    },
    registeredAt: { type: Date, default: Date.now },
    emailVerifiedAt: { type: Date },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    emailVerificationCode: { type: String, select: false },
    emailVerificationCodeExpires: { type: Date, select: false },
    emailVerificationAttempts: { type: Number, default: 0, select: false },
    emailVerificationLockedUntil: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    passwordChangedAt: { type: Date, select: false },
    failedLoginAttempts: { type: Number, default: 0, select: false },
    lockedUntil: { type: Date, select: false },
    refreshToken: { type: String, select: false },
    lastLoginAt: { type: Date },
    lastLoginIp: { type: String, select: false },
    lastLoginUserAgent: { type: String, select: false },
    loginCount: { type: Number, default: 0 },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorCode: { type: String, select: false },
    twoFactorExpires: { type: Date, select: false },
    pendingLoginToken: { type: String, select: false },
    pendingLoginTokenExpires: { type: Date, select: false },
    emailPreferences: {
      bookUpdates: { type: Boolean, default: true },
      readingReminders: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
    },
    unsubscribeToken: { type: String, select: false, index: true },
    unsubscribedAt: { type: Date },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
    assignedBookIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book", index: true }],
    purchases: [purchaseSchema],
    isSubscriber: { type: Boolean, default: false },
    stripeCustomerId: { type: String, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        delete ret.emailVerificationCode;
        delete ret.emailVerificationCodeExpires;
        delete ret.emailVerificationAttempts;
        delete ret.emailVerificationLockedUntil;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.passwordChangedAt;
        delete ret.failedLoginAttempts;
        delete ret.lockedUntil;
        delete ret.refreshToken;
        delete ret.lastLoginIp;
        delete ret.lastLoginUserAgent;
        delete ret.twoFactorCode;
        delete ret.twoFactorExpires;
        delete ret.pendingLoginToken;
        delete ret.pendingLoginTokenExpires;
        delete ret.unsubscribeToken;
        delete ret.stripeCustomerId;
        delete ret.__v;
        return ret;
      },
    },
  },
);

userSchema.index({ emailVerificationToken: 1 }, { sparse: true });
userSchema.index({ passwordResetToken: 1 }, { sparse: true });
userSchema.index({ refreshToken: 1 }, { sparse: true });
userSchema.index({ status: 1, role: 1 });

userSchema.pre("validate", function () {
  if (!this.unsubscribeToken) {
    this.unsubscribeToken = require("crypto").randomBytes(32).toString("hex");
  }
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.passwordChangedAfter = function (jwtIssuedAt) {
  if (this.passwordChangedAt) {
    const changedTime = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return jwtIssuedAt < changedTime;
  }
  return false;
};

userSchema.methods.isLocked = function () {
  return this.lockedUntil && this.lockedUntil > Date.now();
};

userSchema.methods.recordFailedLogin = async function () {
  this.failedLoginAttempts += 1;
  if (this.failedLoginAttempts >= 5) {
    this.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
  }
  await this.save({ validateBeforeSave: false });
};

userSchema.methods.recordSuccessfulLogin = async function (ip, userAgent) {
  this.failedLoginAttempts = 0;
  this.lockedUntil = undefined;
  this.lastLoginAt = new Date();
  this.lastLoginIp = ip;
  this.lastLoginUserAgent = userAgent;
  this.loginCount = (this.loginCount || 0) + 1;
  await this.save({ validateBeforeSave: false });
};

userSchema.methods.ownsBook = function (bookId) {
  return this.purchases.some(
    (p) =>
      p.bookId.toString() === bookId.toString() &&
      (p.purchaseType || "book") === "book",
  );
};

userSchema.methods.ownsChapter = function (bookId, chapterId) {
  if (this.ownsBook(bookId)) return true;
  return this.purchases.some(
    (p) =>
      p.bookId.toString() === bookId.toString() &&
      (p.chapterIds || []).some((id) => id.toString() === chapterId.toString()),
  );
};

module.exports = mongoose.model("User", userSchema);

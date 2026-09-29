const mongoose = require("mongoose");

const pendingRegistrationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    passwordEncrypted: { type: String, required: true, select: false },
    passwordIv: { type: String, required: true, select: false },
    passwordAuthTag: { type: String, required: true, select: false },
    emailVerificationToken: { type: String, required: true, select: false },
    emailVerificationExpires: { type: Date, required: true, select: false },
    emailVerificationCode: { type: String, required: true, select: false },
    emailVerificationCodeExpires: { type: Date, required: true, select: false },
    emailVerificationAttempts: { type: Number, default: 0, select: false },
    emailVerificationLockedUntil: { type: Date, select: false },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      index: { expires: 0 },
    },
  },
  { timestamps: true },
);

pendingRegistrationSchema.index({ emailVerificationToken: 1 }, { sparse: true });

module.exports = mongoose.model(
  "PendingRegistration",
  pendingRegistrationSchema,
);

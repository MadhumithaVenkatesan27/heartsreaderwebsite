const mongoose = require("mongoose");

const userActivitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    type: {
      type: String,
      required: true,
      index: true,
      enum: [
        "registered",
        "email_verified",
        "verification_resent",
        "login_success",
        "login_failed",
        "logout",
        "password_changed",
        "password_reset_requested",
        "password_reset_completed",
        "profile_updated",
        "email_preferences_updated",
        "unsubscribed",
        "purchase_completed",
        "payment_intent_created",
        "payment_security_blocked",
        "suspicious_activity",
        "refund_requested",
        "refund_updated",
        "refund_processed",
        "read_token_issued",
        "subscription_created",
        "subscription_activated",
        "subscription_payment_failed",
        "subscription_credit_redeemed",
        "subscription_cancel_requested",
        "thread_created",
        "thread_replied",
        "thread_liked",
        "thread_moderated",
        "chapter_opened",
      ],
    },
    email: { type: String, lowercase: true, trim: true, index: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

userActivitySchema.index({ createdAt: -1 });
userActivitySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("UserActivity", userActivitySchema);

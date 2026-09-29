const mongoose = require("mongoose");

const emailLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    to: { type: String, required: true, lowercase: true, trim: true, index: true },
    subject: { type: String, required: true },
    type: {
      type: String,
      default: "general",
      index: true,
      enum: [
        "general",
        "welcome",
        "verify_email",
        "password_reset",
        "two_factor",
        "security_alert",
        "purchase_invoice",
        "refund_update",
        "upload_notification",
        "physical_order",
        "campaign_pledge",
        "campaign_refund",
      ],
    },
    status: {
      type: String,
      enum: ["sent", "failed"],
      required: true,
      index: true,
    },
    providerMessageId: { type: String },
    errorMessage: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

emailLogSchema.index({ createdAt: -1 });
emailLogSchema.index({ to: 1, createdAt: -1 });

module.exports = mongoose.model("EmailLog", emailLogSchema);

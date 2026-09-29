const mongoose = require("mongoose");

const ticketMessageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    senderRole: {
      type: String,
      enum: ["user", "admin"],
      required: true,
    },
    message: { type: String, required: true, trim: true, maxlength: 3000 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const supportTicketSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subject: { type: String, required: true, trim: true, maxlength: 160 },
    category: {
      type: String,
      enum: ["account", "payment", "refund", "pdf", "book", "technical", "other"],
      default: "other",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
      index: true,
    },
    status: {
      type: String,
      enum: ["open", "pending", "resolved", "closed"],
      default: "open",
      index: true,
    },
    messages: [ticketMessageSchema],
    lastMessageAt: { type: Date, default: Date.now, index: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

supportTicketSchema.index({ status: 1, lastMessageAt: -1 });
supportTicketSchema.index({ userId: 1, lastMessageAt: -1 });

module.exports = mongoose.model("SupportTicket", supportTicketSchema);

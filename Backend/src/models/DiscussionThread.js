const mongoose = require("mongoose");

const replySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, trim: true, maxlength: 3000 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    status: {
      type: String,
      enum: ["published", "hidden"],
      default: "published",
      index: true,
    },
    hiddenReason: { type: String, trim: true, maxlength: 500 },
    hiddenBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    hiddenAt: { type: Date },
  },
  { timestamps: true }
);

const discussionThreadSchema = new mongoose.Schema(
  {
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    chapterId: { type: mongoose.Schema.Types.ObjectId, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    replies: [replySchema],
    status: {
      type: String,
      enum: ["published", "hidden", "locked"],
      default: "published",
      index: true,
    },
    hiddenReason: { type: String, trim: true, maxlength: 500 },
    hiddenBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    hiddenAt: { type: Date },
    lastReplyAt: { type: Date },
  },
  { timestamps: true }
);

discussionThreadSchema.index({ bookId: 1, chapterId: 1, createdAt: -1 });
discussionThreadSchema.index({ bookId: 1, status: 1, lastReplyAt: -1 });

module.exports = mongoose.model("DiscussionThread", discussionThreadSchema);

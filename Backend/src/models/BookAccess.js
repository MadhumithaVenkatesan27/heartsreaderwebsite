const mongoose = require("mongoose");

const bookAccessSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    chapterId: { type: mongoose.Schema.Types.ObjectId, index: true },
    purchaseId: { type: mongoose.Schema.Types.ObjectId, ref: "Purchase" },
    accessType: {
      type: String,
      enum: ["free", "chapter_purchase", "full_book_purchase", "admin_grant"],
      required: true,
      index: true,
    },
    grantedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

bookAccessSchema.index(
  { userId: 1, bookId: 1, chapterId: 1, accessType: 1 },
  { unique: true }
);

module.exports = mongoose.model("BookAccess", bookAccessSchema);

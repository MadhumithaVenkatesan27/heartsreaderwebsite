const mongoose = require("mongoose");

const readingProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    chapterId: { type: mongoose.Schema.Types.ObjectId, required: true },
    page: { type: Number, min: 1, default: 1 },
    percentage: { type: Number, min: 0, max: 100, default: 0 },
    lastReadAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

readingProgressSchema.index({ userId: 1, bookId: 1 }, { unique: true });

module.exports = mongoose.model("ReadingProgress", readingProgressSchema);

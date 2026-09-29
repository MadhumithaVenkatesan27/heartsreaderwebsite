const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  chapterTitle: { type: String, trim: true },
  order: { type: Number, required: true },
  chapterNumber: { type: Number, min: 1 },
  r2Key: { type: String, trim: true },
  pdfStorageKey: { type: String, trim: true },
  type: { type: String, enum: ["chapter", "bonus"], default: "chapter", index: true },
  isFree: { type: Boolean, default: false },
  isPreview: { type: Boolean, default: false },
  accessStatus: {
    type: String,
    enum: ["free", "paid"],
    default: "paid",
    index: true,
  },
  price: { type: Number, default: 0.99, min: 0 },
});

chapterSchema.pre("validate", function syncChapterNumber() {
  if (this.type === "bonus") {
    if (!this.chapterTitle && this.title) this.chapterTitle = this.title;
    if (!this.title && this.chapterTitle) this.title = this.chapterTitle;
    this.chapterNumber = null;
    this.isFree = false;
    this.isPreview = false;
    this.accessStatus = "paid";
    return;
  }

  if (!this.chapterNumber && this.order) this.chapterNumber = this.order;
  if (!this.order && this.chapterNumber) this.order = this.chapterNumber;
  if (!this.chapterTitle && this.title) this.chapterTitle = this.title;
  if (!this.title && this.chapterTitle) this.title = this.chapterTitle;

  const chapterNumber = Number(this.chapterNumber || this.order || 0);
  if (chapterNumber === 1) {
    this.isFree = true;
    this.isPreview = true;
    this.accessStatus = "free";
  } else if (chapterNumber > 1) {
    this.isFree = false;
    this.isPreview = false;
    this.accessStatus = "paid";
  }
});

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    author: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    coverImageUrl: { type: String, trim: true },
    coverImageKey: { type: String, trim: true },
    coverImageR2Key: { type: String, trim: true },
    fullBookR2Key: { type: String, trim: true },
    fullBookPdfR2Key: { type: String, trim: true },
    accessStatus: {
      type: String,
      enum: ["free", "paid"],
      default: "paid",
      index: true,
    },
    price: { type: Number, required: true, min: 0 },
    genres: [{ type: String, trim: true, lowercase: true }],
    chapters: [chapterSchema],
    licensorId: { type: mongoose.Schema.Types.ObjectId, ref: "Licensor", index: true },
    isPublished: { type: Boolean, default: false },
    releaseStatus: {
      type: String,
      enum: ["published", "coming_soon"],
      default: "published",
      index: true,
    },
    releaseDate: { type: Date },
    preorderEnabled: { type: Boolean, default: false },
    readerCount: { type: Number, default: 0 },
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    analytics: {
      views: { type: Number, default: 0 },
      addedToCart: { type: Number, default: 0 },
      purchases: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

bookSchema.index({ isPublished: 1, createdAt: -1 });
bookSchema.index({ releaseStatus: 1, releaseDate: 1 });
bookSchema.index({ genres: 1 });
bookSchema.index({ licensorId: 1, createdAt: -1 });
bookSchema.index({ title: "text", author: "text", description: "text", genres: "text" });

bookSchema.pre("validate", function syncR2Aliases() {
  if (!this.coverImageKey && this.coverImageR2Key) this.coverImageKey = this.coverImageR2Key;
  if (!this.coverImageR2Key && this.coverImageKey) this.coverImageR2Key = this.coverImageKey;
  if (!this.fullBookR2Key && this.fullBookPdfR2Key) this.fullBookR2Key = this.fullBookPdfR2Key;
  if (!this.fullBookPdfR2Key && this.fullBookR2Key) this.fullBookPdfR2Key = this.fullBookR2Key;
});

module.exports = mongoose.model("Book", bookSchema);

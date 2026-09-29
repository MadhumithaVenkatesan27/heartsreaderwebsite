const crypto = require("crypto");
const fs = require("fs");
const mongoose = require("mongoose");
const path = require("path");
const Book = require("../models/Book");
const BookAccess = require("../models/BookAccess");
const Review = require("../models/Review");
const User = require("../models/User");
const Purchase = require("../models/Purchase");
const PhysicalOrder = require("../models/PhysicalOrder");
const { catchAsync, createError } = require("../middleware/errorMiddleware");
const {
  buildPreviewWatermarkedPdf,
  buildReaderWatermarkedPdf,
  generateWatermarkedPdf,
} = require("../services/pdfService");
const {
  isR2StorageEnabled,
  withChapterPdfPath,
} = require("../services/pdfStorageService");
const {
  signReadToken,
  setSecurePdfHeaders,
  verifyReadToken,
} = require("../services/readerSecurityService");
const { sendEmail, emailTemplates } = require("../services/emailService");
const { createManyNotifications } = require("../services/notificationService");
const { logAdminAudit } = require("../utils/adminAuditLogger");
const { logActivity } = require("../utils/activityLogger");
const { getR2ObjectBuffer } = require("../services/r2Service");

const toSlug = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const normalizeTitleKey = (value) =>
  toSlug(value)
    .replace(/-print$/, "")
    .replace(/-paperback$/, "")
    .replace(/-standard-edition$/, "")
    .replace(/-limited-edition$/, "")
    .replace(/-vol(?:ume)?-\d+$/, "")
    .replace(/-vol\d+$/, "");

const BOOK_IDENTIFIER_ALIASES = {
  "abandoned-v1": "zombie-v1",
  "abandoned-v2": "zombie-v2",
  "borrowing-v1": "borrowing",
  "timeisa-v1": "timeisa",
  "afternoon-v1": "afternoontea",
  "octopiece-v1": "octopiece",
  "print-matchmaker": "matchmaker-v1",
  "print-chigaya": "chigaya-v1",
  "print-executioner": "grenimal-v1",
  "print-allrounder": "connie-v1",
  "print-abandoned": "zombie-v1",
  "print-raeliana": "raeliana-v1",
  "matchmaker-vol1": "matchmaker-v1",
  "chigaya-vol1": "chigaya-v1",
  "chigaya-vol2": "chigaya-v2",
  "executioner-vol1": "grenimal-v1",
  "executioner-vol2": "grenimal-v2",
  "allrounder-vol1": "connie-v1",
  "allrounder-vol2": "connie-v2",
  "abandonedvillainess-vol1": "zombie-v1",
  "abandonedvillainess-vol2": "zombie-v2",
  "whyraeliana-vol1": "raeliana-v1",
  "whyraeliana-vol2": "raeliana-v2",
};

const logBookAccessDenied = async ({ req, book, chapter, reason }) => {
  await logActivity({
    userId: req.user?._id,
    type: "suspicious_activity",
    email: req.user?.email,
    req,
    metadata: {
      reason,
      bookId: book?._id,
      bookSlug: book?.slug,
      chapterId: chapter?._id,
      chapterNumber: chapter?.chapterNumber || chapter?.order,
      r2KeyPresent: Boolean(chapter?.r2Key),
      path: req.originalUrl,
    },
  });
};

const isFreeChapter = (book, chapter) => {
  return Number(chapter?.chapterNumber || chapter?.order) === 1;
};

const safePdfFilename = (value) =>
  `${String(value || "chapter")
    .replace(/[^\w.-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 120) || "chapter"}.pdf`;

const assertPdfSignature = async (filePath) => {
  const handle = await fs.promises.open(filePath, "r");
  try {
    const buffer = Buffer.alloc(4);
    await handle.read(buffer, 0, 4, 0);
    return buffer.toString("ascii") === "%PDF";
  } finally {
    await handle.close();
  }
};

const verifyRequiredReadToken = (req, bookId, chapterId) => {
  const token = req.query.readToken || req.query.token;
  const tokenRequired = process.env.REQUIRE_READ_TOKEN === "true";

  if (!token && !tokenRequired) return null;
  if (!token) return "Read token is required.";

  try {
    const decoded = verifyReadToken(token);
    if (
      decoded.purpose !== "read_chapter" ||
      decoded.userId !== req.user._id.toString() ||
      decoded.bookId !== bookId.toString() ||
      decoded.chapterId !== chapterId.toString()
    ) {
      return "Read token is invalid for this chapter.";
    }
    return null;
  } catch (err) {
    return "Read token is invalid or expired.";
  }
};

const bookFields =
  "title slug author coverImageUrl coverImageKey coverImageR2Key fullBookR2Key fullBookPdfR2Key accessStatus price genres description chapters ratingAverage ratingCount analytics";

const resolvePublishedBook = async (identifier) => {
  const raw = String(identifier || "").trim();
  if (!raw) return null;

  if (mongoose.isValidObjectId(raw)) {
    const byId = await Book.findOne({ _id: raw, isPublished: true });
    if (byId) return byId;
  }

  const slug = toSlug(raw);
  const candidates = [
    slug,
    BOOK_IDENTIFIER_ALIASES[slug],
    normalizeTitleKey(slug),
    BOOK_IDENTIFIER_ALIASES[normalizeTitleKey(slug)],
  ].filter(Boolean);

  return Book.findOne({ slug: { $in: [...new Set(candidates)] }, isPublished: true });
};

const resolveChapterByIdentifier = (book, identifier) => {
  const raw = String(identifier || "").trim();
  if (!raw) return null;

  if (mongoose.isValidObjectId(raw)) {
    const byId = book.chapters.id(raw);
    if (byId) return byId;
  }

  if (/^bonus$/i.test(raw)) {
    return book.chapters.find((chapter) => chapter.type === "bonus");
  }

  const numberMatch = raw.match(/^(?:ch|chapter)?-?(\d+)$/i);
  if (numberMatch) {
    const chapterNumber = Number(numberMatch[1]);
    return book.chapters.find(
      (chapter) => Number(chapter.chapterNumber || chapter.order) === chapterNumber,
    );
  }

  return book.chapters.find(
    (chapter) =>
      String(chapter.chapterTitle || chapter.title || "").toLowerCase() === raw.toLowerCase(),
  );
};

const userHasChapterAccess = async ({ user, book, chapter }) => {
  if (isFreeChapter(book, chapter) || chapter.isFree === true) return true;
  if (!user) return false;
  if (user.role === "admin") return true;
  if (user.ownsChapter(book._id, chapter._id)) return true;

  const access = await BookAccess.exists({
    userId: user._id,
    bookId: book._id,
    $or: [
      { chapterId: chapter._id },
      { accessType: "full_book_purchase" },
      { accessType: "admin_grant" },
    ],
  });
  return Boolean(access);
};

const decorateBooksWithRealPurchaseCounts = async (books = []) => {
  const docs = books.map((book) => (typeof book.toObject === "function" ? book.toObject() : book));
  const ids = docs.map((book) => book._id).filter(Boolean);
  if (!ids.length) return docs;

  const [digitalCounts, physicalByBookId, physicalByTitle] = await Promise.all([
    Purchase.aggregate([
      { $match: { bookId: { $in: ids }, status: "paid" } },
      { $group: { _id: "$bookId", count: { $sum: 1 } } },
    ]),
    PhysicalOrder.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $unwind: "$items" },
      { $match: { "items.bookId": { $in: ids } } },
      { $group: { _id: "$items.bookId", count: { $sum: "$items.quantity" } } },
    ]),
    PhysicalOrder.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: { $toLower: "$items.title" },
          count: { $sum: "$items.quantity" },
        },
      },
    ]),
  ]);

  const digitalMap = new Map(digitalCounts.map((row) => [String(row._id), row.count]));
  const physicalIdMap = new Map(physicalByBookId.map((row) => [String(row._id), row.count]));
  const physicalTitleMap = new Map(
    physicalByTitle.map((row) => [normalizeTitleKey(row._id), row.count]),
  );

  return docs.map((book) => {
    const id = String(book._id);
    const titleKey = normalizeTitleKey(book.title);
    const realPurchases =
      Number(digitalMap.get(id) || 0) +
      Number(physicalIdMap.get(id) || 0) +
      Number(physicalTitleMap.get(titleKey) || 0);
    return {
      ...book,
      analytics: {
        ...(book.analytics || {}),
        purchases: realPurchases,
      },
    };
  });
};

const buildBookFilter = (query) => {
  const filter = { isPublished: true };

  if (query.genre) filter.genres = String(query.genre).trim().toLowerCase();
  if (query.author) filter.author = new RegExp(String(query.author).trim(), "i");
  if (query.q) filter.$text = { $search: String(query.q).trim() };
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  return filter;
};

const validateBookInput = ({ title, author, price, chapters }, isUpdate = false) => {
  if (!isUpdate || title !== undefined) {
    if (!title || !String(title).trim()) return "Book title is required.";
  }
  if (!isUpdate || author !== undefined) {
    if (!author || !String(author).trim()) return "Author is required.";
  }
  if (!isUpdate || price !== undefined) {
    if (typeof Number(price) !== "number" || Number.isNaN(Number(price)) || Number(price) < 0) {
      return "Book price must be a valid positive number.";
    }
  }
  if (chapters !== undefined && !Array.isArray(chapters)) {
    return "Chapters must be an array.";
  }
  return null;
};

const normalizeChapterInput = (chapters = []) =>
  chapters.map((chapter, index) => {
    const chapterNumber = Number(chapter.chapterNumber || chapter.order || index + 1);
    const title = chapter.title || chapter.chapterTitle || `Chapter ${chapterNumber}`;
    return {
      ...chapter,
      title,
      chapterTitle: chapter.chapterTitle || title,
      order: Number.isFinite(chapterNumber) && chapterNumber > 0 ? chapterNumber : index + 1,
      chapterNumber: Number.isFinite(chapterNumber) && chapterNumber > 0 ? chapterNumber : index + 1,
      isFree: chapterNumber === 1,
      isPreview: chapterNumber === 1,
      accessStatus: chapterNumber === 1 ? "free" : "paid",
    };
  });

const listBooks = catchAsync(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;
  const filter = buildBookFilter(req.query);
  const sort =
    req.query.sort === "price"
      ? { price: 1 }
      : req.query.sort === "-price"
        ? { price: -1 }
        : req.query.sort === "rating"
          ? { ratingAverage: -1, ratingCount: -1 }
          : { createdAt: -1 };

  const [books, total] = await Promise.all([
    Book.find(filter).select(bookFields).sort(sort).skip(skip).limit(limit),
    Book.countDocuments(filter),
  ]);
  const decoratedBooks = await decorateBooksWithRealPurchaseCounts(books);

  res.status(200).json({
    status: "success",
    results: decoratedBooks.length,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    data: { books: decoratedBooks },
  });
});

const getBook = catchAsync(async (req, res, next) => {
  const book = await resolvePublishedBook(req.params.bookId);

  if (!book) return next(createError("Book not found.", 404));

  book.analytics.views = (book.analytics.views || 0) + 1;
  await book.save({ validateBeforeSave: false });
  const [decoratedBook] = await decorateBooksWithRealPurchaseCounts([book]);

  res.status(200).json({
    status: "success",
    data: { book: decoratedBook },
  });
});

const createBook = catchAsync(async (req, res, next) => {
  const inputError = validateBookInput(req.body);
  if (inputError) return next(createError(inputError, 400));

  const slug = req.body.slug ? toSlug(req.body.slug) : toSlug(req.body.title);
  if (!slug) return next(createError("A valid book slug is required.", 400));

  const book = await Book.create({
    title: req.body.title.trim(),
    slug,
    author: req.body.author.trim(),
    description: req.body.description,
    coverImageUrl: req.body.coverImageUrl,
    coverImageKey: req.body.coverImageKey,
    coverImageR2Key: req.body.coverImageR2Key,
    fullBookR2Key: req.body.fullBookR2Key,
    fullBookPdfR2Key: req.body.fullBookPdfR2Key,
    accessStatus: req.body.accessStatus,
    price: Number(req.body.price),
    genres: Array.isArray(req.body.genres)
      ? req.body.genres.map((genre) => String(genre).trim().toLowerCase()).filter(Boolean)
      : [],
    chapters: Array.isArray(req.body.chapters) ? normalizeChapterInput(req.body.chapters) : [],
    licensorId: req.body.licensorId,
    isPublished: Boolean(req.body.isPublished),
    releaseStatus: req.body.releaseStatus || "published",
    releaseDate: req.body.releaseDate,
    preorderEnabled: Boolean(req.body.preorderEnabled),
  });

  await logAdminAudit({
    admin: req.user,
    action: "book_created",
    targetType: "book",
    targetId: book._id,
    req,
    metadata: { title: book.title, slug: book.slug },
  });

  res.status(201).json({
    status: "success",
    message: "Book created successfully.",
    data: { book },
  });
});

const updateBook = catchAsync(async (req, res, next) => {
  const inputError = validateBookInput(req.body, true);
  if (inputError) return next(createError(inputError, 400));
  if (!mongoose.isValidObjectId(req.params.bookId)) {
    return next(createError("Book not found.", 404));
  }

  const allowed = [
    "title",
    "author",
    "description",
    "coverImageUrl",
    "coverImageKey",
    "coverImageR2Key",
    "fullBookR2Key",
    "fullBookPdfR2Key",
    "accessStatus",
    "price",
    "genres",
    "chapters",
    "licensorId",
    "isPublished",
    "releaseStatus",
    "releaseDate",
    "preorderEnabled",
  ];
  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });
  if (req.body.slug !== undefined) updates.slug = toSlug(req.body.slug);
  if (updates.price !== undefined) updates.price = Number(updates.price);
  if (Array.isArray(updates.genres)) {
    updates.genres = updates.genres.map((genre) => String(genre).trim().toLowerCase()).filter(Boolean);
  }
  if (Array.isArray(updates.chapters)) {
    updates.chapters = normalizeChapterInput(updates.chapters);
  }

  const book = await Book.findByIdAndUpdate(req.params.bookId, updates, {
    new: true,
    runValidators: true,
  });

  if (!book) return next(createError("Book not found.", 404));

  await logAdminAudit({
    admin: req.user,
    action: "book_updated",
    targetType: "book",
    targetId: book._id,
    req,
    metadata: { title: book.title, fields: Object.keys(updates) },
  });

  res.status(200).json({
    status: "success",
    message: "Book updated successfully.",
    data: { book },
  });
});

const deleteBook = catchAsync(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.bookId)) {
    return next(createError("Book not found.", 404));
  }

  const book = await Book.findByIdAndUpdate(
    req.params.bookId,
    { isPublished: false },
    { new: true }
  );

  if (!book) return next(createError("Book not found.", 404));

  await logAdminAudit({
    admin: req.user,
    action: "book_unpublished",
    targetType: "book",
    targetId: book._id,
    req,
    metadata: { title: book.title },
  });

  res.status(200).json({
    status: "success",
    message: "Book unpublished successfully.",
    data: { book },
  });
});

const addChapterPdf = catchAsync(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.bookId)) {
    return next(createError("Book not found.", 404));
  }
  if (!req.file) return next(createError("PDF file is required.", 400));

  const hasPdfSignature = await assertPdfSignature(req.file.path);
  if (!hasPdfSignature) {
    fs.unlink(req.file.path, () => {});
    return next(createError("Uploaded file is not a valid PDF.", 400));
  }

  const book = await Book.findById(req.params.bookId);
  if (!book) return next(createError("Book not found.", 404));

  const nextOrder =
    req.body.order !== undefined
      ? Number(req.body.order)
      : (book.chapters.reduce((max, chapter) => Math.max(max, chapter.order), 0) || 0) + 1;

  book.chapters.push({
    title: req.body.title || path.parse(req.file.originalname).name,
    chapterTitle: req.body.chapterTitle || req.body.title || path.parse(req.file.originalname).name,
    order: nextOrder,
    chapterNumber: nextOrder,
    pdfStorageKey: req.file.path,
    isFree: nextOrder === 1,
    isPreview: nextOrder === 1,
    accessStatus: nextOrder === 1 ? "free" : "paid",
    price: req.body.price !== undefined ? Number(req.body.price) : 0.99,
  });

  await book.save();

  const chapter = book.chapters[book.chapters.length - 1];
  await logAdminAudit({
    admin: req.user,
    action: "chapter_pdf_uploaded",
    targetType: "book",
    targetId: book._id,
    req,
    metadata: {
      bookTitle: book.title,
      chapterId: chapter?._id,
      chapterTitle: chapter?.title,
      originalName: req.file.originalname,
      size: req.file.size,
    },
  });

  res.status(201).json({
    status: "success",
    message: "Chapter PDF uploaded successfully.",
    data: { book },
  });
});

const issueBookReadToken = catchAsync(async (req, res, next) => {
  const { bookId } = req.params;

  if (!mongoose.isValidObjectId(bookId)) {
    return next(createError("Book not found.", 404));
  }

  const book = await Book.findOne({
    isPublished: true,
    $or: [{ _id: bookId }, { "chapters._id": bookId }],
  });

  if (!book) return next(createError("Book not found.", 404));

  const chapter = book.chapters.id(bookId) || book.chapters[0];
  if (!chapter) return next(createError("Chapter not found.", 404));

  const isAdminPreview = req.user?.role === "admin";
  if (
    !isAdminPreview &&
    !isFreeChapter(book, chapter) &&
    !req.user.ownsChapter(book._id, chapter._id)
  ) {
    await logBookAccessDenied({
      req,
      book,
      chapter,
      reason: "book_read_token_without_purchase",
    });
    return next(createError("You do not own this chapter.", 403));
  }

  const readToken = signReadToken({
    userId: req.user._id,
    bookId: book._id,
    chapterId: chapter._id,
  });

  await logActivity({
    userId: req.user._id,
    type: "read_token_issued",
    email: req.user.email,
    req,
    metadata: { bookId: book._id, chapterId: chapter._id },
  });

  res.status(200).json({
    status: "success",
    expiresIn: process.env.READ_TOKEN_EXPIRES_IN || "2m",
    data: { readToken },
  });
});

const streamChapterPdf = catchAsync(async (req, res, next) => {
  const { bookId } = req.params;
  const previewOnly = req.route.path.endsWith("/preview");

  if (!mongoose.isValidObjectId(bookId)) {
    return next(createError("Book not found.", 404));
  }

  const book = await Book.findOne({
    isPublished: true,
    $or: [{ _id: bookId }, { "chapters._id": bookId }],
  });

  if (!book) return next(createError("Book not found.", 404));

  const chapter = book.chapters.id(bookId) || book.chapters[0];
  if (!chapter) return next(createError("Chapter not found.", 404));

  if (previewOnly && !isFreeChapter(book, chapter)) {
    await logBookAccessDenied({
      req,
      book,
      chapter,
      reason: "book_paid_chapter_preview_attempt",
    });
    return next(createError("This chapter is not available for preview.", 403));
  }

  const isAdminPreview = req.user?.role === "admin";

  if (
    !previewOnly &&
    !isAdminPreview &&
    !isFreeChapter(book, chapter) &&
    !req.user.ownsChapter(book._id, chapter._id)
  ) {
    await logBookAccessDenied({
      req,
      book,
      chapter,
      reason: "book_paid_chapter_without_purchase",
    });
    return next(createError("You do not own this chapter.", 403));
  }

  if (!previewOnly && !isFreeChapter(book, chapter)) {
    const tokenError = verifyRequiredReadToken(req, book._id, chapter._id);
    if (tokenError) return next(createError(tokenError, 403));
  }

  await withChapterPdfPath(chapter, async (masterPath) => {
    if (previewOnly || isFreeChapter(book, chapter) || isAdminPreview) {
      setSecurePdfHeaders(res, `preview_${chapter.title}.pdf`);
      const previewPdf = await buildPreviewWatermarkedPdf(masterPath, {
        bookTitle: book.title,
      });
      return res.status(200).send(Buffer.from(previewPdf));
    }

    const purchase = req.user.purchases.find(
      (p) =>
        p.bookId.toString() === book._id.toString() &&
        ((p.purchaseType || "book") === "book" ||
          (p.chapterIds || []).some((id) => id.toString() === chapter._id.toString()))
    );

    setSecurePdfHeaders(res, `${chapter.title}.pdf`);
    if (isR2StorageEnabled()) {
      const watermarkedPdf = await buildReaderWatermarkedPdf(
        masterPath,
        req.user._id.toString(),
        req.user.name,
        req.user.email,
        {
          bookTitle: book.title,
          invoiceNumber: purchase?.invoiceNumber,
        }
      );
      return res.status(200).send(Buffer.from(watermarkedPdf));
    }

    let watermarkedKey = purchase?.watermarkedPdfKey;
    if (!watermarkedKey || !watermarkedKey.includes("_v3_")) {
      watermarkedKey = await generateWatermarkedPdf(
        masterPath,
        req.user._id.toString(),
        req.user.name,
        req.user.email,
        {
          bookTitle: book.title,
          invoiceNumber: purchase?.invoiceNumber,
        }
      );

      await User.updateOne(
        { _id: req.user._id, "purchases.bookId": book._id },
        { $set: { "purchases.$.watermarkedPdfKey": watermarkedKey } }
      );
    }

    const pdfPath = path.resolve(
      process.env.PDF_STORAGE_PATH || "./uploads/pdfs",
      watermarkedKey
    );

    if (!fs.existsSync(pdfPath)) {
      const err = createError("Watermarked PDF file not found on server.", 500);
      throw err;
    }

    return fs.createReadStream(pdfPath).pipe(res);
  });
});

const streamR2ChapterPdf = catchAsync(async (req, res, next) => {
  const { bookId, chapterRef } = req.params;

  const book = await resolvePublishedBook(bookId);
  if (!book) return next(createError("Book not found.", 404));

  const chapter = resolveChapterByIdentifier(book, chapterRef);
  if (!chapter) return next(createError("Chapter not found.", 404));

  const r2Key = String(chapter.r2Key || "").trim();
  if (!r2Key) {
    return next(createError("Chapter PDF is not configured in R2.", 500));
  }

  const hasAccess = await userHasChapterAccess({
    user: req.user,
    book,
    chapter,
  });
  if (!hasAccess) {
    await logActivity({
      userId: req.user?._id,
      type: "suspicious_activity",
      email: req.user?.email,
      req,
      metadata: {
        reason: "unauthorized_r2_pdf_access",
        bookId: book._id,
        chapterId: chapter._id,
        chapterNumber: chapter.chapterNumber,
        chapterType: chapter.type || "chapter",
      },
    });
    return next(createError("You do not have access to this chapter.", 403));
  }

  let object;
  try {
    object = await getR2ObjectBuffer(r2Key);
  } catch (err) {
    const statusCode = err?.$metadata?.httpStatusCode;
    if (statusCode === 404 || err.name === "NoSuchKey") {
      return next(createError("PDF file not found in R2.", 404));
    }
    return next(createError("Could not fetch PDF from R2.", 502));
  }

  setSecurePdfHeaders(res, safePdfFilename(chapter.chapterTitle || chapter.title));
  if (object.contentLength) {
    res.setHeader("Content-Length", String(object.contentLength));
  }

  await logActivity({
    userId: req.user?._id,
    type: "chapter_opened",
    email: req.user?.email,
    req,
    metadata: {
      source: "r2_pdf_delivery",
      bookId: book._id,
      chapterId: chapter._id,
      chapterNumber: chapter.chapterNumber,
      chapterType: chapter.type || "chapter",
      accessType: isFreeChapter(book, chapter) || chapter.isFree ? "free" : "paid",
    },
  });

  return res.status(200).send(object.body);
});

const notifyBookUpload = catchAsync(async (req, res, next) => {
  const notifySecret = process.env.NOTIFY_UPLOAD_SECRET;
  const requestSecret = req.headers["x-notify-secret"];

  if (req.user?.role !== "admin" && (!notifySecret || requestSecret !== notifySecret)) {
    return next(createError("Not authorized to send upload notifications.", 403));
  }

  const { bookId } = req.params;
  const { chapterIds = [] } = req.body;

  if (!mongoose.isValidObjectId(bookId)) {
    return next(createError("Book not found.", 404));
  }

  const book = await Book.findOne({ _id: bookId, isPublished: true });
  if (!book) return next(createError("Book not found.", 404));

  const chapters = chapterIds.length
    ? book.chapters.filter((chapter) =>
        chapterIds.some((id) => id.toString() === chapter._id.toString())
      )
    : book.chapters;

  const users = await User.find({
    isActive: true,
    isEmailVerified: true,
    "emailPreferences.bookUpdates": { $ne: false },
  }).select("name email emailPreferences +unsubscribeToken");

  const results = await Promise.allSettled(
    users.map(async (user) => {
      if (!user.unsubscribeToken) {
        user.unsubscribeToken = crypto.randomBytes(32).toString("hex");
        await user.save({ validateBeforeSave: false });
      }

      return sendEmail({
        to: user.email,
        type: "upload_notification",
        userId: user._id,
        metadata: { bookId: book._id, chapterIds },
        ...emailTemplates.bookUploadNotification(
          user.name,
          book,
          chapters,
          user.unsubscribeToken
        ),
      });
    })
  );

  await createManyNotifications(
    users.map((user) => ({
      userId: user._id,
      type: "book_update",
      title: "New book update",
      message: `${book.title} has new content available.`,
      link: `/books/${book._id}`,
      metadata: { bookId: book._id, chapterIds },
    }))
  );

  const sent = results.filter((result) => result.status === "fulfilled").length;
  const failed = results.length - sent;

  res.status(200).json({
    status: "success",
    message: "Upload notification job finished.",
    data: { recipients: users.length, sent, failed },
  });
});

const listReviews = catchAsync(async (req, res, next) => {
  const book = await resolvePublishedBook(req.params.bookId);
  if (!book) return next(createError("Book not found.", 404));

  const reviews = await Review.find({
    bookId: book._id,
    status: "published",
  })
    .populate("userId", "name")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: { reviews },
  });
});

const upsertReview = catchAsync(async (req, res, next) => {
  const rating = Number(req.body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return next(createError("Rating must be a whole number from 1 to 5.", 400));
  }

  const book = await resolvePublishedBook(req.params.bookId);
  if (!book) return next(createError("Book not found.", 404));
  const review = await Review.findOneAndUpdate(
    { userId: req.user._id, bookId: book._id },
    {
      rating,
      title: req.body.title,
      comment: req.body.comment,
      status: "published",
    },
    { new: true, upsert: true, runValidators: true }
  );

  const [ratingStats] = await Review.aggregate([
    { $match: { bookId: book._id, status: "published" } },
    { $group: { _id: "$bookId", average: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  book.ratingAverage = ratingStats ? Number(ratingStats.average.toFixed(2)) : 0;
  book.ratingCount = ratingStats?.count || 0;
  await book.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "Review saved successfully.",
    data: { review },
  });
});

module.exports = {
  listBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  addChapterPdf,
  issueBookReadToken,
  streamR2ChapterPdf,
  streamChapterPdf,
  notifyBookUpload,
  listReviews,
  upsertReview,
};

const mongoose = require("mongoose");
const Book = require("../models/Book");
const DiscussionThread = require("../models/DiscussionThread");
const { catchAsync, createError } = require("../middleware/errorMiddleware");
const { logActivity } = require("../utils/activityLogger");

const cleanText = (value) => String(value || "").trim();

const ensureBookAndChapter = async (bookId, chapterId) => {
  if (!mongoose.isValidObjectId(bookId)) {
    throw Object.assign(new Error("Book not found."), { statusCode: 404 });
  }

  const book = await Book.findOne({ _id: bookId, isPublished: true });
  if (!book) throw Object.assign(new Error("Book not found."), { statusCode: 404 });

  if (chapterId && !book.chapters.id(chapterId)) {
    throw Object.assign(new Error("Chapter not found."), { statusCode: 404 });
  }

  return book;
};

const listBookThreads = catchAsync(async (req, res, next) => {
  const { bookId } = req.params;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;

  try {
    await ensureBookAndChapter(bookId, req.query.chapterId);
  } catch (err) {
    return next(createError(err.message, err.statusCode || 500));
  }

  const filter = { bookId, status: "published" };
  if (req.query.chapterId) filter.chapterId = req.query.chapterId;

  const [threads, total] = await Promise.all([
    DiscussionThread.find(filter)
      .populate("userId", "name")
      .populate("replies.userId", "name")
      .sort({ lastReplyAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    DiscussionThread.countDocuments(filter),
  ]);

  res.status(200).json({
    status: "success",
    results: threads.length,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    data: { threads },
  });
});

const createThread = catchAsync(async (req, res, next) => {
  const { bookId } = req.params;
  const title = cleanText(req.body.title);
  const message = cleanText(req.body.message);
  const chapterId = req.body.chapterId;

  if (title.length < 5) {
    return next(createError("Thread title must be at least 5 characters.", 400));
  }
  if (message.length < 10) {
    return next(createError("Thread message must be at least 10 characters.", 400));
  }

  try {
    await ensureBookAndChapter(bookId, chapterId);
  } catch (err) {
    return next(createError(err.message, err.statusCode || 500));
  }

  const thread = await DiscussionThread.create({
    bookId,
    chapterId,
    userId: req.user._id,
    title,
    message,
    lastReplyAt: new Date(),
  });

  await logActivity({
    userId: req.user._id,
    type: "thread_created",
    email: req.user.email,
    req,
    metadata: { threadId: thread._id, bookId, chapterId },
  });

  res.status(201).json({
    status: "success",
    message: "Discussion thread created.",
    data: { thread },
  });
});

const replyToThread = catchAsync(async (req, res, next) => {
  const message = cleanText(req.body.message);
  if (message.length < 2) {
    return next(createError("Reply message is required.", 400));
  }
  if (!mongoose.isValidObjectId(req.params.threadId)) {
    return next(createError("Discussion thread not found.", 404));
  }

  const thread = await DiscussionThread.findOne({
    _id: req.params.threadId,
    status: { $ne: "hidden" },
  });

  if (!thread) return next(createError("Discussion thread not found.", 404));
  if (thread.status === "locked") {
    return next(createError("This discussion thread is locked.", 400));
  }

  thread.replies.push({
    userId: req.user._id,
    message,
  });
  thread.lastReplyAt = new Date();
  await thread.save();

  await logActivity({
    userId: req.user._id,
    type: "thread_replied",
    email: req.user.email,
    req,
    metadata: { threadId: thread._id, bookId: thread.bookId },
  });

  res.status(200).json({
    status: "success",
    message: "Reply added.",
    data: { thread },
  });
});

const toggleThreadLike = catchAsync(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.threadId)) {
    return next(createError("Discussion thread not found.", 404));
  }

  const thread = await DiscussionThread.findOne({
    _id: req.params.threadId,
    status: "published",
  });
  if (!thread) return next(createError("Discussion thread not found.", 404));

  const userId = req.user._id.toString();
  const alreadyLiked = thread.likes.some((id) => id.toString() === userId);
  if (alreadyLiked) {
    thread.likes = thread.likes.filter((id) => id.toString() !== userId);
  } else {
    thread.likes.push(req.user._id);
  }
  await thread.save();

  await logActivity({
    userId: req.user._id,
    type: "thread_liked",
    email: req.user.email,
    req,
    metadata: { threadId: thread._id, liked: !alreadyLiked },
  });

  res.status(200).json({
    status: "success",
    data: { liked: !alreadyLiked, likes: thread.likes.length },
  });
});

const listAllThreads = catchAsync(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);
  const skip = (page - 1) * limit;
  const filter = {};

  if (req.query.bookId) filter.bookId = req.query.bookId;
  if (req.query.userId) filter.userId = req.query.userId;
  if (req.query.status) filter.status = req.query.status;

  const [threads, total] = await Promise.all([
    DiscussionThread.find(filter)
      .populate("userId", "name email")
      .populate("bookId", "title slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    DiscussionThread.countDocuments(filter),
  ]);

  res.status(200).json({
    status: "success",
    results: threads.length,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    data: { threads },
  });
});

const moderateThread = catchAsync(async (req, res, next) => {
  const { status, reason } = req.body;

  if (!["published", "hidden", "locked"].includes(status)) {
    return next(createError("Status must be published, hidden, or locked.", 400));
  }
  if (!mongoose.isValidObjectId(req.params.threadId)) {
    return next(createError("Discussion thread not found.", 404));
  }

  const thread = await DiscussionThread.findById(req.params.threadId);
  if (!thread) return next(createError("Discussion thread not found.", 404));

  thread.status = status;
  thread.hiddenReason = status === "hidden" ? cleanText(reason) : undefined;
  thread.hiddenBy = status === "hidden" ? req.user._id : undefined;
  thread.hiddenAt = status === "hidden" ? new Date() : undefined;
  await thread.save();

  await logActivity({
    userId: req.user._id,
    type: "thread_moderated",
    email: req.user.email,
    req,
    metadata: { threadId: thread._id, status },
  });

  res.status(200).json({
    status: "success",
    message: "Discussion thread updated.",
    data: { thread },
  });
});

module.exports = {
  listBookThreads,
  createThread,
  replyToThread,
  toggleThreadLike,
  listAllThreads,
  moderateThread,
};

const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/bookController");
const {
  listBookThreads,
  createThread,
  replyToThread,
  toggleThreadLike,
} = require("../controllers/threadController");
const { protect, protectAdmin } = require("../middleware/authMiddleware");
const { optionalProtect } = require("../middleware/authMiddleware");
const { pdfUpload } = require("../middleware/uploadMiddleware");
const { validateRequest, rules } = require("../middleware/validateRequest");

const bookIdParam = validateRequest({ params: { bookId: rules.slugOrObjectId() } });
const threadIdParam = validateRequest({ params: { threadId: rules.objectId() } });

router.post("/", protectAdmin, createBook);
router.get("/", listBooks);
router.patch("/:bookId", protectAdmin, bookIdParam, updateBook);
router.delete("/:bookId", protectAdmin, bookIdParam, deleteBook);
router.post("/:bookId/chapters/pdf", protectAdmin, bookIdParam, pdfUpload.single("pdf"), addChapterPdf);
router.get("/:bookId/reviews", bookIdParam, listReviews);
router.post("/:bookId/reviews", protect, bookIdParam, upsertReview);
router.get("/:bookId/threads", bookIdParam, listBookThreads);
router.post("/:bookId/threads", protect, bookIdParam, createThread);
router.post("/threads/:threadId/replies", protect, threadIdParam, replyToThread);
router.patch("/threads/:threadId/like", protect, threadIdParam, toggleThreadLike);
router.get("/:bookId/preview", protect, bookIdParam, streamChapterPdf);
router.get(
  "/:bookId/chapters/:chapterRef/r2-pdf",
  optionalProtect,
  validateRequest({
    params: {
      bookId: rules.slugOrObjectId(),
      chapterRef: rules.chapterId(),
    },
  }),
  streamR2ChapterPdf
);
router.post("/:bookId/read-token", protect, bookIdParam, issueBookReadToken);
router.get("/:bookId/read", protect, bookIdParam, streamChapterPdf);
router.post("/:bookId/notify-upload", bookIdParam, notifyBookUpload);
router.get("/:bookId", bookIdParam, getBook);

module.exports = router;

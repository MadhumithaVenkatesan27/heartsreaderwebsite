const express = require("express");
const router = express.Router();
const {
  getMyLibrary,
  readChapter,
  readPreviewChapter,
  purchaseBook,
  createPaymentIntent,
  confirmDigitalPayment,
  createRazorpayOrder,
  confirmRazorpayPayment,
  requestRefund,
  getMyRefunds,
  downloadMyInvoice,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getReadingProgress,
  saveReadingProgress,
  issueReadToken,
  getPaymentConfig,
} = require("../controllers/libraryController");
const { optionalProtect, protect } = require("../middleware/authMiddleware");
const { validateRequest, rules } = require("../middleware/validateRequest");

const razorpayOrderId = (value) =>
  /^order_[A-Za-z0-9]{8,64}$/.test(String(value || ""))
    ? null
    : "Invalid Razorpay order id.";
const razorpayPaymentId = (value) =>
  /^pay_[A-Za-z0-9]{8,64}$/.test(String(value || ""))
    ? null
    : "Invalid Razorpay payment id.";
const razorpaySignature = (value) =>
  /^[a-f0-9]{64}$/i.test(String(value || ""))
    ? null
    : "Invalid Razorpay signature.";

const rejectUnexpectedBodyFields = (allowed) => (req, res, next) => {
  const extras = Object.keys(req.body || {}).filter((key) => !allowed.includes(key));
  if (extras.length) {
    return res.status(400).json({
      status: "error",
      message: "Unexpected payment callback fields.",
    });
  }
  return next();
};

router.get("/", protect, getMyLibrary);
router.get("/payment-config", getPaymentConfig);
router.get("/refunds", protect, getMyRefunds);
router.get("/wishlist", protect, getWishlist);
router.get("/progress", protect, getReadingProgress);
router.post(
  "/:bookId/payment-intent",
  protect,
  validateRequest({
    params: { bookId: rules.slugOrObjectId() },
    body: {
      chapterId: rules.chapterId({ required: false }),
      currency: rules.currency(),
    },
  }),
  createPaymentIntent
);
router.post(
  "/:bookId/confirm-payment",
  protect,
  rejectUnexpectedBodyFields(["paymentIntentId"]),
  validateRequest({
    params: { bookId: rules.slugOrObjectId() },
    body: {
      paymentIntentId: rules.string({ min: 10, max: 120, required: true }),
    },
  }),
  confirmDigitalPayment
);
router.post(
  "/:bookId/razorpay-order",
  protect,
  validateRequest({
    params: { bookId: rules.slugOrObjectId() },
    body: {
      chapterId: rules.chapterId({ required: false }),
      currency: rules.enum(["INR", "inr"], { required: false }),
    },
  }),
  createRazorpayOrder
);
router.post(
  "/:bookId/confirm-razorpay",
  protect,
  rejectUnexpectedBodyFields([
    "razorpay_order_id",
    "razorpay_payment_id",
    "razorpay_signature",
  ]),
  validateRequest({
    params: { bookId: rules.slugOrObjectId() },
    body: {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    },
  }),
  confirmRazorpayPayment
);
router.post(
  "/:bookId/purchase",
  protect,
  validateRequest({
    params: { bookId: rules.slugOrObjectId() },
    body: {
      chapterId: rules.chapterId({ required: false }),
      amount: rules.number({ min: 0.5, max: 1000 }),
      currency: rules.currency(),
      stripePaymentIntentId: rules.string({ min: 10, max: 120 }),
    },
  }),
  purchaseBook
);
router.get(
  "/purchases/:purchaseId/invoice.pdf",
  protect,
  validateRequest({ params: { purchaseId: rules.objectId() } }),
  downloadMyInvoice
);
router.post(
  "/purchases/:purchaseId/refund",
  protect,
  validateRequest({
    params: { purchaseId: rules.objectId() },
    body: {
      issueType: rules.enum(
        [
          "duplicate_charge",
          "charged_no_access",
          "wrong_amount",
          "network_payment_issue",
          "payment_gateway_issue",
        ],
        { required: true }
      ),
      reason: rules.string({ min: 10, max: 1000, required: true }),
    },
  }),
  requestRefund
);
router.post("/:bookId/wishlist", protect, validateRequest({ params: { bookId: rules.slugOrObjectId() } }), addToWishlist);
router.delete("/:bookId/wishlist", protect, validateRequest({ params: { bookId: rules.slugOrObjectId() } }), removeFromWishlist);
router.patch(
  "/:bookId/progress/:chapterId",
  protect,
  validateRequest({
    params: { bookId: rules.slugOrObjectId(), chapterId: rules.chapterId() },
    body: {
      page: rules.number({ min: 0, max: 100000 }),
      percentage: rules.number({ min: 0, max: 100 }),
      progressPercent: rules.number({ min: 0, max: 100 }),
      position: rules.number({ min: 0, max: 100000 }),
    },
  }),
  saveReadingProgress
);
router.post(
  "/:bookId/read-token/:chapterId",
  protect,
  validateRequest({ params: { bookId: rules.slugOrObjectId(), chapterId: rules.chapterId() } }),
  issueReadToken
);
router.get(
  "/:bookId/read/:chapterId",
  protect,
  validateRequest({
    params: { bookId: rules.slugOrObjectId(), chapterId: rules.chapterId() },
    query: { readToken: rules.string({ min: 20, max: 512 }), token: rules.string({ min: 20, max: 512 }) },
  }),
  readChapter
);
router.get(
  "/:bookId/preview/:chapterId",
  optionalProtect,
  validateRequest({ params: { bookId: rules.slugOrObjectId(), chapterId: rules.chapterId() } }),
  readPreviewChapter
);

module.exports = router;

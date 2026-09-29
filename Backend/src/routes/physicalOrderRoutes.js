const express = require("express");
const {
  createPhysicalOrder,
  createPhysicalOrderPaymentIntent,
  confirmPhysicalOrderPayment,
  createPhysicalOrderRazorpayOrder,
  confirmPhysicalOrderRazorpayPayment,
  getMyPhysicalOrders,
} = require("../controllers/physicalOrderController");
const { protect } = require("../middleware/authMiddleware");
const {
  validateRequest,
  rules,
  validatePhysicalItems,
  validateShippingAddress,
} = require("../middleware/validateRequest");

const router = express.Router();

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

router.use(protect);

router.get("/", getMyPhysicalOrders);
router.post(
  "/payment-intent",
  validateRequest({
    body: {
      items: validatePhysicalItems,
      shippingAddress: validateShippingAddress,
      currency: rules.currency(),
      notes: rules.string({ max: 1000 }),
    },
  }),
  createPhysicalOrderPaymentIntent
);
router.post(
  "/confirm-payment",
  rejectUnexpectedBodyFields(["paymentIntentId"]),
  validateRequest({
    body: {
      paymentIntentId: rules.string({ min: 8, max: 120, required: true }),
    },
  }),
  confirmPhysicalOrderPayment
);
router.post(
  "/razorpay-order",
  validateRequest({
    body: {
      items: validatePhysicalItems,
      shippingAddress: validateShippingAddress,
      currency: rules.currency(),
      notes: rules.string({ max: 1000 }),
    },
  }),
  createPhysicalOrderRazorpayOrder
);
router.post(
  "/confirm-razorpay",
  rejectUnexpectedBodyFields([
    "razorpay_order_id",
    "razorpay_payment_id",
    "razorpay_signature",
  ]),
  validateRequest({
    body: {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    },
  }),
  confirmPhysicalOrderRazorpayPayment
);
router.post(
  "/",
  validateRequest({
    body: {
      items: validatePhysicalItems,
      shippingAddress: validateShippingAddress,
      currency: rules.currency(),
      paymentProvider: rules.string({ max: 40 }),
      notes: rules.string({ max: 1000 }),
    },
  }),
  createPhysicalOrder
);

module.exports = router;

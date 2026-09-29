const express = require("express");
const {
  handleStripeWebhook,
  handleRazorpayWebhook,
} = require("../controllers/webhookController");

const router = express.Router();

router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

router.post(
  "/razorpay",
  express.raw({ type: "application/json" }),
  handleRazorpayWebhook
);

module.exports = router;

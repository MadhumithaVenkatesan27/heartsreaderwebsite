const express = require("express");
const {
  getPlans,
  getCatalog,
  subscribe,
  getCredits,
  redeem,
  carryForward,
  dashboard,
  dashboardPicks,
} = require("../controllers/subscriptionController");
const { protect } = require("../middleware/authMiddleware");
const { validateRequest, rules, validateShippingAddress } = require("../middleware/validateRequest");

const router = express.Router();

router.get("/plans", getPlans);
router.get("/catalog", getCatalog);
router.post(
  "/subscribe",
  protect,
  validateRequest({
    body: {
      planId: rules.string({ min: 2, max: 80 }),
      plan_id: rules.string({ min: 2, max: 80 }),
      billingCycle: rules.enum(["monthly", "annual"], { required: false }),
      billing_cycle: rules.enum(["monthly", "annual"], { required: false }),
      shippingAddress: validateShippingAddress,
    },
  }),
  subscribe,
);
router.get("/credits", protect, getCredits);
router.post(
  "/credits/redeem",
  protect,
  validateRequest({
    body: {
      titleId: rules.string({ min: 2, max: 120 }),
      title_id: rules.string({ min: 2, max: 120 }),
    },
  }),
  redeem,
);
router.post("/credits/carry-forward", protect, carryForward);
router.get("/dashboard", protect, dashboard);
router.get("/dashboard/picks", protect, dashboardPicks);

module.exports = router;

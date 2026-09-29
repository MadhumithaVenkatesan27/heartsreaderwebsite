const express = require("express");
const {
  adminListPlans,
  adminUpsertPlan,
  adminListCatalog,
  adminUpsertCatalogTitle,
  adminListSubscriptions,
  adminListMembers,
  adminUpdateSubscription,
  adminListOrders,
  adminUpdateOrder,
} = require("../controllers/subscriptionController");
const { protectAdmin } = require("../middleware/authMiddleware");
const { validateRequest, rules } = require("../middleware/validateRequest");

const router = express.Router();

router.use(protectAdmin);

router.get("/plans", adminListPlans);
router.put("/plans/:planId", validateRequest({ params: { planId: rules.string({ min: 2, max: 80 }) } }), adminUpsertPlan);
router.post("/plans", adminUpsertPlan);
router.get("/catalog", adminListCatalog);
router.put("/catalog/:titleId", validateRequest({ params: { titleId: rules.string({ min: 2, max: 120 }) } }), adminUpsertCatalogTitle);
router.post("/catalog", adminUpsertCatalogTitle);
router.get("/subscriptions", adminListSubscriptions);
router.get("/members", adminListMembers);
router.patch(
  "/subscriptions/:subscriptionId",
  validateRequest({ params: { subscriptionId: rules.objectId() }, body: { status: rules.string({ max: 40 }) } }),
  adminUpdateSubscription,
);
router.get("/orders", adminListOrders);
router.patch(
  "/orders/:orderId",
  validateRequest({ params: { orderId: rules.objectId() }, body: { status: rules.enum(["pending", "processing", "shipped", "delivered", "cancelled"], { required: false }) } }),
  adminUpdateOrder,
);

module.exports = router;

const express = require("express");
const {
  getStats,
  getDashboard,
  listAdminAuditLogs,
  getAdminHealth,
  getSystemSecurityCheck,
  getDatabaseStatus,
  createMissingIndexes,
  auditDatabase,
  repairDatabase,
  cleanupExpiredAuthTokens,
  listUsers,
  getUser,
  createLicensorUser,
  updateUserStatus,
  updateUserRole,
  updateUserLicensorBooks,
  listActivities,
  listSecurityEvents,
  listEmailLogs,
  listPurchases,
  downloadPurchaseInvoice,
  listBooksForAdmin,
  listBookAccess,
  listRefunds,
  setRefundStatus,
  listPhysicalOrders,
  getPhysicalOrderCleanupReportForAdmin,
  updatePhysicalOrderStatus,
  listCampaignPledges,
  listCampaignBackers,
  updateCampaignPledgeStatus,
  refundFailedCampaignPledges,
  listSupportTickets,
  getSupportTicket,
  updateSupportTicketStatus,
  replyToSupportTicket,
} = require("../controllers/adminController");
const {
  listAllThreads,
  moderateThread,
} = require("../controllers/threadController");
const { notifyBookUpload } = require("../controllers/bookController");
const { protectAdmin } = require("../middleware/authMiddleware");
const { validateRequest, rules } = require("../middleware/validateRequest");

const router = express.Router();

const bookIdsArray = (value) => {
  if (value === undefined) return null;
  if (!Array.isArray(value)) return "bookIds must be an array.";
  if (value.length > 100) return "bookIds cannot exceed 100 items.";
  return value.every((id) => /^[a-f\d]{24}$/i.test(String(id)))
    ? null
    : "One or more book IDs are invalid.";
};

const licensorIdRule = rules.string({ min: 6, max: 44 });

router.use(protectAdmin);

router.get("/stats", getStats);
router.get("/dashboard", getDashboard);
router.get("/health", getAdminHealth);
router.get("/audit-logs", listAdminAuditLogs);
router.get("/system-check", getSystemSecurityCheck);
router.get("/database", getDatabaseStatus);
router.post("/database/indexes", createMissingIndexes);
router.get("/database/audit", auditDatabase);
router.post("/database/repair", repairDatabase);
router.post("/cleanup", cleanupExpiredAuthTokens);

router.get("/users", listUsers);
router.post(
  "/licensors",
  validateRequest({
    body: {
      name: rules.string({ min: 2, max: 100, required: true }),
      email: rules.email({ required: true }),
      password: rules.string({ min: 8, max: 72, required: true }),
      licensorId: licensorIdRule,
      bookIds: bookIdsArray,
    },
  }),
  createLicensorUser
);
router.get("/users/:userId", validateRequest({ params: { userId: rules.objectId() } }), getUser);
router.patch(
  "/users/:userId/status",
  validateRequest({
    params: { userId: rules.objectId() },
    body: { status: rules.enum(["active", "blocked", "deleted"], { required: true }) },
  }),
  updateUserStatus
);
router.patch(
  "/users/:userId/role",
  validateRequest({
    params: { userId: rules.objectId() },
    body: { role: rules.enum(["user", "admin", "licensor"], { required: true }) },
  }),
  updateUserRole
);
router.patch(
  "/users/:userId/licensor-books",
  validateRequest({
    params: { userId: rules.objectId() },
    body: { licensorId: licensorIdRule, bookIds: bookIdsArray },
  }),
  updateUserLicensorBooks
);

router.get("/activities", listActivities);
router.get("/security-events", listSecurityEvents);
router.get("/emails", listEmailLogs);
router.get("/books", listBooksForAdmin);
router.post("/books/:bookId/notify-upload", validateRequest({ params: { bookId: rules.objectId() } }), notifyBookUpload);
router.get("/purchases", listPurchases);
router.get("/purchases/:purchaseId/invoice.pdf", validateRequest({ params: { purchaseId: rules.objectId() } }), downloadPurchaseInvoice);
router.get("/access", listBookAccess);
router.get("/refunds", listRefunds);
router.patch(
  "/refunds/:refundId/status",
  validateRequest({
    params: { refundId: rules.objectId() },
    body: {
      status: rules.enum(["approved", "rejected", "processed"], { required: true }),
      adminNote: rules.string({ max: 1000 }),
      paymentRefundId: rules.string({ max: 120 }),
    },
  }),
  setRefundStatus
);
router.get("/physical-orders", listPhysicalOrders);
router.get(
  "/physical-orders/cleanup-report",
  validateRequest({ query: { limit: rules.number({ min: 1, max: 100 }) } }),
  getPhysicalOrderCleanupReportForAdmin
);
router.patch(
  "/physical-orders/:orderId",
  validateRequest({
    params: { orderId: rules.objectId() },
    body: {
      paymentStatus: rules.enum(["pending", "paid", "failed", "refunded"]),
      fulfillmentStatus: rules.enum(["received", "processing", "packed", "shipped", "delivered", "cancelled"]),
      orderStatus: rules.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
      paymentReference: rules.string({ max: 120 }),
      trackingNumber: rules.string({ max: 120 }),
      shippedDate: rules.string({ max: 40 }),
      deliveredDate: rules.string({ max: 40 }),
      notes: rules.string({ max: 1000 }),
    },
  }),
  updatePhysicalOrderStatus
);
router.get("/campaign-pledges", listCampaignPledges);
router.get("/campaign-backers", listCampaignBackers);
router.post(
  "/campaign-pledges/refund-failed",
  validateRequest({
    body: {
      campaignSlug: rules.slugOrObjectId({ required: false }),
      reason: rules.string({ min: 5, max: 1000 }),
    },
  }),
  refundFailedCampaignPledges
);
router.patch(
  "/campaign-pledges/:pledgeId",
  validateRequest({
    params: { pledgeId: rules.objectId() },
    body: {
      paymentStatus: rules.enum(["pending", "paid", "failed", "cancelled", "refunded"]),
      fulfillmentStatus: rules.enum(["pledged", "digital_granted", "production", "packed", "shipped", "delivered", "cancelled"]),
      paymentReference: rules.string({ max: 120 }),
      notes: rules.string({ max: 1000 }),
    },
  }),
  updateCampaignPledgeStatus
);

router.get("/support/tickets", listSupportTickets);
router.get("/support/tickets/:ticketId", validateRequest({ params: { ticketId: rules.objectId() } }), getSupportTicket);
router.patch(
  "/support/tickets/:ticketId",
  validateRequest({
    params: { ticketId: rules.objectId() },
    body: {
      status: rules.enum(["open", "pending", "resolved", "closed"]),
      priority: rules.enum(["low", "normal", "high", "urgent"]),
      assignedTo: rules.objectId({ required: false }),
    },
  }),
  updateSupportTicketStatus
);
router.post(
  "/support/tickets/:ticketId/replies",
  validateRequest({
    params: { ticketId: rules.objectId() },
    body: {
      message: rules.string({ min: 2, max: 5000, required: true }),
      status: rules.enum(["open", "pending", "resolved", "closed"]),
    },
  }),
  replyToSupportTicket
);

router.get("/threads", listAllThreads);
router.patch(
  "/threads/:threadId",
  validateRequest({
    params: { threadId: rules.objectId() },
    body: {
      status: rules.enum(["published", "hidden", "locked"], { required: true }),
      reason: rules.string({ max: 1000 }),
    },
  }),
  moderateThread
);

module.exports = router;

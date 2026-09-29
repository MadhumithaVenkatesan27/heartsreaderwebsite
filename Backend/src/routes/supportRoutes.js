const express = require("express");
const {
  createTicket,
  listMyTickets,
  getMyTicket,
  replyToMyTicket,
} = require("../controllers/supportController");
const { protect } = require("../middleware/authMiddleware");
const { validateRequest, rules } = require("../middleware/validateRequest");

const router = express.Router();

router.use(protect);

router.post(
  "/tickets",
  validateRequest({
    body: {
      subject: rules.string({ min: 5, max: 160, required: true }),
      message: rules.string({ min: 10, max: 5000, required: true }),
      category: rules.enum(["billing", "technical", "content", "account", "other"]),
      priority: rules.enum(["low", "normal", "high", "urgent"]),
    },
  }),
  createTicket
);
router.get("/tickets", listMyTickets);
router.get(
  "/tickets/:ticketId",
  validateRequest({ params: { ticketId: rules.objectId() } }),
  getMyTicket
);
router.post(
  "/tickets/:ticketId/replies",
  validateRequest({
    params: { ticketId: rules.objectId() },
    body: { message: rules.string({ min: 2, max: 5000, required: true }) },
  }),
  replyToMyTicket
);

module.exports = router;

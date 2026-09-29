const express = require("express");
const {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");
const { validateRequest, rules } = require("../middleware/validateRequest");

const router = express.Router();

router.use(protect);

router.get("/", listNotifications);
router.patch("/read-all", markAllNotificationsRead);
router.patch(
  "/:notificationId/read",
  validateRequest({ params: { notificationId: rules.objectId() } }),
  markNotificationRead
);

module.exports = router;

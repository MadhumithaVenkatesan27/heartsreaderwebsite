const Notification = require("../models/Notification");
const { catchAsync } = require("../middleware/errorMiddleware");
const { emitToUser } = require("../services/socketService");

const listNotifications = catchAsync(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);
  const skip = (page - 1) * limit;
  const filter = { userId: req.user._id };

  if (req.query.unread === "true") filter.isRead = false;
  if (req.query.type) filter.type = req.query.type;

  const [notifications, total, unread] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId: req.user._id, isRead: false }),
  ]);

  res.status(200).json({
    status: "success",
    results: notifications.length,
    unread,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    data: { notifications },
  });
});

const markNotificationRead = catchAsync(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.notificationId, userId: req.user._id },
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    data: { notification },
  });

  if (notification) {
    emitToUser(req.user._id, "notification:read", {
      notificationId: notification._id,
      readAt: notification.readAt,
    });
  }
});

const markAllNotificationsRead = catchAsync(async (req, res) => {
  const result = await Notification.updateMany(
    { userId: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.status(200).json({
    status: "success",
    message: "Notifications marked as read.",
    data: { modified: result.modifiedCount },
  });

  emitToUser(req.user._id, "notification:read_all", {
    readAt: new Date(),
    modified: result.modifiedCount,
  });
});

module.exports = {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};

const Notification = require("../models/Notification");
const { emitToUser } = require("./socketService");

const emitNotification = (notification) => {
  if (!notification) return;
  emitToUser(notification.userId, "notification:new", {
    notification,
  });
};

const createNotification = async ({
  userId,
  title,
  message,
  type = "general",
  link,
  metadata,
}) => {
  if (!userId) return null;

  const notification = await Notification.create({
    userId,
    title,
    message,
    type,
    link,
    metadata,
  });

  emitNotification(notification);
  return notification;
};

const createManyNotifications = async (notifications = []) => {
  const valid = notifications.filter((item) => item.userId && item.title && item.message);
  if (!valid.length) return [];
  const created = await Notification.insertMany(valid, { ordered: false });
  created.forEach(emitNotification);
  return created;
};

module.exports = {
  createNotification,
  createManyNotifications,
};

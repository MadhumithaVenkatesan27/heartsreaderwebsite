const UserActivity = require("../models/UserActivity");

const logActivity = async ({
  userId,
  type,
  email,
  req,
  metadata,
}) => {
  try {
    await UserActivity.create({
      userId,
      type,
      email,
      ipAddress: req?.ip,
      userAgent: req?.get?.("user-agent"),
      metadata,
    });
  } catch (err) {
    console.error("Activity log failed:", err.message);
  }
};

module.exports = { logActivity };

const AdminAuditLog = require("../models/AdminAuditLog");

const logAdminAudit = async ({
  admin,
  action,
  targetType,
  targetId,
  status = "success",
  req,
  metadata,
}) => {
  try {
    await AdminAuditLog.create({
      adminId: admin?._id,
      adminEmail: admin?.email,
      action,
      targetType,
      targetId,
      status,
      ipAddress: req?.ip,
      userAgent: req?.get?.("user-agent"),
      metadata,
    });
  } catch (err) {
    console.error("Admin audit log failed:", err.message);
  }
};

module.exports = { logAdminAudit };

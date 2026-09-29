const User = require("../models/User");
const Licensor = require("../models/Licensor");
const { verifyAccessToken } = require("../utils/jwt");
const { logActivity } = require("../utils/activityLogger");

const getClientIp = (req) =>
  String(req.ip || req.socket?.remoteAddress || "")
    .replace(/^::ffff:/, "")
    .trim();

const isIpAllowed = (req) => {
  const allowlist = String(process.env.ADMIN_IP_ALLOWLIST || "")
    .split(",")
    .map((ip) => ip.trim())
    .filter(Boolean);

  if (!allowlist.length) return true;

  const clientIp = getClientIp(req);
  return allowlist.includes(clientIp);
};

// ── protect: verifies short-lived access token ────────────────────────────
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ status: "error", message: "Not authenticated. Please log in." });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ status: "error", message: "Not authenticated. Please log in." });
    }

    const decoded = verifyAccessToken(token, "user");

    const user = await User.findById(decoded.id).select("+passwordChangedAt");
    if (!user) {
      return res.status(401).json({ status: "error", message: "User no longer exists." });
    }
    if (!user.isActive || user.status !== "active") {
      return res.status(403).json({ status: "error", message: "Account has been deactivated. Contact support." });
    }

    // Reject tokens issued before the last password change
    if (user.passwordChangedAfter && user.passwordChangedAfter(decoded.iat)) {
      return res.status(401).json({ status: "error", message: "Password was changed. Please log in again." });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        message: "Session expired. Please refresh your token.",
        code: "TOKEN_EXPIRED",
      });
    }
    return res.status(401).json({ status: "error", message: "Invalid token. Please log in again." });
  }
};

// ── protectAdmin: user must be active + admin ─────────────────────────────
const protectAdmin = async (req, res, next) => {
  await protect(req, res, () => {
    if (req.user.role !== "admin") {
      logActivity({
        userId: req.user._id,
        type: "suspicious_activity",
        email: req.user.email,
        req,
        metadata: {
          reason: "admin_route_forbidden_non_admin",
          path: req.originalUrl,
          role: req.user.role,
        },
      });
      return res.status(403).json({ status: "error", message: "Admin access only." });
    }
    if (!isIpAllowed(req)) {
      logActivity({
        userId: req.user._id,
        type: "suspicious_activity",
        email: req.user.email,
        req,
        metadata: {
          reason: "admin_route_ip_not_allowed",
          path: req.originalUrl,
        },
      });
      return res.status(403).json({
        status: "error",
        message: "This network is not allowed to access admin tools.",
        code: "ADMIN_IP_NOT_ALLOWED",
      });
    }
    if (
      process.env.ADMIN_2FA_REQUIRED === "true" &&
      !req.user.twoFactorEnabled
    ) {
      logActivity({
        userId: req.user._id,
        type: "suspicious_activity",
        email: req.user.email,
        req,
        metadata: {
          reason: "admin_2fa_required",
          path: req.originalUrl,
        },
      });
      return res.status(403).json({
        status: "error",
        message: "Admin two-factor authentication must be enabled before accessing admin tools.",
        code: "ADMIN_2FA_REQUIRED",
      });
    }
    next();
  });
};

const optionalProtect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) return next();

    const token = authHeader.split(" ")[1];
    if (!token) return next();

    const decoded = verifyAccessToken(token, "user");
    const user = await User.findById(decoded.id).select("+passwordChangedAt");
    if (
      !user ||
      !user.isActive ||
      user.status !== "active" ||
      (user.passwordChangedAfter && user.passwordChangedAfter(decoded.iat))
    ) {
      return next();
    }

    req.user = user;
    return next();
  } catch (err) {
    return next();
  }
};

const protectLicensorRole = async (req, res, next) => {
  await protect(req, res, () => {
    if (req.user.role !== "licensor" && req.user.role !== "admin") {
      return res.status(403).json({ status: "error", message: "Licensor access only." });
    }
    next();
  });
};

// ── protectLicensor: separate JWT secret, logs every access ──────────────
const protectLicensor = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ status: "error", message: "Not authenticated." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token, "licensor");

    const licensor = await Licensor.findById(decoded.id);
    if (!licensor || !licensor.isActive) {
      return res.status(401).json({ status: "error", message: "Licensor account not found or inactive." });
    }

    req.licensor = licensor;

    // Append access log entry without blocking the request
    Licensor.findByIdAndUpdate(
      licensor._id,
      { $push: { accessLog: { ipAddress: req.ip, accessedAt: new Date() } } },
      { runValidators: false }
    ).catch((e) => console.error("Licensor access log error:", e.message));

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        message: "Session expired. Please log in again.",
        code: "TOKEN_EXPIRED",
      });
    }
    return res.status(401).json({ status: "error", message: "Invalid token." });
  }
};

module.exports = { optionalProtect, protect, protectAdmin, protectLicensor, protectLicensorRole };

const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const getTokenSecret = (role = "user") => {
  const secret =
    role === "licensor"
      ? process.env.LICENSER_JWT_SECRET || process.env.JWT_SECRET
      : process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      role === "licensor"
        ? "LICENSER_JWT_SECRET or JWT_SECRET is required."
        : "JWT_SECRET is required."
    );
  }

  return secret;
};

// ── Access token (short-lived: 15 minutes) ────────────────────────────────
const signAccessToken = (id, role = "user") => {
  return jwt.sign(
    { id, role },
    getTokenSecret(role),
    { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
  );
};

// ── Refresh token (long-lived: 30 days, stored hashed in DB) ─────────────
const generateRefreshToken = () => {
  const raw = crypto.randomBytes(40).toString("hex");
  const hashed = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, hashed };
};

const verifyAccessToken = (token, role = "user") => {
  return jwt.verify(token, getTokenSecret(role));
};

const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: "/api/auth/refresh",
});

// ── Send both tokens to client ────────────────────────────────────────────
const createSendTokens = async (user, statusCode, res, role = "user") => {
  const accessToken = signAccessToken(user._id, role);
  const { raw: refreshTokenRaw, hashed: refreshTokenHashed } = generateRefreshToken();

  // Store hashed refresh token in DB
  user.refreshToken = refreshTokenHashed;
  await user.save({ validateBeforeSave: false });

  // Refresh token in httpOnly cookie (not accessible via JS)
  res.cookie("refreshToken", refreshTokenRaw, refreshCookieOptions());

  res.status(statusCode).json({
    status: "success",
    accessToken,                        // client stores in memory only
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    data: {
      user: user.toJSON(),             // toJSON strips all sensitive fields
    },
  });
};

module.exports = {
  signAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  createSendTokens,
  refreshCookieOptions,
};

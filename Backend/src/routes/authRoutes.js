const express = require("express");
const router = express.Router();
const {
  register,
  login,
  refresh,
  logout,
  logoutAllDevices,
  verifyEmail,
  verifyEmailOtp,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
  updateMe,
  getEmailPreferences,
  updateEmailPreferences,
  unsubscribeEmail,
  enable2FA,
  disable2FA,
  verify2FA,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { validateRequest, rules } = require("../middleware/validateRequest");

const nameRule = rules.string({ min: 1, max: 100, required: true });
const passwordRule = rules.string({ min: 8, max: 72, required: true });
const requiredNameOrFirstName = (value, body) => {
  if (body?.name || body?.firstName) return null;
  return "Name is required.";
};

// Public routes
router.post(
  "/register",
  validateRequest({
    body: {
      name: [requiredNameOrFirstName, rules.string({ min: 1, max: 160 })],
      firstName: rules.string({ min: 1, max: 100 }),
      lastName: rules.string({ min: 1, max: 100 }),
      email: rules.email({ required: true }),
      password: passwordRule,
      dob: rules.string({ min: 8, max: 20 }),
    },
  }),
  register
);
router.post(
  "/login",
  validateRequest({
    body: {
      email: rules.email({ required: true }),
      password: passwordRule,
    },
  }),
  login
);
router.post("/refresh", refresh); // uses httpOnly cookie
router.post(
  "/verify-2fa",
  validateRequest({
    body: {
      email: rules.email({ required: true }),
      code: rules.string({ min: 4, max: 12, required: true }),
      pendingToken: rules.string({ min: 10, max: 512 }),
    },
  }),
  verify2FA
); // 2FA verification during login
router.get("/verify-email", verifyEmail);
router.post(
  "/verify-email-otp",
  validateRequest({
    body: {
      email: rules.email({ required: true }),
      code: (value, body) =>
        rules.string({ min: 4, max: 12, required: true })(
          value || body?.otp,
        ),
    },
  }),
  verifyEmailOtp
);
router.post(
  "/resend-verification",
  validateRequest({ body: { email: rules.email({ required: true }) } }),
  resendVerification
);
router.post(
  "/forgot-password",
  validateRequest({ body: { email: rules.email({ required: true }) } }),
  forgotPassword
);
router.post(
  "/reset-password",
  validateRequest({
    body: {
      password: passwordRule,
    },
    query: {
      token: rules.string({ min: 20, max: 256, required: true }),
    },
  }),
  resetPassword
);
router.get("/unsubscribe", unsubscribeEmail);

// Protected routes (require valid access token)
router.post("/logout", protect, logout);
router.post("/logout-all-devices", protect, logoutAllDevices);
router.patch(
  "/change-password",
  protect,
  validateRequest({
    body: {
      currentPassword: passwordRule,
      newPassword: passwordRule,
    },
  }),
  changePassword
);
router.get("/me", protect, getMe);
router.patch(
  "/me",
  protect,
  validateRequest({
    body: {
      firstName: rules.string({ min: 1, max: 100 }),
      lastName: rules.string({ min: 1, max: 100 }),
      name: rules.string({ min: 1, max: 160 }),
    },
  }),
  updateMe
);
router.get("/email-preferences", protect, getEmailPreferences);
router.patch(
  "/email-preferences",
  protect,
  validateRequest({ body: { marketing: () => null, updates: () => null, transactional: () => null } }),
  updateEmailPreferences
);
router.post("/enable-2fa", protect, enable2FA);
router.post(
  "/disable-2fa",
  protect,
  validateRequest({ body: { password: passwordRule } }),
  disable2FA
);

module.exports = router;

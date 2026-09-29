const crypto = require("crypto");
const User = require("../models/User");
const PendingRegistration = require("../models/PendingRegistration");
const {
  createSendTokens,
  verifyAccessToken,
  generateRefreshToken,
  refreshCookieOptions,
} = require("../utils/jwt");
const {
  sendEmail,
  emailTemplates,
  logSmtpError,
} = require("../services/emailService");
const { generateToken, hashToken } = require("../utils/tokenUtils");
const { catchAsync, createError } = require("../middleware/errorMiddleware");
const {
  validateEmail,
  validatePassword,
  validateName,
} = require("../utils/validator");
const { logActivity } = require("../utils/activityLogger");

const EMAIL_PREFERENCE_KEYS = ["bookUpdates", "readingReminders", "marketing"];

const pickEmailPreferences = (input = {}) => {
  const preferences = {};
  EMAIL_PREFERENCE_KEYS.forEach((key) => {
    if (typeof input[key] === "boolean") {
      preferences[key] = input[key];
    }
  });
  return preferences;
};

const MAX_EMAIL_OTP_ATTEMPTS = 5;
const EMAIL_OTP_LOCK_MS = 10 * 60 * 1000;

const assertOtpNotLocked = (record) => {
  if (record.emailVerificationLockedUntil && record.emailVerificationLockedUntil > Date.now()) {
    const minutesLeft = Math.ceil((record.emailVerificationLockedUntil - Date.now()) / 60000);
    const err = new Error(
      `Too many invalid OTP attempts. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? "s" : ""}.`,
    );
    err.statusCode = 429;
    throw err;
  }
};

const recordInvalidEmailOtp = async ({ record, req, email, userId }) => {
  record.emailVerificationAttempts = Number(record.emailVerificationAttempts || 0) + 1;
  if (record.emailVerificationAttempts >= MAX_EMAIL_OTP_ATTEMPTS) {
    record.emailVerificationLockedUntil = new Date(Date.now() + EMAIL_OTP_LOCK_MS);
  }
  await record.save({ validateBeforeSave: false });
  await logActivity({
    userId,
    type: "suspicious_activity",
    email,
    req,
    metadata: {
      reason: "invalid_email_otp",
      attempts: record.emailVerificationAttempts,
      locked: Boolean(record.emailVerificationLockedUntil),
    },
  });
};

const getPendingRegistrationKey = () => {
  const secret =
    process.env.REGISTRATION_ENCRYPTION_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("REGISTRATION_ENCRYPTION_SECRET or JWT_SECRET is required.");
  }
  return crypto.createHash("sha256").update(secret).digest();
};

const encryptPendingPassword = (password) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    getPendingRegistrationKey(),
    iv,
  );
  const encrypted = Buffer.concat([
    cipher.update(password, "utf8"),
    cipher.final(),
  ]);

  return {
    passwordEncrypted: encrypted.toString("hex"),
    passwordIv: iv.toString("hex"),
    passwordAuthTag: cipher.getAuthTag().toString("hex"),
  };
};

const decryptPendingPassword = (pending) => {
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getPendingRegistrationKey(),
    Buffer.from(pending.passwordIv, "hex"),
  );
  decipher.setAuthTag(Buffer.from(pending.passwordAuthTag, "hex"));
  return Buffer.concat([
    decipher.update(Buffer.from(pending.passwordEncrypted, "hex")),
    decipher.final(),
  ]).toString("utf8");
};

const createVerifiedUserFromPending = async (pending, req, method = "otp") => {
  const existing = await User.findOne({ email: pending.email });
  if (existing) {
    if (!existing.isEmailVerified) {
      existing.isEmailVerified = true;
      existing.emailVerifiedAt = new Date();
      existing.emailVerificationToken = undefined;
      existing.emailVerificationExpires = undefined;
      existing.emailVerificationCode = undefined;
      existing.emailVerificationCodeExpires = undefined;
      existing.emailVerificationAttempts = 0;
      existing.emailVerificationLockedUntil = undefined;
      await existing.save({ validateBeforeSave: false });
    }
    await PendingRegistration.deleteOne({ _id: pending._id });
    return existing;
  }

  const user = await User.create({
    name: pending.name,
    email: pending.email,
    password: decryptPendingPassword(pending),
    isEmailVerified: true,
    emailVerifiedAt: new Date(),
  });

  await PendingRegistration.deleteOne({ _id: pending._id });
  await logActivity({
    userId: user._id,
    type: "registered",
    email: user.email,
    req,
  });
  await logActivity({
    userId: user._id,
    type: "email_verified",
    email: user.email,
    req,
    metadata: { method },
  });

  return user;
};

// ── POST /api/auth/register ───────────────────────────────────────────────
const register = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const name = (
    req.body.name ||
    [req.body.firstName, req.body.lastName].filter(Boolean).join(" ")
  ).trim();
  const cleanEmail = email?.trim().toLowerCase();

  const nameError = validateName(name);
  if (nameError) return next(createError(nameError, 400));

  const emailError = validateEmail(email);
  if (emailError) return next(createError(emailError, 400));

  const passwordError = validatePassword(password);
  if (passwordError) return next(createError(passwordError, 400));

  const existing = await User.findOne({ email: cleanEmail });
  if (existing) {
    return next(
      createError("This email is already registered. Please log in.", 409),
    );
  }

  const rawToken = generateToken();
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000,
  ).toString();

  const pending = await PendingRegistration.findOneAndUpdate(
    { email: cleanEmail },
    {
      $set: {
        name,
        email: cleanEmail,
        ...encryptPendingPassword(password),
        emailVerificationToken: hashToken(rawToken),
        emailVerificationExpires: new Date(
          Date.now() + 24 * 60 * 60 * 1000,
        ),
        emailVerificationCode: hashToken(verificationCode),
        emailVerificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000),
        emailVerificationAttempts: 0,
        emailVerificationLockedUntil: undefined,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  setImmediate(async () => {
    try {
      await sendEmail({
        to: pending.email,
        type: "verify_email",
        ...emailTemplates.welcomeVerifyEmail(
          pending.name,
          rawToken,
          verificationCode,
        ),
      });
    } catch (emailErr) {
      logSmtpError("Registration email failed", emailErr);
    }
  });

  return res.status(201).json({
    status: "success",
    message:
      "Registration successful. Please verify your email using the code sent to you.",
  });
});
// -- POST /api/auth/login ──────────────────────────────────────────────────
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(createError("Email and password are required.", 400));
  }

  // Use a consistent error message to prevent user enumeration
  const authError = createError("Invalid email or password.", 401);

  // Fetch with sensitive fields needed for auth
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select(
    "+password +failedLoginAttempts +lockedUntil +refreshToken +twoFactorEnabled",
  );

  if (!user) {
    await logActivity({
      type: "login_failed",
      email: email.trim().toLowerCase(),
      req,
      metadata: { reason: "unknown_email" },
    });
    return next(authError);
  }

  // Check lockout BEFORE verifying password (prevents timing attacks revealing account existence)
  if (user.isLocked()) {
    const minutesLeft = Math.ceil((user.lockedUntil - Date.now()) / 60000);
    return next(
      createError(
        `Account temporarily locked due to too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? "s" : ""}.`,
        429,
      ),
    );
  }

  if (!user.isActive || user.status !== "active") {
    return next(
      createError(
        "This account has been deactivated. Please contact support.",
        403,
      ),
    );
  }

  if (!user.isEmailVerified) {
    const verifyError = createError(
      "Please verify your email before logging in.",
      403,
    );
    verifyError.errorCode = "EMAIL_NOT_VERIFIED";
    return next(verifyError);
  }

  const passwordMatch = await user.comparePassword(password);
  if (!passwordMatch) {
    await user.recordFailedLogin();
    if (user.failedLoginAttempts >= 5) {
      try {
        await sendEmail({
          to: user.email,
          type: "security_alert",
          userId: user._id,
          ...emailTemplates.securityAlert({
            name: user.name,
            title: "Account temporarily locked",
            message:
              "your account was temporarily locked after too many failed login attempts.",
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
          }),
        });
      } catch (err) {
        console.error("Security alert email failed:", err.message);
      }
    }
    await logActivity({
      userId: user._id,
      type: "login_failed",
      email: user.email,
      req,
      metadata: { reason: "bad_password" },
    });
    // Give the same generic error regardless of whether email or password was wrong
    return next(authError);
  }

  // If 2FA is enabled, send code instead of tokens
  if (user.twoFactorEnabled) {
    const twoFactorCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    user.twoFactorCode = hashToken(twoFactorCode);
    user.twoFactorExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const pendingToken = generateToken();
    user.pendingLoginToken = hashToken(pendingToken);
    user.pendingLoginTokenExpires = new Date(Date.now() + 10 * 60 * 1000);

    await user.save({ validateBeforeSave: false });

    try {
      await sendEmail({
        to: user.email,
        type: "two_factor",
        userId: user._id,
        ...emailTemplates.twoFactorCode(user.name, twoFactorCode),
      });
    } catch (err) {
      console.error("2FA code email failed:", err.message);
      return next(
        createError(
          "Failed to send authentication code. Please try again.",
          500,
        ),
      );
    }

    return res.status(202).json({
      status: "pending",
      message: "A verification code has been sent to your email.",
      pendingToken,
    });
  }

  // Successful login
  await user.recordSuccessfulLogin(req.ip, req.get("user-agent"));
  await logActivity({
    userId: user._id,
    type: "login_success",
    email: user.email,
    req,
  });
  await createSendTokens(user, 200, res);
});

// ── POST /api/auth/refresh ────────────────────────────────────────────────
// Issues a new access token using the httpOnly refresh token cookie
const refresh = catchAsync(async (req, res, next) => {
  const rawRefreshToken = req.cookies?.refreshToken;
  if (!rawRefreshToken) {
    return next(createError("No refresh token. Please log in.", 401));
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(rawRefreshToken)
    .digest("hex");

  const user = await User.findOne({ refreshToken: hashedToken }).select(
    "+refreshToken +passwordChangedAt",
  );
  if (
    !user ||
    !user.isActive ||
    user.status !== "active" ||
    !user.isEmailVerified
  ) {
    await logActivity({
      type: "suspicious_activity",
      req,
      metadata: {
        reason: "invalid_refresh_token",
        tokenPresent: Boolean(rawRefreshToken),
      },
    });
    return next(
      createError("Invalid or expired session. Please log in again.", 401),
    );
  }

  // Issue new access token + rotate refresh token
  await logActivity({
    userId: user._id,
    type: "login_success",
    email: user.email,
    req,
    metadata: { method: "refresh" },
  });
  await createSendTokens(user, 200, res);
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────
const logout = catchAsync(async (req, res) => {
  // Clear refresh token from DB
  if (req.user) {
    req.user.refreshToken = undefined;
    await req.user.save({ validateBeforeSave: false });
    await logActivity({
      userId: req.user._id,
      type: "logout",
      email: req.user.email,
      req,
    });
  }

  // Clear the cookie
  res.clearCookie("refreshToken", refreshCookieOptions());
  res
    .status(200)
    .json({ status: "success", message: "Logged out successfully." });
});

// ── GET /api/auth/verify-email?token=xxx ─────────────────────────────────
const logoutAllDevices = catchAsync(async (req, res) => {
  req.user.refreshToken = undefined;
  await req.user.save({ validateBeforeSave: false });

  await logActivity({
    userId: req.user._id,
    type: "logout",
    email: req.user.email,
    req,
    metadata: { scope: "all_devices" },
  });

  res.clearCookie("refreshToken", refreshCookieOptions());
  res.status(200).json({
    status: "success",
    message: "Logged out from all devices successfully.",
  });
});

const verifyEmail = catchAsync(async (req, res, next) => {
  if (!req.query.token) {
    return next(createError("Verification token is missing.", 400));
  }

  const hashedToken = hashToken(req.query.token);

  let user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    const pending = await PendingRegistration.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    }).select(
      "+passwordEncrypted +passwordIv +passwordAuthTag +emailVerificationToken +emailVerificationExpires",
    );

    if (!pending) {
      return next(
        createError("This verification link is invalid or has expired.", 400),
      );
    }

    user = await createVerifiedUserFromPending(pending, req, "link");
    await user.recordSuccessfulLogin(req.ip, req.get("user-agent"));
    return createSendTokens(user, 200, res);
  }

  user.isEmailVerified = true;
  user.emailVerifiedAt = new Date();
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  user.emailVerificationCode = undefined;
  user.emailVerificationCodeExpires = undefined;
  await user.save({ validateBeforeSave: false });
  await logActivity({
    userId: user._id,
    type: "email_verified",
    email: user.email,
    req,
    metadata: { method: "link" },
  });

  res
    .status(200)
    .json({
      status: "success",
      message: "Email verified. You can now log in.",
    });
});

// ── POST /api/auth/verify-email-otp ──────────────────────────────────────
const verifyEmailOtp = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const code = req.body.code || req.body.otp;

  if (!email || !code) {
    return next(createError("Email and verification code are required.", 400));
  }

  const cleanEmail = email.trim().toLowerCase();
  const hashedCode = hashToken(code);

  const pending = await PendingRegistration.findOne({
    email: cleanEmail,
    emailVerificationCodeExpires: { $gt: Date.now() },
  }).select(
    "+passwordEncrypted +passwordIv +passwordAuthTag +emailVerificationCode +emailVerificationCodeExpires +emailVerificationAttempts +emailVerificationLockedUntil",
  );

  if (pending) {
    assertOtpNotLocked(pending);
    if (pending.emailVerificationCode !== hashedCode) {
      await recordInvalidEmailOtp({ record: pending, req, email: pending.email });
      return next(createError("Invalid or expired verification code.", 400));
    }

    const user = await createVerifiedUserFromPending(pending, req, "otp");
    await user.recordSuccessfulLogin(req.ip, req.get("user-agent"));
    await logActivity({
      userId: user._id,
      type: "login_success",
      email: user.email,
      req,
      metadata: { method: "email_otp_verification" },
    });

    return createSendTokens(user, 200, res);
  }

  const user = await User.findOne({
    email: cleanEmail,
    emailVerificationCodeExpires: { $gt: Date.now() },
  }).select(
    "+emailVerificationCode +emailVerificationCodeExpires +emailVerificationToken +emailVerificationExpires +emailVerificationAttempts +emailVerificationLockedUntil",
  );

  if (!user) {
    return next(createError("Invalid or expired verification code.", 400));
  }
  assertOtpNotLocked(user);
  if (user.emailVerificationCode !== hashedCode) {
    await recordInvalidEmailOtp({ record: user, req, email: user.email, userId: user._id });
    return next(createError("Invalid or expired verification code.", 400));
  }

  user.isEmailVerified = true;
  user.emailVerifiedAt = new Date();
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  user.emailVerificationCode = undefined;
  user.emailVerificationCodeExpires = undefined;
  user.emailVerificationAttempts = 0;
  user.emailVerificationLockedUntil = undefined;
  await user.save({ validateBeforeSave: false });
  await logActivity({
    userId: user._id,
    type: "email_verified",
    email: user.email,
    req,
    metadata: { method: "otp" },
  });

  await user.recordSuccessfulLogin(req.ip, req.get("user-agent"));
  await logActivity({
    userId: user._id,
    type: "login_success",
    email: user.email,
    req,
    metadata: { method: "email_otp_verification" },
  });

  return createSendTokens(user, 200, res);
});
// -- POST /api/auth/resend-verification ───────────────────────────────────
const resendVerification = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(createError("Email is required.", 400));
  const emailError = validateEmail(email);
  if (emailError) return next(createError(emailError, 400));

  const cleanEmail = email.trim().toLowerCase();
  const rawToken = generateToken();
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000,
  ).toString();

  const pending = await PendingRegistration.findOne({ email: cleanEmail });

  if (pending) {
    pending.emailVerificationToken = hashToken(rawToken);
    pending.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    pending.emailVerificationCode = hashToken(verificationCode);
    pending.emailVerificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    pending.emailVerificationAttempts = 0;
    pending.emailVerificationLockedUntil = undefined;
    pending.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await pending.save({ validateBeforeSave: false });

    setImmediate(async () => {
      try {
        await sendEmail({
          to: pending.email,
          type: "verify_email",
          ...emailTemplates.verifyEmail(pending.name, rawToken, verificationCode),
        });
      } catch (err) {
        logSmtpError("Resend verification email failed", err);
      }
    });
  } else {
    const user = await User.findOne({ email: cleanEmail });

    if (user && !user.isEmailVerified) {
      user.emailVerificationToken = hashToken(rawToken);
      user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      user.emailVerificationCode = hashToken(verificationCode);
      user.emailVerificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
      user.emailVerificationAttempts = 0;
      user.emailVerificationLockedUntil = undefined;
      await user.save({ validateBeforeSave: false });
      await logActivity({
        userId: user._id,
        type: "verification_resent",
        email: user.email,
        req,
      });

      setImmediate(async () => {
        try {
          await sendEmail({
            to: user.email,
            type: "verify_email",
            userId: user._id,
            ...emailTemplates.verifyEmail(user.name, rawToken, verificationCode),
          });
        } catch (err) {
          logSmtpError("Resend verification email failed", err);
        }
      });
    }
  }

  return res.status(200).json({
    status: "success",
    message:
      "If your email is registered and unverified, a new OTP is being sent.",
  });
});
// -- POST /api/auth/forgot-password ───────────────────────────────────────
const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(createError("Email is required.", 400));
  const emailError = validateEmail(email);
  if (emailError) return next(createError(emailError, 400));

  const user = await User.findOne({ email: email.trim().toLowerCase() });

  // Always return the same response regardless of whether the email exists
  const successResponse = {
    status: "success",
    message: "If that email is registered, a reset link has been sent.",
  };

  if (!user || !user.isActive) {
    return res.status(200).json(successResponse);
  }

  const rawToken = generateToken();
  user.passwordResetToken = hashToken(rawToken);
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save({ validateBeforeSave: false });
  await logActivity({
    userId: user._id,
    type: "password_reset_requested",
    email: user.email,
    req,
  });

  try {
    await sendEmail({
      to: user.email,
      type: "password_reset",
      userId: user._id,
      ...emailTemplates.passwordReset(user.name, rawToken),
    });
  } catch (err) {
    console.error("Password reset email failed:", err.message);
    if (process.env.NODE_ENV !== "development") {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return next(
        createError(
          "Failed to send reset email. Please try again shortly.",
          500,
        ),
      );
    }
  }

  res.status(200).json({
    ...successResponse,
  });
});

// ── POST /api/auth/reset-password?token=xxx ──────────────────────────────
const resetPassword = catchAsync(async (req, res, next) => {
  if (!req.query.token) {
    return next(createError("Reset token is missing.", 400));
  }

  const { password } = req.body;
  const passwordError = validatePassword(password, "New password");
  if (passwordError) return next(createError(passwordError, 400));

  const hashedToken = hashToken(req.query.token);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select("+password +failedLoginAttempts +lockedUntil +refreshToken");

  if (!user) {
    return next(createError("This reset link is invalid or has expired.", 400));
  }

  // Prevent reusing the same password
  const samePassword = await user.comparePassword(password);
  if (samePassword) {
    return next(
      createError(
        "New password must be different from your current password.",
        400,
      ),
    );
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshToken = undefined; // invalidate all existing sessions
  user.failedLoginAttempts = 0;
  user.lockedUntil = undefined;
  await user.save();
  await logActivity({
    userId: user._id,
    type: "password_reset_completed",
    email: user.email,
    req,
  });

  // Clear refresh cookie
  res.clearCookie("refreshToken", refreshCookieOptions());

  res.status(200).json({
    status: "success",
    message:
      "Password reset successfully. Please log in with your new password.",
  });
});

// ── PATCH /api/auth/change-password ──────────────────────────────────────
const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(
      createError("Current password and new password are required.", 400),
    );
  }

  const passwordError = validatePassword(newPassword, "New password");
  if (passwordError) return next(createError(passwordError, 400));

  const user = await User.findById(req.user._id).select("+password");

  const isCorrect = await user.comparePassword(currentPassword);
  if (!isCorrect) {
    return next(createError("Current password is incorrect.", 401));
  }

  const samePassword = await user.comparePassword(newPassword);
  if (samePassword) {
    return next(
      createError(
        "New password must be different from your current password.",
        400,
      ),
    );
  }

  user.password = newPassword;
  user.refreshToken = undefined; // log out all other sessions
  await user.save();
  await logActivity({
    userId: user._id,
    type: "password_changed",
    email: user.email,
    req,
  });

  res.clearCookie("refreshToken", refreshCookieOptions());
  res
    .status(200)
    .json({
      status: "success",
      message: "Password changed successfully. Please log in again.",
    });
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────
const getMe = catchAsync(async (req, res) => {
  // Re-fetch to get latest data; toJSON() strips all sensitive fields
  const user = await User.findById(req.user._id);
  res.status(200).json({ status: "success", data: { user } });
});

const getEmailPreferences = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    status: "success",
    data: { emailPreferences: user.emailPreferences },
  });
});

const updateEmailPreferences = catchAsync(async (req, res, next) => {
  const preferences = pickEmailPreferences(req.body);

  if (!Object.keys(preferences).length) {
    return next(createError("At least one email preference is required.", 400));
  }

  const user = await User.findById(req.user._id);
  user.emailPreferences = {
    ...user.emailPreferences?.toObject?.(),
    ...preferences,
  };

  const allOptionalEmailsOff = EMAIL_PREFERENCE_KEYS.every(
    (key) => user.emailPreferences[key] === false,
  );
  user.unsubscribedAt = allOptionalEmailsOff ? new Date() : undefined;

  await user.save({ validateBeforeSave: false });
  await logActivity({
    userId: user._id,
    type: "email_preferences_updated",
    email: user.email,
    req,
    metadata: { preferences },
  });

  res.status(200).json({
    status: "success",
    message: "Email preferences updated successfully.",
    data: { emailPreferences: user.emailPreferences },
  });
});

const unsubscribeEmail = catchAsync(async (req, res, next) => {
  if (!req.query.token) {
    return next(createError("Unsubscribe token is missing.", 400));
  }

  const user = await User.findOne({ unsubscribeToken: req.query.token }).select(
    "+unsubscribeToken",
  );

  if (!user) {
    return next(createError("This unsubscribe link is invalid.", 400));
  }

  user.emailPreferences = {
    ...user.emailPreferences?.toObject?.(),
    bookUpdates: false,
    readingReminders: false,
    marketing: false,
  };
  user.unsubscribedAt = new Date();
  await user.save({ validateBeforeSave: false });
  await logActivity({
    userId: user._id,
    type: "unsubscribed",
    email: user.email,
    req,
    metadata: { method: "email_link" },
  });

  res.status(200).json({
    status: "success",
    message: "You have been unsubscribed from optional emails.",
    data: { emailPreferences: user.emailPreferences },
  });
});

const updateMe = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    return next(createError("Name is required.", 400));
  }

  const nameError = validateName(name);
  if (nameError) return next(createError(nameError, 400));

  const user = await User.findById(req.user._id);
  user.name = name.trim();
  await user.save({ validateBeforeSave: false });
  await logActivity({
    userId: user._id,
    type: "profile_updated",
    email: user.email,
    req,
    metadata: { fields: ["name"] },
  });

  res.status(200).json({
    status: "success",
    message: "Profile updated successfully.",
    data: { user },
  });
});

// ── POST /api/auth/enable-2fa ─────────────────────────────────────────────
// Authenticated users can enable 2FA on their account
const enable2FA = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user.twoFactorEnabled) {
    return res.status(200).json({
      status: "success",
      message: "Two-factor authentication is already enabled.",
    });
  }

  user.twoFactorEnabled = true;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "Two-factor authentication has been enabled on your account.",
    data: { twoFactorEnabled: true },
  });
});

// ── POST /api/auth/disable-2fa ────────────────────────────────────────────
// Authenticated users can disable 2FA (requires password confirmation)
const disable2FA = catchAsync(async (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return next(createError("Password is required to disable 2FA.", 400));
  }

  const user = await User.findById(req.user._id).select("+password");

  const isCorrect = await user.comparePassword(password);
  if (!isCorrect) {
    return next(createError("Password is incorrect.", 401));
  }

  if (!user.twoFactorEnabled) {
    return res.status(200).json({
      status: "success",
      message: "Two-factor authentication is not enabled.",
    });
  }

  user.twoFactorEnabled = false;
  user.twoFactorCode = undefined;
  user.twoFactorExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "Two-factor authentication has been disabled.",
    data: { twoFactorEnabled: false },
  });
});

// ── POST /api/auth/verify-2fa ─────────────────────────────────────────────
// Verify 2FA code during login
const verify2FA = catchAsync(async (req, res, next) => {
  const { code, pendingToken } = req.body;

  if (!code || !pendingToken) {
    return next(
      createError("Verification code and pending token are required.", 400),
    );
  }

  const hashedPendingToken = hashToken(pendingToken);
  const hashedCode = hashToken(code);

  const user = await User.findOne({
    pendingLoginToken: hashedPendingToken,
    pendingLoginTokenExpires: { $gt: Date.now() },
    twoFactorCode: hashedCode,
    twoFactorExpires: { $gt: Date.now() },
  }).select(
    "+twoFactorCode +twoFactorExpires +pendingLoginToken +pendingLoginTokenExpires",
  );

  if (!user) {
    return next(createError("Invalid or expired verification code.", 400));
  }

  // Clear 2FA tokens
  user.twoFactorCode = undefined;
  user.twoFactorExpires = undefined;
  user.pendingLoginToken = undefined;
  user.pendingLoginTokenExpires = undefined;
  await user.save({ validateBeforeSave: false });

  // Record successful login
  await user.recordSuccessfulLogin(req.ip, req.get("user-agent"));
  await logActivity({
    userId: user._id,
    type: "login_success",
    email: user.email,
    req,
    metadata: { twoFactor: true },
  });
  await createSendTokens(user, 200, res);
});

module.exports = {
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
};

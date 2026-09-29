const path = require("path");

const dotenvPath = path.resolve(__dirname, "../.env");
const dotenvResult = require("dotenv").config({ path: dotenvPath });

if (
  (process.env.RENDER || process.env.RENDER_SERVICE_ID) &&
  process.env.NODE_ENV !== "production"
) {
  console.warn("Render runtime detected with NODE_ENV not set to production; forcing production mode.");
  process.env.NODE_ENV = "production";
}

const cookieParser = require("cookie-parser");
const cors = require("cors");
const crypto = require("crypto");
const express = require("express");
const helmet = require("helmet");
const http = require("http");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const { errorHandler } = require("./middleware/errorMiddleware");
const { sanitiseBody } = require("./utils/validator");
const {
  enforceProductionReadiness,
} = require("./services/securityService");
const { initSocket } = require("./services/socketService");
const {
  sendEmail,
  safeEmailTransportConfig,
  verifyEmailTransport,
  smtpErrorDetails,
} = require("./services/emailService");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const bookRoutes = require("./routes/bookRoutes");
const libraryRoutes = require("./routes/libraryRoutes");
const licensorRoutes = require("./routes/licensorRoutes");
const supportRoutes = require("./routes/supportRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const discoveryRoutes = require("./routes/discoveryRoutes");
const physicalOrderRoutes = require("./routes/physicalOrderRoutes");
const campaignRoutes = require("./routes/campaignRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const subscriptionAdminRoutes = require("./routes/subscriptionAdminRoutes");
const subscriptionCompatRoutes = require("./routes/subscriptionCompatRoutes");
const r2Routes = require("./routes/r2Routes");
const { startSubscriptionJobs } = require("./services/subscriptionJobs");

const app = express();
const server = http.createServer(app);
app.disable("x-powered-by");
app.set("trust proxy", 1);

const requestContext = (req, res, next) => {
  const incomingRequestId = String(req.get("x-request-id") || "").trim();
  req.requestId = /^[a-zA-Z0-9._:-]{8,128}$/.test(incomingRequestId)
    ? incomingRequestId
    : crypto.randomUUID();
  res.setHeader("X-Request-Id", req.requestId);

  const startedAt = Date.now();
  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    const slowThresholdMs = Number(process.env.SLOW_API_THRESHOLD_MS || 1500);
    if (
      req.path.startsWith("/api") &&
      Number.isFinite(slowThresholdMs) &&
      durationMs >= slowThresholdMs
    ) {
      console.warn("Slow API request:", {
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs,
        userId: req.user?._id?.toString(),
        timestamp: new Date().toISOString(),
      });
    }
  });

  next();
};

const apiSecurityHeaders = (req, res, next) => {
  if (req.path.startsWith("/api")) {
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  }

  next();
};

const enforceHttps = (req, res, next) => {
  if (process.env.NODE_ENV !== "production") return next();
  if (req.secure || req.get("x-forwarded-proto") === "https") return next();

  if (req.method === "GET" || req.method === "HEAD") {
    return res.redirect(301, `https://${req.get("host")}${req.originalUrl}`);
  }

  return res.status(403).json({
    status: "error",
    message: "HTTPS is required.",
  });
};

const sensitiveCacheControl = (req, res, next) => {
  const sensitiveRoutes = [
    /^\/api\/auth\/(me|refresh|logout|logout-all-devices|change-password|enable-2fa|disable-2fa)/,
    /^\/api\/admin(?:\/|$)/,
    /^\/api\/library(?:\/|$)/,
    /^\/api\/subscriptions(?:\/|$)/,
    /^\/api\/subscribe(?:\/|$)/,
    /^\/api\/credits(?:\/|$)/,
    /^\/api\/dashboard(?:\/|$)/,
    /^\/api\/notifications(?:\/|$)/,
    /^\/api\/physical-orders(?:\/|$)/,
    /^\/api\/campaigns\/pledges(?:\/|$)/,
    /^\/api\/support(?:\/|$)/,
    /^\/api\/licensors(?:\/|$)/,
  ];

  if (sensitiveRoutes.some((route) => route.test(req.path))) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
  }

  next();
};

app.use(requestContext);
app.use(apiSecurityHeaders);
app.use(enforceHttps);
app.use(sensitiveCacheControl);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        frameAncestors: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: "no-referrer" },
    hsts:
      process.env.NODE_ENV === "production"
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
  })
);

const productionAllowedOrigins = [
  "https://heartsreader.com",
  "https://www.heartsreader.com",
  "https://crossed-hearts-frontend.onrender.com",
];

const developmentAllowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5000",
  "http://localhost:5500",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5000",
  "http://127.0.0.1:5500",
];

const defaultAllowedOrigins =
  process.env.NODE_ENV === "production"
    ? productionAllowedOrigins
    : [...productionAllowedOrigins, ...developmentAllowedOrigins];

const allowedOrigins = [
  ...defaultAllowedOrigins,
  ...(process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim()),
]
  .filter(Boolean)
  .filter((origin, index, origins) => origins.indexOf(origin) === index);

const isAllowedDevOrigin = (origin) => {
  if (process.env.NODE_ENV !== "development") return false;
  if (origin === "null") return true;
  try {
    const { hostname } = new URL(origin);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch (err) {
    return false;
  }
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || isAllowedDevOrigin(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);

app.use("/api/webhooks", webhookRoutes);
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use(sanitiseBody);

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", message: "Too many requests. Please slow down." },
});

const identityKey = (req) => {
  const ip = rateLimit.ipKeyGenerator ? rateLimit.ipKeyGenerator(req.ip) : req.ip;
  const identity = String(
      req.body?.email ||
      req.body?.licensorId ||
      req.body?.paymentIntentId ||
      req.body?.razorpay_payment_id ||
      req.body?.razorpay_order_id ||
      req.params?.bookId ||
      ""
  )
    .trim()
    .toLowerCase();
  return `${ip}:${identity || "anonymous"}`;
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: identityKey,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", message: "Too many login attempts. Please wait 15 minutes." },
});

const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  keyGenerator: identityKey,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", message: "Too many OTP attempts. Please wait 10 minutes." },
});

const otpResendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  keyGenerator: identityKey,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", message: "Too many OTP resend attempts. Please wait 10 minutes." },
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: identityKey,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", message: "Too many reset attempts. Try again in an hour." },
});

const strictActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", message: "Too many sensitive actions. Please wait." },
});

const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  keyGenerator: identityKey,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", message: "Too many payment attempts. Please wait." },
});

const paymentVerificationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 8,
  keyGenerator: identityKey,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", message: "Too many payment verification attempts. Please wait." },
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", message: "Too many uploads. Please wait." },
});

app.use("/api", globalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/licensors/login", authLimiter);
app.use("/api/licensors/login-id", authLimiter);
app.use("/api/auth/verify-email-otp", otpVerifyLimiter);
app.use("/api/auth/resend-verification", otpResendLimiter);
app.use("/api/auth/verify-2fa", otpVerifyLimiter);
app.use("/api/auth/forgot-password", forgotPasswordLimiter);
app.use("/api/auth/reset-password", strictActionLimiter);
app.use("/api/auth/change-password", strictActionLimiter);
app.use(/^\/api\/library\/[^/]+\/payment-intent/, paymentLimiter);
app.use(/^\/api\/library\/[^/]+\/confirm-payment/, paymentVerificationLimiter);
app.use(/^\/api\/library\/[^/]+\/razorpay-order/, paymentLimiter);
app.use(/^\/api\/library\/[^/]+\/confirm-razorpay/, paymentVerificationLimiter);
app.use(/^\/api\/library\/purchases\/[^/]+\/refund/, strictActionLimiter);
app.use(/^\/api\/library\/[^/]+\/read-token\/[^/]+/, strictActionLimiter);
app.use("/api/physical-orders/payment-intent", paymentLimiter);
app.use("/api/physical-orders/confirm-payment", paymentVerificationLimiter);
app.use("/api/physical-orders/razorpay-order", paymentLimiter);
app.use("/api/physical-orders/confirm-razorpay", paymentVerificationLimiter);
app.use("/api/campaigns/pledges/payment-intent", paymentLimiter);
app.use("/api/subscriptions/subscribe", paymentLimiter);
app.use("/api/subscribe", paymentLimiter);
app.use("/api/subscriptions/credits/redeem", strictActionLimiter);
app.use("/api/credits/redeem", strictActionLimiter);
app.use(/^\/api\/admin\/.*$/, strictActionLimiter);
app.use("/api/support/tickets", strictActionLimiter);
app.use(/^\/api\/books\/[^/]+\/chapters\/pdf/, uploadLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/licensors", licensorRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/discovery", discoveryRoutes);
app.use("/api/physical-orders", physicalOrderRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/admin/subscription-platform", subscriptionAdminRoutes);
app.use("/api", subscriptionCompatRoutes);
app.use("/api/r2", r2Routes);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/test-email", async (req, res) => {
  const configuredSecret = process.env.TEST_EMAIL_SECRET;
  const providedSecret = req.get("x-test-email-secret") || req.query.secret;

  if (configuredSecret && providedSecret !== configuredSecret) {
    return res.status(403).json({
      status: "error",
      message: "Invalid test email secret.",
    });
  }

  if (!configuredSecret && process.env.NODE_ENV === "production") {
    return res.status(403).json({
      status: "error",
      message: "TEST_EMAIL_SECRET is required in production.",
    });
  }

  const to = String(req.query.to || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return res.status(400).json({
      status: "error",
      message: "Use /api/test-email?to=name@example.com",
    });
  }

  try {
    const info = await sendEmail({
      to,
      type: "test_email",
      subject: "Crossed Hearts test email",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;">
          <h2>Crossed Hearts email test</h2>
          <p>This test email was sent using the same Brevo API path as OTP emails.</p>
          <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
        </div>
      `,
      metadata: { source: "GET /api/test-email" },
    });

    return res.status(200).json({
      status: "success",
      message: "Test email sent.",
      messageId: info.messageId,
      to,
    });
  } catch (err) {
    console.error("Test email failed:", smtpErrorDetails(err));
    return res.status(500).json({
      status: "error",
      error: smtpErrorDetails(err),
    });
  }
});

app.use((req, res) => {
  const message =
    process.env.NODE_ENV === "production"
      ? "Route not found."
      : `Route ${req.originalUrl} not found.`;

  res.status(404).json({ status: "error", message });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const listen = () =>
  new Promise((resolve, reject) => {
    const onError = (err) => reject(err);
    server.once("error", onError);
    server.listen(PORT, () => {
      server.off("error", onError);
      console.log(`Crossed Hearts API - port ${PORT} [${process.env.NODE_ENV}]`);
      resolve();
    });
  });

const startServer = async () => {
  await connectDB();
  enforceProductionReadiness();
  const emailConfig = safeEmailTransportConfig();
  if (emailConfig.apiKeyConfigured) {
    console.log("Brevo API email provider enabled");
  }
  if (!emailConfig.apiKeyConfigured || !emailConfig.fromEmail) {
    console.error("Brevo email config invalid:", {
      hasApiKey: emailConfig.apiKeyConfigured,
      hasFromEmail: Boolean(emailConfig.fromEmail),
    });
  } else {
    try {
      await verifyEmailTransport();
      console.log("Brevo API email config verify: success");
    } catch (err) {
      console.error("Brevo API email config verify failed:", smtpErrorDetails(err));
    }
  }
  initSocket(server, { allowedOrigins, isAllowedDevOrigin });
  startSubscriptionJobs();
  await listen();
};

startServer().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

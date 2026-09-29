const fs = require("fs");
const mongoose = require("mongoose");

const hasPlaceholder = (value) =>
  !value ||
  /replace-with|your-|youremail|password|secret|sk_test_missing/i.test(String(value));

const isLongSecret = (value, min = 48) => typeof value === "string" && value.length >= min;

const paymentsEnabled = () => process.env.PAYMENTS_ENABLED !== "false";
const envValue = (key) => String(process.env[key] || "").trim();

const razorpayEnabled = () =>
  Boolean(
    envValue("RAZORPAY_KEY_ID") ||
      envValue("RAZORPAY_KEY_SECRET") ||
      envValue("RAZORPAY_INR_PER_USD")
  );

const withBlockingDefaults = (check) => ({
  blocksStartup: false,
  ...check,
});

const getSecurityReport = () => {
  const uploadPath = process.env.PDF_STORAGE_PATH || "./uploads/pdfs";
  const checks = [
    {
      key: "nodeEnv",
      ok: process.env.NODE_ENV === "production",
      severity: "high",
      message:
        process.env.NODE_ENV === "production"
          ? "NODE_ENV is production."
          : "NODE_ENV is not production.",
    },
    {
      key: "productionReadinessLock",
      ok:
        process.env.NODE_ENV !== "production" ||
        process.env.PRODUCTION_READINESS_LOCK === "true",
      severity: "critical",
      blocksStartup: true,
      message: "PRODUCTION_READINESS_LOCK must be true in production.",
    },
    {
      key: "mongoUri",
      ok: Boolean(process.env.MONGO_URI) && !hasPlaceholder(process.env.MONGO_URI),
      severity: "critical",
      blocksStartup: true,
      message: "MONGO_URI is required in production.",
    },
    {
      key: "database",
      ok: mongoose.connection.readyState === 1,
      severity: "high",
      blocksStartup: true,
      message: mongoose.connection.readyState === 1 ? "MongoDB is connected." : "MongoDB is not connected.",
    },
    {
      key: "jwtSecret",
      ok: isLongSecret(process.env.JWT_SECRET),
      severity: "critical",
      blocksStartup: true,
      message: "JWT_SECRET should be a long random value.",
    },
    {
      key: "licensorJwtSecret",
      ok: isLongSecret(process.env.LICENSER_JWT_SECRET),
      severity: "critical",
      blocksStartup: true,
      message: "LICENSER_JWT_SECRET should be a long random value.",
    },
    {
      key: "cors",
      ok: Boolean(process.env.FRONTEND_URL) && !process.env.FRONTEND_URL.includes("*"),
      severity: "high",
      message: "FRONTEND_URL should be set to trusted origins only.",
    },
    {
      key: "backendUrl",
      ok: Boolean(process.env.BACKEND_URL),
      severity: "medium",
      message: "BACKEND_URL should be configured.",
    },
    {
      key: "email",
      ok:
        Boolean(process.env.BREVO_API_KEY) &&
        Boolean(process.env.EMAIL_FROM) &&
        !hasPlaceholder(process.env.BREVO_API_KEY) &&
        !hasPlaceholder(process.env.EMAIL_FROM),
      severity: "high",
      blocksStartup: true,
      message: "BREVO_API_KEY and EMAIL_FROM should be real production email credentials.",
    },
    {
      key: "stripe",
      ok:
        !paymentsEnabled() ||
        Boolean(process.env.STRIPE_SECRET_KEY) &&
        !hasPlaceholder(process.env.STRIPE_SECRET_KEY) &&
        Boolean(process.env.STRIPE_PUBLISHABLE_KEY) &&
        !hasPlaceholder(process.env.STRIPE_PUBLISHABLE_KEY),
      severity: "high",
      blocksStartup: paymentsEnabled(),
      message: "Stripe secret and publishable keys are required before real payments.",
    },
    {
      key: "stripeWebhook",
      ok:
        !paymentsEnabled() ||
        Boolean(process.env.STRIPE_WEBHOOK_SECRET) &&
        !hasPlaceholder(process.env.STRIPE_WEBHOOK_SECRET),
      severity: "high",
      blocksStartup: paymentsEnabled(),
      message: "Stripe webhook secret is required before automatic payment fulfillment.",
    },
    {
      key: "razorpay",
      ok:
        !razorpayEnabled() ||
        (Boolean(envValue("RAZORPAY_KEY_ID")) &&
          !hasPlaceholder(envValue("RAZORPAY_KEY_ID")) &&
          Boolean(envValue("RAZORPAY_KEY_SECRET")) &&
          !hasPlaceholder(envValue("RAZORPAY_KEY_SECRET")) &&
          Number(envValue("RAZORPAY_INR_PER_USD")) > 0),
      severity: "high",
      blocksStartup: paymentsEnabled() && razorpayEnabled(),
      message:
        "Razorpay requires RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, and RAZORPAY_INR_PER_USD when enabled.",
    },
    {
      key: "manualPurchases",
      ok:
        process.env.NODE_ENV !== "production" ||
        process.env.ALLOW_MANUAL_PURCHASE !== "true",
      severity: "high",
      message: "Manual purchase endpoint should be disabled in production.",
    },
    {
      key: "readTokens",
      ok: process.env.REQUIRE_READ_TOKEN === "true",
      severity: "high",
      message: "REQUIRE_READ_TOKEN should be true before launch.",
    },
    {
      key: "readTokenSecret",
      ok: isLongSecret(process.env.READ_TOKEN_SECRET || process.env.JWT_SECRET),
      severity: "high",
      message: "READ_TOKEN_SECRET should be a long random value, separate from JWT_SECRET when possible.",
    },
    {
      key: "admin2fa",
      ok:
        process.env.NODE_ENV !== "production" ||
        process.env.ADMIN_2FA_REQUIRED === "true",
      severity: "high",
      blocksStartup: false,
      message: "ADMIN_2FA_REQUIRED should be true in production.",
    },
    {
      key: "adminIpAllowlist",
      ok:
        process.env.NODE_ENV !== "production" ||
        Boolean(process.env.ADMIN_IP_ALLOWLIST),
      severity: "medium",
      message: "ADMIN_IP_ALLOWLIST should be configured for production admin tools.",
    },
    {
      key: "privatePdfStorage",
      ok:
        process.env.NODE_ENV !== "production" ||
        ["s3", "r2"].includes(String(process.env.PDF_STORAGE_DRIVER || "").toLowerCase()),
      severity: "high",
      blocksStartup: false,
      message: "Production PDF files should use private S3/R2 storage, not local disk.",
    },
    {
      key: "storageCredentials",
      ok:
        process.env.NODE_ENV !== "production" ||
        Boolean(process.env.AWS_S3_BUCKET || process.env.R2_BUCKET || process.env.R2_BUCKET_NAME) ||
        String(process.env.PDF_STORAGE_DRIVER || "").toLowerCase() === "local",
      severity: "high",
      blocksStartup: false,
      message: "Private storage bucket credentials are required before production PDF hosting.",
    },
    {
      key: "backupPlan",
      ok:
        process.env.NODE_ENV !== "production" ||
        process.env.MONGODB_BACKUP_ENABLED === "true" ||
        process.env.ATLAS_BACKUP_ENABLED === "true",
      severity: "medium",
      message: "Enable MongoDB/Atlas backups and test restore before launch.",
    },
    {
      key: "uploadsWritable",
      ok: (() => {
        try {
          fs.mkdirSync(uploadPath, { recursive: true });
          fs.accessSync(uploadPath, fs.constants.W_OK);
          return true;
        } catch (err) {
          return false;
        }
      })(),
      severity: "high",
      blocksStartup: false,
      message: "PDF upload folder must be writable.",
    },
  ].map(withBlockingDefaults);

  const failing = checks.filter((check) => !check.ok);
  const blocking = failing.filter((check) => check.blocksStartup);

  return {
    ready: blocking.length === 0,
    checks,
    failing,
    blocking,
    warnings: failing.filter((check) => !check.blocksStartup),
  };
};

const enforceProductionReadiness = () => {
  const security = getSecurityReport();
  const isProduction = process.env.NODE_ENV === "production";
  const blockingFailures = security.blocking;
  const warnings = security.warnings.filter((check) =>
    ["critical", "high"].includes(check.severity)
  );

  if (!isProduction) {
    if (blockingFailures.length || warnings.length) {
      console.warn("Production readiness warnings:");
      [...blockingFailures, ...warnings].forEach((check) => {
        console.warn(`- [${check.severity}] ${check.key}: ${check.message}`);
      });
    }
    return security;
  }

  if (blockingFailures.length) {
    const details = blockingFailures
      .map((check) => `- [${check.severity}] ${check.key}: ${check.message}`)
      .join("\n");
    throw new Error(`Production readiness lock failed:\n${details}`);
  }

  if (warnings.length) {
    console.warn("Production readiness high warnings:");
    warnings.forEach((check) => {
      console.warn(`- [${check.severity}] ${check.key}: ${check.message}`);
    });
  }

  return security;
};

module.exports = { getSecurityReport, enforceProductionReadiness };

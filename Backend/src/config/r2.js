const { S3Client } = require("@aws-sdk/client-s3");

const clean = (value) => String(value || "").trim();

const buildEndpointFromAccountId = (accountId) =>
  accountId ? `https://${accountId}.r2.cloudflarestorage.com` : "";

const readR2Env = () => {
  const accountId = clean(process.env.R2_ACCOUNT_ID);
  const endpoint = clean(process.env.R2_ENDPOINT) || buildEndpointFromAccountId(accountId);
  return {
    accountId,
    endpoint: endpoint.replace(/\/+$/, ""),
    accessKeyId: clean(process.env.R2_ACCESS_KEY_ID),
    secretAccessKey: clean(process.env.R2_SECRET_ACCESS_KEY),
    bucketName: clean(process.env.R2_BUCKET_NAME || process.env.R2_BUCKET),
  };
};

const getR2ConfigStatus = () => {
  const config = readR2Env();
  const missing = [];
  if (!config.endpoint) missing.push("R2_ENDPOINT or R2_ACCOUNT_ID");
  if (!config.accessKeyId) missing.push("R2_ACCESS_KEY_ID");
  if (!config.secretAccessKey) missing.push("R2_SECRET_ACCESS_KEY");
  if (!config.bucketName) missing.push("R2_BUCKET_NAME");

  return {
    configured: missing.length === 0,
    missing,
    accountIdLoaded: Boolean(config.accountId),
    endpointConfigured: Boolean(config.endpoint),
    bucketName: config.bucketName || null,
    accessKeyLoaded: Boolean(config.accessKeyId),
    secretKeyLoaded: Boolean(config.secretAccessKey),
  };
};

const getR2Config = () => {
  const config = readR2Env();
  const status = getR2ConfigStatus();

  if (!status.configured) {
    const err = new Error(`Missing Cloudflare R2 environment variables: ${status.missing.join(", ")}`);
    err.statusCode = 503;
    throw err;
  }

  return config;
};

const createR2Client = () => {
  const config = getR2Config();
  return new S3Client({
    region: "auto",
    endpoint: config.endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
};

const getSafeR2Config = () => {
  const config = getR2Config();
  return {
    accountIdLoaded: Boolean(config.accountId),
    endpoint: config.endpoint,
    bucketName: config.bucketName,
    accessKeyLoaded: Boolean(config.accessKeyId),
    secretKeyLoaded: Boolean(config.secretAccessKey),
  };
};

module.exports = {
  createR2Client,
  getR2Config,
  getR2ConfigStatus,
  getSafeR2Config,
};

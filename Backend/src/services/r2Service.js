const {
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} = require("@aws-sdk/client-s3");
const {
  createR2Client,
  getR2Config,
  getR2ConfigStatus,
  getSafeR2Config,
} = require("../config/r2");

const streamToBuffer = async (stream) => {
  if (!stream) return Buffer.alloc(0);
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
};

const getClientAndBucket = () => {
  const config = getR2Config();
  return {
    client: createR2Client(),
    bucketName: config.bucketName,
  };
};

const listR2Objects = async ({ prefix = "", maxKeys = 10 } = {}) => {
  const { client, bucketName } = getClientAndBucket();
  const result = await client.send(
    new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
      MaxKeys: maxKeys,
    }),
  );

  return {
    bucketName,
    prefix,
    keyCount: result.KeyCount || 0,
    objects: (result.Contents || []).map((object) => ({
      key: object.Key,
      size: object.Size,
      lastModified: object.LastModified,
    })),
  };
};

const headR2Object = async (key) => {
  const { client, bucketName } = getClientAndBucket();
  const result = await client.send(
    new HeadObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );

  return {
    bucketName,
    key,
    contentLength: result.ContentLength,
    contentType: result.ContentType,
    lastModified: result.LastModified,
    etag: result.ETag,
  };
};

const getR2ObjectBuffer = async (key) => {
  const { client, bucketName } = getClientAndBucket();
  const result = await client.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );

  return {
    bucketName,
    key,
    contentType: result.ContentType,
    contentLength: result.ContentLength,
    body: await streamToBuffer(result.Body),
  };
};

const testR2Connection = async ({ prefix = "", key } = {}) => {
  const { client, bucketName } = getClientAndBucket();
  await client.send(new HeadBucketCommand({ Bucket: bucketName }));
  const listResult = await listR2Objects({ prefix, maxKeys: 5 });
  const objectResult = key ? await headR2Object(key) : null;

  return {
    status: "ok",
    config: getSafeR2Config(),
    bucketName,
    list: listResult,
    object: objectResult,
  };
};

const checkR2Health = async () => {
  const status = getR2ConfigStatus();
  if (!status.configured) {
    return {
      configured: false,
      bucketName: status.bucketName,
      connection: "failed",
      error: `Missing environment variables: ${status.missing.join(", ")}`,
    };
  }

  try {
    const { client, bucketName } = getClientAndBucket();
    await client.send(new HeadBucketCommand({ Bucket: bucketName }));
    return {
      configured: true,
      bucketName,
      connection: "ok",
    };
  } catch (error) {
    return {
      configured: true,
      bucketName: status.bucketName,
      connection: "failed",
      error:
        error?.$metadata?.httpStatusCode === 403
          ? "R2 credentials do not have access to this bucket."
          : error?.$metadata?.httpStatusCode === 404
            ? "R2 bucket was not found."
            : error.message || "Could not connect to Cloudflare R2.",
    };
  }
};

module.exports = {
  checkR2Health,
  getR2ObjectBuffer,
  headR2Object,
  listR2Objects,
  testR2Connection,
};

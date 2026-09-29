const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { getR2ObjectBuffer } = require("./r2Service");

const isR2StorageEnabled = () =>
  String(process.env.PDF_STORAGE_DRIVER || "").toLowerCase() === "r2";

const getChapterPdfKey = (chapter) =>
  String(chapter?.r2Key || chapter?.pdfStorageKey || "").trim();

const getChapterR2Key = (chapter) => String(chapter?.r2Key || "").trim();

const getChapterLocalPdfKey = (chapter) =>
  String(chapter?.pdfStorageKey || "").trim();

const fetchR2PdfBuffer = async (key) => {
  if (!key) {
    const err = new Error("Chapter PDF R2 key is missing.");
    err.statusCode = 500;
    throw err;
  }

  try {
    const object = await getR2ObjectBuffer(key);
    return object.body;
  } catch (error) {
    const err = new Error(
      error?.$metadata?.httpStatusCode === 404
        ? "PDF not found in Cloudflare R2."
        : "Could not fetch PDF from Cloudflare R2.",
    );
    err.statusCode = error?.$metadata?.httpStatusCode === 404 ? 404 : 502;
    throw err;
  }
};

const withChapterPdfPath = async (chapter, handler) => {
  const r2Key = getChapterR2Key(chapter);

  if (isR2StorageEnabled() || r2Key) {
    const pdfBuffer = await fetchR2PdfBuffer(r2Key);
    const tempPath = path.join(
      os.tmpdir(),
      `heartsreader-${crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex")}.pdf`,
    );

    await fs.promises.writeFile(tempPath, pdfBuffer);
    try {
      return await handler(tempPath);
    } finally {
      fs.promises.unlink(tempPath).catch(() => {});
    }
  }

  const localKey = getChapterLocalPdfKey(chapter);
  if (localKey) {
    const localPath = path.resolve(localKey);
    if (!fs.existsSync(localPath)) {
      const err = new Error("PDF file not found on server.");
      err.statusCode = 500;
      throw err;
    }
    return handler(localPath);
  }

  const err = new Error("Chapter PDF storage key is missing.");
  err.statusCode = 500;
  throw err;
};

module.exports = {
  isR2StorageEnabled,
  getChapterPdfKey,
  getChapterR2Key,
  fetchR2PdfBuffer,
  withChapterPdfPath,
};

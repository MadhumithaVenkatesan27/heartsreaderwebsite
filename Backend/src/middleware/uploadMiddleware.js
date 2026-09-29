const fs = require("fs");
const path = require("path");
const multer = require("multer");

const pdfRoot = path.resolve(process.env.PDF_STORAGE_PATH || "./uploads/pdfs");

const ensurePdfRoot = () => {
  fs.mkdirSync(pdfRoot, { recursive: true });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensurePdfRoot();
    cb(null, pdfRoot);
  },
  filename: (req, file, cb) => {
    const safeName = path
      .parse(file.originalname)
      .name.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    cb(null, `${Date.now()}-${safeName || "chapter"}.pdf`);
  },
});

const pdfUpload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    if (file.mimetype !== "application/pdf" || ext !== ".pdf") {
      return cb(new Error("Only PDF files are allowed."));
    }
    cb(null, true);
  },
});

module.exports = { pdfUpload };

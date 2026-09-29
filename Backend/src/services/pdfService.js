const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const fs = require("fs").promises;
const path = require("path");

const safeText = (value) => String(value || "").replace(/[^\x20-\x7E]/g, "");

const watermarkPdf = async (masterPdfPath, userName, userEmail, metadata = {}) => {
  const masterBytes = await fs.readFile(masterPdfPath);
  const pdfDoc = await PDFDocument.load(masterBytes);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  const cleanName = safeText(userName);
  const cleanEmail = safeText(userEmail);
  const cleanUserId = safeText(metadata.userId);
  const cleanInvoice = safeText(metadata.invoiceNumber);
  const trackingText = [
    "Crossed Hearts",
    cleanUserId && `User ${cleanUserId}`,
    cleanInvoice && `Invoice ${cleanInvoice}`,
  ]
    .filter(Boolean)
    .join(" - ");

  pdfDoc.setTitle(safeText(metadata.bookTitle || "Crossed Hearts Reader Copy"));
  pdfDoc.setAuthor("Crossed Hearts");
  pdfDoc.setSubject(`Licensed reader copy for ${cleanEmail}`);
  pdfDoc.setKeywords(["Crossed Hearts", cleanEmail, cleanUserId, cleanInvoice].filter(Boolean));
  pdfDoc.setProducer("Crossed Hearts Secure Reader");
  pdfDoc.setCreator("Crossed Hearts Secure Reader");
  pdfDoc.setModificationDate(new Date());

  for (const page of pages) {
    const { width } = page.getSize();

    page.drawText(`${trackingText}${cleanEmail ? ` - ${cleanEmail}` : ""}`, {
      x: 40,
      y: 20,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity: 0,
    });

    page.drawText(`${cleanUserId} ${cleanInvoice}`, {
      x: Math.max(width - 160, 20),
      y: 8,
      size: 4,
      font,
      color: rgb(0.75, 0.75, 0.75),
      opacity: 0,
    });
  }

  return pdfDoc.save();
};

const buildPreviewWatermarkedPdf = async (masterPdfPath, metadata = {}) =>
  watermarkPdf(masterPdfPath, "", "", {
    ...metadata,
    accessType: "preview",
  });

const buildReaderWatermarkedPdf = async (
  masterPdfPath,
  userId,
  userName,
  userEmail,
  metadata = {}
) =>
  watermarkPdf(masterPdfPath, userName, userEmail, {
    ...metadata,
    userId,
  });

const generateWatermarkedPdf = async (
  masterPdfPath,
  userId,
  userName,
  userEmail,
  metadata = {}
) => {
  const watermarkedBytes = await watermarkPdf(masterPdfPath, userName, userEmail, {
    ...metadata,
    userId,
  });
  const storagePath = process.env.PDF_STORAGE_PATH || "./uploads/pdfs";
  const filename = `${userId}_v3_${path.basename(masterPdfPath)}`;
  const outputPath = path.join(storagePath, filename);

  await fs.mkdir(storagePath, { recursive: true });
  await fs.writeFile(outputPath, watermarkedBytes);
  return filename;
};

module.exports = {
  watermarkPdf,
  buildPreviewWatermarkedPdf,
  buildReaderWatermarkedPdf,
  generateWatermarkedPdf,
};

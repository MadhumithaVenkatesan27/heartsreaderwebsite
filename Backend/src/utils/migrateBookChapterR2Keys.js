const path = require("path");
const { webcrypto } = require("crypto");

require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

if (!globalThis.crypto?.getRandomValues) {
  globalThis.crypto = webcrypto;
}

const mongoose = require("mongoose");
const Book = require("../models/Book");
const { listR2Objects } = require("../services/r2Service");

const BOOK_FOLDER_OVERRIDES = {
  "matchmaker-v1": "matchmakers-fiancee",
  matchmaker: "matchmakers-fiancee",
  "the-matchmaker-s-fiance-vol-1": "matchmakers-fiancee",
};

const boolArg = (name) => process.argv.includes(name);

const getArgValue = (name) => {
  const prefix = `${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : null;
};

const isDryRun = !boolArg("--apply");
const shouldListR2 = !boolArg("--no-r2-list");
const onlySlug = getArgValue("--slug");

const toTwoDigit = (value) => String(value).padStart(2, "0");

const normalizeSlug = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const getR2FolderForBook = (book) =>
  BOOK_FOLDER_OVERRIDES[book.slug] || normalizeSlug(book.slug || book.title);

const getChapterNumber = (chapter, index) => {
  const value = Number(chapter.chapterNumber || chapter.order || index + 1);
  return Number.isFinite(value) && value > 0 ? value : index + 1;
};

const getFallbackR2Key = (book, chapterNumber) =>
  `books/${getR2FolderForBook(book)}/chapter-${toTwoDigit(chapterNumber)}.pdf`;

const chapterPatterns = (chapterNumber) => {
  const padded = toTwoDigit(chapterNumber);
  return [
    new RegExp(`第0*${chapterNumber}話`, "i"),
    new RegExp(`chapter[-_\\s]*0*${chapterNumber}(?:\\D|$)`, "i"),
    new RegExp(`ch[-_\\s]*0*${chapterNumber}(?:\\D|$)`, "i"),
    new RegExp(`(?:^|[/_\\-\\s])0*${chapterNumber}(?:\\D|$)`, "i"),
    new RegExp(`chapter-${padded}\\.pdf$`, "i"),
  ];
};

const findR2KeyForChapter = (objects, chapterNumber) => {
  const pdfObjects = objects.filter((object) => /\.pdf$/i.test(object.key || ""));
  const patterns = chapterPatterns(chapterNumber);
  const match = pdfObjects.find((object) =>
    patterns.some((pattern) => pattern.test(object.key || "")),
  );
  return match?.key || null;
};

const listBookFolderObjects = async (book) => {
  if (!shouldListR2) return [];

  const prefix = `books/${getR2FolderForBook(book)}/`;
  try {
    const result = await listR2Objects({ prefix, maxKeys: 1000 });
    return result.objects || [];
  } catch (err) {
    console.warn(`R2 list failed for ${book.slug} (${prefix}): ${err.message}`);
    return [];
  }
};

const migrate = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required before running this migration.");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connected to MongoDB. Mode: ${isDryRun ? "dry-run" : "apply"}`);

  const filter = onlySlug ? { slug: onlySlug } : {};
  const books = await Book.find(filter);

  const summary = {
    booksScanned: books.length,
    booksChanged: 0,
    chaptersScanned: 0,
    chaptersChanged: 0,
    r2Matched: 0,
    fallbackKeys: 0,
  };

  for (const book of books) {
    const objects = await listBookFolderObjects(book);
    let bookChanged = false;

    for (const [index, chapter] of book.chapters.entries()) {
      summary.chaptersScanned += 1;

      const chapterNumber = getChapterNumber(chapter, index);
      const chapterTitle = chapter.chapterTitle || chapter.title || `Chapter ${chapterNumber}`;
      const matchedR2Key = findR2KeyForChapter(objects, chapterNumber);
      const nextR2Key = matchedR2Key || getFallbackR2Key(book, chapterNumber);
      const nextIsFree = chapterNumber === 1;
      const nextAccessStatus = nextIsFree ? "free" : "paid";

      const changed =
        chapter.chapterNumber !== chapterNumber ||
        chapter.chapterTitle !== chapterTitle ||
        chapter.r2Key !== nextR2Key ||
        chapter.isFree !== nextIsFree ||
        chapter.isPreview !== nextIsFree ||
        chapter.accessStatus !== nextAccessStatus;

      if (!changed) continue;

      chapter.chapterNumber = chapterNumber;
      chapter.chapterTitle = chapterTitle;
      chapter.r2Key = nextR2Key;
      chapter.isFree = nextIsFree;
      chapter.isPreview = nextIsFree;
      chapter.accessStatus = nextAccessStatus;

      bookChanged = true;
      summary.chaptersChanged += 1;
      if (matchedR2Key) summary.r2Matched += 1;
      else summary.fallbackKeys += 1;

      console.log(
        `${isDryRun ? "[dry-run]" : "[update]"} ${book.slug} chapter ${chapterNumber}: ${nextR2Key}`,
      );
    }

    if (bookChanged) {
      summary.booksChanged += 1;
      if (!isDryRun) await book.save();
    }
  }

  console.log("Migration summary:");
  console.log(JSON.stringify(summary, null, 2));

  if (isDryRun) {
    console.log("No changes were saved. Re-run with --apply to update MongoDB.");
  }

  await mongoose.disconnect();
};

migrate().catch(async (err) => {
  console.error("R2 chapter key migration failed:", err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});

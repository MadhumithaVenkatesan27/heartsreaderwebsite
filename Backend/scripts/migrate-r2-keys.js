const path = require("path");
const { webcrypto } = require("crypto");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

if (!globalThis.crypto?.getRandomValues) {
  globalThis.crypto = webcrypto;
}

const mongoose = require("mongoose");
const Book = require("../src/models/Book");
const { listR2Objects } = require("../src/services/r2Service");

const BOOK_SLUG = "matchmaker-v1";
const R2_PREFIX = "books/matchmakers-fiancee/";
const APPLY = process.argv.includes("--apply");
const japaneseChapterPattern = new RegExp("\\u7b2c\\s*0*(\\d+)\\s*\\u8a71", "i");
const bonusPattern = new RegExp("(\\u63cf\\u304d\\u4e0b\\u308d\\u3057|\\u3042\\u3068\\u304c\\u304d)", "i");
const MAX_NUMBERED_CHAPTER = 7;
const BONUS_TITLE = "Bonus Chapter";

const twoDigit = (value) => String(value).padStart(2, "0");

const getChapterNumber = (chapter, index) => {
  const value = Number(chapter.chapterNumber || chapter.order || index + 1);
  return Number.isFinite(value) && value > 0 ? value : index + 1;
};

const fileNameFromKey = (key) => path.posix.basename(String(key || ""));

const extractChapterNumberFromKey = (key) => {
  const fileName = fileNameFromKey(key);
  const japaneseMatch = fileName.match(japaneseChapterPattern);
  if (japaneseMatch) {
    const chapterNumber = Number(japaneseMatch[1]);
    return chapterNumber >= 1 && chapterNumber <= MAX_NUMBERED_CHAPTER
      ? chapterNumber
      : null;
  }

  const namedMatch = fileName.match(/(?:chapter|ch)[-_\s]*0*(\d+)(?:\D|$)/i);
  if (namedMatch) {
    const chapterNumber = Number(namedMatch[1]);
    return chapterNumber >= 1 && chapterNumber <= MAX_NUMBERED_CHAPTER
      ? chapterNumber
      : null;
  }

  return null;
};

const isBonusKey = (key) => bonusPattern.test(fileNameFromKey(key));

const getPdfObjects = (objects) =>
  objects
    .filter((object) => /\.pdf$/i.test(object.key || ""))
    .sort((left, right) => String(left.key || "").localeCompare(String(right.key || "")));

const buildR2ChapterMap = (objects) => {
  const chapterMap = new Map();
  const pdfObjects = getPdfObjects(objects);

  console.log("R2 PDF objects found:");
  pdfObjects.forEach((object) => {
    const chapterNumber = extractChapterNumberFromKey(object.key);
    const bonus = isBonusKey(object.key);
    console.log(
      `- ${object.key}${
        chapterNumber ? ` -> chapter ${chapterNumber}` : bonus ? " -> bonus" : " -> no chapter marker"
      }`,
    );

    if (!chapterNumber) return;
    if (chapterMap.has(chapterNumber)) {
      console.warn(
        `Duplicate R2 chapter marker for chapter ${chapterNumber}; keeping ${chapterMap.get(chapterNumber)} and ignoring ${object.key}`,
      );
      return;
    }
    chapterMap.set(chapterNumber, object.key);
  });

  return chapterMap;
};

const findBonusR2Key = (objects) => {
  const matches = getPdfObjects(objects).filter((object) => isBonusKey(object.key));
  if (matches.length > 1) {
    console.warn(
      `Multiple bonus PDF objects found; using ${matches[0].key} and ignoring ${matches
        .slice(1)
        .map((object) => object.key)
        .join(", ")}`,
    );
  }
  return matches[0]?.key || null;
};

const migrate = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required before running the migration.");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connected to MongoDB. Mode: ${APPLY ? "apply" : "dry-run"}`);
  console.log(`Book slug: ${BOOK_SLUG}`);
  console.log(`R2 prefix: ${R2_PREFIX}`);

  const book = await Book.findOne({ slug: BOOK_SLUG });
  if (!book) {
    throw new Error(`Book not found for slug: ${BOOK_SLUG}`);
  }

  const r2Objects = await listR2Objects({ prefix: R2_PREFIX, maxKeys: 1000 });
  const objects = r2Objects.objects || [];
  const r2ChapterMap = buildR2ChapterMap(objects);
  const bonusR2Key = findBonusR2Key(objects);
  const usedR2Keys = new Set();
  console.log(`R2 PDF object count under prefix: ${getPdfObjects(objects).length}`);
  if (bonusR2Key) console.log(`Bonus PDF object: ${bonusR2Key}`);

  const summary = {
    booksScanned: 1,
    booksChanged: 0,
    chaptersScanned: book.chapters.filter((chapter) => chapter.type !== "bonus").length,
    chaptersChanged: 0,
    r2Matched: 0,
    fallbackKeys: 0,
    bonusMatched: bonusR2Key ? 1 : 0,
    bonusChanged: false,
    saved: false,
  };

  let changed = false;

  book.chapters
    .filter((chapter) => chapter.type !== "bonus")
    .forEach((chapter, index) => {
    const chapterNumber = getChapterNumber(chapter, index);
    if (chapterNumber > MAX_NUMBERED_CHAPTER) {
      console.log(`[skip] Chapter ${chapterNumber}: no numbered R2 chapter expected`);
      return;
    }
    const chapterTitle = chapter.chapterTitle || chapter.title || `Chapter ${chapterNumber}`;
    const matchedKey = r2ChapterMap.get(chapterNumber) || null;
    if (!matchedKey) {
      summary.fallbackKeys += 1;
      console.log(`[missing] Chapter ${chapterNumber}: no matching R2 PDF found`);
      return;
    }
    const r2Key = matchedKey;
    const isFree = chapterNumber === 1;

    if (usedR2Keys.has(matchedKey)) {
      throw new Error(`R2 object was matched more than once: ${matchedKey}`);
    }
    usedR2Keys.add(matchedKey);
    summary.r2Matched += 1;

    const needsUpdate =
      chapter.type !== "chapter" ||
      chapter.chapterNumber !== chapterNumber ||
      chapter.chapterTitle !== chapterTitle ||
      chapter.r2Key !== r2Key ||
      chapter.isFree !== isFree;

    console.log(
      `${needsUpdate ? (APPLY ? "[update]" : "[dry-run]") : "[skip]"} Chapter ${chapterNumber}: ${r2Key} | isFree=${isFree}`,
    );

    if (!needsUpdate) return;

    chapter.chapterNumber = chapterNumber;
    chapter.chapterTitle = chapterTitle;
    chapter.r2Key = r2Key;
    chapter.type = "chapter";
    chapter.isFree = isFree;

    changed = true;
    summary.chaptersChanged += 1;
  });

  if (bonusR2Key) {
    if (usedR2Keys.has(bonusR2Key)) {
      throw new Error(`Bonus R2 object was already used as a numbered chapter: ${bonusR2Key}`);
    }
    usedR2Keys.add(bonusR2Key);
    summary.r2Matched += 1;

    let bonusChapter = book.chapters.find(
      (chapter) => chapter.type === "bonus" || chapter.r2Key === bonusR2Key,
    );
    if (!bonusChapter) {
      bonusChapter = book.chapters.create({
        title: BONUS_TITLE,
        chapterTitle: BONUS_TITLE,
        order: book.chapters.length + 1,
        chapterNumber: null,
        r2Key: bonusR2Key,
        isFree: false,
        isPreview: false,
        accessStatus: "paid",
        type: "bonus",
        price: 0.99,
      });
      book.chapters.push(bonusChapter);
      changed = true;
      summary.chaptersChanged += 1;
      summary.bonusChanged = true;
      console.log(`${APPLY ? "[update]" : "[dry-run]"} Bonus Chapter: ${bonusR2Key} | isFree=false`);
    } else {
      const needsBonusUpdate =
        bonusChapter.title !== BONUS_TITLE ||
        bonusChapter.chapterTitle !== BONUS_TITLE ||
        bonusChapter.chapterNumber !== null ||
        bonusChapter.r2Key !== bonusR2Key ||
        bonusChapter.isFree !== false ||
        bonusChapter.type !== "bonus";

      console.log(
        `${needsBonusUpdate ? (APPLY ? "[update]" : "[dry-run]") : "[skip]"} Bonus Chapter: ${bonusR2Key} | isFree=false`,
      );

      if (needsBonusUpdate) {
        bonusChapter.title = BONUS_TITLE;
        bonusChapter.chapterTitle = BONUS_TITLE;
        bonusChapter.chapterNumber = null;
        bonusChapter.r2Key = bonusR2Key;
        bonusChapter.isFree = false;
        bonusChapter.isPreview = false;
        bonusChapter.accessStatus = "paid";
        bonusChapter.type = "bonus";
        changed = true;
        summary.chaptersChanged += 1;
        summary.bonusChanged = true;
      }
    }
  } else {
    summary.fallbackKeys += 1;
    console.log("[missing] Bonus Chapter: no matching bonus R2 PDF found");
  }

  if (changed) {
    summary.booksChanged = 1;
    if (APPLY) {
      console.log("Validating Matchmaker book before save...");
      try {
        await book.validate();
        console.log("Validation passed. Saving Matchmaker book...");
        await book.save();
        summary.saved = true;
        console.log("Matchmaker book saved successfully.");
      } catch (saveError) {
        console.error("Matchmaker book save failed:", {
          message: saveError.message,
          name: saveError.name,
        });
        throw saveError;
      }
    }
  }

  console.log("Migration summary:");
  console.log(JSON.stringify(summary, null, 2));

  if (!APPLY) {
    console.log("Dry-run only. No MongoDB changes were saved.");
  }

  await mongoose.disconnect();
};

migrate().catch(async (error) => {
  console.error("R2 key migration failed:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});

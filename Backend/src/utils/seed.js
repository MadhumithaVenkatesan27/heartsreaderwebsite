const path = require("path");
const { webcrypto } = require("crypto");

require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

if (!globalThis.crypto?.getRandomValues) {
  globalThis.crypto = webcrypto;
}

const mongoose = require("mongoose");
const User = require("../models/User");
const Book = require("../models/Book");
const Licensor = require("../models/Licensor");
const Purchase = require("../models/Purchase");
const BookAccess = require("../models/BookAccess");
const Review = require("../models/Review");
const ReadingProgress = require("../models/ReadingProgress");
const DiscussionThread = require("../models/DiscussionThread");
const SupportTicket = require("../models/SupportTicket");
const Notification = require("../models/Notification");

const DEMO_TAG = "seed_demo";
const PASSWORD = "TestPass1!";

const resetDemoData = async () => {
  const demoUsers = await User.find({
    email: { $in: ["admin@test.com", "reader@test.com"] },
  }).select("_id");
  const demoBooks = await Book.find({
    slug: { $in: ["winterberry-dreamspace", "crossed-hearts-moonlit-pages"] },
  }).select("_id");
  const userIds = demoUsers.map((user) => user._id);
  const bookIds = demoBooks.map((book) => book._id);

  await Promise.all([
    User.deleteMany({ email: { $in: ["admin@test.com", "reader@test.com"] } }),
    Licensor.deleteMany({ email: "jane@publisher.com" }),
    Book.deleteMany({
      slug: { $in: ["winterberry-dreamspace", "crossed-hearts-moonlit-pages"] },
    }),
    Purchase.deleteMany({ "metadata.seed": DEMO_TAG }),
    BookAccess.deleteMany({ "metadata.seed": DEMO_TAG }),
    Review.deleteMany({ $or: [{ userId: { $in: userIds } }, { bookId: { $in: bookIds } }] }),
    ReadingProgress.deleteMany({ $or: [{ userId: { $in: userIds } }, { bookId: { $in: bookIds } }] }),
    DiscussionThread.deleteMany({ $or: [{ userId: { $in: userIds } }, { bookId: { $in: bookIds } }] }),
    SupportTicket.deleteMany({ "metadata.seed": DEMO_TAG }),
    Notification.deleteMany({ "metadata.seed": DEMO_TAG }),
  ]);
};

const upsertUser = async ({ email, name, role = "user" }) => {
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name,
      email,
      password: PASSWORD,
      role,
      status: "active",
      isActive: true,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    });
  } else {
    user.name = name;
    user.role = role;
    user.status = "active";
    user.isActive = true;
    user.isEmailVerified = true;
    user.emailVerifiedAt = user.emailVerifiedAt || new Date();
    await user.save({ validateBeforeSave: false });
  }
  return user;
};

const createBook = async (bookData) => {
  const oldBook = await Book.findOne({ slug: bookData.slug }).select("_id");
  if (oldBook) {
    await Promise.all([
      BookAccess.deleteMany({ bookId: oldBook._id, "metadata.seed": DEMO_TAG }),
      Review.deleteMany({ bookId: oldBook._id }),
      ReadingProgress.deleteMany({ bookId: oldBook._id }),
      DiscussionThread.deleteMany({ bookId: oldBook._id }),
    ]);
  }
  await Book.deleteOne({ slug: bookData.slug });
  return Book.create(bookData);
};

const seed = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required before running seed.");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB for seeding.");

  if (process.argv.includes("--reset")) {
    await resetDemoData();
    console.log("Existing demo data removed.");
  }

  const admin = await upsertUser({
    name: "Demo Admin",
    email: "admin@test.com",
    role: "admin",
  });

  const reader = await upsertUser({
    name: "Test Reader",
    email: "reader@test.com",
    role: "user",
  });

  const book = await createBook({
    title: "Winterberry Dreamspace",
    slug: "winterberry-dreamspace",
    author: "Crossed Hearts",
    description: "A romantic fantasy about memory, longing, and second chances.",
    coverImageUrl: "https://example.com/winterberry-dreamspace.jpg",
    price: 7.99,
    genres: ["romance", "fantasy"],
    isPublished: true,
    releaseStatus: "published",
    metadataTag: DEMO_TAG,
    chapters: [
      {
        title: "Chapter 1 - The Door in the Snow",
        order: 1,
        pdfStorageKey: "./uploads/pdfs/demo_chapter_1.pdf",
        isPreview: true,
        price: 0,
      },
      {
        title: "Chapter 2 - A Letter Without Ink",
        order: 2,
        pdfStorageKey: "./uploads/pdfs/demo_chapter_2.pdf",
        isPreview: false,
        price: 1.99,
      },
      {
        title: "Chapter 3 - The Orchard of Bells",
        order: 3,
        pdfStorageKey: "./uploads/pdfs/demo_chapter_3.pdf",
        isPreview: false,
        price: 1.99,
      },
    ],
    analytics: {
      views: 240,
      addedToCart: 36,
      purchases: 1,
    },
    ratingAverage: 4.7,
    ratingCount: 1,
  });

  const comingSoon = await createBook({
    title: "Crossed Hearts: Moonlit Pages",
    slug: "crossed-hearts-moonlit-pages",
    author: "Crossed Hearts",
    description: "A coming-soon title for testing the discovery feed.",
    coverImageUrl: "https://example.com/moonlit-pages.jpg",
    price: 9.99,
    genres: ["romance", "mystery"],
    isPublished: false,
    releaseStatus: "coming_soon",
    releaseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    preorderEnabled: true,
    metadataTag: DEMO_TAG,
    chapters: [
      {
        title: "Preview - Moonlit Pages",
        order: 1,
        pdfStorageKey: "./uploads/pdfs/demo_coming_soon_preview.pdf",
        isPreview: true,
        price: 0,
      },
    ],
  });

  const secondChapter = book.chapters[1];
  const invoiceNumber = "CH-DEMO-0001";

  const purchase = await Purchase.findOneAndUpdate(
    { invoiceNumber },
    {
      userId: reader._id,
      bookId: book._id,
      chapterIds: [secondChapter._id],
      purchaseType: "chapter",
      amount: secondChapter.price,
      currency: "USD",
      invoiceNumber,
      bookTitle: book.title,
      chapterTitles: [secondChapter.title],
      status: "paid",
      paidAt: new Date(),
      metadata: { seed: DEMO_TAG },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await User.updateOne({ _id: reader._id }, { $pull: { purchases: { invoiceNumber } } });
  await User.updateOne(
    { _id: reader._id },
    { $addToSet: { wishlist: comingSoon._id } }
  );
  await User.updateOne(
    { _id: reader._id },
    {
      $push: {
        purchases: {
          bookId: book._id,
          chapterIds: [secondChapter._id],
          purchaseType: "chapter",
          amount: secondChapter.price,
          currency: "USD",
          invoiceNumber,
          bookTitle: book.title,
          chapterTitles: [secondChapter.title],
          purchasedAt: new Date(),
        },
      },
    }
  );

  await BookAccess.updateOne(
    {
      userId: reader._id,
      bookId: book._id,
      chapterId: secondChapter._id,
      accessType: "chapter_purchase",
    },
    {
      $setOnInsert: {
        purchaseId: purchase._id,
        grantedAt: new Date(),
        metadata: { seed: DEMO_TAG },
      },
    },
    { upsert: true }
  );

  await Review.findOneAndUpdate(
    { userId: reader._id, bookId: book._id },
    {
      rating: 5,
      title: "Beautiful start",
      comment: "The first chapter feels polished and cinematic.",
      status: "published",
      metadata: { seed: DEMO_TAG },
    },
    { upsert: true, new: true }
  );

  await ReadingProgress.findOneAndUpdate(
    { userId: reader._id, bookId: book._id },
    {
      chapterId: secondChapter._id,
      page: 4,
      percentage: 42,
      lastReadAt: new Date(),
      metadata: { seed: DEMO_TAG },
    },
    { upsert: true, new: true }
  );

  await DiscussionThread.deleteMany({
    userId: reader._id,
    title: "What did the snowy door mean?",
  });
  await DiscussionThread.create({
    userId: reader._id,
    bookId: book._id,
    chapterId: book.chapters[0]._id,
    title: "What did the snowy door mean?",
    message: "I think the door is tied to memory rather than place. Curious what others think.",
    status: "published",
    metadata: { seed: DEMO_TAG },
  });

  await SupportTicket.deleteMany({
    userId: reader._id,
    subject: "Demo PDF reading question",
  });
  await SupportTicket.create({
    userId: reader._id,
    subject: "Demo PDF reading question",
    category: "pdf",
    priority: "normal",
    status: "open",
    messages: [
      {
        senderId: reader._id,
        senderRole: "user",
        message: "This is a demo ticket for testing support flows.",
      },
    ],
    metadata: { seed: DEMO_TAG },
  });

  await Notification.deleteMany({
    userId: reader._id,
    title: "Welcome to the demo library",
  });
  await Notification.create({
    userId: reader._id,
    title: "Welcome to the demo library",
    message: "Your sample book, wishlist, progress, and support ticket are ready.",
    type: "general",
    metadata: { seed: DEMO_TAG },
  });

  let licensor = await Licensor.findOne({ email: "jane@publisher.com" });
  if (!licensor) {
    licensor = new Licensor({
      name: "Jane Publisher",
      email: "jane@publisher.com",
      password: PASSWORD,
    });
  }
  licensor.name = "Jane Publisher";
  licensor.organisation = "Manga Press";
  licensor.role = "publisher";
  licensor.grantedBooks = [book._id];
  licensor.isActive = true;
  if (licensor.isNew) licensor.password = PASSWORD;
  await licensor.save();

  console.log("Seed complete.");
  console.log(`Admin:    admin@test.com / ${PASSWORD}`);
  console.log(`Reader:   reader@test.com / ${PASSWORD}`);
  console.log(`Licensor: jane@publisher.com / ${PASSWORD}`);
  console.log(`Book:     ${book.title}`);
  console.log("Tip: run `npm run seed -- --reset` to recreate demo data.");
  await mongoose.disconnect();
};

seed().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});

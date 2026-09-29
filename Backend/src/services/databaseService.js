const mongoose = require("mongoose");
const User = require("../models/User");
const Book = require("../models/Book");
const Purchase = require("../models/Purchase");
const BookAccess = require("../models/BookAccess");
const ReadingProgress = require("../models/ReadingProgress");
const Review = require("../models/Review");
const RefundRequest = require("../models/RefundRequest");
const SupportTicket = require("../models/SupportTicket");
const Notification = require("../models/Notification");
const DiscussionThread = require("../models/DiscussionThread");
const PhysicalOrder = require("../models/PhysicalOrder");
const PaymentTransaction = require("../models/PaymentTransaction");

require("../models/EmailLog");
require("../models/UserActivity");
require("../models/Licensor");
require("../models/AdminAuditLog");

const sameId = (left, right) => left?.toString() === right?.toString();

const isFreeChapter = (book, chapter) => {
  if (!book?.chapters?.length || !chapter) return false;
  return Number(chapter?.chapterNumber || chapter?.order) === 1;
};

const getExpectedAccessRecords = (purchase, book) => {
  if (!book) return [];

  const chapterIds =
    purchase.purchaseType === "chapter"
      ? purchase.chapterIds || []
      : book.chapters
          .filter((chapter) => !isFreeChapter(book, chapter))
          .map((chapter) => chapter._id);

  return chapterIds.map((chapterId) => ({
    userId: purchase.userId,
    bookId: purchase.bookId,
    chapterId,
    purchaseId: purchase._id,
    accessType:
      purchase.purchaseType === "chapter"
        ? "chapter_purchase"
        : "full_book_purchase",
  }));
};

const getCollectionOverview = async () => {
  const db = mongoose.connection.db;
  if (!db) return [];

  const collections = await db.listCollections().toArray();

  return Promise.all(
    collections.map(async ({ name }) => {
      const collection = db.collection(name);
      const [documents, indexes] = await Promise.all([
        collection.countDocuments(),
        collection.indexes(),
      ]);

      return {
        name,
        documents,
        indexes: indexes.length,
        indexNames: indexes.map((index) => index.name),
      };
    }),
  );
};

const getDatabaseOverview = async () => {
  const connection = mongoose.connection;
  const collections = await getCollectionOverview();

  return {
    connected: connection.readyState === 1,
    name: connection.name || null,
    host: connection.host || null,
    collections,
  };
};

const ensureModelIndexes = async () => {
  const models = Object.values(mongoose.models);

  const results = await Promise.all(
    models.map(async (model) => {
      await model.createIndexes();
      return {
        model: model.modelName,
        collection: model.collection.name,
        status: "ok",
      };
    }),
  );

  return results;
};

const auditBooks = async () => {
  const books = await Book.find().lean();
  const duplicateSlugs = await Book.aggregate([
    { $group: { _id: "$slug", count: { $sum: 1 }, ids: { $push: "$_id" } } },
    { $match: { count: { $gt: 1 } } },
  ]);

  const invalidBooks = books
    .map((book) => {
      const problems = [];
      const orders = new Set();
      const duplicateOrders = new Set();

      if (typeof book.price !== "number" || book.price < 0) {
        problems.push("invalid_price");
      }
      if (!book.title) problems.push("missing_title");
      if (!book.slug) problems.push("missing_slug");
      if (!book.coverImageKey && !book.coverImageR2Key && !book.coverImageUrl) {
        problems.push("missing_cover_reference");
      }

      (book.chapters || []).forEach((chapter) => {
        const chapterNumber = Number(chapter.chapterNumber || chapter.order || 0);
        if (!chapterNumber && chapter.type !== "bonus") {
          problems.push(`missing_chapter_number:${chapter._id}`);
        }
        if (!chapter.chapterTitle && !chapter.title) {
          problems.push(`missing_chapter_title:${chapter._id}`);
        }
        if (typeof chapter.price !== "number" || chapter.price < 0) {
          problems.push(`invalid_chapter_price:${chapter._id}`);
        }
        if (orders.has(chapter.order)) duplicateOrders.add(chapter.order);
        orders.add(chapter.order);
        if (!chapter.r2Key) {
          problems.push(`missing_r2_key:${chapter._id}`);
        }
        if (chapterNumber === 1 && chapter.isFree !== true) {
          problems.push(`chapter_1_not_free:${chapter._id}`);
        }
        if (chapterNumber > 1 && chapter.isFree === true) {
          problems.push(`paid_chapter_marked_free:${chapter._id}`);
        }
        if (chapterNumber > 1 && chapter.accessStatus === "free") {
          problems.push(`paid_chapter_access_status_free:${chapter._id}`);
        }
      });

      duplicateOrders.forEach((order) =>
        problems.push(`duplicate_chapter_order:${order}`),
      );

      return problems.length
        ? {
            bookId: book._id,
            title: book.title,
            slug: book.slug,
            problems,
          }
        : null;
    })
    .filter(Boolean);

  return { duplicateSlugs, invalidBooks };
};

const auditUsers = async () => {
  const duplicateEmails = await User.aggregate([
    { $match: { email: { $type: "string" } } },
    { $group: { _id: "$email", count: { $sum: 1 }, ids: { $push: "$_id" } } },
    { $match: { count: { $gt: 1 } } },
  ]);

  const invalidUsers = await User.find({
    $or: [
      { email: { $exists: false } },
      { email: "" },
      { name: { $exists: false } },
      { name: "" },
      { status: { $nin: ["active", "blocked", "deleted"] } },
    ],
  })
    .select("_id name email status role createdAt")
    .lean();

  return { duplicateEmails, invalidUsers };
};

const auditPayments = async () => {
  const duplicatePurchaseRazorpayPaymentIds = await Purchase.aggregate([
    { $match: { razorpayPaymentId: { $type: "string", $ne: "" } } },
    { $group: { _id: "$razorpayPaymentId", count: { $sum: 1 }, ids: { $push: "$_id" } } },
    { $match: { count: { $gt: 1 } } },
  ]);
  const duplicatePhysicalRazorpayPaymentIds = await PhysicalOrder.aggregate([
    { $match: { razorpayPaymentId: { $type: "string", $ne: "" } } },
    { $group: { _id: "$razorpayPaymentId", count: { $sum: 1 }, ids: { $push: "$_id" } } },
    { $match: { count: { $gt: 1 } } },
  ]);
  const duplicateProviderEventIds = await PaymentTransaction.aggregate([
    { $match: { providerEventId: { $type: "string", $ne: "" } } },
    {
      $group: {
        _id: { provider: "$provider", providerEventId: "$providerEventId" },
        count: { $sum: 1 },
        ids: { $push: "$_id" },
      },
    },
    { $match: { count: { $gt: 1 } } },
  ]);

  return {
    duplicatePurchaseRazorpayPaymentIds,
    duplicatePhysicalRazorpayPaymentIds,
    duplicateProviderEventIds,
  };
};

const auditPhysicalOrders = async () => {
  const invalidOrders = await PhysicalOrder.find({
    $or: [
      { "customer.name": { $in: [null, ""] } },
      { "customer.email": { $in: [null, ""] } },
      { "customer.phone": { $in: [null, ""] } },
      { "shippingAddress.line1": { $in: [null, ""] } },
      { "shippingAddress.city": { $in: [null, ""] } },
      { "shippingAddress.state": { $in: [null, ""] } },
      { "shippingAddress.postalCode": { $in: [null, ""] } },
      { "shippingAddress.country": { $in: [null, ""] } },
      { items: { $exists: false } },
      { items: { $size: 0 } },
      { paymentStatus: { $nin: ["pending", "paid", "failed", "refunded"] } },
      { orderStatus: { $nin: ["pending", "processing", "shipped", "delivered", "cancelled"] } },
    ],
  })
    .select("_id orderNumber userId paymentStatus orderStatus customer shippingAddress items createdAt")
    .limit(100)
    .lean();

  const now = Date.now();
  const staleCutoffs = {
    pending7Days: new Date(now - 7 * 24 * 60 * 60 * 1000),
    pending14Days: new Date(now - 14 * 24 * 60 * 60 * 1000),
    pending30Days: new Date(now - 30 * 24 * 60 * 60 * 1000),
  };
  const [pending, failed, cancelled, pending7Days, pending14Days, pending30Days] =
    await Promise.all([
      PhysicalOrder.countDocuments({ paymentStatus: "pending" }),
      PhysicalOrder.countDocuments({ paymentStatus: "failed" }),
      PhysicalOrder.countDocuments({ orderStatus: "cancelled" }),
      PhysicalOrder.countDocuments({ paymentStatus: "pending", createdAt: { $lte: staleCutoffs.pending7Days } }),
      PhysicalOrder.countDocuments({ paymentStatus: "pending", createdAt: { $lte: staleCutoffs.pending14Days } }),
      PhysicalOrder.countDocuments({ paymentStatus: "pending", createdAt: { $lte: staleCutoffs.pending30Days } }),
    ]);

  return {
    invalidOrders,
    statusCounts: {
      pending,
      failed,
      cancelled,
      stalePending: {
        olderThan7Days: pending7Days,
        olderThan14Days: pending14Days,
        olderThan30Days: pending30Days,
      },
    },
  };
};

const auditPurchasesAndAccess = async () => {
  const [purchases, accessRecords] = await Promise.all([
    Purchase.find({ status: "paid" }).lean(),
    BookAccess.find().lean(),
  ]);

  const userIds = [
    ...new Set(
      [
        ...purchases.map((purchase) => purchase.userId?.toString()),
        ...accessRecords.map((access) => access.userId?.toString()),
      ].filter(Boolean),
    ),
  ];
  const bookIds = [
    ...new Set(
      [
        ...purchases.map((purchase) => purchase.bookId?.toString()),
        ...accessRecords.map((access) => access.bookId?.toString()),
      ].filter(Boolean),
    ),
  ];
  const purchaseIds = [
    ...new Set(
      accessRecords
        .map((access) => access.purchaseId?.toString())
        .filter(Boolean),
    ),
  ];

  const [users, books, accessPurchases] = await Promise.all([
    User.find({ _id: { $in: userIds } })
      .select("_id")
      .lean(),
    Book.find({ _id: { $in: bookIds } }).lean(),
    Purchase.find({ _id: { $in: purchaseIds } })
      .select("_id")
      .lean(),
  ]);

  const userSet = new Set(users.map((user) => user._id.toString()));
  const bookMap = new Map(books.map((book) => [book._id.toString(), book]));
  const purchaseSet = new Set([
    ...purchases.map((purchase) => purchase._id.toString()),
    ...accessPurchases.map((purchase) => purchase._id.toString()),
  ]);

  const orphanPurchases = purchases.filter(
    (purchase) =>
      !userSet.has(purchase.userId?.toString()) ||
      !bookMap.has(purchase.bookId?.toString()),
  );

  const orphanAccessRecords = accessRecords.filter(
    (access) =>
      !userSet.has(access.userId?.toString()) ||
      !bookMap.has(access.bookId?.toString()) ||
      (access.purchaseId && !purchaseSet.has(access.purchaseId.toString())),
  );

  const missingAccessRecords = [];
  purchases.forEach((purchase) => {
    const book = bookMap.get(purchase.bookId?.toString());
    if (!book) return;

    getExpectedAccessRecords(purchase, book).forEach((expected) => {
      const exists = accessRecords.some(
        (access) =>
          sameId(access.userId, expected.userId) &&
          sameId(access.bookId, expected.bookId) &&
          sameId(access.chapterId, expected.chapterId) &&
          access.accessType === expected.accessType,
      );

      if (!exists) {
        missingAccessRecords.push({
          purchaseId: purchase._id,
          userId: purchase.userId,
          bookId: purchase.bookId,
          chapterId: expected.chapterId,
          accessType: expected.accessType,
        });
      }
    });
  });

  return {
    orphanPurchases,
    orphanAccessRecords,
    missingAccessRecords,
  };
};

const auditDatabaseIntegrity = async () => {
  const [users, books, payments, physicalOrders, purchasesAndAccess] = await Promise.all([
    auditUsers(),
    auditBooks(),
    auditPayments(),
    auditPhysicalOrders(),
    auditPurchasesAndAccess(),
  ]);

  const summary = {
    duplicateUserEmails: users.duplicateEmails.length,
    invalidUsers: users.invalidUsers.length,
    duplicateSlugs: books.duplicateSlugs.length,
    invalidBooks: books.invalidBooks.length,
    duplicatePurchaseRazorpayPaymentIds: payments.duplicatePurchaseRazorpayPaymentIds.length,
    duplicatePhysicalRazorpayPaymentIds: payments.duplicatePhysicalRazorpayPaymentIds.length,
    duplicateProviderEventIds: payments.duplicateProviderEventIds.length,
    invalidPhysicalOrders: physicalOrders.invalidOrders.length,
    pendingPhysicalOrders: physicalOrders.statusCounts.pending,
    stalePendingPhysicalOrdersOver14Days:
      physicalOrders.statusCounts.stalePending.olderThan14Days,
    orphanPurchases: purchasesAndAccess.orphanPurchases.length,
    orphanAccessRecords: purchasesAndAccess.orphanAccessRecords.length,
    missingAccessRecords: purchasesAndAccess.missingAccessRecords.length,
  };

  return {
    healthy: Object.values(summary).every((count) => count === 0),
    summary,
    details: {
      users,
      books,
      payments,
      physicalOrders,
      ...purchasesAndAccess,
    },
  };
};

const getPhysicalOrderCleanupReport = async ({ limit = 25 } = {}) => {
  const safeLimit = Math.min(Math.max(Number(limit) || 25, 1), 100);
  const now = Date.now();
  const olderThan7Days = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const olderThan14Days = new Date(now - 14 * 24 * 60 * 60 * 1000);
  const olderThan30Days = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const [
    pending,
    failed,
    cancelled,
    stalePending7,
    stalePending14,
    stalePending30,
    recentPendingOrders,
    stalePendingOrders,
    failedOrders,
  ] = await Promise.all([
    PhysicalOrder.countDocuments({ paymentStatus: "pending" }),
    PhysicalOrder.countDocuments({ paymentStatus: "failed" }),
    PhysicalOrder.countDocuments({ orderStatus: "cancelled" }),
    PhysicalOrder.countDocuments({ paymentStatus: "pending", createdAt: { $lte: olderThan7Days } }),
    PhysicalOrder.countDocuments({ paymentStatus: "pending", createdAt: { $lte: olderThan14Days } }),
    PhysicalOrder.countDocuments({ paymentStatus: "pending", createdAt: { $lte: olderThan30Days } }),
    PhysicalOrder.find({ paymentStatus: "pending" })
      .select("orderNumber userId customer.email total currency paymentProvider paymentReference paymentStatus orderStatus createdAt")
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .lean(),
    PhysicalOrder.find({ paymentStatus: "pending", createdAt: { $lte: olderThan14Days } })
      .select("orderNumber userId customer.email total currency paymentProvider paymentReference paymentStatus orderStatus createdAt")
      .populate("userId", "name email")
      .sort({ createdAt: 1 })
      .limit(safeLimit)
      .lean(),
    PhysicalOrder.find({ paymentStatus: "failed" })
      .select("orderNumber userId customer.email total currency paymentProvider paymentReference paymentStatus failedReason createdAt")
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .lean(),
  ]);

  return {
    summary: {
      pending,
      failed,
      cancelled,
      stalePending: {
        olderThan7Days: stalePending7,
        olderThan14Days: stalePending14,
        olderThan30Days: stalePending30,
      },
    },
    orders: {
      recentPending: recentPendingOrders,
      stalePendingOver14Days: stalePendingOrders,
      failed: failedOrders,
    },
    note:
      "Read-only report. Review stale pending orders before manually cancelling them in the admin dashboard.",
  };
};

const repairMissingAccessRecords = async () => {
  const audit = await auditPurchasesAndAccess();
  const missing = audit.missingAccessRecords;

  if (!missing.length) {
    return { inserted: 0, skipped: 0, records: [] };
  }

  const results = await Promise.all(
    missing.map((record) =>
      BookAccess.updateOne(
        {
          userId: record.userId,
          bookId: record.bookId,
          chapterId: record.chapterId,
          accessType: record.accessType,
        },
        {
          $setOnInsert: {
            purchaseId: record.purchaseId,
            grantedAt: new Date(),
            metadata: { repairedBy: "database_repair" },
          },
        },
        { upsert: true },
      ),
    ),
  );

  const inserted = results.reduce(
    (total, result) => total + (result.upsertedCount || 0),
    0,
  );

  return {
    inserted,
    skipped: missing.length - inserted,
    records: missing,
  };
};

module.exports = {
  getDatabaseOverview,
  ensureModelIndexes,
  auditDatabaseIntegrity,
  getPhysicalOrderCleanupReport,
  repairMissingAccessRecords,
};

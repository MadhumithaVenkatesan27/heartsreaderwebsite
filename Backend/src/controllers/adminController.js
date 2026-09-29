const mongoose = require("mongoose");
const User = require("../models/User");
const UserActivity = require("../models/UserActivity");
const EmailLog = require("../models/EmailLog");
const Purchase = require("../models/Purchase");
const BookAccess = require("../models/BookAccess");
const Book = require("../models/Book");
const Review = require("../models/Review");
const ReadingProgress = require("../models/ReadingProgress");
const RefundRequest = require("../models/RefundRequest");
const PhysicalOrder = require("../models/PhysicalOrder");
const CampaignPledge = require("../models/CampaignPledge");
const CampaignBacker = require("../models/CampaignBacker");
const SupportTicket = require("../models/SupportTicket");
const Notification = require("../models/Notification");
const DiscussionThread = require("../models/DiscussionThread");
const AdminAuditLog = require("../models/AdminAuditLog");
const { catchAsync, createError } = require("../middleware/errorMiddleware");
const { logActivity } = require("../utils/activityLogger");
const { logAdminAudit } = require("../utils/adminAuditLogger");
const { updateRefundStatus } = require("../services/refundService");
const { createNotification } = require("../services/notificationService");
const { getSecurityReport } = require("../services/securityService");
const { buildInvoicePdf } = require("../services/invoicePdfService");
const { sendEmail, emailTemplates } = require("../services/emailService");
const {
  syncLicensorUser,
  removeLicensorUser,
} = require("../services/licensorUserService");
const {
  getDatabaseOverview,
  ensureModelIndexes,
  auditDatabaseIntegrity,
  getPhysicalOrderCleanupReport,
  repairMissingAccessRecords,
} = require("../services/databaseService");
const {
  validateEmail,
  validatePassword,
  validateName,
} = require("../utils/validator");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || "sk_test_missing");

const DEFAULT_LICENSOR_TITLE_PATTERNS = {
  "LIC-BOIN": [
    /baroness goes on strike/i,
    /from a knight to a lady/i,
    /darling,\s*why don['’]t we divorce/i,
    /archduke['’]s adopted saint/i,
  ],
  "LIC-TYNA": [/chigaya/i, /you're way too cheeky/i],
  "LIC-DNC-HAKSAN": [
    /raeliana/i,
    /abandoned villainess/i,
    /became a zombie/i,
  ],
  "LIC-DNC": [/raeliana/i, /abandoned villainess/i, /became a zombie/i],
  "LIC-INGRID": [/executioner of grenimal/i, /matchmaker/i, /fianc[eé]/i],
  "LIC-SHIMA": [/all-rounder maid connie wille/i, /connie wille/i],
};

const normaliseLicensorId = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();

const findDefaultLicensorBooks = async (licensorId) => {
  const patterns = DEFAULT_LICENSOR_TITLE_PATTERNS[licensorId] || [];
  if (!patterns.length) return [];

  const books = await Book.find({}).select("_id title slug");
  return books.filter((book) =>
    patterns.some((pattern) => pattern.test(book.title || ""))
  );
};

const pageOptions = (req) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

const dateRange = (query) => {
  const range = {};
  if (query.from) range.$gte = new Date(query.from);
  if (query.to) range.$lte = new Date(query.to);
  return Object.keys(range).length ? range : null;
};

const startOfDay = (date = new Date()) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const startOfMonth = (date = new Date()) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const moneyByCurrency = (rows = []) =>
  rows.reduce((totals, row) => {
    totals[row._id || "USD"] = Number(row.total || 0);
    return totals;
  }, {});

const statusCounts = (rows = []) =>
  rows.reduce((totals, row) => {
    totals[row._id || "unknown"] = row.count;
    return totals;
  }, {});

const getStats = catchAsync(async (req, res) => {
  const [
    totalUsers,
    verifiedUsers,
    activeUsers,
    blockedUsers,
    deletedUsers,
    adminUsers,
    failedEmails,
    sentEmails,
    totalPurchases,
    revenue,
    totalAccessRecords,
    totalBooks,
    publishedBooks,
    totalReviews,
    readingProgressRecords,
    refundRequests,
    supportTickets,
    unreadNotifications,
    discussionThreads,
    recentActivities,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isEmailVerified: true }),
    User.countDocuments({ status: "active" }),
    User.countDocuments({ status: "blocked" }),
    User.countDocuments({ status: "deleted" }),
    User.countDocuments({ role: "admin" }),
    EmailLog.countDocuments({ status: "failed" }),
    EmailLog.countDocuments({ status: "sent" }),
    Purchase.countDocuments({ status: "paid" }),
    Purchase.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: "$currency",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    BookAccess.countDocuments(),
    Book.countDocuments(),
    Book.countDocuments({ isPublished: true }),
    Review.countDocuments({ status: "published" }),
    ReadingProgress.countDocuments(),
    RefundRequest.countDocuments(),
    SupportTicket.countDocuments(),
    Notification.countDocuments({ isRead: false }),
    DiscussionThread.countDocuments(),
    UserActivity.find().sort({ createdAt: -1 }).limit(5),
  ]);

  res.status(200).json({
    status: "success",
    data: {
      users: {
        total: totalUsers,
        verified: verifiedUsers,
        active: activeUsers,
        blocked: blockedUsers,
        deleted: deletedUsers,
        admins: adminUsers,
      },
      emails: {
        sent: sentEmails,
        failed: failedEmails,
      },
      purchases: {
        total: totalPurchases,
        revenue,
      },
      access: {
        total: totalAccessRecords,
      },
      books: {
        total: totalBooks,
        published: publishedBooks,
        reviews: totalReviews,
        readingProgressRecords,
      },
      refunds: {
        total: refundRequests,
      },
      support: {
        tickets: supportTickets,
        unreadNotifications,
      },
      community: {
        discussionThreads,
      },
      recentActivities,
    },
  });
});

const getDashboard = catchAsync(async (req, res) => {
  const now = new Date();
  const today = startOfDay(now);
  const month = startOfMonth(now);

  const [
    totalUsers,
    todayUsers,
    monthUsers,
    activeUsers,
    verifiedUsers,
    totalBooks,
    publishedBooks,
    comingSoonBooks,
    paidPurchases,
    todayPurchases,
    monthPurchases,
    revenueTotal,
    revenueToday,
    revenueMonth,
    purchasesByStatus,
    refundsByStatus,
    supportByStatus,
    supportByPriority,
    failedEmailsToday,
    unreadNotifications,
    openRefunds,
    openSupportTickets,
    topBooks,
    recentPurchases,
    recentUsers,
    recentActivities,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: today } }),
    User.countDocuments({ createdAt: { $gte: month } }),
    User.countDocuments({ status: "active" }),
    User.countDocuments({ isEmailVerified: true }),
    Book.countDocuments(),
    Book.countDocuments({ isPublished: true }),
    Book.countDocuments({ releaseStatus: "coming_soon" }),
    Purchase.countDocuments({ status: "paid" }),
    Purchase.countDocuments({ status: "paid", createdAt: { $gte: today } }),
    Purchase.countDocuments({ status: "paid", createdAt: { $gte: month } }),
    Purchase.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: "$currency", total: { $sum: "$amount" } } },
      { $sort: { _id: 1 } },
    ]),
    Purchase.aggregate([
      { $match: { status: "paid", createdAt: { $gte: today } } },
      { $group: { _id: "$currency", total: { $sum: "$amount" } } },
      { $sort: { _id: 1 } },
    ]),
    Purchase.aggregate([
      { $match: { status: "paid", createdAt: { $gte: month } } },
      { $group: { _id: "$currency", total: { $sum: "$amount" } } },
      { $sort: { _id: 1 } },
    ]),
    Purchase.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    RefundRequest.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    SupportTicket.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    SupportTicket.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]),
    EmailLog.countDocuments({ status: "failed", createdAt: { $gte: today } }),
    Notification.countDocuments({ isRead: false }),
    RefundRequest.countDocuments({
      status: { $in: ["requested", "approved"] },
    }),
    SupportTicket.countDocuments({ status: { $in: ["open", "pending"] } }),
    Purchase.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: "$bookId",
          title: { $first: "$bookTitle" },
          sales: { $sum: 1 },
          revenue: { $sum: "$amount" },
          currency: { $first: "$currency" },
        },
      },
      { $sort: { revenue: -1, sales: -1 } },
      { $limit: 8 },
    ]),
    Purchase.find({ status: "paid" })
      .populate("userId", "name email")
      .populate("bookId", "title slug")
      .sort({ createdAt: -1 })
      .limit(8),
    User.find()
      .select("name email role status isEmailVerified createdAt")
      .sort({ createdAt: -1 })
      .limit(8),
    UserActivity.find().sort({ createdAt: -1 }).limit(10),
  ]);

  res.status(200).json({
    status: "success",
    data: {
      summary: {
        users: {
          total: totalUsers,
          today: todayUsers,
          thisMonth: monthUsers,
          active: activeUsers,
          verified: verifiedUsers,
        },
        books: {
          total: totalBooks,
          published: publishedBooks,
          comingSoon: comingSoonBooks,
        },
        purchases: {
          paid: paidPurchases,
          today: todayPurchases,
          thisMonth: monthPurchases,
          byStatus: statusCounts(purchasesByStatus),
        },
        revenue: {
          total: moneyByCurrency(revenueTotal),
          today: moneyByCurrency(revenueToday),
          thisMonth: moneyByCurrency(revenueMonth),
        },
        attention: {
          openRefunds,
          openSupportTickets,
          failedEmailsToday,
          unreadNotifications,
        },
      },
      breakdowns: {
        refundsByStatus: statusCounts(refundsByStatus),
        supportByStatus: statusCounts(supportByStatus),
        supportByPriority: statusCounts(supportByPriority),
      },
      topBooks,
      recent: {
        purchases: recentPurchases,
        users: recentUsers,
        activities: recentActivities,
      },
      generatedAt: now,
    },
  });
});

const listAdminAuditLogs = catchAsync(async (req, res) => {
  const { page, limit, skip } = pageOptions(req);
  const filter = {};
  const createdAt = dateRange(req.query);

  if (req.query.adminId && mongoose.isValidObjectId(req.query.adminId)) {
    filter.adminId = req.query.adminId;
  }
  if (req.query.adminEmail)
    filter.adminEmail = new RegExp(req.query.adminEmail, "i");
  if (req.query.action) filter.action = req.query.action;
  if (req.query.targetType) filter.targetType = req.query.targetType;
  if (req.query.targetId && mongoose.isValidObjectId(req.query.targetId)) {
    filter.targetId = req.query.targetId;
  }
  if (req.query.status) filter.status = req.query.status;
  if (createdAt) filter.createdAt = createdAt;

  const [logs, total] = await Promise.all([
    AdminAuditLog.find(filter)
      .populate("adminId", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AdminAuditLog.countDocuments(filter),
  ]);

  res.status(200).json({
    status: "success",
    results: logs.length,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    data: { logs },
  });
});

const getDatabaseStatus = catchAsync(async (req, res) => {
  const database = await getDatabaseOverview();

  res.status(200).json({
    status: "success",
    data: { database },
  });
});

const getSystemSecurityCheck = catchAsync(async (req, res) => {
  const security = getSecurityReport();

  res.status(200).json({
    status: "success",
    data: { security },
  });
});

const getAdminHealth = catchAsync(async (req, res) => {
  const security = getSecurityReport();
  const failingHighOrCritical = security.failing.filter((check) =>
    ["critical", "high"].includes(check.severity)
  );
  const blockingHighOrCritical = security.blocking.filter((check) =>
    ["critical", "high"].includes(check.severity)
  );
  const warningHighOrCritical = security.warnings.filter((check) =>
    ["critical", "high"].includes(check.severity)
  );
  const emailConfigured = Boolean(
    process.env.BREVO_API_KEY &&
      process.env.EMAIL_FROM &&
      !String(process.env.BREVO_API_KEY).includes("your_")
  );

  res.status(200).json({
    status: "success",
    data: {
      health: {
        status: "ok",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        database: {
          connected: mongoose.connection.readyState === 1,
          name: mongoose.connection.name || null,
          host: mongoose.connection.host || null,
        },
        email: {
          configured: emailConfigured,
          provider: process.env.BREVO_API_KEY ? "brevo-api" : "not-configured",
          from: process.env.EMAIL_FROM || null,
        },
        security: {
          ready: security.ready,
          failingHighOrCritical: failingHighOrCritical.length,
          blockingHighOrCritical: blockingHighOrCritical.length,
          warningHighOrCritical: warningHighOrCritical.length,
          failing: security.failing,
          blocking: security.blocking,
          warnings: security.warnings,
        },
      },
    },
  });
});

const createMissingIndexes = catchAsync(async (req, res) => {
  const indexes = await ensureModelIndexes();

  await logActivity({
    userId: req.user._id,
    type: "profile_updated",
    email: req.user.email,
    req,
    metadata: {
      adminAction: "database_indexes_ensured",
      models: indexes.map((item) => item.model),
    },
  });

  await logAdminAudit({
    admin: req.user,
    action: "database_indexes_ensured",
    targetType: "database",
    req,
    metadata: {
      models: indexes.map((item) => item.model),
    },
  });

  res.status(200).json({
    status: "success",
    message: "Database indexes checked and created where missing.",
    data: { indexes },
  });
});

const auditDatabase = catchAsync(async (req, res) => {
  const audit = await auditDatabaseIntegrity();

  res.status(200).json({
    status: "success",
    data: { audit },
  });
});

const repairDatabase = catchAsync(async (req, res) => {
  const repair = await repairMissingAccessRecords();

  await logActivity({
    userId: req.user._id,
    type: "profile_updated",
    email: req.user.email,
    req,
    metadata: {
      adminAction: "database_repair",
      insertedAccessRecords: repair.inserted,
      skippedAccessRecords: repair.skipped,
    },
  });

  await logAdminAudit({
    admin: req.user,
    action: "database_repair",
    targetType: "database",
    req,
    metadata: {
      insertedAccessRecords: repair.inserted,
      skippedAccessRecords: repair.skipped,
    },
  });

  res.status(200).json({
    status: "success",
    message: "Database repair finished.",
    data: { repair },
  });
});

const cleanupExpiredAuthTokens = catchAsync(async (req, res) => {
  const now = new Date();
  const activityDays = Math.max(parseInt(req.query.activityDays, 10) || 0, 0);
  const emailDays = Math.max(parseInt(req.query.emailDays, 10) || 0, 0);

  const [verificationCleanup, passwordResetCleanup] = await Promise.all([
    User.updateMany(
      {
        emailVerificationExpires: { $lt: now },
      },
      {
        $unset: {
          emailVerificationToken: "",
          emailVerificationExpires: "",
          emailVerificationCode: "",
          emailVerificationCodeExpires: "",
        },
      },
    ),
    User.updateMany(
      {
        passwordResetExpires: { $lt: now },
      },
      {
        $unset: {
          passwordResetToken: "",
          passwordResetExpires: "",
        },
      },
    ),
  ]);

  let activityCleanup = { deletedCount: 0 };
  let emailCleanup = { deletedCount: 0 };

  if (activityDays > 0) {
    const activityBefore = new Date(
      Date.now() - activityDays * 24 * 60 * 60 * 1000,
    );
    activityCleanup = await UserActivity.deleteMany({
      createdAt: { $lt: activityBefore },
    });
  }

  if (emailDays > 0) {
    const emailBefore = new Date(Date.now() - emailDays * 24 * 60 * 60 * 1000);
    emailCleanup = await EmailLog.deleteMany({
      createdAt: { $lt: emailBefore },
    });
  }

  await logActivity({
    userId: req.user._id,
    type: "profile_updated",
    email: req.user.email,
    req,
    metadata: {
      adminAction: "cleanup",
      verificationModified: verificationCleanup.modifiedCount,
      passwordResetModified: passwordResetCleanup.modifiedCount,
      activityDeleted: activityCleanup.deletedCount,
      emailDeleted: emailCleanup.deletedCount,
    },
  });

  await logAdminAudit({
    admin: req.user,
    action: "cleanup",
    targetType: "database",
    req,
    metadata: {
      verificationModified: verificationCleanup.modifiedCount,
      passwordResetModified: passwordResetCleanup.modifiedCount,
      activityDeleted: activityCleanup.deletedCount,
      emailDeleted: emailCleanup.deletedCount,
    },
  });

  res.status(200).json({
    status: "success",
    message: "Cleanup finished.",
    data: {
      expiredVerificationUsersUpdated: verificationCleanup.modifiedCount,
      expiredPasswordResetUsersUpdated: passwordResetCleanup.modifiedCount,
      oldActivitiesDeleted: activityCleanup.deletedCount,
      oldEmailsDeleted: emailCleanup.deletedCount,
    },
  });
});

const listUsers = catchAsync(async (req, res) => {
  const { page, limit, skip } = pageOptions(req);
  const filter = {};

  if (req.query.status) filter.status = req.query.status;
  if (req.query.role) filter.role = req.query.role;
  if (req.query.email) filter.email = new RegExp(req.query.email, "i");

  const [users, total] = await Promise.all([
    User.find(filter)
      .select(
        "name email role status isActive isEmailVerified emailVerifiedAt loginCount lastLoginAt registeredAt createdAt",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    status: "success",
    results: users.length,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    data: { users },
  });
});

const getUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  if (!mongoose.isValidObjectId(userId)) {
    return next(createError("User not found.", 404));
  }

  const user = await User.findById(userId).populate({
    path: "purchases.bookId",
    select: "title slug author coverImageUrl",
  });

  if (!user) return next(createError("User not found.", 404));

  res.status(200).json({ status: "success", data: { user } });
});

const updateUserStatus = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { status } = req.body;

  if (!["active", "blocked", "deleted"].includes(status)) {
    return next(
      createError("Status must be active, blocked, or deleted.", 400),
    );
  }
  if (!mongoose.isValidObjectId(userId)) {
    return next(createError("User not found.", 404));
  }

  const user = await User.findById(userId);
  if (!user) return next(createError("User not found.", 404));

  user.status = status;
  user.isActive = status === "active";
  if (status !== "active") user.refreshToken = undefined;
  await user.save({ validateBeforeSave: false });

  await logActivity({
    userId: user._id,
    type: "profile_updated",
    email: user.email,
    req,
    metadata: {
      adminUserId: req.user._id,
      adminAction: "status_changed",
      status,
    },
  });

  await logAdminAudit({
    admin: req.user,
    action: "user_status_changed",
    targetType: "user",
    targetId: user._id,
    req,
    metadata: {
      status,
      userEmail: user.email,
    },
  });

  res.status(200).json({
    status: "success",
    message: `User status changed to ${status}.`,
    data: { user },
  });
});

const updateUserRole = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!["user", "admin", "licensor"].includes(role)) {
    return next(createError("Role must be user, admin, or licensor.", 400));
  }
  if (!mongoose.isValidObjectId(userId)) {
    return next(createError("User not found.", 404));
  }

  const user = await User.findById(userId);
  if (!user) return next(createError("User not found.", 404));

  user.role = role;
  await user.save({ validateBeforeSave: false });
  if (role === "licensor" && user.licensorId) {
    await syncLicensorUser(user);
  } else if (role !== "licensor") {
    await removeLicensorUser(user._id);
  }

  await logActivity({
    userId: user._id,
    type: "profile_updated",
    email: user.email,
    req,
    metadata: {
      adminUserId: req.user._id,
      adminAction: "role_changed",
      role,
    },
  });

  await logAdminAudit({
    admin: req.user,
    action: "user_role_changed",
    targetType: "user",
    targetId: user._id,
    req,
    metadata: {
      role,
      userEmail: user.email,
    },
  });

  res.status(200).json({
    status: "success",
    message: `User role changed to ${role}.`,
    data: { user },
  });
});

const createLicensorUser = catchAsync(async (req, res, next) => {
  const { name, email, password, bookIds = [] } = req.body;
  const licensorId = normaliseLicensorId(req.body.licensorId);

  const nameError = validateName(name);
  if (nameError) return next(createError(nameError, 400));

  const emailError = validateEmail(email);
  if (emailError) return next(createError(emailError, 400));

  const passwordError = validatePassword(password);
  if (passwordError) return next(createError(passwordError, 400));

  if (!Array.isArray(bookIds)) {
    return next(createError("bookIds must be an array.", 400));
  }
  if (!licensorId || !/^LIC-[A-Z0-9-]{2,40}$/.test(licensorId)) {
    return next(createError("A valid licensorId is required, for example LIC-TYNA.", 400));
  }

  const cleanBookIds = [...new Set(bookIds.map((id) => String(id).trim()).filter(Boolean))];
  const invalidBookId = cleanBookIds.find((id) => !mongoose.isValidObjectId(id));
  if (invalidBookId) return next(createError("One or more book IDs are invalid.", 400));

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return next(createError("This email is already registered.", 409));
  }
  const existingLicensorId = await User.findOne({ licensorId });
  if (existingLicensorId) {
    return next(createError("This licensor ID is already assigned.", 409));
  }

  const books = cleanBookIds.length
    ? await Book.find({ _id: { $in: cleanBookIds } }).select("_id title slug")
    : await findDefaultLicensorBooks(licensorId);
  if (cleanBookIds.length && books.length !== cleanBookIds.length) {
    return next(createError("One or more assigned books were not found.", 404));
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: "licensor",
    licensorId,
    isEmailVerified: true,
    emailVerifiedAt: new Date(),
    assignedBookIds: books.map((book) => book._id),
  });
  await user.populate("assignedBookIds", "title slug coverImageUrl");
  await syncLicensorUser(user);

  await logActivity({
    userId: user._id,
    type: "registered",
    email: user.email,
    req,
    metadata: { createdByAdmin: true, role: "licensor" },
  });

  await logAdminAudit({
    admin: req.user,
    action: "licensor_user_created",
    targetType: "user",
    targetId: user._id,
    req,
    metadata: {
      userEmail: user.email,
      licensorId: user.licensorId,
      bookIds: user.assignedBookIds.map((book) => book._id),
    },
  });

  res.status(201).json({
    status: "success",
    message: "Licensor account created.",
    data: { user },
  });
});

const updateUserLicensorBooks = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { bookIds = [] } = req.body;
  const licensorId = normaliseLicensorId(req.body.licensorId);

  if (!mongoose.isValidObjectId(userId)) {
    return next(createError("User not found.", 404));
  }
  if (!Array.isArray(bookIds)) {
    return next(createError("bookIds must be an array.", 400));
  }

  const cleanBookIds = [...new Set(bookIds.map((id) => String(id).trim()).filter(Boolean))];
  const invalidBookId = cleanBookIds.find((id) => !mongoose.isValidObjectId(id));
  if (invalidBookId) return next(createError("One or more book IDs are invalid.", 400));

  const user = await User.findById(userId);
  if (!user) return next(createError("User not found.", 404));
  if (user.role !== "licensor") {
    return next(createError("Assigned books can only be set for licensor users.", 400));
  }
  if (licensorId) {
    if (!/^LIC-[A-Z0-9-]{2,40}$/.test(licensorId)) {
      return next(createError("licensorId must look like LIC-TYNA.", 400));
    }
    const existingLicensorId = await User.findOne({
      licensorId,
      _id: { $ne: user._id },
    });
    if (existingLicensorId) {
      return next(createError("This licensor ID is already assigned.", 409));
    }
    user.licensorId = licensorId;
  }

  const books = cleanBookIds.length
    ? await Book.find({ _id: { $in: cleanBookIds } }).select("_id title slug")
    : licensorId
      ? await findDefaultLicensorBooks(licensorId)
      : [];
  if (cleanBookIds.length && books.length !== cleanBookIds.length) {
    return next(createError("One or more assigned books were not found.", 404));
  }

  user.assignedBookIds = books.map((book) => book._id);
  await user.save({ validateBeforeSave: false });
  await user.populate("assignedBookIds", "title slug coverImageUrl");
  await syncLicensorUser(user);

  await logAdminAudit({
    admin: req.user,
    action: "licensor_books_assigned",
    targetType: "user",
    targetId: user._id,
    req,
    metadata: {
      userEmail: user.email,
      licensorId: user.licensorId,
      bookIds: user.assignedBookIds.map((book) => book._id),
    },
  });

  res.status(200).json({
    status: "success",
    message: "Licensor book access updated.",
    data: { user },
  });
});

const listActivities = catchAsync(async (req, res) => {
  const { page, limit, skip } = pageOptions(req);
  const filter = {};
  const createdAt = dateRange(req.query);

  if (req.query.userId) filter.userId = req.query.userId;
  if (req.query.email) filter.email = new RegExp(req.query.email, "i");
  if (req.query.type) filter.type = req.query.type;
  if (createdAt) filter.createdAt = createdAt;

  const [activities, total] = await Promise.all([
    UserActivity.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    UserActivity.countDocuments(filter),
  ]);

  res.status(200).json({
    status: "success",
    results: activities.length,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    data: { activities },
  });
});

const listSecurityEvents = catchAsync(async (req, res) => {
  const { page, limit, skip } = pageOptions(req);
  const createdAt = dateRange(req.query);
  const securityTypes = [
    "login_failed",
    "password_changed",
    "password_reset_requested",
    "password_reset_completed",
    "payment_intent_created",
    "payment_security_blocked",
    "read_token_issued",
    "refund_requested",
    "refund_updated",
    "refund_processed",
  ];
  const filter = {
    type:
      req.query.type && securityTypes.includes(req.query.type)
        ? req.query.type
        : { $in: securityTypes },
  };

  if (req.query.email) filter.email = new RegExp(req.query.email, "i");
  if (createdAt) filter.createdAt = createdAt;

  const [events, total] = await Promise.all([
    UserActivity.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    UserActivity.countDocuments(filter),
  ]);

  res.status(200).json({
    status: "success",
    results: events.length,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    data: { events },
  });
});

const listEmailLogs = catchAsync(async (req, res) => {
  const { page, limit, skip } = pageOptions(req);
  const filter = {};
  const createdAt = dateRange(req.query);

  if (req.query.userId) filter.userId = req.query.userId;
  if (req.query.to) filter.to = new RegExp(req.query.to, "i");
  if (req.query.type) filter.type = req.query.type;
  if (req.query.status) filter.status = req.query.status;
  if (createdAt) filter.createdAt = createdAt;

  const [emails, total] = await Promise.all([
    EmailLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    EmailLog.countDocuments(filter),
  ]);

  res.status(200).json({
    status: "success",
    results: emails.length,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    data: { emails },
  });
});

const listPurchases = catchAsync(async (req, res) => {
  const { page, limit, skip } = pageOptions(req);
  const filter = {};
  const createdAt = dateRange(req.query);

  if (req.query.userId) filter.userId = req.query.userId;
  if (req.query.bookId) filter.bookId = req.query.bookId;
  if (req.query.purchaseType) filter.purchaseType = req.query.purchaseType;
  if (req.query.status) filter.status = req.query.status;
  if (createdAt) filter.createdAt = createdAt;

  const [purchases, total] = await Promise.all([
    Purchase.find(filter)
      .populate("userId", "name email")
      .populate("bookId", "title slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Purchase.countDocuments(filter),
  ]);

  res.status(200).json({
    status: "success",
    results: purchases.length,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    data: { purchases },
  });
});

const downloadPurchaseInvoice = catchAsync(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.purchaseId)) {
    return next(createError("Purchase not found.", 404));
  }

  const purchase = await Purchase.findById(req.params.purchaseId).populate(
    "userId",
    "name email",
  );

  if (!purchase) return next(createError("Purchase not found.", 404));

  const pdf = await buildInvoicePdf({
    purchase,
    user: purchase.userId,
  });

  const filename = `invoice_${purchase.invoiceNumber || purchase._id}.pdf`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, private",
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.status(200).send(pdf);
});

const listBookAccess = catchAsync(async (req, res) => {
  const { page, limit, skip } = pageOptions(req);
  const filter = {};

  if (req.query.userId) filter.userId = req.query.userId;
  if (req.query.bookId) filter.bookId = req.query.bookId;
  if (req.query.accessType) filter.accessType = req.query.accessType;

  const [accessRecords, total] = await Promise.all([
    BookAccess.find(filter)
      .populate("userId", "name email")
      .populate("bookId", "title slug")
      .populate("purchaseId", "invoiceNumber amount currency")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    BookAccess.countDocuments(filter),
  ]);

  res.status(200).json({
    status: "success",
    results: accessRecords.length,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    data: { accessRecords },
  });
});

const listBooksForAdmin = catchAsync(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status === "published") filter.isPublished = true;
  if (req.query.status === "unpublished") filter.isPublished = false;
  if (req.query.releaseStatus) filter.releaseStatus = req.query.releaseStatus;

  const [books, total] = await Promise.all([
    Book.find(filter)
      .select("title slug author coverImageUrl coverImageKey coverImageR2Key fullBookR2Key fullBookPdfR2Key accessStatus price genres chapters isPublished releaseStatus createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Book.countDocuments(filter),
  ]);

  res.status(200).json({
    status: "success",
    results: books.length,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    data: { books },
  });
});

const listRefunds = catchAsync(async (req, res) => {
  const { page, limit, skip } = pageOptions(req);
  const filter = {};
  const createdAt = dateRange(req.query);

  if (req.query.userId) filter.userId = req.query.userId;
  if (req.query.purchaseId) filter.purchaseId = req.query.purchaseId;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.invoiceNumber) {
    filter.invoiceNumber = new RegExp(req.query.invoiceNumber, "i");
  }
  if (createdAt) filter.createdAt = createdAt;

  const [refunds, total] = await Promise.all([
    RefundRequest.find(filter)
      .populate("userId", "name email")
      .populate("purchaseId", "bookTitle chapterTitles amount currency status")
      .populate("reviewedBy", "name email")
      .populate("processedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    RefundRequest.countDocuments(filter),
  ]);

  res.status(200).json({
    status: "success",
    results: refunds.length,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    data: { refunds },
  });
});

const setRefundStatus = catchAsync(async (req, res, next) => {
  const { refundId } = req.params;
  const { status, adminNote, paymentRefundId } = req.body;

  if (!["approved", "rejected", "processed"].includes(status)) {
    return next(
      createError("Status must be approved, rejected, or processed.", 400),
    );
  }
  if (!mongoose.isValidObjectId(refundId)) {
    return next(createError("Refund request not found.", 404));
  }

  const refund = await updateRefundStatus({
    refundId,
    status,
    admin: req.user,
    adminNote,
    paymentRefundId,
    req,
  });

  await logAdminAudit({
    admin: req.user,
    action: "refund_status_changed",
    targetType: "refund",
    targetId: refund._id,
    req,
    metadata: {
      status,
      invoiceNumber: refund.invoiceNumber,
      paymentRefundId: refund.paymentRefundId,
    },
  });

  res.status(200).json({
    status: "success",
    message: `Refund ${status}.`,
    data: { refund },
  });
});

const listPhysicalOrders = catchAsync(async (req, res) => {
  const { page, limit, skip } = pageOptions(req);
  const filter = {};
  const createdAt = dateRange(req.query);

  if (req.query.userId) filter.userId = req.query.userId;
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
  if (req.query.fulfillmentStatus)
    filter.fulfillmentStatus = req.query.fulfillmentStatus;
  if (req.query.orderNumber)
    filter.orderNumber = new RegExp(req.query.orderNumber, "i");
  if (createdAt) filter.createdAt = createdAt;

  const [orders, total] = await Promise.all([
    PhysicalOrder.find(filter)
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    PhysicalOrder.countDocuments(filter),
  ]);

  res.status(200).json({
    status: "success",
    results: orders.length,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    data: { orders },
  });
});

const getPhysicalOrderCleanupReportForAdmin = catchAsync(async (req, res) => {
  const report = await getPhysicalOrderCleanupReport({
    limit: req.query.limit,
  });

  res.status(200).json({
    status: "success",
    data: { report },
  });
});

const updatePhysicalOrderStatus = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const {
    paymentStatus,
    fulfillmentStatus,
    orderStatus,
    paymentReference,
    trackingNumber,
    shippedDate,
    deliveredDate,
    notes,
  } = req.body;

  if (!mongoose.isValidObjectId(orderId)) {
    return next(createError("Physical order not found.", 404));
  }

  const existingOrder = await PhysicalOrder.findById(orderId);
  if (!existingOrder) return next(createError("Physical order not found.", 404));

  const previousFulfillmentStatus = existingOrder.fulfillmentStatus;
  const updates = {};
  if (paymentStatus) {
    if (!["pending", "paid", "failed", "refunded"].includes(paymentStatus)) {
      return next(createError("Invalid payment status.", 400));
    }
    updates.paymentStatus = paymentStatus;
  }
  if (fulfillmentStatus) {
    if (
      !["received", "processing", "packed", "shipped", "delivered", "cancelled"].includes(
        fulfillmentStatus,
      )
    ) {
      return next(createError("Invalid fulfillment status.", 400));
    }
    updates.fulfillmentStatus = fulfillmentStatus;
    if (fulfillmentStatus === "shipped") {
      updates.orderStatus = "shipped";
      updates.shippedDate = existingOrder.shippedDate || new Date();
    }
    if (fulfillmentStatus === "delivered") {
      updates.orderStatus = "delivered";
      updates.deliveredDate = existingOrder.deliveredDate || new Date();
    }
    if (fulfillmentStatus === "cancelled") updates.orderStatus = "cancelled";
  }
  if (orderStatus) {
    if (!["pending", "processing", "shipped", "delivered", "cancelled"].includes(orderStatus)) {
      return next(createError("Invalid order status.", 400));
    }
    updates.orderStatus = orderStatus;
  }
  if (paymentReference !== undefined) updates.paymentReference = String(paymentReference || "").trim();
  if (trackingNumber !== undefined) updates.trackingNumber = String(trackingNumber || "").trim();
  if (shippedDate !== undefined) {
    const parsed = shippedDate ? new Date(shippedDate) : undefined;
    if (shippedDate && Number.isNaN(parsed.getTime())) {
      return next(createError("Invalid shipped date.", 400));
    }
    updates.shippedDate = parsed;
  }
  if (deliveredDate !== undefined) {
    const parsed = deliveredDate ? new Date(deliveredDate) : undefined;
    if (deliveredDate && Number.isNaN(parsed.getTime())) {
      return next(createError("Invalid delivered date.", 400));
    }
    updates.deliveredDate = parsed;
  }
  if (notes !== undefined) updates.notes = String(notes || "").trim();

  const order = await PhysicalOrder.findByIdAndUpdate(orderId, updates, {
    new: true,
    runValidators: true,
  }).populate("userId", "name email");

  if (!order) return next(createError("Physical order not found.", 404));

  if (fulfillmentStatus && fulfillmentStatus !== previousFulfillmentStatus) {
    const customerName =
      order.shippingAddress?.fullName ||
      order.userId?.name ||
      "Reader";
    const customerEmail =
      order.shippingAddress?.email ||
      order.userId?.email;

    if (customerEmail) {
      try {
        await sendEmail({
          to: customerEmail,
          type: "physical_order",
          userId: order.userId?._id || order.userId,
          metadata: {
            orderId: order._id,
            orderNumber: order.orderNumber,
            fulfillmentStatus,
          },
          ...emailTemplates.physicalOrderStatusUpdate({
            name: customerName,
            orderNumber: order.orderNumber,
            fulfillmentStatus,
            notes: order.notes,
          }),
        });
      } catch (err) {
        console.error("Physical order status email failed:", err.message);
      }
    }

    await createNotification({
      userId: order.userId?._id || order.userId,
      type: "physical_order",
      title: "Physical order updated",
      message: `Your print order ${order.orderNumber} is now ${fulfillmentStatus}.`,
      link: "/my-library.html",
      metadata: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        fulfillmentStatus,
      },
    });
  }

  await logAdminAudit({
    admin: req.user,
    action: "physical_order_updated",
    targetType: "physical_order",
    targetId: order._id,
    req,
    metadata: {
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
    },
  });

  res.status(200).json({
    status: "success",
    message: "Physical order updated.",
    data: { order },
  });
});

const listCampaignPledges = catchAsync(async (req, res) => {
  const { page, limit, skip } = pageOptions(req);
  const filter = {};
  const createdAt = dateRange(req.query);

  if (req.query.userId) filter.userId = req.query.userId;
  if (req.query.tier) filter.tier = req.query.tier;
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
  if (req.query.fulfillmentStatus) filter.fulfillmentStatus = req.query.fulfillmentStatus;
  if (req.query.campaignSlug) filter.campaignSlug = req.query.campaignSlug;
  if (req.query.pledgeNumber) filter.pledgeNumber = new RegExp(req.query.pledgeNumber, "i");
  if (createdAt) filter.createdAt = createdAt;

  const [pledges, total] = await Promise.all([
    CampaignPledge.find(filter)
      .populate("userId", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    CampaignPledge.countDocuments(filter),
  ]);

  res.status(200).json({
    status: "success",
    results: pledges.length,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    data: { pledges },
  });
});

const listCampaignBackers = catchAsync(async (req, res) => {
  const { page, limit, skip } = pageOptions(req);
  const filter = {};
  const createdAt = dateRange(req.query);

  if (req.query.userId) filter.userId = req.query.userId;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.campaignSlug) filter.campaignSlug = req.query.campaignSlug;
  if (req.query.email) filter.email = new RegExp(req.query.email, "i");
  if (createdAt) filter.createdAt = createdAt;

  const [backers, total] = await Promise.all([
    CampaignBacker.find(filter)
      .populate("userId", "name email role")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    CampaignBacker.countDocuments(filter),
  ]);

  res.status(200).json({
    status: "success",
    results: backers.length,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    data: { backers },
  });
});

const updateCampaignPledgeStatus = catchAsync(async (req, res, next) => {
  const { pledgeId } = req.params;
  const { paymentStatus, fulfillmentStatus, paymentReference, notes } = req.body;

  if (!mongoose.isValidObjectId(pledgeId)) {
    return next(createError("Campaign pledge not found.", 404));
  }

  const updates = {};
  if (paymentStatus) {
    if (!["pending", "paid", "failed", "cancelled", "refunded"].includes(paymentStatus)) {
      return next(createError("Invalid payment status.", 400));
    }
    updates.paymentStatus = paymentStatus;
  }
  if (fulfillmentStatus) {
    if (
      !["pledged", "digital_granted", "production", "packed", "shipped", "delivered", "cancelled"].includes(
        fulfillmentStatus,
      )
    ) {
      return next(createError("Invalid fulfillment status.", 400));
    }
    updates.fulfillmentStatus = fulfillmentStatus;
  }
  if (paymentReference !== undefined) updates.paymentReference = String(paymentReference || "").trim();
  if (notes !== undefined) updates.notes = String(notes || "").trim();

  const pledge = await CampaignPledge.findByIdAndUpdate(pledgeId, updates, {
    new: true,
    runValidators: true,
  }).populate("userId", "name email role");

  if (!pledge) return next(createError("Campaign pledge not found.", 404));

  await logAdminAudit({
    admin: req.user,
    action: "campaign_pledge_updated",
    targetType: "campaign_pledge",
    targetId: pledge._id,
    req,
    metadata: updates,
  });

  res.status(200).json({
    status: "success",
    message: "Campaign pledge updated.",
    data: { pledge },
  });
});

const refundFailedCampaignPledges = catchAsync(async (req, res, next) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return next(createError("Stripe is not configured.", 503));
  }

  const campaignSlug = String(req.body.campaignSlug || "borrowing-your-textbook-print-run").trim();
  const reason = String(req.body.reason || "Campaign goal was not reached.").trim();

  const pledges = await CampaignPledge.find({
    campaignSlug,
    paymentStatus: "paid",
    paymentProvider: "stripe",
    paymentReference: { $exists: true, $ne: "" },
    refundStatus: { $ne: "refunded" },
  });

  const results = [];

  for (const pledge of pledges) {
    try {
      pledge.refundStatus = "pending";
      pledge.refundReason = reason;
      await pledge.save({ validateBeforeSave: false });

      const stripeRefund = await stripe.refunds.create(
        {
          payment_intent: pledge.paymentReference,
          reason: "requested_by_customer",
          metadata: {
            pledgeId: pledge._id.toString(),
            pledgeNumber: pledge.pledgeNumber,
            campaignSlug,
            reason,
          },
        },
        { idempotencyKey: `campaign-refund-${pledge._id}` },
      );

      pledge.paymentStatus = "refunded";
      pledge.refundStatus = "refunded";
      pledge.refundReference = stripeRefund.id;
      pledge.refundedAt = new Date();
      await pledge.save({ validateBeforeSave: false });

      await CampaignBacker.updateOne(
        { campaignSlug: pledge.campaignSlug, userId: pledge.userId },
        {
          $set: {
            status: "refunded",
            lastRefundedAt: pledge.refundedAt,
          },
          $inc: {
            totalRefundedAmount: pledge.amount,
          },
        },
      );

      try {
        await sendEmail({
          to: pledge.backerEmail,
          type: "campaign_refund",
          userId: pledge.userId,
          metadata: { pledgeId: pledge._id, pledgeNumber: pledge.pledgeNumber, refundId: stripeRefund.id },
          ...emailTemplates.campaignRefund({
            name: pledge.backerName,
            pledgeNumber: pledge.pledgeNumber,
            campaignTitle: pledge.campaignTitle,
            amount: pledge.amount,
            currency: pledge.currency,
            reason,
          }),
        });
      } catch (emailErr) {
        console.error("Campaign refund email failed:", emailErr.message);
      }

      results.push({
        pledgeId: pledge._id,
        pledgeNumber: pledge.pledgeNumber,
        status: "refunded",
        refundId: stripeRefund.id,
      });
    } catch (err) {
      pledge.refundStatus = "failed";
      pledge.refundReason = reason;
      await pledge.save({ validateBeforeSave: false });
      results.push({
        pledgeId: pledge._id,
        pledgeNumber: pledge.pledgeNumber,
        status: "failed",
        message: err.message,
      });
    }
  }

  await logAdminAudit({
    admin: req.user,
    action: "campaign_failed_refunds_processed",
    targetType: "campaign",
    targetId: campaignSlug,
    req,
    metadata: {
      campaignSlug,
      reason,
      total: results.length,
      refunded: results.filter((item) => item.status === "refunded").length,
      failed: results.filter((item) => item.status === "failed").length,
    },
  });

  res.status(200).json({
    status: "success",
    message: "Campaign refund processing completed.",
    results: results.length,
    data: { campaignSlug, results },
  });
});

const listSupportTickets = catchAsync(async (req, res) => {
  const { page, limit, skip } = pageOptions(req);
  const filter = {};
  const createdAt = dateRange(req.query);

  if (req.query.userId) filter.userId = req.query.userId;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.priority) filter.priority = req.query.priority;
  if (createdAt) filter.createdAt = createdAt;

  const [tickets, total] = await Promise.all([
    SupportTicket.find(filter)
      .populate("userId", "name email")
      .populate("assignedTo", "name email")
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(limit),
    SupportTicket.countDocuments(filter),
  ]);

  res.status(200).json({
    status: "success",
    results: tickets.length,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    data: { tickets },
  });
});

const getSupportTicket = catchAsync(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.ticketId)) {
    return next(createError("Support ticket not found.", 404));
  }

  const ticket = await SupportTicket.findById(req.params.ticketId)
    .populate("userId", "name email")
    .populate("assignedTo", "name email")
    .populate("messages.senderId", "name email role");

  if (!ticket) return next(createError("Support ticket not found.", 404));

  res.status(200).json({
    status: "success",
    data: { ticket },
  });
});

const updateSupportTicketStatus = catchAsync(async (req, res, next) => {
  const { status, priority, assignedTo } = req.body;

  if (!mongoose.isValidObjectId(req.params.ticketId)) {
    return next(createError("Support ticket not found.", 404));
  }
  if (status && !["open", "pending", "resolved", "closed"].includes(status)) {
    return next(createError("Invalid ticket status.", 400));
  }
  if (priority && !["low", "normal", "high", "urgent"].includes(priority)) {
    return next(createError("Invalid ticket priority.", 400));
  }

  const updates = {};
  if (status) updates.status = status;
  if (priority) updates.priority = priority;
  if (assignedTo !== undefined) updates.assignedTo = assignedTo || undefined;

  const ticket = await SupportTicket.findByIdAndUpdate(
    req.params.ticketId,
    updates,
    { new: true, runValidators: true },
  );

  if (!ticket) return next(createError("Support ticket not found.", 404));

  if (status) {
    await createNotification({
      userId: ticket.userId,
      type: "support",
      title: "Support ticket updated",
      message: `Your support ticket "${ticket.subject}" is now ${status}.`,
      link: `/support/tickets/${ticket._id}`,
      metadata: { ticketId: ticket._id, status },
    });
  }

  await logAdminAudit({
    admin: req.user,
    action: "support_ticket_updated",
    targetType: "support_ticket",
    targetId: ticket._id,
    req,
    metadata: {
      status,
      priority,
      assignedTo,
      subject: ticket.subject,
    },
  });

  res.status(200).json({
    status: "success",
    message: "Support ticket updated.",
    data: { ticket },
  });
});

const replyToSupportTicket = catchAsync(async (req, res, next) => {
  const message = String(req.body.message || "").trim();

  if (message.length < 2) {
    return next(createError("Reply message is required.", 400));
  }
  if (!mongoose.isValidObjectId(req.params.ticketId)) {
    return next(createError("Support ticket not found.", 404));
  }

  const ticket = await SupportTicket.findById(req.params.ticketId);
  if (!ticket) return next(createError("Support ticket not found.", 404));

  ticket.messages.push({
    senderId: req.user._id,
    senderRole: "admin",
    message,
  });
  ticket.status = req.body.status || "pending";
  ticket.assignedTo = ticket.assignedTo || req.user._id;
  ticket.lastMessageAt = new Date();
  await ticket.save();

  await createNotification({
    userId: ticket.userId,
    type: "support",
    title: "Support replied",
    message: `Admin replied to your ticket "${ticket.subject}".`,
    link: `/support/tickets/${ticket._id}`,
    metadata: { ticketId: ticket._id },
  });

  await logAdminAudit({
    admin: req.user,
    action: "support_ticket_replied",
    targetType: "support_ticket",
    targetId: ticket._id,
    req,
    metadata: {
      status: ticket.status,
      subject: ticket.subject,
    },
  });

  res.status(200).json({
    status: "success",
    message: "Admin reply added.",
    data: { ticket },
  });
});

module.exports = {
  getStats,
  getDashboard,
  listAdminAuditLogs,
  getAdminHealth,
  getSystemSecurityCheck,
  getDatabaseStatus,
  createMissingIndexes,
  auditDatabase,
  repairDatabase,
  cleanupExpiredAuthTokens,
  listUsers,
  getUser,
  createLicensorUser,
  updateUserStatus,
  updateUserRole,
  updateUserLicensorBooks,
  listActivities,
  listSecurityEvents,
  listEmailLogs,
  listPurchases,
  downloadPurchaseInvoice,
  listBooksForAdmin,
  listBookAccess,
  listRefunds,
  setRefundStatus,
  listPhysicalOrders,
  getPhysicalOrderCleanupReportForAdmin,
  updatePhysicalOrderStatus,
  listCampaignPledges,
  listCampaignBackers,
  updateCampaignPledgeStatus,
  refundFailedCampaignPledges,
  listSupportTickets,
  getSupportTicket,
  updateSupportTicketStatus,
  replyToSupportTicket,
};

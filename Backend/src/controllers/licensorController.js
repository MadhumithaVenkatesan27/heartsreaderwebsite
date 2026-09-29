const Licensor = require("../models/Licensor");
const Purchase = require("../models/Purchase");
const User = require("../models/User");
const { createSendTokens } = require("../utils/jwt");
const { catchAsync, createError } = require("../middleware/errorMiddleware");
const { syncLicensorUser } = require("../services/licensorUserService");

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

const assignDefaultLicensorBooks = async (user) => {
  const patterns = DEFAULT_LICENSOR_TITLE_PATTERNS[user.licensorId] || [];
  if (!patterns.length || (user.assignedBookIds || []).length) return user;

  const Book = require("../models/Book");
  const books = await Book.find({}).select("_id title");
  const assigned = books.filter((book) =>
    patterns.some((pattern) => pattern.test(book.title || ""))
  );

  if (!assigned.length) return user;

  user.assignedBookIds = assigned.map((book) => book._id);
  await user.save({ validateBeforeSave: false });
  return user;
};

// POST /api/licensors/login
const licensorLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(createError("Email and password are required.", 400));
  }

  const licensor = await Licensor.findOne({ email }).select("+password");
  if (!licensor || !(await licensor.comparePassword(password))) {
    return next(createError("Invalid credentials.", 401));
  }

  if (!licensor.isActive) {
    return next(createError("This licensor account has been deactivated.", 403));
  }

  licensor.lastLoginAt = Date.now();
  await licensor.save({ validateBeforeSave: false });

  await createSendTokens(licensor, 200, res, "licensor");
});

// POST /api/licensors/login-id
// Secure licensor portal login using User.role = licensor + User.licensorId.
const licensorIdLogin = catchAsync(async (req, res, next) => {
  const licensorId = normaliseLicensorId(req.body.licensorId || req.body.id);
  const { password } = req.body;

  if (!licensorId || !password) {
    return next(createError("Licensor ID and password are required.", 400));
  }

  const user = await User.findOne({ licensorId, role: "licensor" }).select(
    "+password +failedLoginAttempts +lockedUntil +refreshToken"
  );

  if (!user || !(await user.comparePassword(password))) {
    if (user) await user.recordFailedLogin();
    return next(createError("Invalid Licensor ID or Password.", 401));
  }

  if (user.isLocked()) {
    const minutesLeft = Math.ceil((user.lockedUntil - Date.now()) / 60000);
    return next(
      createError(
        `Account temporarily locked. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? "s" : ""}.`,
        429
      )
    );
  }

  if (!user.isActive || user.status !== "active") {
    return next(createError("This licensor account has been deactivated.", 403));
  }

  await assignDefaultLicensorBooks(user);
  await user.recordSuccessfulLogin(req.ip, req.get("user-agent"));
  await syncLicensorUser(user);
  await createSendTokens(user, 200, res);
});

// GET /api/licensors/me  (protected)
const getLicensorMe = catchAsync(async (req, res) => {
  const licensor = await req.user.populate(
    "assignedBookIds",
    "title slug coverImageUrl"
  );
  res.status(200).json({ status: "success", data: { licensor } });
});

// GET /api/licensors/my-books  (protected) — books they can access
const getLicensorBooks = catchAsync(async (req, res) => {
  const licensor = await req.user.populate("assignedBookIds");

  const bookIds = (licensor.assignedBookIds || []).map((book) => book._id);
  const revenue = await Purchase.aggregate([
    { $match: { bookId: { $in: bookIds }, status: "paid" } },
    {
      $group: {
        _id: "$bookId",
        total: { $sum: "$amount" },
        sales: { $sum: 1 },
      },
    },
  ]);
  const revenueByBook = new Map(
    revenue.map((item) => [
      item._id.toString(),
      { total: item.total, sales: item.sales },
    ])
  );
  const books = (licensor.assignedBookIds || []).map((book) => ({
    ...book.toObject(),
    sales: revenueByBook.get(book._id.toString())?.sales || 0,
    revenue: revenueByBook.get(book._id.toString())?.total || 0,
  }));

  res.status(200).json({
    status: "success",
    data: { books },
  });
});

module.exports = {
  licensorLogin,
  licensorIdLogin,
  getLicensorMe,
  getLicensorBooks,
  DEFAULT_LICENSOR_TITLE_PATTERNS,
};

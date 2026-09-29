const Book = require("../models/Book");
const BookAccess = require("../models/BookAccess");
const Purchase = require("../models/Purchase");
const User = require("../models/User");
const { sendEmail, emailTemplates } = require("./emailService");
const { createNotification } = require("./notificationService");
const { logActivity } = require("../utils/activityLogger");

const makeInvoiceNumber = () =>
  `CH-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;

const isFreeChapter = (book, chapter) => {
  return Number(chapter?.chapterNumber || chapter?.order) === 1;
};

const assertPaymentMatchesPrice = ({
  expectedAmount,
  actualAmount,
  expectedCurrency,
  actualCurrency,
}) => {
  const expectedSmallestUnit = Math.round(Number(expectedAmount) * 100);
  const actualSmallestUnit = Math.round(Number(actualAmount) * 100);

  if (
    !Number.isFinite(expectedSmallestUnit) ||
    !Number.isFinite(actualSmallestUnit) ||
    expectedSmallestUnit !== actualSmallestUnit
  ) {
    const err = new Error("Payment amount does not match server price.");
    err.statusCode = 400;
    err.securityReason = "amount_mismatch";
    throw err;
  }

  if (
    String(expectedCurrency || "USD").toUpperCase() !==
    String(actualCurrency || "USD").toUpperCase()
  ) {
    const err = new Error("Payment currency does not match server currency.");
    err.statusCode = 400;
    err.securityReason = "currency_mismatch";
    throw err;
  }
};

const fulfillPurchase = async ({
  userId,
  bookId,
  chapterId,
  amount,
  currency = "USD",
  stripePaymentIntentId,
  paymentProvider = stripePaymentIntentId ? "stripe" : "manual",
  paymentReference,
  razorpayOrderId,
  razorpayPaymentId,
  gatewayAmount,
  gatewayCurrency,
  req,
}) => {
  if (stripePaymentIntentId) {
    const existing = await Purchase.findOne({ stripePaymentIntentId });
    if (existing) return { purchase: existing, alreadyFulfilled: true };
  }
  if (razorpayPaymentId) {
    const existing = await Purchase.findOne({ razorpayPaymentId });
    if (existing) return { purchase: existing, alreadyFulfilled: true };
  }
  if (paymentProvider && paymentReference) {
    const existing = await Purchase.findOne({ paymentProvider, paymentReference });
    if (existing) return { purchase: existing, alreadyFulfilled: true };
  }

  const [user, book] = await Promise.all([
    User.findById(userId),
    Book.findById(bookId),
  ]);

  if (!user) throw Object.assign(new Error("User not found for purchase."), { statusCode: 404 });
  if (!book || !book.isPublished) {
    throw Object.assign(new Error("Book not found for purchase."), { statusCode: 404 });
  }

  let purchaseType = "book";
  let chapterTitles = [];
  let embeddedChapterIds = [];
  let paidChapterIds = [];

  if (chapterId) {
    const chapter = book.chapters.id(chapterId);
    if (!chapter) throw Object.assign(new Error("Chapter not found."), { statusCode: 404 });
    if (isFreeChapter(book, chapter)) {
      throw Object.assign(new Error("This chapter is already free to read."), { statusCode: 400 });
    }

    purchaseType = "chapter";
    embeddedChapterIds = [chapter._id];
    paidChapterIds = [chapter._id];
    chapterTitles = [chapter.title];
    assertPaymentMatchesPrice({
      expectedAmount: chapter.price,
      actualAmount: amount,
      expectedCurrency: "USD",
      actualCurrency: currency,
    });

    if (user.ownsChapter(book._id, chapter._id)) {
      const err = new Error("User already owns this chapter.");
      err.statusCode = 409;
      err.securityReason = "duplicate_chapter_purchase";
      throw err;
    }
  } else {
    paidChapterIds = book.chapters
      .filter((chapter) => !isFreeChapter(book, chapter))
      .map((chapter) => chapter._id);
    chapterTitles = book.chapters
      .filter((chapter) => !isFreeChapter(book, chapter))
      .map((chapter) => chapter.title);
    assertPaymentMatchesPrice({
      expectedAmount: book.price,
      actualAmount: amount,
      expectedCurrency: "USD",
      actualCurrency: currency,
    });

    if (user.ownsBook(book._id)) {
      const err = new Error("User already owns this book.");
      err.statusCode = 409;
      err.securityReason = "duplicate_book_purchase";
      throw err;
    }
  }

  const invoiceNumber = makeInvoiceNumber();
  const purchasedAt = new Date();
  const totalAmount =
    typeof amount === "number" && !Number.isNaN(amount)
      ? amount
      : purchaseType === "chapter"
        ? book.chapters.id(chapterId).price
        : book.price;

  const purchase = await Purchase.create({
    userId: user._id,
    bookId: book._id,
    chapterIds: paidChapterIds,
    purchaseType,
    amount: totalAmount,
    currency,
    invoiceNumber,
    bookTitle: book.title,
    chapterTitles,
    paymentProvider,
    paymentReference,
    stripePaymentIntentId,
    razorpayOrderId,
    razorpayPaymentId,
    metadata: {
      gatewayAmount,
      gatewayCurrency,
    },
    paidAt: purchasedAt,
  });

  user.purchases.push({
    bookId: book._id,
    chapterIds: embeddedChapterIds,
    purchaseType,
    amount: totalAmount,
    currency,
    invoiceNumber,
    bookTitle: book.title,
    chapterTitles,
    purchasedAt,
    paymentProvider,
    paymentReference,
    stripePaymentIntentId,
    razorpayOrderId,
    razorpayPaymentId,
  });
  await user.save({ validateBeforeSave: false });

  await Promise.all(
    paidChapterIds.map((paidChapterId) =>
      BookAccess.updateOne(
        {
          userId: user._id,
          bookId: book._id,
          chapterId: paidChapterId,
          accessType:
            purchaseType === "chapter" ? "chapter_purchase" : "full_book_purchase",
        },
        {
          $setOnInsert: {
            purchaseId: purchase._id,
            grantedAt: purchasedAt,
          },
        },
        { upsert: true }
      )
    )
  );

  book.analytics = book.analytics || { purchases: 0 };
  book.analytics.purchases = (book.analytics.purchases || 0) + 1;
  await book.save({ validateBeforeSave: false });

  try {
    await sendEmail({
      to: user.email,
      type: "purchase_invoice",
      userId: user._id,
      metadata: { purchaseId: purchase._id, invoiceNumber },
      ...emailTemplates.purchaseConfirmation({
        name: user.name,
        bookTitle: book.title,
        chapterTitles: purchaseType === "chapter" ? chapterTitles : [],
        amount: totalAmount,
        currency,
        invoiceNumber,
        purchasedAt,
      }),
    });
  } catch (err) {
    console.error("Purchase invoice email failed:", err.message);
  }

  await createNotification({
    userId: user._id,
    type: "general",
    title: "Purchase complete",
    message:
      purchaseType === "chapter"
        ? `Your chapter from ${book.title} is ready.`
        : `${book.title} is now in your library.`,
    link: `/library`,
    metadata: { purchaseId: purchase._id, bookId: book._id },
  });

  await logActivity({
    userId: user._id,
    type: "purchase_completed",
    email: user.email,
    req,
    metadata: {
      purchaseId: purchase._id,
      bookId: book._id,
      chapterIds: paidChapterIds,
      purchaseType,
      invoiceNumber,
      amount: totalAmount,
      currency,
      paymentProvider,
      paymentReference,
      stripePaymentIntentId,
      razorpayOrderId,
      razorpayPaymentId,
      gatewayAmount,
      gatewayCurrency,
      source: paymentProvider === "razorpay" ? "razorpay_confirm" : "payment_webhook",
    },
  });

  return { purchase, alreadyFulfilled: false };
};

module.exports = {
  fulfillPurchase,
  isFreeChapter,
  makeInvoiceNumber,
};

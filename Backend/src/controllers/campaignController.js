const CampaignPledge = require("../models/CampaignPledge");
const CampaignBacker = require("../models/CampaignBacker");
const { sendEmail, emailTemplates } = require("../services/emailService");
const { catchAsync, createError } = require("../middleware/errorMiddleware");
const { logActivity } = require("../utils/activityLogger");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || "sk_test_missing");

const CAMPAIGN_GOAL_AMOUNT = Number(process.env.CAMPAIGN_GOAL_AMOUNT || 10000);

const TIERS = {
  digital: {
    tierName: "Digital Edition",
    amount: 2.99,
    needsShipping: false,
  },
  both: {
    tierName: "Digital + Physical Bundle",
    amount: 9.99,
    needsShipping: true,
  },
};

const cleanString = (value) => String(value || "").trim();

const getAllowedPaymentCurrencies = () =>
  String(process.env.PAYMENT_ALLOWED_CURRENCIES || "usd")
    .split(",")
    .map((currency) => currency.trim().toLowerCase())
    .filter(Boolean);

const makePledgeNumber = () =>
  `CHC-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;

const buildCampaignPledgePayload = (req) => {
  const tierKey = cleanString(req.body.tier).toLowerCase();
  const tier = TIERS[tierKey];

  if (!tier) {
    throw createError("Please choose a valid campaign reward tier.", 400);
  }

  const backerName = cleanString(req.body.backerName || req.user.name);
  const backerEmail = cleanString(req.body.backerEmail || req.user.email).toLowerCase();

  if (!backerName || !backerEmail) {
    throw createError("Backer name and email are required.", 400);
  }

  const address = req.body.shippingAddress || {};
  const shippingAddress = tier.needsShipping
    ? {
        fullName: cleanString(address.fullName || backerName),
        phone: cleanString(address.phone),
        email: cleanString(address.email || backerEmail).toLowerCase(),
        line1: cleanString(address.line1),
        city: cleanString(address.city),
        country: cleanString(address.country),
      }
    : undefined;

  if (tier.needsShipping) {
    const missing = ["fullName", "line1", "city", "country"].find(
      (key) => !shippingAddress[key],
    );
    if (missing) throw createError(`Shipping ${missing} is required.`, 400);
  }

  return {
    tierKey,
    tier,
    backerName,
    backerEmail,
    shippingAddress,
    campaignSlug: cleanString(req.body.campaignSlug || "borrowing-your-textbook-print-run"),
    campaignTitle: cleanString(
      req.body.campaignTitle || "Borrowing Your Textbook - First English Print Run",
    ),
    currency: cleanString(req.body.currency || "USD").toUpperCase(),
  };
};

const createCampaignPledge = catchAsync(async (req, res, next) => {
  if (process.env.ALLOW_MANUAL_CAMPAIGN_PLEDGES !== "true") {
    return next(createError("Campaign pledges require online payment.", 402));
  }

  const {
    tierKey,
    tier,
    backerName,
    backerEmail,
    shippingAddress,
    campaignSlug,
    campaignTitle,
    currency,
  } = buildCampaignPledgePayload(req);

  const pledge = await CampaignPledge.create({
    pledgeNumber: makePledgeNumber(),
    campaignSlug,
    campaignTitle,
    userId: req.user._id,
    backerName,
    backerEmail,
    tier: tierKey,
    tierName: tier.tierName,
    quantity: 1,
    amount: tier.amount,
    currency,
    shippingAddress,
    paymentStatus: "pending",
    fulfillmentStatus: "pledged",
    paymentProvider: cleanString(req.body.paymentProvider || "manual"),
    notes: cleanString(req.body.notes),
  });

  try {
    await sendEmail({
      to: backerEmail,
      type: "campaign_pledge",
      userId: req.user._id,
      metadata: { pledgeId: pledge._id, pledgeNumber: pledge.pledgeNumber },
      ...emailTemplates.campaignPledgeConfirmation({
        name: backerName,
        pledgeNumber: pledge.pledgeNumber,
        campaignTitle: pledge.campaignTitle,
        tierName: pledge.tierName,
        amount: pledge.amount,
        currency: pledge.currency,
        shippingAddress,
      }),
    });
  } catch (err) {
    console.error("Campaign pledge email failed:", err.message);
  }

  res.status(201).json({
    status: "success",
    message: "Campaign pledge received.",
    data: { pledge },
  });
});

const createCampaignPledgePaymentIntent = catchAsync(async (req, res, next) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return next(createError("Stripe is not configured yet.", 503));
  }
  if (!process.env.STRIPE_PUBLISHABLE_KEY) {
    return next(createError("Stripe publishable key is not configured yet.", 503));
  }

  const {
    tierKey,
    tier,
    backerName,
    backerEmail,
    shippingAddress,
    campaignSlug,
    campaignTitle,
    currency,
  } = buildCampaignPledgePayload(req);

  const normalizedCurrency = currency.toLowerCase();
  const allowedCurrencies = getAllowedPaymentCurrencies();

  if (!allowedCurrencies.includes(normalizedCurrency)) {
    await logActivity({
      userId: req.user._id,
      type: "payment_security_blocked",
      email: req.user.email,
      req,
      metadata: {
        reason: "unsupported_currency",
        requestedCurrency: normalizedCurrency,
        allowedCurrencies,
        source: "campaign_pledge",
      },
    });
    return next(createError("Unsupported payment currency.", 400));
  }

  const amountInSmallestUnit = Math.round(Number(tier.amount) * 100);
  if (!Number.isFinite(amountInSmallestUnit) || amountInSmallestUnit < 50) {
    return next(createError("Invalid campaign pledge amount.", 400));
  }

  const pledge = await CampaignPledge.create({
    pledgeNumber: makePledgeNumber(),
    campaignSlug,
    campaignTitle,
    userId: req.user._id,
    backerName,
    backerEmail,
    tier: tierKey,
    tierName: tier.tierName,
    quantity: 1,
    amount: tier.amount,
    currency,
    shippingAddress,
    paymentStatus: "pending",
    fulfillmentStatus: "pledged",
    paymentProvider: "stripe",
  });

  await CampaignBacker.updateOne(
    { campaignSlug, userId: req.user._id },
    {
      $setOnInsert: {
        campaignSlug,
        campaignTitle,
        userId: req.user._id,
        name: backerName,
        email: backerEmail,
        firstPledgedAt: new Date(),
      },
      $set: {
        campaignTitle,
        name: backerName,
        email: backerEmail,
        latestTier: tierKey,
        latestTierName: tier.tierName,
        currency,
        status: "pending",
        lastPledgedAt: new Date(),
      },
      $inc: {
        pledgeCount: 1,
        totalPledgedAmount: tier.amount,
      },
    },
    { upsert: true },
  );

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInSmallestUnit,
    currency: normalizedCurrency,
    automatic_payment_methods: { enabled: true },
    receipt_email: backerEmail,
    metadata: {
      purchaseType: "campaign_pledge",
      userId: req.user._id.toString(),
      pledgeId: pledge._id.toString(),
      pledgeNumber: pledge.pledgeNumber,
      campaignSlug,
      expectedAmount: String(amountInSmallestUnit),
      expectedCurrency: normalizedCurrency,
      pricingSource: "server",
    },
  });

  pledge.paymentReference = paymentIntent.id;
  await pledge.save({ validateBeforeSave: false });

  await logActivity({
    userId: req.user._id,
    type: "payment_intent_created",
    email: req.user.email,
    req,
    metadata: {
      source: "campaign_pledge",
      pledgeId: pledge._id,
      pledgeNumber: pledge.pledgeNumber,
      amountInSmallestUnit,
      currency: normalizedCurrency,
      stripePaymentIntentId: paymentIntent.id,
    },
  });

  res.status(201).json({
    status: "success",
    data: {
      pledge,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: tier.amount,
      currency: normalizedCurrency,
    },
  });
});

const getMyCampaignPledges = catchAsync(async (req, res) => {
  const pledges = await CampaignPledge.find({ userId: req.user._id }).sort({
    createdAt: -1,
  });

  res.status(200).json({ status: "success", data: { pledges } });
});

const getCampaignStats = catchAsync(async (req, res) => {
  const campaignSlug = cleanString(req.query.campaignSlug || "borrowing-your-textbook-print-run");
  const [totals] = await CampaignPledge.aggregate([
    { $match: { campaignSlug, paymentStatus: "paid" } },
    {
      $group: {
        _id: "$campaignSlug",
        backers: { $addToSet: "$userId" },
        pledges: { $sum: 1 },
        copies: { $sum: "$quantity" },
        digitalCopies: { $sum: { $cond: [{ $in: ["$tier", ["digital", "both"]] }, 1, 0] } },
        physicalCopies: { $sum: { $cond: [{ $eq: ["$tier", "both"] }, 1, 0] } },
        amount: { $sum: "$amount" },
      },
    },
    {
      $project: {
        _id: 0,
        campaignSlug: "$_id",
        backers: { $size: "$backers" },
        pledges: 1,
        copies: 1,
        digitalCopies: 1,
        physicalCopies: 1,
        amount: 1,
        goalAmount: { $literal: CAMPAIGN_GOAL_AMOUNT },
        goalReached: { $gte: ["$amount", CAMPAIGN_GOAL_AMOUNT] },
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      stats: totals || {
        campaignSlug,
        backers: 0,
        pledges: 0,
        copies: 0,
        digitalCopies: 0,
        physicalCopies: 0,
        amount: 0,
        goalAmount: CAMPAIGN_GOAL_AMOUNT,
        goalReached: false,
      },
    },
  });
});

module.exports = {
  createCampaignPledge,
  createCampaignPledgePaymentIntent,
  getMyCampaignPledges,
  getCampaignStats,
};

const crypto = require("crypto");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || "sk_test_missing");

const User = require("../models/User");
const SubscriptionPlan = require("../models/SubscriptionPlan");
const SubscriptionCatalogTitle = require("../models/SubscriptionCatalogTitle");
const Subscription = require("../models/Subscription");
const SubscriptionMember = require("../models/SubscriptionMember");
const CreditLedger = require("../models/CreditLedger");
const SubscriptionOrder = require("../models/SubscriptionOrder");
const RedemptionHistory = require("../models/RedemptionHistory");
const PaymentTransaction = require("../models/PaymentTransaction");
const { sendEmail } = require("./emailService");
const { logActivity } = require("../utils/activityLogger");

const DEFAULT_PLANS = [
  {
    planId: "reader",
    name: "Reader",
    description: "One monthly print or digital pick for casual readers.",
    sortOrder: 10,
    monthly: { amount: 12.99, currency: "USD", retailComparison: 17.99 },
    annual: { amount: 139.99, currency: "USD", retailComparison: 215.88 },
    credits: { monthly: 1, annual: 12 },
    bonusCredits: { monthly: 0, annual: 1, format: "manga" },
    allowedFormats: ["manga", "novel", "print", "digital"],
    benefits: ["1 credit per month", "Credits carry forward while active", "Free US shipping"],
  },
  {
    planId: "collector",
    name: "Collector",
    description: "More credits and bonus manga picks for frequent readers.",
    sortOrder: 20,
    monthly: { amount: 24.99, currency: "USD", retailComparison: 35.98 },
    annual: { amount: 269.99, currency: "USD", retailComparison: 431.76 },
    credits: { monthly: 2, annual: 24 },
    bonusCredits: { monthly: 1, annual: 3, format: "manga" },
    allowedFormats: ["manga", "novel", "print", "digital"],
    benefits: ["2 credits per month", "Bonus manga credits", "Free US shipping"],
  },
];

const clean = (value) => String(value || "").trim();

const makeOrderNumber = () =>
  `SUB-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;

const validateUsZip = (postalCode) => /^\d{5}(?:-\d{4})?$/.test(clean(postalCode));

const normaliseAddress = (address = {}, user) => ({
  fullName: clean(address.fullName || user?.name),
  phone: clean(address.phone),
  email: clean(address.email || user?.email).toLowerCase(),
  line1: clean(address.line1),
  line2: clean(address.line2),
  city: clean(address.city),
  state: clean(address.state),
  postalCode: clean(address.postalCode),
  country: clean(address.country || "US").toUpperCase(),
});

const assertUsShippingAddress = (shippingAddress) => {
  const missing = ["fullName", "phone", "email", "line1", "city", "state", "postalCode", "country"].find(
    (field) => !shippingAddress[field],
  );
  if (missing) {
    const err = new Error(`Shipping ${missing} is required.`);
    err.statusCode = 400;
    throw err;
  }
  if (shippingAddress.country !== "US") {
    const err = new Error("Subscriptions are currently available only for US shipping addresses.");
    err.statusCode = 400;
    throw err;
  }
  if (!validateUsZip(shippingAddress.postalCode)) {
    const err = new Error("Enter a valid US ZIP code.");
    err.statusCode = 400;
    throw err;
  }
};

const ensureDefaultPlans = async () => {
  const count = await SubscriptionPlan.countDocuments();
  if (count) return;
  await SubscriptionPlan.insertMany(DEFAULT_PLANS);
};

const listPlans = async () => {
  await ensureDefaultPlans();
  const plans = await SubscriptionPlan.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 });
  return plans.map((plan) => plan.toPublicJSON());
};

const listCatalog = async ({ format, plan_id: planId, release_status: releaseStatus, page = 1, limit = 24 } = {}) => {
  const query = { isActive: true };
  if (format) query.format = clean(format).toLowerCase();
  if (releaseStatus) query.releaseStatus = clean(releaseStatus).toLowerCase();
  if (planId) query.allowedPlanIds = clean(planId).toLowerCase();

  const safeLimit = Math.min(Math.max(Number(limit) || 24, 1), 100);
  const safePage = Math.max(Number(page) || 1, 1);
  const [items, total] = await Promise.all([
    SubscriptionCatalogTitle.find(query)
      .sort({ releaseDate: 1, title: 1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit),
    SubscriptionCatalogTitle.countDocuments(query),
  ]);

  return {
    items: items.map((item) => ({
      id: item.titleId,
      titleId: item.titleId,
      bookId: item.bookId,
      title: item.title,
      format: item.format,
      volume: item.volume,
      edition: item.edition,
      cover: item.coverImageUrl,
      pricing: item.pricing,
      release: {
        status: item.releaseStatus,
        date: item.releaseDate,
      },
      availability: item.availability,
      allowedPlanIds: item.allowedPlanIds,
      bonusEligible: item.bonusEligible,
    })),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.ceil(total / safeLimit),
    },
  };
};

const getActiveSubscription = (userId) =>
  Subscription.findOne({
    userId,
    status: { $in: ["active", "past_due", "incomplete"] },
  }).sort({ createdAt: -1 });

const syncSubscriptionMember = async ({ subscription, user }) => {
  const memberUser = user || (await User.findById(subscription.userId));
  return SubscriptionMember.findOneAndUpdate(
    { userId: subscription.userId },
    {
      $set: {
        userId: subscription.userId,
        subscriptionId: subscription._id,
        name: memberUser?.name,
        email: memberUser?.email,
        planId: subscription.planId,
        billingCycle: subscription.billingCycle,
        status: subscription.status,
        startedAt: subscription.currentPeriodStart || subscription.createdAt,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelledAt: subscription.cancelledAt,
        stripeCustomerId: subscription.stripeCustomerId,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        lastSyncedAt: new Date(),
      },
    },
    { upsert: true, new: true, runValidators: true },
  );
};

const sendSubscriptionEmail = async ({ user, type, subject, body, metadata }) => {
  if (!user?.email) return;
  try {
    await sendEmail({
      to: user.email,
      userId: user._id,
      type,
      subject,
      metadata,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#241726;">
          <h2>${subject}</h2>
          <p>${body}</p>
        </div>
      `,
    });
  } catch (err) {
    console.error(`Subscription email failed (${type}):`, err.message);
  }
};

const grantCredits = async ({ userId, subscription, plan, source, referenceId, grantedAt = new Date() }) => {
  if (referenceId) {
    const existing = await CreditLedger.exists({
      userId,
      subscriptionId: subscription._id,
      referenceId,
      type: { $in: ["grant", "bonus"] },
    });
    if (existing) return [];
  }

  const cycle = subscription.billingCycle;
  const baseAmount = Number(plan.credits?.[cycle] || 0);
  const bonusAmount = Number(plan.bonusCredits?.[cycle] || 0);
  const expiresAt = new Date(grantedAt);
  expiresAt.setMonth(expiresAt.getMonth() + Number(process.env.SUBSCRIPTION_CREDIT_EXPIRY_MONTHS || 12));

  const docs = [];
  if (baseAmount > 0) {
    docs.push({
      userId,
      subscriptionId: subscription._id,
      planId: plan.planId,
      type: "grant",
      format: "any",
      amount: baseAmount,
      remaining: baseAmount,
      source,
      referenceId,
      expiresAt,
    });
  }
  if (bonusAmount > 0) {
    docs.push({
      userId,
      subscriptionId: subscription._id,
      planId: plan.planId,
      type: "bonus",
      format: plan.bonusCredits?.format || "manga",
      amount: bonusAmount,
      remaining: bonusAmount,
      source,
      referenceId: `${referenceId || source}:bonus`,
      expiresAt,
    });
  }

  if (docs.length) await CreditLedger.insertMany(docs, { ordered: false }).catch(() => null);
  subscription.lastCreditGrantAt = grantedAt;
  const next = new Date(grantedAt);
  if (cycle === "annual") next.setFullYear(next.getFullYear() + 1);
  else next.setMonth(next.getMonth() + 1);
  subscription.nextCreditGrantAt = next;
  await subscription.save({ validateBeforeSave: false });
  return docs;
};

const createStripeCustomerIfNeeded = async (user) => {
  const persistedUser = await User.findById(user._id).select("+stripeCustomerId");
  if (persistedUser?.stripeCustomerId) return persistedUser.stripeCustomerId;
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId: user._id.toString() },
  });
  persistedUser.stripeCustomerId = customer.id;
  await persistedUser.save({ validateBeforeSave: false });
  return customer.id;
};

const subscribeUser = async ({ user, planId, billingCycle, shippingAddress, req }) => {
  await ensureDefaultPlans();
  const plan = await SubscriptionPlan.findOne({ planId: clean(planId).toLowerCase(), isActive: true });
  if (!plan) {
    const err = new Error("Subscription plan not found.");
    err.statusCode = 404;
    throw err;
  }

  const cycle = billingCycle === "annual" ? "annual" : "monthly";
  const address = normaliseAddress(shippingAddress, user);
  assertUsShippingAddress(address);

  const existing = await getActiveSubscription(user._id);
  if (existing && existing.status === "active") {
    const err = new Error("You already have an active subscription.");
    err.statusCode = 409;
    throw err;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    const err = new Error("Stripe is not configured yet.");
    err.statusCode = 503;
    throw err;
  }

  const stripeCustomerId = await createStripeCustomerIfNeeded(user);
  const price = plan[cycle];
  const subscription = await Subscription.create({
    userId: user._id,
    planId: plan.planId,
    planSnapshot: plan.toPublicJSON(),
    billingCycle: cycle,
    status: "incomplete",
    stripeCustomerId,
    shippingAddress: address,
  });
  await syncSubscriptionMember({ subscription, user });

  if (cycle === "monthly") {
    const stripeSubscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [
        price.stripePriceId
          ? { price: price.stripePriceId }
          : {
              price_data: {
                currency: price.currency.toLowerCase(),
                product_data: { name: `${plan.name} Monthly Subscription` },
                recurring: { interval: "month" },
                unit_amount: Math.round(Number(price.amount) * 100),
              },
            },
      ],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
      metadata: {
        purchaseType: "subscription_monthly",
        userId: user._id.toString(),
        subscriptionId: subscription._id.toString(),
        planId: plan.planId,
      },
    });

    subscription.stripeSubscriptionId = stripeSubscription.id;
    subscription.currentPeriodStart = stripeSubscription.current_period_start
      ? new Date(stripeSubscription.current_period_start * 1000)
      : new Date();
    subscription.currentPeriodEnd = stripeSubscription.current_period_end
      ? new Date(stripeSubscription.current_period_end * 1000)
      : undefined;
    await subscription.save({ validateBeforeSave: false });
    await syncSubscriptionMember({ subscription, user });

    await PaymentTransaction.create({
      userId: user._id,
      subscriptionId: subscription._id,
      provider: "stripe",
      providerSubscriptionId: stripeSubscription.id,
      providerPaymentId: stripeSubscription.latest_invoice?.payment_intent?.id,
      type: "subscription_create",
      status: "pending",
      amount: price.amount,
      currency: price.currency,
      raw: stripeSubscription,
    });

    await logActivity({
      userId: user._id,
      type: "subscription_created",
      email: user.email,
      req,
      metadata: { subscriptionId: subscription._id, planId: plan.planId, billingCycle: cycle },
    });

    return {
      subscription,
      stripeSubscriptionId: stripeSubscription.id,
      clientSecret: stripeSubscription.latest_invoice?.payment_intent?.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
    };
  }

  const paymentIntent = await stripe.paymentIntents.create({
    customer: stripeCustomerId,
    amount: Math.round(Number(price.amount) * 100),
    currency: price.currency.toLowerCase(),
    automatic_payment_methods: { enabled: true },
    receipt_email: user.email,
    metadata: {
      purchaseType: "subscription_annual",
      userId: user._id.toString(),
      subscriptionId: subscription._id.toString(),
      planId: plan.planId,
      expectedAmount: String(Math.round(Number(price.amount) * 100)),
      expectedCurrency: price.currency.toLowerCase(),
    },
  });

  subscription.stripePaymentIntentId = paymentIntent.id;
  await subscription.save({ validateBeforeSave: false });
  await syncSubscriptionMember({ subscription, user });

  await PaymentTransaction.create({
    userId: user._id,
    subscriptionId: subscription._id,
    provider: "stripe",
    providerPaymentId: paymentIntent.id,
    type: "subscription_create",
    status: "pending",
    amount: price.amount,
    currency: price.currency,
    raw: paymentIntent,
  });

  return {
    subscription,
    paymentIntentId: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
  };
};

const activateSubscription = async ({ subscription, referenceId, req }) => {
  const plan = await SubscriptionPlan.findOne({ planId: subscription.planId });
  if (!plan) return subscription;
  if (subscription.status !== "active") {
    subscription.status = "active";
    subscription.currentPeriodStart = subscription.currentPeriodStart || new Date();
    if (!subscription.currentPeriodEnd) {
      const end = new Date();
      if (subscription.billingCycle === "annual") end.setFullYear(end.getFullYear() + 1);
      else end.setMonth(end.getMonth() + 1);
      subscription.currentPeriodEnd = end;
    }
  }
  await subscription.save({ validateBeforeSave: false });
  await syncSubscriptionMember({ subscription });
  await grantCredits({
    userId: subscription.userId,
    subscription,
    plan,
    source: "subscription_activation",
    referenceId,
  });
  await User.findByIdAndUpdate(subscription.userId, { $set: { isSubscriber: true } });
  const user = await User.findById(subscription.userId);
  await sendSubscriptionEmail({
    user,
    type: "subscription_welcome",
    subject: "Your Crossed Hearts subscription is active",
    body: "Your subscription is active and your reading credits are ready.",
    metadata: { subscriptionId: subscription._id, referenceId },
  });
  await logActivity({
    userId: subscription.userId,
    type: "subscription_activated",
    email: user?.email,
    req,
    metadata: { subscriptionId: subscription._id, referenceId },
  });
  return subscription;
};

const getCreditSummary = async (userId) => {
  const now = new Date();
  await CreditLedger.updateMany(
    { userId, status: "active", expiresAt: { $lte: now }, remaining: { $gt: 0 } },
    { $set: { status: "expired" } },
  );
  const credits = await CreditLedger.find({ userId }).sort({ expiresAt: 1, createdAt: 1 });
  const active = credits.filter((entry) => entry.status === "active" && Number(entry.remaining) > 0);
  return {
    balance: active.reduce((sum, entry) => sum + Number(entry.remaining || 0), 0),
    bonusBalance: active
      .filter((entry) => entry.type === "bonus")
      .reduce((sum, entry) => sum + Number(entry.remaining || 0), 0),
    expiring: active.filter((entry) => entry.expiresAt && entry.expiresAt <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    ledger: credits,
  };
};

const spendCredits = async ({ userId, subscription, title, creditCost }) => {
  const grants = await CreditLedger.find({
    userId,
    subscriptionId: subscription._id,
    status: "active",
    remaining: { $gt: 0 },
    expiresAt: { $gt: new Date() },
    $or: [{ format: "any" }, { format: title.format }],
  }).sort({ expiresAt: 1, createdAt: 1 });

  let remainingCost = creditCost;
  const used = [];
  for (const grant of grants) {
    if (remainingCost <= 0) break;
    const spend = Math.min(Number(grant.remaining || 0), remainingCost);
    grant.remaining -= spend;
    if (grant.remaining <= 0) grant.status = "used";
    await grant.save({ validateBeforeSave: false });
    used.push({ grant, spend });
    remainingCost -= spend;
  }

  if (remainingCost > 0) {
    const err = new Error("Not enough credits available for this title.");
    err.statusCode = 402;
    throw err;
  }

  return used;
};

const redeemCredits = async ({ user, titleId, req }) => {
  const subscription = await Subscription.findOne({ userId: user._id, status: "active" }).sort({ createdAt: -1 });
  if (!subscription) {
    const err = new Error("An active subscription is required to redeem credits.");
    err.statusCode = 403;
    throw err;
  }

  const title = await SubscriptionCatalogTitle.findOne({ titleId: clean(titleId).toLowerCase(), isActive: true });
  if (!title) {
    const err = new Error("Catalog title not found.");
    err.statusCode = 404;
    throw err;
  }
  if (title.releaseStatus !== "available") {
    const err = new Error("This title is not available for redemption yet.");
    err.statusCode = 400;
    throw err;
  }
  if (title.allowedPlanIds?.length && !title.allowedPlanIds.includes(subscription.planId)) {
    const err = new Error("Your plan does not allow this title format.");
    err.statusCode = 403;
    throw err;
  }

  const duplicate = await RedemptionHistory.findOne({
    userId: user._id,
    subscriptionId: subscription._id,
    titleId: title.titleId,
    status: "redeemed",
  });
  if (duplicate) {
    const err = new Error("This title has already been redeemed on this subscription.");
    err.statusCode = 409;
    throw err;
  }

  const creditCost = Number(title.pricing?.creditCost || 1);
  const usedCredits = await spendCredits({ userId: user._id, subscription, title, creditCost });
  const redemption = await RedemptionHistory.create({
    userId: user._id,
    subscriptionId: subscription._id,
    titleId: title.titleId,
    titleSnapshot: title.toObject(),
    format: title.format,
    creditCost,
    creditLedgerIds: usedCredits.map(({ grant }) => grant._id),
  });

  await CreditLedger.create({
    userId: user._id,
    subscriptionId: subscription._id,
    planId: subscription.planId,
    type: "redeem",
    format: title.format,
    amount: -creditCost,
    remaining: 0,
    status: "used",
    source: "redemption",
    referenceId: redemption._id.toString(),
    redemptionId: redemption._id,
  });

  const order = await SubscriptionOrder.create({
    orderNumber: makeOrderNumber(),
    userId: user._id,
    subscriptionId: subscription._id,
    redemptionId: redemption._id,
    titleId: title.titleId,
    titleSnapshot: title.toObject(),
    edition: title.edition,
    shippingAddress: subscription.shippingAddress,
    status: "pending",
  });
  redemption.orderId = order._id;
  await redemption.save({ validateBeforeSave: false });

  await logActivity({
    userId: user._id,
    type: "subscription_credit_redeemed",
    email: user.email,
    req,
    metadata: { subscriptionId: subscription._id, redemptionId: redemption._id, titleId: title.titleId, orderId: order._id },
  });

  return { redemption, order };
};

const getDashboard = async (user) => {
  const [subscription, credits, redemptions, orders] = await Promise.all([
    Subscription.findOne({ userId: user._id }).sort({ createdAt: -1 }),
    getCreditSummary(user._id),
    RedemptionHistory.find({ userId: user._id }).sort({ createdAt: -1 }).limit(20),
    SubscriptionOrder.find({ userId: user._id }).sort({ createdAt: -1 }).limit(20),
  ]);

  return {
    subscription,
    credits: {
      balance: credits.balance,
      bonusBalance: credits.bonusBalance,
      expiring: credits.expiring,
    },
    redemptionHistory: redemptions,
    orders,
  };
};

const getPicks = async (user) => {
  const subscription = await Subscription.findOne({ userId: user._id, status: "active" }).sort({ createdAt: -1 });
  const query = { isActive: true, releaseStatus: "available" };
  if (subscription?.planId) query.allowedPlanIds = subscription.planId;
  const picks = await SubscriptionCatalogTitle.find(query).sort({ bonusEligible: -1, releaseDate: -1 }).limit(12);
  return picks;
};

const cancelSubscription = async ({ user, req }) => {
  const subscription = await Subscription.findOne({ userId: user._id, status: { $in: ["active", "past_due", "incomplete"] } }).sort({ createdAt: -1 });
  if (!subscription) {
    const err = new Error("No active subscription found.");
    err.statusCode = 404;
    throw err;
  }
  if (subscription.stripeSubscriptionId && process.env.STRIPE_SECRET_KEY) {
    const cancelled = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
    subscription.cancelAtPeriodEnd = Boolean(cancelled.cancel_at_period_end);
  } else {
    subscription.status = "cancelled";
    subscription.cancelledAt = new Date();
  }
  await subscription.save({ validateBeforeSave: false });
  await syncSubscriptionMember({ subscription, user });
  await logActivity({
    userId: user._id,
    type: "subscription_cancel_requested",
    email: user.email,
    req,
    metadata: { subscriptionId: subscription._id },
  });
  return subscription;
};

const expireAndForfeitCredits = async () => {
  const now = new Date();
  const expired = await CreditLedger.updateMany(
    { status: "active", expiresAt: { $lte: now }, remaining: { $gt: 0 } },
    { $set: { status: "expired" } },
  );
  const cancelledSubscriptions = await Subscription.find({ status: { $in: ["cancelled", "expired"] } }).select("_id");
  const ids = cancelledSubscriptions.map((sub) => sub._id);
  const forfeited = ids.length
    ? await CreditLedger.updateMany(
        { subscriptionId: { $in: ids }, status: "active", remaining: { $gt: 0 } },
        { $set: { status: "forfeited" } },
      )
    : { modifiedCount: 0 };
  return { expired: expired.modifiedCount || 0, forfeited: forfeited.modifiedCount || 0 };
};

module.exports = {
  ensureDefaultPlans,
  listPlans,
  listCatalog,
  subscribeUser,
  activateSubscription,
  grantCredits,
  getCreditSummary,
  redeemCredits,
  getDashboard,
  getPicks,
  cancelSubscription,
  expireAndForfeitCredits,
  syncSubscriptionMember,
};

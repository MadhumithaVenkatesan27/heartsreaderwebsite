const { catchAsync, createError } = require("../middleware/errorMiddleware");
const SubscriptionPlan = require("../models/SubscriptionPlan");
const SubscriptionCatalogTitle = require("../models/SubscriptionCatalogTitle");
const Subscription = require("../models/Subscription");
const SubscriptionMember = require("../models/SubscriptionMember");
const SubscriptionOrder = require("../models/SubscriptionOrder");
const {
  listPlans,
  listCatalog,
  subscribeUser,
  getCreditSummary,
  redeemCredits,
  getDashboard,
  getPicks,
  cancelSubscription,
} = require("../services/subscriptionService");
const { logAdminAudit } = require("../utils/adminAuditLogger");

const getPlans = catchAsync(async (req, res) => {
  const plans = await listPlans();
  res.status(200).json({ status: "success", data: { plans } });
});

const getCatalog = catchAsync(async (req, res) => {
  const catalog = await listCatalog(req.query);
  res.status(200).json({ status: "success", data: { catalog } });
});

const subscribe = catchAsync(async (req, res) => {
  const result = await subscribeUser({
    user: req.user,
    planId: req.body.planId || req.body.plan_id,
    billingCycle: req.body.billingCycle || req.body.billing_cycle,
    shippingAddress: req.body.shippingAddress,
    req,
  });

  res.status(201).json({
    status: "success",
    message: "Subscription payment created. Confirm payment to activate.",
    data: result,
  });
});

const getCredits = catchAsync(async (req, res) => {
  const credits = await getCreditSummary(req.user._id);
  res.status(200).json({ status: "success", data: { credits } });
});

const redeem = catchAsync(async (req, res) => {
  const result = await redeemCredits({
    user: req.user,
    titleId: req.body.titleId || req.body.title_id,
    req,
  });
  res.status(201).json({
    status: "success",
    message: "Credit redeemed and fulfillment order created.",
    data: result,
  });
});

const carryForward = catchAsync(async (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Active credits already carry forward until their expiry date while the subscription remains active.",
  });
});

const dashboard = catchAsync(async (req, res) => {
  const data = await getDashboard(req.user);
  res.status(200).json({ status: "success", data });
});

const dashboardPicks = catchAsync(async (req, res) => {
  const picks = await getPicks(req.user);
  res.status(200).json({ status: "success", data: { picks } });
});

const cancel = catchAsync(async (req, res) => {
  const subscription = await cancelSubscription({ user: req.user, req });
  res.status(200).json({
    status: "success",
    message: "Subscription cancellation has been scheduled.",
    data: { subscription },
  });
});

const listMyOrders = catchAsync(async (req, res) => {
  const orders = await SubscriptionOrder.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(100);
  res.status(200).json({ status: "success", data: { orders } });
});

const requireObject = (value, message) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw createError(message, 400);
};

const adminListPlans = catchAsync(async (req, res) => {
  const plans = await SubscriptionPlan.find().sort({ sortOrder: 1, createdAt: 1 });
  res.status(200).json({ status: "success", data: { plans } });
});

const adminUpsertPlan = catchAsync(async (req, res) => {
  requireObject(req.body.monthly, "Monthly pricing is required.");
  requireObject(req.body.annual, "Annual pricing is required.");
  requireObject(req.body.credits, "Credits are required.");
  const planId = String(req.params.planId || req.body.planId || "").trim().toLowerCase();
  if (!planId) throw createError("Plan ID is required.", 400);

  const plan = await SubscriptionPlan.findOneAndUpdate(
    { planId },
    {
      $set: {
        planId,
        name: req.body.name,
        description: req.body.description,
        isActive: req.body.isActive !== false,
        sortOrder: Number(req.body.sortOrder || 0),
        monthly: req.body.monthly,
        annual: req.body.annual,
        credits: req.body.credits,
        bonusCredits: req.body.bonusCredits || {},
        allowedFormats: req.body.allowedFormats || [],
        benefits: req.body.benefits || [],
        metadata: req.body.metadata || {},
      },
    },
    { upsert: true, new: true, runValidators: true },
  );

  await logAdminAudit({
    admin: req.user,
    action: "subscription_plan_upsert",
    targetType: "SubscriptionPlan",
    targetId: plan._id,
    req,
    metadata: { planId },
  });

  res.status(200).json({ status: "success", data: { plan } });
});

const adminListCatalog = catchAsync(async (req, res) => {
  const catalog = await listCatalog({ ...req.query, limit: req.query.limit || 100 });
  res.status(200).json({ status: "success", data: { catalog } });
});

const adminUpsertCatalogTitle = catchAsync(async (req, res) => {
  const titleId = String(req.params.titleId || req.body.titleId || "").trim().toLowerCase();
  if (!titleId) throw createError("Title ID is required.", 400);

  const title = await SubscriptionCatalogTitle.findOneAndUpdate(
    { titleId },
    {
      $set: {
        titleId,
        bookId: req.body.bookId || undefined,
        title: req.body.title,
        format: req.body.format,
        volume: req.body.volume,
        edition: req.body.edition || "Standard",
        coverImageUrl: req.body.coverImageUrl || req.body.cover,
        releaseStatus: req.body.releaseStatus || "available",
        releaseDate: req.body.releaseDate,
        availability: req.body.availability || {},
        pricing: req.body.pricing || {},
        allowedPlanIds: req.body.allowedPlanIds || [],
        bonusEligible: Boolean(req.body.bonusEligible),
        isActive: req.body.isActive !== false,
        metadata: req.body.metadata || {},
      },
    },
    { upsert: true, new: true, runValidators: true },
  );

  await logAdminAudit({
    admin: req.user,
    action: "subscription_catalog_upsert",
    targetType: "SubscriptionCatalogTitle",
    targetId: title._id,
    req,
    metadata: { titleId },
  });

  res.status(200).json({ status: "success", data: { title } });
});

const adminListSubscriptions = catchAsync(async (req, res) => {
  const subscriptions = await Subscription.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(req.query.limit || 100), 200));
  res.status(200).json({ status: "success", data: { subscriptions } });
});

const adminListMembers = catchAsync(async (req, res) => {
  const query = {};
  if (req.query.status) query.status = String(req.query.status).trim();
  if (req.query.billingCycle) query.billingCycle = String(req.query.billingCycle).trim();
  if (req.query.planId) query.planId = String(req.query.planId).trim().toLowerCase();

  const members = await SubscriptionMember.find(query)
    .populate("userId", "name email")
    .populate("subscriptionId", "planId billingCycle status currentPeriodEnd")
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(req.query.limit || 100), 200));

  res.status(200).json({ status: "success", data: { members } });
});

const adminUpdateSubscription = catchAsync(async (req, res) => {
  const subscription = await Subscription.findByIdAndUpdate(
    req.params.subscriptionId,
    { $set: req.body },
    { new: true, runValidators: true },
  );
  if (!subscription) throw createError("Subscription not found.", 404);
  await logAdminAudit({
    admin: req.user,
    action: "subscription_update",
    targetType: "Subscription",
    targetId: subscription._id,
    req,
  });
  res.status(200).json({ status: "success", data: { subscription } });
});

const adminListOrders = catchAsync(async (req, res) => {
  const orders = await SubscriptionOrder.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(req.query.limit || 100), 200));
  res.status(200).json({ status: "success", data: { orders } });
});

const adminUpdateOrder = catchAsync(async (req, res) => {
  const allowed = ["status", "trackingNumber", "carrier", "notes"];
  const update = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) update[field] = req.body[field];
  });
  if (req.body.status === "shipped") update.shippedAt = new Date();
  if (req.body.status === "delivered") update.deliveredAt = new Date();

  const order = await SubscriptionOrder.findByIdAndUpdate(
    req.params.orderId,
    { $set: update },
    { new: true, runValidators: true },
  );
  if (!order) throw createError("Subscription order not found.", 404);
  await logAdminAudit({
    admin: req.user,
    action: "subscription_order_update",
    targetType: "SubscriptionOrder",
    targetId: order._id,
    req,
    metadata: update,
  });
  res.status(200).json({ status: "success", data: { order } });
});

module.exports = {
  getPlans,
  getCatalog,
  subscribe,
  getCredits,
  redeem,
  carryForward,
  dashboard,
  dashboardPicks,
  cancel,
  listMyOrders,
  adminListPlans,
  adminUpsertPlan,
  adminListCatalog,
  adminUpsertCatalogTitle,
  adminListSubscriptions,
  adminListMembers,
  adminUpdateSubscription,
  adminListOrders,
  adminUpdateOrder,
};

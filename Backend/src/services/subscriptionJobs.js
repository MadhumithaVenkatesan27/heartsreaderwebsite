const Subscription = require("../models/Subscription");
const SubscriptionPlan = require("../models/SubscriptionPlan");
const { expireAndForfeitCredits, grantCredits } = require("./subscriptionService");

let intervalHandle = null;

const runSubscriptionMaintenance = async () => {
  const now = new Date();
  const result = await expireAndForfeitCredits();

  const dueSubscriptions = await Subscription.find({
    status: "active",
    nextCreditGrantAt: { $lte: now },
  }).limit(250);

  let granted = 0;
  for (const subscription of dueSubscriptions) {
    const plan = await SubscriptionPlan.findOne({ planId: subscription.planId, isActive: true });
    if (!plan) continue;
    await grantCredits({
      userId: subscription.userId,
      subscription,
      plan,
      source: "scheduled_credit_grant",
      referenceId: `scheduled:${subscription._id}:${now.toISOString().slice(0, 10)}`,
      grantedAt: now,
    });
    granted += 1;
  }

  return { ...result, subscriptionsGranted: granted };
};

const startSubscriptionJobs = () => {
  if (intervalHandle || process.env.DISABLE_SUBSCRIPTION_JOBS === "true") return;
  const intervalMs = Number(process.env.SUBSCRIPTION_JOB_INTERVAL_MS || 60 * 60 * 1000);
  intervalHandle = setInterval(() => {
    runSubscriptionMaintenance().catch((err) => {
      console.error("Subscription maintenance job failed:", err.message);
    });
  }, intervalMs);
  if (intervalHandle.unref) intervalHandle.unref();

  runSubscriptionMaintenance()
    .then((result) => console.log("Subscription maintenance complete:", result))
    .catch((err) => console.error("Subscription maintenance job failed:", err.message));
};

module.exports = { startSubscriptionJobs, runSubscriptionMaintenance };

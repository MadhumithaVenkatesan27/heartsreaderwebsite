const mongoose = require("mongoose");

const priceSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD", uppercase: true, trim: true },
    stripePriceId: { type: String, trim: true },
    retailComparison: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
);

const subscriptionPlanSchema = new mongoose.Schema(
  {
    planId: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0, index: true },
    monthly: { type: priceSchema, required: true },
    annual: { type: priceSchema, required: true },
    credits: {
      monthly: { type: Number, required: true, min: 0 },
      annual: { type: Number, required: true, min: 0 },
    },
    bonusCredits: {
      monthly: { type: Number, default: 0, min: 0 },
      annual: { type: Number, default: 0, min: 0 },
      format: { type: String, enum: ["manga", "novel", "any"], default: "manga" },
    },
    allowedFormats: [{ type: String, enum: ["manga", "novel", "print", "digital"] }],
    benefits: [{ type: String, trim: true }],
    metadata: { type: Map, of: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
);

subscriptionPlanSchema.index({ isActive: 1, sortOrder: 1 });

subscriptionPlanSchema.methods.toPublicJSON = function () {
  const monthlySavings = Math.max(
    0,
    Number(this.monthly?.retailComparison || 0) - Number(this.monthly?.amount || 0),
  );
  const annualSavings = Math.max(
    0,
    Number(this.annual?.retailComparison || 0) - Number(this.annual?.amount || 0),
  );

  return {
    id: this.planId,
    planId: this.planId,
    name: this.name,
    description: this.description,
    monthly: this.monthly,
    annual: this.annual,
    credits: this.credits,
    bonusCredits: this.bonusCredits,
    allowedFormats: this.allowedFormats,
    retailComparison: {
      monthly: this.monthly?.retailComparison || 0,
      annual: this.annual?.retailComparison || 0,
    },
    savings: {
      monthly: monthlySavings,
      annual: annualSavings,
      monthlyPercent: this.monthly?.retailComparison
        ? Math.round((monthlySavings / this.monthly.retailComparison) * 100)
        : 0,
      annualPercent: this.annual?.retailComparison
        ? Math.round((annualSavings / this.annual.retailComparison) * 100)
        : 0,
    },
    benefits: this.benefits,
  };
};

module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);

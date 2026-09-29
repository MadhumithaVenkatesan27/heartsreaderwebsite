const express = require("express");
const {
  createCampaignPledge,
  createCampaignPledgePaymentIntent,
  getCampaignStats,
  getMyCampaignPledges,
} = require("../controllers/campaignController");
const { protect } = require("../middleware/authMiddleware");
const {
  validateRequest,
  rules,
  validateCampaignShippingAddress,
} = require("../middleware/validateRequest");

const router = express.Router();

router.get("/stats", getCampaignStats);
router.use(protect);
router.get("/pledges", getMyCampaignPledges);
const campaignPledgeValidation = validateRequest({
  body: {
    tier: rules.enum(["digital", "both"], { required: true }),
    backerName: rules.string({ min: 2, max: 160 }),
    backerEmail: rules.email(),
    shippingAddress: validateCampaignShippingAddress,
    campaignSlug: rules.slugOrObjectId({ required: false }),
    campaignTitle: rules.string({ min: 2, max: 200 }),
    currency: rules.currency(),
    notes: rules.string({ max: 1000 }),
  },
});

router.post("/pledges/payment-intent", campaignPledgeValidation, createCampaignPledgePaymentIntent);
router.post("/pledges", campaignPledgeValidation, createCampaignPledge);

module.exports = router;

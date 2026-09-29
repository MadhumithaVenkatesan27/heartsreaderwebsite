const { webcrypto } = require("crypto");
const mongoose = require("mongoose");
const CampaignBacker = require("../models/CampaignBacker");
const CampaignPledge = require("../models/CampaignPledge");
const CreditLedger = require("../models/CreditLedger");
const LicensorUser = require("../models/LicensorUser");
const PaymentTransaction = require("../models/PaymentTransaction");
const PhysicalProduct = require("../models/PhysicalProduct");
const PreorderBook = require("../models/PreorderBook");
const RedemptionHistory = require("../models/RedemptionHistory");
const Subscription = require("../models/Subscription");
const SubscriptionCatalogTitle = require("../models/SubscriptionCatalogTitle");
const SubscriptionMember = require("../models/SubscriptionMember");
const SubscriptionOrder = require("../models/SubscriptionOrder");
const SubscriptionPlan = require("../models/SubscriptionPlan");

if (!globalThis.crypto?.getRandomValues) {
  globalThis.crypto = webcrypto;
}

const ensureCollection = async (connection, model) => {
  const collectionName = model.collection.name;
  const exists = await connection.db
    .listCollections({ name: collectionName })
    .hasNext();

  if (!exists) {
    await model.createCollection();
  }

  await model.createIndexes();
};

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is required. Add it to your .env file.");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);

    await Promise.all([
      ensureCollection(conn.connection, CampaignBacker),
      ensureCollection(conn.connection, CampaignPledge),
      ensureCollection(conn.connection, CreditLedger),
      ensureCollection(conn.connection, LicensorUser),
      ensureCollection(conn.connection, PaymentTransaction),
      ensureCollection(conn.connection, PhysicalProduct),
      ensureCollection(conn.connection, PreorderBook),
      ensureCollection(conn.connection, RedemptionHistory),
      ensureCollection(conn.connection, Subscription),
      ensureCollection(conn.connection, SubscriptionCatalogTitle),
      ensureCollection(conn.connection, SubscriptionMember),
      ensureCollection(conn.connection, SubscriptionOrder),
      ensureCollection(conn.connection, SubscriptionPlan),
    ]);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

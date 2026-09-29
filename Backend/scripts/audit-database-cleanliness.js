const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const { auditDatabaseIntegrity } = require("../src/services/databaseService");

const redactUri = (uri) => {
  if (!uri) return "missing";
  try {
    const parsed = new URL(uri);
    if (parsed.password) parsed.password = "***";
    if (parsed.username) parsed.username = "***";
    return parsed.toString();
  } catch (err) {
    return "configured";
  }
};

const printSection = (title, value) => {
  console.log(`\n${title}`);
  console.log(JSON.stringify(value, null, 2));
};

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required to run the database audit.");
  }

  console.log("Database cleanliness audit starting.");
  console.log(`MongoDB URI: ${redactUri(process.env.MONGO_URI)}`);
  console.log("Mode: read-only. No documents will be changed.");

  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  });

  const audit = await auditDatabaseIntegrity();

  printSection("Summary", audit.summary);
  printSection("Physical Order Status", audit.details.physicalOrders.statusCounts);

  const issueDetails = {
    duplicateUserEmails: audit.details.users.duplicateEmails,
    invalidUsers: audit.details.users.invalidUsers,
    duplicateBookSlugs: audit.details.books.duplicateSlugs,
    invalidBooks: audit.details.books.invalidBooks,
    paymentDuplicates: audit.details.payments,
    invalidPhysicalOrders: audit.details.physicalOrders.invalidOrders,
    orphanPurchases: audit.details.orphanPurchases,
    orphanAccessRecords: audit.details.orphanAccessRecords,
    missingAccessRecords: audit.details.missingAccessRecords,
  };

  printSection("Issue Details", issueDetails);

  console.log(
    `\nAudit result: ${audit.healthy ? "clean" : "needs attention"}.`,
  );
};

run()
  .catch((error) => {
    console.error("Database cleanliness audit failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });

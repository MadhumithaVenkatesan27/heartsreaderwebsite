const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { webcrypto } = require("crypto");
const PhysicalProduct = require("../src/models/PhysicalProduct");

if (!globalThis.crypto?.getRandomValues) {
  globalThis.crypto = webcrypto;
}

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const APPLY = process.argv.includes("--apply");
const FRONTEND_PRINT_JS = path.join(__dirname, "..", "..", "Frontend", "print.js");

const PRODUCT_ID_ALIASES = {
  from: ["fktl"],
};

const readPrintTitles = () => {
  const source = fs.readFileSync(FRONTEND_PRINT_JS, "utf8");
  const start = source.indexOf("const PRINT_TITLES = [");
  const end = source.indexOf("];", start);
  if (start === -1 || end === -1) {
    throw new Error("Could not find PRINT_TITLES in Frontend/print.js.");
  }

  const arraySource = source.slice(source.indexOf("[", start), end + 1);
  return Function(`"use strict"; return (${arraySource});`)();
};

const normaliseSkuPart = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const buildSku = (productId, { volume, limited } = {}) => {
  const parts = ["PRINT", normaliseSkuPart(productId)];
  if (volume) parts.push(`V${volume}`);
  if (limited) parts.push("LTD");
  return parts.join("-");
};

const addProduct = (products, product) => {
  const sku = normaliseSkuPart(product.sku);
  if (!sku || products.has(sku)) return;
  products.set(sku, {
    ...product,
    sku,
    productId: String(product.productId || "").trim().toLowerCase(),
    currency: "USD",
    active: true,
    source: "frontend_print_catalog",
  });
};

const buildProducts = (titles) => {
  const products = new Map();

  titles.forEach((title) => {
    const productId = String(title.id || "").trim().toLowerCase();
    if (!productId || !title.title || !Number.isFinite(Number(title.priceReg))) return;

    const ids = [productId, ...(PRODUCT_ID_ALIASES[productId] || [])];
    const volumes = Math.max(Number(title.vols || 1), 1);

    ids.forEach((id) => {
      addProduct(products, {
        sku: buildSku(id),
        productId,
        title: title.title,
        edition: "Standard Paperback",
        editionType: "regular",
        format: title.format,
        price: Number(title.priceReg),
        coverImageUrl: title.image || "",
        isPreorder: Boolean(title.isPreorder),
      });

      if (Number.isFinite(Number(title.priceLtd))) {
        addProduct(products, {
          sku: buildSku(id, { limited: true }),
          productId,
          title: title.title,
          edition: "Limited Edition",
          editionType: "limited",
          format: title.format,
          price: Number(title.priceLtd),
          coverImageUrl: title.image || "",
          isPreorder: Boolean(title.isPreorder),
        });
      }

      for (let volume = 1; volume <= volumes; volume += 1) {
        addProduct(products, {
          sku: buildSku(id, { volume }),
          productId,
          title: `${title.title} Vol.${volume}`,
          volume,
          edition: "Standard Paperback",
          editionType: "regular",
          format: title.format,
          price: Number(title.priceReg),
          coverImageUrl: title.image || "",
          isPreorder: Boolean(title.isPreorder),
        });

        if (Number.isFinite(Number(title.priceLtd))) {
          addProduct(products, {
            sku: buildSku(id, { volume, limited: true }),
            productId,
            title: `${title.title} Vol.${volume}`,
            volume,
            edition: "Limited Edition",
            editionType: "limited",
            format: title.format,
            price: Number(title.priceLtd),
            coverImageUrl: title.image || "",
            isPreorder: Boolean(title.isPreorder),
          });
        }
      }
    });
  });

  return [...products.values()];
};

const redactMongoUri = (uri) =>
  String(uri || "").replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@");

const main = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required before running the migration.");
  }

  const titles = readPrintTitles();
  const products = buildProducts(titles);
  const existing = await PhysicalProduct.find({
    sku: { $in: products.map((product) => product.sku) },
  }).lean();
  const existingBySku = new Map(existing.map((product) => [product.sku, product]));

  const summary = {
    source: "Frontend/print.js",
    mode: APPLY ? "apply" : "dry-run",
    frontendTitlesRead: titles.length,
    productsPrepared: products.length,
    toCreate: 0,
    toUpdate: 0,
    unchanged: 0,
    saved: false,
  };

  const operations = products.map((product) => {
    const current = existingBySku.get(product.sku);
    const changed =
      !current ||
      current.productId !== product.productId ||
      current.title !== product.title ||
      Number(current.volume || 0) !== Number(product.volume || 0) ||
      current.edition !== product.edition ||
      current.editionType !== product.editionType ||
      current.format !== product.format ||
      Number(current.price) !== Number(product.price) ||
      current.currency !== product.currency ||
      current.coverImageUrl !== product.coverImageUrl ||
      Boolean(current.isPreorder) !== Boolean(product.isPreorder) ||
      Boolean(current.active) !== Boolean(product.active);

    if (!current) summary.toCreate += 1;
    else if (changed) summary.toUpdate += 1;
    else summary.unchanged += 1;

    return {
      updateOne: {
        filter: { sku: product.sku },
        update: { $set: product },
        upsert: true,
      },
    };
  });

  console.log("Physical product migration prepared:", {
    ...summary,
    mongoUri: redactMongoUri(process.env.MONGO_URI),
  });
  console.table(
    products.slice(0, 30).map((product) => ({
      sku: product.sku,
      productId: product.productId,
      title: product.title,
      edition: product.edition,
      price: product.price,
      active: product.active,
    })),
  );
  if (products.length > 30) {
    console.log(`... ${products.length - 30} more products omitted from preview.`);
  }

  if (APPLY) {
    await PhysicalProduct.bulkWrite(operations, { ordered: false });
    summary.saved = true;
  }

  console.log("Physical product migration summary:", summary);
};

mongoose
  .connect(process.env.MONGO_URI)
  .then(main)
  .catch((err) => {
    console.error(`Physical product migration failed: ${err.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });

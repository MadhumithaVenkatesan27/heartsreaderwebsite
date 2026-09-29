// cart-pricing.js — digital pricing rules. Edit prices here only.
window.CH_PRICING = {
  manga: { chapter: 0.75, full: 6 },
  lightNovel: { chapter: 0.5, full: 9 },
  manhwa: { chapter: null, full: 9 }, // full volume only
  novel: { chapter: null, full: 9 }, // full volume only
};

function chParsePrice(str) {
  const m = String(str || "").match(/(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : 0;
}

function chIsPrintEntry(item) {
  return (
    item.category === "Print" ||
    item.printOnly === true ||
    String(item.url || "").startsWith("print-")
  );
}

// Which price group a catalog entry belongs to
function chDigitalPricing(entry) {
  const P = window.CH_PRICING;
  if (entry.category === "Manhwa") return P.manhwa;
  if (entry.category === "Novel") return P.novel;
  const n = chParsePrice(entry.price);
  if (n >= 9) return P.novel; // full-volume-only titles start at $9
  if (n > 0 && n <= 0.5) return P.lightNovel; // "From $0.5"
  return P.manga; // "From $0.75" / "$0.75"
}

function chCleanUrl(u) {
  return String(u || "")
    .split(/[?#]/)[0]
    .replace(/^\/+/, "")
    .replace(/\.html$/i, "")
    .toLowerCase();
}

// Match a cart item to its digital catalog entry (by page URL, then by title)
function chFindCatalogEntry(cartItem) {
  const cat = Array.isArray(window.CH_CATALOG) ? window.CH_CATALOG : [];
  const digital = cat.filter((e) => e && !chIsPrintEntry(e));
  const u = chCleanUrl(cartItem.url || cartItem.href);
  if (u) {
    const hit = digital.find((e) => chCleanUrl(e.url) === u);
    if (hit) return hit;
  }
  const base = String(cartItem.title || "")
    .replace(/\s*[–—-]\s*full volume.*$/i, "")
    .trim()
    .toLowerCase();
  return digital.find((e) => String(e.title).toLowerCase() === base) || null;
}

// Rewrites digital prices in the saved cart to match CH_PRICING
function chFixCartPrices() {
  const cart = chGetCart();
  let changed = false;
  cart.forEach((c) => {
    if (c.type !== "digital") return;
    const entry = chFindCatalogEntry(c);
    if (!entry) return;
    const p = chDigitalPricing(entry);
    const isFull = /full volume/i.test(c.title || "");
    const target = isFull || p.chapter == null ? p.full : p.chapter;
    if (Number(c.price) !== target) {
      c.price = target;
      changed = true;
    }
  });
  if (changed) chSaveCart(cart);
  return changed;
}

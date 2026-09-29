let CH_USER = JSON.parse(sessionStorage.getItem("ch_user") || "null");
let CH_LIB = JSON.parse(sessionStorage.getItem("ch_lib") || "{}");
let CH_LIBRARY_PURCHASES = JSON.parse(
  sessionStorage.getItem("ch_library_purchases") || "[]",
);
let CH_PENDING = null;
function chResolveApiUrl() {
  const isLocal =
    ["localhost", "127.0.0.1", ""].includes(window.location.hostname) ||
    window.location.protocol === "file:";

  if (
    window.location.hostname === "thecrossedhearts.com" ||
    window.location.hostname === "www.thecrossedhearts.com"
  ) {
    return "https://api.thecrossedhearts.com/api";
  }
  const override =
    (isLocal ? localStorage.getItem("ch_api_url") : "") ||
    document.querySelector('meta[name="ch-api-url"]')?.getAttribute("content");
  if (override) return String(override).replace(/\/$/, "");

  if (isLocal) return "http://localhost:5000/api";
  if (window.CH_API_URL) return String(window.CH_API_URL).replace(/\/$/, "");
  return "https://crossed-hearts-final.onrender.com/api";
}
const CH_API_URL = chResolveApiUrl();
let CH_STRIPE = null;
let CH_STRIPE_CARD = null;
let CH_STRIPE_ELEMENTS = null;
let CH_PAYMENT_CONFIG = null;
let CH_BOOK_STATS = null;
let CH_BOOK_STATS_PROMISE = null;
let CH_SOCKET = null;
let CH_SOCKET_SCRIPT_PROMISE = null;
let CH_LIBRARY_SYNC_PROMISE = null;

function chApiOrigin() {
  return CH_API_URL.replace(/\/api\/?$/, "");
}

function chSlugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function chCleanHtmlPath(pathname) {
  if (!pathname || pathname === "/index.html") return "/";
  return pathname.endsWith(".html") ? pathname.slice(0, -5) : pathname;
}

function chCleanInternalHref(href) {
  if (
    !href ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  ) {
    return href;
  }
  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return href;
    const cleanPath = chCleanHtmlPath(url.pathname);
    return `${cleanPath}${url.search}${url.hash}`;
  } catch (_) {
    return href;
  }
}

function chIsInternalPath(link, cleanPath) {
  if (!link) return false;
  try {
    const href = link.getAttribute("href") || "";
    const url = new URL(href, window.location.href);
    return (
      url.origin === window.location.origin &&
      chCleanHtmlPath(url.pathname) === cleanPath
    );
  } catch (_) {
    return false;
  }
}

function chDedupeNavActionLinks() {
  const actions = document.querySelector(".nav-actions");
  if (!actions) return;

  const libraryLinks = Array.from(actions.querySelectorAll("a[href]")).filter(
    (link) =>
      chIsInternalPath(link, "/my-library") ||
      (link.textContent || "").trim().toLowerCase() === "my library",
  );

  libraryLinks.slice(1).forEach((link) => link.remove());
}

function chCurrentPageFileName() {
  const current = (
    window.location.pathname.split("/").pop() || "index.html"
  ).toLowerCase();
  if (!current || current === "/") return "index.html";
  return current.includes(".") ? current : `${current}.html`;
}

function chNormalizeCleanUrls(root = document) {
  root.querySelectorAll?.("a[href]").forEach((link) => {
    const href = link.getAttribute("href") || "";
    const cleanHref = chCleanInternalHref(href);
    if (cleanHref !== href) link.setAttribute("href", cleanHref);
  });
}

function chNormalizeCurrentUrl() {
  if (window.location.protocol === "file:") return;
  const cleanPath = chCleanHtmlPath(window.location.pathname);
  if (cleanPath !== window.location.pathname) {
    window.history.replaceState(
      window.history.state,
      document.title,
      `${cleanPath}${window.location.search}${window.location.hash}`,
    );
  }
}

chNormalizeCurrentUrl();

document.addEventListener(
  "click",
  (event) => {
    const link = event.target.closest?.("a[href]");
    if (!link || link.target || link.hasAttribute("download")) return;
    const cleanHref = chCleanInternalHref(link.getAttribute("href") || "");
    if (cleanHref && cleanHref !== link.getAttribute("href")) {
      link.setAttribute("href", cleanHref);
    }
  },
  true,
);

function chSetCurrentUser(user) {
  CH_USER = {
    id: user._id || user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
  };
  sessionStorage.setItem("ch_user", JSON.stringify(CH_USER));
  return CH_USER;
}

function chHydrateUserFromLocalCache() {
  const token = sessionStorage.getItem("ch_token");
  if (!token) return null;
  if (CH_USER) return CH_USER;

  try {
    const cachedUser = JSON.parse(sessionStorage.getItem("ch_user") || "null");
    if (!cachedUser?.email) return null;
    CH_USER = cachedUser;
    sessionStorage.setItem("ch_user", JSON.stringify(CH_USER));
    return CH_USER;
  } catch (err) {
    sessionStorage.removeItem("ch_user");
    return null;
  }
}

const CH_TITLE_ALIASES = {
  "the-abandoned-villainess-became-a-zombie-vol-1": [
    "abandoned-v1",
    "zombie-v1",
  ],
  "the-abandoned-villainess-became-a-zombie-vol-2": [
    "abandoned-v2",
    "zombie-v2",
  ],
  "you-re-way-too-cheeky-chigaya-kun-vol-1": ["chigaya-v1"],
  "you-re-way-too-cheeky-chigaya-kun-vol-2": ["chigaya-v2"],
  "the-executioner-of-grenimal-vol-1": ["grenimal-v1"],
  "the-executioner-of-grenimal-vol-2": ["grenimal-v2"],
  "the-matchmaker-s-fiance-vol-1": ["matchmaker-v1"],
  "all-rounder-maid-connie-ville-vol-1": ["connie-v1"],
  "all-rounder-maid-connie-ville-vol-2": ["connie-v2"],
  "why-raeliana-ended-up-at-the-duke-s-mansion-vol-1": ["raeliana-v1"],
  "why-raeliana-ended-up-at-the-duke-s-mansion-vol-2": ["raeliana-v2"],
};

const CH_FRONTEND_TITLE_CANONICAL = {
  "abandoned-v1": "zombie-v1",
  "abandoned-v2": "zombie-v2",
  "borrowing-v1": "borrowing",
  "timeisa-v1": "timeisa",
  "afternoon-v1": "afternoontea",
  "octopiece-v1": "octopiece",
  "print-matchmaker": "matchmaker-v1",
  "print-chigaya": "chigaya-v1",
  "print-executioner": "grenimal-v1",
  "print-allrounder": "connie-v1",
  "print-abandoned": "zombie-v1",
  "print-raeliana": "raeliana-v1",
};

function chCanonicalTitleId(titleId) {
  return CH_FRONTEND_TITLE_CANONICAL[titleId] || titleId;
}

const CH_PAGE_TITLE_IDS = {
  "matchmaker.html": "matchmaker-v1",
  "matchmaker-vol1.html": "matchmaker-v1",
  "print-matchmaker.html": "matchmaker-v1",
  "chigaya.html": "chigaya-v1",
  "chigaya-vol1.html": "chigaya-v1",
  "chigaya-vol2.html": "chigaya-v2",
  "print-chigaya.html": "chigaya-v1",
  "print-chigaya-vol1.html": "chigaya-v1",
  "print-chigaya-vol2.html": "chigaya-v2",
  "executioner.html": "grenimal-v1",
  "executioner-vol1.html": "grenimal-v1",
  "executioner-vol2.html": "grenimal-v2",
  "print-executioner.html": "grenimal-v1",
  "print-executioner-vol1.html": "grenimal-v1",
  "print-executioner-vol2.html": "grenimal-v2",
  "allrounder.html": "connie-v1",
  "allrounder-vol1.html": "connie-v1",
  "allrounder-vol2.html": "connie-v2",
  "print-allrounder.html": "connie-v1",
  "print-allrounder-vol1.html": "connie-v1",
  "print-allrounder-vol2.html": "connie-v2",
  "whyraeliana.html": "raeliana-v1",
  "whyraeliana-vol1.html": "raeliana-v1",
  "whyraeliana-vol2.html": "raeliana-v2",
  "print-raeliana.html": "raeliana-v1",
  "print-raeliana-vol1.html": "raeliana-v1",
  "print-raeliana-vol2.html": "raeliana-v2",
  "abandonedvillainess.html": "zombie-v1",
  "abandonedvillainess-vol1.html": "zombie-v1",
  "abandonedvillainess-vol2.html": "zombie-v2",
  "print-abandonedvillainess.html": "zombie-v1",
  "print-abandoned-vol1.html": "zombie-v1",
  "print-abandoned-vol2.html": "zombie-v2",
  "borrowing.html": "borrowing",
  "timeisa.html": "timeisa",
  "afternoon.html": "afternoontea",
  "octopiece.html": "octopiece",
  "print-baroness.html": "baroness-goes-on-strike-vol-1",
  "baroness-print.html": "baroness-goes-on-strike-vol-1",
  "print-from.html": "from-a-knight-to-a-lady-vol-1",
  "print-darling.html": "darling-why-dont-we-divorce",
  "darling-print.html": "darling-why-dont-we-divorce",
  "print-archduke.html": "the-archdukes-adopted-saint-vol-1",
  "archduke-print.html": "the-archdukes-adopted-saint-vol-1",
};

function chBookKeysFromPurchase(purchase) {
  const book = purchase.bookId || {};
  const candidates = [
    book.slug,
    book._id,
    purchase.bookId,
    purchase.bookTitle,
  ].filter(Boolean);
  const keys = new Set();
  candidates.forEach((candidate) => {
    const raw = String(candidate);
    const slug = chSlugify(raw);
    keys.add(raw);
    if (slug) keys.add(slug);
    (CH_TITLE_ALIASES[slug] || []).forEach((alias) => keys.add(alias));
  });
  return Array.from(keys);
}

function chChapterKeyFromId(book, chapterId) {
  const chapter = (book?.chapters || []).find(
    (item) => String(item._id) === String(chapterId),
  );
  if (!chapter) return String(chapterId);
  return "ch" + chapter.order;
}

function chApplyBackendPurchases(purchases = []) {
  const backendLib = {};
  CH_LIBRARY_PURCHASES = purchases;
  sessionStorage.setItem("ch_library_purchases", JSON.stringify(purchases));
  purchases.forEach((purchase) => {
    const keys = chBookKeysFromPurchase(purchase);
    const book = purchase.bookId || {};
    const ownedChapters =
      (purchase.purchaseType || "book") === "book"
        ? ["bundle"]
        : (purchase.chapterIds || []).map((id) => chChapterKeyFromId(book, id));
    keys.forEach((key) => {
      if (!backendLib[key]) backendLib[key] = [];
      ownedChapters.forEach((chapterKey) => {
        if (!backendLib[key].includes(chapterKey))
          backendLib[key].push(chapterKey);
      });
    });
  });
  CH_LIB = backendLib;
  sessionStorage.setItem("ch_lib", JSON.stringify(CH_LIB));
  if (CH_USER?.email) localStorage.removeItem("ch_lib_" + CH_USER.email);
  return CH_LIB;
}

async function chSyncLibraryFromBackend({ force = false } = {}) {
  const token = sessionStorage.getItem("ch_token");
  if (!CH_USER || !token) {
    CH_LIB = {};
    CH_LIBRARY_PURCHASES = [];
    if (!token) CH_USER = null;
    sessionStorage.removeItem("ch_lib");
    sessionStorage.removeItem("ch_library_purchases");
    if (!token) sessionStorage.removeItem("ch_user");
    return CH_LIB;
  }
  if (CH_LIBRARY_SYNC_PROMISE && !force) return CH_LIBRARY_SYNC_PROMISE;
  CH_LIBRARY_SYNC_PROMISE = fetch(`${CH_API_URL}/library`, {
    headers: { Authorization: "Bearer " + token },
  })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok || data.status !== "success") {
        const err = new Error(data.message || "Could not load your library.");
        err.status = res.status;
        throw err;
      }
      return chApplyBackendPurchases(data.data?.purchases || []);
    })
    .catch((err) => {
      console.warn("Library sync failed:", err.message || err);
      CH_LIB = {};
      CH_LIBRARY_PURCHASES = [];
      sessionStorage.removeItem("ch_lib");
      sessionStorage.removeItem("ch_library_purchases");
      if (err.status === 401 || err.status === 403) {
        CH_USER = null;
        sessionStorage.removeItem("ch_token");
        sessionStorage.removeItem("ch_user");
      }
      return CH_LIB;
    })
    .finally(() => {
      CH_LIBRARY_SYNC_PROMISE = null;
    });
  return CH_LIBRARY_SYNC_PROMISE;
}

async function chRestoreSessionFromToken() {
  let token = sessionStorage.getItem("ch_token");
  if (!token) {
    try {
      const refreshRes = await fetch(`${CH_API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      const refreshData = await refreshRes.json().catch(() => ({}));
      if (
        refreshRes.ok &&
        refreshData.status === "success" &&
        refreshData.accessToken
      ) {
        sessionStorage.setItem("ch_token", refreshData.accessToken);
        token = refreshData.accessToken;
        if (refreshData.data?.user) chSetCurrentUser(refreshData.data.user);
      }
    } catch (err) {}
  }
  if (!token) {
    CH_USER = null;
    sessionStorage.removeItem("ch_user");
    return null;
  }
  if (CH_USER) return CH_USER;
  const cachedUser = chHydrateUserFromLocalCache();
  if (cachedUser) return cachedUser;
  try {
    const res = await fetch(`${CH_API_URL}/auth/me`, {
      headers: { Authorization: "Bearer " + token },
    });
    const data = await res.json();
    if (!res.ok || data.status !== "success" || !data.data?.user) {
      sessionStorage.removeItem("ch_token");
      sessionStorage.removeItem("ch_user");
      return null;
    }
    const user = data.data.user;
    chSetCurrentUser(user);
    updateNavAuth();
    updateNavAuthBtn();
    chConnectSocket();
    return CH_USER;
  } catch (err) {
    console.warn("Session restore failed:", err.message || err);
    return null;
  }
}

// ================================================
// WISHLIST SYSTEM
// ================================================
function chGetWishlist() {
  const key = CH_USER ? "ch_wish_" + CH_USER.email : "ch_wish_guest";
  return JSON.parse(localStorage.getItem(key) || "[]");
}

function chSaveWishlist(list) {
  const key = CH_USER ? "ch_wish_" + CH_USER.email : "ch_wish_guest";
  localStorage.setItem(key, JSON.stringify(list));
}

function chIsWishlisted(titleId) {
  return chGetWishlist().includes(titleId);
}

function chToggleWishlist(titleId, titleName) {
  let list = chGetWishlist();
  const idx = list.indexOf(titleId);
  if (idx === -1) {
    list.push(titleId);
    chSaveWishlist(list);
    showToast("Added to Wish List!", "success");
    return true;
  } else {
    list.splice(idx, 1);
    chSaveWishlist(list);
    showToast("Removed from Wish List.", "info");
    return false;
  }
}

function chUpdateWishlistBtn(titleId, btn) {
  if (!btn) return;
  const wishlisted = chIsWishlisted(titleId);
  btn.classList.toggle("wishlisted", wishlisted);
  btn.title = wishlisted ? "Remove from Wish List" : "Add to Wish List";
  btn.setAttribute(
    "aria-label",
    wishlisted ? "Remove from Wish List" : "Add to Wish List",
  );
  btn.innerHTML = wishlisted
    ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`
    : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
}

// ================================================
// RATINGS & REVIEWS SYSTEM
// ================================================
function chGetReviews(titleId) {
  return JSON.parse(localStorage.getItem("ch_reviews_" + titleId) || "[]");
}

function chSaveReview(titleId, rating, text) {
  if (!CH_USER) {
    openAuth();
    showToast("Sign in to leave a review.", "error");
    return false;
  }
  if (rating < 1 || rating > 5) {
    showToast("Please select a star rating.", "error");
    return false;
  }
  const reviews = chGetReviews(titleId);
  // One review per user per title — update if exists
  const existingIdx = reviews.findIndex((r) => r.email === CH_USER.email);
  const reviewObj = {
    email: CH_USER.email,
    name: CH_USER.name || CH_USER.email.split("@")[0],
    rating: rating,
    text: (text || "").trim().substring(0, 600),
    date: new Date().toISOString().split("T")[0],
  };
  if (existingIdx !== -1) {
    reviews[existingIdx] = reviewObj;
  } else {
    reviews.unshift(reviewObj);
  }
  localStorage.setItem("ch_reviews_" + titleId, JSON.stringify(reviews));
  showToast("✓ Review submitted!", "success");
  return true;
}

function chGetAverageRating(titleId) {
  const reviews = chGetReviews(titleId);
  if (!reviews.length) return null;
  const sum = reviews.reduce((s, r) => s + r.rating, 0);
  return (sum / reviews.length).toFixed(1);
}

function chRenderStars(rating, interactive, onRate) {
  // rating = 0–5 (float for display, int for interactive)
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  if (interactive) {
    let html = `<span class="star-row interactive" data-selected="0">`;
    for (let i = 1; i <= 5; i++) {
      html += `<span class="star-btn" data-val="${i}" onclick="chSelectStar(this,${i},'${onRate}')" onmouseover="chHoverStars(this.parentElement,${i})" onmouseout="chResetStars(this.parentElement)">★</span>`;
    }
    html += `</span>`;
    return html;
  }
  let html = `<span class="star-row" title="${rating} out of 5">`;
  for (let i = 0; i < full; i++) html += `<span class="star full">★</span>`;
  if (half) html += `<span class="star half">★</span>`;
  for (let i = 0; i < empty; i++) html += `<span class="star empty">☆</span>`;
  html += `</span>`;
  return html;
}

function chMakeRatingStarsInteractive(starsEl, titleId) {
  titleId = chCanonicalTitleId(titleId);
  if (!starsEl || !titleId) return;
  starsEl.style.cursor = "pointer";
  starsEl.setAttribute("role", "button");
  starsEl.setAttribute("tabindex", "0");
  starsEl.title = "Add your rating";
  if (starsEl.dataset.ratingClickBound === "true") return;
  starsEl.dataset.ratingClickBound = "true";
  const openRating = (event) => {
    event.preventDefault();
    event.stopPropagation();
    chOpenReviewModal(
      titleId,
      document
        .querySelector(".book-title, .title-name, h1")
        ?.textContent?.trim() || "this title",
    );
  };
  starsEl.addEventListener("click", openRating);
  starsEl.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") openRating(event);
  });
}

function chSelectStar(el, val, formId) {
  const row = el.parentElement;
  row.dataset.selected = val;
  row.querySelectorAll(".star-btn").forEach((s, i) => {
    s.style.color = i < val ? "var(--gold)" : "var(--border)";
  });
}

function chHoverStars(row, val) {
  row.querySelectorAll(".star-btn").forEach((s, i) => {
    s.style.color = i < val ? "var(--gold)" : "var(--border)";
  });
}

function chResetStars(row) {
  const sel = parseInt(row.dataset.selected || "0");
  row.querySelectorAll(".star-btn").forEach((s, i) => {
    s.style.color = i < sel ? "var(--gold)" : "var(--border)";
  });
}

function chOpenReviewModal(titleId, titleName) {
  titleId = chCanonicalTitleId(titleId);
  if (!CH_USER) {
    openAuth();
    showToast("Sign in to leave a review.", "error");
    return;
  }
  const existing = chGetReviews(titleId).find((r) => r.email === CH_USER.email);
  const overlay = document.getElementById("reviewOverlay");
  const body = document.getElementById("reviewBody");
  if (!overlay || !body) {
    // inject modal if not present
    chInjectReviewModal();
    setTimeout(() => chOpenReviewModal(titleId, titleName), 50);
    return;
  }
  document.getElementById("reviewTitle").textContent = "Review: " + titleName;
  body.innerHTML = `
    <p style="font-size:13px;color:var(--muted);margin-bottom:14px;">Your honest review helps the community find great reads.</p>
    <div style="margin-bottom:14px;">
      <label style="font-size:12px;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;display:block;margin-bottom:6px;">Your Rating</label>
      ${chRenderStars(existing ? existing.rating : 0, true, "rev")}
    </div>
    <div style="margin-bottom:18px;">
      <label style="font-size:12px;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;display:block;margin-bottom:6px;">Your Review (optional)</label>
      <textarea id="revText" style="width:100%;min-height:90px;background:var(--ink-card);border:1px solid var(--border-s);border-radius:8px;color:var(--cream);padding:10px 12px;font-size:13px;font-family:var(--font-b);resize:vertical;" placeholder="What did you think of this title?" maxlength="600">${existing ? existing.text : ""}</textarea>
    </div>
    <button class="btn-pay" onclick="chSubmitReview('${titleId}')">Submit Review</button>
  `;
  // pre-select stars if editing
  if (existing) {
    setTimeout(() => {
      const row = body.querySelector(".star-row.interactive");
      if (row) {
        row.dataset.selected = existing.rating;
        chResetStars(row);
      }
    }, 30);
  }
  overlay.classList.add("open");
}

function chSubmitReview(titleId) {
  const row = document.querySelector("#reviewBody .star-row.interactive");
  const rating = row ? parseInt(row.dataset.selected || "0") : 0;
  const text = document.getElementById("revText")?.value || "";
  const ok = chSaveReview(titleId, rating, text);
  if (ok) {
    document.getElementById("reviewOverlay")?.classList.remove("open");
    // refresh review section if on title page
    if (typeof chRefreshReviews === "function") chRefreshReviews(titleId);
  }
}

function chInjectReviewModal() {
  const div = document.createElement("div");
  div.innerHTML = `
    <div class="modal-overlay" id="reviewOverlay" onclick="if(event.target===this)this.classList.remove('open')">
      <div class="modal">
        <button class="modal-x" onclick="document.getElementById('reviewOverlay').classList.remove('open')">✕</button>
        <div class="modal-title" id="reviewTitle">Write a Review</div>
        <div id="reviewBody"></div>
      </div>
    </div>`;
  document.body.appendChild(div.firstElementChild);
}

function chRenderReviewsSection(titleId, container) {
  if (!container) return;
  const reviews = chGetReviews(titleId);
  const avg = chGetAverageRating(titleId);
  const count = reviews.length;
  container.innerHTML = `
    <div class="reviews-header" style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:18px;">
      <div>
        <span style="font-size:32px;font-weight:700;color:var(--gold);font-family:var(--font-s)">${avg || "—"}</span>
        ${avg ? chRenderStars(parseFloat(avg), false) : ""}
        <span style="font-size:12px;color:var(--muted);margin-left:6px;">${count} review${count !== 1 ? "s" : ""}</span>
      </div>
      <button class="btn-gold" style="margin-left:auto" onclick="chOpenReviewModal('${titleId}', document.querySelector('.book-title, h1')?.textContent || 'this title')">
        ${reviews.find((r) => r.email === CH_USER?.email) ? "Edit Your Review" : "Write a Review"}
      </button>
    </div>
    <div class="reviews-list">
      ${
        reviews.length
          ? reviews
              .slice(0, 10)
              .map(
                (r) => `
        <div class="review-card" style="background:var(--ink-card);border:1px solid var(--border-s);border-radius:10px;padding:14px 16px;margin-bottom:12px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
            ${chRenderStars(r.rating, false)}
            <span style="font-weight:600;font-size:13px;color:var(--cream)">${chEscHtml(r.name)}</span>
            <span style="font-size:11px;color:var(--muted);margin-left:auto">${r.date}</span>
          </div>
          ${r.text ? `<p style="font-size:13px;color:var(--muted);margin:0;line-height:1.5">${chEscHtml(r.text)}</p>` : ""}
        </div>
      `,
              )
              .join("")
          : `<p style="color:var(--muted);font-size:13px;">No reviews yet. Be the first to review this title!</p>`
      }
    </div>`;
}

function chEscHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function chStatsKeysForBook(book) {
  const titleKey = chNormalizeBookStatKey(book?.title);
  const slugKey = chNormalizeBookStatKey(book?.slug);
  const keys = new Set(
    [book?._id, book?.slug, chSlugify(book?.title), titleKey, slugKey].filter(
      Boolean,
    ),
  );
  (CH_TITLE_ALIASES[book?.slug] || []).forEach((alias) => keys.add(alias));
  Object.entries(CH_TITLE_ALIASES).forEach(([slug, aliases]) => {
    if (aliases.includes(book?.slug)) {
      keys.add(slug);
      aliases.forEach((alias) => keys.add(alias));
    }
  });
  return Array.from(keys);
}

function chNormalizeBookStatKey(value) {
  return chSlugify(value)
    .replace(/-print$/, "")
    .replace(/-paperback$/, "")
    .replace(/-standard-edition$/, "")
    .replace(/-limited-edition$/, "")
    .replace(/-vol(?:ume)?-\d+$/, "")
    .replace(/-vol\d+$/, "");
}

async function chLoadBookStats({ force = false } = {}) {
  if (CH_BOOK_STATS && !force) return CH_BOOK_STATS;
  if (CH_BOOK_STATS_PROMISE && !force) return CH_BOOK_STATS_PROMISE;
  CH_BOOK_STATS_PROMISE = fetch(`${CH_API_URL}/books?limit=100`)
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok || data.status !== "success") {
        throw new Error(data.message || "Could not load book stats.");
      }
      const byKey = {};
      (data.data?.books || []).forEach((book) => {
        const stat = {
          id: book._id,
          slug: book.slug,
          title: book.title,
          ratingAverage: Number(book.ratingAverage || 0),
          ratingCount: Number(book.ratingCount || 0),
          purchaseCount: Number(book.analytics?.purchases || 0),
        };
        chStatsKeysForBook(book).forEach((key) => {
          byKey[key] = stat;
        });
      });
      CH_BOOK_STATS = byKey;
      chUpdateBackendStatsOnPage();
      if (typeof window.chOnBookStatsLoaded === "function") {
        window.chOnBookStatsLoaded(CH_BOOK_STATS);
      }
      return CH_BOOK_STATS;
    })
    .catch((err) => {
      console.warn("Book stats unavailable:", err.message || err);
      CH_BOOK_STATS = CH_BOOK_STATS || {};
      return CH_BOOK_STATS;
    })
    .finally(() => {
      CH_BOOK_STATS_PROMISE = null;
    });
  return CH_BOOK_STATS_PROMISE;
}

function chGetBookStat(titleId) {
  const normalized = chNormalizeBookStatKey(titleId);
  return (
    CH_BOOK_STATS?.[titleId] ||
    CH_BOOK_STATS?.[chCanonicalTitleId(titleId)] ||
    CH_BOOK_STATS?.[normalized] ||
    CH_BOOK_STATS?.[chCanonicalTitleId(normalized)] ||
    null
  );
}

function chBackendBookId(titleId) {
  const canonicalTitleId = chCanonicalTitleId(titleId);
  return (
    chGetBookStat(canonicalTitleId)?.id ||
    chGetBookStat(titleId)?.id ||
    canonicalTitleId ||
    titleId
  );
}

async function chFetchReviews(titleId) {
  titleId = chCanonicalTitleId(titleId);
  await chLoadBookStats();
  const res = await fetch(
    `${CH_API_URL}/books/${encodeURIComponent(chBackendBookId(titleId))}/reviews`,
  );
  const data = await res.json();
  if (!res.ok || data.status !== "success") {
    throw new Error(data.message || "Could not load reviews.");
  }
  const reviews = (data.data?.reviews || []).map((review) => ({
    email: "",
    name: review.userId?.name || "Reader",
    rating: Number(review.rating || 0),
    text: review.comment || "",
    date: String(review.createdAt || "").slice(0, 10),
  }));
  localStorage.setItem("ch_reviews_" + titleId, JSON.stringify(reviews));
  return reviews;
}

chSaveReview = async function chSaveReview(titleId, rating, text) {
  titleId = chCanonicalTitleId(titleId);
  if (!CH_USER) {
    openAuth();
    showToast("Sign in to leave a review.", "error");
    return false;
  }
  if (rating < 1 || rating > 5) {
    showToast("Please select a star rating.", "error");
    return false;
  }
  await chLoadBookStats();
  const res = await fetch(
    `${CH_API_URL}/books/${encodeURIComponent(chBackendBookId(titleId))}/reviews`,
    {
      method: "POST",
      headers: chAuthHeaders(),
      body: JSON.stringify({
        rating,
        comment: (text || "").trim().substring(0, 600),
      }),
    },
  );
  const data = await res.json();
  if (!res.ok || data.status !== "success") {
    throw new Error(data.message || "Could not save your review.");
  }
  await Promise.all([
    chLoadBookStats({ force: true }),
    chFetchReviews(titleId),
  ]);
  showToast("Review submitted!", "success");
  return true;
};

chGetAverageRating = function chGetAverageRating(titleId) {
  titleId = chCanonicalTitleId(titleId);
  const stat = chGetBookStat(titleId);
  if (stat?.ratingCount) return Number(stat.ratingAverage || 0).toFixed(1);
  const reviews = chGetReviews(titleId);
  if (!reviews.length) return null;
  const sum = reviews.reduce((s, r) => s + r.rating, 0);
  return (sum / reviews.length).toFixed(1);
};

chSubmitReview = async function chSubmitReview(titleId) {
  titleId = chCanonicalTitleId(titleId);
  const row = document.querySelector("#reviewBody .star-row.interactive");
  const rating = row ? parseInt(row.dataset.selected || "0") : 0;
  const text = document.getElementById("revText")?.value || "";
  try {
    const ok = await chSaveReview(titleId, rating, text);
    if (!ok) return;
    document.getElementById("reviewOverlay")?.classList.remove("open");
    if (typeof chRefreshReviews === "function") chRefreshReviews(titleId);
    chUpdateBackendStatsOnPage();
  } catch (err) {
    showToast(err.message || "Could not save your review.", "error");
  }
};

chRenderReviewsSection = function chRenderReviewsSection(titleId, container) {
  titleId = chCanonicalTitleId(titleId);
  if (!container) return;
  const reviews = chGetReviews(titleId);
  const avg = chGetAverageRating(titleId);
  const count = chGetBookStat(titleId)?.ratingCount || reviews.length;
  container.innerHTML = `
    <div class="reviews-header" style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:18px;">
      <div>
        <span style="font-size:32px;font-weight:700;color:var(--gold);font-family:var(--font-s)">${avg || "-"}</span>
        ${avg ? chRenderStars(parseFloat(avg), false) : ""}
        <span style="font-size:12px;color:var(--muted);margin-left:6px;">${count} review${count !== 1 ? "s" : ""}</span>
      </div>
      <button class="btn-gold" style="margin-left:auto" onclick="chOpenReviewModal('${titleId}', document.querySelector('.book-title, h1')?.textContent || 'this title')">
        Write a Review
      </button>
    </div>
    <div class="reviews-list">
      ${
        reviews.length
          ? reviews
              .slice(0, 10)
              .map(
                (r) => `
        <div class="review-card" style="background:var(--ink-card);border:1px solid var(--border-s);border-radius:10px;padding:14px 16px;margin-bottom:12px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
            ${chRenderStars(r.rating, false)}
            <span style="font-weight:600;font-size:13px;color:var(--cream)">${chEscHtml(r.name)}</span>
            <span style="font-size:11px;color:var(--muted);margin-left:auto">${r.date}</span>
          </div>
          ${r.text ? `<p style="font-size:13px;color:var(--muted);margin:0;line-height:1.5">${chEscHtml(r.text)}</p>` : ""}
        </div>
      `,
              )
              .join("")
          : `<p style="color:var(--muted);font-size:13px;">No reviews yet. Be the first to review this title!</p>`
      }
    </div>`;
  if (!container.dataset.backendReviewsLoaded) {
    container.dataset.backendReviewsLoaded = "true";
    chFetchReviews(titleId)
      .then(() => chRenderReviewsSection(titleId, container))
      .catch((err) => console.warn("Reviews unavailable:", err.message || err));
  }
};

function chTitleIdsFromPurchaseButtons() {
  const ids = new Set();
  document.querySelectorAll("[onclick*='initPurchase']").forEach((el) => {
    const onclick = el.getAttribute("onclick") || "";
    const match = onclick.match(/initPurchase\s*\(\s*['"]([^'"]+)['"]/);
    if (match?.[1]) ids.add(chCanonicalTitleId(match[1]));
  });
  return Array.from(ids);
}

function chUpdateBackendStatsOnPage() {
  const currentPage = chCurrentPageFileName();
  const currentCatalogItem = (window.CH_CATALOG || []).find((item) => {
    const href = String(item.href || item.url || "")
      .split("#")[0]
      .split("?")[0]
      .toLowerCase();
    return href && href.endsWith(currentPage);
  });
  const pageTitleText =
    document
      .querySelector(".book-title, .title-name, h1")
      ?.textContent?.trim() ||
    document.title ||
    "";
  const implicitCandidates = [
    CH_PAGE_TITLE_IDS[currentPage],
    ...chTitleIdsFromPurchaseButtons(),
    currentCatalogItem?.id,
    currentCatalogItem?.titleId,
    currentCatalogItem?.slug,
    currentCatalogItem?.title,
    pageTitleText,
    chNormalizeBookStatKey(pageTitleText),
  ]
    .filter(Boolean)
    .map((candidate) => chCanonicalTitleId(candidate));
  const implicitTitleId =
    implicitCandidates.find((candidate) => chGetBookStat(candidate)) ||
    implicitCandidates[0] ||
    null;

  document.querySelectorAll("[data-title-id], [data-book-id]").forEach((el) => {
    const titleId = el.dataset.titleId || el.dataset.bookId;
    const stat = chGetBookStat(titleId);
    if (!stat) return;
    const ratingCount = el.querySelector(".rating-count");
    if (ratingCount) {
      ratingCount.textContent = stat.ratingCount
        ? `${Number(stat.ratingAverage || 0).toFixed(1)} from ${stat.ratingCount} rating${stat.ratingCount !== 1 ? "s" : ""}`
        : "No ratings yet";
      ratingCount.style.cursor = "default";
    }
    const purchaseCount = el.querySelector(
      ".purchase-count, [data-purchase-count]",
    );
    if (purchaseCount) {
      purchaseCount.textContent = `${chFormatCount(stat.purchaseCount)} purchased`;
      purchaseCount.style.cursor = "default";
    }
    chMakeRatingStarsInteractive(
      el.querySelector(".title-rating .stars, .stars"),
      titleId,
    );
  });

  if (implicitTitleId) {
    const stat = chGetBookStat(implicitTitleId);
    document.querySelectorAll(".title-rating .stars").forEach((el) => {
      chMakeRatingStarsInteractive(el, implicitTitleId);
    });
    document.querySelectorAll(".title-rating").forEach((row) => {
      row.style.cursor = "default";
      row.removeAttribute("title");
      row
        .querySelectorAll(
          ".rating-count, .purchase-count, .purchase-count-inline, [data-purchase-count]",
        )
        .forEach((el) => {
          el.style.cursor = "default";
          el.removeAttribute("role");
          el.removeAttribute("tabindex");
        });
      chMakeRatingStarsInteractive(
        row.querySelector(".stars"),
        implicitTitleId,
      );
    });
    if (stat) {
      const avg = Number(stat.ratingAverage || 0);
      document.querySelectorAll(".rating-count").forEach((el) => {
        el.textContent = stat.ratingCount
          ? `${avg.toFixed(1)} from ${stat.ratingCount} rating${stat.ratingCount !== 1 ? "s" : ""}`
          : "No ratings yet";
        el.style.cursor = "default";
      });
      document.querySelectorAll(".title-rating .stars").forEach((el) => {
        el.innerHTML = stat.ratingCount
          ? chRenderStars(avg, false)
          : chRenderStars(0, false);
        chMakeRatingStarsInteractive(el, implicitTitleId);
      });
      document
        .querySelectorAll(
          ".purchase-count, .purchase-count-inline, [data-purchase-count]",
        )
        .forEach((el) => {
          el.textContent = `${chFormatCount(stat.purchaseCount)} purchased`;
          el.style.cursor = "default";
        });
      document
        .querySelectorAll(
          ".info-row, .meta-row, .mini-info-row, .title-meta-row",
        )
        .forEach((row) => {
          const label = row
            .querySelector(".label, .title-meta-label")
            ?.textContent?.trim()
            .toLowerCase();
          const value = row.querySelector(".value, .title-meta-value");
          if (!label || !value) return;
          if (label === "rating") {
            value.textContent = stat.ratingCount
              ? `★ ${avg.toFixed(1)} / 5`
              : "No ratings yet";
          }
          if (label === "purchases") {
            value.textContent = chFormatCount(stat.purchaseCount);
          }
        });
    }
  }
}

// ================================================
// UNIFIED CART (digital + print combined)
// ================================================
function chGetCart() {
  let cart = [];
  try {
    const raw = JSON.parse(localStorage.getItem("ch_cart") || "[]");
    cart = Array.isArray(raw) ? raw.filter(Boolean) : [];
  } catch (err) {
    cart = [];
  }
  // one-time migration from the old physical-only cart
  const legacy = localStorage.getItem("ch_physical_cart");
  if (legacy) {
    try {
      const legacyItems = JSON.parse(legacy);
      (Array.isArray(legacyItems)
        ? legacyItems
        : Object.values(legacyItems || {})
      )
        .filter(Boolean)
        .forEach((item) => {
          if (!cart.some((c) => c.id === item.sku)) {
            cart.push({
              id: item.sku,
              type: "print",
              sku: item.sku,
              title: item.title,
              edition: item.edition,
              price: Number(item.unitPrice || 0),
              cover: item.coverImageUrl || "",
              quantity: Number(item.quantity || 1),
              isPreorder: Boolean(item.isPreorder),
            });
          }
        });
    } catch (err) {}
    localStorage.removeItem("ch_physical_cart");
    localStorage.setItem("ch_cart", JSON.stringify(cart));
  }
  return cart;
}

function chSaveCart(cart) {
  localStorage.setItem("ch_cart", JSON.stringify(cart));
  if (typeof updateNavCartButton === "function") updateNavCartButton();
}

function chAddDigitalToCart(titleId, chId, label, price, cover) {
  const id = "d_" + titleId + "_" + chId;
  const cart = chGetCart();
  if (cart.some((c) => c.id === id)) {
    showToast("Already in your cart.", "info");
    window.location.href = "cart.html";
    return;
  }
  cart.push({
    id,
    type: "digital",
    titleId,
    chId,
    title: label,
    price: Number(price || 0),
    cover: cover || "",
    quantity: 1,
  });
  chSaveCart(cart);
  showToast("Added to cart!", "success");
}

function chAddPrintToCart(item) {
  if (!item?.sku) return;
  const cart = chGetCart();
  const existing = cart.find((c) => c.id === item.sku && c.type === "print");
  if (existing) {
    existing.quantity = Number(existing.quantity || 1) + 1;
  } else {
    cart.push({
      id: item.sku,
      type: "print",
      sku: item.sku,
      title: item.title,
      edition: item.edition,
      price: Number(item.unitPrice || 0),
      cover: item.coverImageUrl || "",
      quantity: 1,
      isPreorder: Boolean(item.isPreorder),
    });
  }
  chSaveCart(cart);
}

function chRemoveCartItem(id) {
  chSaveCart(chGetCart().filter((c) => c.id !== id));
}

function chUpdateCartQty(id, delta) {
  const cart = chGetCart()
    .map((c) =>
      c.id === id
        ? {
            ...c,
            quantity: Math.max(
              Number(c.quantity || 1) + delta,
              c.type === "digital" ? 1 : 0,
            ),
          }
        : c,
    )
    .filter((c) => c.type === "digital" || Number(c.quantity || 0) > 0);
  chSaveCart(cart);
}

function chCartCount() {
  return chGetCart().reduce((n, c) => n + Number(c.quantity || 1), 0);
}

function chCartSubtotal() {
  return chGetCart().reduce(
    (sum, c) => sum + Number(c.price || 0) * Number(c.quantity || 1),
    0,
  );
}

function chCartHasPrint() {
  return chGetCart().some((c) => c.type === "print");
}

function chCartHasDigital() {
  return chGetCart().some((c) => c.type === "digital");
}

function chSuggestedTitles(limit) {
  const cartTitles = new Set(chGetCart().map((c) => c.title));
  return (window.CH_CATALOG || [])
    .filter((item) => !cartTitles.has(item.title))
    .sort(() => Math.random() - 0.5)
    .slice(0, limit || 4);
}

// ================================================
// PURCHASE COUNT TRACKER
// ================================================
// Seeds realistic base counts per title (public-facing)
const CH_PURCHASE_BASE = {
  "chigaya-v1": 412,
  "chigaya-v2": 287,
  "grenimal-v1": 389,
  "grenimal-v2": 201,
  "matchmaker-v1": 343,
  "connie-v1": 298,
  "connie-v2": 178,
  borrowing: 508,
  timeisa: 334,
  afternoontea: 276,
  "zombie-v1": 621,
  "zombie-v2": 389,
  "raeliana-v1": 744,
  "raeliana-v2": 501,
};

function chGetPurchaseCount(titleId) {
  const extra = parseInt(localStorage.getItem("ch_pc_" + titleId) || "0");
  return (CH_PURCHASE_BASE[titleId] || 0) + extra;
}

function chIncrementPurchaseCount(titleId) {
  const current = parseInt(localStorage.getItem("ch_pc_" + titleId) || "0");
  localStorage.setItem("ch_pc_" + titleId, current + 1);
}

function chFormatCount(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toString();
}

const chLegacyGetPurchaseCount = chGetPurchaseCount;
chGetPurchaseCount = function chGetPurchaseCount(titleId) {
  const stat = chGetBookStat(titleId);
  if (stat) return stat.purchaseCount;
  return chLegacyGetPurchaseCount(titleId);
};

// ================================================
// LICENSER CREDENTIALS
// ================================================
const CH_LICENSERS = {};

let CH_LICENSER = JSON.parse(sessionStorage.getItem("ch_licenser") || "null");

function licSignIn(id, pass) {
  return false;
}

function licSignOut() {
  CH_LICENSER = null;
  sessionStorage.removeItem("ch_licenser");
  window.location.href = "index.html";
}

function licGuard() {
  if (!CH_LICENSER) {
    window.location.href = "index.html#licenser";
    return false;
  }
  return true;
}

function licSignOut() {
  sessionStorage.removeItem("ch_licenser_session");
  sessionStorage.removeItem("lic_vol");
  CH_LICENSER = null;
  window.location.href = "licenser-login.html";
}

function licGuard() {
  if (!CH_LICENSER) {
    window.location.href = "licenser-login.html";
    return false;
  }
  return true;
}

// ================================================
// DRM PROTECTION — INIT
// ================================================
(function initDRM() {
  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    showToast("Right-click is disabled on this site.", "error");
  });

  document.addEventListener("keydown", (e) => {
    const ctrl = e.ctrlKey || e.metaKey;

    if (e.key === "F12") {
      e.preventDefault();
      showToast("DevTools access is restricted.", "error");
      return;
    }

    if (ctrl && e.shiftKey && ["i", "I", "j", "J", "c", "C"].includes(e.key)) {
      e.preventDefault();
      showToast("DevTools access is restricted.", "error");
      return;
    }

    if (ctrl && e.key === "p") {
      e.preventDefault();
      showToast("Printing is disabled for licensed content.", "error");
      return;
    }

    if (ctrl && e.key === "s") {
      e.preventDefault();
      return;
    }

    if (ctrl && e.key === "u") {
      e.preventDefault();
      return;
    }

    if (ctrl && e.key === "a" && isReaderPage()) {
      e.preventDefault();
      return;
    }

    if (ctrl && e.key === "c" && isReaderPage()) {
      e.preventDefault();
      showToast("Copying is disabled for licensed content.", "error");
      return;
    }
  });

  document.addEventListener("dragstart", (e) => e.preventDefault());

  document.addEventListener("copy", (e) => {
    if (isReaderPage()) {
      e.preventDefault();
      showToast("Copying is disabled for licensed content.", "error");
    }
  });

  const isLocalDev = ["localhost", "127.0.0.1"].includes(
    window.location.hostname,
  );
  let devOpen = false;
  const DT_THRESHOLD = 160;
  if (!isLocalDev)
    setInterval(() => {
      const open =
        window.outerWidth - window.innerWidth > DT_THRESHOLD ||
        window.outerHeight - window.innerHeight > DT_THRESHOLD;

      if (open && !devOpen) {
        devOpen = true;
        if (isReaderPage()) blurReaderContent();
      } else if (!open && devOpen) {
        devOpen = false;
        if (isReaderPage()) unblurReaderContent();
      }
    }, 1200);
})();

function isReaderPage() {
  return document.body.classList.contains("reader-active");
}

function blurReaderContent() {
  const rc = document.getElementById("readerPages");
  if (rc) rc.style.filter = "blur(12px)";
  showToast("Content hidden — DevTools detected.", "error");
}

function unblurReaderContent() {
  const rc = document.getElementById("readerPages");
  if (rc) rc.style.filter = "";
}

// ================================================
// MOBILE NAV
// ================================================
function toggleMobileNav() {
  const mobileNav = document.getElementById("mobileNav");
  const mobileOverlay = document.getElementById("mobileOverlay");
  if (!mobileNav) return;
  mobileNav.classList.toggle("open");
  if (mobileOverlay) mobileOverlay.classList.toggle("open");
  document.body.classList.toggle("mobile-nav-open");
}

document.addEventListener("DOMContentLoaded", () => {
  hideLegacyLicenserEntrypoints();
  const mobileNav = document.getElementById("mobileNav");
  const mobileOverlay = document.getElementById("mobileOverlay");

  if (mobileOverlay && mobileNav) {
    mobileOverlay.addEventListener("click", () => {
      mobileNav.classList.remove("open");
      mobileOverlay.classList.remove("open");
      document.body.classList.remove("mobile-nav-open");
    });
  }

  document.querySelectorAll(".mobile-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileNav?.classList.remove("open");
      mobileOverlay?.classList.remove("open");
      document.body.classList.remove("mobile-nav-open");
    });
  });
});
// ================================================
// PARTICLES (home hero only)
// ================================================
function initParticles() {
  const canvas = document.getElementById("particles");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let W,
    H,
    pts = [];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function spawnPt() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.2 + 0.3,
      a: Math.random() * Math.PI * 2,
      s: (Math.random() - 0.5) * 0.3,
      op: Math.random() * 0.35 + 0.05,
      da: (Math.random() - 0.5) * 0.008,
    };
  }

  resize();
  pts = Array.from({ length: 60 }, spawnPt);
  window.addEventListener("resize", resize);

  (function draw() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach((p) => {
      p.a += p.da;
      p.x += Math.cos(p.a) * p.s;
      p.y += Math.sin(p.a) * p.s * 0.5;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,168,76,${p.op})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  })();
}

// ================================================
// AUTH — backend-only account registry
// ================================================

function chGetAccounts() {
  localStorage.removeItem("ch_accounts");
  return {};
}
function chSaveAccounts(acc) {
  localStorage.removeItem("ch_accounts");
}

function chHash(str) {
  return "";
}

// ── Auth helpers ────────────────────────────────────────────────────────────
function chFieldError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.borderColor = "var(--rose)";
  let errEl = el.parentNode.querySelector(".ch-field-err");
  if (!errEl) {
    errEl = document.createElement("div");
    errEl.className = "ch-field-err";
    errEl.style.cssText = "font-size:11px;color:var(--rose);margin-top:5px;";
    el.parentNode.appendChild(errEl);
  }
  errEl.textContent = msg;
}
function chClearError(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.borderColor = "";
  const errEl = el.parentNode.querySelector(".ch-field-err");
  if (errEl) errEl.remove();
}
function chClearAllErrors() {
  document.querySelectorAll(".ch-field-err").forEach((e) => e.remove());
  document
    .querySelectorAll("#authBody .form-input")
    .forEach((e) => (e.style.borderColor = ""));
}

// ── Open / close ────────────────────────────────────────────────────────────
function chSetAuthMode(tab = "in", lockMode = false) {
  const authOv = document.getElementById("authOverlay");
  if (!authOv) return;
  const titleEl = authOv.querySelector(".modal-title");
  const subEl = authOv.querySelector(".modal-sub");
  const tabsEl = authOv.querySelector(".auth-tabs");
  const mode = tab === "up" ? "up" : "in";

  authOv.setAttribute("data-auth-mode", lockMode ? mode : "tabs");
  if (titleEl)
    titleEl.textContent = mode === "up" ? "Create Account" : "Sign In";
  if (subEl) {
    subEl.textContent =
      mode === "up"
        ? "Create your Crossed Hearts account to start reading."
        : "Sign in to continue to your library.";
  }
  if (tabsEl) tabsEl.style.display = lockMode ? "none" : "";
}

function chIsAuthModeLocked() {
  const mode = document
    .getElementById("authOverlay")
    ?.getAttribute("data-auth-mode");
  return mode === "in" || mode === "up";
}

async function openAuth(tab, options = {}) {
  if (tab !== "licenser") {
    const cachedUser = chHydrateUserFromLocalCache();
    const restoredUser = cachedUser || (await chRestoreSessionFromToken());
    if (restoredUser) {
      chSyncLibraryFromBackend({ force: true });
      updateNavAuth();
      updateNavAuthBtn();
      if (typeof onAuthChange === "function") onAuthChange();
      return;
    }
  }

  const ov = document.getElementById("authOverlay");
  if (ov) {
    ov.classList.add("open");
    chNormalizeAuthTabLabels();
    if (tab === "licenser") {
      renderLicenserTab();
    } else {
      const activeTab = tab || "in";
      chSetAuthMode(activeTab, Boolean(options.lockMode));
      renderAuthForm(activeTab);
    }
  }
}

function openLicenserAuth() {
  const ov = document.getElementById("authOverlay");
  if (ov) {
    ov.classList.add("open");
    renderLicenserTab();
  }
}

function renderLicenserTab() {
  const authOv = document.getElementById("authOverlay");
  if (!authOv) return;
  authOv.setAttribute("data-auth-mode", "licenser");
  const titleEl = authOv.querySelector(".modal-title");
  const subEl = authOv.querySelector(".modal-sub");
  const tabsEl = authOv.querySelector(".auth-tabs");
  if (titleEl) titleEl.textContent = "Licenser Access";
  if (subEl)
    subEl.textContent = "Authorised licensers only — access is logged.";
  if (tabsEl) tabsEl.style.display = "none";

  const body = document.getElementById("authBody");
  if (!body) return;
  body.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.2);border-radius:var(--r);padding:10px 14px;margin-bottom:20px;font-size:11px;color:var(--muted);">
      <span style="color:var(--gold);font-size:13px;flex-shrink:0">🔒</span>
      <span>This portal is restricted to authorised licensers. All sessions are watermarked and logged.</span>
    </div>
    <div class="form-group">
      <label class="form-label">Licenser ID</label>
      <input type="text" class="form-input" id="lic_id" placeholder="Licenser ID"
        autocomplete="off" spellcheck="false"
        oninput="chClearError('lic_id')"
        onkeydown="if(event.key==='Enter')document.getElementById('lic_pass').focus()">
    </div>
    <div class="form-group">
      <label class="form-label">Password</label>
      <div style="position:relative;">
        <input type="password" class="form-input" id="lic_pass" placeholder="••••••••"
          oninput="chClearError('lic_pass')"
          onkeydown="if(event.key==='Enter')doLicSignIn()"
          style="padding-right:42px;">
        <button type="button" onclick="chTogglePw('lic_pass',this)"
          style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--muted);cursor:pointer;font-size:13px;padding:4px;">
          Show
        </button>
      </div>
    </div>
    <button class="btn-pay" id="licSignInBtn" onclick="doLicSignIn()" style="background:var(--gold);color:var(--ink);">
      Enter Licenser Portal →
    </button>
    <div style="text-align:center;margin-top:16px;">
      <a href="#" style="font-size:11px;color:var(--muted);"
        onclick="event.preventDefault();restoreNormalAuthModal()">
        ← Back to regular sign in
      </a>
    </div>
  `;
}

setTimeout(() => {
  document
    .querySelectorAll("#authBody .form-input")
    .forEach((el) => (el.value = ""));
}, 50);

function restoreNormalAuthModal() {
  const authOv = document.getElementById("authOverlay");
  if (!authOv) return;
  const titleEl = authOv.querySelector(".modal-title");
  const subEl = authOv.querySelector(".modal-sub");
  const tabsEl = authOv.querySelector(".auth-tabs");
  if (titleEl) titleEl.textContent = "Welcome Back";
  if (subEl) subEl.textContent = "Sign in to access your digital library";
  if (tabsEl) tabsEl.style.display = "";
  authOv.setAttribute("data-auth-mode", "tabs");
  renderAuthForm("in");
}

function doLicSignIn() {
  chClearAllErrors();
  const id = (document.getElementById("lic_id")?.value || "").trim();
  const pass = document.getElementById("lic_pass")?.value || "";
  let valid = true;

  if (!id) {
    chFieldError("lic_id", "Licenser ID is required.");
    valid = false;
  }
  if (!pass) {
    chFieldError("lic_pass", "Password is required.");
    valid = false;
  }
  if (!valid) return;

  const btn = document.getElementById("licSignInBtn");
  if (btn) {
    btn.innerHTML = '<span class="spinner"></span> Verifying…';
    btn.disabled = true;
  }

  setTimeout(() => {
    const ok = licSignIn(id, pass);
    if (ok) {
      closeAuth();
      showToast(
        "Welcome, " + CH_LICENSER.name + "! Redirecting to portal…",
        "success",
      );
      setTimeout(() => {
        window.location.href = "licenser-portal.html";
      }, 800);
    } else {
      if (btn) {
        btn.innerHTML = "Enter Licenser Portal →";
        btn.disabled = false;
      }
      chFieldError("lic_id", "Invalid Licenser ID or password.");
    }
  }, 700);
}

function closeAuth() {
  const ov = document.getElementById("authOverlay");
  if (ov) ov.classList.remove("open");
  chClearAllErrors();
  document
    .querySelectorAll("#authBody .form-input")
    .forEach((el) => (el.value = ""));
  const authOv = document.getElementById("authOverlay");
  if (authOv) {
    const titleEl = authOv.querySelector(".modal-title");
    const subEl = authOv.querySelector(".modal-sub");
    const tabsEl = authOv.querySelector(".auth-tabs");
    if (titleEl) titleEl.textContent = "Welcome Back";
    if (subEl) subEl.textContent = "Sign in to access your digital library";
    if (tabsEl) tabsEl.style.display = "";
    authOv.setAttribute("data-auth-mode", "tabs");
  }
}
function closeAuthIfBg(e) {
  if (e.target === e.currentTarget) closeAuth();
}
function switchAuth(tab, el) {
  document
    .querySelectorAll(".atab")
    .forEach((t) => t.classList.remove("active"));
  el.classList.add("active");
  chClearAllErrors();
  renderAuthForm(tab);
}

// ── SIGN IN form ─────────────────────────────────────────────────────────────
function showSignInAfterVerification(email) {
  const authOv = document.getElementById("authOverlay");
  const tabs = document.querySelectorAll(".atab");
  tabs.forEach((tab) => tab.classList.remove("active"));
  if (tabs[0]) tabs[0].classList.add("active");
  if (authOv) {
    const titleEl = authOv.querySelector(".modal-title");
    const subEl = authOv.querySelector(".modal-sub");
    const tabsEl = authOv.querySelector(".auth-tabs");
    if (titleEl) titleEl.textContent = "Welcome Back";
    if (subEl) subEl.textContent = "Sign in to access your digital library";
    if (tabsEl) tabsEl.style.display = "";
    authOv.setAttribute("data-auth-mode", "tabs");
  }
  renderAuthForm("in");
  const emailInput = document.getElementById("ai_email");
  if (emailInput) {
    emailInput.value = email || "";
    document.getElementById("ai_pass")?.focus();
  }
}

function renderAuthForm(tab) {
  const body = document.getElementById("authBody");
  if (!body) return;
  const locked = chIsAuthModeLocked();

  if (tab === "in") {
    body.innerHTML = `
      <div class="form-group">
        <label class="form-label">Email Address</label>
        <input type="email" class="form-input" id="ai_email" placeholder="your@email.com"
          autocomplete="off"
          oninput="chClearError('ai_email')"
          onkeydown="if(event.key==='Enter')document.getElementById('ai_pass').focus()">
      </div>
      <div class="form-group">
        <label class="form-label">Password</label>
        <div style="position:relative;">
          <input type="password" class="form-input" id="ai_pass" placeholder="••••••••"
            autocomplete="new-password"
            oninput="chClearError('ai_pass')"
            onkeydown="if(event.key==='Enter')doSignIn()"
            style="padding-right:42px;">
          <button type="button" onclick="chTogglePw('ai_pass',this)"
            style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--muted);cursor:pointer;font-size:13px;padding:4px;">
            Show
          </button>
        </div>
      </div>
      <button class="btn-pay" id="signInBtn" onclick="doSignIn()">Sign In</button>
      <div style="text-align:right;margin-top:10px;">
        <a href="#" style="font-size:12px;color:var(--gold);"
          onclick="event.preventDefault();renderForgotPasswordForm(document.getElementById('ai_email')?.value || '')">
          Forgot password?
        </a>
      </div>
      <div style="text-align:center;margin-top:14px;">
        <span style="font-size:12px;color:var(--muted);">No account? </span>
        <a href="#" style="font-size:12px;color:var(--gold);"
          onclick="event.preventDefault();switchAuth('up',document.querySelectorAll('.atab')[1])">
          Sign Up →
        </a>
      </div>`;
  } else {
    body.innerHTML = `
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">First Name</label>
          <input type="text" class="form-input" id="au_fname" placeholder="First name"
            autocomplete="off"
            oninput="chClearError('au_fname')">
        </div>
        <div class="form-group">
          <label class="form-label">Last Name</label>
          <input type="text" class="form-input" id="au_lname" placeholder="Last name"
            autocomplete="off"
            oninput="chClearError('au_lname')">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Email Address</label>
        <input type="email" class="form-input" id="au_email" placeholder="your@email.com"
          autocomplete="off"
          oninput="chClearError('au_email');chCheckEmailLive(this.value)">
        <div id="au_email_confirm" style="font-size:11px;margin-top:5px;display:none;"></div>
      </div>
      <div class="form-group">
        <label class="form-label">Date of Birth</label>
        <input type="date" class="form-input" id="au_dob"
          autocomplete="off"
          oninput="chClearError('au_dob')" max="">
        <div style="font-size:10px;color:var(--muted);margin-top:5px;">You must be 13 or older to create an account.</div>
      </div>
      <div class="form-group">
        <label class="form-label">Password</label>
        <div style="position:relative;">
          <input type="password" class="form-input" id="au_pass" placeholder="Min. 8 characters"
            autocomplete="new-password"
            oninput="chClearError('au_pass');chPasswordStrength(this.value)"
            style="padding-right:42px;">
          <button type="button" onclick="chTogglePw('au_pass',this)"
            style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--muted);cursor:pointer;font-size:13px;padding:4px;">
            Show
          </button>
        </div>
        <div id="au_pw_strength" style="height:3px;border-radius:2px;margin-top:6px;background:var(--border-s);overflow:hidden;">
          <div id="au_pw_bar" style="height:100%;width:0%;transition:width 0.3s,background 0.3s;border-radius:2px;"></div>
        </div>
        <div id="au_pw_hint" style="font-size:10px;color:var(--muted);margin-top:4px;"></div>
      </div>
      <div class="form-group">
        <label class="form-label">Confirm Password</label>
        <div style="position:relative;">
          <input type="password" class="form-input" id="au_conf" placeholder="Re-enter password"
            autocomplete="new-password"
            oninput="chClearError('au_conf')"
            style="padding-right:42px;">
          <button type="button" onclick="chTogglePw('au_conf',this)"
            style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--muted);cursor:pointer;font-size:13px;padding:4px;">
            Show
          </button>
        </div>
      </div>
      <div class="form-group" style="display:flex;align-items:flex-start;gap:10px;">
        <input type="checkbox" id="au_terms" style="margin-top:3px;accent-color:var(--gold);flex-shrink:0;">
        <label for="au_terms" style="font-size:12px;color:var(--muted);cursor:pointer;line-height:1.5;">
          I agree to the <a href="terms.html" target="_blank" rel="noopener" style="color:var(--gold);">Terms of Service</a> and
          <a href="privacy.html" target="_blank" rel="noopener" style="color:var(--gold);">Privacy Policy</a>
        </label>
      </div>
      <button class="btn-pay" id="signUpBtn" onclick="doSignUp()">Create Account &amp; Start Reading</button>
      <div style="text-align:center;margin-top:14px;">
        <span style="font-size:12px;color:var(--muted);">Already have an account? </span>
        <a href="#" style="font-size:12px;color:var(--gold);"
          onclick="event.preventDefault();switchAuth('in',document.querySelectorAll('.atab')[0])">
          Sign in →
        </a>
      </div>`;

    const today = new Date().toISOString().split("T")[0];
    const dobEl = document.getElementById("au_dob");
    if (dobEl) dobEl.max = today;
  }

  if (locked) {
    body.querySelectorAll('a[onclick*="switchAuth"]').forEach((link) => {
      const wrapper = link.closest("div");
      if (wrapper) wrapper.remove();
    });
  }

  setTimeout(() => {
    document.querySelectorAll("#authBody .form-input").forEach((el) => {
      if (el.type !== "checkbox" && el.type !== "date") el.value = "";
    });
  }, 100);
}

// ── Live helpers ─────────────────────────────────────────────────────────────
function renderForgotPasswordForm(prefillEmail = "") {
  const body = document.getElementById("authBody");
  if (!body) return;
  body.innerHTML = `
    <div class="form-group">
      <label class="form-label">Email Address</label>
      <input type="email" class="form-input" id="fp_email" placeholder="your@email.com"
        value="${String(prefillEmail || "").replace(/"/g, "&quot;")}"
        autocomplete="email"
        oninput="chClearError('fp_email')"
        onkeydown="if(event.key==='Enter')doForgotPassword()">
      <div class="field-error" id="fp_email_error"></div>
    </div>
    <button class="btn-pay" id="forgotBtn" onclick="doForgotPassword()">Send Reset Email</button>
    <div style="text-align:center;margin-top:14px;">
      <a href="#" style="font-size:12px;color:var(--gold);"
        onclick="event.preventDefault();renderAuthForm('in')">
        Back to sign in
      </a>
    </div>
  `;
}

async function doForgotPassword() {
  chClearAllErrors();
  const email = (document.getElementById("fp_email")?.value || "")
    .trim()
    .toLowerCase();
  if (!email) {
    chFieldError("fp_email", "Email is required.");
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    chFieldError("fp_email", "Enter a valid email address.");
    return;
  }

  const btn = document.getElementById("forgotBtn");
  if (btn) {
    btn.innerHTML = '<span class="spinner"></span> Sending...';
    btn.disabled = true;
  }

  try {
    const res = await fetch(`${CH_API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok || data.status !== "success") {
      chFieldError("fp_email", data.message || "Could not send reset email.");
      return;
    }
    showToast(data.message || "Reset email sent.", "success");
    renderAuthForm("in");
  } catch (err) {
    showToast("Cannot connect to server. Is the backend running?", "error");
  } finally {
    if (btn) {
      btn.innerHTML = "Send Reset Email";
      btn.disabled = false;
    }
  }
}

function chTogglePw(inputId, btn) {
  const el = document.getElementById(inputId);
  if (!el) return;
  const isHidden = el.type === "password";
  el.type = isHidden ? "text" : "password";
  btn.textContent = isHidden ? "Hide" : "Show";
}

function chCheckEmailLive(val) {
  const conf = document.getElementById("au_email_confirm");
  if (!conf) return;
  const email = val.trim().toLowerCase();
  if (!email) {
    conf.style.display = "none";
    return;
  }
  conf.style.display = "block";
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    conf.style.color = "#4caf76";
    conf.textContent = "✓ Valid email format.";
  } else {
    conf.style.color = "var(--rose)";
    conf.textContent = "Please enter a valid email address.";
  }
}

function chPasswordStrength(val) {
  const bar = document.getElementById("au_pw_bar");
  const hint = document.getElementById("au_pw_hint");
  if (!bar || !hint) return;
  let score = 0;
  if (val.length >= 8) score++;
  if (val.length >= 12) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const levels = [
    { w: "0%", bg: "var(--border-s)", label: "" },
    { w: "25%", bg: "var(--rose)", label: "Weak" },
    { w: "50%", bg: "#e88b00", label: "Fair" },
    { w: "75%", bg: "#c9a84c", label: "Good" },
    { w: "100%", bg: "#4caf76", label: "Strong" },
  ];
  const lvl = levels[Math.min(score, 4)];
  bar.style.width = lvl.w;
  bar.style.background = lvl.bg;
  hint.textContent = lvl.label;
  hint.style.color = lvl.bg;
}

// ── SIGN IN ──────────────────────────────────────────────────────────────────
async function doSignIn() {
  chClearAllErrors();
  const email = (document.getElementById("ai_email")?.value || "")
    .trim()
    .toLowerCase();
  const pass = document.getElementById("ai_pass")?.value || "";
  let valid = true;

  if (!email) {
    chFieldError("ai_email", "Email is required.");
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    chFieldError("ai_email", "Enter a valid email address.");
    valid = false;
  }
  if (!pass) {
    chFieldError("ai_pass", "Password is required.");
    valid = false;
  }
  if (!valid) return;

  const btn = document.getElementById("signInBtn");
  if (btn) {
    btn.innerHTML = '<span class="spinner"></span> Signing in…';
    btn.disabled = true;
  }

  try {
    const res = await fetch(`${CH_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password: pass }),
    });
    const data = await res.json();

    if (!res.ok || data.status !== "success") {
      if (btn) {
        btn.innerHTML = "Sing In";
        btn.disabled = false;
      }
      if (
        data.code === "EMAIL_NOT_VERIFIED" ||
        (res.status === 403 && /verify your email/i.test(data.message || ""))
      ) {
        await chOpenVerifyEmailStep(email);
        return;
      }
      chFieldError(
        "ai_pass",
        data.message || "Invalid credentials. Please try again.",
      );
      return;
    }

    sessionStorage.setItem("ch_token", data.accessToken);
    chSetCurrentUser(data.data.user);
    await chSyncLibraryFromBackend({ force: true });
    updateNavAuth();
    closeAuth();
    showToast("Welcome back, " + data.data.user.name + "!", "success");
    chConnectSocket();
    if (typeof onAuthChange === "function") onAuthChange();
  } catch (err) {
    if (btn) {
      btn.innerHTML = "Sign In";
      btn.disabled = false;
    }
    showToast("Cannot connect to server. Is the backend running?", "error");
  }
}

// ── SIGN UP ──

async function doSignUp() {
  chClearAllErrors();
  const fname = (document.getElementById("au_fname")?.value || "").trim();
  const lname = (document.getElementById("au_lname")?.value || "").trim();
  const email = (document.getElementById("au_email")?.value || "")
    .trim()
    .toLowerCase();
  const dob = document.getElementById("au_dob")?.value || "";
  const pass = document.getElementById("au_pass")?.value || "";
  const conf = document.getElementById("au_conf")?.value || "";
  const terms = document.getElementById("au_terms")?.checked;
  let valid = true;

  if (!fname) {
    chFieldError("au_fname", "First name is required.");
    valid = false;
  }
  if (!lname) {
    chFieldError("au_lname", "Last name is required.");
    valid = false;
  }
  if (!email) {
    chFieldError("au_email", "Email is required.");
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    chFieldError("au_email", "Enter a valid email address.");
    valid = false;
  }
  if (!dob) {
    chFieldError("au_dob", "Date of birth is required.");
    valid = false;
  } else {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    if (age < 13) {
      chFieldError("au_dob", "You must be at least 13 years old.");
      valid = false;
    }
    if (birthDate > today) {
      chFieldError("au_dob", "Date of birth cannot be in the future.");
      valid = false;
    }
  }
  if (!pass) {
    chFieldError("au_pass", "Password is required.");
    valid = false;
  } else if (pass.length < 8) {
    chFieldError("au_pass", "Password must be at least 8 characters.");
    valid = false;
  }
  if (!conf) {
    chFieldError("au_conf", "Please confirm your password.");
    valid = false;
  } else if (pass && conf !== pass) {
    chFieldError("au_conf", "Passwords do not match.");
    valid = false;
  }
  if (!terms) {
    showToast("Please accept the Terms of Service to continue.", "error");
    valid = false;
  }
  if (!valid) return;

  const btn = document.getElementById("signUpBtn");
  if (btn) {
    btn.innerHTML = '<span class="spinner"></span> Creating account…';
    btn.disabled = true;
  }

  try {
    const res = await fetch(`${CH_API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: fname + " " + lname,
        email,
        password: pass,
      }),
    });
    const data = await res.json();

    if (!res.ok || data.status !== "success") {
      if (btn) {
        btn.innerHTML = "Create Account & Start Reading";
        btn.disabled = false;
      }
      chFieldError("au_email", data.message || "Registration failed.");
      return;
    }

    if (data.accessToken && data.data?.user) {
      sessionStorage.setItem("ch_token", data.accessToken);
      chSetCurrentUser(data.data.user);
      await chSyncLibraryFromBackend({ force: true });
      updateNavAuth();
      closeAuth();
      chConnectSocket();
    } else {
      renderVerifyEmailForm(email);
    }

    showToast(
      data.message || "Account created. Enter the OTP sent to your email.",
      "success",
    );
    if (typeof onAuthChange === "function") onAuthChange();
  } catch (err) {
    if (btn) {
      btn.innerHTML = "Create Account & Start Reading";
      btn.disabled = false;
    }
    showToast("Cannot connect to server. Is the backend running?", "error");
  }
}

async function chOpenVerifyEmailStep(email) {
  openAuth();
  setTimeout(() => renderVerifyEmailForm(email), 80);
}

function renderVerifyEmailForm(email) {
  const body = document.getElementById("authBody");
  if (!body) return;
  body.innerHTML = `
    <div class="form-group">
      <label class="form-label">Email Address</label>
      <input type="email" class="form-input" id="ve_email" value="${String(email || "").replace(/"/g, "&quot;")}" autocomplete="email"
        oninput="chClearError('ve_email')">
      <div class="field-error" id="ve_email_error"></div>
    </div>
    <div class="form-group">
      <label class="form-label">OTP Code</label>
      <input type="text" class="form-input" id="ve_code" placeholder="Enter 6-digit OTP" maxlength="6" inputmode="numeric"
        oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,6);chClearError('ve_code')"
        onkeydown="if(event.key==='Enter')doVerifyEmailOtp()">
      <div class="field-error" id="ve_code_error"></div>
    </div>
    <button class="btn-pay" id="verifyEmailBtn" onclick="doVerifyEmailOtp()">Verify Email</button>
    <div style="display:flex;justify-content:space-between;gap:12px;margin-top:14px;">
      <a href="#" style="font-size:12px;color:var(--gold);" onclick="event.preventDefault();doResendVerification()">Resend OTP</a>
      <a href="#" style="font-size:12px;color:var(--gold);" onclick="event.preventDefault();renderAuthForm('up')">Use another email</a>
    </div>
  `;
  setTimeout(() => document.getElementById("ve_code")?.focus(), 50);
}

async function doVerifyEmailOtp() {
  chClearAllErrors();
  const email = (document.getElementById("ve_email")?.value || "")
    .trim()
    .toLowerCase();
  const code = (document.getElementById("ve_code")?.value || "").trim();
  if (!email) {
    chFieldError("ve_email", "Email is required.");
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    chFieldError("ve_email", "Enter a valid email address.");
    return;
  }
  if (!/^\d{6}$/.test(code)) {
    chFieldError("ve_code", "Enter the 6-digit OTP from your email.");
    return;
  }

  const btn = document.getElementById("verifyEmailBtn");
  if (btn) {
    btn.innerHTML = '<span class="spinner"></span> Verifying...';
    btn.disabled = true;
  }

  try {
    const res = await fetch(`${CH_API_URL}/auth/verify-email-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    if (!res.ok || data.status !== "success") {
      chFieldError("ve_code", data.message || "Invalid or expired OTP.");
      return;
    }
    if (data.accessToken && data.data?.user) {
      sessionStorage.setItem("ch_token", data.accessToken);
      chSetCurrentUser(data.data.user);
      await chSyncLibraryFromBackend({ force: true });
      updateNavAuth();
      closeAuth();
      chConnectSocket();
      showToast("Email verified. Welcome to Crossed Hearts.", "success");
      if (typeof onAuthChange === "function") onAuthChange();
      return;
    }
    showToast("Email verified. Please sign in now.", "success");
    showSignInAfterVerification(email);
  } catch (err) {
    showToast("Cannot connect to server. Is the backend running?", "error");
  } finally {
    if (btn) {
      btn.innerHTML = "Verify Email";
      btn.disabled = false;
    }
  }
}

async function doResendVerification() {
  const email = (document.getElementById("ve_email")?.value || "")
    .trim()
    .toLowerCase();
  if (!email) {
    chFieldError("ve_email", "Email is required.");
    return;
  }
  try {
    const res = await fetch(`${CH_API_URL}/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok || data.status !== "success") {
      chFieldError("ve_email", data.message || "Could not resend OTP.");
      return;
    }
    renderVerifyEmailForm(email);
    showToast(
      "If this email is unverified, a fresh OTP is being sent.",
      "success",
    );
  } catch (err) {
    showToast("Cannot connect to server. Is the backend running?", "error");
  }
}

async function signOut() {
  try {
    await fetch(`${CH_API_URL}/auth/logout`, {
      method: "POST",
      headers: chAuthHeaders(),
      credentials: "include",
    });
  } catch (err) {}
  CH_USER = null;
  CH_LIB = {};
  sessionStorage.removeItem("ch_token");
  localStorage.removeItem("ch_user_persist");
  localStorage.removeItem("ch_pending_verification_email");
  localStorage.removeItem("ch_pending_reset_email");
  sessionStorage.removeItem("ch_user");
  sessionStorage.removeItem("ch_lib");
  sessionStorage.removeItem("ch_library_purchases");
  sessionStorage.removeItem("ch_pending_verification_email");
  sessionStorage.removeItem("ch_pending_reset_email");
  sessionStorage.removeItem("ch_licensor_token");
  sessionStorage.removeItem("ch_licensor_user");
  chDisconnectSocket();
  updateNavAuth();
  showToast("You have been signed out.");
  window.location.href = "index.html";
}

function updateNavAuth() {
  const si = document.getElementById("navSignIn");
  const so = document.getElementById("navSignOut");
  const ml = document.getElementById("navMyLib");
  if (CH_USER) {
    if (si) si.style.display = "none";
    if (so) so.style.display = "";
    if (ml) ml.style.display = "";
  } else {
    if (si) si.style.display = "";
    if (so) so.style.display = "none";
    if (ml) ml.style.display = "none";
  }
}

// ================================================
// PAYMENT FLOW
// ================================================
function chAuthHeaders(extra) {
  const token = sessionStorage.getItem("ch_token");
  return Object.assign(
    {
      "Content-Type": "application/json",
      Authorization: token ? "Bearer " + token : "",
    },
    extra || {},
  );
}

function chLoadStripeJs() {
  return new Promise(function (resolve, reject) {
    if (window.Stripe) return resolve();
    const existing = document.querySelector('script[data-ch-stripe="true"]');
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/";
    script.async = true;
    script.dataset.chStripe = "true";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function chGetPaymentConfig() {
  if (CH_PAYMENT_CONFIG) return CH_PAYMENT_CONFIG;
  const configRes = await fetch(`${CH_API_URL}/library/payment-config`);
  const config = await configRes.json();
  if (!configRes.ok || config.status !== "success") {
    throw new Error(config.message || "Payment is not configured yet.");
  }
  CH_PAYMENT_CONFIG = config.data || {};
  return CH_PAYMENT_CONFIG;
}

async function chGetStripe() {
  if (CH_STRIPE) return CH_STRIPE;
  const config = await chGetPaymentConfig();
  const publishableKey =
    config?.stripe?.publishableKey || config?.publishableKey;
  if (!publishableKey) throw new Error("Stripe is not configured yet.");
  await chLoadStripeJs();
  CH_STRIPE = window.Stripe(publishableKey);
  return CH_STRIPE;
}

function chLoadRazorpayJs() {
  return new Promise(function (resolve, reject) {
    if (window.Razorpay) return resolve();
    const existing = document.querySelector('script[data-ch-razorpay="true"]');
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.chRazorpay = "true";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function chMountStripeCard() {
  const mount = document.getElementById("stripeCardElement");
  if (!mount || CH_STRIPE_CARD) return;
  const stripe = await chGetStripe();
  CH_STRIPE_ELEMENTS = stripe.elements();
  CH_STRIPE_CARD = CH_STRIPE_ELEMENTS.create("card", {
    style: {
      base: {
        color: "#f7f0df",
        fontFamily: '"DM Sans", sans-serif',
        fontSize: "15px",
        "::placeholder": { color: "#9a9085" },
      },
      invalid: { color: "#e06565" },
    },
  });
  CH_STRIPE_CARD.mount("#stripeCardElement");
}

async function initPurchase(titleId, chId, chLabel, price, cover, coverBg) {
  await chRestoreSessionFromToken();
  if (!CH_USER) {
    openAuth();
    return;
  }

  CH_PENDING = {
    titleId: chCanonicalTitleId(titleId),
    chId,
    chLabel,
    price,
    cover,
    coverBg,
  };
  if (CH_STRIPE_CARD) {
    CH_STRIPE_CARD.destroy();
    CH_STRIPE_CARD = null;
    CH_STRIPE_ELEMENTS = null;
  }
  const overlay = document.getElementById("payOverlay");
  const body = document.getElementById("payBody");
  if (!overlay || !body) return;
  overlay.classList.add("open");
  body.innerHTML = renderPayBody(chLabel, price);
  if (price > 0) {
    chInitPaymentCountry(price);
  }
}

function chDefaultPaymentCountry() {
  const stored = localStorage.getItem("ch_payment_country");
  if (stored) return stored;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  return /kolkata|calcutta|india/i.test(timezone) ? "IN" : "US";
}

function chRazorpayExchangeRate() {
  const rate = Number(CH_PAYMENT_CONFIG?.razorpay?.exchangeRate);
  return Number.isFinite(rate) && rate > 0 ? rate : 83;
}

function chFormatPaymentAmount(amount, country) {
  const value = Number(amount || 0);
  if (country === "IN") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value * chRazorpayExchangeRate());
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function chInitPaymentCountry(price) {
  const select = document.getElementById("paymentCountry");
  if (select) {
    select.value = chDefaultPaymentCountry();
    select.dataset.price = String(price || 0);
    select.addEventListener("change", function () {
      chApplyPaymentCountry(Number(select.dataset.price || 0));
    });
  }
  chApplyPaymentCountry(price);
  chGetPaymentConfig()
    .then(function () {
      chApplyPaymentCountry(price);
    })
    .catch(function () {});
}

function chApplyPaymentCountry(price) {
  const select = document.getElementById("paymentCountry");
  const country = select?.value || chDefaultPaymentCountry();
  localStorage.setItem("ch_payment_country", country);

  const isIndia = country === "IN";
  const slot = document.getElementById("paymentMethodSlot");
  const orderAmount = document.getElementById("paymentOrderAmount");
  const orderTotal = document.getElementById("paymentOrderTotal");
  const displayAmount = chFormatPaymentAmount(price, country);
  if (orderAmount) orderAmount.textContent = displayAmount;
  if (orderTotal) orderTotal.textContent = displayAmount;
  if (!slot) return;

  if (CH_STRIPE_CARD) {
    CH_STRIPE_CARD.destroy();
    CH_STRIPE_CARD = null;
    CH_STRIPE_ELEMENTS = null;
  }

  if (isIndia) {
    slot.innerHTML = renderRazorpayPaymentSection(price);
    return;
  }

  slot.innerHTML = renderStripePaymentSection(price);
  chMountStripeCard().catch(function (err) {
    showToast(err.message || "Stripe could not be loaded.", "error");
  });
}

function renderStripePaymentSection(price) {
  return `
    <div id="cardSection">
      <div class="form-group">
        <label class="form-label">Name on Card</label>
        <input type="text" class="form-input" id="p_name" placeholder="Full name">
      </div>
      <div class="form-group">
        <label class="form-label">Card Details</label>
        <div id="stripeCardElement" class="form-input" style="padding:15px 14px;min-height:50px"></div>
        <div id="stripeCardError" style="color:#e06565;font-size:12px;margin-top:8px"></div>
      </div>
      <button class="btn-pay" id="payBtn" onclick="processCard($${Number(price || 0).toFixed(2)})">
        Pay $${Number(price || 0).toFixed(2)} - Unlock Now
      </button>
    </div>
  `;
}

function renderRazorpayPaymentSection(price) {
  const amountLabel = chFormatPaymentAmount(price, "IN");
  return `
    <div id="razorpaySection" style="display:block;text-align:center;padding:24px 0">
      <p style="font-family:var(--font-s);font-size:16px;color:var(--muted);margin-bottom:20px">Pay securely with UPI, cards, netbanking, or wallets through Razorpay.</p>
      <button class="btn-pay" id="razorpayBtn" style="background:#0f6fff;color:white" onclick="processRazorpay($${Number(price || 0).toFixed(2)})">Pay ${amountLabel} with Razorpay</button>
    </div>
  `;
}

function chPrepareStripePaymentFields() {
  const cardInput = document.getElementById("p_num");
  const expiryInput = document.getElementById("p_exp");
  const cvvInput = document.getElementById("p_cvv");
  const cardGroup = cardInput?.closest(".form-group");
  const formRow =
    expiryInput?.closest(".form-row") || cvvInput?.closest(".form-row");

  if (cardGroup) {
    cardGroup.innerHTML = `
      <label class="form-label">Card Details</label>
      <div id="stripeCardElement" class="form-input" style="padding:15px 14px;min-height:50px"></div>
      <div id="stripeCardError" style="color:#e06565;font-size:12px;margin-top:8px"></div>
    `;
  }
  if (formRow) formRow.remove();
}

function chLoadSocketClient() {
  if (window.io) return Promise.resolve();
  if (CH_SOCKET_SCRIPT_PROMISE) return CH_SOCKET_SCRIPT_PROMISE;
  CH_SOCKET_SCRIPT_PROMISE = new Promise(function (resolve, reject) {
    const script = document.createElement("script");
    script.src = chApiOrigin() + "/socket.io/socket.io.js";
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return CH_SOCKET_SCRIPT_PROMISE;
}

async function chConnectSocket() {
  const token = sessionStorage.getItem("ch_token");
  if (!CH_USER || !token || CH_SOCKET?.connected) return;
  try {
    await chLoadSocketClient();
    CH_SOCKET = window.io(chApiOrigin(), {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    CH_SOCKET.on("notification:new", function (payload) {
      const notification = payload?.notification;
      if (!notification) return;
      showToast(
        notification.title || notification.message || "New notification",
        "info",
      );
      window.dispatchEvent(
        new CustomEvent("ch:notification", { detail: notification }),
      );
    });
  } catch (err) {
    console.warn("Realtime notifications unavailable:", err.message || err);
  }
}

function chDisconnectSocket() {
  if (CH_SOCKET) {
    CH_SOCKET.disconnect();
    CH_SOCKET = null;
  }
}

if (sessionStorage.getItem("ch_token")) {
  chHydrateUserFromLocalCache();
  updateNavAuth();
  updateNavAuthBtn();
  chRestoreSessionFromToken().then(function (user) {
    if (!user) return;
    chSyncLibraryFromBackend({ force: true });
    updateNavAuth();
    updateNavAuthBtn();
    chConnectSocket();
  });
}

document.addEventListener("DOMContentLoaded", function () {
  hideLegacyLicenserEntrypoints();
  chHydrateUserFromLocalCache();
  updateNavAuth();
  updateNavAuthBtn();
  chRestoreSessionFromToken().then(function (user) {
    if (!user) {
      updateNavAuth();
      updateNavAuthBtn();
      return;
    }
    chSyncLibraryFromBackend({ force: true });
    updateNavAuth();
    updateNavAuthBtn();
  });
  setTimeout(updateNavAuthBtn, 0);
  setTimeout(updateNavAuthBtn, 250);
});

function renderPayBody(label, price) {
  if (price === 0) {
    return `
      <div class="order-box">
        <div class="order-row"><span class="ol">${label}</span><span class="or" style="color:var(--rose)">FREE</span></div>
        <div class="order-row"><span class="ol">Digital license</span><span class="or" style="color:var(--muted)">Online read-only</span></div>
      </div>
      <button class="btn-pay" onclick="completePurchase()">✓ Unlock Free Chapter</button>
    `;
  }

  return `
    <div class="order-box">
      <div class="order-row"><span class="ol">${label}</span><span class="or" id="paymentOrderAmount">$${price.toFixed(2)}</span></div>
      <div class="order-row"><span class="ol">Digital reading license</span><span class="or" style="color:var(--muted)">Online access · no download</span></div>
      <div class="order-total"><span>Total</span><span id="paymentOrderTotal">$${price.toFixed(2)}</span></div>
    </div>

    <div class="form-group">
      <label class="form-label">Country</label>
      <select class="form-input" id="paymentCountry">
        <option value="IN">India</option>
        <option value="US">United States</option>
        <option value="GB">United Kingdom</option>
        <option value="CA">Canada</option>
        <option value="AU">Australia</option>
        <option value="OTHER">Other country</option>
      </select>
    </div>

    <div id="paymentMethodSlot"></div>

    <div class="secure-line">🔒 256-bit SSL · Secured Payment</div>
  `;
}

function switchPayTab(el, type) {
  document
    .querySelectorAll(".ptab")
    .forEach((t) => t.classList.remove("active"));
  el.classList.add("active");
  const card = document.getElementById("cardSection");
  const razorpay = document.getElementById("razorpaySection");
  if (card) card.style.display = type === "card" ? "" : "none";
  if (razorpay) razorpay.style.display = type === "razorpay" ? "" : "none";
}

function fmtCard(el) {
  let v = el.value.replace(/\D/g, "").substring(0, 16);
  el.value = v.replace(/(.{4})/g, "$1 ").trim();
}

function fmtExp(el) {
  let v = el.value.replace(/\D/g, "").substring(0, 4);
  if (v.length > 2) v = v.substring(0, 2) + " / " + v.substring(2);
  el.value = v;
}

async function processRazorpay(display_price) {
  if (!CH_PENDING) return;
  const btn = document.getElementById("razorpayBtn");
  const razorpayButtonLabel = `Pay ${chFormatPaymentAmount(display_price, "IN")} with Razorpay`;
  if (btn) {
    btn.innerHTML = '<span class="spinner"></span> Opening Razorpay...';
    btn.disabled = true;
  }

  try {
    const config = await chGetPaymentConfig();
    if (!config?.razorpay?.enabled || !config?.razorpay?.keyId) {
      throw new Error("Razorpay is not configured yet.");
    }

    const { titleId, chId, chLabel } = CH_PENDING;
    const orderBody = { currency: "INR" };
    if (chId && chId !== "bundle") orderBody.chapterId = chId;

    const orderRes = await fetch(
      `${CH_API_URL}/library/${encodeURIComponent(titleId)}/razorpay-order`,
      {
        method: "POST",
        headers: chAuthHeaders(),
        body: JSON.stringify(orderBody),
      },
    );
    const orderData = await orderRes.json();
    if (!orderRes.ok || orderData.status !== "success") {
      throw new Error(orderData.message || "Could not start Razorpay payment.");
    }

    await chLoadRazorpayJs();
    const order = orderData.data;
    console.debug("Opening Razorpay digital checkout", {
      keyMode: String(order.keyId || config.razorpay.keyId || "").startsWith(
        "rzp_test_",
      )
        ? "test"
        : String(order.keyId || config.razorpay.keyId || "").startsWith(
              "rzp_live_",
            )
          ? "live"
          : "unknown",
      keyPrefix:
        String(order.keyId || config.razorpay.keyId || "").slice(0, 8) + "...",
      razorpayOrderId: order.razorpayOrderId,
      amount: order.amount,
      currency: order.currency || "INR",
    });
    const checkout = new window.Razorpay({
      key: order.keyId || config.razorpay.keyId,
      amount: order.amount,
      currency: order.currency || "INR",
      name: "Crossed Hearts",
      description: chLabel || "Digital reading purchase",
      order_id: order.razorpayOrderId,
      prefill: {
        name: CH_USER?.name || "",
        email: CH_USER?.email || "",
      },
      notes: {
        titleId,
        chapterId: chId && chId !== "bundle" ? chId : "",
      },
      modal: {
        ondismiss: function () {
          if (btn) {
            btn.innerHTML = razorpayButtonLabel;
            btn.disabled = false;
          }
        },
      },
      handler: async function (response) {
        try {
          const confirmRes = await fetch(
            `${CH_API_URL}/library/${encodeURIComponent(titleId)}/confirm-razorpay`,
            {
              method: "POST",
              headers: chAuthHeaders(),
              body: JSON.stringify(response),
            },
          );
          const confirmData = await confirmRes.json();
          if (!confirmRes.ok || confirmData.status !== "success") {
            throw new Error(
              confirmData.message ||
                "Payment succeeded but order confirmation failed.",
            );
          }

          await chSyncLibraryFromBackend({ force: true });
          closePayModal();
          showSuccessModal({
            ...CH_PENDING,
            purchase: confirmData.data?.purchase,
          });
          chIncrementPurchaseCount(titleId);
          CH_PENDING = null;
        } catch (err) {
          showToast(err.message || "Razorpay confirmation failed.", "error");
          if (btn) {
            btn.innerHTML = razorpayButtonLabel;
            btn.disabled = false;
          }
        }
      },
    });
    checkout.open();
  } catch (err) {
    showToast(err.message || "Razorpay payment failed.", "error");
    if (btn) {
      btn.innerHTML = razorpayButtonLabel;
      btn.disabled = false;
    }
  }
}

async function processCard(display_price) {
  if (CH_PENDING && CH_STRIPE_CARD) {
    const name = document.getElementById("p_name")?.value?.trim();
    const errorBox = document.getElementById("stripeCardError");
    const btn = document.getElementById("payBtn");

    if (!name) {
      showToast("Please enter the cardholder name.", "error");
      return;
    }

    if (btn) {
      btn.innerHTML = '<span class="spinner"></span> Processing...';
      btn.disabled = true;
    }
    if (errorBox) errorBox.textContent = "";

    try {
      const { titleId, chId } = CH_PENDING;
      const intentBody = { currency: "USD" };
      if (chId && chId !== "bundle") intentBody.chapterId = chId;

      const intentRes = await fetch(
        `${CH_API_URL}/library/${encodeURIComponent(titleId)}/payment-intent`,
        {
          method: "POST",
          headers: chAuthHeaders(),
          body: JSON.stringify(intentBody),
        },
      );
      const intentData = await intentRes.json();
      if (!intentRes.ok || intentData.status !== "success") {
        throw new Error(intentData.message || "Could not start payment.");
      }

      const stripe = await chGetStripe();
      const result = await stripe.confirmCardPayment(
        intentData.data.clientSecret,
        {
          payment_method: {
            card: CH_STRIPE_CARD,
            billing_details: {
              name,
              email: CH_USER?.email,
            },
          },
        },
      );

      if (result.error) {
        throw new Error(result.error.message || "Payment failed.");
      }
      if (result.paymentIntent?.status !== "succeeded") {
        throw new Error("Payment is not complete yet.");
      }

      const confirmRes = await fetch(
        `${CH_API_URL}/library/${encodeURIComponent(titleId)}/confirm-payment`,
        {
          method: "POST",
          headers: chAuthHeaders(),
          body: JSON.stringify({ paymentIntentId: result.paymentIntent.id }),
        },
      );
      const confirmData = await confirmRes.json();
      if (!confirmRes.ok || confirmData.status !== "success") {
        throw new Error(
          confirmData.message ||
            "Payment succeeded but order confirmation failed.",
        );
      }

      await chSyncLibraryFromBackend({ force: true });
      closePayModal();
      showSuccessModal({ ...CH_PENDING, purchase: confirmData.data?.purchase });
      chIncrementPurchaseCount(titleId);
      CH_PENDING = null;
    } catch (err) {
      if (errorBox) errorBox.textContent = err.message || "Payment failed.";
      showToast(err.message || "Payment failed.", "error");
      if (btn) {
        btn.innerHTML = `Pay $${Number(display_price || 0).toFixed(2)} - Unlock Now`;
        btn.disabled = false;
      }
    }
    return;
  }

  const name = document.getElementById("p_name")?.value?.trim();
  const num = document.getElementById("p_num")?.value;
  const exp = document.getElementById("p_exp")?.value;
  const cvv = document.getElementById("p_cvv")?.value;

  if (!name || !num || num.replace(/\s/g, "").length < 16 || !exp || !cvv) {
    showToast("Please fill in all card details.", "error");
    return;
  }

  const btn = document.getElementById("payBtn");
  if (btn) {
    btn.innerHTML = '<span class="spinner"></span>  Processing…';
    btn.disabled = true;
  }

  setTimeout(() => completePurchase(), 1800);
}

function completePurchase() {
  if (!CH_PENDING) return;
  const { titleId, chId } = CH_PENDING;

  if (!CH_LIB[titleId]) CH_LIB[titleId] = [];
  if (!CH_LIB[titleId].includes(chId)) CH_LIB[titleId].push(chId);
  sessionStorage.setItem("ch_lib", JSON.stringify(CH_LIB));

  closePayModal();
  showSuccessModal(CH_PENDING);

  chIncrementPurchaseCount(titleId);

  console.log(
    "EMAIL TRIGGER: Purchase confirm →",
    CH_USER?.email,
    "| Title:",
    titleId,
    "| Chapter:",
    chId,
  );

  CH_PENDING = null;
}

function showSuccessModal(p) {
  const overlay = document.getElementById("payOverlay");
  const body = document.getElementById("payBody");
  if (!body) return;

  const titleEl = document.getElementById("payModalTitle");
  const subEl = document.getElementById("payModalSub");
  if (titleEl) titleEl.textContent = "Purchase Complete!";
  if (subEl) subEl.textContent = "";

  body.innerHTML = `
    <div class="success-wrap">
      <div class="success-icon">✓</div>
      <h3>You're all set!</h3>
      <p><strong>${p.chLabel}</strong> has been added to your library.<br>
      A confirmation has been sent to ${CH_USER?.email || "your email"}.</p>
      <button class="btn-pay" onclick="closePayModal();window.location.href='my-library.html'">
        Go to My Library
      </button>
    </div>
  `;

  if (overlay) overlay.classList.add("open");
}

function closePayModal() {
  const ov = document.getElementById("payOverlay");
  if (ov) ov.classList.remove("open");
  if (CH_STRIPE_CARD) {
    CH_STRIPE_CARD.destroy();
    CH_STRIPE_CARD = null;
    CH_STRIPE_ELEMENTS = null;
  }
}

// ================================================
// NEWSLETTER
// ================================================
function handleNewsletter(e) {
  e.preventDefault();
  const inp = e.target.querySelector('input[type="email"]');
  if (!inp || !inp.value) return;
  console.log("EMAIL TRIGGER: Newsletter signup →", inp.value);
  showToast(`✓ ${inp.value} added to the Collector's Circle!`, "success");
  inp.value = "";
}

// ================================================
// TOAST
// ================================================
function showToast(msg, type = "") {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.className = `toast ${type} show`;
  clearTimeout(t._tid);
  t._tid = setTimeout(() => t.classList.remove("show"), 3400);
}

// ================================================
// LIBRARY HELPERS
// ================================================
function isOwned(titleId, chId) {
  return (CH_LIB[titleId] || []).includes(chId);
}

function hasAnyOwned(titleId) {
  return (CH_LIB[titleId] || []).length > 0;
}

// ================================================
// SPOTLIGHT SLIDER
// ================================================
let spotlightIndex = 0;
let spotlightTimer = null;
const SPOTLIGHT_INTERVAL = 3000;

function initSpotlightSlider() {
  const slides = document.querySelectorAll(".spotlight-slide");
  const total = slides.length;
  if (!total) return;

  const totalEl = document.getElementById("spotlightTotal");
  if (totalEl) totalEl.textContent = total;

  spotlightGoTo(0);
  spotlightTimer = setInterval(() => spotlightMove(1), SPOTLIGHT_INTERVAL);

  const slider = document.getElementById("spotlightSlider");
  if (slider) {
    slider.addEventListener("mouseenter", () => clearInterval(spotlightTimer));
    slider.addEventListener("mouseleave", () => {
      clearInterval(spotlightTimer);
      spotlightTimer = setInterval(() => spotlightMove(1), SPOTLIGHT_INTERVAL);
    });
  }
}

function spotlightMove(dir) {
  const slides = document.querySelectorAll(".spotlight-slide");
  spotlightGoTo((spotlightIndex + dir + slides.length) % slides.length);
}

function spotlightGoTo(idx) {
  const slides = document.querySelectorAll(".spotlight-slide");
  const dots = document.querySelectorAll(".sdot");
  if (!slides.length) return;

  slides.forEach((s, i) => s.classList.toggle("active", i === idx));
  dots.forEach((d, i) => d.classList.toggle("active", i === idx));
  spotlightIndex = idx;

  const cur = document.getElementById("spotlightCurrent");
  if (cur) cur.textContent = idx + 1;
}

// ================================================
// PAGE-LEVEL GENRE FILTER (filter-btn / filter-chip buttons)
// ================================================

function CH_filterCards(genre, btnEl, cardSelector, categoryMode) {
  var allBtns = document.querySelectorAll(".filter-btn, .filter-chip");
  allBtns.forEach(function (b) {
    b.classList.remove("active");
  });
  if (btnEl) btnEl.classList.add("active");

  var cards = document.querySelectorAll(cardSelector || ".title-card");
  var visible = 0;

  cards.forEach(function (card) {
    var match = false;
    if (genre === "all") {
      match = true;
    } else if (categoryMode) {
      var cat = (card.getAttribute("data-category") || "").toLowerCase();
      match = cat === genre.toLowerCase();
    } else {
      var genres = (card.getAttribute("data-genres") || "").toLowerCase();
      match = genres.indexOf(genre.toLowerCase()) !== -1;
    }
    if (match) {
      card.style.display = "";
      visible++;
    } else {
      card.style.display = "none";
    }
  });

  var countEl = document.getElementById("gfNum");
  if (countEl) countEl.textContent = visible;

  return visible;
}

function filterCatalog(query) {
  const q = query.trim().toLowerCase();

  if (!q) return [];

  return (window.CH_CATALOG || []).filter((item) =>
    [item.title, item.genre, item.keywords, item.synopsis]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
}

async function handleNavAuth() {
  const hadUserBeforeRestore = Boolean(CH_USER);
  if (!CH_USER && sessionStorage.getItem("ch_token")) {
    const cachedUser = chHydrateUserFromLocalCache();
    if (cachedUser) {
      chSyncLibraryFromBackend({ force: true });
      updateNavAuth();
      updateNavAuthBtn();
      return;
    }
    await chRestoreSessionFromToken();
    if (CH_USER) {
      chSyncLibraryFromBackend({ force: true });
      updateNavAuth();
      updateNavAuthBtn();
      return;
    }
  }

  if (hadUserBeforeRestore && CH_USER) signOut();
  else openAuth("in", { lockMode: true });
}

function hideLegacyLicenserEntrypoints() {
  document
    .querySelectorAll(
      '.btn-nav-licenser, [onclick*="openLicenserAuth"], a[href="licenser-portal.html"], a[href="licenser-login.html"]',
    )
    .forEach((el) => {
      if (
        el.id === "licensorPortalLink" ||
        el.id === "mobileLicensorPortalLink"
      )
        return;
      const text = (el.textContent || "").trim().toLowerCase();
      if (
        text.includes("verified user login") ||
        text.includes("licenser portal") ||
        text.includes("licensor portal") ||
        /openLicenserAuth/i.test(el.getAttribute("onclick") || "")
      ) {
        el.style.display = "none";
      }
    });
}

function updateAdminDashboardLink() {
  const isAdmin = CH_USER?.role === "admin";
  const isLicensor = CH_USER?.role === "licensor";
  let desktopLink = document.getElementById("adminDashboardLink");
  const authButton = document.getElementById("navAuthBtn");

  if (!desktopLink && isAdmin) {
    if (authButton?.parentElement) {
      desktopLink = document.createElement("a");
      desktopLink.id = "adminDashboardLink";
      desktopLink.href = "dashboard.html";
      desktopLink.className = "btn-nav-ghost";
      desktopLink.textContent = "Admin Dashboard";
      authButton.parentElement.insertBefore(desktopLink, authButton);
    }
  }

  if (desktopLink) desktopLink.style.display = isAdmin ? "" : "none";

  let mobileLink = document.getElementById("mobileAdminDashboardLink");
  const mobileNav = document.getElementById("mobileNav");
  if (!mobileLink && isAdmin && mobileNav) {
    mobileLink = document.createElement("a");
    mobileLink.id = "mobileAdminDashboardLink";
    mobileLink.href = "dashboard.html";
    mobileLink.textContent = "Admin Dashboard";
    mobileNav.appendChild(mobileLink);
  }
  if (mobileLink) mobileLink.style.display = isAdmin ? "" : "none";

  let licensorLink = document.getElementById("licensorPortalLink");
  if (!licensorLink && isLicensor && authButton?.parentElement) {
    licensorLink = document.createElement("a");
    licensorLink.id = "licensorPortalLink";
    licensorLink.href = "licenser-portal.html";
    licensorLink.className = "btn-nav-ghost";
    licensorLink.textContent = "Licensor Portal";
    authButton.parentElement.insertBefore(licensorLink, authButton);
  }
  if (licensorLink) licensorLink.style.display = isLicensor ? "" : "none";

  let mobileLicensorLink = document.getElementById("mobileLicensorPortalLink");
  if (!mobileLicensorLink && isLicensor && mobileNav) {
    mobileLicensorLink = document.createElement("a");
    mobileLicensorLink.id = "mobileLicensorPortalLink";
    mobileLicensorLink.href = "licenser-portal.html";
    mobileLicensorLink.textContent = "Licensor Portal";
    mobileNav.appendChild(mobileLicensorLink);
  }
  if (mobileLicensorLink)
    mobileLicensorLink.style.display = isLicensor ? "" : "none";
}

function chPhysicalCartCount() {
  try {
    const parsed = JSON.parse(localStorage.getItem("ch_physical_cart") || "[]");
    const cart = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === "object"
        ? Object.values(parsed)
        : [];
    return cart.reduce(
      (sum, item) => sum + Math.max(1, Number(item.quantity || 1)),
      0,
    );
  } catch (err) {
    return 0;
  }
}

function updateNavCartButton() {
  const currentPage = chCurrentPageFileName();
  const cartDisabledPages = new Set(["campaigns.html", "kickstarter.html"]);
  const existingCartLink = document.getElementById("navPhysicalCartLink");
  if (cartDisabledPages.has(currentPage)) {
    if (existingCartLink) existingCartLink.remove();
    return;
  }

  const authButton = document.getElementById("navAuthBtn");
  const registerButton = document.getElementById("navRegisterBtn");
  const actions =
    authButton?.parentElement ||
    registerButton?.parentElement ||
    document.querySelector(".nav-actions");
  if (!actions) return;

  let cartLink = document.getElementById("navPhysicalCartLink");
  if (!cartLink) {
    cartLink = actions.querySelector(".btn-nav-cart");
    if (cartLink) cartLink.id = "navPhysicalCartLink";
  }

  if (!cartLink) {
    cartLink = document.createElement("a");
    cartLink.id = "navPhysicalCartLink";
    cartLink.href = "cart.html";
    cartLink.className = "btn-nav-cart";
    cartLink.setAttribute("aria-label", "Cart");
    cartLink.setAttribute("title", "Cart");
    cartLink.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="8" cy="21" r="1"></circle>
        <circle cx="19" cy="21" r="1"></circle>
        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h8.9a2 2 0 0 0 1.96-1.6l1.32-6.95H5.12"></path>
      </svg>
      <span class="nav-cart-count" id="navPhysicalCartCount">0</span>
    `;
    if (registerButton?.parentElement === actions)
      registerButton.after(cartLink);
    else if (authButton) actions.insertBefore(cartLink, authButton);
    else actions.appendChild(cartLink);
  } else if (
    registerButton?.parentElement === actions &&
    registerButton.nextElementSibling !== cartLink
  ) {
    registerButton.after(cartLink);
  }

  let countEl = cartLink.querySelector(".nav-cart-count");
  if (!countEl) {
    countEl = document.createElement("span");
    countEl.className = "nav-cart-count";
    countEl.id = "navPhysicalCartCount";
    cartLink.appendChild(countEl);
  }

  const count = chCartCount();
  countEl.textContent = String(count);
  countEl.style.display = count > 0 ? "inline-flex" : "none";
}
const mobileCartCount = document.getElementById("mobileCartCount");
if (mobileCartCount) {
  mobileCartCount.textContent = count > 0 ? `(${count})` : "";
}

function chGetPhysicalCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem("ch_physical_cart") || "[]");
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
    if (parsed && typeof parsed === "object")
      return Object.values(parsed).filter(Boolean);
    return [];
  } catch (err) {
    return [];
  }
}

function chSaveSharedPhysicalCart(cart) {
  localStorage.setItem("ch_physical_cart", JSON.stringify(cart));
  updateNavCartButton();
}

function chNormalizeLegalLinks() {
  document.querySelectorAll("a").forEach((link) => {
    const label = (link.textContent || "").trim().toLowerCase();
    const href = (link.getAttribute("href") || "").trim();
    if (label.includes("privacy policy")) link.href = "privacy.html";
    if (label.includes("terms of service") || label === "terms")
      link.href = "terms.html";
    if (
      label.includes("refund policy") ||
      label.includes("payment issue policy") ||
      (label === "refund" && (href === "#" || href === ""))
    ) {
      link.href = "refund-policy.html";
    }
  });
}

function chNormalizeSiteNav() {
  chNormalizeLegalLinks();

  const navLinks = document.querySelector(".nav-links");
  if (navLinks) {
    const current = chCurrentPageFileName();
    const links = [
      { href: "index.html", label: "Home", match: ["index.html", ""] },
      { href: "series.html", label: "Our Series", match: ["series.html"] },
      {
        href: "campaigns.html",
        label: "Campaigns",
        match: ["campaigns.html", "kickstarter.html"],
      },
      { href: "blog.html", label: "Blog", match: ["blog.html", ""] },
    ];
    navLinks.innerHTML = links
      .map((link) => {
        const active = link.match.includes(current) ? ' class="active"' : "";
        let style = "";
        if (link.href === "campaigns.html")
          style = ' style="color:var(--ch-rose-deep);"';
        if (link.href === "subscription.html")
          style = ' style="color:var(--gold);font-weight:600;"';
        return `<li><a href="${chCleanInternalHref(link.href)}"${active}${style}>${link.label}</a></li>`;
      })
      .join("");
  }

  document
    .querySelectorAll(
      'a[href="licenser-portal.html"], a[href="licenser-login.html"], .btn-nav-licenser',
    )
    .forEach((el) => {
      const inNav = el.closest(".nav, .mobile-nav, .nav-actions, .nav-links");
      if (inNav) el.remove();
    });

  const actions = document.querySelector(".nav-actions");
  if (actions) {
    let authButton =
      document.getElementById("navAuthBtn") ||
      actions.querySelector(
        "[data-user-auth], .btn-nav-signin:not(.btn-nav-licenser)",
      );
    if (!authButton) {
      authButton = document.createElement("button");
      authButton.className = "btn-nav-signin";
    }
    authButton.id = "navAuthBtn";
    authButton.type = "button";
    authButton.classList.add("btn-nav-signin");
    authButton.setAttribute("data-login-label", "Sign In");
    authButton.onclick = handleNavAuth;

    let registerButton =
      document.getElementById("navRegisterBtn") ||
      actions.querySelector(".btn-nav-register");
    if (!registerButton) {
      registerButton = document.createElement("button");
      registerButton.className = "btn-nav-register";
    }
    registerButton.id = "navRegisterBtn";
    registerButton.type = "button";
    registerButton.textContent = "Sign Up";
    registerButton.setAttribute("data-register-auth", "true");
    registerButton.onclick = () => openAuth("up", { lockMode: true });

    const themeButton =
      document.getElementById("themeToggle") ||
      actions.querySelector(".theme-toggle");
    const burgerButton = actions.querySelector(".nav-burger");

    [authButton, registerButton].forEach((el) => {
      if (!actions.contains(el)) actions.appendChild(el);
    });
    if (themeButton && actions.contains(themeButton))
      actions.appendChild(themeButton);
    if (burgerButton && actions.contains(burgerButton))
      actions.appendChild(burgerButton);
    chDedupeNavActionLinks();
  }

  const mobileNav = document.getElementById("mobileNav");
  if (mobileNav) {
    const first = mobileNav.firstElementChild;
    const top =
      mobileNav.querySelector(".mobile-nav-top") ||
      (first && first.querySelector?.("button") ? first : null);
    const topHtml = top ? top.outerHTML : "";
    mobileNav.innerHTML = `${topHtml}
  <div class="mobile-nav-search" onclick="toggleMobileNav(); setTimeout(openNavSearch, 250);">  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
    <span>Search titles, genres, keywords...</span>
  </div>
  <a href="index.html">Home</a>
  <a href="series.html">Our Series</a>
  <a href="subscription.html" class="mobile-nav-subscribe">Subscribe</a>
  <a href="campaigns.html" style="color:var(--ch-rose-deep);font-weight:700;">Campaigns</a>
  <a href="cart.html" id="mobileCartLink" style="display:flex;align-items:center;gap:6px;">Cart <span id="mobileCartCount" style="color:var(--gold);font-weight:700;"></span></a>
  <a href="account.html">My Account</a>
  <a href="#" onclick="handleNavAuth(); toggleMobileNav(); return false;" style="color:var(--gold);" id="mobileAuthLink" data-login-label="Sign In">Sign In</a>
  <a href="#" onclick="openAuth('up', { lockMode: true }); toggleMobileNav(); return false;" style="color:var(--gold);" id="mobileRegisterLink" data-register-auth="true">Sign Up</a>`;
  }
}

function chPhysicalItemFromShopLink(link) {
  const href = String(link?.href || "").toLowerCase();
  if (!href.includes("thecrossedhearts.com/shop-all-1/ols/products/"))
    return null;

  const productSlug =
    href.split("/products/")[1]?.replace(/[^a-z0-9-]/g, "") || "physical-book";
  const availableShopSlugs = new Set(
    [
      "baroness-goes-on-strike-vol-1",
      "baroness-goes-on-strike-vol-2",
      "from-a-knight-to-a-lady-vol-1",
      "the-archdukes-adopted-saint-vol-1",
      "youre-way-too-cheeky-chigaya-kun-vol-1",
      "chigaya-vol-1",
    ].map((slug) => slug.replace(/[^a-z0-9-]/g, "")),
  );
  const isPreorder = !availableShopSlugs.has(productSlug);
  const pageTitle = document
    .querySelector(".title-detail h1, h1, .page-hero h1")
    ?.textContent?.trim();
  const linkText = link.textContent || "";
  const priceMatch = linkText.match(/\$([0-9]+(?:\.[0-9]{1,2})?)/);
  const unitPrice = priceMatch ? Number(priceMatch[1]) : 20;
  const isLimited = /limited|ltd/i.test(linkText + " " + productSlug);
  const volumeMatch = productSlug.match(/vol(?:ume)?-?(\d)/i);
  const volumeLabel = volumeMatch ? " Vol. " + volumeMatch[1] : "";
  const coverImageUrl =
    document.getElementById("mainCoverImg")?.getAttribute("src") ||
    document
      .querySelector(".detail-cover img, .print-cover img, .card-cover img")
      ?.getAttribute("src") ||
    "";

  return {
    sku: productSlug,
    title: pageTitle || "Physical Book",
    edition:
      (isLimited ? "Limited" : "Regular") + " Print Edition" + volumeLabel,
    unitPrice,
    currency: "USD",
    coverImageUrl,
    isPreorder,
    quantity: 1,
  };
}

function chAddPhysicalItemToCart(item) {
  if (!item?.sku) return;
  const cart = chGetPhysicalCart();
  const existing = cart.find((cartItem) => cartItem.sku === item.sku);
  if (existing) existing.quantity = Number(existing.quantity || 1) + 1;
  else cart.push(item);
  chSaveSharedPhysicalCart(cart);
}

document.addEventListener("click", (event) => {
  const link = event.target.closest?.(
    "a[href*='thecrossedhearts.com/shop-all-1/ols/products/']",
  );
  if (!link) return;

  const item = chPhysicalItemFromShopLink(link);
  if (!item) return;

  event.preventDefault();
  chAddPrintToCart(item);
  showToast("Added to cart!", "success");
  window.location.href = "cart.html";
});

function chEnsureNavbarRegisterButtons() {
  const authButton =
    document.getElementById("navAuthBtn") ||
    document.querySelector('.nav-actions .btn-nav-signin[onclick*="openAuth"]');

  if (
    authButton &&
    !/openLicenserAuth/i.test(authButton.getAttribute("onclick") || "")
  ) {
    authButton.id = authButton.id || "navAuthBtn";
    authButton.setAttribute(
      "data-login-label",
      authButton.getAttribute("data-login-label") || "Sign In",
    );

    const actions = authButton.parentElement;
    const existingRegister =
      document.getElementById("navRegisterBtn") ||
      document.getElementById("checkoutRegisterBtn") ||
      actions?.querySelector(".btn-nav-register, .checkout-register-btn");

    if (existingRegister) {
      existingRegister.setAttribute("data-register-auth", "true");
      existingRegister.onclick = () => openAuth("up", { lockMode: true });
      if (
        actions?.classList?.contains("nav-actions") &&
        existingRegister.previousElementSibling !== authButton
      ) {
        authButton.after(existingRegister);
      }
    } else if (actions?.classList?.contains("nav-actions")) {
      const registerBtn = document.createElement("button");
      registerBtn.className = "btn-nav-register";
      registerBtn.id = "navRegisterBtn";
      registerBtn.type = "button";
      registerBtn.textContent = "Sign Up";
      registerBtn.setAttribute("data-register-auth", "true");
      registerBtn.onclick = () => openAuth("up", { lockMode: true });
      authButton.after(registerBtn);
    }
  }

  const mobileAuth = document.getElementById("mobileAuthLink");
  if (mobileAuth) {
    mobileAuth.setAttribute(
      "data-login-label",
      mobileAuth.getAttribute("data-login-label") || "Sign In",
    );
    if (!document.getElementById("mobileRegisterLink")) {
      const registerLink = document.createElement("a");
      registerLink.href = "#";
      registerLink.id = "mobileRegisterLink";
      registerLink.style.color = "var(--gold)";
      registerLink.textContent = "Sign Up";
      registerLink.setAttribute("data-register-auth", "true");
      registerLink.onclick = function () {
        openAuth("up", { lockMode: true });
        if (typeof toggleMobileNav === "function") toggleMobileNav();
        return false;
      };
      mobileAuth.after(registerLink);
    }
  }
}

function chNormalizeAuthTabLabels() {
  const tabs = document.querySelectorAll(".auth-tabs .atab");
  if (tabs[0]) tabs[0].textContent = "Sign In";
  if (tabs[1]) tabs[1].textContent = "Sign Up";
}

function updateNavAuthBtn() {
  chNormalizeSiteNav();
  chNormalizeCleanUrls();
  chEnsureNavbarRegisterButtons();
  chNormalizeAuthTabLabels();

  const buttons = document.querySelectorAll(
    '#navAuthBtn, [data-user-auth], .btn-nav-signin[onclick*="openAuth"]',
  );

  buttons.forEach((btn) => {
    if (/openLicenserAuth/i.test(btn.getAttribute("onclick") || "")) return;
    const label = CH_USER
      ? "Sign Out"
      : btn.getAttribute("data-login-label") || "Sign In";
    btn.setAttribute("data-user-auth", "true");
    btn.textContent = label;
    btn.onclick = handleNavAuth;
  });

  const registerButtons = document.querySelectorAll(
    "#navRegisterBtn, #checkoutRegisterBtn, #mobileRegisterLink, [data-register-auth]",
  );
  registerButtons.forEach((btn) => {
    btn.style.display = CH_USER ? "none" : "";
  });

  const mobileAuthLink = document.getElementById("mobileAuthLink");
  if (mobileAuthLink) {
    const mobileLabel = CH_USER
      ? "Sign Out"
      : mobileAuthLink.getAttribute("data-login-label") || "Sign In";
    mobileAuthLink.textContent = mobileLabel;
    mobileAuthLink.onclick = function () {
      handleNavAuth();
      if (typeof toggleMobileNav === "function") toggleMobileNav();
      return false;
    };
  }

  updateAdminDashboardLink();
  updateNavCartButton();
  chDedupeNavActionLinks();
}

function onAuthChange() {
  if (typeof renderLib === "function") renderLib();
  updateNavAuthBtn();
}

document.addEventListener("DOMContentLoaded", () => {
  chNormalizeSiteNav();
  chNormalizeCleanUrls();
  updateNavCartButton();
  chLoadBookStats().catch(() => {});
  document.addEventListener("click", (event) => {
    const star = event.target.closest?.(".star-row.interactive .star-btn");
    if (!star) return;
    const value = Number(star.dataset.val || 0);
    if (value) chSelectStar(star, value, "rev");
  });
});

if (document.readyState !== "loading") {
  chLoadBookStats().catch(() => {});
}

window.addEventListener("storage", (event) => {
  if (event.key === "ch_physical_cart") updateNavCartButton();
});

function filterCatalog(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return (window.CH_CATALOG || []).filter((item) =>
    [item.title, item.genre, item.keywords, item.synopsis]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
}

updateNavAuthBtn();

// ================================================
// WISHLIST HEART BUTTONS — SITE-WIDE (title cards)
// ================================================
function chWishlistHeartSvg(filled) {
  return filled
    ? `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
}

function chTitleIdFromCard(card) {
  if (card.dataset.titleId) return card.dataset.titleId;
  const href = card.getAttribute("href") || "";
  const id = href
    .split("/")
    .pop()
    .replace(/\.html?$/i, "");
  return id || null;
}

function chAddWishlistHeartsToCards(root) {
  const scope = root || document;
  scope.querySelectorAll(".title-card").forEach((card) => {
    // Skip the wishlist page itself — it already has its own remove button
    if (card.querySelector(".btn-wishlist")) return;

    const cover = card.querySelector(".card-cover");
    if (!cover || cover.querySelector(".card-wish-btn")) return;

    const titleId = chTitleIdFromCard(card);
    if (!titleId) return;

    const titleName =
      card.querySelector(".card-title")?.textContent?.trim() || titleId;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "card-wish-btn";
    btn.setAttribute("aria-label", "Add to Wish List");

    const wishlisted = chIsWishlisted(titleId);
    btn.classList.toggle("wishlisted", wishlisted);
    btn.innerHTML = chWishlistHeartSvg(wishlisted);

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const nowWishlisted = chToggleWishlist(titleId, titleName);
      btn.classList.toggle("wishlisted", nowWishlisted);
      btn.innerHTML = chWishlistHeartSvg(nowWishlisted);
    });

    cover.appendChild(btn);
  });
}

window.chAddWishlistHeartsToCards = chAddWishlistHeartsToCards;

document.addEventListener("DOMContentLoaded", () => {
  chAddWishlistHeartsToCards();
});

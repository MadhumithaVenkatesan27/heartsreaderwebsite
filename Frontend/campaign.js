/* ══════════════════════════════════════════════════════════════════
   SPECIAL EDITION — PAGE LOGIC ONLY
   Titles/prices/perks now live in campaign.html as data-* attributes
   on each .edition-card — this file no longer generates cards, it
   only reads them and handles modal, pricing, and live-stats logic.
   ══════════════════════════════════════════════════════════════════ */

function resolveCampaignApiUrl() {
  const override =
    window.CH_API_URL ||
    (["localhost", "127.0.0.1", ""].includes(location.hostname) ||
    location.protocol === "file:"
      ? localStorage.getItem("ch_api_url")
      : "") ||
    document.querySelector('meta[name="ch-api-url"]')?.getAttribute("content");
  if (override) return String(override).replace(/\/$/, "");

  const isLocal =
    ["localhost", "127.0.0.1", ""].includes(window.location.hostname) ||
    window.location.protocol === "file:";
  if (
    window.location.hostname === "thecrossedhearts.com" ||
    window.location.hostname === "www.thecrossedhearts.com"
  ) {
    return "https://crossed-hearts-final.onrender.com/api";
  }
  if (window.location.hostname === "crossed-hearts.onrender.com") {
    return "https://crossed-hearts-final.onrender.com/api";
  }
  return isLocal
    ? "http://localhost:5000/api"
    : "https://crossed-hearts-final.onrender.com/api";
}
const CAMPAIGN_API_URL = resolveCampaignApiUrl();

let CAMPAIGN_STRIPE = null;
let CAMPAIGN_STRIPE_ELEMENTS = null;
let CAMPAIGN_STRIPE_CARD = null;
let selectedEditionCard = null;

(function () {
  try {
    const saved = localStorage.getItem("ch-theme");
    if (saved) {
      document.documentElement.setAttribute("data-theme", saved);
      return;
    }
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  } catch (e) {}
})();

/* ── read a card's data-* attrs into a plain object ── */
function readEditionData(card) {
  const d = card.dataset;
  return {
    slug: d.slug,
    series: d.series,
    volume: d.volume,
    perk: d.perk,
    price: d.price === "" ? null : Number(d.price),
    retailPrice: d.retailPrice === "" ? null : Number(d.retailPrice),
    status: d.status || "active",
    external: d.external === "true",
    goal: Number(d.goal || 500),
    reserved: Number(d.reserved || 0),
  };
}

/* ── PRICING RULE ──
   Same price as standard edition while active. Once an edition moves
   to "funded"/"retail", only NEW buyers pay retailPrice — existing
   backers keep what they paid, but that lock-in must be enforced
   SERVER-SIDE by snapshotting price-paid onto the order; this
   function only tells you what a NEW purchase costs right now. */
function computeEditionPrice(data) {
  if (data.external) {
    // Same-price rule doesn't apply — partner-set pricing takes over.
    return data.retailPrice ?? data.price;
  }
  if (data.status === "active") return data.price;
  return data.retailPrice ?? data.price;
}

function formatPrice(value) {
  if (value === null || value === undefined || Number.isNaN(value))
    return "TBD";
  return "$" + Number(value).toFixed(2);
}

function editionStatusLabel(status) {
  if (status === "retail") return "Now at Retail";
  if (status === "funded") return "Fully Reserved";
  return "Reserving Now";
}

/* ── render one card's dynamic bits from its current data-* attrs ── */
function renderCard(card) {
  const data = readEditionData(card);
  const pct = Math.min(
    100,
    Math.round((data.reserved / (data.goal || 1)) * 100),
  );

  const fill = card.querySelector("[data-fill]");
  const reservedEl = card.querySelector("[data-reserved]");
  const goalLabel = card.querySelector("[data-goal-label]");
  const pctEl = card.querySelector("[data-pct]");
  const priceLabel = card.querySelector("[data-price-label]");
  const pill = card.querySelector("[data-status-pill]");
  const btn = card.querySelector("[data-reserve-btn]");

  if (fill) fill.style.width = pct + "%";
  if (reservedEl) reservedEl.textContent = data.reserved;
  if (goalLabel) goalLabel.textContent = data.goal;
  if (pctEl) pctEl.textContent = pct + "%";
  if (priceLabel)
    priceLabel.textContent = formatPrice(computeEditionPrice(data));
  if (pill) {
    pill.textContent = editionStatusLabel(data.status);
    pill.className = "edition-status-pill " + data.status;
  }
  if (btn)
    btn.textContent =
      data.status === "retail" ? "Order at Retail" : "Reserve This Edition";
}

function initEditionCards() {
  document.querySelectorAll(".edition-card").forEach(renderCard);
}

/* ── ON LOAD ── */
window.addEventListener("DOMContentLoaded", () => {
  initEditionCards();
  loadAllEditionStats();

  const container = document.getElementById("petalContainer");
  if (container) {
    for (let i = 0; i < 14; i++) {
      const p = document.createElement("span");
      const size = 8 + Math.random() * 16;
      p.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}%;animation-duration:${12 + Math.random() * 20}s;animation-delay:${Math.random() * 15}s;`;
      container.appendChild(p);
    }
  }

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add("visible"), i * 80);
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  document.querySelectorAll(".fade-up").forEach((el) => obs.observe(el));

  const modal = document.getElementById("pledgeModal");
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === this) closeModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
      closeMobileNav();
    }
  });

  document.querySelectorAll(".mobile-nav a").forEach((link) => {
    link.addEventListener("click", () => closeMobileNav());
  });
});

/* ── LIVE STATS PER EDITION ── */
async function loadAllEditionStats() {
  await Promise.all(
    Array.from(document.querySelectorAll(".edition-card")).map((card) =>
      loadEditionStats(card),
    ),
  );
}

async function loadEditionStats(card) {
  const slug = card.dataset.slug;
  try {
    const res = await fetch(
      `${CAMPAIGN_API_URL}/campaigns/stats?campaignSlug=${encodeURIComponent(slug)}`,
    );
    const data = await res.json();
    const stats = data?.data?.stats;
    if (!res.ok || !stats) return;

    card.dataset.reserved = String(Number(stats.copies || 0));
    if (stats.goalAmount) card.dataset.goal = String(Number(stats.goalAmount));
    if (stats.status) card.dataset.status = stats.status;

    renderCard(card);
  } catch (err) {
    console.warn(`Stats unavailable for ${slug}:`, err.message);
  }
}

/* ── MODAL ── */
function openModal(card) {
  if (!sessionStorage.getItem("ch_token")) {
    alert("Please sign in first to reserve this edition.");
    window.location.href = "index.html";
    return;
  }

  selectedEditionCard = card;
  const data = readEditionData(card);

  resetModal();
  document.getElementById("modalEditionTitle").textContent =
    `${data.series} — Volume ${data.volume}`;
  document.getElementById("modalEditionPerk").textContent = data.perk;
  document.getElementById("modalEditionPrice").textContent = formatPrice(
    computeEditionPrice(data),
  );
  document.getElementById("step1next").disabled = false;

  document.getElementById("pledgeModal").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const modal = document.getElementById("pledgeModal");
  if (modal) modal.classList.remove("open");
  document.body.style.overflow = "";
}

function resetModal() {
  document
    .querySelectorAll(".modal-step")
    .forEach((el, i) => el.classList.toggle("active", i === 0));
  document
    .querySelectorAll(".modal-step-dot")
    .forEach((d, i) => d.classList.toggle("active", i === 0));
  [
    "inputName",
    "inputEmail",
    "inputAddr",
    "inputCity",
    "inputCountry",
    "inputCardName",
  ].forEach((id) => {
    const input = document.getElementById(id);
    if (input) input.value = "";
  });
  setPledgeStatus("");
}

function nextStep(step) {
  document
    .querySelectorAll(".modal-step")
    .forEach((el, i) => el.classList.toggle("active", i === step - 1));
  document
    .querySelectorAll(".modal-step-dot")
    .forEach((d, i) => d.classList.toggle("active", i === step - 1));
  document.querySelector(".modal-box").scrollTop = 0;
  if (step === 3) {
    mountCampaignStripeCard().catch((err) => {
      setPledgeStatus(err.message || "Payment form could not be loaded.");
    });
  }
}

async function submitPledge() {
  const token = sessionStorage.getItem("ch_token");
  if (!token) {
    alert("Please sign in first to reserve this edition.");
    window.location.href = "index.html";
    return;
  }

  if (!selectedEditionCard) {
    setPledgeStatus("Please select an edition.");
    return;
  }
  const data = readEditionData(selectedEditionCard);

  const backerName = fieldValue("inputName");
  const backerEmail = fieldValue("inputEmail");
  const cardholderName = fieldValue("inputCardName");

  if (!backerName || !backerEmail) {
    setPledgeStatus("Please enter your name and email.");
    nextStep(2);
    return;
  }
  if (!cardholderName) {
    setPledgeStatus("Please enter the cardholder name.");
    nextStep(3);
    return;
  }
  if (!CAMPAIGN_STRIPE_CARD) {
    setPledgeStatus("Payment form is still loading. Please wait.");
    return;
  }

  const shippingAddress = {
    fullName: backerName,
    email: backerEmail,
    line1: fieldValue("inputAddr"),
    city: fieldValue("inputCity"),
    country: fieldValue("inputCountry"),
  };
  if (
    !shippingAddress.line1 ||
    !shippingAddress.city ||
    !shippingAddress.country
  ) {
    setPledgeStatus("Please complete the shipping address.");
    nextStep(2);
    return;
  }

  const submitButton = document.querySelector("#modalStep3 .btn-modal-primary");
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Preparing payment...";
  }
  setPledgeStatus("");

  try {
    const stripe = await getCampaignStripe();
    const price = computeEditionPrice(data);

    // The backend must snapshot `price` onto the order at this exact
    // moment — that snapshot is what guarantees this buyer keeps their
    // price even if the edition's status later moves to "retail".
    const res = await fetch(
      `${CAMPAIGN_API_URL}/campaigns/pledges/payment-intent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          campaignSlug: data.slug,
          campaignTitle: `${data.series} Volume ${data.volume}`,
          amount: price,
          backerName,
          backerEmail,
          shippingAddress,
          paymentProvider: "stripe",
        }),
      },
    );

    const resData = await res.json().catch(() => ({}));
    if (!res.ok)
      throw new Error(resData.message || "Could not prepare payment.");

    if (submitButton) submitButton.textContent = "Processing payment...";
    const paymentResult = await stripe.confirmCardPayment(
      resData.data.clientSecret,
      {
        payment_method: {
          card: CAMPAIGN_STRIPE_CARD,
          billing_details: {
            name: cardholderName,
            email: backerEmail,
            address: {
              line1: shippingAddress.line1,
              city: shippingAddress.city,
              country: shippingAddress.country,
            },
          },
        },
      },
    );

    if (paymentResult.error) {
      throw new Error(paymentResult.error.message || "Payment failed.");
    }
    if (paymentResult.paymentIntent?.status !== "succeeded") {
      throw new Error("Payment is not complete yet.");
    }

    selectedEditionCard.dataset.reserved = String(data.reserved + 1);
    renderCard(selectedEditionCard);
    nextStep(4);
  } catch (err) {
    setPledgeStatus(err.message || "Payment failed. Please try again.");
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Confirm Reservation ♥";
    }
  }
}

function loadCampaignStripeJs() {
  return new Promise((resolve, reject) => {
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

async function getCampaignStripe() {
  if (CAMPAIGN_STRIPE) return CAMPAIGN_STRIPE;
  const configRes = await fetch(`${CAMPAIGN_API_URL}/library/payment-config`);
  const config = await configRes.json();
  const publishableKey = config?.data?.publishableKey;
  if (!configRes.ok || !publishableKey) {
    throw new Error(config.message || "Stripe is not configured yet.");
  }
  await loadCampaignStripeJs();
  CAMPAIGN_STRIPE = window.Stripe(publishableKey);
  return CAMPAIGN_STRIPE;
}

async function mountCampaignStripeCard() {
  const mount = document.getElementById("stripeCampaignCardElement");
  if (!mount || CAMPAIGN_STRIPE_CARD) return;
  const stripe = await getCampaignStripe();
  CAMPAIGN_STRIPE_ELEMENTS = stripe.elements();
  CAMPAIGN_STRIPE_CARD = CAMPAIGN_STRIPE_ELEMENTS.create("card", {
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
  CAMPAIGN_STRIPE_CARD.mount("#stripeCampaignCardElement");
}

function fieldValue(id) {
  const input = document.getElementById(id);
  return input ? input.value.trim() : "";
}

function setPledgeStatus(message) {
  let status = document.getElementById("pledgeStatus");
  if (!status) {
    status = document.createElement("div");
    status.id = "pledgeStatus";
    status.className = "modal-payment-note";
    const step = document.getElementById("modalStep3");
    const actions = step?.querySelector(".modal-actions");
    if (step && actions) step.insertBefore(status, actions);
  }
  status.textContent = message;
  status.style.display = message ? "block" : "none";
}

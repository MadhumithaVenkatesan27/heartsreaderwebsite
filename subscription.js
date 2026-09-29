// ─── PLAN DATA ───
// NOTE: Novels pricing is TBD. Once confirmed, update the "all" plan's saving
// copy and the price-reference table above to include Novels figures.
const planData = {
  manga: {
    billing: {
      monthly: {
        type: "Manga Only - Monthly",
        name: "Manga Subscription - $10.99/mo",
        price: "$10.99",
        suffix: "/month",
        saving:
          "You're paying $10.99 for a manga that retails at $17.99 including shipping - a 38.9% saving.",
        features: [
          "1 manga per month - your pick",
          "Free shipping on every title",
          "Skip a month → book carries forward",
          "Pre-order edition if not yet launched, regular edition once released",
        ],
      },
      annual: {
        type: "Manga Only - Annual",
        name: "Manga Subscription - $120/yr",
        price: "$120",
        suffix: "/year · $10/mo",
        saving:
          "13 manga (12 + 1 bonus) worth $233.87 at retail - for $120. That's a 48.7% saving.",
        features: [
          "12 manga - pick any time in your 12-month period",
          "+1 bonus manga - random pick from our catalogue",
          "Free shipping on every title",
          "Skip a month → carries forward (valid up to 2 years)",
        ],
      },
    },
  },
  all: {
    billing: {
      monthly: {
        type: "All Formats - Monthly",
        name: "All Formats Subscription - $15.99/mo",
        price: "$15.99",
        suffix: "/month",
        saving:
          "Saving ranges from 11% (all manga picks) to 43% (all manhwa picks), depending on what you choose. Novels pricing TBD.",
        features: [
          "Pick your 12 books any time in the year",
          "Manga, manhwa, or novels - any mix",
          "Free shipping on every title",
          "Skip a month → book carries forward",
        ],
      },
      annual: {
        type: "All Formats - Annual",
        name: "All Formats Subscription - $180/yr",
        price: "$180",
        suffix: "/year · $15/mo",
        saving:
          "Saving ranges from 23% (all manga picks) to 49% (all manhwa picks), plus 1 bonus manga. Novels pricing TBD.",
        features: [
          "12 books - any format, any time in your 12-month period",
          "+1 bonus manga - random pick from our catalogue",
          "Free shipping on every title",
          "Skip a month → carries forward (valid up to 2 years)",
        ],
      },
    },
  },
};

let currentPlan = "manga";
let currentBilling = "monthly";

function openModal(plan) {
  currentPlan = plan;
  renderModal();
  document.getElementById("modalContent").style.display = "block";
  document.getElementById("modalSuccess").style.display = "none";
  document.getElementById("modalName").value = "";
  document.getElementById("modalEmail").value = "";
  document.getElementById("modalZip").value = "";
  document.getElementById("modalOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

function renderModal() {
  const data = planData[currentPlan].billing[currentBilling];
  document.getElementById("modalPlanType").textContent = data.type;
  document.getElementById("modalPlanName").textContent = data.name;
  document.getElementById("modalPrice").textContent = data.price;
  document.getElementById("modalPriceSuffix").textContent = data.suffix;
  document.getElementById("modalSavingBanner").textContent = data.saving;
  const featuresList = document.getElementById("modalFeatures");
  featuresList.innerHTML = data.features.map((f) => `<li>${f}</li>`).join("");
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
  document.body.style.overflow = "";
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById("modalOverlay")) closeModal();
}

function handleSubscribe() {
  const name = document.getElementById("modalName").value.trim();
  const email = document.getElementById("modalEmail").value.trim();
  const zip = document.getElementById("modalZip").value.trim();

  if (!name || !email || !zip) {
    alert("Please fill in all fields to continue.");
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert("Please enter a valid email address.");
    return;
  }
  if (!/^\d{5}$/.test(zip)) {
    alert("Please enter a valid 5-digit US ZIP code.");
    return;
  }

  document.getElementById("modalContent").style.display = "none";
  document.getElementById("modalSuccess").style.display = "block";
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// ─── BILLING SEGMENT CONTROL ───
const savePill = document.getElementById("savePill");

function setBilling(period) {
  const isAnnual = period === "annual";
  currentBilling = isAnnual ? "annual" : "monthly";

  document.body.classList.toggle("show-annual", isAnnual);
  document.getElementById("btn-monthly").classList.toggle("active", !isAnnual);
  document.getElementById("btn-annual").classList.toggle("active", isAnnual);
  savePill.classList.toggle("show", isAnnual);

  if (document.getElementById("modalOverlay").classList.contains("open"))
    renderModal();
}

// ─── FAQ ACCORDION ───
function toggleFaq(el) {
  const item = el.closest(".faq-item");
  const isOpen = item.classList.contains("open");
  document
    .querySelectorAll(".faq-item")
    .forEach((i) => i.classList.remove("open"));
  if (!isOpen) item.classList.add("open");
}

// ─── SCROLL REVEAL ───
const reveals = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
);
reveals.forEach((el) => observer.observe(el));

// ─── PLAN FINE PRINT DISCLOSURE ───
function togglePlanFine(btn) {
  const box = btn.nextElementSibling;
  const open = box.classList.toggle("open");
  btn.querySelector("i").className = open ? "ti ti-minus" : "ti ti-plus";
}

// ─── SAVINGS CALCULATOR ───
const RETAIL = { manga: 17.99, manhwa: 27.99, novel: 25.0 };
const BONUS_RETAIL = 17.99;

let calcFormat = "manhwa";
let calcBilling = "annual";
let calcBooks = 12;

function money(n) {
  return "$" + n.toFixed(2);
}

function renderCalc() {
  const retailPer = RETAIL[calcFormat];
  let retail = retailPer * calcBooks;
  let pay;

  if (calcBilling === "annual") {
    retail += BONUS_RETAIL;
    pay = 180;
  } else {
    pay = 15.99 * calcBooks;
  }

  const saving = retail - pay;
  const pct = retail > 0 ? (saving / retail) * 100 : 0;

  const savingEl = document.getElementById("calcSaving");
  const detailEl = document.getElementById("calcDetail");
  const noteEl = document.getElementById("calcNote");

  if (saving <= 0) {
    savingEl.textContent = "$0.00";
    detailEl.textContent =
      "At this volume the plan costs more than retail — try more books or annual billing.";
  } else {
    savingEl.textContent = money(saving);
    detailEl.textContent = pct.toFixed(1) + "% off retail · shipping included";
  }

  let note =
    "Based on all-formats pricing, standard editions, $5 retail shipping per book.";
  if (calcBilling === "annual") {
    note += " Includes your bonus manga.";
  }
  if (calcFormat === "manga") {
    const mangaPay = calcBilling === "annual" ? 120 : 10.99 * calcBooks;
    const mangaSave = retail - mangaPay;
    if (mangaSave > 0) {
      note +=
        " On the manga-only tier you'd save " + money(mangaSave) + " instead.";
    }
  }
  noteEl.textContent = note;
}

document.querySelectorAll("#calcFormats .calc-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document
      .querySelectorAll("#calcFormats .calc-chip")
      .forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    calcFormat = chip.dataset.format;
    renderCalc();
  });
});

document.querySelectorAll("#calcBilling .calc-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document
      .querySelectorAll("#calcBilling .calc-chip")
      .forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    calcBilling = chip.dataset.billing;
    renderCalc();
  });
});

const calcCountInput = document.getElementById("calcCount");
if (calcCountInput) {
  calcCountInput.addEventListener("input", (e) => {
    calcBooks = parseInt(e.target.value, 10);
    document.getElementById("calcCountOut").textContent = calcBooks;
    renderCalc();
  });
  renderCalc();
}

// ─── FULL BREAKDOWN TOGGLE ───
function toggleTables() {
  const box = document.getElementById("calcTables");
  const btn = document.getElementById("tablesBtn");
  const open = box.classList.toggle("open");
  btn.textContent = open
    ? "Hide the full breakdown"
    : "Show the full breakdown";
}

// ─── MEMBER DASHBOARD DATA (replace with real API data) ───
const SUBSCRIBER_CATALOG = [
  {
    id: "bgos",
    title: "Baroness Goes on Strike",
    format: "Manhwa",
    cover: "Images/BGOS-vol1.png",
    volumes: [1, 2],
    preorder: true,
    releaseNote: "Ships at release — estimated November 2026.",
  },
  {
    id: "fktl",
    title: "From a Knight to a Lady",
    format: "Manhwa",
    cover: "Images/FKTL-vol1.png",
    volumes: [1],
    preorder: false,
  },
  {
    id: "taas",
    title: "The Archduke's Adopted Saint",
    format: "Manhwa",
    cover: "Images/TAAS-vol1.png",
    volumes: [1],
    preorder: true,
    releaseNote: "Ships at release — estimated December 2026.",
  },
];

const MEMBER = {
  planLabel: "All formats — annual",
  startDate: "2026-01-15",
  totalCredits: 13,
  picks: [
    {
      month: "Jan 2026",
      title: "Baroness Goes on Strike",
      volume: 1,
      format: "Manhwa",
      status: "delivered",
    },
    {
      month: "Feb 2026",
      title: "From a Knight to a Lady",
      volume: 1,
      format: "Manhwa",
      status: "delivered",
    },
    {
      month: "Mar 2026",
      title: "The Archduke's Adopted Saint",
      volume: 1,
      format: "Manhwa",
      status: "shipped",
    },
    {
      month: "Apr 2026",
      title: null,
      volume: null,
      format: null,
      status: "carried",
    },
    {
      month: "May 2026",
      title: "Baroness Goes on Strike",
      volume: 2,
      format: "Manhwa",
      status: "pending",
    },
    {
      month: "Jun 2026",
      title: null,
      volume: null,
      format: null,
      status: "carried",
    },
    {
      month: "Jul 2026",
      title: null,
      volume: null,
      format: null,
      status: "open",
    },
    {
      month: "Aug 2026",
      title: null,
      volume: null,
      format: null,
      status: "open",
    },
    {
      month: "Sep 2026",
      title: null,
      volume: null,
      format: null,
      status: "open",
    },
  ],
};

const STATUS_LABEL = {
  delivered: "Delivered",
  shipped: "Shipped",
  pending: "Pending Pre-order",
  carried: "Carried Forward",
  open: "Not Yet Picked",
};

function monthsSince(dateStr) {
  const start = new Date(dateStr);
  const now = new Date();
  return (
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth()) +
    1
  );
}

function coverForPick(pick) {
  if (!pick.title) return null;
  const match = SUBSCRIBER_CATALOG.find((t) => t.title === pick.title);
  return match ? match.cover : null;
}

function renderMemberDashboard() {
  const el = document.getElementById("memberDashboard");
  if (!el) return;

  const used = MEMBER.picks.filter((p) => p.title).length;
  const remaining = MEMBER.totalCredits - used;
  const duration = monthsSince(MEMBER.startDate);

  el.innerHTML = `
    <div class="dash-row">
      <div>
        <div class="dash-plan-label">Current plan</div>
        <div class="dash-plan-name">${MEMBER.planLabel}</div>
        <div class="dash-plan-duration">Member for ${duration} month${duration !== 1 ? "s" : ""}</div>
      </div>
      <a href="select-title.html" class="btn-outline dash-browse-link">
        <i class="ti ti-books" aria-hidden="true"></i> Browse full catalogue
      </a>
    </div>

    <div class="dash-stat-grid">
      <div class="dash-stat-box"><div class="dash-stat-num">${MEMBER.totalCredits}</div><div class="dash-stat-label">Total credits</div></div>
      <div class="dash-stat-box"><div class="dash-stat-num">${used}</div><div class="dash-stat-label">Credits used</div></div>
      <div class="dash-stat-box"><div class="dash-stat-num">${remaining}</div><div class="dash-stat-label">Credits remaining</div></div>
    </div>

    <div class="dash-history">
      <div class="dash-history-title">Selection history</div>
      ${MEMBER.picks
        .map((p, i) => {
          const cover = coverForPick(p);
          const thumb = cover
            ? `<img class="dash-pick-thumb" src="${cover}" alt="${p.title} cover" />`
            : `<div class="dash-pick-thumb dash-pick-thumb--empty"><i class="ti ti-book"></i></div>`;
          const name = p.title
            ? `${p.title} — Vol. ${p.volume} (${p.format})`
            : `<span class="empty">${p.status === "carried" ? "Credit carried forward" : "No pick yet"}</span>`;
          const canAct = p.status === "open";
          return `
          <div class="dash-pick-row">
            ${thumb}
            <div class="dash-pick-month">${p.month}</div>
            <div class="dash-pick-name">${name}</div>
            <div class="dash-pick-actions">
              <span class="status-badge status-${p.status}">${STATUS_LABEL[p.status]}</span>
              ${canAct ? `<button class="dash-carry-btn dash-carry-btn--primary" onclick="openSelectModal(${i})">Browse titles</button><button class="dash-carry-btn" onclick="carryForward(${i})">Carry forward</button>` : ""}
            </div>
          </div>`;
        })
        .join("")}
    </div>

    <div class="dash-expiry-note">
      Unused credits carry forward automatically while your subscription
      stays active. If you cancel, they remain valid for 12 more months
      before expiring.
    </div>
  `;
}

// ─── INLINE TITLE SELECTION (no redirect off this page) ───
let currentPickIndex = null;

function openSelectModal(pickIndex) {
  currentPickIndex = pickIndex;
  renderSelectGrid();
  document.getElementById("selectModalOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

function renderSelectGrid() {
  const content = document.getElementById("selectModalContent");

  content.innerHTML = `
    <div class="modal-eyebrow">This month's pick</div>
    <h3>Browse titles</h3>
    <a href="select-title.html" class="browse-full-link">
      View the full catalogue <i class="ti ti-arrow-right" aria-hidden="true"></i>
    </a>
    <div class="browse-grid" id="browseGrid">
      ${SUBSCRIBER_CATALOG.map(
        (t) => `
        <button class="browse-card" onclick="selectBrowseTitle('${t.id}')">
          <img class="browse-cover" src="${t.cover}" alt="${t.title} cover" loading="lazy" />
          <span class="browse-title">${t.title}</span>
          <span class="browse-format">${t.format}</span>
          ${t.preorder ? `<span class="browse-preorder-tag">Pre-order</span>` : ""}
        </button>`,
      ).join("")}
    </div>
  `;
}

function selectBrowseTitle(titleId) {
  const title = SUBSCRIBER_CATALOG.find((t) => t.id === titleId);
  const volumeOptions = title.volumes
    .map((v) => `<option value="${v}">Vol. ${v}</option>`)
    .join("");

  document.getElementById("selectModalContent").innerHTML = `
    <button class="browse-back" onclick="renderSelectGrid()">&larr; Back to titles</button>
    <div class="modal-eyebrow">Confirm your pick</div>
    <h3>${title.title}</h3>
    <div class="select-title-grid">
      <img class="select-title-cover" src="${title.cover}" alt="${title.title} cover" />
      <div>
        <div class="select-volume-row">
          <label style="font-size:0.8rem;color:var(--sp-text-dim);">Volume</label>
          <select id="selectVolumeDropdown">${volumeOptions}</select>
        </div>
      </div>
    </div>
    ${
      title.preorder
        ? `<div class="preorder-notice"><i class="ti ti-info-circle"></i><span>This title is on pre-order. ${title.releaseNote}</span></div>`
        : ""
    }
    <input type="hidden" id="selectTitleDropdown" value="${title.id}" />
    <button class="btn-modal-submit" onclick="confirmSelection()">Confirm Selection</button>
  `;
}

function confirmSelection() {
  const titleId = document.getElementById("selectTitleDropdown").value;
  const volume = parseInt(
    document.getElementById("selectVolumeDropdown").value,
    10,
  );
  const title = SUBSCRIBER_CATALOG.find((t) => t.id === titleId);

  MEMBER.picks[currentPickIndex] = {
    month: MEMBER.picks[currentPickIndex].month,
    title: title.title,
    volume,
    format: title.format,
    status: title.preorder ? "pending" : "shipped",
  };

  closeSelectModal();
  renderMemberDashboard();
}

function carryForward(pickIndex) {
  MEMBER.picks[pickIndex] = {
    ...MEMBER.picks[pickIndex],
    title: null,
    volume: null,
    format: null,
    status: "carried",
  };
  renderMemberDashboard();
}

function closeSelectModal() {
  document.getElementById("selectModalOverlay").classList.remove("open");
  document.body.style.overflow = "";
  currentPickIndex = null;
}

function handleSelectOverlayClick(e) {
  if (e.target === document.getElementById("selectModalOverlay"))
    closeSelectModal();
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeSelectModal();
});

renderMemberDashboard();

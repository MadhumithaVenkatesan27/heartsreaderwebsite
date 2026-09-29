/* =========================================================
   title-page.js — logic for merged Digital + Print title pages
   (same behaviour as the inline script in chigaya.html)
   Load AFTER script.js and title-features.js.
   Reads window.CH2_CONFIG, defined on each page.
   ========================================================= */
const CH2 = window.CH2_CONFIG;
const CH_DATA = CH2.vols;
const CH_STATE = {
  format: "digital",
  edition: "standard",
  volume: 1,
  tab: "overview",
};
const ch2$ = (id) => document.getElementById(id);

/* ============ See More toggle ============ */
function ch2ToggleSeeMore() {
  const panel = ch2$("ch2SeeMorePanel");
  const btn = ch2$("ch2SeeMoreBtn");
  const label = ch2$("ch2SeeMoreLabel");
  const isOpen = panel.classList.toggle("open");
  btn.classList.toggle("open", isOpen);
  label.textContent = isOpen ? "See Less" : "See More";
}

/* ============ Tabs ============ */
function ch2SwitchTab(tab) {
  CH_STATE.tab = tab;
  document
    .querySelectorAll(".ch2-tab")
    .forEach((el) => el.classList.toggle("active", el.dataset.tab === tab));
  document
    .querySelectorAll(".ch2-tabpanel")
    .forEach((el) =>
      el.classList.toggle("active", el.id === "ch2Panel-" + tab),
    );
  const navH =
    parseInt(
      getComputedStyle(document.documentElement).getPropertyValue("--nav-h"),
    ) || 68;
  window.scrollTo({
    top: document.querySelector(".ch2-tabs").offsetTop - navH - 10,
    behavior: "smooth",
  });
}

/* ============ Synopsis volume toggle ============ */
function ch2SwitchSynopsisVolume(vol) {
  let html = CH2.synopsis && CH2.synopsis[vol];
  if (
    !html &&
    typeof CH_TITLE_MEDIA !== "undefined" &&
    CH_TITLE_MEDIA[CH2.id]
  ) {
    const v = CH_TITLE_MEDIA[CH2.id].volumes[vol];
    if (v) html = v.synopsis;
  }
  if (!html) return;
  ch2$("ch2SynopsisText").innerHTML = html;
  document
    .querySelectorAll(".ch2-syn-btn")
    .forEach((b) => b.classList.toggle("active", b.dataset.synVol == vol));
}

/* ============ Format banner ============ */
function ch2RenderBanner() {
  const soon = !CH_DATA[CH_STATE.volume].digitalBuy;
  ch2$("ch2FmtBanner").innerHTML =
    CH_STATE.format === "digital"
      ? '<i class="ti ti-device-tablet"></i><span>You\'re viewing the <strong>Digital Edition</strong> — ' +
        (soon ? "chapters are coming soon." : "read online instantly.") +
        ' Prefer a physical book? Switch format in the panel <span class="ch2-jump-hint">above / to the right</span>.</span>'
      : '<i class="ti ti-book"></i><span>You\'re viewing the <strong>Print Edition</strong> — a physical paperback. Prefer to read digitally? Switch back to <a onclick="ch2SwitchFormat(\'digital\')">Digital</a>.</span>';
}

/* ============ Format / Edition / Volume ============ */
function ch2SwitchFormat(fmt) {
  CH_STATE.format = fmt;
  document.body.dataset.format = fmt;
  ch2$("ch2SegDigital").classList.toggle("active", fmt === "digital");
  ch2$("ch2SegPrint").classList.toggle("active", fmt === "print");
  ch2$("ch2SegSub").classList.toggle("open", fmt === "print");
  ch2RenderBanner();
  const pill = ch2$("ch2FmtPill");
  pill.textContent =
    fmt === "digital"
      ? "Digital"
      : CH_STATE.edition === "limited"
        ? "Limited"
        : "Standard";
  pill.classList.toggle("print", fmt === "print");
  ch2UpdateCover();
  ch2UpdatePriceBlock();
}

function ch2SwitchEdition(ed) {
  CH_STATE.edition = ed;
  ch2$("ch2EdStandard").classList.toggle("active", ed === "standard");
  ch2$("ch2EdLimited").classList.toggle("active", ed === "limited");
  ch2$("ch2FmtPill").textContent = ed === "limited" ? "Limited" : "Standard";
  ch2UpdateCover();
  ch2UpdatePriceBlock();
}

function ch2SwitchVolume(vol) {
  CH_STATE.volume = vol;
  document
    .querySelectorAll(".ch2-vol-chip[data-vol]")
    .forEach((el) =>
      el.classList.toggle("active", Number(el.dataset.vol) === Number(vol)),
    );
  [1, 2].forEach((n) => {
    const chip = ch2$("ch2PanelVol" + n);
    if (chip) chip.classList.toggle("active", vol === n);
    const panel = ch2$("chVolPanel-" + n);
    if (panel) panel.style.display = vol === n ? "" : "none";
  });
  const pages = ch2$("ch2StatPages");
  if (pages) pages.textContent = CH_DATA[vol].pages;
  ch2UpdateCover();
  ch2UpdatePriceBlock();
  ch2RenderBanner();
}

function ch2UpdateCover() {
  const d = CH_DATA[CH_STATE.volume];
  const src =
    CH_STATE.format === "digital"
      ? d.coverDigital
      : CH_STATE.edition === "limited"
        ? d.coverLimited
        : d.coverStandard;
  ch2$("ch2CoverImg").src = src;
}

function ch2DigitalLabel() {
  return CH_DATA[CH_STATE.volume].digitalBuy ? "Add Full Volume" : "Notify Me";
}

function ch2UpdatePriceBlock() {
  const d = CH_DATA[CH_STATE.volume];
  let price, note, btnLabel, mobLabel;
  if (CH_STATE.format === "digital") {
    price = "$" + d.digitalPrice;
    note = d.digitalNote;
    btnLabel = ch2DigitalLabel();
    mobLabel = d.digitalBuy ? "Add to Cart" : "Notify Me";
  } else {
    const p = CH_STATE.edition === "limited" ? d.printLimited : d.printStandard;
    price = "$" + p.toFixed(2);
    note =
      "Volume " +
      CH_STATE.volume +
      " · " +
      (CH_STATE.edition === "limited"
        ? "Limited (Shikishi)"
        : "Standard Paperback");
    btnLabel = mobLabel = "Add to Cart";
  }
  ch2$("ch2Price").textContent = price;
  ch2$("ch2PriceNote").innerHTML = note;
  ch2$("ch2PrimaryBuy").textContent = btnLabel;
  ch2$("ch2MobilePrice").textContent = price;
  ch2$("ch2MobileNote").innerHTML = note.replace("<br>", " · ");
  ch2$("ch2MobileBtn").textContent = mobLabel;
}

/* ============ Buying ============ */
function ch2DigitalAction(vol) {
  const d = CH_DATA[vol];
  if (!d.digitalBuy) {
    chNotifyMe(d.digitalKey);
    return;
  }
  chAddDigitalToCart(
    d.digitalKey,
    "full",
    "Volume " + vol + " - Full Volume",
    d.digitalPrice,
    d.coverDigital,
  );
}

function ch2HandlePrimaryBuy() {
  if (CH_STATE.format === "digital") ch2DigitalAction(CH_STATE.volume);
  else chAddPrintEditionToCart(CH2.id, CH_STATE.volume, CH_STATE.edition);
}

function ch2AddSet(e) {
  e.preventDefault();
  (CH2.set || []).forEach((v) =>
    chAddPrintToCart({
      sku: v.sku,
      title: v.title,
      edition: "Standard Paperback",
      unitPrice: v.unitPrice,
      coverImageUrl: v.image,
      isPreorder: !!CH2.setPreorder,
    }),
  );
  showToast("All volumes added to cart!", "success");
}

function ch2RefreshDigitalButtons() {
  document.querySelectorAll("[data-digital-btn]").forEach((b) => {
    const vol = Number(b.dataset.digitalBtn);
    b.textContent = CH_DATA[vol].digitalBuy ? "Add Volume " + vol : "Notify Me";
  });
}

/* ============ Wishlist ============ */
function ch2ToggleWish(ev, btn) {
  ev.stopPropagation();
  chToggleWishlist(CH2.id, CH2.name);
  chUpdateWishlistBtn(CH2.id, btn);
}

/* ============ Theme ============ */
function toggleTheme() {
  const l = document.body.classList.toggle("light-mode");
  localStorage.setItem("ch-theme", l ? "light" : "dark");
}

/* ============ Nav search overlay (only defined if nav-search.js hasn't) ============ */
if (typeof window.openNavSearch !== "function")
  window.openNavSearch = function () {
    ch2$("navSearchOverlay").classList.add("open");
    setTimeout(() => ch2$("navSearchInput").focus(), 80);
  };
if (typeof window.closeNavSearch !== "function")
  window.closeNavSearch = function () {
    ch2$("navSearchOverlay").classList.remove("open");
    navClearSearch();
  };
if (typeof window.closeNavSearchIfBg !== "function")
  window.closeNavSearchIfBg = function (e) {
    if (e.target === e.currentTarget) closeNavSearch();
  };
if (typeof window.navDoSearch !== "function")
  window.navDoSearch = function () {
    const v = ch2$("navSearchInput").value.trim();
    if (v) window.location.href = "search.html?q=" + encodeURIComponent(v);
  };
if (typeof window.navClearSearch !== "function")
  window.navClearSearch = function () {
    const i = ch2$("navSearchInput");
    if (i) i.value = "";
    const b = ch2$("navSearchSuggestions");
    if (b) {
      b.innerHTML = "";
      b.classList.remove("open");
    }
    const c = ch2$("navSearchClear");
    if (c) c.style.display = "none";
  };
if (typeof window.navLiveSearch !== "function")
  window.navLiveSearch = function (val) {
    const c = ch2$("navSearchClear");
    if (c) c.style.display = val ? "" : "none";
  };
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeNavSearch();
});

/* ============ Back to top ============ */
(function () {
  const btn = ch2$("backToTop");
  if (!btn) return;
  window.addEventListener(
    "scroll",
    function () {
      if (window.scrollY > 400) {
        btn.style.display = "flex";
        btn.style.opacity = "1";
      } else {
        btn.style.opacity = "0";
        setTimeout(() => {
          if (window.scrollY <= 400) btn.style.display = "none";
        }, 300);
      }
    },
    { passive: true },
  );
})();

/* ============ Init ============ */
(function () {
  renderAuthForm("in");
  if (localStorage.getItem("ch-theme") === "light")
    document.body.classList.add("light-mode");

  chInitDigitalVolume(CH2.id, 1);
  chRenderRetailers(CH2.id, "digitalRetailerGrid", "digital");
  chRenderRetailers(CH2.id, "printRetailerGrid", "print");

  // chapter thumbnail image
  document.documentElement.style.setProperty(
    "--ch2-ch-cover",
    'url("' + (CH2.chapterCover || CH_DATA[1].coverDigital) + '")',
  );

  // remember Volume 1 synopsis (written in the HTML) for the toggle
  const syn = ch2$("ch2SynopsisText");
  CH2.synopsis = CH2.synopsis || {};
  if (syn && !CH2.synopsis[1]) CH2.synopsis[1] = syn.innerHTML;

  // wishlist heart state
  const wl = document.querySelector(".ch2-wish[data-id]");
  if (wl && chIsWishlisted(wl.getAttribute("data-id"))) {
    wl.classList.add("wishlisted");
    wl.innerHTML =
      '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
  }

  /* Deep-link: ?format=print&vol=2&edition=limited&tab=editions
     (an `edition` param without `format` is treated as print, so old
     print-xxx.html?vol=1&edition=limited links keep working) */
  const params = new URLSearchParams(window.location.search);
  const ed = params.get("edition");
  const fmt = params.get("format") || (ed ? "print" : null);
  const vol = parseInt(params.get("vol"), 10);
  const tab = params.get("tab");
  if (CH_DATA[vol]) ch2SwitchVolume(vol);
  if (fmt === "print") ch2SwitchFormat("print");
  if (ed === "limited" || ed === "standard") ch2SwitchEdition(ed);
  if (tab) ch2SwitchTab(tab);

  ch2RenderBanner();
  ch2UpdateCover();
  ch2UpdatePriceBlock();
  ch2RefreshDigitalButtons();
})();

/* Purchase via Subscription button */
(function () {
  var b = document.querySelector(".ch2-buy-panel .ch2-buy-btn.secondary");
  if (b && !document.getElementById("ch2SubBtn"))
    b.insertAdjacentHTML(
      "afterend",
      '<a id="ch2SubBtn" class="ch2-buy-btn sub" href="subscription.html"><i class="ti ti-crown"></i> Purchase via Subscription</a>',
    );
})();

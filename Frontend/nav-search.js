// ================================================
// SEARCH SYSTEM — single source of truth
// Used by nav-search.js AND search-system.js (keep both files identical)
// ================================================

(function () {
  "use strict";
  if (window.CHSearch) return;

  var has = function (o, k) {
    return Object.prototype.hasOwnProperty.call(o, k);
  };

  // A print item is any item whose category is "Print" OR whose page is a print page.
  // (Manhwa / Lily House titles are catalogued under their imprint but link to print-*.html)
  var PRINT_URL_RE = /(^|\/)print-/i;

  // Words that mean "filter by this category / edition type", not "free text".
  var CATEGORY_ALIASES = {
    manga: "Manga",
    manhwa: "Manhwa",
    novel: "Novel",
    novels: "Novel",
    "light novel": "Novel",
    "light novels": "Novel",
    "glam beat": "Glam Beat",
    glambeat: "Glam Beat",
    "blush club": "Blush Club",
    blushclub: "Blush Club",
    "studio hearts": "Studio Hearts",
    studiohearts: "Studio Hearts",
    "lily house": "Lily House",
    lilyhouse: "Lily House",
    "creator original": "Creator Original",
    "creator originals": "Creator Original",
    creatororiginal: "Creator Original",
    print: "Print",
    prints: "Print",
    "print edition": "Print",
    "print editions": "Print",
    paperback: "Print",
    paperbacks: "Print",
    digital: "Digital",
    "digital edition": "Digital",
    "digital editions": "Digital",
  };

  // Alternative spellings / genre names people actually type.
  // The site labels are "Girls' Love" / "Boys' Love"; "yuri" and "yaoi" are kept
  // ONLY as hidden search aliases so people typing them still find results.
  // An empty array means "keep this multi-word phrase together".
  var SYNONYMS = {
    yuri: ["girls love", "gl"],
    "girls love": ["yuri", "gl"],
    gl: ["yuri", "girls love"],
    yaoi: ["bl", "boys love"],
    bl: ["yaoi", "boys love"],
    "boys love": ["yaoi", "bl"],
    shojo: ["shoujo"],
    shonen: ["shounen"],
    "sci fi": ["scifi", "science fiction"],
    scifi: ["sci fi", "science fiction"],
    "school life": [],
    "slice of life": [],
    "enemies to lovers": [],
    "slow burn": [],
  };

  // Which imprint a print edition belongs to (keys = CH_TITLE_MEDIA keys).
  var TITLE_KEY_CATEGORY = {
    chigaya: "Manga",
    grenimal: "Manga",
    connie: "Manga",
    matchmaker: "Manga",
    lovebeyond: "Manga",
    mobs: "Manga",
    emma: "Manga",
    octopiece: "Manga",
    zombie: "Novel",
    raeliana: "Novel",
    baroness: "Manhwa",
    fktl: "Manhwa",
    archduke: "Manhwa",
    darling: "Manhwa",
    villainsdad: "Manhwa",
    rosemanor: "Manhwa",
    borrowing: "Glam Beat",
    timecloset: "Glam Beat",
    afternoon: "Glam Beat",
    inksoaked: "Glam Beat",
    devilinme: "Glam Beat",
    gaze: "Blush Club",
    thebird: "Blush Club",
    theking: "Blush Club",
    until: "Blush Club",
    fairytrap: "Blush Club",
    addictedtoyou: "Blush Club",
    kissbeforegunshot: "Studio Hearts",
    doomsdayrequiem: "Studio Hearts",
    chiaroscuro: "Studio Hearts",
    soulguiders: "Studio Hearts",
    reverse4you: "Lily House",
    plslove: "Lily House",
    earthvows: "Lily House",
    cranium: "Lily House",
    enemieswithbenefits: "Lily House",
    seameetsshore: "Creator Original",
  };

  function normalize(s) {
    return String(s == null ? "" : s)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Fiancé -> fiance
      .replace(/['\u2018\u2019`]/g, "") // You're -> youre, Girls' -> girls
      .replace(/[^\p{L}\p{N}]+/gu, " ") // Slice-of-Life -> slice of life
      .trim();
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function digitalList() {
    return (window.CH_CATALOG || []).filter(function (i) {
      return String(i.category || "").toLowerCase() !== "print";
    });
  }

  // Find the digital catalogue entry that corresponds to a print title / url.
  function findDigital(title, url) {
    var list = digitalList();
    var i, d;
    if (url) {
      for (i = 0; i < list.length; i++) {
        if (list[i].url === url) return list[i];
      }
    }
    var t = normalize(String(title || "").replace(/\(print\)/gi, ""));
    if (!t) return null;
    for (i = 0; i < list.length; i++) {
      if (normalize(list[i].title) === t) return list[i];
    }
    for (i = 0; i < list.length; i++) {
      d = normalize(list[i].title);
      if (d.indexOf(t) === 0 || t.indexOf(d) === 0) return list[i];
    }
    return null;
  }

  // For a "Print" item, work out its real imprint (Manga, Novel, Blush Club, ...)
  function deriveBase(item) {
    var d = findDigital(item.title, item.url);
    if (d && d.category) return d.category;
    var nk = normalize(item.keywords || "");
    if (/\bblush ?club\b/.test(nk)) return "Blush Club";
    if (/\bglam ?beat\b/.test(nk)) return "Glam Beat";
    if (/\bstudio ?hearts\b/.test(nk)) return "Studio Hearts";
    if (/\blily ?house\b/.test(nk)) return "Lily House";
    if (/\bmanhwa\b/.test(nk)) return "Manhwa";
    if (/\bnovel\b/.test(nk)) return "Novel";
    if (/\bmanga\b/.test(nk)) return "Manga";
    return null;
  }

  function isPrintItem(item) {
    if (item._isPrint !== undefined) return item._isPrint;
    return (
      item.printOnly === true ||
      String(item.category || "").toLowerCase() === "print" ||
      PRINT_URL_RE.test(String(item.url || ""))
    );
  }

  // Pre-compute everything the matcher needs, once per item.
  function annotate(item) {
    var isPrintCat = String(item.category || "").toLowerCase() === "print";
    var cats = [];
    if (isPrintCat) {
      var base = item.baseCategory || deriveBase(item);
      if (base) cats.push(base);
    } else if (item.category) {
      cats.push(item.category);
    }
    var isPrint =
      item.printOnly === true ||
      isPrintCat ||
      PRINT_URL_RE.test(String(item.url || ""));
    var typeText = isPrint ? "print paperback physical" : "digital";
    item._isPrint = isPrint;
    item._cats = cats;
    item._title = normalize(item.title);
    item._hay = normalize(
      [
        item.title,
        item.sub,
        item.genre,
        cats.join(" "),
        typeText,
        item.synopsis,
        item.keywords,
      ].join(" "),
    );
    item._ghay = normalize(
      [item.genre, item.keywords, cats.join(" ")].join(" "),
    );
    return item;
  }

  function hasCategory(item, cat) {
    if (cat === "Print") return !!item._isPrint;
    if (cat === "Digital") return !item._isPrint;
    return item._cats.indexOf(cat) !== -1;
  }

  function containsTerm(hay, t) {
    if (!t) return true;
    // very short terms ("bl", "gl", "of") must match whole words only
    if (t.length <= 2) return (" " + hay + " ").indexOf(" " + t + " ") !== -1;
    return hay.indexOf(t) !== -1;
  }

  function termMatches(item, term, hayField) {
    if (has(CATEGORY_ALIASES, term)) {
      return hasCategory(item, CATEGORY_ALIASES[term]);
    }
    var candidates = [term].concat(has(SYNONYMS, term) ? SYNONYMS[term] : []);
    var hay = item[hayField];
    for (var i = 0; i < candidates.length; i++) {
      if (containsTerm(hay, candidates[i])) return true;
    }
    return false;
  }

  function parse(q) {
    var norm = normalize(q);
    var terms = [];
    if (norm) {
      terms =
        has(CATEGORY_ALIASES, norm) || has(SYNONYMS, norm)
          ? [norm]
          : norm.split(" ");
    }
    return { norm: norm, terms: terms };
  }

  // Every word the user typed must match (AND), in any order.
  function matches(item, parsed) {
    if (!parsed.terms.length) return true;
    for (var i = 0; i < parsed.terms.length; i++) {
      if (!termMatches(item, parsed.terms[i], "_hay")) return false;
    }
    return true;
  }

  // Chip / genre-tile filter. Categories & Print/Digital match on category;
  // anything else (Romance, Girls' Love, School Life...) matches on genre + keywords.
  function matchesFilter(item, filter) {
    var f = normalize(filter);
    if (!f || f === "all") return true;
    return termMatches(item, f, "_ghay");
  }

  function score(item, parsed) {
    if (!parsed.norm) return 0;
    var t = item._title;
    var pos = t.indexOf(parsed.norm);
    if (pos === 0) return 0; // title starts with query
    if (pos !== -1) return 1; // title contains query
    for (var i = 0; i < parsed.terms.length; i++) {
      if (!containsTerm(t, parsed.terms[i])) return 3; // matched elsewhere
    }
    return 2; // all words are in the title
  }

  function search(items, query, filter) {
    var raw = String(query == null ? "" : query).trim();
    var parsed = parse(raw);
    if (raw && !parsed.norm) return []; // e.g. only punctuation typed
    var scored = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (it._hay === undefined) annotate(it);
      if (matches(it, parsed) && matchesFilter(it, filter)) {
        scored.push({ item: it, s: score(it, parsed), i: i });
      }
    }
    scored.sort(function (a, b) {
      return a.s - b.s || a.i - b.i;
    });
    return scored.map(function (x) {
      return x.item;
    });
  }

  function getCatalog() {
    var raw = window.CH_CATALOG || [];
    for (var i = 0; i < raw.length; i++) {
      if (raw[i]._hay === undefined) annotate(raw[i]);
    }
    return raw;
  }

  window.CHSearch = {
    normalize: normalize,
    escapeHtml: escapeHtml,
    annotate: annotate,
    parse: parse,
    matches: matches,
    matchesFilter: matchesFilter,
    search: search,
    getCatalog: getCatalog,
    findDigital: findDigital,
    isPrintItem: isPrintItem,
    categoryForTitleKey: function (key) {
      return has(TITLE_KEY_CATEGORY, key) ? TITLE_KEY_CATEGORY[key] : null;
    },
  };
})();

/* ------------------------------------------------
   2. NAV SEARCH UI
   ------------------------------------------------ */
const CH_NAV_GENRES = [
  "Romance",
  "Fantasy",
  "Action",
  "Mystery",
  "Comedy",
  "Horror",
  "School Life",
  "Girls' Love",
  "Shoujo",
  "Josei",
  "Slice of Life",
  "Supernatural",
];
window.CH_NAV_GENRES = CH_NAV_GENRES;
const CH_NAV_GENRES_INITIAL = 6;
let chGenresExpanded = false;
let CH_SEARCH_LAST_FOCUSED = null;
// true while we hand focus back to the trigger, so its onfocus="openNavSearch()"
// doesn't instantly re-open the overlay we just closed
let chSearchIgnoreFocus = false;

function navRenderGenres() {
  const grid = document.getElementById("navGenresGrid");
  const moreBtn = document.getElementById("navGenresMoreBtn");
  if (!grid) return;
  grid.innerHTML = CH_NAV_GENRES.map((g, i) => {
    const slug = g.toLowerCase().replace(/\s+/g, "-");
    const hidden = i >= CH_NAV_GENRES_INITIAL ? "hidden-genre" : "";
    return `<button type="button" class="nav-genre-tile ${hidden}" data-genre="${slug}" aria-label="Browse ${g} titles">${g}</button>`;
  }).join("");
  grid.querySelectorAll(".nav-genre-tile").forEach((tile) => {
    tile.addEventListener("click", () => navGoToGenre(tile.dataset.genre));
  });
  chGenresExpanded = false;
  if (moreBtn) {
    moreBtn.textContent = "See more";
    moreBtn.setAttribute("aria-expanded", "false");
  }
}

function navToggleGenres() {
  chGenresExpanded = !chGenresExpanded;
  document.querySelectorAll(".nav-genre-tile").forEach((tile, i) => {
    if (i >= CH_NAV_GENRES_INITIAL)
      tile.classList.toggle("hidden-genre", !chGenresExpanded);
  });
  const moreBtn = document.getElementById("navGenresMoreBtn");
  if (moreBtn) {
    moreBtn.textContent = chGenresExpanded ? "See less" : "See more";
    moreBtn.setAttribute("aria-expanded", String(chGenresExpanded));
  }
}

function navShowGenresPanel() {
  const panel = document.getElementById("navGenresPanel");
  if (panel) {
    panel.style.display = "block";
    panel.setAttribute("aria-hidden", "false");
  }
}

function navHideGenresPanel() {
  const panel = document.getElementById("navGenresPanel");
  if (panel) {
    panel.style.display = "none";
    panel.setAttribute("aria-hidden", "true");
  }
}

function chStashQuery(q, genre) {
  try {
    if (genre) {
      sessionStorage.setItem("ch_last_search_genre", genre);
      sessionStorage.removeItem("ch_last_search_query");
    } else {
      sessionStorage.setItem("ch_last_search_query", q);
      sessionStorage.removeItem("ch_last_search_genre");
    }
  } catch (e) {
    /* storage blocked (private mode) — the URL params still carry the search */
  }
}

function navGoToGenre(slug) {
  const validSlugs = CH_NAV_GENRES.map((g) =>
    g.toLowerCase().replace(/\s+/g, "-"),
  );
  if (!slug || !validSlugs.includes(slug)) {
    window.location.href = "search.html";
    return;
  }
  const genreLabel =
    CH_NAV_GENRES.find((g) => g.toLowerCase().replace(/\s+/g, "-") === slug) ||
    slug;
  chStashQuery("", genreLabel);
  window.location.href = "search.html?genre=" + encodeURIComponent(genreLabel);
}

function navDoSearch() {
  const inp = document.getElementById("navSearchInput");
  if (!inp) return;
  const val = inp.value.trim();
  if (!val) return;
  chStashQuery(val, "");
  window.location.href = "search.html?q=" + encodeURIComponent(val);
}

function chSetSearchTriggerExpanded(expanded) {
  document
    .querySelectorAll(
      "#navSearchInlineInput, #navSearchInlineBtn, .btn-nav-search",
    )
    .forEach((el) => el.setAttribute("aria-expanded", String(expanded)));
}

function openNavSearch(prefill) {
  if (chSearchIgnoreFocus) return;
  const overlay = document.getElementById("navSearchOverlay");
  if (!overlay) return;
  const alreadyOpen = overlay.classList.contains("open");
  // click + focus both fire on the trigger; the second call must be a no-op
  if (alreadyOpen && !prefill) return;
  if (!alreadyOpen) CH_SEARCH_LAST_FOCUSED = document.activeElement;
  overlay.classList.add("open");
  overlay.setAttribute("aria-hidden", "false");
  chSetSearchTriggerExpanded(true);

  const inp = document.getElementById("navSearchInput");
  if (inp) inp.value = prefill || "";

  if (prefill) {
    navHideGenresPanel();
    navLiveSearch(prefill);
  } else {
    navShowGenresPanel();
    const box = document.getElementById("navSearchSuggestions");
    if (box) {
      box.innerHTML = "";
      box.classList.remove("open");
    }
    const clearBtn = document.getElementById("navSearchClear");
    if (clearBtn) clearBtn.style.display = "none";
  }

  document.addEventListener("keydown", chTrapSearchFocus, true);
  setTimeout(() => inp && inp.focus(), 80);
}

function closeNavSearch() {
  const overlay = document.getElementById("navSearchOverlay");
  if (!overlay || !overlay.classList.contains("open")) return;
  overlay.classList.remove("open");
  overlay.setAttribute("aria-hidden", "true");
  navClearSearch(true);
  chSetSearchTriggerExpanded(false);
  document.removeEventListener("keydown", chTrapSearchFocus, true);

  const target = CH_SEARCH_LAST_FOCUSED;
  CH_SEARCH_LAST_FOCUSED = null;
  if (target && typeof target.focus === "function") {
    chSearchIgnoreFocus = true;
    try {
      target.focus();
    } finally {
      chSearchIgnoreFocus = false;
    }
  }
}

function chTrapSearchFocus(e) {
  if (e.key !== "Tab") return;
  const modal = document.querySelector(".nav-search-modal");
  if (!modal) return;
  const focusable = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  if (!focusable.length) return;
  const first = focusable[0],
    last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

function closeNavSearchIfBg(e) {
  if (e.target === e.currentTarget) closeNavSearch();
}

function navClearSearch(skipFocus) {
  const inp = document.getElementById("navSearchInput");
  const box = document.getElementById("navSearchSuggestions");
  const cl = document.getElementById("navSearchClear");
  if (inp) inp.value = "";
  if (box) {
    box.innerHTML = "";
    box.classList.remove("open");
  }
  if (cl) cl.style.display = "none";
  navShowGenresPanel();
  if (inp && skipFocus !== true) inp.focus();
}

function navLiveSearch(val) {
  const box = document.getElementById("navSearchSuggestions");
  const cl = document.getElementById("navSearchClear");
  if (!box) return;
  if (cl) cl.style.display = val ? "" : "none";

  const q = String(val || "").trim();
  if (!q) {
    box.innerHTML = "";
    box.classList.remove("open");
    navShowGenresPanel();
    return;
  }
  navHideGenresPanel();

  const S = window.CHSearch;
  const matches = S ? S.search(S.getCatalog(), q, "all").slice(0, 8) : [];
  const esc = S ? S.escapeHtml : (x) => x;

  if (!matches.length) {
    box.innerHTML = `<div class="nav-suggestion-empty">No results for "${esc(q)}"</div>`;
    box.classList.add("open");
    return;
  }

  box.innerHTML = matches
    .map((item) => {
      const cleanPrice = (item.price || "").replace(/^From\s*/i, "");
      // print items are now searchable too — label the ones whose title doesn't already say "(Print)"
      const tag =
        item._isPrint && !/\(print\)/i.test(item.title) ? " · Paperback" : "";
      return `<a href="${esc(item.url)}" class="nav-suggestion-item">
      <div class="nav-suggestion-thumb">${item.cover ? `<img src="${esc(item.cover)}" alt="" />` : "📖"}</div>
      <div class="nav-suggestion-text">
        <div class="nav-suggestion-title">${esc(item.title)}</div>
        <div class="nav-suggestion-genre">${esc(item.genre)}${tag}</div>
      </div>
      <div class="nav-suggestion-price">${esc(cleanPrice)}</div>
    </a>`;
    })
    .join("");
  box.classList.add("open");
}

function chBindGenreGridKeyboardNav() {
  const grid = document.getElementById("navGenresGrid");
  if (!grid || grid.dataset.keynavBound === "true") return;
  grid.dataset.keynavBound = "true";
  grid.addEventListener("keydown", (e) => {
    const tiles = Array.from(
      grid.querySelectorAll(".nav-genre-tile:not(.hidden-genre)"),
    );
    const currentIndex = tiles.indexOf(document.activeElement);
    if (currentIndex === -1) return;
    const columns = 2;
    let nextIndex = null;
    if (e.key === "ArrowRight") nextIndex = currentIndex + 1;
    else if (e.key === "ArrowLeft") nextIndex = currentIndex - 1;
    else if (e.key === "ArrowDown") nextIndex = currentIndex + columns;
    else if (e.key === "ArrowUp") nextIndex = currentIndex - columns;
    if (nextIndex !== null && tiles[nextIndex]) {
      e.preventDefault();
      tiles[nextIndex].focus();
    }
  });
}

function chInitGenrePanel() {
  navRenderGenres();
  chBindGenreGridKeyboardNav();
  const input = document.getElementById("navSearchInput");
  if (input) {
    input.addEventListener("input", () => {
      if (input.value.trim().length > 0) navHideGenresPanel();
      else navShowGenresPanel();
    });
  }
}

// Escape only closes the overlay when it is actually open
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  const overlay = document.getElementById("navSearchOverlay");
  if (overlay && overlay.classList.contains("open")) closeNavSearch();
});
document.addEventListener("click", (e) => {
  const bar = document.getElementById("navSiteSearchBar");
  const box = document.getElementById("navSearchSuggestions");
  if (bar && box && !bar.contains(e.target)) box.classList.remove("open");
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", chInitGenrePanel);
} else {
  chInitGenrePanel();
}

/* =====================================================================
   title-engine.js — builds a merged Digital + Print title page from
   window.CH2_CONFIG. Load LAST (after script.js + title-features.js).
   Needs <div id="ch2Root"></div> in <body>.
   ===================================================================== */
(function () {
  const C = window.CH2_CONFIG,
    V = C.vols;
  const N = Object.keys(V)
    .map(Number)
    .sort((a, b) => a - b);
  const MODE = C.mode || "both",
    UNIT = C.unit || "Chapter";
  const S = {
    format: MODE === "print" ? "print" : "digital",
    edition: "standard",
    volume: N[0],
  };
  const $ = (id) => document.getElementById(id);
  const md = (p) => (p == null ? "TBD" : "$" + p);
  const mp = (p) => (p == null ? "TBD" : "$" + p.toFixed(2));
  const q = (s) =>
    String(s)
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "\\'")
      .replace(/"/g, "&quot;");
  const D = (n) => (MODE !== "print" && V[n].d) || null;
  const P = (n) => (MODE !== "digital" && V[n].p) || null;
  const ltdOK = (n) => {
    const p = P(n);
    return !!(p && p.ltd && !p.ltd.out);
  };
  const dLabel = (d) =>
    !d.buy ? "Notify Me" : d.pre ? "Pre-Order Volume" : "Add Full Volume";
  const pLabel = (p) => (p.pre ? "Pre-Order" : "Add to Cart");
  const LK = C.ltdKey || "limited",
    LL = C.ltdLabel || "Limited";
  const edKey = (e) => (e === "limited" ? LK : "standard");
  const vdate = (n) => {
    const v = V[n];
    return (
      (S.format === "print" ? v.pd : v.dd) || v.dd || v.pd || "Available Now"
    );
  };
  const volCover = (n) => (D(n) && D(n).cover) || V[n].cover;
  const HEART =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
  const HEART_ON =
    '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';

  const cover = () => {
    const v = V[S.volume];
    if (S.format === "digital")
      return (D(S.volume) && D(S.volume).cover) || v.cover;
    const p = P(S.volume);
    return (
      (S.edition === "limited" && p.ltd && p.ltd.cover) ||
      p.std.cover ||
      v.cover
    );
  };

  /* ---------------- renderers ---------------- */
  function chPanel(n) {
    const v = V[n],
      d = D(n);
    if (!d) return "";
    let h = `<div id="chVolPanel-${n}"${n === S.volume ? "" : ' style="display:none"'}><div class="ch2-ch-toolbar"><h3>Volume ${n} ${UNIT}s</h3>`;
    if (d.buy && d.chapters && d.was)
      h += `<div class="ch2-ch-bundle">Buy all ${d.chapters.length} for <strong>&nbsp;${md(d.price)}</strong> instead of ${md(d.was)}</div>`;
    h += "</div>";
    if (d.buy && d.chapters) {
      h += d.chapters
        .map((t, i) => {
          const num = i + 1,
            free = num <= (d.free || 1);
          const thumb = (d.thumbs && d.thumbs[i]) || d.cover || v.cover;
          const st = thumb ? ` style="--ch2-ch-cover:url('${thumb}')"` : "";
          return free
            ? `<div class="ch2-chapter free"><div class="ch2-ch-num"${st}><i class="ti ti-lock-open"></i></div><div class="ch2-ch-text"><div class="ch2-ch-title">${t}</div><div class="ch2-ch-badge">Free Preview</div></div><div class="ch2-ch-action"><span class="ch2-ch-price">Free</span><a href="${d.read}" class="ch2-ch-btn read">▶ Read</a></div></div>`
            : `<div class="ch2-chapter"><div class="ch2-ch-num"${st}><i class="ti ti-lock"></i></div><div class="ch2-ch-text"><div class="ch2-ch-title">${t}</div></div><div class="ch2-ch-action"><span class="ch2-ch-price">${mp(d.cp)}</span><button class="ch2-ch-btn buy" onclick="ch2ChBuy(${n},${i})">${C.chapterBuy === "unlock" ? "Unlock" : "Add"}</button></div></div>`;
        })
        .join("");
    } else if (d.full) {
      h += `<div class="ch2-soon-box"><div class="icon"><i class="ti ti-book-2"></i></div><h4>Sold as one full ebook volume</h4><p>Not available chapter by chapter.</p><button class="ch2-notify" onclick="ch2DigitalAction(${n})">${dLabel(d)}</button></div>`;
    } else {
      h += `<div class="ch2-soon-box"><div class="icon"><i class="ti ti-hourglass-high"></i></div><h4>${UNIT}s Coming Soon</h4><p>Serialization will begin once the site goes live.<br>Dates will be updated at launch.</p>${d.buy ? "" : `<button class="ch2-notify" onclick="ch2DigitalAction(${n})"><i class="ti ti-bell"></i> Notify me</button>`}</div>`;
    }
    return h + "</div>";
  }

  function edTab() {
    let h = "";
    N.forEach((n) => {
      const v = V[n],
        d = D(n),
        p = P(n),
        pre = (d && d.pre) || (p && p.pre);
      const when = pre
        ? "Pre-Order · " +
          [
            d ? "Digital " + (v.dd || "TBD") : "",
            p ? "Print " + (v.pd || v.dd || "TBD") : "",
          ]
            .filter(Boolean)
            .join(" · ")
        : "Available Now";
      h += `<div class="ch2-subhead">Volume ${n} <span class="ch2-subnote">(${when})</span></div><div class="ch2-edcards">`;
      if (d)
        h += `<div class="ch2-edcard ${d.pre ? "ltd" : "reg"}"><span class="ec-badge">${d.pre ? v.dd || "Pre-Order" : "Available"}</span><img src="${d.cover || v.cover}" alt="Volume ${n} Digital"><div class="ec-name">Digital</div><div class="ec-price">${md(d.price)}</div><button class="ec-buy" onclick="ch2DigitalAction(${n})">${dLabel(d)}</button></div>`;
      if (p) {
        h += `<div class="ch2-edcard reg"><span class="ec-badge">Standard</span><img src="${p.std.cover || v.cover}" alt="Vol.${n} Standard"><div class="ec-name">${p.std.name || "Paperback"}</div><div class="ec-price">${mp(p.std.price)}</div><button class="ec-buy" onclick="chAddPrintEditionToCart('${q(C.id)}',${n},'standard')">${pLabel(p)}</button></div>`;
        if (p.ltd)
          h += `<div class="ch2-edcard ltd"><span class="ec-badge">${LL}</span><img src="${p.ltd.cover || p.std.cover || v.cover}" alt="Vol.${n} ${LL}"><div class="ec-name" title="${q(p.ltd.name)}">${p.ltd.name}</div><div class="ec-price">${p.ltd.out ? "—" : mp(p.ltd.price)}</div><button class="ec-buy"${p.ltd.out ? " disabled" : ""} onclick="chAddPrintEditionToCart('${q(C.id)}',${n},'${LK}')">${p.ltd.out ? "Out of Stock" : pLabel(p)}</button></div>`;
      }
      h += "</div>";
    });
    const setV = N.filter((n) => P(n) && P(n).std.price != null);
    if (setV.length > 1)
      h += `<div class="ch2-bundle-cta"><div class="bc-info"><div class="bc-icon"><i class="ti ti-gift"></i></div><div><h4>Get the Full Set</h4><p>${setV.length === 2 ? "Vol. " + setV[0] + " + Vol. " + setV[1] : "Vol. " + setV.join(" + ")} · Standard Paperback</p></div></div><button class="bc-btn" onclick="ch2AddSet(event)">Add All <i class="ti ti-arrow-right"></i></button></div>`;
    if (C.bundle && MODE !== "digital") {
      const b = C.bundle;
      h += `<div class="ch2-bundle-cta"><div class="bc-info"><div class="bc-icon"><i class="ti ti-gift"></i></div><div><h4>${b.name}</h4><p>${b.desc} · ${mp(b.price)}</p></div></div><button class="bc-btn" onclick="ch2AddBundle(event)">Add ${b.name.split(" ").pop()} <i class="ti ti-arrow-right"></i></button></div>`;
    }
    h += `<div class="ch2-bundle-cta sub"><div class="bc-info"><div class="bc-icon"><i class="ti ti-crown"></i></div><div><h4>Purchase via Subscription</h4><p>Member benefit · see plans</p></div></div><a class="bc-btn gold" href="subscription.html">View Plans <i class="ti ti-arrow-right"></i></a></div>`;
    return h;
  }

  function retailers() {
    const L = C.links || {};
    const row = (icon, name, url) =>
      url
        ? `<a href="${url}" class="ch2-retailer"${/^https?:/.test(url) ? ' target="_blank" rel="noopener"' : ""}><i class="ti ti-${icon}"></i><div><div class="rt-name">${name}</div></div></a>`
        : `<div class="ch2-retailer soon"><i class="ti ti-${icon}"></i><div><div class="rt-name">${name}</div><div class="rt-status">Coming Soon</div></div></div>`;
    let h = "";
    if (MODE !== "print")
      h += `<div class="ch2-subhead">Digital Platforms</div><div class="ch2-retailer-grid" id="digitalRetailerGrid">${row("heart", "Crossed Hearts", C.page) + row("device-tablet", "Manga Plaza", L.mp) + row("brand-amazon", "Amazon Kindle", L.az) + row("book", "BookWalker", L.bw) + row("brand-apple", "Apple Books", L.ap) + row("device-tablet", "Kobo", L.ko) + row("brand-google-play", "Google Play", L.gp)}</div>`;
    if (MODE !== "digital")
      h += `<div class="ch2-subhead">Print Retailers</div><div class="ch2-retailer-grid" id="printRetailerGrid"></div>`;
    return h;
  }

  /* -------- SEE MORE --------
     Content is authored entirely in CH2_CONFIG as V[n].seeMoreHtml (plain
     HTML, just like `syn`). This function does NOT build or compute any
     of that copy — it only decides which volume's block is shown, the
     same way the cover image swaps on volume change. Edit the actual
     text in the config, not here. */
  function seeMoreBlock(n) {
    const v = V[n];
    const html = v.seeMoreHtml || "";
    return `<div class="ch2-sm-block" data-sm-vol="${n}"${n === N[0] ? "" : ' style="display:none"'}>${html}</div>`;
  }

  function charsSection() {
    return `<div class="ch2-chars"><div class="ch2-chars-label">Characters</div><div class="ch2-char-stage" id="ch2CharStage">
<button class="ch2-char-nav prev" onclick="ch2PrevChar()">‹</button>
${C.characters
  .map(
    (
      ch,
      i,
    ) => `<div class="ch2-char-slide${i === 0 ? " active" : ""}" data-idx="${i}">
  <div class="ch2-char-bg" style="background:${ch.accent || "linear-gradient(135deg,#3a4a63,#8fa3bd)"}"></div>
  <div class="ch2-char-portrait">${ch.image ? `<img src="${ch.image}" alt="${q(ch.name)}">` : ""}</div>
  <div class="ch2-char-card"><div class="ch2-char-name">${ch.name}</div><div class="ch2-char-bio">${ch.bio || ""}</div></div>
</div>`,
  )
  .join("")}
<button class="ch2-char-nav next" onclick="ch2NextChar()">›</button>
</div><div class="ch2-char-dots" id="ch2CharDots"></div></div>`;
  }

  function render() {
    const c1 = V[N[0]];
    const tog = N.length > 1 && (C.mediaSyn || N.every((n) => V[n].syn));
    const tabs = [
      ["overview", "info-circle", "Overview"],
      MODE !== "print" && ["chapters", "book-2", "Read " + UNIT + "s"],
      ["editions", "package", "Buy an Edition"],
      ["retailers", "building-store", "Where To Buy"],
    ].filter(Boolean);
    return `<div class="ch2-page">
<section class="ch2-hero"><div class="ch2-hero-inner"><div class="ch2-crumb"><a href="index.html">Home</a><span class="sep">›</span><a href="${C.crumb[1]}">${C.crumb[0]}</a><span class="sep">›</span><span class="cur">${C.short || C.name}</span></div></div>
<div class="ch2-hero-grid"><div class="ch2-hero-cover"><img src="${cover()}" alt="${q(C.name)}" id="ch2CoverImg"><span class="ch2-fmt-pill" id="ch2FmtPill">Digital</span><button class="ch2-wish" id="wl-${C.id}" data-id="${C.id}" onclick="ch2ToggleWish(event,this)">${HEART}</button></div>
<div class="ch2-hero-info"><h1 class="ch2-hero-title${C.long ? " long" : ""}">${C.title}</h1>
<div class="ch2-hero-author-row"><div class="ch2-hero-author">${C.authors.map((a) => `<div>${a[0]} by <strong>${a[1]}</strong></div>`).join("")}${C.imprint ? `<div>Imprint: <strong>${C.imprint}</strong></div>` : ""}</div></div>
${C.humanTranslated !== false ? `<div class="ch2-trust-line">100% human-translated — no AI/machine translation used</div>` : ""}
<div class="ch2-hero-chips">${C.chips.map((x) => `<span class="ch2-chip">${x}</span>`).join("")}</div>
<button class="ch2-seemore-btn" id="ch2SeeMoreBtn" onclick="ch2ToggleSeeMore()"><span id="ch2SeeMoreLabel">See More</span><i class="ti ti-chevron-down" aria-hidden="true"></i></button>
<div class="ch2-seemore-panel" id="ch2SeeMorePanel">${N.map(seeMoreBlock).join("")}</div>
</div></div></section>
<div class="ch2-body"><div>
<div class="ch2-tabs" role="tablist">${tabs.map((t, i) => `<button class="ch2-tab${i ? "" : " active"}" data-tab="${t[0]}" onclick="ch2SwitchTab('${t[0]}')"><i class="ti ti-${t[1]}"></i><span>${t[2]}</span></button>`).join("")}</div>
<div class="ch2-fmt-banner" id="ch2FmtBanner"></div>
<div class="ch2-tabpanel active" id="ch2Panel-overview">
<div class="ch2-overview-rating"><span class="ch2-overview-stars">☆☆☆☆☆</span><span class="ch2-overview-rating-text">No ratings yet</span><span class="ch2-overview-purchases">0 Purchases</span></div>
<div class="ch2-syn-label">Synopsis</div>
${tog ? `<div class="ch2-syn-toggle">${N.map((n) => `<button class="ch2-syn-btn${n === N[0] ? " active" : ""}" data-syn-vol="${n}" onclick="ch2SwitchSynopsisVolume(${n})">Volume ${n}</button>`).join("")}</div>` : ""}
<p class="ch2-synopsis" id="ch2SynopsisText"></p>
${C.trailer ? `<div class="ch2-trailer"><div class="ch2-trailer-label"><i class="ti ti-movie"></i> Official Trailer</div><div class="ch2-trailer-frame"><video autoplay muted loop playsinline poster="${c1.cover}"><source src="${C.trailer}" type="video/mp4"></video></div></div>` : ""}</div>
${
  MODE !== "print"
    ? `<div class="ch2-tabpanel" id="ch2Panel-chapters"><div class="ch2-vol-scroll">${N.filter(
        D,
      )
        .map(
          (n) =>
            `<button class="ch2-vol-chip${n === N[0] ? " active" : ""}" data-vol="${n}" onclick="ch2SwitchVolume(${n})"><div class="vc-t">Volume ${n}</div><div class="vc-s">${V[n].d.range ? V[n].d.range + " · " : ""}${V[n].dd || "Available Now"}</div></button>`,
        )
        .join("")}</div>${N.map(chPanel).join("")}</div>`
    : ""
}
<div class="ch2-tabpanel" id="ch2Panel-editions">${edTab()}</div>
<div class="ch2-tabpanel" id="ch2Panel-retailers">${retailers()}</div>
</div>
<aside class="ch2-buy-panel">
${MODE === "both" ? `<div class="ch2-seg"><button id="ch2SegDigital" onclick="ch2SwitchFormat('digital')"><i class="ti ti-device-tablet"></i> Digital</button><button id="ch2SegPrint" onclick="ch2SwitchFormat('print')"><i class="ti ti-book"></i> Print</button></div>` : ""}
<div class="ch2-seg-sub" id="ch2SegSub"><button id="ch2EdStandard" onclick="ch2SwitchEdition('standard')">Standard</button><button id="ch2EdLimited" onclick="ch2SwitchEdition('limited')">Limited</button></div>
<div class="ch2-vol-scroll" style="margin-bottom:14px">${N.map((n) => `<button class="ch2-vol-chip" id="ch2PanelVol${n}" onclick="ch2SwitchVolume(${n})"><div class="vc-t">Volume ${n}</div><div class="vc-s" id="ch2PVs${n}"></div></button>`).join("")}</div>
<div class="ch2-price-block"><div class="ch2-price" id="ch2Price"></div><div class="ch2-price-note" id="ch2PriceNote"></div></div>
<button class="ch2-buy-btn" id="ch2PrimaryBuy" onclick="ch2HandlePrimaryBuy()"></button>
${MODE !== "print" ? `<button class="ch2-buy-btn secondary" onclick="ch2SwitchTab('chapters')">Browse ${UNIT}s</button>` : `<button class="ch2-buy-btn secondary" onclick="ch2SwitchTab('editions')">View All Editions</button>`}
<a id="ch2SubBtn" class="ch2-buy-btn sub" href="subscription.html"><i class="ti ti-crown"></i> Purchase via Subscription</a>
<div class="ch2-trust-row"><i class="ti ti-shield-check"></i> <span id="ch2Trust"></span></div>
</aside></div>${C.characters && C.characters.length ? charsSection() : ""}</div>
<div class="ch2-mobile-bar"><div class="mb-price" id="ch2MobilePrice"></div><div class="mb-note" id="ch2MobileNote"></div><button id="ch2MobileBtn" onclick="ch2HandlePrimaryBuy()"></button></div>`;
  }

  /* ---------------- state → UI ---------------- */
  function banner() {
    const d = D(S.volume);
    $("ch2FmtBanner").innerHTML =
      S.format === "digital"
        ? '<i class="ti ti-device-tablet"></i><span>You\'re viewing the <strong>Digital Edition</strong> — ' +
          (d && d.buy ? "read online instantly." : "coming soon.") +
          (MODE === "both"
            ? ' Prefer a physical book? Switch format in the panel <span class="ch2-jump-hint">above / to the right</span>.'
            : " This title is a <strong>digital-only release</strong> and is not currently available in print.") +
          "</span>"
        : '<i class="ti ti-book"></i><span>You\'re viewing the <strong>Print Edition</strong> — a physical paperback. ' +
          (MODE === "both"
            ? "Prefer to read digitally? Switch back to <a onclick=\"ch2SwitchFormat('digital')\">Digital</a>."
            : "This title is a <strong>paperback-only release</strong> and is not currently available in digital.") +
          " Free shipping on orders over $100 USD · 25% off when you buy 3 or more books.</span>";
  }

  function priceBlock() {
    const n = S.volume;
    let price,
      note,
      btn,
      mob,
      off = false;
    if (S.format === "digital") {
      const d = D(n);
      price = md(d.price);
      note =
        d.note ||
        "Volume " +
          n +
          " · Full Volume<br>" +
          (d.buy
            ? d.chapters
              ? "Unlock all " +
                d.chapters.length +
                " " +
                UNIT.toLowerCase() +
                "s"
              : "Full ebook volume"
            : "Coming soon");
      btn = dLabel(d);
      mob = d.buy ? (d.pre ? "Pre-Order" : "Add to Cart") : "Notify Me";
    } else {
      const p = P(n),
        l = S.edition === "limited" ? p.ltd : p.std;
      off = !!l.out;
      price = off ? "—" : mp(l.price);
      note =
        "Volume " +
        n +
        " · " +
        (S.edition === "limited"
          ? LL + " (" + l.name + ")"
          : "Standard Paperback");
      btn = mob = off ? "Out of Stock" : pLabel(p);
    }
    $("ch2Price").textContent = price;
    $("ch2PriceNote").innerHTML = note;
    $("ch2PrimaryBuy").textContent = btn;
    $("ch2PrimaryBuy").disabled = off;
    $("ch2MobilePrice").textContent = price;
    $("ch2MobileNote").innerHTML = note.replace("<br>", " · ");
    $("ch2MobileBtn").textContent = mob;
    $("ch2MobileBtn").disabled = off;
    $("ch2Trust").textContent =
      S.format === "digital"
        ? "Secure checkout · Instant digital delivery"
        : "Secure checkout · Free shipping over $100";
  }

  function ui() {
    const n = S.volume,
      v = V[n],
      print = S.format === "print";
    if (print && S.edition === "limited" && !ltdOK(n)) S.edition = "standard";
    document.body.dataset.format = S.format;
    const sd = $("ch2SegDigital"),
      sp = $("ch2SegPrint");
    if (sd) {
      sd.classList.toggle("active", !print);
      sp.classList.toggle("active", print);
    }
    $("ch2SegSub").classList.toggle("open", print);
    $("ch2EdStandard").classList.toggle("active", S.edition === "standard");
    const L = $("ch2EdLimited"),
      p = P(n);
    L.textContent = LL;
    L.classList.toggle("active", S.edition === "limited");
    L.style.display = p && p.ltd ? "" : "none";
    L.disabled = !ltdOK(n);
    document
      .querySelectorAll(".ch2-vol-chip[data-vol]")
      .forEach((el) => el.classList.toggle("active", +el.dataset.vol === n));
    N.forEach((k) => {
      const c = $("ch2PanelVol" + k);
      if (c) {
        c.classList.toggle("active", k === n);
        $("ch2PVs" + k).textContent = vdate(k);
      }
      const s = $("chVolPanel-" + k);
      if (s) s.style.display = k === n ? "" : "none";
      // Swap which volume's "See More" block is visible — pure
      // show/hide logic; the block's own content comes from the config.
      const sm = document.querySelector(
        '.ch2-sm-block[data-sm-vol="' + k + '"]',
      );
      if (sm) sm.style.display = k === n ? "" : "none";
    });
    if ($("ch2StatPages")) $("ch2StatPages").textContent = v.pages;
    const pill = $("ch2FmtPill");
    pill.textContent = !print
      ? "Digital"
      : S.edition === "limited"
        ? LL
        : "Standard";
    pill.classList.toggle("print", print);
    $("ch2CoverImg").src = cover();
    document.documentElement.style.setProperty(
      "--ch2-ch-cover",
      "url('" + volCover(n) + "')",
    );
    priceBlock();
    banner();
  }

  /* ---------------- handlers (global for inline onclick) ---------------- */
  Object.assign(window, {
    ch2ToggleSeeMore() {
      const o = $("ch2SeeMorePanel").classList.toggle("open");
      $("ch2SeeMoreBtn").classList.toggle("open", o);
      $("ch2SeeMoreLabel").textContent = o ? "See Less" : "See More";
    },
    ch2SwitchTab(t) {
      document
        .querySelectorAll(".ch2-tab")
        .forEach((el) => el.classList.toggle("active", el.dataset.tab === t));
      document
        .querySelectorAll(".ch2-tabpanel")
        .forEach((el) =>
          el.classList.toggle("active", el.id === "ch2Panel-" + t),
        );
      const navH =
        parseInt(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--nav-h",
          ),
        ) || 68;
      window.scrollTo({
        top: document.querySelector(".ch2-tabs").offsetTop - navH - 10,
        behavior: "smooth",
      });
    },
    ch2SwitchSynopsisVolume(n) {
      let h = V[n].syn;
      if (
        !h &&
        typeof CH_TITLE_MEDIA !== "undefined" &&
        CH_TITLE_MEDIA[C.id] &&
        CH_TITLE_MEDIA[C.id].volumes[n]
      )
        h = CH_TITLE_MEDIA[C.id].volumes[n].synopsis;
      if (!h) return;
      $("ch2SynopsisText").innerHTML = h;
      document
        .querySelectorAll(".ch2-syn-btn")
        .forEach((b) => b.classList.toggle("active", +b.dataset.synVol === n));
    },
    ch2SwitchFormat(f) {
      S.format = f;
      ui();
    },
    ch2SwitchEdition(e) {
      S.edition = e;
      ui();
    },
    ch2SwitchVolume(n) {
      S.volume = n;
      ui();
    },
    ch2DigitalAction(n) {
      const d = V[n].d;
      if (!d.buy) chNotifyMe(d.key);
      else
        chAddDigitalToCart(
          d.key,
          "full",
          "Volume " + n + " - Full Volume",
          d.price,
          d.cover || V[n].cover,
        );
    },
    ch2ChBuy(n, i) {
      const d = V[n].d,
        id = (C.cid || "ch") + (i + 1),
        label = UNIT + " " + (i + 1) + " - " + d.chapters[i];
      if (C.chapterBuy === "unlock") initPurchase(d.key, id, label, d.cp);
      else chAddDigitalToCart(d.key, id, label, d.cp, V[n].cover);
    },
    ch2HandlePrimaryBuy() {
      const n = S.volume;
      if (S.format === "digital") return window.ch2DigitalAction(n);
      if (S.edition === "limited" && !ltdOK(n)) return;
      chAddPrintEditionToCart(C.id, n, edKey(S.edition));
    },
    ch2AddSet(e) {
      e.preventDefault();
      N.filter((n) => P(n) && P(n).std.price != null).forEach((n) =>
        chAddPrintToCart({
          sku: "PRINT-" + C.id.toUpperCase() + "-V" + n,
          title: C.name + " Vol." + n,
          edition: "Standard Paperback",
          unitPrice: P(n).std.price,
          coverImageUrl: P(n).std.cover || V[n].cover,
          isPreorder: !!P(n).pre,
        }),
      );
      showToast("All volumes added to cart!", "success");
    },
    ch2AddBundle(e) {
      e.preventDefault();
      const b = C.bundle;
      if (b.fn && typeof window[b.fn] === "function") {
        window[b.fn](C.id);
        return;
      }
      chAddPrintToCart({
        sku: b.sku,
        title: b.title,
        edition: b.name,
        unitPrice: b.price,
        coverImageUrl: b.cover,
        isPreorder: !!b.pre,
      });
      showToast(b.name + " added to cart!", "success");
    },
    ch2ToggleWish(ev, btn) {
      ev.stopPropagation();
      chToggleWishlist(C.id, C.name);
      chUpdateWishlistBtn(C.id, btn);
    },
    toggleTheme() {
      const l = document.body.classList.toggle("light-mode");
      localStorage.setItem("ch-theme", l ? "light" : "dark");
    },
    ch2CharIndex: 0,
    ch2ShowChar(i) {
      const slides = document.querySelectorAll(".ch2-char-slide");
      if (!slides.length) return;
      const idx = (i + slides.length) % slides.length;
      window.ch2CharIndex = idx;
      slides.forEach((s, k) => {
        s.classList.remove("active");
        if (k === idx) {
          const portrait = s.querySelector(".ch2-char-portrait");
          if (portrait) {
            portrait.style.animation = "none";
            void portrait.offsetWidth; // force reflow so animation replays
            portrait.style.animation = "";
          }
          s.classList.add("active");
        }
      });
      document
        .querySelectorAll(".ch2-char-dot")
        .forEach((d, k) => d.classList.toggle("active", k === idx));
    },
    ch2NextChar() {
      window.ch2ShowChar(window.ch2CharIndex + 1);
    },
    ch2PrevChar() {
      window.ch2ShowChar(window.ch2CharIndex - 1);
    },
  });

  /* nav-search fallbacks (only if nav-search.js didn't define them) */
  if (typeof window.openNavSearch !== "function")
    window.openNavSearch = () => {
      $("navSearchOverlay").classList.add("open");
      setTimeout(() => $("navSearchInput").focus(), 80);
    };
  if (typeof window.closeNavSearch !== "function")
    window.closeNavSearch = () => {
      $("navSearchOverlay").classList.remove("open");
      navClearSearch();
    };
  if (typeof window.closeNavSearchIfBg !== "function")
    window.closeNavSearchIfBg = (e) => {
      if (e.target === e.currentTarget) closeNavSearch();
    };
  if (typeof window.navDoSearch !== "function")
    window.navDoSearch = () => {
      const v = $("navSearchInput").value.trim();
      if (v) location.href = "search.html?q=" + encodeURIComponent(v);
    };
  if (typeof window.navClearSearch !== "function")
    window.navClearSearch = () => {
      const i = $("navSearchInput");
      if (i) i.value = "";
      const b = $("navSearchSuggestions");
      if (b) {
        b.innerHTML = "";
        b.classList.remove("open");
      }
      const c = $("navSearchClear");
      if (c) c.style.display = "none";
    };
  if (typeof window.navLiveSearch !== "function")
    window.navLiveSearch = (v) => {
      const c = $("navSearchClear");
      if (c) c.style.display = v ? "" : "none";
    };
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNavSearch();
  });

  /* ---------------- init ---------------- */
  if (localStorage.getItem("ch-theme") === "light")
    document.body.classList.add("light-mode");
  document.head.insertAdjacentHTML(
    "beforeend",
    '<script type="application/ld+json">' +
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BookSeries",
        name: C.name,
        author: C.authors.map((a) => ({ "@type": "Person", name: a[1] })),
        genre: C.chips.join(", "),
        inLanguage: "en",
        publisher: { "@type": "Organization", name: "Crossed Hearts" },
      }) +
      "<\/script>",
  );
  document.documentElement.style.setProperty(
    "--ch2-ch-cover",
    "url('" + volCover(N[0]) + "')",
  );
  $("ch2Root").innerHTML = render();
  const s0 =
    V[N[0]].syn ||
    (typeof CH_TITLE_MEDIA !== "undefined" &&
      CH_TITLE_MEDIA[C.id] &&
      CH_TITLE_MEDIA[C.id].volumes[N[0]] &&
      CH_TITLE_MEDIA[C.id].volumes[N[0]].synopsis) ||
    "";
  $("ch2SynopsisText").innerHTML = s0;

  if (C.characters && C.characters.length) {
    const dotsWrap = $("ch2CharDots");
    if (dotsWrap) {
      C.characters.forEach((_, i) => {
        const d = document.createElement("div");
        d.className = "ch2-char-dot" + (i === 0 ? " active" : "");
        d.onclick = () => window.ch2ShowChar(i);
        dotsWrap.appendChild(d);
      });
    }
  }

  if (C.characters && C.characters.length > 1) {
    let ch2AutoTimer = setInterval(() => window.ch2NextChar(), 4000);
    const stage = $("ch2CharStage");
    if (stage) {
      stage.addEventListener("mouseenter", () => clearInterval(ch2AutoTimer));
      stage.addEventListener("mouseleave", () => {
        ch2AutoTimer = setInterval(() => window.ch2NextChar(), 4000);
      });
    }
  }

  try {
    renderAuthForm("in");
  } catch (e) {}
  if (MODE !== "print") {
    try {
      chInitDigitalVolume(C.id, 1);
    } catch (e) {}
  }
  ["digital", "print"].forEach((k) => {
    if ($(k + "RetailerGrid")) {
      try {
        chRenderRetailers(C.id, k + "RetailerGrid", k);
      } catch (e) {}
    }
  });
  const wl = document.querySelector(".ch2-wish[data-id]");
  try {
    if (wl && chIsWishlisted(C.id)) {
      wl.classList.add("wishlisted");
      wl.innerHTML = HEART_ON;
    }
  } catch (e) {}

  window.addEventListener(
    "scroll",
    function () {
      const b = $("backToTop");
      if (!b) return;
      if (window.scrollY > 400) {
        b.style.display = "flex";
        b.style.opacity = "1";
      } else {
        b.style.opacity = "0";
        setTimeout(() => {
          if (window.scrollY <= 400) b.style.display = "none";
        }, 300);
      }
    },
    { passive: true },
  );

  /* Deep-link: ?format=print&vol=2&edition=limited&tab=editions  (an `edition` param alone = print;
     "special" is treated as "limited") */
  const u = new URLSearchParams(location.search);
  let ed = (u.get("edition") || "").toLowerCase();
  if (ed === "special") ed = "limited";
  const fmt = u.get("format") || (ed ? "print" : null),
    vol = parseInt(u.get("vol"), 10),
    tab =
      u.get("tab") || (ed === "bundle" || ed === "boxset" ? "editions" : null);
  if (V[vol]) S.volume = vol;
  if (fmt === "print" && MODE !== "digital") S.format = "print";
  if (fmt === "digital" && MODE !== "print") S.format = "digital";
  if (ed === "limited" || ed === "standard") S.edition = ed;
  ui();
  if (tab && $("ch2Panel-" + tab)) window.ch2SwitchTab(tab);
})();

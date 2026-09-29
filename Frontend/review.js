const REELS = [
  {
    src: "Videos/reel-YWTC-vol1.mp4",
    handle: "@cassiereads",
    title: "You're Way Too Cheeky, Chigaya-kun · Vol. 1",
    format: "Manga",
  },
  {
    src: "Videos/reel-BGOS-vol1.mp4",
    handle: "@viickyreads",
    title: "Baroness Goes On Strike · Vol. 1 ",
    format: "Manhwa",
  },
  {
    src: "Videos/reel-FKTL-vol1.mp4",
    handle: "@xkokonati",
    title: "From a Knight to a Lady · Vol. 1",
    format: "Manhwa",
  },
  {
    src: "Videos/reel-TAAS-vol1.mp4",
    handle: "@meaxj",
    title: "The Archduke's Adopted Saint · Vol. 1 ",
    format: "Manhwa",
  },
  {
    src: "Videos/reel-BGOS-vol2.mp4",
    handle: "@themangabookshelf",
    title: "Baroness Goes On Strile · Vol. 2 ",
    format: "Manhwa",
  },
  {
    src: "Videos/reel-FKTL-vol2.mp4",
    handle: "@meaxj",
    title: "From Knite to a Lady · Vol. 2 ",
    format: "Manhwa",
  },
];

/* ── State ── */
let activeFilter = "All";
let lightboxIndex = 0;
let unmuteHintTimer = null;

/* ── DOM refs (resolved after DOMContentLoaded) ── */
let grid, lightbox, lightboxVideo, lightboxHandle, lightboxTitle;

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  grid = document.getElementById("reelsGrid");
  lightbox = document.getElementById("reelLightbox");
  lightboxVideo = document.getElementById("lightboxVideo");
  lightboxHandle = document.getElementById("lightboxHandle");
  lightboxTitle = document.getElementById("lightboxTitle");

  renderGrid();
  initFilterChips();
  initScrollReveal();
  initTheme();
  initKeyboardNav();

  // Close lightbox on backdrop click
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
});

/* ============================================================
   RENDER GRID
   ============================================================ */
function renderGrid() {
  const filtered =
    activeFilter === "All"
      ? REELS
      : REELS.filter((r) => r.format === activeFilter);

  grid.innerHTML = "";

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="reels-empty">
        <i class="ti ti-video-off"></i>
        No reels for this format yet — check back soon.
      </div>`;
    return;
  }

  filtered.forEach((reel, i) => {
    const globalIndex = REELS.indexOf(reel);
    const card = document.createElement("div");
    card.className = "reel-card reveal";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute(
      "aria-label",
      `Watch reel by ${reel.handle} — ${reel.title}`,
    );
    card.innerHTML = `
      <video
        src="${reel.src}"
        autoplay
        muted
        loop
        playsinline
        preload="metadata"
      ></video>
      <div class="reel-overlay"></div>
      <div class="reel-format-tag">${reel.format}</div>
      <div class="reel-mute-badge"><i class="ti ti-volume-off"></i></div>
      <div class="reel-play-hint"><i class="ti ti-arrows-maximize"></i></div>
      <div class="reel-info">
        <div class="reel-handle">
          <i class="ti ti-brand-instagram"></i>${reel.handle}
        </div>
        <div class="reel-title">${reel.title}</div>
      </div>
    `;

    card.addEventListener("click", () => openLightbox(globalIndex));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(globalIndex);
      }
    });

    grid.appendChild(card);

    // Staggered reveal delay
    setTimeout(() => card.classList.add("visible"), i * 80);
  });
}

/* ============================================================
   FILTER CHIPS
   ============================================================ */
function initFilterChips() {
  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      activeFilter = chip.dataset.filter;
      document
        .querySelectorAll(".filter-chip")
        .forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      renderGrid();
    });
  });
}

/* ============================================================
   LIGHTBOX
   ============================================================ */
function openLightbox(index) {
  lightboxIndex = index;
  loadLightboxReel(index);
  lightbox.classList.add("open");
  document.body.style.overflow = "hidden";
  showUnmuteHint();
}

function closeLightbox() {
  lightbox.classList.remove("open");
  document.body.style.overflow = "";
  lightboxVideo.pause();
  lightboxVideo.src = "";
  hideUnmuteHint();
}

function loadLightboxReel(index) {
  const reel = REELS[index];
  if (!reel) return;
  lightboxVideo.src = reel.src;
  lightboxVideo.muted = false; // unmuted in lightbox
  lightboxVideo.play().catch(() => {
    // Autoplay with sound blocked — fall back to muted
    lightboxVideo.muted = true;
    lightboxVideo.play();
  });
  lightboxHandle.innerHTML = `<i class="ti ti-brand-instagram"></i>${reel.handle}`;
  lightboxTitle.textContent = reel.title;
}

function lightboxNext() {
  lightboxIndex = (lightboxIndex + 1) % REELS.length;
  loadLightboxReel(lightboxIndex);
}

function lightboxPrev() {
  lightboxIndex = (lightboxIndex - 1 + REELS.length) % REELS.length;
  loadLightboxReel(lightboxIndex);
}

/* ============================================================
   UNMUTE HINT
   ============================================================ */
function showUnmuteHint() {
  const hint = document.getElementById("unmuteHint");
  if (!hint) return;
  hint.classList.add("show");
  clearTimeout(unmuteHintTimer);
  unmuteHintTimer = setTimeout(() => hint.classList.remove("show"), 3000);
}

function hideUnmuteHint() {
  const hint = document.getElementById("unmuteHint");
  if (hint) hint.classList.remove("show");
  clearTimeout(unmuteHintTimer);
}

/* ============================================================
   KEYBOARD NAVIGATION
   ============================================================ */
function initKeyboardNav() {
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") lightboxNext();
    if (e.key === "ArrowLeft") lightboxPrev();
  });
}

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
function initScrollReveal() {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -30px 0px" },
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
}

/* ============================================================
   THEME
   ============================================================ */
function initTheme() {
  if (localStorage.getItem("ch-theme") === "light") {
    document.body.classList.add("light-mode");
  }
}

function toggleTheme() {
  const isLight = document.body.classList.toggle("light-mode");
  localStorage.setItem("ch-theme", isLight ? "light" : "dark");
}

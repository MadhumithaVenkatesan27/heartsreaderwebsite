(function () {
  "use strict";

  // Prevent double-loading if the script tag ends up on the page twice
  if (window.__chChatbotLoaded) return;
  window.__chChatbotLoaded = true;

  /* ---------------------------------------------------------
     API URL (site backend) — only set if the page hasn't
     already defined one.
  --------------------------------------------------------- */
  window.CH_API_URL =
    window.CH_API_URL ||
    (["thecrossedhearts.com", "www.thecrossedhearts.com"].includes(
      window.location.hostname,
    )
      ? "https://crossed-hearts-final.onrender.com/api"
      : window.location.hostname === "crossed-hearts.onrender.com"
        ? "https://crossed-hearts-final.onrender.com/api"
        : ["localhost", "127.0.0.1", ""].includes(window.location.hostname) ||
            window.location.protocol === "file:"
          ? "http://localhost:5000/api"
          : "https://crossed-hearts-final.onrender.com/api");

  /* ---------------------------------------------------------
     STYLES
  --------------------------------------------------------- */
  const CH_STYLE = `
    .ch-chip {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(212, 175, 55, 0.08);
      border: 1px solid rgba(212, 175, 55, 0.2);
      color: rgba(245, 237, 232, 0.8);
      border-radius: 999px;
      padding: 4px 10px;
      font-size: 11px;
      cursor: pointer;
      font-family: "DM Sans", sans-serif;
      transition: background 0.2s;
      white-space: nowrap;
    }
    .ch-chip:hover { background: rgba(212, 175, 55, 0.2); }
    .ch-chip-icon {
      width: 15px; height: 15px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .ch-chip-icon svg {
      width: 15px; height: 15px;
      stroke: #c4647a; stroke-width: 1.8;
      stroke-linecap: round; stroke-linejoin: round;
      fill: none; transition: 0.2s ease;
    }
    .ch-chip:hover .ch-chip-icon svg { stroke: #fff; transform: scale(1.05); }
    .ch-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: rgba(212, 175, 55, 0.6);
      animation: ch-bounce 1.2s infinite ease-in-out;
      display: inline-block;
    }
    .ch-dot:nth-child(2) { animation-delay: 0.2s; }
    .ch-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes ch-bounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-5px); }
    }
    .ch-msg-user {
      max-width: 88%; font-size: 13px; line-height: 1.55;
      padding: 9px 13px; border-radius: 14px; border-bottom-right-radius: 4px;
      background: linear-gradient(135deg, #c4647a, #b84060);
      color: #fff; align-self: flex-end; word-break: break-word;
    }
    .ch-msg-bot {
      max-width: 95%; font-size: 13px; line-height: 1.6;
      padding: 10px 13px; border-radius: 14px; border-bottom-left-radius: 4px;
      background: rgba(255, 255, 255, 0.07); color: #f0e8e3;
      align-self: flex-start; word-break: break-word;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .ch-msg-bot a { color: #d4af37; text-decoration: underline; }
    .ch-book-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(212, 175, 55, 0.2);
      border-radius: 12px; padding: 10px; margin-top: 8px;
      display: flex; gap: 10px; align-items: flex-start;
      text-decoration: none !important; transition: background 0.2s;
    }
    .ch-book-card:hover { background: rgba(212, 175, 55, 0.08); }
    .ch-book-cover {
      width: 52px; height: 72px; border-radius: 6px; object-fit: cover;
      flex-shrink: 0; background: rgba(255, 255, 255, 0.1);
    }
    .ch-book-info { display: flex; flex-direction: column; gap: 3px; flex: 1; }
    .ch-book-title { color: #f5ede8; font-size: 12.5px; font-weight: 600; line-height: 1.3; }
    .ch-book-genre { color: rgba(212, 175, 55, 0.8); font-size: 10px; letter-spacing: 0.8px; text-transform: uppercase; }
    .ch-book-desc { color: rgba(240, 232, 227, 0.65); }
    .ch-book-price { color: #d4af37; font-size: 12px; font-weight: 700; margin-top: 2px; }
    .ch-read-btn {
      display: inline-block; margin-top: 5px; padding: 4px 10px; border-radius: 999px;
      background: linear-gradient(135deg, #c4647a, #b84060); color: #fff;
      font-size: 10px; font-weight: 600; text-decoration: none; letter-spacing: 0.3px;
    }
    #ch-messages::-webkit-scrollbar { width: 4px; }
    #ch-messages::-webkit-scrollbar-track { background: transparent; }
    #ch-messages::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.12); border-radius: 2px; }
    .ch-logo-dark, .ch-logo-light { width: 22px; height: 22px; object-fit: contain; }
    .ch-logo-light { display: none; }
    body.light-mode .ch-logo-dark { display: none; }
    body.light-mode .ch-logo-light { display: inline-block; }
    .ch-quiz-option {
      appearance: none; -webkit-appearance: none; -moz-appearance: none;
      display: block; width: 100%; text-align: left;
      background: rgba(212, 175, 55, 0.08) !important;
      border: 1px solid rgba(212, 175, 55, 0.3) !important;
      color: #f5ede8 !important; border-radius: 10px; padding: 9px 12px;
      font-size: 12.5px; font-family: "DM Sans", sans-serif; cursor: pointer;
      margin-top: 6px; outline: none; box-shadow: none;
      transition: background 0.2s, border-color 0.2s, transform 0.15s;
    }
    .ch-quiz-option:hover {
      background: rgba(212, 175, 55, 0.2) !important;
      border-color: rgba(212, 175, 55, 0.55) !important;
      transform: translateX(2px);
    }
    .ch-quiz-option:focus, .ch-quiz-option:active {
      background: rgba(212, 175, 55, 0.15) !important; outline: none;
    }
    .ch-quiz-option:disabled {
      opacity: 0.4; cursor: default; transform: none;
      background: rgba(212, 175, 55, 0.08) !important;
      color: rgba(245, 237, 232, 0.5) !important;
    }
    .ch-quiz-progress { display: flex; gap: 4px; margin-bottom: 8px; }
    .ch-quiz-progress span {
      height: 3px; flex: 1; border-radius: 2px;
      background: rgba(255, 255, 255, 0.1); transition: background 0.3s;
    }
    .ch-quiz-progress span.done { background: #c4647a; }

    /* ── HEADER ── */
    .ch-header { background: linear-gradient(135deg,#1e0a12,#3d1420); }
    .ch-header-title { color: #f5ede8; }
    .ch-header-sub { color: rgba(245,237,232,0.5); }
    .ch-close-btn { background: rgba(255,255,255,0.08); color: rgba(245,237,232,0.7); }
    body.light-mode .ch-header { background: linear-gradient(135deg,#fce8f0,#f5dce8); }
    body.light-mode .ch-header-title { color: #1a1208; }
    body.light-mode .ch-header-sub { color: rgba(26,18,8,0.6); }
    body.light-mode .ch-close-btn { background: rgba(0,0,0,0.06); color: #1a1208; }

    /* ── TILES (help menu + category menu) ── */
    .ch-tile {
      cursor: pointer; display: flex; align-items: center; gap: 10px;
      background: rgba(255,255,255,0.04); border: 1px solid rgba(212,175,55,0.15);
      border-radius: 10px; padding: 9px 12px; margin-top: 6px;
      transition: background 0.2s, border-color 0.2s;
    }
    .ch-tile:hover { background: rgba(212,175,55,0.1); }
    .ch-tile i { font-size: 16px; color: #d4af37; flex-shrink: 0; }
    .ch-tile span { font-size: 12.5px; color: #f5ede8; }
    body.light-mode .ch-tile { background: #ffffff; border-color: rgba(178,13,52,0.18); }
    body.light-mode .ch-tile:hover { background: rgba(178,13,52,0.06); }
    body.light-mode .ch-tile i { color: #b20d34; }
    body.light-mode .ch-tile span { color: #1a1208; }

    /* ── CHATBOT LIGHT MODE ── */
    body.light-mode #ch-chat-panel { border-color: rgba(178,13,52,0.18); }
    body.light-mode #ch-chips { background: #ffffff !important; border-bottom-color: rgba(178,13,52,0.12) !important; }
    body.light-mode .ch-chip { background: rgba(178,13,52,0.06); border-color: rgba(178,13,52,0.2); color: #3d3020; }
    body.light-mode .ch-chip:hover { background: rgba(178,13,52,0.14); }
    body.light-mode .ch-chip-icon svg { stroke: #b20d34; }
    body.light-mode .ch-chip:hover .ch-chip-icon svg { stroke: #fff; }
    body.light-mode #ch-messages { background: #ffffff !important; }
    body.light-mode #ch-typing { background: #ffffff !important; }
    body.light-mode #ch-typing > div { background: rgba(178,13,52,0.08) !important; }
    body.light-mode .ch-dot { background: rgba(178,13,52,0.5) !important; }
    body.light-mode .ch-msg-bot { background: rgba(178,13,52,0.05); border-color: rgba(178,13,52,0.12); color: #1a1208; }
    body.light-mode .ch-msg-bot a { color: #b20d34; }
    body.light-mode .ch-book-card { background: #ffffff; border-color: rgba(178,13,52,0.18); }
    body.light-mode .ch-book-card:hover { background: rgba(178,13,52,0.05); }
    body.light-mode .ch-book-title { color: #1a1208; }
    body.light-mode .ch-book-genre { color: #b20d34; }
    body.light-mode .ch-book-desc { color: #6b5e4e; }
    body.light-mode .ch-footer { background: #ffffff !important; border-top-color: rgba(178,13,52,0.12) !important; }
    body.light-mode #ch-input { background: #f5f1eb !important; border-color: rgba(178,13,52,0.2) !important; color: #1a1208 !important; }
    body.light-mode #ch-input::placeholder { color: #6b5e4e; }
    body.light-mode .ch-quiz-option { background: rgba(178,13,52,0.06) !important; border-color: rgba(178,13,52,0.25) !important; color: #1a1208 !important; }
    body.light-mode .ch-quiz-option:hover { background: rgba(178,13,52,0.14) !important; border-color: rgba(178,13,52,0.5) !important; }
    body.light-mode .ch-quiz-progress span { background: rgba(0,0,0,0.08); }
    body.light-mode .ch-quiz-progress span.done { background: #b20d34; }
  `;

  const styleEl = document.createElement("style");
  styleEl.id = "ch-chatbot-style";
  styleEl.textContent = CH_STYLE;
  document.head.appendChild(styleEl);

  /* ---------------------------------------------------------
     MARKUP — bubble button, chat panel, help contact modal
  --------------------------------------------------------- */
  const CH_HTML = `
    <button
      id="ch-chat-btn"
      onclick="chChatOpen()"
      aria-label="Open chat assistant"
      style="position:fixed;bottom:28px;right:28px;z-index:9000;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#c4647a,#b84060);border:none;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;transition:transform 0.2s ease;"
      onmouseenter="this.style.transform='scale(1.1)'"
      onmouseleave="this.style.transform='scale(1)'"
    >
      <i class="ti ti-message-circle" style="font-size:24px;color:#fff" aria-hidden="true"></i>
    </button>

    <div id="ch-chat-panel" style="display:none;position:fixed;bottom:96px;right:28px;z-index:9000;width:360px;max-width:calc(100vw - 40px);border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.6);font-family:'DM Sans',sans-serif;border:1px solid rgba(255,255,255,0.1);flex-direction:column;">
      <div class="ch-header" style="padding:16px 18px;display:flex;align-items:center;gap:12px;flex-shrink:0;">
        <img src="Images/logo-dark.png" alt="Crossed Hearts" class="ch-logo-dark" style="width:34px;height:34px;object-fit:contain;flex-shrink:0;">
        <img src="Images/logo-light.png" alt="Crossed Hearts" class="ch-logo-light" style="width:34px;height:34px;object-fit:contain;flex-shrink:0;">
        <div style="flex:1;">
          <div class="ch-header-title" style="font-weight:600;font-size:14px;">Crossed Hearts Assistant</div>
          <div class="ch-header-sub" style="font-size:11px;letter-spacing:0.4px;">Reading guide &amp; support</div>
        </div>
        <button onclick="chChatClose()" aria-label="Close chat" class="ch-close-btn" style="border:none;cursor:pointer;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;">
          <i class="ti ti-x" style="font-size:16px" aria-hidden="true"></i>
        </button>
      </div>

      <div id="ch-chips" style="background:#0e0409;padding:12px 12px 8px;display:flex;flex-wrap:wrap;gap:8px;flex-shrink:0;border-bottom:1px solid rgba(255,255,255,0.06);">
        <button class="ch-chip" onclick="chSend('Recommend something for me')">
          <span class="ch-chip-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3L14.8 8.6L21 9.5L16.5 13.8L17.6 20L12 17L6.4 20L7.5 13.8L3 9.5L9.2 8.6L12 3Z"/></svg></span>
          Recommend
        </button>
        <button class="ch-chip" onclick="chShowGenreMenu()">
          <span class="ch-chip-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M5 4H19V20H5V4Z"/><path d="M9 8H15"/><path d="M9 12H15"/><path d="M9 16H13"/></svg></span>
          Genre
        </button>
        <button class="ch-chip" onclick="chShowCategoryMenu()">
          <span class="ch-chip-icon"><svg viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/></svg></span>
          Category
        </button>
        <button class="ch-chip" onclick="chSend('Tell me about digital editions')">
          <span class="ch-chip-icon"><svg viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8H16"/><path d="M8 12H16"/><path d="M8 16H12"/></svg></span>
          Digital
        </button>
        <button class="ch-chip" onclick="chSend('Tell me about print editions')">
          <span class="ch-chip-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M7 8V4H17V8"/><path d="M6 18H18V14H6V18Z"/><path d="M5 8H19V14H5V8Z"/></svg></span>
          Print
        </button>
        <button class="ch-chip" onclick="chSend('What is My Library?')">
          <span class="ch-chip-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M6 4H18V20H6V4Z"/><path d="M9 4V20"/></svg></span>
          My Library
        </button>
        <button class="ch-chip" onclick="chStartMoodQuiz()">
          <span class="ch-chip-icon"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg></span>
          Find My Match
        </button>
        <button class="ch-chip" onclick="chShowHelpMenu()">
          <span class="ch-chip-icon"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5"/><circle cx="12" cy="16.5" r="0.5" fill="currentColor"/></svg></span>
          Help & Support
        </button>
      </div>

      <div id="ch-messages" style="background:#0e0409;height:320px;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth;flex-shrink:0;"></div>

      <div id="ch-typing" style="display:none;background:#0e0409;padding:4px 14px 8px;flex-shrink:0;">
        <div style="display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,0.06);border-radius:12px;padding:8px 12px;">
          <span class="ch-dot"></span><span class="ch-dot"></span><span class="ch-dot"></span>
        </div>
      </div>

      <div class="ch-footer" style="background:#150710;padding:12px 14px;display:flex;gap:8px;align-items:center;border-top:1px solid rgba(255,255,255,0.07);flex-shrink:0;">
        <input id="ch-input" type="text" placeholder="Ask me anything…" onkeydown="if (event.key === 'Enter') chSend();" style="flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:9px 13px;color:#f5ede8;font-size:13px;font-family:'DM Sans',sans-serif;outline:none;">
        <button onclick="chSend()" aria-label="Send message" style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#c4647a,#b84060);border:none;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;">
          <i class="ti ti-send" style="font-size:16px;color:#fff" aria-hidden="true"></i>
        </button>
      </div>
    </div>

    <div class="modal-overlay" id="helpContactOverlay" onclick="closeHelpContactIfBg(event)">
      <div class="modal" style="max-width:440px">
        <button class="modal-x" onclick="closeHelpContact()" aria-label="Close">
          <i class="ti ti-x" aria-hidden="true"></i>
        </button>
        <div class="modal-title">Contact Support</div>
        <div class="modal-sub" id="helpContactSub">We'll get back to you within 24 hours</div>
        <form id="helpContactForm" onsubmit="submitHelpContact(event)" style="display:flex;flex-direction:column;gap:12px;margin-top:16px;">
          <select id="hcCategory" required style="padding:11px 13px;border-radius:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#f5ede8;font-family:'DM Sans',sans-serif;font-size:13px;">
            <option value="">Select a category…</option>
            <option value="Reading Issues">Reading Issues</option>
            <option value="Payments & Refunds">Payments & Refunds</option>
            <option value="Physical Orders">Physical Orders</option>
            <option value="Account & Login">Account & Login</option>
            <option value="Digital Library">Digital Library</option>
            <option value="Technical Issues">Technical Issues</option>
            <option value="General">General / Other</option>
          </select>
          <input type="text" id="hcName" placeholder="Your name" required style="padding:11px 13px;border-radius:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#f5ede8;font-family:'DM Sans',sans-serif;font-size:13px;">
          <input type="email" id="hcEmail" placeholder="Your email" required style="padding:11px 13px;border-radius:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#f5ede8;font-family:'DM Sans',sans-serif;font-size:13px;">
          <textarea id="hcMessage" rows="4" placeholder="Tell us what's going on…" required style="padding:11px 13px;border-radius:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#f5ede8;font-family:'DM Sans',sans-serif;font-size:13px;resize:vertical;"></textarea>
          <button type="submit" class="btn-gold" style="margin-top:4px">Send Message</button>
          <div id="hcStatus" style="font-size:12px;text-align:center;color:rgba(245,237,232,0.6);"></div>
        </form>
      </div>
    </div>
  `;

  const mount = document.createElement("div");
  mount.id = "ch-chatbot-root";
  mount.innerHTML = CH_HTML;
  document.body.appendChild(mount);

  /* ---------------------------------------------------------
     DATA — full corrected catalogue (source: alltitles.html)
  --------------------------------------------------------- */
  const CH_BOOKS = [
    {
      id: "chigaya",
      name: "You're Way Too Cheeky, Chigaya-kun!",
      cat: "Manga",
      genre: "Romance · School Life · Shoujo",
      tags: ["romance", "school", "shoujo", "sweet", "cute", "school life"],
      image: "Images/Chigaya-vol 1.png",
      href: "chigaya.html",
      price: 0.99,
      vols: 2,
      desc: "A swoony school romance — Chigaya is dangerously charming and impossible to ignore. Perfect if you want butterflies and school-day tension.",
    },
    {
      id: "grenimal",
      name: "The Executioner of Grenimal",
      cat: "Manga",
      genre: "Action · Mystery · Thriller",
      tags: [
        "action",
        "fantasy",
        "mystery",
        "dark",
        "adventure",
        "strong lead",
      ],
      image: "Images/Grenimal-vol 1.png",
      href: "executioner.html",
      price: 0.99,
      vols: 2,
      desc: "In a kingdom of shadows, one executioner carries secrets that could topple a throne. Great for fans of dark fantasy and political intrigue.",
    },
    {
      id: "matchmaker",
      name: "The Matchmaker's Fiancé",
      cat: "Manga",
      genre: "Romance · Fantasy · Comedy",
      tags: ["romance", "fantasy", "comedy", "funny", "light", "cute"],
      image: "Images/Matchmaker-vol 1.png",
      href: "matchmaker.html",
      price: 0.99,
      vols: 1,
      desc: "She arranges love for everyone else — so why is she now engaged to the most infuriating man at court? A fun, breezy fantasy romance.",
    },
    {
      id: "connie",
      name: "All-Rounder Maid Connie Wille",
      cat: "Manga",
      genre: "Romance · Fantasy · Josei",
      tags: ["romance", "fantasy", "josei", "maid", "action", "strong heroine"],
      image: "Images/Connie-vol 1.png",
      href: "allrounder.html",
      price: 0.99,
      vols: 2,
      desc: "She can cook, fight, and spy — falling for her lord was never in the job description. A josei gem with a lovable, capable heroine.",
    },
    {
      id: "octopiece",
      name: "Octopiece",
      cat: "Manga",
      genre: "Action · Fantasy · Adventure",
      tags: [
        "action",
        "fantasy",
        "adventure",
        "supernatural",
        "dark fantasy",
        "military",
      ],
      image: "Images/Octopiece-vol1.png",
      href: "octopiece.html",
      price: 0.99,
      vols: 1,
      desc: "On the remote island nation of Arakam, a soldier and a mysterious wandering boy are drawn into a story that blurs conviction and madness.",
    },
    {
      id: "borrowing",
      name: "Borrowing Your Textbook 175160",
      cat: "Glam Beat",
      genre: "Girls' Love · High School · Romance",
      tags: ["yuri", "romance", "school", "cute", "sweet", "gl", "girls love"],
      image: "Images/Borrowing-ch1.png",
      href: "borrowing.html",
      price: 0.99,
      vols: 1,
      desc: "A quiet yuri romance that blooms over borrowed books and stolen glances. Tender, gentle, and absolutely heartwarming.",
    },
    {
      id: "timecloset",
      name: "Time is a Closet",
      cat: "Glam Beat",
      genre: "Girls' Love · Fantasy · Mystery",
      tags: [
        "yuri",
        "fantasy",
        "mystery",
        "supernatural",
        "gl",
        "girls love",
        "time",
      ],
      image: "Images/Time-ch1.png",
      href: "timeisa.html",
      price: 0.99,
      vols: 1,
      desc: "A time-bending supernatural mystery with a tender yuri heart. For readers who love their romance wrapped in intrigue.",
    },
    {
      id: "afternoontea",
      name: "Afternoon Tea for Two",
      cat: "Glam Beat",
      genre: "Girls' Love · Fantasy · Mystery",
      tags: [
        "yuri",
        "slice of life",
        "cozy",
        "relaxing",
        "sweet",
        "gl",
        "girls love",
        "soft",
      ],
      image: "Images/Afternoon-ch1.png",
      href: "afternoon.html",
      price: 0.99,
      vols: 1,
      desc: "Gentle and warm — two women finding their way to each other over afternoon tea. The coziest read in the catalogue.",
    },
    {
      id: "zombie",
      name: "The Abandoned Villainess Became a Zombie",
      cat: "Novel",
      genre: "Fantasy · Comedy · Horror",
      tags: [
        "fantasy",
        "comedy",
        "horror",
        "villainess",
        "funny",
        "isekai",
        "dark comedy",
      ],
      image: "Images/Zombie-vol1.png",
      href: "abandonedvillainess.html",
      price: 0.5,
      vols: 2,
      desc: "Betrayed and left for dead, she came back undead, fabulous, and impossible to kill. Hilarious dark comedy fantasy.",
    },
    {
      id: "raeliana",
      name: "Why Raeliana Ended Up at the Duke's Mansion",
      cat: "Novel",
      genre: "Romance · Fantasy · Isakai",
      tags: [
        "romance",
        "fantasy",
        "isekai",
        "duke",
        "reincarnation",
        "slow burn",
      ],
      image: "Images/Whyraeliana-vol1.png",
      href: "whyraeliana.html",
      price: 0.99,
      vols: 2,
      desc: "A reincarnated woman strikes a dangerous deal with an ice-cold duke — feelings complicate everything. A fan-favourite romance novel.",
    },
    {
      id: "gaze",
      name: "A Gaze Like Lightning",
      cat: "blushclub",
      genre: "Boys' Love · School Life · Romance",
      tags: ["bl", "boys love"],
      image: "Images/Gaze.png",
      href: "gaze.html",
      price: 7.0,
      vols: 1,
      desc: "A school life BL drama about two boys whose eyes meet and everything changes.",
    },
    {
      id: "until",
      name: "Until We Fall In Love",
      cat: "blushclub",
      genre: "Boys' Love · Drama · Romance",
      tags: ["bl", "boys love"],
      image: "Images/Until.png",
      href: "until.html",
      price: 7.0,
      vols: 1,
      desc: "A supernatural BL romance where two men find each other against all odds.",
    },
    {
      id: "theking",
      name: "The King Of Owls And His Troubled Servant",
      cat: "blushclub",
      genre: "Boys' Love · Fantasy · Romance",
      tags: ["bl", "boys love"],
      image: "Images/The King.jpeg",
      href: "theking.html",
      price: 7.0,
      vols: 1,
      desc: "A historical fantasy BL about a king and his complicated servant.",
    },
    {
      id: "thebird",
      name: "The Bird In The Cage Dreams",
      cat: "blushclub",
      genre: "Boys' Love · Romance · Supernatural",
      tags: ["bl", "boys love"],
      image: "Images/The Bird.png",
      href: "thebird.html",
      price: 7.0,
      vols: 1,
      desc: "Betrayed and left for dead, she came back — just not quite the way anyone expected.",
    },
    {
      id: "lovebeyond",
      name: "Love Beyond the Final Boss: The Hero Party's Quest for Love",
      cat: "Manga",
      genre: "Fantasy · Romance · Comedy",
      tags: ["fantasy", "romance", "comedy", "funny", "isekai", "hero"],
      image: "Images/Love beyond the final boss.jpeg",
      href: "loveBeyond.html",
      price: 12.99,
      vols: 1,
      desc: "The world's already saved — now the strongest hero has to survive the other heroes' romantic chaos. Silly, sweet, and self-aware.",
    },
    {
      id: "twoofus",
      name: "Two of Us Can't Stay Mobs!",
      cat: "Manga",
      genre: "Fantasy · Romance · Comedy",
      tags: ["fantasy", "romance", "comedy", "funny", "school", "cute"],
      image: "Images/Mobs Updated Cover Page.png",
      href: "twoOfUs.html",
      price: 12.99,
      vols: 1,
      desc: "Two impossibly unforgettable classmates just want to be ordinary. Fate has other plans. Light, funny, and full of charm.",
    },
    {
      id: "emma",
      name: "Emma and the Eyes That Bid Farewell",
      cat: "Manga",
      genre: "Fantasy · Drama · Shoujo",
      tags: ["fantasy", "drama", "shoujo", "academy", "mystery"],
      image: "Images/emma and the eyes cover page.png",
      href: "emma.html",
      price: 12.99,
      vols: 1,
      desc: "A girl who can't use magic uncovers a deadly conspiracy at the Royal Academy. Tense, emotional academy fantasy.",
    },
    {
      id: "inksoaked",
      name: "Ink Soaked into Ashen Paper",
      cat: "Glam Beat",
      genre: "Girls' Love · Fantasy · Drama",
      tags: ["yuri", "girls love", "gl", "fantasy", "drama", "royalty"],
      image: "Images/Ink Soaked Into Ashen Paper Cover.png",
      href: "inkSoaked.html",
      price: 23.99,
      vols: 1,
      desc: "A princess sent to marry her kingdom's greatest enemy begins a history-making same-sex royal union. Sweeping political GL.",
    },
    {
      id: "devilinme",
      name: "The Devil in Me",
      cat: "Glam Beat",
      genre: "Girls' Love · Supernatural · Drama",
      tags: ["yuri", "girls love", "gl", "supernatural", "drama", "emotional"],
      image: "Images/Devil in me.png",
      href: "devilInMe.html",
      price: 12.99,
      vols: 1,
      desc: "A priestess and a vampire, both broken by hope's absence, find refuge in one another. Moody, tender, and haunting.",
    },
    {
      id: "fairytrap",
      name: "Fairy Trap",
      cat: "blushclub",
      genre: "Boys' Love · Fantasy · Romance",
      tags: ["bl", "yaoi", "boys love", "fantasy", "romance", "dreamlike"],
      image: "Images/Fairy Trap Cover.png",
      href: "fairyTrap.html",
      price: 23.99,
      vols: 1,
      desc: "A boy who sleeps twenty-two hours a day discovers his dreams open a door to another world. Dreamy, romantic BL fantasy.",
    },
    {
      id: "addictedtoyou",
      name: "Addicted to You",
      cat: "blushclub",
      genre: "Boys' Love · Romance · Drama",
      tags: ["bl", "yaoi", "boys love", "romance", "drama", "reincarnation"],
      image: "Images/Addicted To You Cover.png",
      href: "addictedToYou.html",
      price: 12.99,
      vols: 1,
      desc: "At the boundary between angels and humans, an old bond collides with a rekindled connection. Angsty, emotional BL.",
    },
    {
      id: "flirting",
      name: "Flirting with the Villain's Dad",
      cat: "Manhwa",
      genre: "Romance · Drama",
      tags: ["romance", "drama", "manhwa", "villain", "reincarnation", "funny"],
      image: "Images/Flirting with villains dad.png",
      href: "flirting.html",
      price: 20.99,
      vols: 1,
      desc: "Reborn twenty years early, a princess sets out to seduce the villain's father before the story begins. Bold and hilarious.",
    },
    {
      id: "rosemanor",
      name: "Welcome to Rose Manor",
      cat: "Manhwa",
      genre: "Romance · Fantasy",
      tags: ["romance", "fantasy", "manhwa", "gothic", "mystery"],
      image: "Images/Welcome to the rose manor.jpeg",
      href: "rosemanor.html",
      price: 20.99,
      vols: 1,
      desc: "One year, one manor, one set of rules never to be broken. Gothic romance with a mystery that keeps you guessing.",
    },
    {
      id: "whereseameetshore",
      name: "Where the Sea Meets Shore",
      cat: "Creator Original",
      genre: "Romance · Fantasy · Drama",
      tags: ["romance", "fantasy", "drama", "mermaid", "bittersweet"],
      image: "Images/Where Sea Meets Shore Cover.png",
      href: "whereseameetshore.html",
      price: 2.99,
      vols: 1,
      desc: "A photographer falls for a mermaid trapped behind aquarium glass. Quiet, bittersweet, and beautifully written.",
    },
    {
      id: "kissbefore",
      name: "A Kiss Before the Gunshot",
      cat: "Studio Hearts",
      genre: "Girls' Love · Mystery · Drama",
      tags: ["yuri", "girls love", "gl", "mystery", "drama", "assassin"],
      image: "Images/A kiss before gunshor cover .jpeg",
      href: "kissbefore.html",
      price: 14.99,
      vols: 1,
      desc: "An assassin sent to infiltrate a palace becomes bodyguard to the princess she was sent to betray. Tense, romantic thriller.",
    },
    {
      id: "doomsday",
      name: "Doomsday Requiem With You",
      cat: "Studio Hearts",
      genre: "Shoujo · Romance · Fantasy · Mystery",
      tags: ["fantasy", "romance", "mystery", "shoujo", "curses", "epic"],
      image: "Images/Doomsday cover.png",
      href: "doomsday.html",
      price: 23.99,
      vols: 1,
      desc: "Branded Blessingless her whole life, Cellestia fights to break twelve curses before an ancient calamity returns. Epic fantasy.",
    },
    {
      id: "chiaroscuro",
      name: "Chiaroscuro",
      cat: "Studio Hearts",
      genre: "Romance · Fantasy · Drama",
      tags: ["romance", "fantasy", "drama", "atmospheric", "forbidden"],
      image: "Images/Chairoscuro Cover.png",
      href: "chiaroscuro.html",
      price: 12.99,
      vols: 1,
      desc: "A princess raised to save the world from an endless night hears a melody that leads her somewhere forbidden. Lush and atmospheric.",
    },
    {
      id: "soulguiders",
      name: "Soul Guiders",
      cat: "Studio Hearts",
      genre: "Shounen · Fantasy · Action · Mystery · Romance",
      tags: ["action", "fantasy", "mystery", "romance", "adventure"],
      image: "Images/Soul guiders.png",
      href: "soulguiders.html",
      price: 23.99,
      vols: 1,
      desc: "A princess and a rule-breaking demon vice-commander race to recover a relic before it plunges the world into chaos. Fast-paced action fantasy.",
    },
  ];

  const CH_INTENTS = [
    {
      match: (w) =>
        has(w, [
          "recommend",
          "suggest",
          "what should",
          "help me find",
          "find me",
          "not sure",
          "don't know",
          "dont know",
          "pick",
          "choose",
          "something good",
          "what to read",
        ]),
      reply: "recommend_general",
    },
    {
      match: (w) =>
        has(w, ["romance", "romantic", "love story", "love stories", "love"]),
      reply: "genre",
      genre: "romance",
    },
    {
      match: (w) =>
        has(w, ["fantasy", "magic", "kingdom", "isekai", "another world"]),
      reply: "genre",
      genre: "fantasy",
    },
    {
      match: (w) => has(w, ["action", "adventure", "fight", "battle"]),
      reply: "genre",
      genre: "action",
    },
    {
      match: (w) => has(w, ["mystery", "thriller", "suspense", "intrigue"]),
      reply: "genre",
      genre: "mystery",
    },
    {
      match: (w) =>
        has(w, [
          "comedy",
          "funny",
          "hilarious",
          "humor",
          "humour",
          "lighthearted",
          "light hearted",
        ]),
      reply: "genre",
      genre: "comedy",
    },
    {
      match: (w) =>
        has(w, [
          "yuri",
          "girls love",
          "gl",
          "lesbian",
          "women loving",
          "glam beat",
          "glambeat",
        ]),
      reply: "imprint_glambeat",
    },
    {
      match: (w) =>
        has(w, ["bl", "boys love", "yaoi", "blush club", "blushclub"]),
      reply: "imprint_blushclub",
    },
    {
      match: (w) => has(w, ["a novel press", "novel press"]),
      reply: "imprint_novelpress",
    },
    { match: (w) => has(w, ["studio hearts"]), reply: "imprint_studiohearts" },
    {
      match: (w) => has(w, ["creator original"]),
      reply: "imprint_creatororiginal",
    },
    { match: (w) => has(w, ["lily house"]), reply: "imprint_lilyhouse" },
    {
      match: (w) => has(w, ["digital", "digital edition", "digital editions"]),
      reply: "faq_digital",
    },
    {
      match: (w) =>
        has(w, ["school", "academy", "student", "classroom", "dorm"]),
      reply: "genre",
      genre: "school",
    },
    {
      match: (w) =>
        has(w, ["historical", "period", "ancient", "samurai", "feudal"]),
      reply: "genre",
      genre: "historical",
    },
    {
      match: (w) => has(w, ["horror", "scary", "dark", "creepy", "spooky"]),
      reply: "genre",
      genre: "horror",
    },
    {
      match: (w) =>
        has(w, ["slow burn", "slow-burn", "slowburn", "patient", "build up"]),
      reply: "genre",
      genre: "slow burn",
    },
    {
      match: (w) =>
        has(w, [
          "cozy",
          "cosy",
          "relaxing",
          "wholesome",
          "fluffy",
          "soft",
          "warm",
        ]),
      reply: "genre",
      genre: "cozy",
    },
    { match: (w) => has(w, ["manga", "manhwa"]), reply: "cat", cat: "Manga" },
    {
      match: (w) => has(w, ["novel", "light novel", "book"]),
      reply: "cat",
      cat: "Novel",
    },
    {
      match: (w) =>
        has(w, [
          "genre",
          "type",
          "category",
          "categories",
          "what do you have",
          "what genres",
        ]),
      reply: "genres_list",
    },
    {
      match: (w) =>
        has(w, [
          "my library",
          "library",
          "purchased",
          "access",
          "where",
          "find my",
          "find my book",
        ]),
      reply: "faq_library",
    },
    {
      match: (w) =>
        has(w, [
          "print",
          "physical",
          "hardcopy",
          "paperback",
          "hard copy",
          "printed",
        ]),
      reply: "faq_print",
    },
    {
      match: (w) =>
        has(w, [
          "kickstarter",
          "campaign",
          "crowdfund",
          "collector",
          "special edition",
        ]),
      reply: "faq_kickstarter",
    },
    {
      match: (w) =>
        has(w, [
          "account",
          "sign in",
          "login",
          "sign up",
          "register",
          "create account",
        ]),
      reply: "faq_account",
    },
    {
      match: (w) => has(w, ["chapter", "volume", "how many", "volumes"]),
      reply: "faq_volumes",
    },
    {
      match: (w) =>
        has(w, [
          "hi",
          "hello",
          "hey",
          "hiya",
          "sup",
          "good morning",
          "good evening",
          "howdy",
        ]),
      reply: "greeting",
    },
    {
      match: (w) =>
        has(w, [
          "thank",
          "thanks",
          "thank you",
          "cheers",
          "great",
          "awesome",
          "perfect",
        ]),
      reply: "thanks",
    },
    {
      match: (w) =>
        has(w, [
          "all titles",
          "everything",
          "full list",
          "show all",
          "list all",
          "show me all",
        ]),
      reply: "all_titles",
    },
  ];

  /* ---------------------------------------------------------
     HELPERS
  --------------------------------------------------------- */
  function has(words, keywords) {
    return keywords.some(
      (k) => words.includes(k) || words.join(" ").includes(k),
    );
  }

  function bookCard(b) {
    const name = b.name || b.seriesName || "Untitled";
    const genre = b.genre || "";
    const cat = b.cat || "";
    const image = b.image || "";
    const href = b.href || "#";
    const price = typeof b.price === "number" ? b.price : 0;
    const desc = b.desc || "";
    return `<a class="ch-book-card" href="${href}">
      <img class="ch-book-cover" src="${image}" alt="${name}" onerror="this.style.background='rgba(212,175,55,0.1)'">
      <div class="ch-book-info">
        <div class="ch-book-genre">${cat} · ${genre.split("·")[0].trim()}</div>
        <div class="ch-book-title">${name}</div>
        <div class="ch-book-desc" style="font-size:11px;line-height:1.4;margin-top:2px;">${desc}</div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px;">
          <span class="card-price">$${price % 1 === 0 ? price.toFixed(0) : String(price)}</span>
          <span class="ch-read-btn">Read More →</span>
        </div>
      </div>
    </a>`;
  }

  function wrap(text, cards) {
    return `<div>${text}${cards ? cards : ""}</div>`;
  }

  /* ---------------------------------------------------------
     REPLY FUNCTIONS
  --------------------------------------------------------- */
  function replyGreeting() {
    return wrap(
      "Hi there! Welcome to Crossed Hearts. I can help you find your next favourite read from our manga, novels, Glam Beat, and Blush Club catalogue — or answer any questions about digital editions, My Library, and more. What are you looking for today?",
    );
  }
  function replyThanks() {
    return wrap(
      "Happy to help! Feel free to ask anytime — whether you need more recommendations or have questions about your library.",
    );
  }
  function replyRecommendGeneral() {
    const picks = [CH_BOOKS[0], CH_BOOKS[1], CH_BOOKS[9]];
    return wrap(
      `<div style="margin-bottom:10px;">Here are a few fan-favourite picks to start with — one for each mood! Tap any card to read more.</div>`,
      picks.map(bookCard).join(""),
    );
  }
  function replyByTag(tag) {
    const matches = CH_BOOKS.filter(
      (b) =>
        Array.isArray(b.tags) &&
        (b.tags.some((t) => t.includes(tag)) ||
          (b.genre || "").toLowerCase().includes(tag)),
    );
    if (!matches.length)
      return wrap(
        `I couldn't find titles tagged with "${tag}" right now. Try browsing <a href="alltitles.html">All Titles</a> and using the genre filter!`,
      );
    const picks = matches.slice(0, 3);
    const tagLabel = tag.charAt(0).toUpperCase() + tag.slice(1);
    return wrap(
      `<div style="margin-bottom:10px;">Here are some great <strong style="color:#d4af37;">${tagLabel}</strong> picks for you! 📖</div>`,
      picks.map(bookCard).join(""),
    );
  }
  function replyImprintGlamBeat() {
    const matches = CH_BOOKS.filter((b) => b.cat === "Glam Beat");
    return wrap(
      `<div style="margin-bottom:10px;"><strong style="color:#d4af37;">Glam Beat</strong> is our imprint for yuri and girls' love stories — romantic, heartfelt, and beautifully told. Here's what we have:</div>`,
      matches.map(bookCard).join(""),
    );
  }
  function replyImprintBlushClub() {
    const matches = CH_BOOKS.filter((b) => b.cat === "blushclub");
    return wrap(
      `<div style="margin-bottom:10px;"><strong style="color:#d4af37;">Blush Club</strong> is our imprint for BL and boys' love titles. Here's what we have:</div>`,
      matches.map(bookCard).join(""),
    );
  }
  function replyImprintNovelPress() {
    return wrap(
      `<strong style="color:#d4af37;">A Novel Press</strong> is our imprint for light novels — fantasy, romance, and isekai stories in prose form. Check out our <a href="novels.html">Novels page</a> for the full lineup!`,
    );
  }
  function replyImprintStudioHearts() {
    const matches = CH_BOOKS.filter((b) => b.cat === "Studio Hearts");
    return wrap(
      `<div style="margin-bottom:10px;"><strong style="color:#d4af37;">Studio Hearts</strong> is our imprint for original fantasy and romance epics — sweeping stories with rich worldbuilding. Here's what we have:</div>`,
      matches.map(bookCard).join(""),
    );
  }
  function replyImprintCreatorOriginal() {
    const matches = CH_BOOKS.filter((b) => b.cat === "Creator Original");
    return wrap(
      `<div style="margin-bottom:10px;"><strong style="color:#d4af37;">Creator Original</strong> features standalone titles created directly with our partner artists and writers. Here's what we have:</div>`,
      matches.map(bookCard).join(""),
    );
  }
  function replyImprintLilyHouse() {
    return wrap(
      `<strong style="color:#d4af37;">Crossed Hearts x Lily House</strong> is our print partnership imprint for Girls' Love titles — enemies-to-lovers, sci-fi, family drama, and more. Take a look at the <a href="lilyhouse.html">Lily House page</a>!`,
    );
  }
  function replyFaqDigital() {
    return wrap(
      `All our titles are available as digital reading licenses — read instantly in your browser, no app needed. Browse everything on the <a href="alltitles.html">Digital Editions page</a>, and once purchased, titles live permanently in your <a href="my-library.html">My Library</a>.`,
    );
  }
  function replyCat(cat) {
    const matches = CH_BOOKS.filter((b) => b.cat === cat);
    const picks = matches.slice(0, 3);
    const catDesc = {
      Manga: "Our manga catalogue — licensed and translated with care.",
      Novel: "Our light novel selection — deep stories, rich worlds.",
      "Glam Beat":
        "Glam Beat — our imprint for yuri, slice-of-life, and girls' love stories.",
    };
    return wrap(
      `<div style="margin-bottom:10px;"><strong style="color:#d4af37;">${cat}</strong> — ${catDesc[cat] || ""} Here are some highlights:</div>`,
      picks.map(bookCard).join(""),
    );
  }
  function replySpecificBook(b) {
    return wrap(
      `<div style="margin-bottom:10px;">Here's what I know about that title!</div>`,
      bookCard(b),
    );
  }
  function replyAllTitles() {
    return wrap(
      `We have <strong style="color:#d4af37;">${CH_BOOKS.length} titles</strong> across all our imprints right now. You can browse the full catalogue with genre filters on our <a href="alltitles.html">All Titles page</a> — or tell me a mood or genre and I'll pick some for you! 📚`,
    );
  }
  function replyGenresList() {
    return wrap(`Here's what we carry across our imprints:<br><br>
      <span style="color:#d4af37;">Crossed Hearts</span> — Romance, Fantasy, Action, Mystery, Comedy, School Life, Josei, Shoujo, Horror, Slow Burn<br>
      <span style="color:#d4af37;">Glam Beat</span> — Romance, Fantasy, Slice-of-Life, Supernatural, Mystery<br>
      <span style="color:#d4af37;">Blush Club</span> — Romance, Fantasy, Drama, Supernatural<br><br>
      Just tell me which genre sounds good and I'll show you titles!`);
  }
  function replyFaqLibrary() {
    return wrap(
      `Your <a href="my-library.html">My Library</a> is your personal reading hub. Every title you've purchased lives there permanently. Just sign in via the nav bar and all your purchases appear automatically. It works on desktop, tablet, and mobile without any app download needed. There's no expiry, so your titles are always there when you want them.`,
    );
  }
  function replyFaqPrint() {
    return wrap(
      `Select titles from our catalogue are available as physical print editions, a separate purchase from the digital version. Head to the <a href="print.html">Print Editions page</a> to see which titles are currently available in print and how to order. Stock is limited, so it's worth checking back regularly for new additions!`,
    );
  }
  function replyFaqKickstarter() {
    return wrap(
      `Crossed Hearts runs campaigns for special collector editions — think premium bindings, exclusive art and bonus content you won't find anywhere else. Check the <a href="campaigns.html">Campaigns page</a> for current and upcoming projects. It's a great way to support the titles you love while getting something extra special.`,
    );
  }
  function replyFaqAccount() {
    return wrap(
      `Creating an account is easy. Click <strong style="color:#d4af37;">Sign In</strong> in the nav bar, then switch to the <em>Create Account</em> tab and fill in your details. You can also create one automatically during your first purchase. The <em>Verified User Login</em> button is only for licensed publishing partners, not regular readers.`,
    );
  }
  function replyFaqVolumes() {
    return wrap(
      `It varies by title! Most of our manga runs 1–2 volumes, our novels are 1–2 volumes, and some of our Glam Beat titles are single-volume complete stories. You can check exact volume counts on each title's page, or browse <a href="alltitles.html">All Titles</a> where the volume count is shown on every card.`,
    );
  }
  function replyFallback() {
    const suggestions = CH_BOOKS.slice(0, 2);
    return wrap(
      `<div style="margin-bottom:10px;">I'm not quite sure about that one, but I'm great at finding reads and answering questions about digital editions, My Library, print editions and more! Try asking me something like "recommend a romance" or "what is Studio Hearts". In the meantime, here are a couple of popular picks:</div>`,
      suggestions.map(bookCard).join(""),
    );
  }

  let chPanelOpen = false;
  let chFirstOpen = true;

  function chGetReply(input) {
    const lower = input.toLowerCase().trim();
    const words = lower.split(/\s+/);
    for (const intent of CH_INTENTS) {
      if (intent.match(words)) {
        if (intent.reply === "recommend_general")
          return replyRecommendGeneral();
        if (intent.reply === "genre") return replyByTag(intent.genre);
        if (intent.reply === "imprint_glambeat") return replyImprintGlamBeat();
        if (intent.reply === "imprint_blushclub")
          return replyImprintBlushClub();
        if (intent.reply === "imprint_novelpress")
          return replyImprintNovelPress();
        if (intent.reply === "imprint_studiohearts")
          return replyImprintStudioHearts();
        if (intent.reply === "imprint_creatororiginal")
          return replyImprintCreatorOriginal();
        if (intent.reply === "imprint_lilyhouse")
          return replyImprintLilyHouse();
        if (intent.reply === "faq_digital") return replyFaqDigital();
        if (intent.reply === "cat") return replyCat(intent.cat);
        if (intent.reply === "genres_list") return replyGenresList();
        if (intent.reply === "faq_library") return replyFaqLibrary();
        if (intent.reply === "faq_print") return replyFaqPrint();
        if (intent.reply === "faq_kickstarter") return replyFaqKickstarter();
        if (intent.reply === "faq_account") return replyFaqAccount();
        if (intent.reply === "faq_volumes") return replyFaqVolumes();
        if (intent.reply === "greeting") return replyGreeting();
        if (intent.reply === "thanks") return replyThanks();
        if (intent.reply === "all_titles") return replyAllTitles();
      }
    }
    const matched = CH_BOOKS.filter(
      (b) =>
        (b.name &&
          lower.includes(b.name.toLowerCase().substring(0, 8).toLowerCase())) ||
        lower.includes(b.id),
    );
    if (matched.length) return replySpecificBook(matched[0]);
    return replyFallback();
  }

  /* ---------------------------------------------------------
     PANEL OPEN / CLOSE / MESSAGING
  --------------------------------------------------------- */
  function chChatOpen() {
    const panel = document.getElementById("ch-chat-panel");
    panel.style.display = "flex";
    chPanelOpen = true;
    if (chFirstOpen) {
      chFirstOpen = false;
      setTimeout(() => {
        chAppendBot(
          wrap(
            "Hi! I'm your Crossed Hearts Assistant — here to help you find your next favourite read or answer any questions about digital editions, your library, print editions and more.<br><br>What are you in the mood for today?",
          ),
        );
      }, 200);
    }
    setTimeout(() => document.getElementById("ch-input").focus(), 100);
  }
  function chChatClose() {
    document.getElementById("ch-chat-panel").style.display = "none";
    chPanelOpen = false;
  }
  function chAppendBot(html) {
    const msgs = document.getElementById("ch-messages");
    const div = document.createElement("div");
    div.className = "ch-msg-bot";
    div.innerHTML = html;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }
  function chAppendUser(text) {
    const msgs = document.getElementById("ch-messages");
    const div = document.createElement("div");
    div.className = "ch-msg-user";
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }
  function chShowTyping() {
    document.getElementById("ch-typing").style.display = "block";
    const msgs = document.getElementById("ch-messages");
    msgs.scrollTop = msgs.scrollHeight;
  }
  function chHideTyping() {
    document.getElementById("ch-typing").style.display = "none";
  }
  function chSend(overrideText) {
    const input = document.getElementById("ch-input");
    const text = overrideText || input.value.trim();
    if (!text) return;
    input.value = "";
    chAppendUser(text);
    chShowTyping();
    setTimeout(() => {
      chHideTyping();
      chAppendBot(chGetReply(text));
    }, 600);
  }

  /* ---------------------------------------------------------
     "FIND MY MATCH" MOOD QUIZ
  --------------------------------------------------------- */
  const CH_MOOD_QUIZ = { answers: {}, step: 1, total: 2 };

  function chQuizProgress() {
    let dots = "";
    for (let i = 1; i <= CH_MOOD_QUIZ.total; i++) {
      dots += `<span class="${i <= CH_MOOD_QUIZ.step - 1 ? "done" : ""}"></span>`;
    }
    return `<div class="ch-quiz-progress">${dots}</div>`;
  }

  function chStartMoodQuiz() {
    CH_MOOD_QUIZ.answers = {};
    CH_MOOD_QUIZ.step = 1;
    chAppendUser("Find My Match");
    chShowTyping();
    setTimeout(() => {
      chHideTyping();
      chAppendBot(`${chQuizProgress()}<div style="margin-bottom:6px;">Let's find your next read! First — what kind of story pulls you in?</div>
        <button class="ch-quiz-option" onclick="chQuizAnswer('mood','romance')">Something romantic</button>
        <button class="ch-quiz-option" onclick="chQuizAnswer('mood','fantasy')">Epic fantasy or action</button>
        <button class="ch-quiz-option" onclick="chQuizAnswer('mood','comedy')">Something light and funny</button>
        <button class="ch-quiz-option" onclick="chQuizAnswer('mood','dark')">Dark, moody, or mysterious</button>`);
    }, 400);
  }

  function chQuizAnswer(key, value) {
    CH_MOOD_QUIZ.answers[key] = value;
    const msgs = document.getElementById("ch-messages");
    const lastBot = msgs.querySelectorAll(".ch-msg-bot");
    const last = lastBot[lastBot.length - 1];
    if (last) {
      last.querySelectorAll(".ch-quiz-option").forEach((b) => {
        b.disabled = true;
        b.style.pointerEvents = "none";
      });
    }
    const labelMap = {
      romance: "Something romantic",
      fantasy: "Epic fantasy or action",
      comedy: "Something light and funny",
      dark: "Dark, moody, or mysterious",
      gl: "Girls' Love",
      bl: "Boys' Love",
      any: "No preference",
    };
    chAppendUser(labelMap[value] || value);
    chShowTyping();
    if (key === "mood") {
      CH_MOOD_QUIZ.step = 2;
      setTimeout(() => {
        chHideTyping();
        chAppendBot(`${chQuizProgress()}<div style="margin-bottom:6px;">Got it! Any preference on who falls for who?</div>
          <button class="ch-quiz-option" onclick="chQuizAnswer('pairing','gl')">Girls' Love</button>
          <button class="ch-quiz-option" onclick="chQuizAnswer('pairing','bl')">Boys' Love</button>
          <button class="ch-quiz-option" onclick="chQuizAnswer('pairing','any')">Surprise me</button>`);
      }, 500);
    } else {
      CH_MOOD_QUIZ.step = 3;
      setTimeout(() => {
        chHideTyping();
        chAppendBot(chQuizResult());
      }, 500);
    }
  }

  function chQuizResult() {
    const { mood, pairing } = CH_MOOD_QUIZ.answers;
    const validBooks = CH_BOOKS.filter(
      (b) => b && b.name && b.href && Array.isArray(b.tags),
    );

    let pool = validBooks.filter((b) => {
      const t = b.tags;
      let moodMatch = true;
      if (mood === "romance") moodMatch = t.includes("romance");
      if (mood === "fantasy")
        moodMatch = t.includes("fantasy") || t.includes("action");
      if (mood === "comedy")
        moodMatch = t.includes("comedy") || t.includes("funny");
      if (mood === "dark")
        moodMatch =
          t.includes("horror") ||
          t.includes("dark") ||
          t.includes("mystery") ||
          t.includes("tragedy");
      let pairMatch = true;
      if (pairing === "gl") pairMatch = b.cat === "Glam Beat";
      if (pairing === "bl") pairMatch = b.cat === "blushclub";
      return moodMatch && pairMatch;
    });

    if (!pool.length) {
      pool = validBooks.filter((b) => {
        const t = b.tags;
        if (mood === "romance") return t.includes("romance");
        if (mood === "fantasy")
          return t.includes("fantasy") || t.includes("action");
        if (mood === "comedy")
          return t.includes("comedy") || t.includes("funny");
        if (mood === "dark")
          return (
            t.includes("horror") || t.includes("dark") || t.includes("mystery")
          );
        return true;
      });
    }
    if (!pool.length) pool = validBooks;

    if (!pool.length) {
      return `${chQuizProgress()}<div style="margin-bottom:10px;">Hmm, I couldn't put together a match just now. Try browsing <a href="alltitles.html">All Titles</a> instead!</div>
        <button class="ch-quiz-option" style="margin-top:10px;text-align:center;" onclick="chStartMoodQuiz()">Try again</button>`;
    }

    const picks = pool.sort(() => 0.5 - Math.random()).slice(0, 3);
    return `${chQuizProgress()}<div style="margin-bottom:10px;">Based on your picks, here's your match!</div>
      ${picks.map(bookCard).join("")}
      <button class="ch-quiz-option" style="margin-top:10px;text-align:center;" onclick="chStartMoodQuiz()">Try again</button>`;
  }

  /* ---------------------------------------------------------
     HELP & SUPPORT MENU + CONTACT MODAL
  --------------------------------------------------------- */
  const HELP_CATEGORIES_CHAT = [
    { icon: "ti-book-2", title: "Reading Issues", category: "Reading Issues" },
    {
      icon: "ti-credit-card",
      title: "Payments & Refunds",
      category: "Payments & Refunds",
    },
    {
      icon: "ti-package",
      title: "Physical Orders",
      category: "Physical Orders",
    },
    {
      icon: "ti-user-circle",
      title: "Account & Login",
      category: "Account & Login",
    },
    { icon: "ti-books", title: "Digital Library", category: "Digital Library" },
    {
      icon: "ti-settings",
      title: "Technical Issues",
      category: "Technical Issues",
    },
    {
      icon: "ti-help-circle",
      title: "Frequently Asked Questions",
      href: "faq.html",
    },
    { icon: "ti-headset", title: "Contact Support", category: "General" },
  ];

  const CH_GENRES = [
    { label: "Romance", tag: "romance" },
    { label: "Fantasy", tag: "fantasy" },
    { label: "Action", tag: "action" },
    { label: "Mystery", tag: "mystery" },
    { label: "Comedy", tag: "comedy" },
    { label: "Horror", tag: "horror" },
    { label: "School Life", tag: "school" },
    { label: "Slow Burn", tag: "slow burn" },
    { label: "Cozy", tag: "cozy" },
    { label: "Girls' Love", tag: "yuri" },
    { label: "Boys' Love", tag: "bl" },
  ];

  function chShowGenreMenu() {
    chAppendUser("Genre");
    chShowTyping();
    setTimeout(() => {
      chHideTyping();
      const buttons = CH_GENRES.map(
        (g) =>
          `<button class="ch-quiz-option" onclick="chGenrePick('${g.tag}','${g.label.replace(/'/g, "\\'")}')">${g.label}</button>`,
      ).join("");
      chAppendBot(
        `<div style="margin-bottom:6px;">Pick a genre and I'll pull up some titles:</div>${buttons}`,
      );
    }, 400);
  }

  function chGenrePick(tag, label) {
    chAppendUser(label);
    chShowTyping();
    setTimeout(() => {
      chHideTyping();
      chAppendBot(replyByTag(tag));
    }, 500);
  }

  const CH_CATEGORIES = [
    { icon: "ti-book-2", title: "Manga", href: "manga.html" },
    { icon: "ti-books", title: "Manhwa", href: "manhwa.html" },
    { icon: "ti-heart", title: "Glam Beat", href: "glambeat.html" },
    { icon: "ti-heart", title: "Blush Club", href: "blushclub.html" },
    { icon: "ti-books", title: "A Novel Press", href: "novels.html" },
    { icon: "ti-books", title: "Studio Hearts", href: "studiohearts.html" },
    {
      icon: "ti-books",
      title: "Creator Original",
      href: "creatororiginal.html",
    },
    {
      icon: "ti-books",
      title: "Crossed Hearts X Lily House",
      href: "lilyhouse.html",
    },
  ];

  function chShowCategoryMenu() {
    chAppendUser("Category");
    chShowTyping();
    setTimeout(() => {
      chHideTyping();
      const tiles = CH_CATEGORIES.map(
        (c) =>
          `<div class="ch-tile" onclick="window.location.href='${c.href}'">
            <i class="ti ${c.icon}" aria-hidden="true"></i>
            <span>${c.title}</span>
          </div>`,
      ).join("");
      chAppendBot(
        `<div style="margin-bottom:4px;">Browse by category — tap one to jump straight there:</div>${tiles}`,
      );
    }, 400);
  }

  function chShowHelpMenu() {
    chAppendUser("Help & Support");
    chShowTyping();
    setTimeout(() => {
      chHideTyping();
      const tiles = HELP_CATEGORIES_CHAT.map(
        (c) => `
        <div class="ch-tile" onclick="${c.href ? `window.location.href='${c.href}'` : `openHelpContact('${c.category}')`}">
          <i class="ti ${c.icon}" aria-hidden="true"></i>
          <span>${c.title}</span>
        </div>`,
      ).join("");
      chAppendBot(
        `<div style="margin-bottom:4px;">Here's how I can help — tap a category:</div>${tiles}`,
      );
    }, 500);
  }

  function openHelpContact(category) {
    const overlay = document.getElementById("helpContactOverlay");
    if (!overlay) return;
    overlay.style.display = "flex";
    const catSelect = document.getElementById("hcCategory");
    if (category) {
      catSelect.value = category;
      document.getElementById("helpContactSub").textContent =
        `Regarding: ${category}`;
    } else {
      document.getElementById("helpContactSub").textContent =
        "We'll get back to you within 24 hours";
    }
    document.getElementById("hcStatus").textContent = "";
  }
  function closeHelpContact() {
    const overlay = document.getElementById("helpContactOverlay");
    if (overlay) overlay.style.display = "none";
    const form = document.getElementById("helpContactForm");
    if (form) form.reset();
  }
  function closeHelpContactIfBg(e) {
    if (e.target.id === "helpContactOverlay") closeHelpContact();
  }
  async function submitHelpContact(e) {
    e.preventDefault();
    const status = document.getElementById("hcStatus");
    status.textContent = "Sending…";
    const payload = {
      category: document.getElementById("hcCategory").value,
      name: document.getElementById("hcName").value,
      email: document.getElementById("hcEmail").value,
      message: document.getElementById("hcMessage").value,
    };
    try {
      const res = await fetch(`${window.CH_API_URL}/support/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Request failed");
      status.style.color = "#8fd19e";
      status.textContent = "Thanks! We've received your message.";
      setTimeout(closeHelpContact, 1800);
    } catch (err) {
      const subject = encodeURIComponent(
        `[${payload.category}] Support request from ${payload.name}`,
      );
      const body = encodeURIComponent(
        `${payload.message}\n\nFrom: ${payload.name} (${payload.email})`,
      );
      window.location.href = `mailto:support@heartsreader.com?subject=${subject}&body=${body}`;
      status.style.color = "rgba(245,237,232,0.6)";
      status.textContent = "Opening your email client…";
    }
  }
  window.chChatOpen = chChatOpen;
  window.chChatClose = chChatClose;
  window.chSend = chSend;
  window.chStartMoodQuiz = chStartMoodQuiz;
  window.chQuizAnswer = chQuizAnswer;
  window.chShowHelpMenu = chShowHelpMenu;
  window.chShowGenreMenu = chShowGenreMenu;
  window.chGenrePick = chGenrePick;
  window.chShowCategoryMenu = chShowCategoryMenu;
  window.openHelpContact = openHelpContact;
  window.closeHelpContact = closeHelpContact;
  window.closeHelpContactIfBg = closeHelpContactIfBg;
  window.submitHelpContact = submitHelpContact;
})();

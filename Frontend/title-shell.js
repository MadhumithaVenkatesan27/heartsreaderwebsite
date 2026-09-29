/* title-shell.js — load FIRST inside <body>, before script.js.
   Injects the shared nav, mobile nav, modals, search overlay and back-to-top
   button (identical to chigaya.html). */
(function () {
  var html = `
<nav class="nav" id="mainNav">
  <a class="nav-logo" href="index.html">
    <img src="Images/logo-dark.png" alt="Crossed Hearts Logo" class="nav-logo-img nav-logo-dark" />
    <img src="Images/logo-light.png" alt="Crossed Hearts Logo" class="nav-logo-img nav-logo-light" />
    <div class="nav-logo-text"><span class="nav-logo-main">Crossed Hearts</span></div>
  </a>
  <ul class="nav-links">
    <li><a href="index.html">Home</a></li>
    <li><a href="alltitles.html">Digital Editions</a></li>
    <li><a href="print.html">Print Editions</a></li>
    <li><a href="campaigns.html" style="display:inline-flex;align-items:center;gap:8px;background:#e05c7a;color:#fff;font-weight:700;font-size:14px;padding:13px 28px;border-radius:999px;text-decoration:none;transition:background .2s;box-shadow:0 4px 20px rgba(224,92,122,.4)" onmouseover="this.style.background='#b84060'" onmouseout="this.style.background='#e05c7a'"><i class="ti ti-heart" aria-hidden="true"></i> Campaign</a></li>
  </ul>
  <div class="nav-actions">
    <div class="nav-search-inline" id="navSearchInline" role="search">
      <input type="text" class="nav-search-inline-input" id="navSearchInlineInput" placeholder="Search..." autocomplete="off" readonly aria-label="Search titles, genres, keywords" aria-haspopup="dialog" aria-expanded="false" onclick="openNavSearch()" onfocus="openNavSearch()" onkeydown="if (event.key === 'Enter') openNavSearch();" />
      <button class="nav-search-inline-btn" id="navSearchInlineBtn" onclick="openNavSearch()" aria-label="Open search" aria-haspopup="dialog" aria-expanded="false"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg></button>
    </div>
    <a href="account.html" class="btn-nav-ghost">My Account</a>
    <button class="btn-nav-signin" id="navAuthBtn" data-login-label="Sign In" onclick="handleNavAuth()">Sign In</button>
    <button class="btn-nav-register" id="navRegisterBtn" onclick="openAuth('up', { lockMode: true })">Sign Up</button>
    <a href="subscription.html" class="btn-nav-subscribe" id="navSubscribeBtn" style="display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#d4af37,#b8941f);color:#1a0f08;font-weight:700;font-size:13px;padding:9px 18px;border-radius:999px;text-decoration:none;letter-spacing:.2px;box-shadow:0 4px 16px rgba(212,175,55,.35);transition:transform .2s,box-shadow .2s" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 20px rgba(212,175,55,.5)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 16px rgba(212,175,55,.35)'"><i class="ti ti-crown" aria-hidden="true"></i> Subscribe</a>
    <button class="theme-toggle" id="themeToggle" onclick="toggleTheme()" aria-label="Toggle theme"><span class="icon-dark"><i class="ti ti-moon" aria-hidden="true"></i></span><span class="icon-light"><i class="ti ti-sun" aria-hidden="true"></i></span></button>
    <button class="nav-burger" onclick="toggleMobileNav()" aria-label="Open menu"><i class="ti ti-menu-2" aria-hidden="true"></i></button>
  </div>
</nav>

<div class="mobile-nav-overlay" id="mobileOverlay"></div>
<div class="mobile-nav" id="mobileNav">
  <div class="mobile-nav-top"><span style="font-size:11px;color:var(--muted);letter-spacing:.1em;text-transform:uppercase">Menu</span></div>
  <a href="index.html">Home</a>
  <a href="alltitles.html">Digital Editions</a>
  <a href="print.html">Print Editions</a>
  <a href="subscription.html" style="background:linear-gradient(135deg,#d4af37,#b8941f);color:#1a0f08;font-weight:700;border-radius:10px;padding:10px 14px;display:flex;align-items:center;gap:8px;margin:4px 0"><i class="ti ti-crown" aria-hidden="true"></i> Subscribe</a>
  <a href="campaigns.html" style="color:var(--ch-rose-deep);font-weight:700">Campaigns</a>
  <a href="#" onclick="handleNavAuth();toggleMobileNav();" style="color:var(--gold)" id="mobileAuthLink" data-login-label="Sign In">Sign In</a>
  <a href="#" onclick="openAuth('up', { lockMode: true });toggleMobileNav();" style="color:var(--gold)" id="mobileRegisterLink">Sign Up</a>
</div>

<div class="modal-overlay" id="payOverlay" onclick="if (event.target === this) closePayModal();">
  <div class="modal">
    <button class="modal-x" onclick="closePayModal()">✕</button>
    <div class="modal-title" id="payModalTitle">Unlock Chapter</div>
    <div class="modal-sub" id="payModalSub">Purchase To Continue Reading</div>
    <div id="payBody"></div>
  </div>
</div>
<div class="modal-overlay" id="authOverlay" onclick="closeAuthIfBg(event)">
  <div class="modal">
    <button class="modal-x" onclick="closeAuth()">✕</button>
    <div class="modal-title">Welcome Back</div>
    <div class="modal-sub">Sign In To Access Your Digital Library</div>
    <div class="auth-tabs">
      <button class="atab active" onclick="switchAuth('in', this)">Sign In</button>
      <button class="atab" onclick="switchAuth('up', this)">Sign Up</button>
    </div>
    <div id="authBody"></div>
  </div>
</div>
<div class="toast" id="toast"></div>

<div class="nav-search-overlay" id="navSearchOverlay" onclick="closeNavSearchIfBg(event)">
  <div class="nav-search-modal">
    <button class="nav-search-close" onclick="closeNavSearch()" aria-label="Close search">&#10005;</button>
    <div class="nav-search-inner" id="navSiteSearchBar">
      <span class="nav-search-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg></span>
      <input type="text" class="nav-search-input" id="navSearchInput" placeholder="Search Titles, Genres, Keywords..." oninput="navLiveSearch(this.value)" onkeydown="if (event.key === 'Enter') navDoSearch();" autocomplete="off" />
      <button class="nav-search-clear" id="navSearchClear" onclick="navClearSearch()" style="display:none">&#10005;</button>
      <button class="nav-search-submit" onclick="navDoSearch()">Search</button>
    </div>
    <div class="nav-genres-panel" id="navGenresPanel">
      <div class="nav-genres-label">Genres</div>
      <div class="nav-genres-grid" id="navGenresGrid" role="group" aria-label="Browse by genre"></div>
      <button class="nav-genres-more" id="navGenresMoreBtn" onclick="navToggleGenres()" aria-expanded="false">See more</button>
    </div>
    <div class="nav-search-suggestions" id="navSearchSuggestions"></div>
  </div>
</div>

<button id="backToTop" onclick="window.scrollTo({ top: 0, behavior: 'smooth' })" aria-label="Back to top" style="position:fixed;bottom:100px;right:28px;z-index:8000;width:44px;height:44px;border-radius:50%;background:rgba(212,175,55,.15);border:1px solid rgba(212,175,55,.35);color:var(--gold);cursor:pointer;display:none;align-items:center;justify-content:center;backdrop-filter:blur(10px);transition:opacity .3s ease,transform .3s ease,background .2s;box-shadow:0 4px 20px rgba(0,0,0,.3)" onmouseover="this.style.background='rgba(212,175,55,.3)';this.style.transform='translateY(-3px)'" onmouseout="this.style.background='rgba(212,175,55,.15)';this.style.transform='translateY(0)'"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15" /></svg></button>
`;
  document.body.insertAdjacentHTML("afterbegin", html);
})();

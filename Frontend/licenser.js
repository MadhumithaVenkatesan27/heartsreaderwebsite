// ============================================================
//  licenser.js
//  Crossed Hearts - licensor portal logic
//  Uses the main website login token. No licensor passwords live here.
// ============================================================

(function () {
  "use strict";

  function resolveLicenserApiUrl() {
    var override =
      window.CH_API_URL ||
      (["localhost", "127.0.0.1", ""].includes(location.hostname) || location.protocol === "file:" ? localStorage.getItem("ch_api_url") : "") ||
      (document.querySelector('meta[name="ch-api-url"]') || {}).content;
    if (override) return String(override).replace(/\/$/, "");

    var isLocal =
      ["localhost", "127.0.0.1", ""].includes(window.location.hostname) ||
      window.location.protocol === "file:";
    if (window.location.hostname === "thecrossedhearts.com" || window.location.hostname === "www.thecrossedhearts.com") {
      return "https://crossed-hearts-final.onrender.com/api";
    }
    if (window.location.hostname === "crossed-hearts.onrender.com") {
      return "https://crossed-hearts-final.onrender.com/api";
    }
    return isLocal ? "http://localhost:5000/api" : "https://crossed-hearts-final.onrender.com/api";
  }
  var API_URL = resolveLicenserApiUrl();
  var SESSION_KEY = "ch_licenser_session";

  function getToken() {
    return sessionStorage.getItem("ch_token") || "";
  }

  function getPersistedUser() {
    try {
      return JSON.parse(sessionStorage.getItem("ch_user") || "null");
    } catch (e) {
      return null;
    }
  }

  function fallbackMeta(book) {
    var slug = book.slug || book.id || "";
    var title = (book.title || "").toLowerCase();
    var local = (window.LIC_ALL_VOLUMES || []).find(function (vol) {
      return (
        vol.id === slug ||
        slug.indexOf(vol.id.replace("-vol", "")) !== -1 ||
        title.indexOf((vol.title || "").toLowerCase().split(" vol.")[0]) !== -1
      );
    });
    return local || {};
  }

  function normalizeBook(book) {
    var meta = fallbackMeta(book);
    return {
      id: book._id || book.id || book.slug || meta.id,
      slug: book.slug || meta.id || book._id,
      title: book.title || meta.title || "Untitled Book",
      series: (book.genres && book.genres[0]) || meta.series || "Title",
      num: meta.num || "",
      cover: book.coverImageUrl || meta.cover || "Images/Matchmaker-vol 1.png",
      pages: meta.pages || ((book.chapters || []).length + " chapter(s)"),
      sales: book.sales || 0,
      revenue: book.revenue || 0,
    };
  }

  async function apiGet(path) {
    var token = getToken();
    if (!token) {
      throw new Error("LOGIN_REQUIRED");
    }

    var res = await fetch(API_URL + path, {
      headers: { Authorization: "Bearer " + token },
    });
    var data = await res.json().catch(function () {
      return {};
    });

    if (!res.ok || data.status !== "success") {
      var error = new Error(data.message || "Request failed.");
      error.status = res.status;
      throw error;
    }
    return data.data || {};
  }

  function redirectToMainLogin() {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = "licenser-login.html";
  }

  function getLicensorPortalSession() {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    } catch (e) {
      return null;
    }
  }

  function renderEmpty(message, sub) {
    var grid = document.getElementById("licVolGrid");
    if (!grid) return;
    grid.innerHTML =
      '<div class="lic-empty">' +
      '<div class="lic-empty-icon">!</div>' +
      '<div class="lic-empty-text">' + message + '</div>' +
      '<div class="lic-empty-sub">' + (sub || "") + '</div>' +
      '</div>';
  }

  window.licSignOut = function () {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem("lic_vol");
    sessionStorage.removeItem("ch_token");
    localStorage.removeItem("ch_user_persist");
    sessionStorage.removeItem("ch_user");
    window.location.href = "licenser-login.html";
  };

  window.licAllowedIds = function () {
    try {
      var session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
      return session && session.access ? session.access : [];
    } catch (e) {
      return [];
    }
  };

  window.licOpenVolume = function (bookId) {
    var allowed = window.licAllowedIds();
    if (allowed.indexOf(bookId) === -1) {
      alert("You do not have access to this title.");
      return;
    }
    window.location.href = "licenser-reader.html?vol=" + encodeURIComponent(bookId);
  };

  window.licInitPortal = async function () {
    var portalSession = getLicensorPortalSession();
    if (!portalSession || portalSession.verifiedByLicensorId !== true) {
      redirectToMainLogin();
      return;
    }

    var persistedUser = getPersistedUser();
    var grid = document.getElementById("licVolGrid");
    if (grid) {
      grid.innerHTML =
        '<div style="grid-column:1/-1;padding:40px;text-align:center;color:var(--muted);font-size:13px;letter-spacing:0.1em;">Loading your assigned titles...</div>';
    }

    try {
      var meData = await apiGet("/licensors/me");
      var licensor = meData.licensor || persistedUser;

      if (!licensor || licensor.role !== "licensor") {
        renderEmpty("Licensor access only.", "Please sign in using an approved licensor account.");
        return;
      }

      var booksData = await apiGet("/licensors/my-books");
      var books = (booksData.books || []).map(normalizeBook);

      var session = {
        id: portalSession.id || licensor.licensorId || licensor._id || licensor.id,
        name: licensor.name || licensor.email || "Licensor",
        email: licensor.email || "",
        access: books.map(function (book) {
          return book.id;
        }),
        books: books,
        loginTime: portalSession.loginTime || Date.now(),
        verifiedByLicensorId: true,
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

      var navName = document.getElementById("licNavName");
      var idBadge = document.getElementById("licIdDisplay");
      var nameBadge = document.getElementById("licNameDisplay");
      var volCount = document.getElementById("licVolCount");

      if (navName) navName.textContent = session.name;
      if (idBadge) idBadge.textContent = session.email || session.id;
      if (nameBadge) nameBadge.textContent = session.name;
      if (volCount) {
        volCount.textContent =
          books.length + " title" + (books.length !== 1 ? "s" : "") + " assigned to your account";
      }

      if (!books.length) {
        renderEmpty(
          "No titles are assigned to your account.",
          "Ask the admin to assign books to this licensor account."
        );
        return;
      }

      grid.innerHTML = books
        .map(function (book, i) {
          return (
            '<div class="lic-vol-card" style="animation-delay:' + i * 0.07 + 's" ' +
            'onclick="licOpenVolume(\'' + book.id + '\')">' +
            '  <div class="lic-cover-wrap">' +
            '    <img src="' + book.cover + '" alt="' + book.title + '" loading="lazy" onerror="this.style.display=\'none\'">' +
            '    <div class="lic-cover-overlay"><span class="lic-cover-cta">Review -></span></div>' +
            '    <div class="lic-vol-type-badge">' + book.series + '</div>' +
            '  </div>' +
            '  <div class="lic-vol-body">' +
            '    <div class="lic-vol-meta">' + book.series + (book.num ? " - " + book.num : "") + '</div>' +
            '    <div class="lic-vol-title">' + book.title + '</div>' +
            '    <div class="lic-vol-footer">' +
            '      <span class="lic-vol-pages">' + book.pages + '</span>' +
            '      <button class="lic-btn-review" onclick="event.stopPropagation();licOpenVolume(\'' + book.id + '\')">Review -></button>' +
            '    </div>' +
            '  </div>' +
            '</div>'
          );
        })
        .join("");
    } catch (err) {
      if (err.message === "LOGIN_REQUIRED" || err.status === 401 || err.status === 403) {
        redirectToMainLogin();
        return;
      }
      renderEmpty("Could not load licensor titles.", err.message || "Please try again.");
    }
  };

  window.licStartTimer = function (timeoutMinutes) {
    var mins = timeoutMinutes || 30;
    var timeLeft = mins * 60;
    var intervalId = null;

    function pad(n) {
      return String(n).padStart(2, "0");
    }

    function update() {
      var m = Math.floor(timeLeft / 60);
      var s = timeLeft % 60;
      var display = document.getElementById("licTimerDisplay");
      var pill = document.getElementById("licTimerPill");
      var dot = document.getElementById("licTimerDot");
      if (display) display.textContent = pad(m) + ":" + pad(s);
      if (pill && dot) {
        pill.className = "lic-timer-pill";
        dot.className = "lic-timer-dot";
        if (timeLeft <= 60) {
          pill.classList.add("danger");
          dot.classList.add("danger");
        } else if (timeLeft <= 300) {
          pill.classList.add("warning");
          dot.classList.add("warning");
        }
      }
    }

    function reset() {
      timeLeft = mins * 60;
      update();
    }

    update();
    intervalId = setInterval(function () {
      timeLeft -= 1;
      update();
      if (timeLeft <= 0) {
        clearInterval(intervalId);
        var modal = document.getElementById("licTimeoutModal");
        if (modal) modal.classList.add("open");
      }
    }, 1000);

    ["mousemove", "keydown", "click", "scroll", "touchstart"].forEach(function (ev) {
      document.addEventListener(ev, reset, { passive: true });
    });
  };
})();

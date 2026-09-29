(function () {
  function cleanPath(pathname) {
    if (!pathname || pathname === "/index.html") return "/";
    return pathname.endsWith(".html") ? pathname.slice(0, -5) : pathname;
  }

  function cleanHref(href) {
    if (!href || href[0] === "#" || /^mailto:|^tel:/i.test(href)) return href;
    try {
      var url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return href;
      return cleanPath(url.pathname) + url.search + url.hash;
    } catch (_) {
      return href;
    }
  }

  if (window.location.protocol !== "file:") {
    var cleanCurrent = cleanPath(window.location.pathname);
    if (cleanCurrent !== window.location.pathname) {
      window.history.replaceState(
        window.history.state,
        document.title,
        cleanCurrent + window.location.search + window.location.hash,
      );
    }
  }

  document.addEventListener(
    "click",
    function (event) {
      var link = event.target.closest && event.target.closest("a[href]");
      if (!link || link.target || link.hasAttribute("download")) return;
      var href = link.getAttribute("href") || "";
      var nextHref = cleanHref(href);
      if (nextHref && nextHref !== href) link.setAttribute("href", nextHref);
    },
    true,
  );

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("a[href]").forEach(function (link) {
      var href = link.getAttribute("href") || "";
      var nextHref = cleanHref(href);
      if (nextHref && nextHref !== href) link.setAttribute("href", nextHref);
    });
  });
})();

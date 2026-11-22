// Page transitions: the page content fades in on load (CSS, see "Page transitions" in style.css)
// and fades out before going to another page of the site.
//   - Links to other pages of this site fade out automatically.
//   - Scripts call pgGo(url, true) instead of location.replace(url).
(function () {
  var OUT_MS = 200;

  window.pgGo = function (url, replace) {
    var body = document.body;
    if (!body || body.classList.contains("page-leave")) return;
    body.classList.add("page-leave");
    setTimeout(function () {
      if (replace) location.replace(url); else location.assign(url);
    }, OUT_MS);
  };

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;                          // other sites: normal link
    if (url.pathname === location.pathname && url.hash) return;          // same-page anchor
    e.preventDefault();
    window.pgGo(url.href, false);
  });

  // Coming back with the browser's Back button can restore the faded-out page; show it again.
  window.addEventListener("pageshow", function (e) {
    if (e.persisted && document.body) document.body.classList.remove("page-leave");
  });
})();

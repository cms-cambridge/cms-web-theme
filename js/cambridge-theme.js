/*!
 * cms-web-theme — light/dark toggle. Optional: css/cambridge-tokens.css
 * follows the OS's dark-mode setting on its own; this adds a button that
 * overrides it, and remembers the override.
 *
 * Load it in <head>, not at the end of <body>, and without defer/async:
 * the first half applies a saved choice before the page paints, which is
 * what stops a dark-mode user getting a white flash on every navigation.
 * It's small enough that blocking on it costs nothing.
 *
 *   <script src="cms-web-theme/js/cambridge-theme.js"></script>
 *
 * What it does:
 *   - Reads the saved choice ("light" or "dark") and, if there is one, sets
 *     <html data-theme="…">. No saved choice means no attribute, so the OS
 *     setting keeps deciding — including changing under an open page.
 *   - Wires every [data-cam-theme-toggle] button (see .cam-theme-toggle in
 *     the CSS): a click saves and applies the opposite of what's showing.
 *   - Mirrors the effective theme to data-bs-theme, Bootstrap 5.3's own
 *     switch, which is what the Bootstrap build (dist/cambridge-theme.css)
 *     keys its dark mode on. Without this script, set data-bs-theme
 *     yourself; the Bootstrap build does not read the OS setting.
 *   - Fires a "cam-theme-change" event on document, detail { theme }, for
 *     anything of yours that needs to redraw (a canvas chart, say).
 *
 * Storage is wrapped in try/catch throughout: it throws with cookies
 * blocked and in some private modes, and a theme toggle failing to
 * remember is not worth breaking the page over.
 */
(function () {
  "use strict";

  var KEY = "cam-theme";
  var root = document.documentElement;
  var osDark = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function stored() {
    try {
      var v = window.localStorage.getItem(KEY);
      return v === "light" || v === "dark" ? v : null;
    } catch (e) {
      return null;
    }
  }

  function save(theme) {
    try {
      window.localStorage.setItem(KEY, theme);
    } catch (e) { /* not remembered; still applied for this page view */ }
  }

  // What the page is actually showing: the explicit attribute if there is
  // one, else the OS.
  function effective() {
    var attr = root.getAttribute("data-theme");
    if (attr === "light" || attr === "dark") return attr;
    return osDark && osDark.matches ? "dark" : "light";
  }

  var last = null;
  function sync() {
    var theme = effective();
    root.setAttribute("data-bs-theme", theme);
    var buttons = document.querySelectorAll("[data-cam-theme-toggle]");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    }
    if (theme !== last) {
      last = theme;
      document.dispatchEvent(new CustomEvent("cam-theme-change", { detail: { theme: theme } }));
    }
  }

  function apply(theme) {
    if (theme) root.setAttribute("data-theme", theme);
    else root.removeAttribute("data-theme");
    sync();
  }

  // 1. Before first paint: apply a saved choice.
  var saved = stored();
  if (saved) root.setAttribute("data-theme", saved);
  root.setAttribute("data-bs-theme", effective());

  // 2. Once the buttons exist: reveal and wire them.
  function ready() {
    var buttons = document.querySelectorAll("[data-cam-theme-toggle]");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].hidden = false;
      buttons[i].addEventListener("click", function () {
        var next = effective() === "dark" ? "light" : "dark";
        save(next);
        apply(next);
      });
    }
    sync();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ready);
  } else {
    ready();
  }

  // The OS setting changing matters only while the user hasn't chosen.
  if (osDark) {
    var onOs = function () { sync(); };
    if (osDark.addEventListener) osDark.addEventListener("change", onOs);
    else if (osDark.addListener) osDark.addListener(onOs); // Safari < 14
  }

  // Another tab changed the choice.
  window.addEventListener("storage", function (e) {
    if (e.key === KEY) apply(stored());
  });
})();

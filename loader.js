// Fetches the interface texts and the theme, then runs the engine files with them.
// The page lists the files in data attributes; ?v= on this script is passed to every file to skip stale caches.
// themes.json lists every theme for the theme selector; without it, the page has no selector.
(function () {
  // The engine files, in the order they run.
  const SCRIPTS = ["markup.js", "engine.js"];
  const me = document.currentScript;
  const version = new URL(me.src).search;
  const files = (me.dataset.i18n || "").split(/\s+/).filter(Boolean);
  const theme = me.dataset.theme;
  const getJson = f => fetch(f + version).then(r => { if (!r.ok) throw new Error(f + ": " + r.status); return r.json(); });
  Promise.all([getJson(theme), getJson("themes.json").catch(() => []), ...files.map(getJson)]).then(([themeData, catalog, ...dicts]) => {
    window.THEME = themeData;
    window.THEMES = catalog;
    window.I18N = {};
    files.forEach((f, i) => { window.I18N[f.split("/").pop().replace(".json", "")] = dicts[i]; });
    SCRIPTS.forEach(src => {
      const s = document.createElement("script");
      s.src = src + version;
      s.async = false;
      document.body.appendChild(s);
    });
  }).catch(err => {
    document.body.innerHTML = `<div style="font:16px/1.5 system-ui,sans-serif;max-width:560px;margin:40px auto;padding:0 16px">
      <h1 style="font-size:22px">O jogo não conseguiu carregar os arquivos</h1>
      <p>Ele precisa ser aberto por um servidor, como o GitHub Pages. No computador, rode <code>just run</code> (ou <code>python3 -m http.server</code>) nesta pasta e abra <a href="http://localhost:8000">http://localhost:8000</a>.</p>
      <p style="color:#888">${String(err.message).replace(/</g, "&lt;")}</p></div>`;
  });
})();

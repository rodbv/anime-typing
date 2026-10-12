// Shared jsdom harness for the typing app tests.
const {JSDOM} = require('jsdom');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
// The engine files the loader runs, in its order.
const ENGINE_SCRIPTS = JSON.parse(/const SCRIPTS = (\[[^\]]*\]);/.exec(read('loader.js'))[1]);

// jsdom has no fetch, so the loader's JSON files go into the page as globals, followed by the engine.
// A test can pass themeEdit to change the theme data before the page loads.
function inlineLoader(attrs, themeEdit) {
  const files = (/data-i18n="([^"]*)"/.exec(attrs)?.[1] || '').split(/\s+/).filter(Boolean);
  const i18n = Object.fromEntries(files.map(f => [path.basename(f, '.json'), JSON.parse(read(f))]));
  const themeFile = /data-theme="([^"]*)"/.exec(attrs)?.[1];
  const theme = themeFile && JSON.parse(read(themeFile));
  if (theme && themeEdit) themeEdit(theme);
  const catalog = fs.existsSync(path.join(ROOT, 'themes.json')) ? JSON.parse(read('themes.json')) : [];
  return `<script>window.I18N = ${JSON.stringify(i18n)}; window.THEMES = ${JSON.stringify(catalog)};${theme ? ` window.THEME = ${JSON.stringify(theme)};` : ''}</script>\n${ENGINE_SCRIPTS.map(f => `<script>\n${read(f)}\n</script>`).join('\n')}`;
}

const themeOf = (page = 'index.html') => /data-theme="([^"]*)"/.exec(read(page))[1];
// The localStorage key of the given theme file, or of the page's theme.
const storeKey = (page, theme) => JSON.parse(read(theme || themeOf(page))).storeKey;

// Inlines local scripts and stylesheets so jsdom runs the page without a server.
// A theme file replaces the page's theme, so a test can run any theme through the same page.
function pageHtml(page = 'index.html', themeEdit, theme) {
  return read(page)
    .replace(/data-theme="[^"]*"/, m => theme ? `data-theme="${theme}"` : m)
    .replace(/<script src="loader\.js[^"]*"([^>]*)><\/script>/, (_, attrs) => inlineLoader(attrs, themeEdit))
    .replace(/<script src="([^"?]+)(\?[^"]*)?"><\/script>/g, (_, src) => `<script>\n${read(src)}\n</script>`)
    .replace(/<link rel="stylesheet" href="([^"?]+)(\?[^"]*)?">/g, (_, href) => `<style>\n${read(href)}\n</style>`);
}

// Same sequence on every run, so the snapshot test sees the same lesson texts.
function seededRandom(seed) {
  return () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A clock frozen at `now`, for renders that depend on today's date.
function frozenDate(RealDate, now) {
  return class extends RealDate {
    constructor(...a) { if (a.length) super(...a); else super(now); }
    static now() { return now; }
  };
}

// A clock that moves only when the test calls tick(ms), which runs the timers that fall due on the way.
function fakeClock(w) {
  let now = w.Date.now(), lastId = 0;
  const timers = new Map();
  w.Date = class extends w.Date {
    constructor(...a) { if (a.length) super(...a); else super(now); }
    static now() { return now; }
  };
  const add = (fn, ms, every) => { timers.set(++lastId, {at: now + (ms || 0), fn, every}); return lastId; };
  w.setTimeout = (fn, ms) => add(fn, ms, 0);
  w.setInterval = (fn, ms) => add(fn, ms, ms);
  w.clearTimeout = w.clearInterval = id => timers.delete(id);
  return ms => {
    const end = now + ms;
    for (;;) {
      const [id, timer] = [...timers].filter(([, x]) => x.at <= end).sort((a, b) => a[1].at - b[1].at)[0] || [];
      if (!timer) break;
      now = timer.at;
      if (timer.every) timer.at += timer.every; else timers.delete(id);
      timer.fn();
    }
    now = end;
  };
}

function boot(storage, url = 'http://localhost/', opts = {}) {
  const errors = [];
  let tick = () => { throw new Error('boot with {clock: true} to use tick'); };
  const dom = new JSDOM(pageHtml(opts.page, opts.themeEdit, opts.theme), {runScripts: 'dangerously', pretendToBeVisual: true, url,
    beforeParse(w) {
      w.structuredClone = structuredClone; w.TextEncoder = TextEncoder; w.TextDecoder = TextDecoder;
      w.addEventListener('error', e => errors.push(e.message));
      if (opts.seed !== undefined) w.Math.random = seededRandom(opts.seed);
      if (opts.now !== undefined) w.Date = frozenDate(w.Date, opts.now);
      if (opts.clock) tick = fakeClock(w);
      if (storage) w.localStorage.setItem(storeKey(opts.page, opts.theme), storage);
    }});
  const w = dom.window, d = w.document;
  const ev = c => w.eval(c);
  const sink = d.getElementById('sink');
  return {
    w, d, ev, errors,
    tick: ms => tick(ms),
    key: (k, code) => d.dispatchEvent(new w.KeyboardEvent('keydown', {key: k, code, bubbles: true})),
    type: s => { for (const ch of s) { sink.value += ch; sink.dispatchEvent(new w.InputEvent('input', {data: ch})); } },
    vis: id => !d.getElementById(id).hidden,
    saved: () => w.localStorage.getItem(storeKey(opts.page, opts.theme)),
    ready: () => ev('S.setupDone=true; S.layout="intl"; save(); showView("home")'),
    // Plays a lesson to the end: closes the intro and types the text with the given number of misses at the start.
    playLesson: function (i, misses = 0) {
      ev(`startRun("lesson",{lessonIdx:${i}})`);
      if (ev('run.introOpen')) ev('closeIntro()');
      this.type('\u0001'.repeat(misses));
      this.type(ev('run.text'));
    }
  };
}
module.exports = {boot, seededRandom, storeKey, ROOT};

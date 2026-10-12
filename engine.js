/* ---------- helpers ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const rnd = n => Math.floor(Math.random() * n);
const pick = a => a[rnd(a.length)];
const cap = w => w.charAt(0).toUpperCase() + w.slice(1);
const uniq = a => [...new Set(a)];
const isLetter = c => /\p{L}/u.test(c);

/* ---------- keyboard layouts ---------- */
// layouts.js holds the layouts; these read the player's layout.
const strokes = (ch, accents) => strokesOn(S.layout, ch, accents);
const sanitize = (str, accents) => sanitizeFor(S.layout, str, accents);

/* ---------- storage ---------- */
const STORE_KEY = TH.storeKey;
const DEFAULTS = {
  settings: {layout: "intl", showKb: true, time: 60, accents: false, unlockAll: false, setupDone: false},
  lessons: {intl: {}, us: {}, abnt: {}}, keys: {intl: {}, us: {}, abnt: {}},
  best: {free: 0, quote: 0}, totals: {runs: 0, chars: 0}, unlocked: {}, history: [],
  profile: {name: ""}, days: {}, bestStreak: 0
};
function loadData() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) { d = null; }
  const base = structuredClone(DEFAULTS);
  if (!d || typeof d !== "object") return base;
  const out = {...base, ...d};
  out.settings = {...base.settings, ...(d.settings || {})};
  out.lessons = {...base.lessons, ...(d.lessons || {})};
  out.keys = {...base.keys, ...(d.keys || {})};
  out.best = {...base.best, ...(d.best || {})};
  out.totals = {...base.totals, ...(d.totals || {})};
  out.profile = {...base.profile, ...(d.profile || {})};
  out.days = d.days || {};
  if (!LAYOUTS[out.settings.layout]) out.settings.layout = "intl";
  return out;
}
// ?reset erases the saved progress for demos, and drops itself from the address so a reload keeps the new progress.
if (new URLSearchParams(location.search).has("reset")) {
  try { localStorage.removeItem(STORE_KEY); } catch (e) { /* storage unavailable */ }
  history.replaceState(null, "", location.pathname);
}
let data = loadData();
let S = data.settings;
function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch (e) { /* storage unavailable */ } }

/* ---------- theme check ---------- */
// The theme groups the course into stages in course order; a stage's rival races its last lesson.
const themeProblems = [];
const problem = (k, vars) => themeProblems.push(t(k, vars));
const stageWhere = n => t("tpStage", {n});
if (!TH.id) problem("tpNoId");
STAGES.forEach((st, si) => { if (!st.place) problem("tpNoPlace", {where: stageWhere(si + 1)}); });
STAGES.forEach((st, si) => (st.lessons || []).forEach(id => {
  const L = LESSON_DEFS.find(x => x.id === id);
  if (!L) problem("tpUnknownLesson", {where: stageWhere(si + 1), id});
  else L.stage = si;
}));
const VIEW = TH.journey.view ?? "line";
if (!["line", "snake", "map"].includes(VIEW)) problem("tpUnknownView", {id: VIEW});
if (VIEW === "map") [TH.journey.start, ...STAGES].forEach((st, i) => {
  if (!Array.isArray(st.pt)) problem("tpNoPoint", {where: i ? stageWhere(i) : "journey.start"});
});
STAGES.forEach((st, si) => {
  if (!st.rival) return;
  if (!RIVALS[st.rival]) problem("tpUnknownRival", {where: stageWhere(si + 1), id: st.rival});
  else {
    const last = LESSON_DEFS.find(L => L.id === st.lessons?.[st.lessons.length - 1]);
    if (last) last.race = st.rival;
  }
});
// Content that later screens read is checked here, so a theme mistake shows on this list instead of breaking a screen.
const lessonIds = new Set(LESSON_DEFS.map(L => L.id));
if (TH.quotes.filter(q => q[0].length < 60).length < 3) problem("tpQuotes");
TH.evolution.levels.forEach(lv => { if (!lessonIds.has(lv.lesson)) problem("tpUnknownLesson", {where: "evolution", id: lv.lesson}); });
Object.entries(RIVALS).forEach(([id, r]) => { if (!r.nm) problem("tpRivalName", {id}); });
TH.achievements.forEach(a => {
  const w = a.when || {}, where = t("tpAchievement", {id: a.id});
  if (!CONDITIONS[w.type]) problem("tpUnknownType", {where, id: w.type});
  if (w.lesson !== undefined && !lessonIds.has(w.lesson)) problem("tpUnknownLesson", {where, id: w.lesson});
  if (w.type === "stageCleared" && !(Number.isInteger(w.stage) && w.stage >= 0 && w.stage < STAGES.length)) problem("tpUnknownStage", {where, n: w.stage});
});
LESSON_DEFS.forEach((L, i) => {
  if (L.stage === undefined) problem("tpNoStage", {id: L.id});
  else if (i && L.stage < LESSON_DEFS[i - 1].stage) problem("tpLessonOrder", {id: L.id});
});
if (themeProblems.length) {
  document.body.innerHTML = `<div class="card" style="max-width:640px;margin:40px auto"><h1>${esc(t("tpTitle"))}</h1><ul>${themeProblems.map(p => `<li>${esc(p)}</li>`).join("")}</ul><p><a href="index.html">index.html</a></p></div>`;
  throw new Error("theme problems: " + themeProblems.join("; "));
}
/* ---------- lesson progress ---------- */
const progress = () => data.lessons[S.layout];
const lessonDone = id => (progress()[id]?.stars || 0) >= 1;
const lessonIndexOf = id => LESSON_DEFS.findIndex(L => L.id === id);
const milestoneDone = name => lessonDone(LESSON_DEFS[milestoneIdx(name)].id);
const isUnlocked = i => S.unlockAll || i === 0 || lessonDone(LESSON_DEFS[i - 1].id);
function nextLessonIdx() {
  for (let i = 0; i < LESSON_DEFS.length; i++) {
    if (!isUnlocked(i)) return i - 1;
    if (!lessonDone(LESSON_DEFS[i].id)) return i;
  }
  return LESSON_DEFS.length - 1;
}
const accentsOn = () => S.layout !== "us" && (S.accents || milestoneDone("accents"));

/* ---------- keyboard rendering ---------- */
function buildKb(el) {
  el.innerHTML = "";
  const kbd = {map: {}, keys: [], shiftL: null, shiftR: null, space: null, altgr: null};
  const L = LAYOUTS[S.layout];
  const mk = (cls, w) => {
    const k = document.createElement("div");
    k.className = "key " + cls;
    k.style.setProperty("--w", w);
    return k;
  };
  const special = (row, [label, w, id]) => {
    const k = mk("mod", w);
    k.textContent = label;
    row.appendChild(k);
    if (id === "space") { k.className = "key"; k.style.setProperty("--fc", "var(--f8)"); kbd.space = k; }
    else if (id) kbd[id] = k;
  };
  for (const r of [...L.rows, ROW4]) {
    const row = document.createElement("div");
    row.className = "row";
    (r.pre || []).forEach(s => special(row, s));
    if (r.keys) {
      const base = [...r.keys[0]], sh = [...r.keys[1]], fg = [...r.keys[2]].map(Number);
      base.forEach((b, i) => {
        const f = fg[i], k = mk("", 1);
        k.style.setProperty("--fc", `var(--f${FCOL[f]})`);
        if (isLetter(b) && b.toUpperCase() !== b) k.textContent = b.toUpperCase();
        else {
          const top = document.createElement("span"); top.className = "sh"; top.textContent = sh[i];
          const bot = document.createElement("span"); bot.textContent = b;
          k.append(top, bot);
        }
        if (b === "f" || b === "j") k.classList.add("bump");
        row.appendChild(k);
        kbd.map[b] = {el: k, f, shift: false, base: b};
        if (!kbd.map[sh[i]]) kbd.map[sh[i]] = {el: k, f, shift: true, base: b};
        kbd.keys.push({el: k, base: b});
      });
    }
    (r.post || []).forEach(s => special(row, s));
    el.appendChild(row);
  }
  kbd.map[" "] = {el: kbd.space, f: 8, shift: false, base: " "};
  return kbd;
}
function legendHtml() {
  const names = t("legend");
  return [0, 1, 2, 3, 8].map((f, i) => `<span><span class="dot" style="background:var(--f${f})"></span>${esc(names[i])}</span>`).join("");
}
function renderLegend() { $("#legend").innerHTML = legendHtml(); }

/* ---------- app state ---------- */
let view = "lessons";
let run = null;
let kb = null;
let composing = false;
let resetArmed = false;
const sink = $("#sink");

function applyTheme() {
  for (const [k, v] of Object.entries(TH.look.colors)) document.documentElement.style.setProperty("--" + k, v);
  $("#logo").innerHTML = `${esc(TH.look.logo[0])} <span>${esc(TH.look.logo[1])}</span>`;
  $("#deco").textContent = TH.look.deco;
  // Each theme has its own page and progress, so switching opens the other page.
  const catalog = window.THEMES || [];
  $("#theme-ctl").hidden = catalog.length < 2;
  $("#theme-seg").innerHTML = catalog.map(c => `<button data-page="${esc(c.page)}" class="${c.id === TH.id ? "on" : ""}">${esc(c.name)}</button>`).join("");
}
function applyI18n() {
  document.documentElement.lang = locale();
  document.querySelectorAll("[data-i18n]").forEach(e => { e.textContent = t(e.dataset.i18n); });
  renderLegend();
}
function syncSegs() {
  document.querySelectorAll(".seg[data-set]").forEach(seg => {
    const key = seg.dataset.set;
    seg.querySelectorAll("button").forEach(b => b.classList.toggle("on", String(S[key]) === b.dataset.val));
  });
  document.querySelectorAll("#tabs button").forEach(b => {
    const active = view === "type" ? (run ? MODE_SCREEN[run.mode] : "") : view;
    b.classList.toggle("on", b.dataset.view === active);
  });
}
// The typing view shows one panel at a time: the text, the pause menu, the lesson tip or the results.
const PANELS = {typing: ["#typing-area", "#type-actions"], menu: ["#menu"], intro: ["#intro"], results: ["#results"]};
function showPanel(name) {
  for (const [k, sels] of Object.entries(PANELS)) sels.forEach(sel => { $(sel).hidden = k !== name; });
}
// Each screen with its own #hash. render runs when the screen opens, enter is what Enter does there,
// keys takes every key press instead, and noTabs hides the tab bar.
const SCREENS = {
  home: {render: () => renderHome(), enter: () => startNext()},
  lessons: {render: () => renderLessons(), enter: () => startNext()},
  free: {render: () => renderFreeNote(), enter: () => startRun("free")},
  quotes: {render: () => renderQuoteNote(), enter: () => startQuote()},
  collection: {render: () => renderCollection()},
  stats: {render: () => renderStats()},
  prologue: {render: () => renderPrologue(), keys: e => handlePrologueKey(e), noTabs: true},
  setup: {render: () => renderSetup(), keys: e => handleSetupKey(e), noTabs: true},
  type: {keys: e => handleTypingKey(e)}
};
// The screen each kind of run starts from, and goes back to.
const MODE_SCREEN = {lesson: "lessons", free: "free", quote: "quotes"};
function showView(v, {replace = false, fromHistory = false} = {}) {
  const prev = view;
  if (v !== "type") run = null;
  view = v;
  document.querySelectorAll(".view").forEach(s => { s.hidden = s.id !== "v-" + v; });
  $("#tabs").hidden = !!SCREENS[v].noTabs;
  document.body.classList.toggle("focus", v === "type");
  SCREENS[v].render?.();
  syncSegs();
  if (!fromHistory) route(v, prev, replace);
}

/* ---------- routes ---------- */
// Each screen has its own #hash, so the browser Back button moves between screens and a reload stays on the screen.
const ROUTES = Object.keys(SCREENS);
function route(v, prev, replace) {
  if (!ROUTES.includes(v) || location.hash === "#" + v) return;
  // Leaving a lesson for the screen it started from steps back, so Back afterwards does not land on the finished lesson.
  if (prev === "type" && history.state?.from === v) { history.back(); return; }
  const state = {view: v, from: prev};
  if (replace || prev === "type") history.replaceState(state, "", "#" + v);
  else history.pushState(state, "", "#" + v);
}
window.addEventListener("popstate", () => {
  const v = location.hash.slice(1);
  if (!ROUTES.includes(v) || v === view) return;
  closeShare();
  if (v === "type" && !run) { showView("home", {replace: true}); return; }
  showView(v, {fromHistory: true});
});

/* ---------- lessons view ---------- */
function starRow(n) {
  return `<span class="stars">${[1, 2, 3].map(i => i <= n ? "★" : '<span class="off">★</span>').join("")}</span>`;
}
const lessonsInStage = si => LESSON_DEFS.filter(L => L.stage === si);
const fmtDist = n => Math.round(n).toLocaleString(locale()) + " " + (Math.round(n) === 1 && TH.journey.unitOne || TH.journey.unit);
// Fills a stage template from the theme strings with the stage fields and its formatted distance.
const stageText = (k, st) => t(k, {...st, dist: fmtDist(st.dist)});
function distTraveled() {
  return STAGES.reduce((dist, st, si) => {
    const ls = lessonsInStage(si);
    return dist + st.dist * ls.filter(L => lessonDone(L.id)).length / ls.length;
  }, 0);
}
function currentStageIdx() {
  const i = STAGES.findIndex((st, si) => lessonsInStage(si).some(L => !lessonDone(L.id)));
  return i === -1 ? STAGES.length - 1 : i;
}
// The start and the stages go along the rows, left to right, and every other row runs back.
function rowPoints(n, rows) {
  const sizes = Array.from({length: rows}, (_, r) => Math.floor(n / rows) + (r < n % rows ? 1 : 0));
  return sizes.flatMap((size, r) => Array.from({length: size}, (_, c) => {
    const x = size === 1 ? 320 : 60 + c * 520 / (size - 1);
    return [Math.round((r % 2 ? 640 - x : x) * 10) / 10, 145 + (r - (rows - 1) / 2) * 75];
  }));
}
function journeyPoints() {
  if (VIEW === "map") return [TH.journey.start.pt, ...STAGES.map(st => st.pt)];
  return rowPoints(STAGES.length + 1, VIEW === "snake" ? 3 : 1);
}
function mapSvg() {
  const pts = journeyPoints();
  const si = STAGES.findIndex((st, i) => lessonsInStage(i).some(L => !lessonDone(L.id)));
  let pos, done;
  if (si === -1) { pos = pts[pts.length - 1]; done = pts; }
  else {
    const ls = lessonsInStage(si), frac = ls.filter(L => lessonDone(L.id)).length / ls.length;
    const a = pts[si], b = pts[si + 1];
    pos = [a[0] + (b[0] - a[0]) * frac, a[1] + (b[1] - a[1]) * frac];
    done = [...pts.slice(0, si + 1), pos];
  }
  const line = ps => ps.map(q => q.map(v => v.toFixed(1)).join(",")).join(" ");
  const places = [TH.journey.start, ...STAGES];
  const dots = places.map((pl, i) => {
    const reached = i === 0 || stageCleared(i - 1);
    const [x, y] = pts[i];
    return `<circle cx="${x}" cy="${y}" r="5" style="fill:${reached ? "var(--accent)" : "var(--panel2)"};stroke:var(--accent)"/>` +
      (pl.label ? `<text x="${x}" y="${y + (pl.dy ?? 20)}" text-anchor="middle" style="fill:var(--muted);font:600 11px system-ui,sans-serif">${esc(pl.label)}</text>` : "");
  }).join("");
  return `<svg class="map" viewBox="20 30 600 230" role="img" aria-label="${esc(t("mapLabel"))}">
    <polyline points="${line(pts)}" style="fill:none;stroke:var(--line);stroke-width:3;stroke-dasharray:6 6"/>
    <polyline points="${line(done)}" style="fill:none;stroke:var(--accent);stroke-width:4;stroke-linecap:round"/>
    ${dots}
    <g transform="translate(${pos[0].toFixed(1)},${(pos[1] - 6).toFixed(1)})${VIEW === "map" ? " scale(-1,1)" : ""}"><text text-anchor="middle" style="font-size:26px">${TH.journey.marker}</text></g>
  </svg>`;
}
function lessonCard(L, i, nx) {
  const p = progress()[L.id];
  const locked = !isUnlocked(i);
  const keys = L.type === "keys" ? `<div class="keys">${[...lessonKeys(L)].map(c => `<span class="cap">${esc(c.toUpperCase())}</span>`).join("")}</div>` : `<div class="title">${esc(lessonTitle(L))}</div>`;
  const best = p ? ` · ${p.wpm} ${t("wpm")}` : "";
  const race = L.race ? `<span class="race-tag">🏁 ${esc(RIVALS[L.race].nm)}</span>` : "";
  const foot = locked ? `<span class="sub">${esc(t("preview"))}</span>` : `<span>${starRow(p?.stars || 0)}<span class="sub">${best}</span></span>`;
  return `<button class="lesson${locked ? " locked" : ""}${i === nx && !locked ? " next" : ""}" data-i="${i}" title="${esc(locked ? t("lockedTip") : t("passRule", {acc: passAcc({}), raceAcc: passAcc({race: true})}))}">
    <span class="n">${t("lesson")} ${i + 1}${locked ? " 🔒" : ""}</span>${keys}${race}${foot}</button>`;
}
function renderLessons() {
  const nx = nextLessonIdx();
  $("#lesson-grid").innerHTML = `<div class="card">${mapSvg()}<p class="sub" style="text-align:center;margin:4px 0 0">${esc(t("distOf", {a: fmtDist(distTraveled()), b: fmtDist(TOTAL_DIST)}))}</p></div>` +
    STAGES.map((st, si) => `<h2 class="stage-h">${esc(stageText("stageHead", st))}</h2>
      <div class="grid">${LESSON_DEFS.map((L, i) => L.stage === si ? lessonCard(L, i, nx) : "").join("")}</div>`).join("");
}
$("#lesson-grid").addEventListener("click", e => {
  const b = e.target.closest(".lesson");
  if (!b) return;
  const i = Number(b.dataset.i);
  startRun("lesson", {lessonIdx: i, preview: !isUnlocked(i)});
});

/* ---------- runs ---------- */
function newRun(mode, o = {}) {
  const r = {mode, lessonIdx: o.lessonIdx ?? null, quote: o.quote ?? null, preview: !!o.preview, text: "", pos: 0, started: 0, ended: 0,
    errAt: new Set(), miss: {}, done: false, els: [], curEl: null,
    limit: mode === "free" ? Number(S.time) : 0, nextEls: [], bannerShown: false, primary: null,
    pausedMs: 0, pauseStart: 0, lastKey: 0, menuOpen: false, errCount: {}, gaps: [], lastOk: 0, streak: 0, bestStreak: 0};
  if (mode === "lesson") {
    const L = LESSON_DEFS[r.lessonIdx];
    const parts = lessonParts(r.lessonIdx);
    r.text = parts.join(" ");
    r.bounds = [parts[0].length + 1, parts[0].length + parts[1].length + 2];
    r.intro = lessonIntro(L);
    r.introOpen = !!r.intro && (!!o.forceIntro || (!lessonDone(L.id) && !introSeen.has(L.id)));
    if (r.introOpen) introSeen.add(L.id);
  }
  else if (mode === "free") r.text = freeChunk(80);
  else { r.quote = r.quote || pick(TH.quotes); r.text = sanitize(r.quote[0], S.layout !== "us"); }
  if (mode === "lesson" && LESSON_DEFS[r.lessonIdx].race) r.race = makeRace(LESSON_DEFS[r.lessonIdx]);
  return r;
}
function startRun(mode, o) {
  run = newRun(mode, o);
  showView("type");
  renderRun();
}
// Leaves whatever the player is doing and opens the home screen.
function goHome() {
  showView("home");
}
function restart() {
  if (!run) return;
  startRun(run.mode, {lessonIdx: run.lessonIdx, preview: run.preview, quote: run.mode === "quote" ? run.quote : null});
}
function goBack() {
  const m = run ? run.mode : "lesson";
  showView(MODE_SCREEN[m]);
}
function runLabel() {
  if (run.mode === "lesson") return `${t("lesson")} ${run.lessonIdx + 1} · ${lessonTitle(LESSON_DEFS[run.lessonIdx])} · ${t("wpmGoal", {n: passWpm(run.lessonIdx)})}` +
    (run.race ? ` · 🏁 ${run.race.nm} (${run.race.wpm} ${t("wpm")})` : "") + (run.preview ? " · " + t("preview") : "");
  if (run.mode === "free") return `${t("tabFree")} · ${run.limit} s`;
  return t("tabQuotes") + (run.preview ? " · " + t("preview") : "");
}
function appendText(str) {
  const inner = $("#text-inner");
  let word = null;
  for (const ch of str) {
    const s = document.createElement("span");
    s.className = "c";
    s.textContent = ch;
    if (ch === " ") {
      s.classList.add("sp");
      inner.append(s, document.createTextNode("\u200B"));
      word = null;
    } else {
      if (!word) { word = document.createElement("span"); word.className = "w"; inner.appendChild(word); }
      word.appendChild(s);
    }
    run.els.push(s);
  }
}
function renderRun() {
  $("#fx").innerHTML = "";
  $("#type-label").textContent = runLabel();
  $("#text-inner").innerHTML = "";
  $("#text-inner").style.transform = "";
  appendText(run.text);
  $("#attrib").textContent = run.mode === "quote" ? run.quote[1] : "";
  showPanel("typing");
  $("#banner").hidden = true;
  $("#focus-overlay").hidden = true;
  $(".type-top .chips").hidden = run.mode === "lesson";
  $("#chip-acc").hidden = run.mode === "free";
  $("#m-goals").hidden = run.mode !== "lesson";
  if (run.mode === "lesson") $("#m-acc-goal").style.left = accBarPct(passAcc(LESSON_DEFS[run.lessonIdx])) + "%";
  $("#hint").classList.remove("insist");
  $("#kb").classList.remove("insist");
  $("#m-ghost").hidden = !run.race;
  kb = buildKb($("#kb"));
  updateChips();
  setCursor();
  $("#btn-tip").hidden = !run.intro || run.introOpen;
  if (run.introOpen) {
    showPanel("intro");
    renderIntro();
  } else focusSink();
}
function focusSink() {
  sink.value = "";
  sink.focus({preventScroll: true});
  $("#focus-overlay").hidden = true;
}
function setCursor() {
  if (run.curEl) run.curEl.classList.remove("cur");
  const el = run.els[run.pos];
  if (el) {
    el.classList.add("cur");
    run.curEl = el;
    const lh = parseFloat(getComputedStyle($("#text-inner")).lineHeight) || 40;
    $("#text-inner").style.transform = `translateY(${-Math.max(0, el.offsetTop - lh)}px)`;
  }
  scheduleHelp();
}
function keyName(c) {
  if (c === " ") return t("space");
  return isLetter(c) ? c.toUpperCase() : c;
}
function highlightNext() {
  run.nextEls.forEach(e => e.classList.remove("next", "next2"));
  run.nextEls = [];
  const ch = run.text[run.pos];
  const st = ch != null ? strokes(ch, true) : null;
  if (!st) { $("#hint").innerHTML = ""; return; }
  const mark = (el, cls) => { if (el) { el.classList.add(cls); run.nextEls.push(el); } };
  const labels = st.map((s, i) => {
    const info = kb.map[s.c];
    const cls = i === 0 ? "next" : "next2";
    const parts = [];
    if (s.altgr) { mark(kb.altgr, cls); parts.push("AltGr"); }
    if (info) {
      mark(info.el, cls);
      if (info.shift) { mark(info.f <= 3 ? kb.shiftR : kb.shiftL, cls); parts.push("Shift"); }
    }
    parts.push(keyName(s.c));
    return parts.join(" + ");
  });
  const first = kb.map[st[0].c];
  const finger = first ? `<span class="dot" style="background:var(--f${FCOL[first.f]})"></span>${esc(t("fingers")[first.f])}` : "";
  $("#hint").innerHTML = `${esc(t("next"))}: <b>${esc(labels.join(` ${t("then")} `))}</b> ${finger}`;
}
// Accuracy counts letters, not key presses: a letter is wrong once, however many tries it took.
function metrics() {
  let ms = activeMs();
  if (run.mode === "free") ms = Math.min(ms, run.limit * 1000);
  const minutes = Math.max(ms, 1000) / 60000;
  const tried = run.pos + (run.errAt.has(run.pos) ? 1 : 0);
  return {
    ms,
    wpm: run.started ? Math.round(run.pos / 5 / minutes) : 0,
    acc: tried ? Math.floor((tried - run.errAt.size) / tried * 100) : 100,
    errors: run.errAt.size,
    rhythm: rhythmGrade(run.gaps)
  };
}
// The accuracy bar spans 50% to 100%.
const accBarPct = acc => Math.max(0, (acc - 50) * 2);
// The speed bar spans 0 to twice the lesson's goal, so the goal sits in the middle.
const wpmBarPct = (wpm, goal) => Math.min(100, wpm / goal * 50);
// Speed over the first few keys swings too much to call it slow.
const SPEED_SETTLED = 10;
function updateChips() {
  const m = metrics();
  $("#s-wpm").textContent = m.wpm;
  $("#s-acc").textContent = m.acc;
  const secs = run.mode === "free" ? Math.max(0, Math.ceil(run.limit - m.ms / 1000)) : Math.floor(m.ms / 1000);
  $("#s-time").textContent = secs;
  const prog = run.mode === "free" ? Math.min(1, m.ms / (run.limit * 1000)) : run.pos / run.text.length;
  $("#m-prog").style.width = (prog * 100).toFixed(1) + "%";
  $("#m-prog-txt").textContent = run.mode === "free" ? `${secs} s` : `${Math.round(prog * 100)}%`;
  $("#m-acc").style.width = accBarPct(m.acc) + "%";
  $("#m-acc-txt").textContent = m.acc + "%";
  if (run.mode === "lesson") {
    const goal = passWpm(run.lessonIdx);
    $("#m-acc-bar").classList.toggle("low", m.acc < passAcc(LESSON_DEFS[run.lessonIdx]));
    $("#m-wpm").style.width = wpmBarPct(m.wpm, goal) + "%";
    $("#m-wpm-txt").textContent = `${m.wpm} / ${goal} ${t("wpm")}`;
    $("#m-wpm-bar").classList.toggle("low", run.pos >= SPEED_SETTLED && m.wpm < goal);
  }
  updateGhost();
}
function bumpKey(base, ok) {
  const ks = data.keys[S.layout];
  const s = ks[base] || (ks[base] = {h: 0, m: 0});
  if (ok) s.h++; else s.m++;
}
function typeChar(ch) {
  if (!run || run.done || run.introOpen || run.menuOpen || view !== "type") return;
  if (!run.started) run.started = Date.now();
  resume();
  run.lastKey = Date.now();
  const exp = run.text[run.pos];
  const st = strokes(exp, true);
  const base = (st && kb.map[st[0].c]?.base) || exp.toLowerCase();
  const el = run.els[run.pos];
  if (ch === exp) {
    const now = Date.now();
    if (run.lastOk && now - run.lastOk < 2000) run.gaps.push(now - run.lastOk);
    run.lastOk = now;
    run.streak = run.errAt.has(run.pos) ? 0 : run.streak + 1;
    run.bestStreak = Math.max(run.bestStreak, run.streak);
    streakFx();
    $("#kb").classList.remove("insist");
    $("#hint").classList.remove("insist");
    el.classList.remove("cur", "bad");
    el.classList.add(run.errAt.has(run.pos) ? "fixed" : "ok");
    if (!run.errAt.has(run.pos)) bumpKey(base, true);
    run.pos++;
    if (run.mode === "free" && run.pos > run.text.length - 60) {
      const more = " " + freeChunk(40);
      run.text += more;
      appendText(more);
    }
    if (run.pos >= run.text.length) { finish(); return; }
    const part = (run.bounds || []).indexOf(run.pos);
    if (part >= 0) {
      const L = LESSON_DEFS[run.lessonIdx];
      showToast(t("partDone", {n: part + 1, dist: fmtDist(STAGES[L.stage].dist / lessonsInStage(L.stage).length / 3)}));
    }
    setCursor();
  } else {
    run.streak = 0;
    el.classList.add("bad");
    run.errCount[run.pos] = (run.errCount[run.pos] || 0) + 1;
    clearTimeout(run.helpTimer);
    highlightNext();
    if (run.errCount[run.pos] >= 3) { $("#kb").classList.add("insist"); $("#hint").classList.add("insist"); }
    if (!run.errAt.has(run.pos)) {
      run.errAt.add(run.pos);
      bumpKey(base, false);
      run.miss[exp] = (run.miss[exp] || 0) + 1;
    }
  }
  updateChips();
}
function consumeSink() {
  const v = sink.value;
  sink.value = "";
  for (const ch of v) if (ch !== "\n" && ch !== "\r") typeChar(ch);
}
sink.addEventListener("compositionstart", () => { composing = true; });
sink.addEventListener("compositionend", () => { composing = false; consumeSink(); });
sink.addEventListener("input", e => { if (!composing && !e.isComposing) consumeSink(); });
sink.addEventListener("blur", () => {
  if (view !== "type" || !run || run.done || run.introOpen || run.menuOpen) return;
  if (run.started) pause("blur");
  else showOverlay(false);
});
$("#textbox").addEventListener("click", () => { if (run && !run.done) focusSink(); });

/* ---------- finishing ---------- */
function bestOverall() {
  const p = progress(), r1 = milestoneIdx("speedCounts");
  const lessonBest = Math.max(0, ...LESSON_DEFS.filter((L, i) => i >= r1 && lessonDone(L.id)).map(L => p[L.id].wpm || 0));
  return Math.max(data.best.free, data.best.quote, lessonBest);
}
function rankFor(w) {
  let cur = RANKS[0], nxt = null;
  for (let i = 0; i < RANKS.length; i++) if (w >= RANKS[i][0]) { cur = RANKS[i]; nxt = RANKS[i + 1] || null; }
  return [cur, nxt];
}
const rankName = r => LANG === "pt" ? r[2] : r[1];
function lessonCounts() {
  const p = progress();
  let cleared = 0, stars = 0;
  for (const L of LESSON_DEFS) {
    const s = p[L.id]?.stars || 0;
    if (s >= 1) cleared++;
    stars += s;
  }
  return {cleared, stars};
}
function checkAchievements(m) {
  const ctx = {run, m, lessons: progress()};
  const fresh = [];
  for (const a of ACHIEVEMENTS) {
    if (data.unlocked[a.id]) continue;
    let ok = false;
    try { ok = CONDITIONS[a.when.type](a.when, ctx); } catch (e) { ok = false; }
    if (ok) { data.unlocked[a.id] = Date.now(); fresh.push(a); }
  }
  return fresh;
}
function finish() {
  run.done = true;
  run.ended = Date.now();
  if (run.curEl) run.curEl.classList.remove("cur");
  sink.blur();
  $("#focus-overlay").hidden = true;
  const m = metrics();
  let title, record = false, extra = "";
  run.passed = false;
  if (run.mode === "lesson") {
    const L = LESSON_DEFS[run.lessonIdx];
    const st = starsFor(m.wpm, m.acc, run.lessonIdx);
    const prev = progress()[L.id];
    run.wasNew = !lessonDone(L.id);
    record = !run.preview && !!prev && st >= 1 && m.wpm > prev.wpm;
    run.passed = st >= 1;
    if (!run.preview) {
      const due = run.passed && !run.wasNew && reviewDue(L);
      progress()[L.id] = {...prev, stars: Math.max(st, prev?.stars || 0), wpm: Math.max(m.wpm, prev?.wpm || 0), acc: Math.max(m.acc, prev?.acc || 0), last: Date.now(),
        cleared: prev?.cleared || (run.passed ? Date.now() : undefined), reviews: (prev?.reviews || 0) + (due ? 1 : 0)};
    }
    if (run.race) {
      const place = racePlace(m.ms);
      if (run.passed && !run.preview) progress()[L.id].place = Math.min(progress()[L.id].place || 9, place);
      extra += raceResultHtml(place, m.ms);
    }
    title = run.preview ? t("previewDone") : run.passed ? t("cleared")
      : m.acc < passAcc(L) ? t("failedAcc", {n: passAcc(L)}) : t("failedWpm", {n: passWpm(run.lessonIdx)});
    extra = `<div style="font-size:28px">${starRow(st)}</div>` + extra;
  } else {
    const prev = data.best[run.mode];
    record = !run.preview && prev > 0 && m.wpm > prev;
    if (!run.preview && m.wpm > prev) data.best[run.mode] = m.wpm;
    title = run.preview ? t("previewDone") : run.mode === "free" ? t("timeUp") : t("quoteDone");
    const [cur, nxt] = rankFor(bestOverall());
    extra = `<p>${esc(t("rank"))}: <b>${esc(rankName(cur))}</b>${nxt ? " · " + esc(t("nextRank", {r: rankName(nxt), n: nxt[0]})) : ""}</p>`;
  }
  const mission = updateMission(m);
  let fresh = [];
  if (!run.preview) {
    data.bestStreak = Math.max(data.bestStreak || 0, run.bestStreak);
    data.totals.runs++;
    data.totals.chars += run.pos;
    data.history.push({t: Date.now(), mode: run.mode, wpm: m.wpm, acc: m.acc, layout: S.layout,
      label: run.mode === "lesson" ? String(run.lessonIdx + 1) : run.mode === "quote" ? run.quote[1] : run.limit + " s"});
    if (data.history.length > 300) data.history.splice(0, data.history.length - 300);
    fresh = checkAchievements(m);
    save();
  }

  const missed = Object.entries(run.miss).sort((a, b) => b[1] - a[1]);
  const missHtml = missed.length
    ? `<div class="kchips">${missed.map(([c, n]) => `<span class="cap">${esc(c === " " ? "␣" : c)}<small style="margin-left:4px;color:var(--err)">${n}</small></span>`).join("")}</div>`
    : `<p>${esc(t("noMiss"))}</p>`;
  const unlockHtml = fresh.map(a => `<div class="unlock"><span class="ic">${a.ic}</span><div><span class="flair">${esc(t("flair"))} ${esc(t("unlocked"))}</span><br><b>${esc(a.nm)}</b> · <span class="sub">${esc(a.d)}</span></div></div>`).join("");

  const btns = [];
  const hasNext = run.mode === "lesson" && run.passed && !run.preview && run.lessonIdx < LESSON_DEFS.length - 1;
  const courseDone = run.mode === "lesson" && run.passed && !run.preview && run.lessonIdx === LESSON_DEFS.length - 1;
  if (hasNext) btns.push(["next", t("nextLesson"), true], ["again", t("again"), false]);
  else if (run.mode === "quote") btns.push(["nextq", t("nextQuote"), true], ["again", t("again"), false]);
  else if (courseDone) btns.push(["home", t("proHome"), true], ["again", t("again"), false]);
  else btns.push(["again", t("again"), true]);
  btns.push(["back", t("back") + " (Esc)", false]);
  if (mission.justDone) {
    const keep = btns[0][0];
    btns.splice(0, btns.length, ["home", t("seeYou"), true], [keep, t("keepTraining"), false], ["back", t("back") + " (Esc)", false]);
  }
  if (!btns.some(b => b[0] === "home")) btns.push(["home", t("tabHome"), false]);
  const actions = {
    home: goHome,
    next: () => startRun("lesson", {lessonIdx: run.lessonIdx + 1}),
    nextq: () => startRun("quote", {preview: run.preview}),
    again: () => restart(),
    back: () => goBack(),
    share: () => openShare()
  };
  run.primary = actions[btns[0][0]];

  const r = $("#results");
  r.innerHTML = `
    ${mission.justDone ? `<div class="done-box">🔥 <b>${esc(t("missionDoneTitle"))}</b> ${esc(t("missionDoneText", {name: data.profile.name || TH.hero.short}))}</div>` : ""}
    <h2 class="rt">${esc(title)} ${record ? `<span class="flair">${esc(t("flair"))} ${esc(t("newRecord"))}</span>` : ""}</h2>
    ${mission.breakNow ? `<p class="tipline">⏸️ ${esc(t("breakMsg"))}</p>` : ""}
    ${extra}
    ${resultTip(m, missed)}
    <div class="big">
      <div class="stat"><b>${m.wpm}</b><span>${esc(t("wpm"))}</span></div>
      <div class="stat"><b>${m.acc}%</b><span>${esc(t("accuracy"))}</span></div>
      <div class="stat"><b>${Math.round(m.ms / 1000)}s</b><span>${esc(t("time"))}</span></div>
      <div class="stat"><b>${m.errors}</b><span>${esc(t("errors"))}</span></div>
      <div class="stat"><b>${m.rhythm}</b><span>${esc(t("rhythm"))}</span></div>
    </div>
    ${unlockHtml}
    <h2 style="margin-top:14px">${esc(t("missed"))}</h2>${missHtml}
    <div class="type-actions">${btns.map(([id, label, primary]) => `<button class="btn${primary ? " primary" : ""}" data-act="${id}">${esc(label)}${primary ? " " + esc(t("enterHint")) : ""}</button>`).join("")}${run.preview ? "" : `<button class="btn" data-act="share">${esc(t("shareBtn"))}</button>`}</div>`;
  r.querySelectorAll("[data-act]").forEach(b => b.addEventListener("click", () => actions[b.dataset.act]()));
  showPanel("results");
}

setInterval(() => {
  if (view !== "type" || !run || run.done || !run.started) return;
  if (!run.pauseStart && !run.menuOpen && !run.introOpen && Date.now() - run.lastKey > 5000) pause("idle");
  updateChips();
  if (run.mode === "free" && activeMs() >= run.limit * 1000) finish();
}, 200);

/* ---------- theme effects ---------- */
// The theme's flair while typing: marks float up during a long run of hits, and a burst of words fills the box at each milestone.
const FX = TH.fx;
const calmMotion = () => !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
// Positions come from the streak instead of Math.random, so a seeded run keeps the same lesson texts.
const fxSpot = (n, salt) => (n * 37 + salt * 53) % 90 + 5;
function floatFx(kind, text, x, y, delay = 0) {
  const el = document.createElement("span");
  el.className = "fx " + kind;
  el.textContent = text;
  el.style.left = x + "%";
  el.style.top = y + "%";
  el.style.animationDelay = delay + "ms";
  el.addEventListener("animationend", () => el.remove());
  $("#fx").appendChild(el);
}
function streakFx() {
  const s = run.streak;
  if (calmMotion() || !s) return;
  // The marks rise along the left and right edges of the box, as in the manga, and leave the text clear.
  if (FX.marks.length && s >= FX.marksAt && s % 2 === 0) floatFx("mark", FX.marks[s / 2 % FX.marks.length], (s / 2 % 2 ? 1 : 92) + s % 4, fxSpot(s, 1) * 0.7);
  if (FX.rush && s % FX.rushEvery === 0) for (let i = 0; i < 6; i++) floatFx("rush", FX.rush, fxSpot(s, i + 2), fxSpot(s, i + 9) * 0.7, i * 70);
}

/* ---------- global keys ---------- */
const onButton = e => !!(e.target.closest && e.target.closest("button, a"));
document.addEventListener("keydown", e => {
  if (!$("#share").hidden) { if (e.key === "Escape") { e.preventDefault(); closeShare(); } return; }
  const screen = SCREENS[view];
  if (screen?.keys) screen.keys(e);
  else if (e.key === "Enter" && !onButton(e)) screen?.enter?.();
});
function handleTypingKey(e) {
  if (!run) return;
  if (run.introOpen) {
    if (e.key === "Enter") { e.preventDefault(); closeIntro(); }
    else if (e.key === "Escape") { e.preventDefault(); if (run.started || run.tipOpen) closeIntro(); else goBack(); }
    return;
  }
  if (run.menuOpen) {
    if (e.key === "Escape" || (e.key === "Enter" && !onButton(e))) { e.preventDefault(); closeMenu(); }
    return;
  }
  if (e.key === "Escape") { e.preventDefault(); if (run.done) goBack(); else openMenu(); return; }
  if (e.key === "Enter") { if (onButton(e)) return; e.preventDefault(); if (run.done && run.primary) run.primary(); return; }
  if (e.key === "Tab") { e.preventDefault(); return; }
  if (run.done) return;
  $("#caps").hidden = !(e.getModifierState && e.getModifierState("CapsLock"));
  if (!run.bannerShown) {
    let suggest = null;
    if (S.layout !== "abnt" && (e.key === "ç" || e.key === "Ç") && e.code === "Semicolon") suggest = "abnt";
    else if (S.layout === "abnt" && e.code === "Semicolon" && (e.key === ";" || e.key === ":")) suggest = "intl";
    else if (S.layout === "intl" && e.code === "Quote" && (e.key === "'" || e.key === '"')) suggest = "us";
    else if (S.layout === "us" && e.code === "Quote" && e.key === "Dead") suggest = "intl";
    if (suggest) {
      run.bannerShown = true;
      run.suggest = suggest;
      $("#banner-msg").textContent = t({abnt: "layoutHintAbnt", intl: "layoutHintIntl", us: "layoutHintUs"}[suggest]);
      $("#banner").hidden = false;
    }
  }
  if (e.key.length === 1 && kb) {
    const info = kb.map[e.key];
    if (info) { info.el.classList.add("press"); setTimeout(() => info.el.classList.remove("press"), 110); }
  }
  if (document.activeElement !== sink) focusSink();
}

$("#banner-yes").addEventListener("click", () => { setSetting("layout", run.suggest); });
$("#banner-no").addEventListener("click", () => { $("#banner").hidden = true; focusSink(); });
$("#btn-free").addEventListener("click", () => startRun("free"));
$("#btn-quote").addEventListener("click", () => startQuote());
$("#logo").addEventListener("click", () => { if (view !== "card") goHome(); });
$("#tabs").addEventListener("click", e => {
  const b = e.target.closest("button");
  if (!b) return;
  showView(b.dataset.view);
});

/* ---------- settings ---------- */
function setSetting(key, val) {
  S[key] = key === "time" ? Number(val) : val;
  save();
  applyTheme();
  applyI18n();
  syncSegs();
  if (view === "type" && run && !run.done) restart();
  else if (view === "type" && run && run.done) goBack();
  else showView(view);
}
$("#theme-seg").addEventListener("click", e => {
  const b = e.target.closest("button");
  if (b && !b.classList.contains("on")) location.href = b.dataset.page;
});
document.querySelectorAll(".seg[data-set]").forEach(seg => {
  seg.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (!b) return;
    if (view === "setup" && seg.dataset.set === "layout") { chooseLayout(b.dataset.val); renderSetup(); }
    else setSetting(seg.dataset.set, b.dataset.val);
  });
});

/* ---------- collection ---------- */
function renderCollection() {
  const got = achievementsGot();
  $("#coll-summary").textContent = t("collSummary", {n: got, t: ACHIEVEMENTS.length});
  const names = t("collGroups"), groups = uniq(ACHIEVEMENTS.map(a => a.s));
  $("#collection").innerHTML = groups.map(g => `
    <div class="coll-group"><h2>${esc(names[g] ?? g)}</h2><div class="coll">
    ${ACHIEVEMENTS.filter(a => a.s === g).map(a => {
      const u = data.unlocked[a.id];
      return `<div class="item ${u ? "got" : "locked"}"><span class="ic">${a.ic}</span><div>
        <div class="nm">${esc(a.nm)}${u ? "" : " 🔒"}</div><div class="ds">${esc(a.d)}</div>
        ${u ? `<div class="ds">${new Date(u).toLocaleDateString(locale())}</div>` : ""}</div></div>`;
    }).join("")}</div></div>`).join("");
}

/* ---------- stats ---------- */
function sparkline(vals) {
  if (vals.length < 2) return `<p class="sub">${esc(t("noData"))}</p>`;
  const max = Math.max(...vals, 10), w = 300, h = 60;
  const pts = vals.map((v, i) => `${(i / (vals.length - 1) * w).toFixed(1)},${(h - v / max * (h - 6) - 3).toFixed(1)}`).join(" ");
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="70" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="2.5" vector-effect="non-scaling-stroke"/></svg>`;
}
function renderStats() {
  const lc = lessonCounts();
  const best = bestOverall();
  const [cur, nxt] = rankFor(best);
  const pct = nxt ? Math.min(100, Math.round((best - cur[0]) / (nxt[0] - cur[0]) * 100)) : 100;
  const hist = data.history.slice(-12).reverse();
  const ks = data.keys[S.layout];
  const weak = Object.entries(ks).filter(([c, s]) => c !== " " && s.h + s.m >= 10)
    .map(([c, s]) => [c, s.m / (s.h + s.m)]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const loc = locale();

  $("#stats").innerHTML = sheetCardHtml() + raceTableHtml() + `
    <div class="statgrid">
      <div class="card"><h2>${esc(t("rank"))}</h2><b>${esc(rankName(cur))}</b>
        <div class="bar"><i style="width:${pct}%"></i></div>
        <div class="sub">${nxt ? esc(t("nextRank", {r: rankName(nxt), n: nxt[0]})) : "MAX"}</div></div>
      <div class="card"><h2>${esc(t("bestFree"))}</h2><b>${data.best.free} ${esc(t("wpm"))}</b></div>
      <div class="card"><h2>${esc(t("bestQuote"))}</h2><b>${data.best.quote} ${esc(t("wpm"))}</b></div>
      <div class="card"><h2>${esc(t("lessonsCleared"))}</h2><b>${lc.cleared} / ${LESSON_DEFS.length}</b><div class="sub">${esc(t("starsTotal"))}: ${lc.stars} / ${LESSON_DEFS.length * 3}</div></div>
    </div>
    <div class="stack">
      <div class="card"><h2>${esc(t("trend"))}</h2>${sparkline(data.history.slice(-30).map(h => h.wpm))}</div>
      <div class="card"><h2>${esc(t("heat"))}</h2><div class="kb" id="heat-kb" style="border:0;padding:0"></div>
        <h2 style="margin-top:14px">${esc(t("weak"))}</h2>
        ${weak.length ? `<div class="kchips">${weak.map(([c, r]) => `<span class="cap">${esc(c.toUpperCase())}<small style="margin-left:4px;color:var(--err)">${Math.round(r * 100)}%</small></span>`).join("")}</div>` : `<p class="sub">${esc(t("noData"))}</p>`}
      </div>
      <div class="card"><h2>${esc(t("history"))}</h2>
        ${hist.length ? `<table><tr><th>${esc(t("date"))}</th><th>${esc(t("mode"))}</th><th>${esc(t("wpm"))}</th><th>%</th></tr>
        ${hist.map(h => `<tr><td>${new Date(h.t).toLocaleString(loc, {dateStyle: "short", timeStyle: "short"})}</td><td>${esc(t("modes")[h.mode])} ${esc(h.label || "")}</td><td>${h.wpm}</td><td>${h.acc}</td></tr>`).join("")}</table>` : `<p class="sub">${esc(t("noData"))}</p>`}
      </div>
      <div class="card"><h2>${esc(t("settings"))}</h2>
        <label class="toggle"><input type="checkbox" id="opt-kb" ${S.showKb ? "checked" : ""}> ${esc(t("showKb"))}</label>
        <label class="toggle"><input type="checkbox" id="opt-acc" ${S.accents ? "checked" : ""}> ${esc(t("accents"))}</label>
        <label class="toggle"><input type="checkbox" id="opt-unlock" ${S.unlockAll ? "checked" : ""}> ${esc(t("unlockAll"))}</label>
        <button class="btn small" id="btn-redo" style="margin-top:8px">${esc(t("redoSetup"))}</button>
        <button class="btn small" id="btn-prologue" style="margin-top:8px">${esc(t("replayPrologue"))}</button>
        <button class="btn small" id="btn-share" style="margin-top:8px">${esc(t("shareBtn"))}</button>
        <button class="btn small" id="btn-reset" style="margin-top:8px">${esc(t("reset"))}</button>
      </div>
    </div>`;

  const heat = buildKb($("#heat-kb"));
  for (const {el, base} of heat.keys) {
    const s = ks[base];
    if (!s || s.h + s.m < 5) continue;
    const rate = s.m / (s.h + s.m);
    el.style.background = `color-mix(in srgb, var(--err) ${Math.round(Math.min(1, rate * 4) * 85)}%, var(--panel2))`;
    el.title = `${base}: ${Math.round(rate * 100)}%`;
  }
  $("#opt-kb").addEventListener("change", e => { S.showKb = e.target.checked; save(); });
  $("#opt-acc").addEventListener("change", e => { S.accents = e.target.checked; save(); });
  $("#opt-unlock").addEventListener("change", e => { S.unlockAll = e.target.checked; save(); });
  $("#btn-redo").addEventListener("click", () => { setup = {step: 1, layout: null, msg: ""}; showView("setup"); });
  $("#btn-prologue").addEventListener("click", () => { prologueAt = 0; showView("prologue"); });
  $("#btn-share").addEventListener("click", openShare);
  resetArmed = false;
  $("#btn-reset").addEventListener("click", e => {
    if (!resetArmed) { resetArmed = true; e.target.textContent = t("resetConfirm"); return; }
    const keep = S;
    data = structuredClone(DEFAULTS);
    data.settings = keep;
    S = data.settings;
    save();
    renderStats();
  });
}

/* ---------- hand illustrations ---------- */
const HOME = {intl: "asdfjkl;", us: "asdfjkl;", abnt: "asdfjklç"};
let svgSeq = 0;
function keyGeometry() {
  const U = 36, G = 4, step = U + G;
  const pos = {}, ids = {}, rects = [];
  [...LAYOUTS[S.layout].rows, ROW4].forEach((r, ri) => {
    let x = 0;
    const y = ri * step;
    const addSpecial = ([label, w, id]) => {
      const rc = {x, y, w: w * step - G, h: U, label, special: id !== "space", f: id === "space" ? 8 : null};
      rects.push(rc);
      if (id) ids[id] = rc;
      x += w * step;
    };
    (r.pre || []).forEach(addSpecial);
    if (r.keys) {
      const base = [...r.keys[0]], sh = [...r.keys[1]], fg = [...r.keys[2]].map(Number);
      base.forEach((b, i) => {
        const rc = {x, y, w: U, h: U, label: isLetter(b) && b.toUpperCase() !== b ? b.toUpperCase() : b, f: fg[i]};
        rects.push(rc);
        pos[b] = rc;
        if (!pos[sh[i]]) pos[sh[i]] = rc;
        x += step;
      });
    }
    (r.post || []).forEach(addSpecial);
  });
  pos[" "] = ids.space;
  return {pos, ids, rects, width: 15 * step - G, bottom: 5 * step - G};
}
const centerOf = rc => [rc.x + rc.w / 2, rc.y + rc.h / 2];
function handShapes(g) {
  const home = HOME[S.layout], sp = g.ids.space, out = [];
  const hand = (fingers, thumbX, side) => {
    const tips = fingers.map(f => centerOf(g.pos[home[f]]));
    const px = tips.reduce((a, q) => a + q[0], 0) / tips.length;
    const py = g.bottom + 52;
    out.push(`<ellipse cx="${px}" cy="${py}" rx="78" ry="36" style="fill:var(--text);opacity:.12"/>`);
    fingers.forEach((f, i) => {
      const [tx, ty] = tips[i];
      out.push(`<line x1="${px - 48 + i * 32}" y1="${py - 22}" x2="${tx}" y2="${ty}" style="stroke:var(--f${FCOL[f]});stroke-width:18;stroke-linecap:round;opacity:.45"/>`);
      out.push(`<circle cx="${tx}" cy="${ty}" r="13" style="fill:var(--f${FCOL[f]});stroke:#111;stroke-width:1.5"/>`);
    });
    const ty = sp.y + sp.h / 2;
    out.push(`<line x1="${px + side * 70}" y1="${py + 4}" x2="${thumbX}" y2="${ty}" style="stroke:var(--f8);stroke-width:18;stroke-linecap:round;opacity:.45"/>`);
    out.push(`<circle cx="${thumbX}" cy="${ty}" r="11" style="fill:var(--f8);stroke:#111;stroke-width:1.5"/>`);
  };
  hand([0, 1, 2, 3], sp.x + sp.w * 0.42, 1);
  hand([4, 5, 6, 7], sp.x + sp.w * 0.55, -1);
  return out.join("");
}
// o.hi: chars or key ids to highlight; o.reach: [from, to] arrows.
function handsSvg(o = {}) {
  const g = keyGeometry(), mid = "arrow" + (++svgSeq), H = g.bottom + 90;
  const look = k => g.pos[k] || g.ids[k];
  const hiRects = new Set((o.hi || []).map(look).filter(Boolean));
  let s = `<svg class="hands" viewBox="-6 -6 ${g.width + 12} ${H + 12}" role="img">
    <defs><marker id="${mid}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--accent2)"/></marker></defs>`;
  const tipRects = new Set(o.hands === false ? [] : [...HOME[S.layout]].map(k => g.pos[k]));
  for (const rc of g.rects) {
    const on = hiRects.has(rc);
    const fill = rc.f == null ? (on ? "var(--accent)" : "var(--panel2)") : `color-mix(in srgb, var(--f${FCOL[rc.f]}) ${on ? 85 : 22}%, var(--panel2))`;
    s += `<rect x="${rc.x}" y="${rc.y}" width="${rc.w}" height="${rc.h}" rx="5" style="fill:${fill};stroke:${on ? "var(--accent)" : "var(--line)"};stroke-width:${on ? 3 : 1}"/>`;
  }
  for (const k of ["f", "j"]) {
    const rc = g.pos[k];
    s += `<rect x="${rc.x + rc.w / 2 - 6}" y="${rc.y + rc.h - 6}" width="12" height="2" rx="1" style="fill:var(--text);opacity:.7"/>`;
  }
  if (o.hands !== false) s += handShapes(g);
  for (const rc of g.rects) {
    if (!rc.label) continue;
    const dark = hiRects.has(rc) || tipRects.has(rc);
    s += `<text x="${rc.x + rc.w / 2}" y="${rc.y + rc.h / 2 + 5}" text-anchor="middle" style="fill:${dark ? "#111" : "var(--text)"};font:${rc.special ? "600 10px system-ui,sans-serif" : "700 14px ui-monospace,monospace"}">${esc(rc.label)}</text>`;
  }
  for (const [a, b] of o.reach || []) {
    const ra = look(a), rb = look(b);
    if (!ra || !rb) continue;
    const [x1, y1] = centerOf(ra), [x2, y2] = centerOf(rb);
    s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#${mid})" style="stroke:var(--accent2);stroke-width:3;stroke-dasharray:5 4"/>`;
  }
  return s + "</svg>";
}
function tipList(k) {
  const p = HOME[S.layout][7].toUpperCase();
  return (T[LANG][k] || T.pt[k] || []).map(x => x.split("{p}").join(p));
}
function lessonIntro(L) {
  const homeAll = [...HOME[S.layout]];
  if (L.id === "fj") return {title: t("in_fj_t"), bullets: tipList("in_fj"), hi: ["f", "j"], reach: []};
  if (L.id === "a") return {title: t("in_a_t"), bullets: tipList("in_a"), hi: homeAll, reach: []};
  if (L.id === "r1") return {title: t("rv_home"), bullets: tipList("in_r1"), hi: homeAll, reach: []};
  return LESSON_TYPES[L.type].intro(L);
}
function shiftIntro() {
  const homeAll = [...HOME[S.layout]];
  return {title: t("shiftLesson"), bullets: tipList("in_shift"), hi: ["shiftL", "shiftR"], reach: [[homeAll[0], "shiftL"], [homeAll[7], "shiftR"]]};
}
function accentIntro(L) {
  const title = lessonTitle(L), n = L.level;
  if (S.layout === "intl") return {title, bullets: tipList(`in_acc${n}_intl`), hi: n === 1 ? ["'", "~"] : ["^", "`", ",", "altgr"], reach: []};
  if (S.layout === "abnt") return {title, bullets: tipList(`in_acc${n}_abnt`), hi: n === 1 ? ["´", "~"] : ["^", "`", "ç"], reach: []};
  return {title, bullets: tipList("in_acc_us"), hi: [], reach: []};
}
const quoteIntro = () => ({title: t("quotesLesson"), bullets: tipList(S.layout === "intl" ? "in_q_intl" : "in_q"), hi: [",", ".", "!", "?", "shiftL", "shiftR"], reach: []});
// Each new key gets a line: a home key stays put, any other key is a reach from the finger's home key.
function keysIntro(L) {
  const g = keyGeometry(), keys = [...lessonKeys(L)], bullets = [], reach = [];
  for (const k of keys) {
    const rc = g.pos[k];
    if (!rc) continue;
    const h = HOME[S.layout][rc.f];
    const vars = {k: keyName(k), f: t("fingers")[rc.f], h: keyName(h)};
    if (h === k) bullets.push(t("homeKeyLine", vars));
    else { bullets.push(t("reachLine", vars)); reach.push([h, k]); }
  }
  const extra = T[LANG]["in_x_" + L.id];
  if (extra) bullets.push(extra);
  return {title: `${t("newKeys")}: ${keys.map(keyName).join(" ")}`, bullets, hi: keys, reach};
}
const introSeen = new Set();
function storyHtml(L) {
  const st = STORY[L.id] || {}, stage = STAGES[L.stage], rival = L.race ? RIVALS[L.race] : null;
  return `<div class="stage-tag">${esc(stageText("stageTag", stage))}</div>` +
    (st.narr ? `<p class="narr">${esc(st.narr)}</p>` : "") +
    (st.mentor ? `<div class="bubble"><b>${esc(TH.mentor.name)}:</b> ${esc(st.mentor)}</div>` : "") +
    (rival ? `<div class="bubble rival"><b>${esc(rival.nm)}${rival.no ? esc(t("runnerNo", {no: rival.no})) : ""}:</b> ${esc(rival.pre)}</div>` : "") +
    (rival && run && run.race ? `<p class="sub">🏁 ${esc(t("raceRule", {nm: rival.nm, wpm: run.race.wpm, acc: passAcc(L)}))}</p>` : "");
}
function renderIntro() {
  const I = run.intro;
  $("#intro").innerHTML = `${storyHtml(LESSON_DEFS[run.lessonIdx])}
    <h2 class="rt" style="margin-top:16px">${esc(I.title)}</h2>${handsSvg({hi: I.hi, reach: I.reach})}
    <div class="legend">${legendHtml()}</div>
    <ul class="tips">${I.bullets.map(b => `<li>${esc(b)}</li>`).join("")}</ul>
    <div class="type-actions"><button class="btn primary" id="intro-go">${esc(run.started || run.tipOpen ? t("backToTyping") : t("gotIt"))}</button>
      ${run.started || run.tipOpen ? "" : `<button class="btn" id="intro-back">${esc(t("back"))} (Esc)</button>`}</div>`;
  $("#intro-go").addEventListener("click", closeIntro);
  $("#intro-back")?.addEventListener("click", goBack);
}
function closeIntro() {
  run.introOpen = false;
  run.tipOpen = false;
  showPanel("typing");
  $("#btn-tip").hidden = false;
  setCursor();
  focusSink();
  if (run.pauseStart) showOverlay(true);
}
function resultTip(m, missed) {
  let s = "";
  if (m.acc < 90) s = t("tipSlow");
  else if (m.acc >= 97 && m.wpm < 15) s = t("tipRhythm");
  const worst = missed.find(([c]) => c !== " ");
  if (worst) {
    const st = strokes(worst[0], true);
    const info = st && kb.map[st[0].c];
    if (info) s += (s ? " " : "") + t("tipKey", {k: keyName(worst[0]), f: t("fingers")[info.f]});
  }
  return s ? `<p class="tipline">💡 ${esc(s)}</p>` : "";
}

/* ---------- home view ---------- */
function startNext() {
  const i = nextLessonIdx();
  if (i >= 0 && isUnlocked(i)) startRun("lesson", {lessonIdx: i});
}
function renderHome() {
  const lc = lessonCounts(), nx = Math.max(0, nextLessonIdx()), stg = STAGES[currentStageIdx()];
  const [cur] = rankFor(bestOverall());
  const got = achievementsGot();
  const first = lc.cleared === 0 && data.totals.runs === 0;
  const prof = data.profile;
  $("#home").innerHTML = `
    <div class="card hero">
      <div class="sub">${esc(t("racerTag", {n: TH.hero.number, name: prof.name || TH.hero.name}))}</div>
      <h1>${esc(stg.lbl)}: ${esc(stg.place)}</h1>
      <p class="sub" style="font-size:15px;margin:0 0 14px">${esc([stageText("stageRoute", stg), t("distOf", {a: fmtDist(distTraveled()), b: fmtDist(TOTAL_DIST)})].filter(Boolean).join(" · "))}</p>
      <button class="btn primary" data-go="start">${esc(first ? t("homeStart") : t("homeContinue", {n: nx + 1}))} ${esc(t("enterHint"))}</button>
      <div class="chips" style="margin-top:14px">
        <span class="chip">${esc(t("rank"))}: <b style="font-size:14px">${esc(rankName(cur))}</b></span>
        <span class="chip">${esc(t("tabCollection"))}: <b style="font-size:14px">${got}/${ACHIEVEMENTS.length}</b></span>
        <button class="btn small" data-go="share">${esc(t("shareBtn"))}</button>
      </div>
    </div>
    ${missionHtml()}
    <div class="card">${mapSvg()}</div>
    <div class="card"><h2>${esc(t("mentorTip"))}</h2>
      ${first ? handsSvg({hi: ["f", "j"]}) + `<div class="legend">${legendHtml()}</div>` : ""}
      <p style="margin:8px 0 0">${esc(pick(tipList("homeTips")))}</p>
    </div>`;
}
$("#home").addEventListener("click", e => {
  const b = e.target.closest("[data-go]");
  if (!b) return;
  if (b.dataset.go === "share") openShare();
  else if (b.dataset.go === "start") startNext();
  else if (b.dataset.go === "review") startReview();
  else showView(b.dataset.go);
});
$("#btn-tip").addEventListener("click", () => openTip());

/* ---------- share the day ---------- */
const SITE_URL = TH.siteUrl;
// This page's address without the query; outside an http server (file://), the theme's published address.
const gameUrl = () => location.protocol.startsWith("http") ? location.origin + location.pathname : SITE_URL || location.pathname;
const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); };
function shareSnapshot() {
  const start = startOfToday(), day = data.days[dayKey(new Date())] || {};
  const runs = data.history.filter(h => h.t >= start);
  const best = runs.filter(h => h.acc >= 90).reduce((b, h) => h.wpm > b.wpm ? h : b, {wpm: 0, acc: 0});
  const lc = lessonCounts();
  return {
    th: TH.id, n: data.profile.name || TH.hero.name, d: dayKey(new Date()),
    mi: runs.length ? Math.max(1, Math.round((day.ms || 0) / 60000)) : 0, r: runs.length, w: best.wpm, a: best.acc,
    ms: missionStepsDone(day), md: day.done ? 1 : 0,
    it: ACHIEVEMENTS.filter(a => (data.unlocked[a.id] || 0) >= start).map(a => a.id),
    dist: Math.round(distTraveled()), st: Math.max(0, currentStageIdx()), lc: lc.cleared,
    act: evolutionLevel(), col: achievementsGot(), pts: racePoints()
  };
}
const toB64url = str => btoa(String.fromCharCode(...new TextEncoder().encode(str))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64url = b => new TextDecoder().decode(Uint8Array.from(atob(b.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0)));
function shareUrl() {
  const base = gameUrl();
  return base + "?card=" + toB64url(JSON.stringify(shareSnapshot()));
}
// The card comes from a link anyone can edit, so every field is checked before use.
function readCard(param) {
  let c;
  try { c = JSON.parse(fromB64url(param)); } catch (e) { return null; }
  if (!c || typeof c !== "object") return null;
  const num = (v, max) => Math.min(max, Math.max(0, Math.round(+v) || 0));
  const ids = new Set(ACHIEVEMENTS.map(a => a.id));
  return {
    th: typeof c.th === "string" ? c.th : TH.id, n: String(c.n || TH.hero.name).slice(0, 24), d: /^\d{4}-\d{2}-\d{2}$/.test(c.d) ? c.d : dayKey(new Date()),
    mi: num(c.mi, 1440), r: num(c.r, 999), w: num(c.w, 300), a: num(c.a, 100), ms: num(c.ms, 3), md: c.md ? 1 : 0,
    it: (Array.isArray(c.it) ? c.it : []).filter(id => ids.has(id)),
    dist: num(c.dist, TOTAL_DIST), st: num(c.st, STAGES.length - 1), lc: num(c.lc, LESSON_DEFS.length),
    act: num(c.act, TH.evolution.levels.length), col: num(c.col, ACHIEVEMENTS.length), pts: num(c.pts, 999)
  };
}
const shareText = c => t("shareText", {icon: TH.hero.icon, name: c.n, number: TH.hero.number, mi: c.mi, ms: c.ms,
  items: c.it.length ? t(c.it.length === 1 ? "shareItemsOne" : "shareItemsMany", {n: c.it.length}) : "",
  stage: STAGES[c.st].lbl, dist: fmtDist(c.dist), total: fmtDist(TOTAL_DIST)});
const statBox = (v, lbl) => `<div class="stat"><b>${esc(String(v))}</b><span>${esc(lbl)}</span></div>`;
function cardHtml(c) {
  const [y, mo, dd] = c.d.split("-").map(Number), stg = STAGES[c.st];
  const date = new Date(y, mo - 1, dd).toLocaleDateString(locale(), {weekday: "long", day: "numeric", month: "long"});
  const items = c.it.map(id => ACHIEVEMENTS.find(a => a.id === id));
  return `<div class="card share-card">
      <div class="sub">${esc(t("cardRacer", {icon: TH.hero.icon, number: TH.hero.number}))}${esc(c.n)}</div>
      <h1>${esc(t("cardTitle"))}</h1>
      <div class="sub">${esc(date)}</div>
      <h2>${esc(t("cardToday"))}</h2>
      <div class="big">${statBox(t("minutes", {n: c.mi}), t("cardTrain"))}${statBox(c.r, t("cardRuns"))}${statBox(c.w ? `${c.w} ${t("wpm")}` : "-", c.w ? t("cardBest", {a: c.a}) : t("cardBestNone"))}${statBox(`${c.ms}/3`, t("cardMission"))}</div>
      ${c.md ? `<div class="done-box">🔥 <b>${esc(t("cardMissionDone"))}</b></div>` : ""}
      ${items.length ? `<h2>${esc(t("cardNew"))}</h2><div class="share-items">${items.map(a => `<span>${a.ic} ${esc(a.nm)}</span>`).join("")}</div>` : ""}
      <h2>${esc(t("cardJourney"))}</h2>
      <div><b>${esc(stg.lbl)}: ${esc(stg.place)}</b></div>
      <div class="distbar"><i style="width:${(c.dist / TOTAL_DIST * 100).toFixed(1)}%"></i></div>
      <div class="sub">${esc(t("distOf", {a: fmtDist(c.dist), b: fmtDist(TOTAL_DIST)}))}</div>
      <div class="big">${statBox(`${c.lc}/${LESSON_DEFS.length}`, t("cardLessons"))}${statBox(c.act ? TH.evolution.levels[c.act - 1].label : "-", TH.evolution.name)}${statBox(`${c.col}/${ACHIEVEMENTS.length}`, t("cardAchievements"))}${statBox(c.pts, t("cardPoints"))}</div>
    </div>`;
}
// The page of another theme in the catalog, unless that page is this one.
const themePage = id => (window.THEMES || []).find(x => x.id === id && !location.pathname.endsWith("/" + x.page))?.page;
function showCard(param) {
  const c = readCard(param);
  // A card from another theme opens on that theme's page, since its stages and achievements belong there.
  const page = c && c.th !== TH.id && themePage(c.th);
  if (page) { location.replace(page + location.search); return; }
  const invalid = !c ? "cardInvalidText" : c.th !== TH.id ? "cardOtherTheme" : null;
  view = "card";
  document.body.classList.add("cardmode");
  document.querySelectorAll(".view").forEach(sec => { sec.hidden = sec.id !== "v-card"; });
  $("#share-view").innerHTML = !invalid ? cardHtml(c) + `
    <div class="type-actions">
      <a class="btn primary" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(shareText(c) + "\n" + location.href)}">${esc(t("cardSend"))}</a>
      <a class="btn" href="${esc(gameUrl())}">${esc(t("cardOpen"))}</a>
    </div>` : `<div class="card"><h1>${esc(t("cardInvalidTitle"))}</h1><p>${esc(t(invalid))}</p><a class="btn" href="${esc(gameUrl())}">${esc(t("cardOpen"))}</a></div>`;
}
function openShare() {
  const url = shareUrl(), q = qrcode(0, "M");
  q.addData(url);
  q.make();
  $("#share-box").innerHTML = `<h2>${esc(t("shareTitle"))}</h2>
    <div class="qr">${q.createSvgTag({cellSize: 4, margin: 2, scalable: true})}</div>
    <p>${esc(t("shareHelp"))}</p>
    <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
      <a class="btn small" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(shareText(shareSnapshot()) + "\n" + url)}">${esc(t("shareWaHere"))}</a>
      <button class="btn small" data-share="copy">${esc(t("shareCopy"))}</button>
      <button class="btn small primary" data-share="close">${esc(t("shareClose"))}</button>
    </div>
    <p class="sub" id="share-msg" style="min-height:1.2em;margin:8px 0 0"></p>`;
  $("#share-box").dataset.url = url;
  $("#share").hidden = false;
}
const closeShare = () => { $("#share").hidden = true; };
$("#share").addEventListener("click", e => {
  if (e.target.id === "share") { closeShare(); return; }
  const b = e.target.closest("[data-share]");
  if (!b) return;
  if (b.dataset.share === "close") closeShare();
  else navigator.clipboard?.writeText($("#share-box").dataset.url).then(() => { $("#share-msg").textContent = t("shareCopied"); }, () => { $("#share-msg").textContent = t("shareCopyFail"); });
});

/* ---------- prologue ---------- */
const PROLOGUE = TH.prologue.slides;
// The last slide points to where the player is in the race, from the theme's templates.
function whereSlide() {
  const W = TH.prologue.where, lc = lessonCounts(), total = fmtDist(TOTAL_DIST);
  if (lc.cleared === 0) return {art: "map", ...W.start, lesson: 1};
  if (lc.cleared === LESSON_DEFS.length) return {art: "map", finished: true, title: W.finished.title, narr: W.finished.narr.map(x => fill(x, {total})), mentor: W.finished.mentor};
  const stg = STAGES[currentStageIdx()], nx = nextLessonIdx(), L = LESSON_DEFS[nx], day = today(), P = W.progress;
  const vars = {...stg, dist: fmtDist(distTraveled()), total, n: nx + 1, lesson: lessonTitle(L),
    rival: L.race ? RIVALS[L.race].nm : "", done: missionStepsDone(day)};
  return {art: "map", title: fill(P.title, vars), lesson: nx + 1,
    narr: [fill(P.distance, vars), fill(P.next, vars) + (L.race ? fill(P.race, vars) : ""), day.done ? P.missionDone : fill(P.mission, vars)],
    mentor: STORY[L.id]?.mentor || P.mentor};
}
const prologueSlides = () => [...PROLOGUE, whereSlide()];
let prologueAt = 0;
function prologueArt(art) {
  if (art === "map") return mapSvg();
  if (art === "hands") return handsSvg({hi: ["f", "j"]});
  return art;
}
function renderPrologue() {
  const slides = prologueSlides(), P = slides[prologueAt], last = prologueAt === slides.length - 1;
  const startLbl = P.lesson === 1 ? t("homeStart") : t("homeContinue", {n: P.lesson});
  const nextLbl = !last ? t("proNext") : !S.setupDone ? t("proSignUp") : P.lesson ? startLbl + " " + t("enterHint") : t("proHome") + " " + t("enterHint");
  $("#prologue").innerHTML = `
    <div class="card">
      <div class="pro-art">${prologueArt(P.art)}</div>
      <h1>${esc(P.title)}</h1>
      ${P.narr.map(x => `<p>${esc(x)}</p>`).join("")}
      ${P.mentor ? `<div class="bubble"><b>${esc(TH.mentor.name)}:</b> ${esc(P.mentor)}</div>` : ""}
      <div class="pro-dots">${slides.map((_, i) => `<i class="${i === prologueAt ? "on" : ""}"></i>`).join("")}</div>
      <div class="pro-nav">
        ${!last ? `<button class="btn small" data-pro="skip">${esc(t("proSkip"))}</button>` : P.finished && S.setupDone ? "<span></span>" : `<button class="btn small" data-pro="home">${esc(t("proHome"))}</button>`}
        <span style="display:flex;gap:8px">
          ${prologueAt ? `<button class="btn" data-pro="prev">${esc(t("proPrev"))}</button>` : ""}
          <button class="btn primary" data-pro="next">${esc(nextLbl)}</button>
        </span>
      </div>
    </div>`;
}
// The last slide's main button signs up a new player, starts the next lesson, or goes home after the course.
function endPrologue() {
  const P = whereSlide();
  prologueAt = 0;
  if (!S.setupDone) showView("setup", {replace: true});
  else if (P.lesson) startNext();
  else goHome();
}
function stepPrologue(d) {
  const i = prologueAt + d, n = PROLOGUE.length + 1;
  if (i >= n) { endPrologue(); return; }
  prologueAt = Math.max(0, i);
  renderPrologue();
}
const toLastSlide = () => { prologueAt = PROLOGUE.length; renderPrologue(); };
function handlePrologueKey(e) {
  const act = {Enter: 1, " ": 1, ArrowRight: 1, ArrowLeft: -1}[e.key];
  if (act) { e.preventDefault(); stepPrologue(act); }
  else if (e.key === "Escape") { e.preventDefault(); if (prologueAt < PROLOGUE.length) toLastSlide(); else { prologueAt = 0; goHome(); } }
}
$("#prologue").addEventListener("click", e => {
  const b = e.target.closest("[data-pro]");
  if (!b) return;
  if (b.dataset.pro === "skip") toLastSlide();
  else if (b.dataset.pro === "home") { prologueAt = 0; goHome(); }
  else stepPrologue(b.dataset.pro === "prev" ? -1 : 1);
});

/* ---------- first-run setup ---------- */
let setup = {step: 1, layout: null, msg: ""};
function renderSetup() {
  const names = t("layoutNames");
  let detect;
  if (setup.layout) detect = `<p><b>✓ ${esc(t("setupDetected", {name: names[setup.layout]}))}</b></p>`;
  else {
    const hiKey = setup.step === 1 ? HOME[S.layout][7] : "'";
    detect = `<p><b>${esc(setup.step === 1 ? t("setupStep1") : t("setupStep2"))}</b></p>
      ${handsSvg({hi: [hiKey], hands: false})}
      ${setup.msg ? `<p style="color:var(--err)">${esc(setup.msg)}</p>` : ""}`;
  }
  const layoutBtns = ["intl", "us", "abnt"].map(l => `<button class="btn small${setup.layout === l ? " primary" : ""}" data-layout="${l}">${esc(names[l])}</button>`).join(" ");
  $("#setup").innerHTML = `
    <div class="card hero"><h1>${esc(t("setupTitle"))}</h1><p class="sub" style="font-size:16px;margin:0">${esc(t("setupIntro"))}</p></div>
    <div class="card"><h2>1. ${esc(t("keyboard"))}</h2>${detect}
      <p class="sub" style="margin:12px 0 6px">${esc(t("setupManual"))}</p><div style="display:flex;gap:8px;flex-wrap:wrap">${layoutBtns}</div></div>
    <div class="card"><h2>2. ${esc(t("setupName"))}</h2>
      <p class="sub" style="margin:0 0 10px">${esc(t("setupNameHint"))}</p>
      <input id="reg-name" class="input" maxlength="24" autocomplete="off" placeholder="${esc(TH.hero.name)}" value="${esc(data.profile.name)}">
      <p style="margin:12px 0 0">${TH.hero.icon} ${esc(t("setupNumber", {n: TH.hero.number}))}</p></div>
    <div class="type-actions"><button class="btn primary" data-go="finish">${esc(t("setupGo"))}</button>
      <button class="btn" data-go="leave">${esc(S.setupDone ? t("back") : t("proHome"))}</button></div>
    ${setup.needLayout ? `<p style="text-align:center;color:var(--err)">${esc(t("setupNeedLayout"))}</p>` : ""}`;
  $("#reg-name").addEventListener("input", e => { data.profile.name = e.target.value.trim(); });
}
function chooseLayout(l) {
  setup.layout = l;
  setup.needLayout = false;
  setSetting("layout", l);
}
function finishSetup() {
  if (!setup.layout) { setup.needLayout = true; renderSetup(); return; }
  S.setupDone = true;
  save();
  showView("home", {replace: true});
}
function handleSetupKey(e) {
  if (e.target && e.target.tagName === "INPUT") {
    if (e.key === "Enter") { e.preventDefault(); finishSetup(); }
    return;
  }
  if (e.key === "Enter") { if (onButton(e)) return; e.preventDefault(); finishSetup(); return; }
  if (setup.layout || !(e.key.length === 1 || e.key === "Dead")) return;
  e.preventDefault();
  if (setup.step === 1) {
    if (e.code === "Semicolon" && (e.key === "ç" || e.key === "Ç")) chooseLayout("abnt");
    else if (e.code === "Semicolon") { setup.step = 2; setup.msg = ""; S.layout = "intl"; renderSetup(); }
    else { setup.msg = t("setupWrong1"); renderSetup(); }
  } else if (e.code === "Quote") chooseLayout(e.key === "Dead" ? "intl" : "us");
  else { setup.msg = t("setupWrong2"); renderSetup(); }
}
$("#setup").addEventListener("click", e => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.layout) chooseLayout(b.dataset.layout);
  else if (b.dataset.set) setSetting(b.dataset.set, b.dataset.val);
  else if (b.dataset.go === "finish") finishSetup();
  else if (b.dataset.go === "leave") { if (S.setupDone) showView("stats"); else goHome(); }
});

/* ---------- races ---------- */
const PLACE_POINTS = [0, 10, 6, 4, 1];
// The rival ghost runs a little above the racer's recent speed, never below the rival's floor.
function makeRace(L) {
  const rival = RIVALS[L.race];
  const recent = data.history.filter(h => h.acc >= 90).slice(-3);
  const avg = recent.length ? recent.reduce((a, h) => a + h.wpm, 0) / recent.length : 0;
  // The ghost never runs below the lesson's pass speed, so beating it always means fast enough to pass.
  const wpm = Math.max(rival.floor || 0, passWpm(LESSON_DEFS.indexOf(L)), Math.round(avg * (rival.boss ? 1.2 : 1.1)));
  return {id: L.race, nm: rival.nm, wpm, cps: wpm * 5 / 60};
}
function updateGhost() {
  if (!run || !run.race) return;
  const idx = Math.min(run.text.length - 1, Math.floor(activeMs() / 1000 * run.race.cps));
  if (run.ghostEl) run.ghostEl.classList.remove("ghost");
  run.ghostEl = run.els[idx];
  if (run.ghostEl) run.ghostEl.classList.add("ghost");
  $("#m-ghost").style.left = (idx / run.text.length * 100).toFixed(1) + "%";
}
function racePlace(ms) {
  const diff = ms - run.text.length / run.race.cps * 1000;
  return diff <= 0 ? 1 : diff <= 10000 ? 2 : diff <= 20000 ? 3 : 4;
}
function raceResultHtml(place, ms) {
  const rival = RIVALS[run.race.id];
  const secs = Math.abs(Math.round((ms - run.text.length / run.race.cps * 1000) / 1000));
  const gap = place === 1 ? t("aheadBy", {s: secs, nm: rival.nm}) : t("behindBy", {s: secs, nm: rival.nm});
  return `<div class="bubble${place === 1 ? "" : " rival"}"><b>🏁 ${esc(place <= 3 ? t("place", {n: place}) : t("noPodium"))}</b> · ${esc(gap)}<br>${esc(place === 1 ? rival.win : rival.lose)}</div>`;
}
const racePoints = () => LESSON_DEFS.reduce((a, L) => a + (L.race ? PLACE_POINTS[progress()[L.id]?.place || 0] || 0 : 0), 0);

/* ---------- daily mission ---------- */
const BREAK_MS = 20 * 60000;
const dayKey = dt => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
// The review lesson revisits the cleared lesson with the worst key, or else the weakest and oldest one.
// A cleared lesson comes back for review 1, 3 and 7 days after the player first cleared it.
const REVIEW_DAYS = [1, 3, 7];
const daysAgo = ts => Math.round((new Date(dayKey(new Date())) - new Date(dayKey(new Date(ts)))) / 86400000);
function reviewDue(L) {
  const p = progress()[L.id], n = p?.reviews || 0;
  return lessonDone(L.id) && n < REVIEW_DAYS.length && daysAgo(p.cleared || p.last) >= REVIEW_DAYS[n];
}
function pickReviewLesson(exclude) {
  const pr = progress(), done = LESSON_DEFS.filter(L => lessonDone(L.id) && L.id !== exclude);
  if (!done.length) return null;
  const due = done.filter(reviewDue).sort((a, b) => (pr[a.id].cleared || pr[a.id].last) - (pr[b.id].cleared || pr[b.id].last));
  if (due.length) return due[0].id;
  const rate = st => st.m / (st.h + st.m);
  const worst = Object.entries(data.keys[S.layout]).filter(([, st]) => st.h + st.m >= 10 && st.m > 0).sort((a, b) => rate(b[1]) - rate(a[1]))[0];
  const byKey = worst && done.find(L => lessonKeys(L).includes(worst[0]));
  if (byKey) return byKey.id;
  done.sort((a, b) => (pr[a.id].stars - pr[b.id].stars) || ((pr[a.id].last || 0) - (pr[b.id].last || 0)));
  return done[0].id;
}
function today() {
  const k = dayKey(new Date());
  if (!data.days[k]) {
    const nx = LESSON_DEFS[Math.max(0, nextLessonIdx())];
    data.days[k] = {ms: 0, next: false, review: false, free: false, done: false, breakShown: false, nextLesson: nx.id, reviewLesson: pickReviewLesson(nx.id)};
    save();
  }
  return data.days[k];
}
const missionStepsDone = day => [day.next, day.review, day.free].filter(Boolean).length;
// The last seven days, oldest first, ending today.
const lastWeek = () => Array.from({length: 7}, (_, i) => { const dt = new Date(); dt.setDate(dt.getDate() - 6 + i); return dt; });
function updateMission(m) {
  const day = today();
  day.ms += m.ms;
  if (run.mode === "lesson" && run.passed && !run.preview) {
    const L = LESSON_DEFS[run.lessonIdx];
    // Without a review lesson (nothing cleared at the start of the day), any lesson after the new one counts.
    if (!day.next && (L.id === day.nextLesson || run.wasNew)) day.next = true;
    else if (!day.reviewLesson || L.id === day.reviewLesson) day.review = true;
  }
  if (run.mode === "free" || run.mode === "quote") day.free = true;
  const justDone = !day.done && day.next && day.review && day.free;
  if (justDone) day.done = true;
  const breakNow = !day.breakShown && day.ms >= BREAK_MS;
  if (breakNow) day.breakShown = true;
  save();
  return {justDone, breakNow};
}
function weekHtml() {
  const names = t("weekdays");
  let n = 0;
  const dots = [];
  for (const dt of lastWeek()) {
    const day = data.days[dayKey(dt)];
    if (day && day.ms > 0) n++;
    dots.push(`<span><i class="${day?.done ? "done" : day?.ms > 0 ? "part" : ""}"></i>${names[dt.getDay()]}</span>`);
  }
  return `<div class="week">${dots.join("")}<span style="margin-left:6px;font-size:13px">${esc(t("weekCount", {n}))}</span></div>`;
}
function missionHtml() {
  const day = today();
  const label = id => { const i = lessonIndexOf(id); return {n: i + 1, title: lessonTitle(LESSON_DEFS[i])}; };
  // A numbered step with a play label, so the row reads as something to start, not a box to tick.
  const item = (n, ok, go, txt) => `<li><button data-go="${go}" class="${ok ? "ok" : ""}"><span class="mnum">${ok ? "✓" : n}</span><span class="mtxt">${esc(txt)}</span><span class="mgo">${esc(t(ok ? "mDone" : "mPlay"))}</span></button></li>`;
  return `<div class="card"><h2>${esc(t("missionTitle"))}</h2><ul class="mission">
    ${item(1, day.next, "start", t("mNext", label(day.nextLesson)))}
    ${item(2, day.review, "review", day.reviewLesson ? t("mReview", label(day.reviewLesson)) : t("mReviewAny"))}
    ${item(3, day.free, "free", t("mFree"))}
  </ul>${day.done ? `<p style="margin:10px 0 0">🔥 ${esc(t("missionDoneHome"))}</p>` : ""}${weekHtml()}</div>`;
}
function startReview() {
  const id = today().reviewLesson;
  const i = id ? lessonIndexOf(id) : Math.max(0, nextLessonIdx() - 1);
  startRun("lesson", {lessonIdx: i});
}

/* ---------- keyboard help on demand ---------- */
const partIndex = () => { const b = run.bounds || []; return run.pos >= (b[1] ?? Infinity) ? 2 : run.pos >= (b[0] ?? Infinity) ? 1 : 0; };
const newKeyLesson = () => run.mode === "lesson" && LESSON_TYPES[LESSON_DEFS[run.lessonIdx].type].newKeys;
// New keys are taught with full help during the warm-up, then the help waits for a pause or a mistake.
function helpPolicy() {
  const fresh = newKeyLesson();
  const kb = run.kbMode === "show" || (run.kbMode !== "hide" && fresh && S.showKb);
  const delay = run.kbMode === "show" || (fresh && partIndex() === 0) ? 0 : fresh ? 1200 : 1500;
  return {kb, delay};
}
function clearHighlight() {
  run.nextEls.forEach(e => e.classList.remove("next", "next2"));
  run.nextEls = [];
  $("#hint").innerHTML = "";
}
function scheduleHelp() {
  clearTimeout(run.helpTimer);
  clearHighlight();
  const pol = helpPolicy();
  $("#kb-wrap").hidden = !pol.kb;
  $("#btn-kb").textContent = t(pol.kb ? "hideKbBtn" : "showKbBtn");
  if (pol.delay === 0) highlightNext();
  else {
    const r = run;
    run.helpTimer = setTimeout(() => { if (run === r && !r.done) highlightNext(); }, pol.delay);
  }
}
$("#btn-kb").addEventListener("click", () => {
  if (!run) return;
  run.kbMode = $("#kb-wrap").hidden ? "show" : "hide";
  scheduleHelp();
  focusSink();
});

/* ---------- attribute sheet ---------- */
// Rhythm grade from the spread of the gaps between correct keys: a steady gallop has similar gaps.
function rhythmGrade(gaps) {
  if (gaps.length < 20) return "-";
  const mean = gaps.reduce((a, g) => a + g, 0) / gaps.length;
  const sd = Math.sqrt(gaps.reduce((a, g) => a + (g - mean) ** 2, 0) / gaps.length);
  const cv = sd / mean;
  return cv < 0.35 ? "A" : cv < 0.5 ? "B" : cv < 0.65 ? "C" : cv < 0.8 ? "D" : "E";
}
const gradeOf = (v, cuts) => { const g = ["A", "B", "C", "D"].find((_, i) => v >= cuts[i]); return g || "E"; };
// Highest evolution level whose lesson is cleared, 0 before the first one.
const evolutionLevel = () => TH.evolution.levels.reduce((n, lv, i) => lessonDone(lv.lesson) ? i + 1 : n, 0);
const evolutionName = n => `${TH.evolution.name} ${TH.evolution.levels[n - 1].label}`;
function sheetStats() {
  const hist = data.history;
  const fast = hist.filter(h => h.acc >= 90).reduce((a, h) => Math.max(a, h.wpm), 0);
  const last = hist.slice(-10), acc = last.length ? Math.round(last.reduce((a, h) => a + h.acc, 0) / last.length) : 0;
  const cleared = Math.round(lessonCounts().cleared / LESSON_DEFS.length * 100);
  const days = lastWeek().filter(dt => data.days[dayKey(dt)]?.ms > 0).length;
  const streak = data.bestStreak || 0;
  return [
    {nm: t("stPower"), g: gradeOf(streak, [200, 120, 60, 25]), v: t("stPowerV", {n: streak})},
    {nm: t("stSpeed"), g: gradeOf(fast, [30, 22, 15, 10]), v: `${fast} ${t("wpm")}`},
    {nm: t("stRange"), g: gradeOf(cleared, [95, 70, 45, 20]), v: t("stRangeV", {n: cleared})},
    {nm: t("stDurability"), g: gradeOf(days, [6, 5, 3, 1]), v: t("stDurabilityV", {n: days})},
    {nm: t("stPrecision"), g: last.length ? gradeOf(acc, [97, 94, 90, 85]) : "E", v: last.length ? `${acc}%` : "-"},
    {nm: t("stPotential"), g: "A", v: t("stPotentialV")}
  ];
}
function hexSvg(stats) {
  const cx = 160, cy = 150, R = 95, val = {A: 5, B: 4, C: 3, D: 2, E: 1};
  const at = (i, r) => { const a = -Math.PI / 2 + i * Math.PI / 3; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
  const ring = r => [0, 1, 2, 3, 4, 5].map(i => at(i, r).map(v => v.toFixed(1)).join(",")).join(" ");
  const poly = stats.map((st, i) => at(i, R * (val[st.g] || 0) / 5).map(v => v.toFixed(1)).join(",")).join(" ");
  const rings = [1, 2, 3, 4, 5].map(k => `<polygon points="${ring(R * k / 5)}" style="fill:none;stroke:var(--line)"/>`).join("");
  const axes = stats.map((_, i) => { const [x, y] = at(i, R); return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" style="stroke:var(--line)"/>`; }).join("");
  const labels = stats.map((st, i) => {
    const [x, y] = at(i, R + 28);
    return `<text x="${x.toFixed(1)}" y="${(y - 2).toFixed(1)}" text-anchor="middle" style="fill:var(--muted);font:600 11px system-ui,sans-serif">${esc(st.nm)}</text>
      <text x="${x.toFixed(1)}" y="${(y + 13).toFixed(1)}" text-anchor="middle" style="fill:var(--accent);font:800 15px system-ui,sans-serif">${st.g}</text>`;
  }).join("");
  return `<svg class="hex" viewBox="0 0 320 300" role="img" aria-label="${esc(t("sheetAria"))}">${rings}${axes}
    <polygon points="${poly}" style="fill:color-mix(in srgb,var(--accent) 35%,transparent);stroke:var(--accent);stroke-width:2"/>${labels}</svg>`;
}
function sheetCardHtml() {
  const act = evolutionLevel(), stats = sheetStats();
  return `<div class="card" style="margin-bottom:12px"><h2>${esc(t("sheetTitle"))}</h2>
    <div class="sheet"><div>${hexSvg(stats)}</div><div>
      <div style="font-size:24px;font-weight:900;margin-bottom:8px">${esc(act ? evolutionName(act) : t("sheetEmpty"))}</div>
      <table>${stats.map(st => `<tr><td>${esc(st.nm)}</td><td><b>${st.g}</b></td><td class="sub">${esc(st.v)}</td></tr>`).join("")}</table>
    </div></div></div>`;
}
function raceTableHtml() {
  const rows = LESSON_DEFS.filter(L => L.race).map(L => {
    const pl = progress()[L.id]?.place;
    return `<tr><td>${esc(STAGES[L.stage].lbl)}</td><td>${esc(RIVALS[L.race].nm)}</td><td>${pl ? (pl <= 3 ? esc(t("ordinal", {n: pl})) : esc(t("noPodium"))) : "-"}</td></tr>`;
  }).join("");
  return `<div class="card" style="margin-bottom:12px"><h2>${esc(t("raceTable", {p: racePoints()}))}</h2>
    <table><tr><th>${esc(t("stage"))}</th><th>${esc(t("rival"))}</th><th>${esc(t("placeCol"))}</th></tr>${rows}</table></div>`;
}

/* ---------- pause, focus mode and locks ---------- */
let toastTimer = null;
function showToast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 1400);
}
function activeMs() {
  if (!run.started) return 0;
  const end = run.ended || Date.now();
  const pausedNow = run.pauseStart ? end - run.pauseStart : 0;
  return Math.max(0, end - run.started - run.pausedMs - pausedNow);
}
function showOverlay(paused) {
  $("#focus-overlay").textContent = paused ? t("pausedOverlay") : t("clickToType");
  $("#focus-overlay").hidden = false;
}
// An idle pause starts one second after the last key, so the time spent looking away never counts.
function pause(reason) {
  if (!run || !run.started || run.done || run.pauseStart) return;
  run.pauseStart = reason === "idle" ? Math.min(Date.now(), run.lastKey + 1000) : Date.now();
  if (reason !== "menu") showOverlay(true);
}
function resume() {
  if (!run.pauseStart) return;
  run.pausedMs += Date.now() - run.pauseStart;
  run.pauseStart = 0;
  $("#focus-overlay").hidden = true;
}
function openMenu() {
  if (!run || run.done) return;
  pause("menu");
  run.menuOpen = true;
  sink.blur();
  $("#focus-overlay").hidden = true;
  $("#menu").innerHTML = `<h2 class="rt" style="margin:0">${esc(t("paused"))}</h2>
    <div class="type-actions" style="margin:0">
      <button class="btn primary" data-m="resume">${esc(t("resume"))}</button>
      <button class="btn" data-m="restart">${esc(t("restart"))}</button>
      <button class="btn" data-m="exit">${esc(t("exit"))}</button>
      <button class="btn" data-m="home">${esc(t("tabHome"))}</button>
    </div>`;
  $("#banner").hidden = true;
  showPanel("menu");
}
function closeMenu() {
  run.menuOpen = false;
  showPanel("typing");
  setCursor();
  focusSink();
  if (run.pauseStart) showOverlay(true);
}
$("#menu").addEventListener("click", e => {
  const b = e.target.closest("[data-m]");
  if (!b) return;
  if (b.dataset.m === "resume") closeMenu();
  else if (b.dataset.m === "restart") restart();
  else if (b.dataset.m === "home") goHome();
  else goBack();
});
$("#btn-pause").addEventListener("click", () => openMenu());
function openTip() {
  if (!run || !run.intro || run.done) return;
  pause("menu");
  run.introOpen = true;
  run.tipOpen = true;
  sink.blur();
  $("#focus-overlay").hidden = true;
  showPanel("intro");
  renderIntro();
}
// Until the all-letters review is cleared, the free run sticks to letters from cleared lessons.
function learnedLimit() {
  const r3 = milestoneIdx("allLetters");
  if (S.unlockAll || milestoneDone("allLetters")) return null;
  let lim = 0;
  LESSON_DEFS.forEach((L, i) => { if (i < r3 && lessonDone(L.id)) lim = Math.max(lim, i); });
  return lim;
}
const quotesUnlocked = () => S.unlockAll || milestoneDone("quotes");
function renderFreeNote() {
  const lim = learnedLimit();
  $("#free-note").textContent = lim === null ? "" :
    t("freeLimited", {k: [...allowedUpTo(lim)].filter(isLetter).map(c => c.toUpperCase()).join(" "), n: milestoneIdx("allLetters") + 1});
}
function renderQuoteNote() {
  const open = quotesUnlocked();
  $("#quote-note").textContent = open ? "" : t("quotesLocked", {n: milestoneIdx("quotes") + 1});
  $("#btn-quote").textContent = open ? t("start") : t("previewBtn");
}
const startQuote = () => startRun("quote", {preview: !quotesUnlocked()});

/* ---------- boot ---------- */
window.addEventListener("pagehide", save);
applyTheme();
applyI18n();
const params = new URLSearchParams(location.search);
const startView = location.hash.slice(1);
if (params.get("card")) showCard(params.get("card"));
else {
  showView(S.setupDone && ROUTES.includes(startView) && !["type", "setup"].includes(startView) ? startView : "prologue", {replace: true});
  if (params.has("qr")) openShare();
}

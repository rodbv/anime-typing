// Interface texts and the page's theme, with defaults for every section a theme leaves out,
// and the achievement conditions a theme can use. Functions here read the player's state from engine.js.

/* ---------- i18n ---------- */
// Interface texts by language, loaded by loader.js.
const T = window.I18N;
// The interface uses the first browser language the game has texts for, and Portuguese otherwise.
const LANG = [...(navigator.languages || []), navigator.language].map(l => String(l || "").slice(0, 2).toLowerCase()).find(l => l in T) || "pt";
// The theme's strings replace the interface texts with the same key, in every language.
Object.assign(T[LANG], window.THEME.strings);
const fill = (s, vars) => Object.entries(vars || {}).reduce((acc, [a, b]) => acc.split("{" + a + "}").join(b), s);
const t = (k, vars) => {
  const s = T[LANG][k] ?? T.pt[k] ?? k;
  return typeof s === "string" ? fill(s, vars) : s;
};
const locale = () => LANG === "pt" ? "pt-BR" : "en";

/* ---------- content ---------- */
// Story content of the page's theme, loaded by loader.js from the themes folder.
// A theme needs only an id and its stages; every other section falls back to these defaults.
const DEFAULT_RANKS = [[0, "Beginner", "Iniciante"], [10, "Apprentice", "Aprendiz"], [15, "Typist", "Digitador"],
  [20, "Fast", "Rápido"], [25, "Very fast", "Muito rápido"], [30, "Expert", "Especialista"], [40, "Master", "Mestre"],
  [50, "Grandmaster", "Grão-mestre"], [60, "Legend", "Lenda"]];
function withDefaults(th) {
  const tx = k => T[LANG][k] ?? T.pt[k];
  const j = th.journey || {}, where = th.prologue?.where || {}, hero = {name: tx("defHero"), number: 1, icon: "⌨️", ...th.hero};
  return {
    story: {}, achievements: [], ranks: DEFAULT_RANKS, ...th,
    rivals: Object.fromEntries(Object.entries(th.rivals || {}).map(([id, r]) => [id, {floor: 0, pre: "", win: "", lose: "", ...r}])),
    storeKey: th.storeKey || "typedojo:" + th.id,
    look: {logo: ["TYPE", "DOJO"], deco: "", ...th.look, colors: {...th.look?.colors}},
    fx: {marks: [], marksAt: 12, rush: "", rushEvery: 25, failBanner: "", failArt: [], clearArt: [], winArt: [], sounds: {}, ...th.fx},
    hero: {short: hero.name, ...hero},
    mentor: {name: tx("defMentor"), ...th.mentor},
    words: {names: "", terms: "", ...th.words},
    quotes: th.quotes?.length ? th.quotes : tx("defQuotes"),
    evolution: {name: tx("defEvolution"), levels: [], ...th.evolution},
    prologue: {slides: th.prologue?.slides || [],
      where: Object.fromEntries(["start", "finished", "progress"].map(k => [k, {...tx("proWhere")[k], ...where[k]}]))},
    journey: {view: "line", marker: "📍", start: {}, ...j, unit: j.unit ?? tx("defUnit"), unitOne: j.unitOne ?? j.unit ?? tx("defUnitOne"),
      stages: (j.stages || []).map((st, i) => ({lbl: `${tx("stage")} ${i + 1}`, dist: 1, ...st}))}
  };
}
const TH = withDefaults(window.THEME);
const STAGES = TH.journey.stages;
const TOTAL_DIST = STAGES.reduce((a, st) => a + st.dist, 0);
const RIVALS = TH.rivals;
const STORY = TH.story;
const RANKS = TH.ranks;

/* ---------- achievements ---------- */
const stageRaceId = si => { const ls = LESSON_DEFS.filter(L => L.stage === si); return ls[ls.length - 1].id; };
const stageCleared = si => lessonDone(stageRaceId(si));
const podiums = () => LESSON_DEFS.filter(L => L.race && (progress()[L.id]?.place || 9) <= 3).length;
const missionsDone = () => Object.values(data.days || {}).filter(d => d.done).length;
const daysTrained = () => Object.keys(data.days || {}).filter(trainedOn).length;

// Achievement conditions a theme can use, by type. Each one gets the condition from the theme and {run, m, lessons} of the finished run.
const CONDITIONS = {
  stageCleared: w => stageCleared(w.stage),
  lessonDone: w => lessonDone(w.lesson),
  racePlace: (w, c) => (c.lessons[w.lesson]?.place || 9) <= w.place,
  perfectLesson: (w, c) => c.run.mode === "lesson" && c.m.acc === 100 && c.run.pos >= w.minChars,
  rhythm: (w, c) => c.m.rhythm === w.grade,
  daysTrained: w => daysTrained() >= w.n,
  podiums: w => podiums() >= w.n,
  missions: w => missionsDone() >= w.n,
  daysInARow: w => bestDaysInARow() >= w.n,
  freeRun: (w, c) => c.run.mode === "free" && c.m.wpm >= w.wpm && c.m.acc >= w.acc
};
const ACHIEVEMENTS = TH.achievements;
const achievementsGot = () => ACHIEVEMENTS.filter(a => data.unlocked[a.id]).length;

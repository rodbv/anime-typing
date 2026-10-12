// The course: the lessons in order, what each type of lesson shows, and the text a lesson asks the player to type.
// Functions here read the player's layout and settings from engine.js and the theme from theme.js.

/* ---------- lessons ---------- */
// The course in order. type picks the title, text and tip from LESSON_TYPES. milestone names what clearing the lesson changes:
// speedCounts (lesson speeds count toward the best speed from here on), lastAccuracyStars (the last lesson whose stars
// ignore speed), accents (free runs use accents), allLetters (free runs use every letter) and quotes (opens the quotes mode).
const LESSON_DEFS = [
  {id: "fj", type: "keys", k: "fj"}, {id: "dk", type: "keys", k: "dk"},
  {id: "sl", type: "keys", k: "sl"}, {id: "a", type: "keys", k: {intl: "a;", us: "a;", abnt: "aç"}}, {id: "gh", type: "keys", k: "gh"},
  {id: "r1", type: "review", review: "home", milestone: "speedCounts"},
  {id: "ei", type: "keys", k: "ei"}, {id: "ru", type: "keys", k: "ru"},
  {id: "to", type: "keys", k: "to"}, {id: "nm", type: "keys", k: "nm"}, {id: "c,", type: "keys", k: "c,"},
  {id: "qp", type: "keys", k: "qp"}, {id: "r2", type: "review", review: "mid", milestone: "lastAccuracyStars"},
  {id: "acc1", type: "accents", level: 1}, {id: "acc2", type: "accents", level: 2, milestone: "accents"},
  {id: "vb", type: "keys", k: "vb"}, {id: "x.", type: "keys", k: "x."}, {id: "zwy", type: "keys", k: "zwy"},
  {id: "r3", type: "review", review: "all", milestone: "allLetters"},
  {id: "shift", type: "shift", milestone: "quotes"}, {id: "quotes", type: "quotes"}
];
// What each type of lesson shows and types. newKeys marks the types that teach keys, which get the keyboard and quick hints.
const LESSON_TYPES = {
  keys: {newKeys: true, title: L => [...lessonKeys(L)].map(c => c.toUpperCase()).join(" "), parts: (L, idx) => keysParts(L, idx), intro: L => keysIntro(L)},
  review: {newKeys: false, title: L => t("rv_" + L.review), parts: (L, idx) => mixedParts(idx), intro: L => ({title: lessonTitle(L), bullets: tipList("in_rv"), hi: [], reach: []})},
  accents: {newKeys: true, title: L => t(L.level === 1 ? "acc1Lesson" : "acc2Lesson"), parts: (L, idx) => accentParts(L, idx), intro: L => accentIntro(L)},
  shift: {newKeys: true, title: () => t("shiftLesson"), parts: (L, idx) => shiftParts(idx), intro: () => shiftIntro()},
  quotes: {newKeys: false, title: () => t("quotesLesson"), parts: () => quoteParts(), intro: () => quoteIntro()}
};
const milestoneIdx = name => LESSON_DEFS.findIndex(L => L.milestone === name);
const lessonKeys = L => !L.k ? "" : (typeof L.k === "string" ? L.k : L.k[S.layout]);
const lessonTitle = L => LESSON_TYPES[L.type].title(L);
function allowedUpTo(idx) {
  const s = new Set();
  for (let i = 0; i <= idx; i++) for (const c of lessonKeys(LESSON_DEFS[i])) s.add(c);
  return s;
}

/* ---------- lesson text ---------- */
const COMMON = {
  en: "as ask all fall dad add lad sad salad flask glass half has had hall flash gas ash dash slash flag shall lass " +
      "the and you that was for are with his they this have from one had word but not what all were when your can said there use each which she how their will other about out many then them these some her would make like him into time has look two more write see number way could people than first water been call who now find long down day did get come made may part over new sound take only little work know place year live back give most very after thing our just name good great where help through much before line right too mean old any same tell boy follow came want show also around form three small set put end does another well large must big even such because turn here why ask went men read need land different home move try kind hand picture again change off play spell air away animal house point page letter mother answer found study still learn should world high every near add food between own below country plant last school father keep tree never start city earth eye light thought head under story saw left few while along might close something seem next hard open example begin life always those both paper together got group often run important until children side feet car mile night walk white sea began grow took river four carry state once book hear stop without second later miss idea enough eat face watch far real almost let above girl sometimes mountain cut young talk soon list song being leave family",
  pt: "asa sala fala falsa salsa já da das fada saga gala haja alfa lado jaula " +
      "ala alas sal salada asas salas falas fadas sagas galas dada dadas alga algas laça faça rua ruas tia tio rio seu teu isso esse ideia terra gato sorte forte tudo todo tal fila filho olho ganha sombra caixa peixe deixa baixo lixo luxo eixo roxo taxa exato texto sexta fixo mexer puxar luz vez voz azul fazer zero dizer feliz paz zona rapaz cruz juiz zebra beleza certeza tristeza natureza dez doze treze vida bola bem boa vai voltar livro nuvem verde barco abrir bravo vento olhar casa cada coisa cedo cima cinco certo acima pouco faca fica boca que quem quando aqui porque pai por para pedra queijo quatro pequeno papel pato sapato jogo gelo hoje dado selo mala mola lago galho folha milho ilha chave chuva fruta jeito sujo nada nunca outro nova sete oito nove onze " +
      "de que não uma para com por mais como mas foi ele das tem seu sua ser quando muito nos está eu também só pelo pela até isso ela entre era depois sem mesmo aos ter seus quem nas me esse eles estão você tinha foram essa num nem suas meu minha numa pelos elas havia seja qual será tenho lhe deles essas esses pelas este fosse dele tu te vocês meus minhas teu tua nosso nossa dela delas esta estes estas aquele aquela isto aquilo estou estamos estive esteve tive teve temos casa gato cachorro livro jogo tempo vida amigo coragem medo vencer lutar correr voar liberdade lua bruxa estrela dia noite rosa hora sol mar céu terra rei rainha fogo água forte mundo poder sonho escola pai mãe irmão cidade rua carro porta janela mesa cadeira olho mão coração força chefe guerra paz grande pequeno novo velho bom mau feliz triste rápido lento"
};

const ACCENT_WORDS = "não mão mãe pão são irmão coração ação lição canção mãos já lá pá pé fé só nó é até está café sofá aí país saída útil fácil difícil rápido música último único número sábado próximo herói céu água três você vovô avô pôr mês português lâmpada câmera à às força faça laço peça poço caça moço praça cabeça começo rotação galão estação".split(" ");

// Up to the top-row review, stars reward accuracy only. After it, speed counts too.
function starsFor(wpm, acc, idx) {
  const L = LESSON_DEFS[idx];
  if (acc < passAcc(L) || wpm < passWpm(idx)) return 0;
  if (idx <= milestoneIdx("lastAccuracyStars")) return acc >= 98 ? 3 : acc >= 95 ? 2 : 1;
  if (acc >= 97 && wpm >= 20) return 3;
  if (acc >= 94 && wpm >= 15) return 2;
  return 1;
}

function wordPools(accents) {
  const themed = [...TH.words.names.split(" "), ...TH.words.terms.split(" ")];
  const common = COMMON[S.lang].split(" ");
  // A word that would lose an accent or a Ç on this layout is dropped, so no misspelled word shows up.
  const clean = a => uniq(a.filter(w => w && sanitize(w, accents) === w.normalize("NFC")));
  return {themed: clean(themed), common: clean(common)};
}
function drill(letters, focus) {
  const len = 2 + rnd(4);
  let s = "";
  for (let i = 0; i < len; i++) s += Math.random() < 0.6 ? pick(focus) : pick(letters);
  return s;
}
const VOWELS = "aeiou";
const PART_LEN = 48;
const homeOf = k => { const rc = keyGeometry().pos[k]; return rc ? HOME[S.layout][rc.f] : k; };
const passAcc = L => L.race ? 93 : 90;
// A slow pass usually means the player looked at the keys, so each part of the course asks for a minimum speed.
const passWpm = idx => idx < 6 ? 8 : idx < 13 ? 10 : 12;
// Warm-up drill: the finger leaves its home key, presses the new key and comes back ("fgf", "jhhj").
function anchorPart(focus) {
  const letters = focus.filter(isLetter), out = [];
  while (out.join(" ").length < PART_LEN) {
    const k = pick(focus), h = homeOf(k);
    let w;
    if (!isLetter(k)) w = h + h + k;
    else if (h === k) { const o = pick(letters); w = pick([k + k + k, k + o + k, k + k + o + o]); }
    else w = pick([h + k + h, h + k + k + h, k + h + k, h + h + k]);
    out.push(w);
  }
  return out.join(" ");
}
// A pronounceable pseudo-word of two consonant-vowel syllables, with a focus letter when one is given.
function sylWord(letters, focus) {
  const vow = letters.filter(c => VOWELS.includes(c));
  const con = letters.filter(c => isLetter(c) && !VOWELS.includes(c) && c !== "ç");
  if (!vow.length || !con.length) return null;
  let a = pick(con) + pick(vow);
  const b = pick(con) + pick(vow);
  const f = focus.length ? pick(focus) : null;
  if (f && VOWELS.includes(f)) a = pick(con) + f;
  else if (f && f !== "ç" && isLetter(f)) a = f + pick(vow);
  return Math.random() < 0.5 ? a + b : b + a;
}
// Builds one part from real words, at most twice each across the lesson, then pseudo-words, then drills.
function wordPart(themedList, commonList, used, fallback, opts = {}) {
  const themedShare = list => Math.min(0.5, list.length / 12);
  const fresh = list => {
    for (let i = 0; list.length && i < 8; i++) { const w = pick(list); if ((used[w] || 0) < 2) return w; }
    return null;
  };
  const out = [];
  let guard = 0;
  while (out.join(" ").length < PART_LEN && guard++ < 200) {
    const useThemed = themedList.length && (Math.random() < themedShare(themedList) || !commonList.length);
    let w = fresh(useThemed ? themedList : commonList) || fresh(useThemed ? commonList : themedList);
    if (w) used[w] = (used[w] || 0) + 1;
    else w = fallback();
    if (opts.punct && opts.punct.length && Math.random() < (opts.punctRate || 0.3)) w += pick(opts.punct);
    if (w !== out[out.length - 1]) out.push(w);
  }
  return out.join(" ");
}
const lessonParts = idx => { const L = LESSON_DEFS[idx]; return LESSON_TYPES[L.type].parts(L, idx); };
const lower = a => a.map(w => w.toLowerCase());
// The letters and punctuation the course has taught up to a lesson, and the theme and common words made only of them.
function courseWords(idx) {
  const allowed = allowedUpTo(idx);
  const letters = [...allowed].filter(isLetter);
  const puncts = [...allowed].filter(c => !isLetter(c));
  const {themed, common} = wordPools(false);
  const fits = w => [...w.toLowerCase()].every(c => allowed.has(c));
  const syl = focus => () => sylWord(letters, focus) || anchorPart(focus.length ? focus : letters).split(" ")[0];
  return {allowed, letters, puncts, T1: themed.filter(fits), C1: common.filter(fits), used: {}, syl};
}
const quoteParts = () => TH.quotes.filter(q => q[0].length < 60).sort(() => Math.random() - 0.5).slice(0, 3).map(q => sanitize(q[0], S.layout !== "us"));
// Without accents on the layout, an accents lesson is a mixed review.
function accentParts(L, idx) {
  if (S.layout === "us") return mixedParts(idx);
  const {allowed, C1, used, syl} = courseWords(idx);
  const baseFits = w => [...w.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()].every(c => allowed.has(c) || c === "c");
  const pool = uniq([...ACCENT_WORDS, ...COMMON.pt.split(" "), ...TH.words.terms.split(" ")])
    .filter(w => /[^\x00-\x7f]/.test(w) && sanitize(w, true) === w.normalize("NFC") && baseFits(w));
  const second = w => /[âêôàç]/i.test(w);
  const mine = pool.filter(w => L.level === 1 ? !second(w) : second(w));
  const marks = (L.level === 1 ? ["á", "é", "í", "ó", "ú", "ã", "õ", "ão", "ãe"] : ["â", "ê", "ô", "à", "ça", "ço", "çu"]).filter(m => sanitize(m, true) === m);
  const warm = [];
  while (warm.join(" ").length < PART_LEN) warm.push(pick(marks));
  const known = L.level === 1 ? mine : pool;
  return [
    warm.join(" "),
    wordPart([], mine, used, () => pick(marks)),
    wordPart([], [...known, ...lower(C1)], used, syl([]))
  ];
}
function shiftParts(idx) {
  const {letters, T1, C1, used, syl} = courseWords(idx);
  const names = T1.filter(w => w[0] !== w[0].toLowerCase());
  const warm = [];
  while (warm.join(" ").length < PART_LEN) { const k = pick(letters.filter(c => c !== "ç")); warm.push(k.toUpperCase() + k + k); }
  const sentences = [];
  while (sentences.join(" ").length < PART_LEN) {
    const ws = [pick(names.length ? names : C1), pick(C1), pick(C1)].map(w => w.toLowerCase());
    sentences.push(cap(ws.join(" ")) + ".");
  }
  return [warm.join(" "), wordPart(names, C1.map(cap), used, () => cap(syl([])())), sentences.join(" ")];
}
// A review mixes every letter taught so far.
function mixedParts(idx) {
  const {letters, puncts, T1, C1, used, syl} = courseWords(idx);
  const sample = [...letters].sort(() => Math.random() - 0.5).slice(0, 4);
  return [
    anchorPart(sample),
    wordPart(lower(T1), lower(C1), used, syl([]), {punct: puncts, punctRate: 0.1}),
    wordPart(lower(T1), lower(C1), used, syl([]), {punct: puncts, punctRate: 0.1})
  ];
}
// A new-keys lesson: a warm-up on the new keys, words with them, then words with every letter so far.
function keysParts(L, idx) {
  const {puncts, T1, C1, used, syl} = courseWords(idx);
  const focusAll = [...lessonKeys(L)];
  const focusLetters = focusAll.filter(isLetter);
  const focusPunct = focusAll.filter(c => !isLetter(c));
  const hasFocus = w => [...w.toLowerCase()].some(c => focusLetters.includes(c));
  return [
    anchorPart(focusAll),
    wordPart(lower(T1.filter(hasFocus)), lower(C1.filter(hasFocus)), used, syl(focusLetters), {punct: focusPunct, punctRate: 0.35}),
    wordPart(lower(T1), lower(C1), used, syl(focusLetters), {punct: focusPunct.length ? focusPunct : puncts, punctRate: focusPunct.length ? 0.3 : 0.08})
  ];
}
const lessonText = idx => lessonParts(idx).join(" ");
function freeChunk(n) {
  const {themed, common} = wordPools(accentsOn());
  let T2 = themed.map(w => w.toLowerCase()), C2 = common.map(w => w.toLowerCase()), letters = null;
  const lim = learnedLimit();
  if (lim !== null) {
    const allowed = new Set([...allowedUpTo(lim)].filter(isLetter));
    letters = [...allowed];
    const fits = w => [...w].every(c => allowed.has(c));
    T2 = T2.filter(fits);
    C2 = C2.filter(fits);
  }
  const out = [];
  let guard = 0;
  while (out.length < n && guard++ < n * 20) {
    let w;
    if (T2.length + C2.length < 4) w = drill(letters, letters);
    else w = Math.random() < 0.5 && T2.length ? pick(T2) : pick(C2.length ? C2 : T2);
    if (w !== out[out.length - 1]) out.push(w);
  }
  return out.join(" ");
}

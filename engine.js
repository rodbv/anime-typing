// The page markup every theme shares; the engine inserts it before wiring the screens.
document.body.insertAdjacentHTML("afterbegin", `
<div class="deco" id="deco"></div>
<div class="wrap">
  <header>
    <div>
      <div class="logo">STEEL BALL <span>TYPE</span></div>
      <div class="sub" data-i18n="subtitle"></div>
    </div>
    <div class="controls">
      <div class="ctl"><span data-i18n="keyboard"></span>
        <div class="seg" data-set="layout"><button data-val="intl">US Intl</button><button data-val="us">US</button><button data-val="abnt">ABNT2</button></div>
      </div>
    </div>
  </header>

  <nav class="tabs" id="tabs">
    <button data-view="home" data-i18n="tabHome"></button>
    <button data-view="lessons" data-i18n="tabLessons"></button>
    <button data-view="free" data-i18n="tabFree"></button>
    <button data-view="quotes" data-i18n="tabQuotes"></button>
    <button data-view="collection" data-i18n="tabCollection"></button>
    <button data-view="stats" data-i18n="tabStats"></button>
  </nav>

  <section class="view" id="v-card"><div class="stack pro" id="share-view"></div></section>
  <div class="modal-bg" id="share" hidden><div class="card modal" id="share-box"></div></div>
  <section class="view" id="v-prologue"><div class="stack pro" id="prologue"></div></section>
  <section class="view" id="v-setup"><div class="stack" id="setup"></div></section>
  <section class="view" id="v-home"><div class="stack" id="home"></div></section>

  <section class="view" id="v-lessons">
    <p class="tip" data-i18n="lessonTip"></p>
    <div id="lesson-grid"></div>
  </section>

  <section class="view" id="v-free">
    <div class="card intro">
      <p style="margin:0" data-i18n="freeIntro"></p>
      <p class="sub" style="margin:0" id="free-note"></p>
      <div class="seg" data-set="time"><button data-val="30">30 s</button><button data-val="60">60 s</button><button data-val="120">120 s</button></div>
      <button class="btn primary" id="btn-free" data-i18n="start"></button>
    </div>
  </section>

  <section class="view" id="v-quotes">
    <div class="card intro">
      <p style="margin:0" data-i18n="quoteIntro"></p>
      <p class="sub" style="margin:0" id="quote-note"></p>
      <button class="btn primary" id="btn-quote"></button>
    </div>
  </section>

  <section class="view" id="v-collection">
    <p class="tip" id="coll-summary"></p>
    <div id="collection"></div>
  </section>

  <section class="view" id="v-stats">
    <div id="stats"></div>
  </section>

  <section class="view" id="v-type">
    <div class="type-top">
      <div id="type-label"></div>
      <div class="chips">
        <span class="chip" id="chip-wpm"><b id="s-wpm">0</b><span data-i18n="wpm"></span></span>
        <span class="chip" id="chip-acc"><b id="s-acc">100</b>%</span>
        <span class="chip" id="chip-time"><b id="s-time">0</b>s</span>
      </div>
    </div>
    <div class="meters" id="meters">
      <div class="meter-label"><span data-i18n="progressLabel"></span><span id="m-prog-txt"></span></div>
      <div class="meter"><i id="m-prog"></i><span class="ghostmark" id="m-ghost" hidden></span></div>
      <div id="m-acc-wrap">
        <div class="meter-label"><span data-i18n="accuracy"></span><span id="m-acc-txt"></span></div>
        <div class="meter acc" id="m-acc-bar"><i id="m-acc"></i><span class="goal" style="left:80%"></span></div>
      </div>
    </div>
    <div class="banner" id="banner" hidden><span id="banner-msg"></span>
      <span><button class="btn small primary" id="banner-yes" data-i18n="switch"></button> <button class="btn small" id="banner-no">OK</button></span>
    </div>
    <div class="caps" id="caps" hidden data-i18n="capsOn"></div>
    <div class="card results" id="intro" hidden></div>
    <div class="card menu" id="menu" hidden></div>
    <div id="typing-area">
      <div class="textbox" id="textbox">
        <textarea id="sink" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="typing input"></textarea>
        <div id="text-inner"></div>
        <div class="focus-overlay" id="focus-overlay" hidden data-i18n="clickToType"></div>
        <div class="toast" id="toast" hidden></div>
      </div>
      <div class="attrib" id="attrib"></div>
      <div class="hint" id="hint"></div>
      <div id="kb-wrap">
        <div class="kb" id="kb"></div>
        <div class="legend" id="legend"></div>
      </div>
    </div>
    <div class="card results" id="results" hidden></div>
    <div class="type-actions" id="type-actions">
      <button class="btn" id="btn-tip" data-i18n="showTip"></button>
      <button class="btn" id="btn-kb"></button>
      <button class="btn" id="btn-pause" data-i18n="pauseBtn"></button>
    </div>
  </section>

  <footer data-i18n="footer"></footer>
</div>
`);

"use strict";

/* ---------- helpers ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const rnd = n => Math.floor(Math.random() * n);
const pick = a => a[rnd(a.length)];
const cap = w => w.charAt(0).toUpperCase() + w.slice(1);
const uniq = a => [...new Set(a)];
const isLetter = c => /\p{L}/u.test(c);

/* ---------- i18n ---------- */
// Interface texts by language, loaded by loader.js from the i18n folder.
const T = window.I18N;
Object.assign(T.pt, {
  subtitle: "A corrida de digitação de San Diego a Nova York",
  tabLessons: "Etapas", tabFree: "Treino livre", tabStats: "Ficha",
  freeIntro: "Treino do Gyro: palavras da corrida contra o relógio.",
  quoteIntro: "Digite falas da corrida. Maiúsculas e pontuação contam.",
  freeLimited: "Por enquanto, o treino livre usa só as teclas que você já sabe: {k}. Todas as letras liberam depois da lição {n}.",
  lessonTip: "Cada lição é um trecho da corrida. Termine as lições para avançar no mapa.",
  acc1Lesson: "Acentos: ´ e ~", acc2Lesson: "Acentos: ^, ` e Ç",
  homeStart: "Largar: lição 1", homeContinue: "Continuar a corrida: lição {n}",
  racerTag: "Corredor nº {n} · {name}", gyroTip: "Dica do Gyro", kmOf: "{a} de {b}",
  collSummary: "{n} de {t} conquistados.",
  collGroups: {race: "Partes do Cadáver Santo", tusk: "Tusk", goal: "Metas"},
  setupTitle: "Inscrição na Steel Ball Run",
  setupIntro: "Antes da largada, vamos descobrir o seu teclado e preencher a sua inscrição.",
  setupName: "Seu nome", setupNameHint: "Ele aparece na tela inicial e na classificação.",
  setupNumber: "Seu número de corredor: {n}, o mesmo do Johnny. A sua égua é a Slow Dancer.",
  in_rv: ["Revisão: todas as teclas que você já aprendeu nesta parte da corrida.", "Tente não olhar para o teclado. Olhe para a trilha."],
  passRule: "Para passar: 90% de precisão (nas corridas, 93%)",
  failedAcc: "Quase! Para passar, você precisa de {n}% de precisão.",
  partDone: "Trecho {n} de 3 · +{km}",
  in_acc1_intl: ["No US Internacional, o acento é uma tecla morta: nada aparece até você apertar a letra.", "' e depois A faz á. ~ e depois A faz ã.", "Para escrever só o apóstrofo, aperte ' e depois Espaço."],
  in_acc2_intl: ["Shift+6 (^) e depois E faz ê.", "` (a tecla à esquerda do 1) e depois A faz à.", "Para o Ç, segure AltGr e aperte a vírgula."],
  in_acc1_abnt: ["No ABNT2, o acento é uma tecla morta: nada aparece até você apertar a letra.", "´ e depois A faz á. ~ e depois A faz ã."],
  in_acc2_abnt: ["Shift + ~ faz ^ (para ê). Shift + ´ faz ` (para à).", "O Ç tem tecla própria, no mindinho direito."],
  raceRule: "Corrida contra {nm}: o fantasma corre a {wpm} PPM, marcado por uma linha em cima da letra. Chegue antes dele. Para passar, você precisa de 93% de precisão.",
  place: "{n}º lugar!", noPodium: "Fora do pódio",
  aheadBy: "Você chegou {s} s antes de {nm}.", behindBy: "{nm} chegou {s} s antes.",
  missionTitle: "Missão do dia",
  mNext: "Próximo trecho: lição {n} ({title})",
  mGyro: "Treino do Gyro: refaça a lição {n} ({title})",
  mGyroAny: "Treino do Gyro: refaça qualquer lição",
  mFree: "Uma rodada de treino livre ou uma frase",
  missionDoneHome: "Missão cumprida hoje. Se quiser, continue treinando.",
  weekCount: "{n} dias de treino nesta semana",
  weekdays: ["D", "S", "T", "Q", "Q", "S", "S"],
  campTitle: "Missão cumprida!",
  campText: "O Gyro acendeu a fogueira do acampamento. Bom trabalho hoje, {name}. Amanhã a corrida continua.",
  seeYou: "Até amanhã", keepTraining: "Continuar treinando",
  breakMsg: "Você já treinou 20 minutos hoje. Que tal uma pausa? Beba água e alongue as mãos.",
  showKbBtn: "Mostrar teclado", hideKbBtn: "Esconder teclado",
  showKb: "Mostrar o teclado nas lições de tecla nova",
  rhythm: "Ritmo",
  sheetTitle: "Ficha do Stand", noStand: "O Stand ainda não despertou",
  stPower: "Poder", stSpeed: "Velocidade", stRange: "Alcance", stDurability: "Resistência", stPrecision: "Precisão", stPotential: "Potencial",
  stPowerV: "{n} letras seguidas sem erro", stRangeV: "{n}% da corrida", stDurabilityV: "treinou {n} dos últimos 7 dias", stPotentialV: "o Tusk ainda evolui",
  raceTable: "Classificação: {p} pontos", stage: "Etapa", rival: "Rival", placeCol: "Colocação",
  proNext: "Próximo (Enter)", proPrev: "Voltar", proSkip: "Pular a história",
  proSignUp: "Fazer a inscrição (Enter)", proHome: "Ir para o início",
  replayPrologue: "Ver a história de novo",
  footer: "O progresso fica salvo neste navegador."
});
const t = (k, vars) => {
  let s = T[S.lang]?.[k] ?? T.pt[k] ?? T.en?.[k] ?? k;
  if (vars && typeof s === "string") for (const [a, b] of Object.entries(vars)) s = s.split("{" + a + "}").join(b);
  return s;
};

/* ---------- content ---------- */
const SBR = {
  names: "Johnny Gyro Diego Valentine Lucy Steel Pocoloco Sandman Norisuke Ringo Wekapipo Magent Blackmore Zeppeli Joestar Brando Tusk Valkyrie",
  terms: "cavalo corrida rotação bola aço unha deserto pradaria montanha cadáver santo sela rédea galope trilha etapa largada chegada chapéu poeira ferradura estribo dimensão guardanapo bandeira presidente trem ponte rio lago gelo neve fogueira acampamento mapa bússola cowboy rancho xerife vento sol areia pedra caminho",
  quotes: [
    ["Nyo-ho-ho!", "Gyro"],
    ["Pizza mozzarella, pizza mozzarella, rella rella rella!", "Gyro"],
    ["Eu ainda estou no negativo. Eu só quero voltar ao zero.", "Johnny"],
    ["O caminho mais curto era o desvio.", "Gyro"],
    ["Bem-vindo ao mundo dos homens.", "Ringo Roadagain"],
    ["Quem pega o primeiro guardanapo decide a regra para todos.", "Valentine"],
    ["Dojyaaan!", "Valentine"],
    ["WRYYYYY!", "Diego"],
    ["Tusk ACT4!", "Johnny"],
    ["Eu sou um sortudo em cinco bilhões!", "Pocoloco"],
    ["Vou atravessar o continente só com os meus pés.", "Sandman"],
    ["Acredite na Rotação! O poder da rotação não tem limite!", "Gyro"],
    ["Gire as balas na proporção áurea!", "Gyro"],
    ["Meu cavalo se chama Slow Dancer.", "Johnny"],
    ["Não se preocupe com nada, Valkyrie!", "Gyro"]
  ]
};

const JOHNNY_NUMBER = 939;
const MAP_START = {pt: [60, 232], label: "San Diego", dy: 20};
const STAGES = [
  {lbl: "Etapa 1", place: "Praia de San Diego", from: "San Diego", to: "Igreja Santa Maria Novella", km: 15, pt: [76, 222]},
  {lbl: "Etapa 2", place: "Deserto do Arizona", from: "Igreja Santa Maria Novella", to: "Monument Valley", km: 1200, pt: [175, 162], label: "Monument Valley", dy: 22},
  {lbl: "Etapa 3", place: "Montanhas Rochosas", from: "Monument Valley", to: "Cañon City", km: 510, pt: [262, 150], label: "Cañon City", dy: -12},
  {lbl: "Etapa 4", place: "Grandes Planícies", from: "Cañon City", to: "Kansas City", km: 1250, pt: [352, 166], label: "Kansas City", dy: 22},
  {lbl: "Etapa 5", place: "Rio Mississippi", from: "Kansas City", to: "Chicago", km: 780, pt: [445, 128], label: "Chicago", dy: 22},
  {lbl: "Etapa 6", place: "Tundra do Wisconsin", from: "Chicago", to: "Mackinaw City", km: 690, pt: [458, 70], label: "Mackinaw City", dy: -12},
  {lbl: "Etapa 7", place: "Margem do lago Erie", from: "Mackinaw City", to: "Filadélfia", km: 1300, pt: [548, 150], label: "Filadélfia", dy: 22},
  {lbl: "Etapa 8", place: "Campos de Nova Jersey", from: "Filadélfia", to: "Union Beach", km: 140, pt: [570, 139]},
  {lbl: "Etapa final", place: "Nova York", from: "Union Beach", to: "Trinity Church", km: 13, pt: [586, 122], label: "Nova York", dy: -12}
];
const TOTAL_KM = STAGES.reduce((a, st) => a + st.km, 0);

const RIVALS = {
  sandman: {nm: "Sandman", no: "C-990", floor: 6, pre: "Eu corro a pé. Mesmo assim, chego antes de você.", win: "Você chegou na igreja antes do Sandman!", lose: "O Sandman venceu a primeira etapa, como na série. Ainda faltam quase 6.000 km."},
  diego: {nm: "Diego Brando", no: "001", floor: 8, pre: "Um paraplégico e um carrasco. Vocês não chegam ao Monument Valley.", win: "O Diego e o Silver Bullet comeram poeira no Monument Valley.", lose: "O Diego venceu esta etapa na série também. A revanche vem na etapa 7."},
  hotpants: {nm: "Hot Pants", no: "191", floor: 10, pre: "Com o Cream Starter eu fecho qualquer ferida. E qualquer atalho também.", win: "Você passou a Hot Pants na descida das Rochosas!", lose: "A Hot Pants chegou primeiro em Cañon City."},
  norisuke: {nm: "Norisuke Higashikata", floor: 11, pre: "Eu e o Hono vamos no nosso ritmo.", win: "Ritmo contra ritmo, e você venceu o Norisuke.", lose: "O Norisuke venceu com constância, como na série."},
  pocoloco: {nm: "Pocoloco", no: "A-777", floor: 12, pre: "Eu sou um sortudo em cinco bilhões!", win: "Nem a sorte do Pocoloco segurou você.", lose: "A sorte do Pocoloco funcionou de novo."},
  gyro: {nm: "Gyro Zeppeli", no: "B-636", floor: 13, pre: "Nyo-ho! Hoje a Valkyrie não espera você, Johnny.", win: "Você venceu o seu próprio mestre na travessia do gelo.", lose: "O Gyro venceu a etapa 6, como na série. Nyo-ho-ho!"},
  diego2: {nm: "Diego Brando", no: "001", floor: 13, pre: "Com o Scary Monsters, eu vejo a corrida de cima.", win: "Revanche feita. O Diego chegou atrás na Filadélfia.", lose: "O Diego levou de novo. Ainda tem o final."},
  valentine: {nm: "Funny Valentine", floor: 14, boss: true, pre: "Neste mundo, cada erro seu vira uma cópia que trabalha para mim.", win: "O D4C não alcançou você. Union Beach está logo ali.", lose: "O D4C pegou você desta vez. Mas a corrida continua."},
  diego3: {nm: "Diego de outro mundo", floor: 14, boss: true, pre: "Eu vim de outro mundo para terminar esta corrida.", win: "Trinity Church! Desta vez o Johnny cruza a chegada.", lose: "O Diego de outro mundo chegou antes. Tente de novo: a chegada é sua."}
};

const STORY = {
  fj: {narr: "Milhares de cavaleiros na areia de San Diego. A largada está perto.", gyro: "Antes de girar qualquer coisa, aprenda onde a mão descansa. Sinta o relevo no F e no J. Tudo começa ali."},
  dk: {gyro: "O médio fica no D e no K. Depois de cada golpe, o dedo volta para casa."},
  sl: {narr: "Na Palma do Diabo, no deserto do Arizona, o braço esquerdo do Cadáver Santo entra no corpo do Johnny. Tusk ACT1 desperta.", gyro: "Suas unhas giram e disparam, mas só dos dedos que você treinou. Anelar: S e L."},
  a: {gyro: "O mindinho é o dedo mais fraco. No deserto a água é pouca, então economize movimento: só o mindinho se mexe."},
  gh: {gyro: "O indicador estica para o lado, como a rédea que puxa o cavalo para o meio. Depois volta."},
  r1: {gyro: "A linha base inteira de uma vez. Respire, Johnny. Galope constante."},
  ei: {narr: "A subida das Montanhas Rochosas. A trilha fica estreita e o ar fica frio.", gyro: "Agora os dedos sobem. O médio vai até o E e o I, e volta. A mão fica parada, como o cavaleiro firme na sela."},
  ru: {gyro: "O indicador sobe até o R e o U, e volta para o F e o J."},
  to: {narr: "As Grandes Planícies. Campo aberto até onde a vista alcança.", gyro: "Galope constante. O T é um esticão do indicador. O O é do anelar."},
  nm: {gyro: "N e M ficam embaixo do J. O indicador desce e volta, sem levantar a mão."},
  "c,": {gyro: "O C é do médio esquerdo e a vírgula é do médio direito. Ritmo vence pressa."},
  qp: {narr: "No rio Mississippi, contra o Sandman e o In a Silent Way, o Tusk evolui para ACT2. O buraco da unha agora persegue o alvo.", gyro: "Para atravessar o Mississippi, até os mindinhos trabalham: Q e P."},
  r2: {gyro: "A linha de cima inteira. Não olhe para as mãos, olhe para a trilha."},
  acc1: {narr: "Neve e gelo no Wisconsin. O gelo engana: primeiro você pisa no acento, depois na letra.", gyro: "A tecla morta é como gelo fino. Aperte o acento, solte, e só então a letra."},
  acc2: {gyro: "Chapéu no E (ê), crase no A (à) e o Ç. Mesmo jeito: primeiro o sinal, depois a letra."},
  vb: {narr: "Em Gettysburg, contra o Axl RO, o Johnny atira em si mesmo e entra no buraco: Tusk ACT3.", gyro: "Linha de baixo. O indicador desce até o V e o B."},
  "x.": {gyro: "O anelar desce até o X e até o ponto. Desce e volta."},
  zwy: {gyro: "As letras raras: Z com o mindinho, W com o anelar e Y com o indicador direito. Quase lá, Johnny."},
  r3: {narr: "Contra o Valentine, a Slow Dancer corre no Retângulo de Ouro e o Johnny acerta a Rotação de ouro. Nasce o Tusk ACT4.", gyro: "Todas as letras. Respire e mantenha o galope."},
  shift: {narr: "Os barcos atravessam a baía de Raritan. A última etapa começa em Coney Island.", gyro: "Para a maiúscula, o mindinho da outra mão segura o Shift. As duas mãos juntas, como a rotação perfeita."},
  quotes: {narr: "Os últimos 13 km: de Coney Island, pela Ponte do Brooklyn, até a Trinity Church.", gyro: "Frases inteiras, com pontuação. Esta é a reta final."}
};

const COMMON = {
  en: "as ask all fall dad add lad sad salad flask glass half has had hall flash gas ash dash slash flag shall lass " +
      "the and you that was for are with his they this have from one had word but not what all were when your can said there use each which she how their will other about out many then them these some her would make like him into time has look two more write see number way could people than first water been call who now find long down day did get come made may part over new sound take only little work know place year live back give most very after thing our just name good great where help through much before line right too mean old any same tell boy follow came want show also around form three small set put end does another well large must big even such because turn here why ask went men read need land different home move try kind hand picture again change off play spell air away animal house point page letter mother answer found study still learn should world high every near add food between own below country plant last school father keep tree never start city earth eye light thought head under story saw left few while along might close something seem next hard open example begin life always those both paper together got group often run important until children side feet car mile night walk white sea began grow took river four carry state once book hear stop without second later miss idea enough eat face watch far real almost let above girl sometimes mountain cut young talk soon list song being leave family",
  pt: "asa sala fala falsa salsa já da das fada saga gala haja alfa lado jaula " +
      "ala alas sal salada asas salas falas fadas sagas galas dada dadas alga algas laça faça rua ruas tia tio rio seu teu isso esse ideia terra gato sorte forte tudo todo tal fila filho olho ganha sombra caixa peixe deixa baixo lixo luxo eixo roxo bruxa taxa exato texto sexta fixo mexer puxar luz vez voz azul fazer zero dizer feliz paz zona rapaz cruz juiz zebra beleza certeza tristeza natureza dez doze treze vida bola bem boa vai voltar livro nuvem verde barco abrir bravo vento olhar casa cada coisa cedo cima cinco certo acima pouco faca fica boca que quem quando aqui porque pai por para pedra queijo quatro pequeno papel pato sapato jogo gelo hoje dado selo mala mola lago galho folha milho ilha chave chuva fruta jeito sujo nada nunca outro nova sete oito nove onze " +
      "de que não uma para com por mais como mas foi ele das tem seu sua ser quando muito nos está eu também só pelo pela até isso ela entre era depois sem mesmo aos ter seus quem nas me esse eles estão você tinha foram essa num nem suas meu minha numa pelos elas havia seja qual será tenho lhe deles essas esses pelas este fosse dele tu te vocês meus minhas teu tua nosso nossa dela delas esta estes estas aquele aquela isto aquilo estou estamos estive esteve tive teve temos casa gato cachorro livro jogo tempo vida amigo herói espada coragem medo vencer lutar correr voar gigante muralha liberdade alma morte lua bruxa foice estrela robô piloto anjo sangue dia noite rosa hora sol mar céu terra rei rainha fogo água forte mundo poder sonho escola pai mãe irmão cidade rua carro porta janela mesa cadeira olho mão coração força chefe guerra paz grande pequeno novo velho bom mau feliz triste rápido lento"
};

const ACCENT_WORDS = "não mão mãe pão são irmão coração ação lição canção mãos já lá pá pé fé só nó é até está café sofá aí país saída útil fácil difícil rápido música último único número sábado próximo herói céu água três você vovô avô pôr mês português lâmpada câmera à às força faça laço peça poço caça moço praça cabeça começo rotação galão estação".split(" ");

const RANKS = [
  [0, "Novato da largada", "Novato da largada"], [10, "Cavaleiro", "Cavaleiro"], [15, "Competidor", "Competidor"],
  [20, "Top 100", "Top 100"], [25, "Top 10", "Top 10"], [30, "Rotação", "Rotação"],
  [40, "Rotação de ouro", "Rotação de ouro"], [50, "Proporção áurea", "Proporção áurea"], [60, "Rotação infinita", "Rotação infinita"]
];

const stageRaceId = si => { const ls = LESSON_DEFS.filter(L => L.stage === si); return ls[ls.length - 1].id; };
const stageCleared = si => (progress()[stageRaceId(si)]?.stars || 0) >= 1;
const podiums = () => LESSON_DEFS.filter(L => L.race && (progress()[L.id]?.place || 9) <= 3).length;
const missionsDone = () => Object.values(data.days || {}).filter(d => d.done).length;
const daysTrained = () => Object.values(data.days || {}).filter(d => d.ms > 0).length;

/* Goals that unlock collection items. ctx = {run, m, cleared, stars3, totalLessons, lessons, totals} */
const ACHIEVEMENTS = [
  {id: "ball", s: "race", ic: "⚪", nm: "Bola de aço", d: {pt: "Termine a etapa 1"}, ok: () => stageCleared(0)},
  {id: "larm", s: "race", ic: "💪", nm: "Braço esquerdo", d: {pt: "Termine a etapa 2"}, ok: () => stageCleared(1)},
  {id: "eyes", s: "race", ic: "👁️", nm: "Olhos", d: {pt: "Termine a etapa 3"}, ok: () => stageCleared(2)},
  {id: "spine", s: "race", ic: "🦴", nm: "Coluna", d: {pt: "Termine a etapa 4"}, ok: () => stageCleared(3)},
  {id: "heart", s: "race", ic: "❤️", nm: "Coração", d: {pt: "Termine a etapa 5"}, ok: () => stageCleared(4)},
  {id: "rarm", s: "race", ic: "🤚", nm: "Braço direito, orelhas e pernas", d: {pt: "Termine a etapa 6"}, ok: () => stageCleared(5)},
  {id: "torso", s: "race", ic: "👕", nm: "Tronco", d: {pt: "Termine a etapa 7, em Gettysburg"}, ok: () => stageCleared(6)},
  {id: "head", s: "race", ic: "💀", nm: "Cabeça", d: {pt: "Termine a etapa 8, na Filadélfia"}, ok: () => stageCleared(7)},
  {id: "corpse", s: "race", ic: "🏁", nm: "Cadáver completo", d: {pt: "Chegue à Trinity Church"}, ok: () => stageCleared(8)},

  {id: "act1", s: "tusk", ic: "💅", nm: "Tusk ACT1", d: {pt: "Conclua a lição S L, no deserto"}, ok: c => (c.lessons.sl?.stars || 0) >= 1},
  {id: "act2", s: "tusk", ic: "🌀", nm: "Tusk ACT2", d: {pt: "Conclua a lição Q P, no Mississippi"}, ok: c => (c.lessons.qp?.stars || 0) >= 1},
  {id: "act3", s: "tusk", ic: "🕳️", nm: "Tusk ACT3", d: {pt: "Conclua a lição V B"}, ok: c => (c.lessons.vb?.stars || 0) >= 1},
  {id: "act4", s: "tusk", ic: "♾️", nm: "Tusk ACT4", d: {pt: "Vença a etapa 8, contra o Valentine"}, ok: c => (c.lessons.r3?.stars || 0) >= 1},

  {id: "golden", s: "goal", ic: "🌻", nm: "Proporção áurea", d: {pt: "Uma lição com 100% de precisão"}, ok: c => c.run.mode === "lesson" && c.m.acc === 100 && c.run.pos >= 40},
  {id: "gallop", s: "goal", ic: "🐎", nm: "Galope constante", d: {pt: "Nota A de ritmo numa rodada"}, ok: c => c.m.rhythm === "A"},
  {id: "slowdancer", s: "goal", ic: "🐴", nm: "Slow Dancer", d: {pt: "Treine em 5 dias diferentes"}, ok: () => daysTrained() >= 5},
  {id: "valkyrie", s: "goal", ic: "🏇", nm: "Valkyrie", d: {pt: "Suba ao pódio em 3 corridas"}, ok: () => podiums() >= 3},
  {id: "lucky", s: "goal", ic: "🍀", nm: "Sorte do Pocoloco", d: {pt: "1º lugar na corrida contra o Pocoloco"}, ok: c => (c.lessons.r2?.place || 9) === 1},
  {id: "nyoho", s: "goal", ic: "😆", nm: "Nyo-ho-ho!", d: {pt: "Cumpra a primeira missão do dia"}, ok: () => missionsDone() >= 1},
  {id: "pizza", s: "goal", ic: "🍕", nm: "Pizza mozzarella", d: {pt: "Cumpra 5 missões do dia"}, ok: () => missionsDone() >= 5},
  {id: "camp", s: "goal", ic: "🔥", nm: "Fogueira do acampamento", d: {pt: "Cumpra 15 missões do dia"}, ok: () => missionsDone() >= 15},
  {id: "spin", s: "goal", ic: "⚙️", nm: "Rotação", d: {pt: "Treino livre: 25 PPM com 95%"}, ok: c => c.run.mode === "free" && c.m.wpm >= 25 && c.m.acc >= 95},
  {id: "infinite", s: "goal", ic: "💫", nm: "Rotação infinita", d: {pt: "Treino livre: 35 PPM com 95%"}, ok: c => c.run.mode === "free" && c.m.wpm >= 35 && c.m.acc >= 95}
];

/* ---------- keyboard layouts ---------- */
// keys: [base chars, shifted chars, finger per key]. Fingers: 0-3 left pinky..index, 4-7 right index..pinky, 8 thumb.
const LAYOUTS = {
  intl: {
    rows: [
      {keys: ["`1234567890-=", "~!@#$%^&*()_+", "0012334456777"], post: [["⌫", 2]]},
      {pre: [["Tab", 2]], keys: ["qwertyuiop[]\\", "QWERTYUIOP{}|", "0123344567777"]},
      {pre: [["Caps", 1.75]], keys: ["asdfghjkl;'", "ASDFGHJKL:\"", "01233445677"], post: [["Enter", 2.25]]},
      {pre: [["Shift", 2.25, "shiftL"]], keys: ["zxcvbnm,./", "ZXCVBNM<>?", "0123344567"], post: [["Shift", 2.75, "shiftR"]]}
    ],
    dead: "'\"`~^",
    marks: {"\u0301": "'", "\u0300": "`", "\u0303": "~", "\u0302": "^"},
    altgr: {"ç": ","}
  },
  abnt: {
    rows: [
      {keys: ["'1234567890-=", "\"!@#$%¨&*()_+", "0012334456777"], post: [["⌫", 2]]},
      {pre: [["Tab", 1.5]], keys: ["qwertyuiop´[", "QWERTYUIOP`{", "012334456777"], post: [["Enter", 1.5]]},
      {pre: [["Caps", 1.75]], keys: ["asdfghjklç~]", "ASDFGHJKLÇ^}", "012334456777"], post: [["", 1.25]]},
      {pre: [["Shift", 1.25, "shiftL"]], keys: ["\\zxcvbnm,.;/", "|ZXCVBNM<>:?", "001233445677"], post: [["Shift", 1.75, "shiftR"]]}
    ],
    dead: "´`~^¨",
    marks: {"\u0301": "´", "\u0300": "`", "\u0303": "~", "\u0302": "^"},
    altgr: {}
  }
};
LAYOUTS.us = {rows: LAYOUTS.intl.rows, dead: "", marks: {}, altgr: {}};
const ROW4 = {pre: [["Ctrl", 1.5], ["Alt", 1.5], ["", 9, "space"], ["AltGr", 1.5, "altgr"], ["Ctrl", 1.5]]};
const FCOL = [0, 1, 2, 3, 3, 2, 1, 0, 8];

const DIRECT = {};
for (const [name, L] of Object.entries(LAYOUTS)) {
  const s = new Set([" "]);
  for (const r of L.rows) { for (const c of r.keys[0]) s.add(c); for (const c of r.keys[1]) s.add(c); }
  for (const c of L.dead) s.delete(c);
  DIRECT[name] = s;
}

// Key presses needed to produce ch on the current layout, or null if it cannot be typed.
function strokes(ch, accents) {
  const L = LAYOUTS[S.layout], D = DIRECT[S.layout];
  if (D.has(ch)) return [{c: ch}];
  if (L.dead.includes(ch)) return [{c: ch}, {c: " "}];
  if (!accents) return null;
  if (L.altgr[ch]) return [{c: L.altgr[ch], altgr: true}];
  const n = ch.normalize("NFD");
  if (n.length === 2 && L.marks[n[1]] && D.has(n[0])) return [{c: L.marks[n[1]]}, {c: n[0]}];
  return null;
}

const REPL = {"\u2019": "'", "\u2018": "'", "\u201C": '"', "\u201D": '"', "\u2013": "-", "\u2014": "-", "\u2026": "..."};
function sanitize(str, accents) {
  let out = "";
  for (const raw of str.normalize("NFC")) {
    for (const c of (REPL[raw] ?? raw)) {
      if (strokes(c, accents)) out += c;
      else {
        const b = c.normalize("NFD")[0];
        if (strokes(b, false)) out += b;
      }
    }
  }
  return out.replace(/\s+/g, " ").trim();
}

/* ---------- storage ---------- */
const STORE_KEY = "typedojo:v1";
const DEFAULTS = {
  settings: {layout: "intl", lang: "pt", series: "mix", showKb: true, time: 60, accents: false, unlockAll: false, setupDone: false},
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
  out.settings.lang = "pt";
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

/* ---------- lessons ---------- */
const LESSON_DEFS = [
  {id: "fj", k: "fj", stage: 0}, {id: "dk", k: "dk", stage: 0, race: "sandman"},
  {id: "sl", k: "sl", stage: 1}, {id: "a", k: {intl: "a;", us: "a;", abnt: "aç"}, stage: 1}, {id: "gh", k: "gh", stage: 1}, {id: "r1", review: "home", stage: 1, race: "diego"},
  {id: "ei", k: "ei", stage: 2}, {id: "ru", k: "ru", stage: 2, race: "hotpants"},
  {id: "to", k: "to", stage: 3}, {id: "nm", k: "nm", stage: 3}, {id: "c,", k: "c,", stage: 3, race: "norisuke"},
  {id: "qp", k: "qp", stage: 4}, {id: "r2", review: "mid", stage: 4, race: "pocoloco"},
  {id: "acc1", accents: 1, stage: 5}, {id: "acc2", accents: 2, stage: 5, race: "gyro"},
  {id: "vb", k: "vb", stage: 6}, {id: "x.", k: "x.", stage: 6}, {id: "zwy", k: "zwy", stage: 6, race: "diego2"},
  {id: "r3", review: "all", stage: 7, race: "valentine"},
  {id: "shift", shift: true, stage: 8}, {id: "quotes", quotes: true, stage: 8, race: "diego3"}
];
const lessonKeys = L => !L.k ? "" : (typeof L.k === "string" ? L.k : L.k[S.layout]);
function lessonTitle(L) {
  if (L.k) return [...lessonKeys(L)].map(c => c.toUpperCase()).join(" ");
  if (L.review) return t("rv_" + L.review);
  if (L.shift) return t("shiftLesson");
  if (L.accents) return t(L.accents === 1 ? "acc1Lesson" : "acc2Lesson");
  return t("quotesLesson");
}
function allowedUpTo(idx) {
  const s = new Set();
  for (let i = 0; i <= idx; i++) for (const c of lessonKeys(LESSON_DEFS[i])) s.add(c);
  return s;
}
const progress = () => data.lessons[S.layout];
const isUnlocked = i => S.unlockAll || i === 0 || (progress()[LESSON_DEFS[i - 1].id]?.stars || 0) >= 1;
function nextLessonIdx() {
  for (let i = 0; i < LESSON_DEFS.length; i++) {
    if (!isUnlocked(i)) return i - 1;
    if (!(progress()[LESSON_DEFS[i].id]?.stars >= 1)) return i;
  }
  return LESSON_DEFS.length - 1;
}
// Up to the top-row review, stars reward accuracy only. After it, speed counts too.
function starsFor(wpm, acc, idx) {
  const L = LESSON_DEFS[idx];
  if (acc < passAcc(L)) return 0;
  if (idx <= lessonIndexOf("r2")) return acc >= 98 ? 3 : acc >= 95 ? 2 : 1;
  if (acc >= 97 && wpm >= 20) return 3;
  if (acc >= 94 && wpm >= 15) return 2;
  return 1;
}

function wordPools(accents) {
  const themed = [...SBR.names.split(" "), ...SBR.terms.split(" ")];
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
function allQuotes() { return SBR.quotes.map(q => [q[0], q[1]]); }
const VOWELS = "aeiou";
const PART_LEN = 48;
const homeOf = k => { const rc = keyGeometry().pos[k]; return rc ? HOME[S.layout][rc.f] : k; };
const passAcc = L => L.race ? 93 : 90;
const accentsOn = () => S.layout !== "us" && (S.accents || (progress().acc2?.stars || 0) >= 1);

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
function lessonParts(idx) {
  const L = LESSON_DEFS[idx];
  if (L.quotes) {
    return allQuotes().filter(q => q[0].length < 60).sort(() => Math.random() - 0.5).slice(0, 3).map(q => sanitize(q[0], S.layout !== "us"));
  }
  const allowed = allowedUpTo(idx);
  const letters = [...allowed].filter(isLetter);
  const puncts = [...allowed].filter(c => !isLetter(c));
  const {themed, common} = wordPools(false);
  const fits = w => [...w.toLowerCase()].every(c => allowed.has(c));
  const used = {};
  const T1 = themed.filter(fits), C1 = common.filter(fits);
  const lower = a => a.map(w => w.toLowerCase());
  const syl = focus => () => sylWord(letters, focus) || anchorPart(focus.length ? focus : letters).split(" ")[0];

  if (L.accents && S.layout !== "us") {
    const baseFits = w => [...w.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()].every(c => allowed.has(c) || c === "c");
    const pool = uniq([...ACCENT_WORDS, ...COMMON.pt.split(" "), ...SBR.terms.split(" ")])
      .filter(w => /[^\x00-\x7f]/.test(w) && sanitize(w, true) === w.normalize("NFC") && baseFits(w));
    const second = w => /[âêôàç]/i.test(w);
    const mine = pool.filter(w => L.accents === 1 ? !second(w) : second(w));
    const marks = (L.accents === 1 ? ["á", "é", "í", "ó", "ú", "ã", "õ", "ão", "ãe"] : ["â", "ê", "ô", "à", "ça", "ço", "çu"]).filter(m => sanitize(m, true) === m);
    const warm = [];
    while (warm.join(" ").length < PART_LEN) warm.push(pick(marks));
    const known = L.accents === 1 ? mine : pool;
    return [
      warm.join(" "),
      wordPart([], mine, used, () => pick(marks)),
      wordPart([], [...known, ...lower(C1)], used, syl([]))
    ];
  }
  if (L.shift) {
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
  const focusAll = L.k ? [...lessonKeys(L)] : null;
  if (!focusAll || L.accents) {
    const sample = [...letters].sort(() => Math.random() - 0.5).slice(0, 4);
    return [
      anchorPart(sample),
      wordPart(lower(T1), lower(C1), used, syl([]), {punct: puncts, punctRate: 0.1}),
      wordPart(lower(T1), lower(C1), used, syl([]), {punct: puncts, punctRate: 0.1})
    ];
  }
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
  document.documentElement.dataset.series = "sbr";
  $("#deco").textContent = "回転";
}
function applyI18n() {
  document.documentElement.lang = S.lang === "pt" ? "pt-BR" : "en";
  document.querySelectorAll("[data-i18n]").forEach(e => { e.textContent = t(e.dataset.i18n); });
  renderLegend();
}
function syncSegs() {
  document.querySelectorAll(".seg[data-set]").forEach(seg => {
    const key = seg.dataset.set;
    seg.querySelectorAll("button").forEach(b => b.classList.toggle("on", String(S[key]) === b.dataset.val));
  });
  document.querySelectorAll("#tabs button").forEach(b => {
    const active = view === "type" ? (run ? {lesson: "lessons", free: "free", quote: "quotes"}[run.mode] : "") : view;
    b.classList.toggle("on", b.dataset.view === active);
  });
}
function showView(v) {
  view = v;
  document.querySelectorAll(".view").forEach(s => { s.hidden = s.id !== "v-" + v; });
  $("#tabs").hidden = v === "setup" || v === "prologue";
  document.body.classList.toggle("focus", v === "type");
  if (v === "free") renderFreeNote();
  if (v === "quotes") renderQuoteNote();
  if (v === "setup") renderSetup();
  if (v === "prologue") renderPrologue();
  if (v === "home") renderHome();
  if (v === "lessons") renderLessons();
  if (v === "stats") renderStats();
  if (v === "collection") renderCollection();
  syncSegs();
}

/* ---------- lessons view ---------- */
function starRow(n) {
  return `<span class="stars">${[1, 2, 3].map(i => i <= n ? "★" : '<span class="off">★</span>').join("")}</span>`;
}
const lessonsInStage = si => LESSON_DEFS.filter(L => L.stage === si);
const lessonDone = L => (progress()[L.id]?.stars || 0) >= 1;
const fmtKm = n => Math.round(n).toLocaleString("pt-BR") + " km";
function kmTraveled() {
  return STAGES.reduce((km, st, si) => {
    const ls = lessonsInStage(si);
    return km + st.km * ls.filter(lessonDone).length / ls.length;
  }, 0);
}
function currentStageIdx() {
  const i = STAGES.findIndex((st, si) => lessonsInStage(si).some(L => !lessonDone(L)));
  return i === -1 ? STAGES.length - 1 : i;
}
function mapSvg() {
  const pts = [MAP_START.pt, ...STAGES.map(st => st.pt)];
  const si = STAGES.findIndex((st, i) => lessonsInStage(i).some(L => !lessonDone(L)));
  let pos, done;
  if (si === -1) { pos = pts[pts.length - 1]; done = pts; }
  else {
    const ls = lessonsInStage(si), frac = ls.filter(lessonDone).length / ls.length;
    const a = pts[si], b = pts[si + 1];
    pos = [a[0] + (b[0] - a[0]) * frac, a[1] + (b[1] - a[1]) * frac];
    done = [...pts.slice(0, si + 1), pos];
  }
  const line = ps => ps.map(q => q.map(v => v.toFixed(1)).join(",")).join(" ");
  const places = [MAP_START, ...STAGES];
  const dots = places.map((pl, i) => {
    const reached = i === 0 || stageCleared(i - 1);
    return `<circle cx="${pl.pt[0]}" cy="${pl.pt[1]}" r="5" style="fill:${reached ? "var(--accent)" : "var(--panel2)"};stroke:var(--accent)"/>` +
      (pl.label ? `<text x="${pl.pt[0]}" y="${pl.pt[1] + pl.dy}" text-anchor="middle" style="fill:var(--muted);font:600 11px system-ui,sans-serif">${esc(pl.label)}</text>` : "");
  }).join("");
  return `<svg class="map" viewBox="20 30 600 230" role="img" aria-label="mapa da corrida">
    <polyline points="${line(pts)}" style="fill:none;stroke:var(--line);stroke-width:3;stroke-dasharray:6 6"/>
    <polyline points="${line(done)}" style="fill:none;stroke:var(--accent);stroke-width:4;stroke-linecap:round"/>
    ${dots}
    <g transform="translate(${pos[0].toFixed(1)},${(pos[1] - 6).toFixed(1)}) scale(-1,1)"><text text-anchor="middle" style="font-size:26px">🐎</text></g>
  </svg>`;
}
function lessonCard(L, i, nx) {
  const p = progress()[L.id];
  const locked = !isUnlocked(i);
  const keys = L.k ? `<div class="keys">${[...lessonKeys(L)].map(c => `<span class="cap">${esc(c.toUpperCase())}</span>`).join("")}</div>` : `<div class="title">${esc(lessonTitle(L))}</div>`;
  const best = p ? ` · ${p.wpm} ${t("wpm")}` : "";
  const race = L.race ? `<span class="race-tag">🏁 ${esc(RIVALS[L.race].nm)}</span>` : "";
  const foot = locked ? `<span class="sub">${esc(t("preview"))}</span>` : `<span>${starRow(p?.stars || 0)}<span class="sub">${best}</span></span>`;
  return `<button class="lesson${locked ? " locked" : ""}${i === nx && !locked ? " next" : ""}" data-i="${i}" title="${esc(locked ? t("lockedTip") : t("passRule"))}">
    <span class="n">${t("lesson")} ${i + 1}${locked ? " 🔒" : ""}</span>${keys}${race}${foot}</button>`;
}
function renderLessons() {
  const nx = nextLessonIdx();
  $("#lesson-grid").innerHTML = `<div class="card">${mapSvg()}<p class="sub" style="text-align:center;margin:4px 0 0">${esc(t("kmOf", {a: fmtKm(kmTraveled()), b: fmtKm(TOTAL_KM)}))}</p></div>` +
    STAGES.map((st, si) => `<h2 class="stage-h">${esc(st.lbl)}: ${esc(st.from)} → ${esc(st.to)} · ${fmtKm(st.km)}</h2>
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
    keystrokes: 0, correct: 0, errors: 0, errAt: new Set(), miss: {}, done: false, els: [], curEl: null,
    limit: mode === "free" ? Number(S.time) : 0, nextEls: [], bannerShown: false, primary: null,
    pausedMs: 0, pauseStart: 0, lastKey: 0, menuOpen: false, errCount: {}, gaps: [], lastOk: 0, streak: 0, bestStreak: 0};
  if (mode === "lesson") {
    const L = LESSON_DEFS[r.lessonIdx];
    const parts = lessonParts(r.lessonIdx);
    r.text = parts.join(" ");
    r.bounds = [parts[0].length + 1, parts[0].length + parts[1].length + 2];
    r.intro = lessonIntro(L);
    r.introOpen = !!r.intro && (!!o.forceIntro || (!(progress()[L.id]?.stars >= 1) && !introSeen.has(L.id)));
    if (r.introOpen) introSeen.add(L.id);
  }
  else if (mode === "free") r.text = freeChunk(80);
  else { r.quote = r.quote || pick(allQuotes()); r.text = sanitize(r.quote[0], S.layout !== "us"); }
  if (mode === "lesson" && LESSON_DEFS[r.lessonIdx].race) r.race = makeRace(LESSON_DEFS[r.lessonIdx]);
  return r;
}
function startRun(mode, o) {
  run = newRun(mode, o);
  showView("type");
  renderRun();
}
function restart() {
  if (!run) return;
  startRun(run.mode, {lessonIdx: run.lessonIdx, preview: run.preview, quote: run.mode === "quote" ? run.quote : null});
}
function goBack() {
  const m = run ? run.mode : "lesson";
  run = null;
  showView({lesson: "lessons", free: "free", quote: "quotes"}[m]);
}
function runLabel() {
  if (run.mode === "lesson") return `${t("lesson")} ${run.lessonIdx + 1} · ${lessonTitle(LESSON_DEFS[run.lessonIdx])}` +
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
  $("#type-label").textContent = runLabel();
  $("#text-inner").innerHTML = "";
  $("#text-inner").style.transform = "";
  appendText(run.text);
  $("#attrib").textContent = run.mode === "quote" ? run.quote[1] : "";
  $("#results").hidden = true;
  $("#typing-area").hidden = false;
  $("#type-actions").hidden = false;
  $("#banner").hidden = true;
  $("#menu").hidden = true;
  $("#focus-overlay").hidden = true;
  $(".type-top .chips").hidden = run.mode === "lesson";
  $("#chip-acc").hidden = run.mode === "free";
  $("#m-acc-wrap").hidden = run.mode !== "lesson";
  $("#hint").classList.remove("insist");
  $("#kb").classList.remove("insist");
  $("#m-ghost").hidden = !run.race;
  kb = buildKb($("#kb"));
  updateChips();
  setCursor();
  $("#btn-tip").hidden = !run.intro || run.introOpen;
  $("#intro").hidden = !run.introOpen;
  if (run.introOpen) {
    $("#typing-area").hidden = true;
    $("#type-actions").hidden = true;
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
function updateChips() {
  const m = metrics();
  $("#s-wpm").textContent = m.wpm;
  $("#s-acc").textContent = m.acc;
  const secs = run.mode === "free" ? Math.max(0, Math.ceil(run.limit - m.ms / 1000)) : Math.floor(m.ms / 1000);
  $("#s-time").textContent = secs;
  const prog = run.mode === "free" ? Math.min(1, m.ms / (run.limit * 1000)) : run.pos / run.text.length;
  $("#m-prog").style.width = (prog * 100).toFixed(1) + "%";
  $("#m-prog-txt").textContent = run.mode === "free" ? `${secs} s` : `${Math.round(prog * 100)}%`;
  // The accuracy bar spans 50% to 100%, so the 90% goal sits at 80% of its width.
  $("#m-acc").style.width = Math.max(0, (m.acc - 50) * 2) + "%";
  $("#m-acc-txt").textContent = m.acc + "%";
  $("#m-acc-bar").classList.toggle("low", m.acc < 90);
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
  run.keystrokes++;
  if (ch === exp) {
    run.correct++;
    const now = Date.now();
    if (run.lastOk && now - run.lastOk < 2000) run.gaps.push(now - run.lastOk);
    run.lastOk = now;
    run.streak = run.errAt.has(run.pos) ? 0 : run.streak + 1;
    run.bestStreak = Math.max(run.bestStreak, run.streak);
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
      showToast(t("partDone", {n: part + 1, km: fmtKm(STAGES[L.stage].km / lessonsInStage(L.stage).length / 3)}));
    }
    setCursor();
  } else {
    run.errors++;
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
  const p = progress(), r1 = lessonIndexOf("r1");
  const lessonBest = Math.max(0, ...LESSON_DEFS.filter((L, i) => i >= r1 && p[L.id]?.stars >= 1).map(L => p[L.id].wpm || 0));
  return Math.max(data.best.free, data.best.quote, lessonBest);
}
function rankFor(w) {
  let cur = RANKS[0], nxt = null;
  for (let i = 0; i < RANKS.length; i++) if (w >= RANKS[i][0]) { cur = RANKS[i]; nxt = RANKS[i + 1] || null; }
  return [cur, nxt];
}
const rankName = r => S.lang === "pt" ? r[2] : r[1];
function lessonCounts() {
  const p = progress();
  let cleared = 0, stars3 = 0, stars = 0;
  for (const L of LESSON_DEFS) {
    const s = p[L.id]?.stars || 0;
    if (s >= 1) cleared++;
    if (s >= 3) stars3++;
    stars += s;
  }
  return {cleared, stars3, stars};
}
function checkAchievements(m) {
  const lc = lessonCounts();
  const ctx = {run, m, cleared: lc.cleared, stars3: lc.stars3, totalLessons: LESSON_DEFS.length, lessons: progress(), totals: data.totals};
  const fresh = [];
  for (const a of ACHIEVEMENTS) {
    if (data.unlocked[a.id]) continue;
    let ok = false;
    try { ok = a.ok(ctx); } catch (e) { ok = false; }
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
    run.wasNew = !(prev?.stars >= 1);
    record = !run.preview && !!prev && st >= 1 && m.wpm > prev.wpm;
    if (!run.preview) progress()[L.id] = {stars: Math.max(st, prev?.stars || 0), wpm: Math.max(m.wpm, prev?.wpm || 0), acc: Math.max(m.acc, prev?.acc || 0), place: prev?.place, last: Date.now()};
    run.passed = st >= 1;
    if (run.race) {
      const place = racePlace(m.ms);
      if (run.passed && !run.preview) progress()[L.id].place = Math.min(progress()[L.id].place || 9, place);
      extra += raceResultHtml(place, m.ms);
    }
    title = run.preview ? t("previewDone") : run.passed ? t("cleared") : t("failedAcc", {n: passAcc(L)});
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
  const unlockHtml = fresh.map(a => `<div class="unlock"><span class="ic">${a.ic}</span><div><span class="menacing">ゴゴゴ ${esc(t("unlocked"))}</span><br><b>${esc(a.nm)}</b> · <span class="sub">${esc(a.d[S.lang])}</span></div></div>`).join("");

  const btns = [];
  const hasNext = run.mode === "lesson" && run.passed && !run.preview && run.lessonIdx < LESSON_DEFS.length - 1;
  if (hasNext) btns.push(["next", t("nextLesson"), true], ["again", t("again"), false]);
  else if (run.mode === "quote") btns.push(["nextq", t("nextQuote"), true], ["again", t("again"), false]);
  else btns.push(["again", t("again"), true]);
  btns.push(["back", t("back") + " (Esc)", false]);
  if (mission.justDone) {
    const keep = btns[0][0];
    btns.splice(0, btns.length, ["home", t("seeYou"), true], [keep, t("keepTraining"), false]);
  }
  const actions = {
    home: () => { run = null; showView("home"); },
    next: () => startRun("lesson", {lessonIdx: run.lessonIdx + 1}),
    nextq: () => startRun("quote", {preview: run.preview}),
    again: () => restart(),
    back: () => goBack(),
    share: () => openShare()
  };
  run.primary = actions[btns[0][0]];

  const r = $("#results");
  r.innerHTML = `
    ${mission.justDone ? `<div class="camp">🔥 <b>${esc(t("campTitle"))}</b> ${esc(t("campText", {name: data.profile.name || "Johnny"}))}</div>` : ""}
    <h2 class="rt">${esc(title)} ${record ? `<span class="menacing">ゴゴゴ ${esc(t("newRecord"))}</span>` : ""}</h2>
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
    <div class="type-actions">${btns.map(([id, label, primary]) => `<button class="btn${primary ? " primary" : ""}" data-act="${id}">${esc(label)}${primary ? " " + esc(t("enterHint")) : ""}</button>`).join("")}${run.preview ? "" : `<button class="btn" data-act="share">📲 Compartilhar no Zap</button>`}</div>`;
  r.querySelectorAll("[data-act]").forEach(b => b.addEventListener("click", () => actions[b.dataset.act]()));
  $("#typing-area").hidden = true;
  $("#type-actions").hidden = true;
  $("#menu").hidden = true;
  r.hidden = false;
}

setInterval(() => {
  if (view !== "type" || !run || run.done || !run.started) return;
  if (!run.pauseStart && !run.menuOpen && !run.introOpen && Date.now() - run.lastKey > 5000) pause("idle");
  updateChips();
  if (run.mode === "free" && activeMs() >= run.limit * 1000) finish();
}, 200);

/* ---------- global keys ---------- */
document.addEventListener("keydown", e => {
  if (!$("#share").hidden) { if (e.key === "Escape") { e.preventDefault(); closeShare(); } return; }
  if (view === "card") return;
  if (view === "setup") { handleSetupKey(e); return; }
  if (view === "prologue") { handlePrologueKey(e); return; }
  if (view === "type" && run) {
    if (run.introOpen) {
      if (e.key === "Enter") { e.preventDefault(); closeIntro(); }
      else if (e.key === "Escape") { e.preventDefault(); if (run.started) closeIntro(); else goBack(); }
      return;
    }
    if (run.menuOpen) {
      if (e.key === "Enter" || e.key === "Escape") { e.preventDefault(); closeMenu(); }
      return;
    }
    if (e.key === "Escape") { e.preventDefault(); if (run.done) goBack(); else openMenu(); return; }
    if (e.key === "Enter") { e.preventDefault(); if (run.done && run.primary) run.primary(); return; }
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
    return;
  }
  if (e.key === "Enter" && !(e.target.closest && e.target.closest("button"))) {
    if (view === "free") startRun("free");
    else if (view === "quotes") startQuote();
    else if (view === "lessons" || view === "home") startNext();
  }
});

$("#banner-yes").addEventListener("click", () => { setSetting("layout", run.suggest); });
$("#banner-no").addEventListener("click", () => { $("#banner").hidden = true; focusSink(); });
$("#btn-free").addEventListener("click", () => startRun("free"));
$("#btn-quote").addEventListener("click", () => startQuote());
$("#tabs").addEventListener("click", e => {
  const b = e.target.closest("button");
  if (!b) return;
  run = null;
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
document.querySelectorAll(".seg[data-set]").forEach(seg => {
  seg.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (b) setSetting(seg.dataset.set, b.dataset.val);
  });
});

/* ---------- collection ---------- */
function renderCollection() {
  const got = ACHIEVEMENTS.filter(a => data.unlocked[a.id]).length;
  $("#coll-summary").textContent = t("collSummary", {n: got, t: ACHIEVEMENTS.length});
  const groups = t("collGroups");
  $("#collection").innerHTML = Object.keys(groups).map(g => `
    <div class="coll-series"><h2>${esc(groups[g])}</h2><div class="coll">
    ${ACHIEVEMENTS.filter(a => a.s === g).map(a => {
      const u = data.unlocked[a.id];
      return `<div class="item ${u ? "got" : "locked"}"><span class="ic">${a.ic}</span><div>
        <div class="nm">${esc(a.nm)}${u ? "" : " 🔒"}</div><div class="ds">${esc(a.d.pt)}</div>
        ${u ? `<div class="ds">${new Date(u).toLocaleDateString("pt-BR")}</div>` : ""}</div></div>`;
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
  const loc = S.lang === "pt" ? "pt-BR" : "en";

  $("#stats").innerHTML = tuskCardHtml() + raceTableHtml() + `
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
        <button class="btn small" id="btn-share" style="margin-top:8px">📲 Compartilhar no Zap</button>
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
  return (T[S.lang][k] || T.en[k] || []).map(x => x.split("{p}").join(p));
}
function lessonIntro(L) {
  const homeAll = [...HOME[S.layout]];
  if (L.id === "fj") return {title: t("in_fj_t"), bullets: tipList("in_fj"), hi: ["f", "j"], reach: []};
  if (L.id === "a") return {title: t("in_a_t"), bullets: tipList("in_a"), hi: homeAll, reach: []};
  if (L.id === "r1") return {title: t("rv_home"), bullets: tipList("in_r1"), hi: homeAll, reach: []};
  if (L.shift) return {title: t("shiftLesson"), bullets: tipList("in_shift"), hi: ["shiftL", "shiftR"], reach: [[homeAll[0], "shiftL"], [homeAll[7], "shiftR"]]};
  if (L.accents) {
    const title = lessonTitle(L), n = L.accents;
    if (S.layout === "intl") return {title, bullets: tipList(`in_acc${n}_intl`), hi: n === 1 ? ["'", "~"] : ["^", "`", ",", "altgr"], reach: []};
    if (S.layout === "abnt") return {title, bullets: tipList(`in_acc${n}_abnt`), hi: n === 1 ? ["´", "~"] : ["^", "`", "ç"], reach: []};
    return {title, bullets: tipList("in_acc_us"), hi: [], reach: []};
  }
  if (L.quotes) return {title: t("quotesLesson"), bullets: tipList(S.layout === "intl" ? "in_q_intl" : "in_q"), hi: [",", ".", "!", "?", "shiftL", "shiftR"], reach: []};
  if (L.review) return {title: lessonTitle(L), bullets: tipList("in_rv"), hi: [], reach: []};
  if (!L.k) return null;
  const g = keyGeometry(), keys = [...lessonKeys(L)], bullets = [], reach = [];
  for (const k of keys) {
    const rc = g.pos[k];
    if (!rc) continue;
    const h = HOME[S.layout][rc.f];
    const vars = {k: keyName(k), f: t("fingers")[rc.f], h: keyName(h)};
    if (h === k) bullets.push(t("homeKeyLine", vars));
    else { bullets.push(t("reachLine", vars)); reach.push([h, k]); }
  }
  const extra = T[S.lang]["in_x_" + L.id];
  if (extra) bullets.push(extra);
  return {title: `${t("newKeys")}: ${keys.map(keyName).join(" ")}`, bullets, hi: keys, reach};
}
const introSeen = new Set();
function storyHtml(L) {
  const st = STORY[L.id] || {}, stage = STAGES[L.stage], rival = L.race ? RIVALS[L.race] : null;
  return `<div class="stage-tag">${esc(stage.lbl)}: ${esc(stage.from)} → ${esc(stage.to)}</div>` +
    (st.narr ? `<p class="narr">${esc(st.narr)}</p>` : "") +
    (st.gyro ? `<div class="bubble"><b>Gyro:</b> ${esc(st.gyro)}</div>` : "") +
    (rival ? `<div class="bubble rival"><b>${esc(rival.nm)}${rival.no ? ` (nº ${rival.no})` : ""}:</b> ${esc(rival.pre)}</div>` : "") +
    (rival && run && run.race ? `<p class="sub">🏁 ${esc(t("raceRule", {nm: rival.nm, wpm: run.race.wpm}))}</p>` : "");
}
function renderIntro() {
  const I = run.intro;
  $("#intro").innerHTML = `${storyHtml(LESSON_DEFS[run.lessonIdx])}
    <h2 class="rt" style="margin-top:16px">${esc(I.title)}</h2>${handsSvg({hi: I.hi, reach: I.reach})}
    <div class="legend">${legendHtml()}</div>
    <ul class="tips">${I.bullets.map(b => `<li>${esc(b)}</li>`).join("")}</ul>
    <div class="type-actions"><button class="btn primary" id="intro-go">${esc(run.started ? t("backToTyping") : t("gotIt"))}</button></div>`;
  $("#intro-go").addEventListener("click", closeIntro);
}
function closeIntro() {
  run.introOpen = false;
  $("#intro").hidden = true;
  $("#typing-area").hidden = false;
  $("#type-actions").hidden = false;
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
  const got = ACHIEVEMENTS.filter(a => data.unlocked[a.id]).length;
  const first = lc.cleared === 0 && data.totals.runs === 0;
  const prof = data.profile;
  $("#home").innerHTML = `
    <div class="card hero">
      <div class="sub">${esc(t("racerTag", {n: JOHNNY_NUMBER, name: prof.name || "Johnny Joestar"}))}</div>
      <h1>${esc(stg.lbl)}: ${esc(stg.place)}</h1>
      <p class="sub" style="font-size:15px;margin:0 0 14px">${esc(stg.from)} → ${esc(stg.to)} · ${esc(t("kmOf", {a: fmtKm(kmTraveled()), b: fmtKm(TOTAL_KM)}))}</p>
      <button class="btn primary" data-go="start">${esc(first ? t("homeStart") : t("homeContinue", {n: nx + 1}))} ${esc(t("enterHint"))}</button>
      <div class="chips" style="margin-top:14px">
        <span class="chip">${esc(t("rank"))}: <b style="font-size:14px">${esc(rankName(cur))}</b></span>
        <span class="chip">${esc(t("tabCollection"))}: <b style="font-size:14px">${got}/${ACHIEVEMENTS.length}</b></span>
        <button class="btn small" data-go="share">📲 Compartilhar no Zap</button>
      </div>
    </div>
    ${missionHtml()}
    <div class="card">${mapSvg()}</div>
    <div class="card"><h2>${esc(t("gyroTip"))}</h2>
      ${first ? handsSvg({hi: ["f", "j"]}) + `<div class="legend">${legendHtml()}</div>` : ""}
      <p style="margin:8px 0 0">${esc(pick(tipList("homeTips")))}</p>
    </div>`;
}
$("#home").addEventListener("click", e => {
  const b = e.target.closest("[data-go]");
  if (!b) return;
  if (b.dataset.go === "share") openShare();
  else if (b.dataset.go === "start") startNext();
  else if (b.dataset.go === "gyro") startGyro();
  else showView(b.dataset.go);
});
$("#btn-tip").addEventListener("click", () => openTip());

/* ---------- share the day ---------- */
const SITE_URL = "https://rodbv.github.io/jojo-typing/";
const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); };
function shareSnapshot() {
  const start = startOfToday(), day = data.days[dayKey(new Date())] || {};
  const runs = data.history.filter(h => h.t >= start);
  const best = runs.filter(h => h.acc >= 90).reduce((b, h) => h.wpm > b.wpm ? h : b, {wpm: 0, acc: 0});
  const lc = lessonCounts();
  return {
    n: data.profile.name || "Johnny Joestar", d: dayKey(new Date()),
    mi: runs.length ? Math.max(1, Math.round((day.ms || 0) / 60000)) : 0, r: runs.length, w: best.wpm, a: best.acc,
    ms: [day.next, day.gyro, day.free].filter(Boolean).length, md: day.done ? 1 : 0,
    it: ACHIEVEMENTS.filter(a => (data.unlocked[a.id] || 0) >= start).map(a => a.id),
    km: Math.round(kmTraveled()), st: Math.max(0, currentStageIdx()), lc: lc.cleared,
    act: tuskAct(), col: ACHIEVEMENTS.filter(a => data.unlocked[a.id]).length, pts: racePoints()
  };
}
const toB64url = str => btoa(String.fromCharCode(...new TextEncoder().encode(str))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64url = b => new TextDecoder().decode(Uint8Array.from(atob(b.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0)));
function shareUrl() {
  const base = location.protocol.startsWith("http") ? location.origin + location.pathname : SITE_URL;
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
    n: String(c.n || "Johnny Joestar").slice(0, 24), d: /^\d{4}-\d{2}-\d{2}$/.test(c.d) ? c.d : dayKey(new Date()),
    mi: num(c.mi, 1440), r: num(c.r, 999), w: num(c.w, 300), a: num(c.a, 100), ms: num(c.ms, 3), md: c.md ? 1 : 0,
    it: (Array.isArray(c.it) ? c.it : []).filter(id => ids.has(id)),
    km: num(c.km, TOTAL_KM), st: num(c.st, STAGES.length - 1), lc: num(c.lc, LESSON_DEFS.length),
    act: num(c.act, 4), col: num(c.col, ACHIEVEMENTS.length), pts: num(c.pts, 999)
  };
}
const shareText = c => `🏇 ${c.n} (nº ${JOHNNY_NUMBER}) no Steel Ball Type: ${c.mi} min de treino hoje, missão ${c.ms} de 3` +
  (c.it.length ? `, ${c.it.length} ${c.it.length === 1 ? "conquista nova" : "conquistas novas"}` : "") +
  `. ${STAGES[c.st].lbl}, ${fmtKm(c.km)} de ${fmtKm(TOTAL_KM)}.`;
const statBox = (v, lbl) => `<div class="stat"><b>${esc(String(v))}</b><span>${esc(lbl)}</span></div>`;
function cardHtml(c) {
  const [y, mo, dd] = c.d.split("-").map(Number), stg = STAGES[c.st];
  const date = new Date(y, mo - 1, dd).toLocaleDateString("pt-BR", {weekday: "long", day: "numeric", month: "long"});
  const items = c.it.map(id => ACHIEVEMENTS.find(a => a.id === id));
  return `<div class="card share-card">
      <div class="sub">🏇 Corredor nº ${JOHNNY_NUMBER} · ${esc(c.n)}</div>
      <h1>Diário de corrida</h1>
      <div class="sub">${esc(date)}</div>
      <h2>Hoje</h2>
      <div class="big">${statBox(c.mi + " min", "de treino")}${statBox(c.r, "rodadas")}${statBox(c.w ? `${c.w} PPM` : "-", c.w ? `melhor, ${c.a}% de acerto` : "melhor rodada")}${statBox(`${c.ms}/3`, "missão do dia")}</div>
      ${c.md ? `<div class="camp">🔥 <b>Missão do dia cumprida!</b></div>` : ""}
      ${items.length ? `<h2>Conquistas novas</h2><div class="share-items">${items.map(a => `<span>${a.ic} ${esc(a.nm)}</span>`).join("")}</div>` : ""}
      <h2>Na corrida</h2>
      <div><b>${esc(stg.lbl)}: ${esc(stg.place)}</b></div>
      <div class="kmbar"><i style="width:${(c.km / TOTAL_KM * 100).toFixed(1)}%"></i></div>
      <div class="sub">${esc(fmtKm(c.km))} de ${esc(fmtKm(TOTAL_KM))}</div>
      <div class="big">${statBox(`${c.lc}/${LESSON_DEFS.length}`, "lições")}${statBox(c.act ? `ACT${c.act}` : "-", "Tusk")}${statBox(`${c.col}/${ACHIEVEMENTS.length}`, "conquistas")}${statBox(c.pts, "pontos nas corridas")}</div>
    </div>`;
}
function showCard(param) {
  const c = readCard(param);
  view = "card";
  document.body.classList.add("cardmode");
  document.querySelectorAll(".view").forEach(sec => { sec.hidden = sec.id !== "v-card"; });
  $("#share-view").innerHTML = c ? cardHtml(c) + `
    <div class="type-actions">
      <a class="btn primary" href="https://wa.me/?text=${encodeURIComponent(shareText(c) + "\n" + location.href)}">Mandar no WhatsApp</a>
      <a class="btn" href="${SITE_URL}">Abrir o jogo</a>
    </div>` : `<div class="card"><h1>Link inválido</h1><p>Este link de progresso está quebrado. Gere um novo QR code no jogo.</p><a class="btn" href="${SITE_URL}">Abrir o jogo</a></div>`;
}
function openShare() {
  const url = shareUrl(), q = qrcode(0, "M");
  q.addData(url);
  q.make();
  $("#share-box").innerHTML = `<h2>Compartilhe o seu dia</h2>
    <div class="qr">${q.createSvgTag({cellSize: 4, margin: 2, scalable: true})}</div>
    <p>Aponte a câmera do celular para o código. Ele abre o seu diário de corrida, com um botão para mandar no WhatsApp.</p>
    <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
      <a class="btn small" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(shareText(shareSnapshot()) + "\n" + url)}">WhatsApp neste computador</a>
      <button class="btn small" data-share="copy">Copiar o link</button>
      <button class="btn small primary" data-share="close">Fechar (Esc)</button>
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
  else navigator.clipboard?.writeText($("#share-box").dataset.url).then(() => { $("#share-msg").textContent = "Link copiado."; }, () => { $("#share-msg").textContent = "Não deu para copiar."; });
});

/* ---------- prologue ---------- */
const PROLOGUE = [
  {art: "🌅", title: "San Diego, 25 de setembro de 1890",
    narr: ["3.852 corredores esperam na praia. Na frente deles, quase 6.000 km de deserto, montanhas, rios e gelo até Nova York.", "Tem cowboy, tem nobre, tem bandido e tem até um corredor a pé, o Sandman. O prêmio é de 50 milhões de dólares."]},
  {art: "🏇", title: "Você é o Johnny Joestar",
    narr: ["Você era o jóquei mais famoso do país, até levar um tiro na coluna. Desde então as suas pernas não se mexem. Em cima da sua égua, a Slow Dancer, você ainda corre como qualquer um.", "Na largada, você conhece o Gyro Zeppeli, que veio de Nápoles. A família dele guarda um segredo: a Rotação. Você toca na bola de aço do Gyro e, por um segundo, fica de pé.", "Você decide seguir o Gyro até Nova York."],
    gyro: "Quer aprender a Rotação? Então treina todo dia. Nyo-ho!"},
  {art: "hands", title: "O Tusk",
    narr: ["Na Palma do Diabo, no deserto do Arizona, o braço esquerdo do Cadáver Santo entra no seu corpo. Você desperta um Stand: o Tusk. Ele gira as suas unhas e dispara como balas.", "Aqui, cada unha só dispara quando o dedo dela acha a tecla sem você olhar. Cada dedo cuida das suas teclas, e cada lição nova ensina mais um dedo a disparar."]},
  {art: "🏆", title: "A corrida",
    narr: ["Cada lição concluída leva a Slow Dancer alguns quilômetros mais perto de Nova York.", "No fim de cada etapa, um rival da série corre contra você: Sandman, Diego, Hot Pants, Pocoloco e o próprio Valentine. Pelo caminho você junta as partes do Cadáver Santo, e o Tusk evolui até o ACT4."]},
  {art: "💻", title: "E fora da corrida?",
    narr: ["Quem digita sem olhar faz o trabalho da escola, conversa no jogo e escreve código com os olhos na tela. A cabeça fica na ideia, e não na procura da tecla.", "Você vai usar isso a vida inteira."],
    gyro: "No começo você vai ficar mais lento do que catando milho. É normal. O caminho mais curto era o desvio."}
];
// The last slide points to where the player is in the race.
function whereSlide() {
  const lc = lessonCounts();
  if (lc.cleared === 0) return {art: "map", title: "Na largada",
    narr: ["A Slow Dancer está na praia de San Diego, no km 0. A missão diária na tela inicial diz o que treinar.",
      "15 minutos por dia, sem olhar para as mãos. Primeiro a precisão, depois a velocidade: com 90% de acerto você passa de lição."],
    gyro: "Os dedos ficam no F e no J, Johnny. A largada é agora. Nyo-ho!"};
  if (lc.cleared === LESSON_DEFS.length) return {art: "map", title: "Trinity Church, Nova York", finished: true,
    narr: [`Você cruzou a chegada depois de ${fmtKm(TOTAL_KM)}.`, "Agora o treino livre e as frases deixam os seus dedos mais rápidos."],
    gyro: "Nyo-ho-ho! A Rotação sempre pode melhorar."};
  const stg = STAGES[currentStageIdx()], nx = nextLessonIdx(), L = LESSON_DEFS[nx], day = today();
  const done = [day.next, day.gyro, day.free].filter(Boolean).length;
  return {art: "map", title: `${stg.lbl}: ${stg.place}`, lesson: nx + 1,
    narr: [`Você já percorreu ${fmtKm(kmTraveled())} de ${fmtKm(TOTAL_KM)}, entre ${stg.from} e ${stg.to}.`,
      `Próxima lição: ${nx + 1} (${lessonTitle(L)}).` + (L.race ? ` É uma corrida contra ${RIVALS[L.race].nm}.` : ""),
      day.done ? "A missão de hoje já está cumprida. Um treino a mais é bônus." : `Missão de hoje: ${done} de 3 feitas.`],
    gyro: STORY[L.id]?.gyro || "Galope constante, Johnny."};
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
  const nextLbl = !last ? t("proNext") : !S.setupDone ? t("proSignUp") : P.lesson ? t("homeContinue", {n: P.lesson}) + " " + t("enterHint") : t("proHome") + " " + t("enterHint");
  $("#prologue").innerHTML = `
    <div class="card">
      <div class="pro-art">${prologueArt(P.art)}</div>
      <h1>${esc(P.title)}</h1>
      ${P.narr.map(x => `<p>${esc(x)}</p>`).join("")}
      ${P.gyro ? `<div class="bubble"><b>Gyro:</b> ${esc(P.gyro)}</div>` : ""}
      <div class="pro-dots">${slides.map((_, i) => `<i class="${i === prologueAt ? "on" : ""}"></i>`).join("")}</div>
      <div class="pro-nav">
        ${!last ? `<button class="btn small" data-pro="skip">${esc(t("proSkip"))}</button>` : S.setupDone && P.lesson ? `<button class="btn small" data-pro="home">${esc(t("proHome"))}</button>` : "<span></span>"}
        <span style="display:flex;gap:8px">
          ${prologueAt ? `<button class="btn" data-pro="prev">${esc(t("proPrev"))}</button>` : ""}
          <button class="btn primary" data-pro="next">${esc(nextLbl)}</button>
        </span>
      </div>
    </div>`;
}
function endPrologue(startLesson) {
  prologueAt = 0;
  showView(S.setupDone ? "home" : "setup");
  if (startLesson && S.setupDone && nextLessonIdx() >= 0 && !whereSlide().finished) startNext();
}
function stepPrologue(d) {
  const i = prologueAt + d, n = PROLOGUE.length + 1;
  if (i >= n) { endPrologue(true); return; }
  prologueAt = Math.max(0, i);
  renderPrologue();
}
const toLastSlide = () => { prologueAt = PROLOGUE.length; renderPrologue(); };
function handlePrologueKey(e) {
  const act = {Enter: 1, " ": 1, ArrowRight: 1, ArrowLeft: -1}[e.key];
  if (act) { e.preventDefault(); stepPrologue(act); }
  else if (e.key === "Escape") { e.preventDefault(); if (prologueAt < PROLOGUE.length) toLastSlide(); else endPrologue(); }
}
$("#prologue").addEventListener("click", e => {
  const b = e.target.closest("[data-pro]");
  if (!b) return;
  if (b.dataset.pro === "skip") toLastSlide();
  else if (b.dataset.pro === "home") endPrologue();
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
      <input id="reg-name" class="input" maxlength="24" autocomplete="off" placeholder="Johnny Joestar" value="${esc(data.profile.name)}">
      <p style="margin:12px 0 0">🏇 ${esc(t("setupNumber", {n: JOHNNY_NUMBER}))}</p></div>
    <div class="type-actions"><button class="btn primary" data-go="finish">${esc(t("setupGo"))}</button></div>
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
  showView("home");
}
function handleSetupKey(e) {
  if (e.target && e.target.tagName === "INPUT") {
    if (e.key === "Enter") { e.preventDefault(); finishSetup(); }
    return;
  }
  if (e.key === "Enter") { e.preventDefault(); finishSetup(); return; }
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
});

/* ---------- races ---------- */
const PLACE_POINTS = [0, 10, 6, 4, 1];
// The rival ghost runs a little above the racer's recent speed, never below the rival's floor.
function makeRace(L) {
  const rival = RIVALS[L.race];
  const recent = data.history.filter(h => h.acc >= 90).slice(-3);
  const avg = recent.length ? recent.reduce((a, h) => a + h.wpm, 0) / recent.length : 0;
  const wpm = Math.max(rival.floor, Math.round(avg * (rival.boss ? 1.2 : 1.1)));
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
// The Gyro lesson revisits the cleared lesson with the worst key, or else the weakest and oldest one.
function pickGyroLesson(exclude) {
  const pr = progress(), done = LESSON_DEFS.filter(L => lessonDone(L) && L.id !== exclude);
  if (!done.length) return null;
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
    data.days[k] = {ms: 0, next: false, gyro: false, free: false, done: false, breakShown: false, nextLesson: nx.id, gyroLesson: pickGyroLesson(nx.id)};
    save();
  }
  return data.days[k];
}
function updateMission(m) {
  const day = today();
  day.ms += m.ms;
  if (run.mode === "lesson" && run.passed && !run.preview) {
    const L = LESSON_DEFS[run.lessonIdx];
    // Without a Gyro lesson (nothing cleared at the start of the day), any lesson after the new one counts.
    if (!day.next && (L.id === day.nextLesson || run.wasNew)) day.next = true;
    else if (!day.gyroLesson || L.id === day.gyroLesson) day.gyro = true;
  }
  if (run.mode === "free" || run.mode === "quote") day.free = true;
  const justDone = !day.done && day.next && day.gyro && day.free;
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
  for (let i = 6; i >= 0; i--) {
    const dt = new Date();
    dt.setDate(dt.getDate() - i);
    const day = data.days[dayKey(dt)];
    if (day && day.ms > 0) n++;
    dots.push(`<span><i class="${day?.done ? "done" : day?.ms > 0 ? "part" : ""}"></i>${names[dt.getDay()]}</span>`);
  }
  return `<div class="week">${dots.join("")}<span style="margin-left:6px;font-size:13px">${esc(t("weekCount", {n}))}</span></div>`;
}
function missionHtml() {
  const day = today();
  const idxOf = id => LESSON_DEFS.findIndex(L => L.id === id);
  const label = id => { const i = idxOf(id); return {n: i + 1, title: lessonTitle(LESSON_DEFS[i])}; };
  const item = (ok, go, txt) => `<li><button data-go="${go}" class="${ok ? "ok" : ""}">${ok ? "✅" : "⬜"} ${esc(txt)}</button></li>`;
  return `<div class="card"><h2>${esc(t("missionTitle"))}</h2><ul class="mission">
    ${item(day.next, "start", t("mNext", label(day.nextLesson)))}
    ${item(day.gyro, "gyro", day.gyroLesson ? t("mGyro", label(day.gyroLesson)) : t("mGyroAny"))}
    ${item(day.free, "free", t("mFree"))}
  </ul>${day.done ? `<p style="margin:10px 0 0">🔥 ${esc(t("missionDoneHome"))}</p>` : ""}${weekHtml()}</div>`;
}
function startGyro() {
  const id = today().gyroLesson;
  const i = id ? LESSON_DEFS.findIndex(L => L.id === id) : Math.max(0, nextLessonIdx() - 1);
  startRun("lesson", {lessonIdx: i});
}

/* ---------- keyboard help on demand ---------- */
const partIndex = () => { const b = run.bounds || []; return run.pos >= (b[1] ?? Infinity) ? 2 : run.pos >= (b[0] ?? Infinity) ? 1 : 0; };
const newKeyLesson = () => run.mode === "lesson" && (() => { const L = LESSON_DEFS[run.lessonIdx]; return !!(L.k || L.accents || L.shift); })();
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

/* ---------- Stand sheet ---------- */
// Rhythm grade from the spread of the gaps between correct keys: a steady gallop has similar gaps.
function rhythmGrade(gaps) {
  if (gaps.length < 20) return "-";
  const mean = gaps.reduce((a, g) => a + g, 0) / gaps.length;
  const sd = Math.sqrt(gaps.reduce((a, g) => a + (g - mean) ** 2, 0) / gaps.length);
  const cv = sd / mean;
  return cv < 0.35 ? "A" : cv < 0.5 ? "B" : cv < 0.65 ? "C" : cv < 0.8 ? "D" : "E";
}
const gradeOf = (v, cuts) => { const g = ["A", "B", "C", "D"].find((_, i) => v >= cuts[i]); return g || "E"; };
const tuskAct = () => ["r3", "vb", "qp", "sl"].map((id, i) => lessonDone(LESSON_DEFS[lessonIndexOf(id)]) ? 4 - i : 0).find(n => n) || 0;
function standStats() {
  const hist = data.history;
  const fast = hist.filter(h => h.acc >= 90).reduce((a, h) => Math.max(a, h.wpm), 0);
  const last = hist.slice(-10), acc = last.length ? Math.round(last.reduce((a, h) => a + h.acc, 0) / last.length) : 0;
  const cleared = Math.round(lessonCounts().cleared / LESSON_DEFS.length * 100);
  let days = 0;
  for (let i = 0; i < 7; i++) { const dt = new Date(); dt.setDate(dt.getDate() - i); if (data.days[dayKey(dt)]?.ms > 0) days++; }
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
  return `<svg class="hex" viewBox="0 0 320 300" role="img" aria-label="ficha do Stand">${rings}${axes}
    <polygon points="${poly}" style="fill:color-mix(in srgb,var(--accent) 35%,transparent);stroke:var(--accent);stroke-width:2"/>${labels}</svg>`;
}
function tuskCardHtml() {
  const act = tuskAct(), stats = standStats();
  return `<div class="card" style="margin-bottom:12px"><h2>${esc(t("sheetTitle"))}</h2>
    <div class="sheet"><div>${hexSvg(stats)}</div><div>
      <div style="font-size:24px;font-weight:900;margin-bottom:8px">${esc(act ? `Tusk ACT${act}` : t("noStand"))}</div>
      <table>${stats.map(st => `<tr><td>${esc(st.nm)}</td><td><b>${st.g}</b></td><td class="sub">${esc(st.v)}</td></tr>`).join("")}</table>
    </div></div></div>`;
}
function raceTableHtml() {
  const rows = LESSON_DEFS.filter(L => L.race).map(L => {
    const pl = progress()[L.id]?.place;
    return `<tr><td>${esc(STAGES[L.stage].lbl)}</td><td>${esc(RIVALS[L.race].nm)}</td><td>${pl ? (pl <= 3 ? `${pl}º` : esc(t("noPodium"))) : "-"}</td></tr>`;
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
    </div>`;
  $("#menu").hidden = false;
  $("#typing-area").hidden = true;
  $("#type-actions").hidden = true;
}
function closeMenu() {
  run.menuOpen = false;
  $("#menu").hidden = true;
  $("#typing-area").hidden = false;
  $("#type-actions").hidden = false;
  setCursor();
  focusSink();
  if (run.pauseStart) showOverlay(true);
}
$("#menu").addEventListener("click", e => {
  const b = e.target.closest("[data-m]");
  if (!b) return;
  if (b.dataset.m === "resume") closeMenu();
  else if (b.dataset.m === "restart") restart();
  else goBack();
});
$("#btn-pause").addEventListener("click", () => openMenu());
function openTip() {
  if (!run || !run.intro || run.done) return;
  pause("menu");
  run.introOpen = true;
  sink.blur();
  $("#focus-overlay").hidden = true;
  $("#typing-area").hidden = true;
  $("#type-actions").hidden = true;
  $("#intro").hidden = false;
  renderIntro();
}
const lessonIndexOf = id => LESSON_DEFS.findIndex(L => L.id === id);
// Until the all-letters review is cleared, the free run sticks to letters from cleared lessons.
function learnedLimit() {
  const r3 = lessonIndexOf("r3");
  if (S.unlockAll || progress().r3?.stars >= 1) return null;
  let lim = 0;
  LESSON_DEFS.forEach((L, i) => { if (i < r3 && progress()[L.id]?.stars >= 1) lim = Math.max(lim, i); });
  return lim;
}
const quotesUnlocked = () => S.unlockAll || progress().shift?.stars >= 1;
function renderFreeNote() {
  const lim = learnedLimit();
  $("#free-note").textContent = lim === null ? "" :
    t("freeLimited", {k: [...allowedUpTo(lim)].filter(isLetter).map(c => c.toUpperCase()).join(" "), n: lessonIndexOf("r3") + 1});
}
function renderQuoteNote() {
  const open = quotesUnlocked();
  $("#quote-note").textContent = open ? "" : t("quotesLocked", {n: lessonIndexOf("shift") + 1});
  $("#btn-quote").textContent = open ? t("start") : t("previewBtn");
}
const startQuote = () => startRun("quote", {preview: !quotesUnlocked()});

/* ---------- boot ---------- */
window.addEventListener("pagehide", save);
applyTheme();
applyI18n();
const params = new URLSearchParams(location.search);
if (params.get("card")) showCard(params.get("card"));
else {
  showView("prologue");
  if (params.has("qr")) openShare();
}

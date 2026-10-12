// The page markup every theme shares; the loader runs this file before the engine wires the screens.
document.body.insertAdjacentHTML("afterbegin", `
<div class="deco" id="deco"></div>
<div class="wrap">
  <header>
    <div>
      <div class="logo" id="logo"></div>
      <div class="sub" data-i18n="subtitle"></div>
    </div>
    <div class="controls">
      <div class="ctl" id="theme-ctl" hidden><span data-i18n="theme"></span><div class="seg" id="theme-seg"></div></div>
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

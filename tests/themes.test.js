// Runs every theme in themes/, plus a minimal theme with only an id and stages, through the same engine contract,
// so a new theme needs no test of its own.
const {boot, ROOT} = require('./harness');
const fs = require('fs');
const path = require('path');

const read = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const files = [...fs.readdirSync(path.join(ROOT, 'themes')).filter(f => f.endsWith('.json')).map(f => 'themes/' + f), 'tests/fixtures/minimal-theme.json'];
const common = read('i18n/pt.json');
const errors = [];

// A text key that a theme defines without a common default would show up as its own name in a theme that leaves it out.
const themeOnly = files.flatMap(f => Object.keys(read(f).strings || {})).filter(k => !(k in common));
if (themeOnly.length) throw new Error('strings without a default in i18n/pt.json: ' + [...new Set(themeOnly)].join(', '));
// Keys with a capital letter cannot be real words, so finding one on screen means a text is missing.
const keyNames = Object.keys(common).filter(k => /[a-z][A-Z]/.test(k));

for (const theme of files) {
  const fail = msg => { throw new Error(`${theme}: ${msg}`); };
  const A = boot(null, 'http://localhost/', {theme});
  errors.push(A.errors);
  if (A.errors.some(e => e.includes('theme problems'))) fail('theme problems: ' + A.errors);
  const ev = A.ev;
  const th = JSON.parse(ev('JSON.stringify(TH)'));
  const shown = [];
  const look = () => shown.push([...A.d.querySelectorAll('body > :not(script)')].map(n => n.textContent).join(' '));

  const lessonIds = ev('LESSON_DEFS.map(L => L.id)');
  const unknownStory = Object.keys(th.story).filter(id => !lessonIds.includes(id));
  if (unknownStory.length) fail('story for unknown lessons: ' + unknownStory.join(', '));

  // The prologue walks its fixed slides and ends on the slide that shows where the player is.
  for (let i = 0; i < th.prologue.slides.length; i++) { look(); A.key('Enter'); }
  look();
  if (A.d.querySelector('#prologue h1').textContent !== th.prologue.where.start.title) fail('the last prologue slide should be the start position');

  // A stage with a rival races its last lesson.
  const races = ev('LESSON_DEFS.filter(L => L.race).map(L => L.id)');
  const expected = th.journey.stages.filter(st => st.rival).map(st => st.lessons[st.lessons.length - 1]);
  if (races.join() !== expected.join()) fail(`races on ${races} instead of ${expected}`);

  // Playing the course in order clears each stage when its last lesson ends and moves the distance to the stage's end.
  A.ready();
  let dist = 0;
  th.journey.stages.forEach((st, si) => {
    st.lessons.forEach(id => {
      if (ev('currentStageIdx()') !== si) fail(`lesson ${id} should be in stage ${si + 1}`);
      if (ev('stageCleared(' + si + ')')) fail(`stage ${si + 1} cleared before lesson ${id}`);
      A.playLesson(lessonIds.indexOf(id));
      if (!ev(`lessonDone(LESSON_DEFS[${lessonIds.indexOf(id)}])`)) fail(`lesson ${id} did not pass`);
    });
    dist += st.dist;
    if (!ev('stageCleared(' + si + ')')) fail(`stage ${si + 1} not cleared after its lessons`);
    if (Math.abs(ev('distTraveled()') - dist) > 1e-9) fail(`distance ${ev('distTraveled()')} after stage ${si + 1}, expected ${dist}`);
    if (si === 0) for (const v of ['home', 'lessons', 'collection', 'stats']) { ev(`showView("${v}")`); look(); }
  });
  if (ev('distTraveled()') !== ev('TOTAL_DIST')) fail('the full course should cover the total distance');

  // Every screen renders after the course, and the prologue's position slide shows the finish.
  for (const v of ['home', 'lessons', 'collection', 'stats']) { ev(`showView("${v}")`); look(); }
  ev('showView("prologue"); prologueAt = PROLOGUE.length; renderPrologue()');
  look();
  if (A.d.querySelector('#prologue h1').textContent !== th.prologue.where.finished.title) fail('the finished slide should show after the last lesson');
  if (ev('evolutionLevel()') !== th.evolution.levels.length) fail('the evolution should reach its last level');

  const raw = keyNames.filter(k => shown.some(s => s.includes(k)));
  if (raw.length) fail('text keys shown on screen: ' + raw.join(', '));
  console.log(`${theme}: ${th.journey.stages.length} stages, ${lessonIds.length} lessons, ${races.length} races, ${th.quotes.length} quotes`);
}
console.log('ERRORS', errors.flat());
process.exit(0);

// Runs every theme in themes/ through the same engine contract, so a new theme needs no test of its own.
const {boot, ROOT} = require('./harness');
const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(path.join(ROOT, 'themes')).filter(f => f.endsWith('.json')).map(f => 'themes/' + f);
const themes = Object.fromEntries(files.map(f => [f, JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))]));
const common = JSON.parse(fs.readFileSync(path.join(ROOT, 'i18n/pt.json'), 'utf8'));
const storyKeys = new Set(Object.values(themes).flatMap(th => Object.keys(th.strings)));
const errors = [];

for (const theme of files) {
  const th = themes[theme];
  const fail = msg => { throw new Error(`${theme}: ${msg}`); };

  // A text key that another theme defines and the common strings lack would show up on screen as its own name.
  const missing = [...storyKeys].filter(k => !(k in th.strings) && !(k in common));
  if (missing.length) fail('missing strings: ' + missing.join(', '));

  const A = boot(null, 'http://localhost/', {theme});
  errors.push(A.errors);
  if (A.errors.some(e => e.includes('theme problems'))) fail('theme problems: ' + A.errors);
  const ev = A.ev;
  const lessonIds = ev('LESSON_DEFS.map(L => L.id)');
  const unknownStory = Object.keys(th.story).filter(id => !lessonIds.includes(id));
  if (unknownStory.length) fail('story for unknown lessons: ' + unknownStory.join(', '));

  // The prologue walks its fixed slides and ends on the slide that shows where the player is.
  const slides = ev('PROLOGUE.length') + 1;
  for (let i = 0; i < slides - 1; i++) A.key('Enter');
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
  });
  if (ev('distTraveled()') !== ev('TOTAL_DIST')) fail('the full course should cover the total distance');

  // Every screen renders after the course, and the prologue's position slide shows the finish.
  for (const v of ['home', 'lessons', 'collection', 'stats']) ev(`showView("${v}")`);
  ev('showView("prologue"); prologueAt = PROLOGUE.length; renderPrologue()');
  if (A.d.querySelector('#prologue h1').textContent !== th.prologue.where.finished.title) fail('the finished slide should show after the last lesson');
  if (ev('evolutionLevel()') !== th.evolution.levels.length) fail('the evolution should reach its last level');
  console.log(`${theme}: ${th.journey.stages.length} stages, ${lessonIds.length} lessons, ${races.length} races, ${th.quotes.length} quotes`);
}
console.log('ERRORS', errors.flat());
process.exit(0);

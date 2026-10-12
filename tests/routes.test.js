// Each screen has a #hash: the browser Back button moves between screens, and a reload or a link opens the screen.
const {boot} = require('./harness');
const check = (ok, msg) => { if (!ok) throw new Error(msg); };
const tick = () => new Promise(r => setTimeout(r, 30));
const back = async A => { A.w.history.back(); await tick(); };
const where = A => `${A.ev('view')} ${A.w.location.hash}`;

(async () => {
  // A link without a hash opens the story.
  const A = boot();
  check(where(A) === 'prologue #prologue', 'a plain link should open the prologue, got ' + where(A));

  // Tabs add history entries, and Back returns to the previous tab.
  A.ready();
  A.ev('showView("lessons")'); A.ev('showView("stats")');
  check(A.w.location.hash === '#stats', 'a tab should set its hash');
  await back(A);
  check(where(A) === 'lessons #lessons', 'Back should return to the previous tab, got ' + where(A));

  // Back during a lesson leaves the lesson for the screen it started from.
  A.ev('startRun("lesson", {lessonIdx: 0})');
  check(where(A) === 'type #type', 'a lesson should set #type');
  await back(A);
  check(where(A) === 'lessons #lessons' && A.ev('run') === null, 'Back should leave the lesson, got ' + where(A));

  // Leaving a finished lesson with its back button steps back in history, so the next Back does not reopen it.
  A.playLesson(0);
  A.d.querySelector('#results [data-act=back]').click();
  await tick();
  check(where(A) === 'lessons #lessons', 'the results back button should return to the lessons, got ' + where(A));
  await back(A);
  check(where(A) === 'home #home', 'the next Back should reach the screen before the lessons, got ' + where(A));

  // A reload with a hash opens that screen for a player who finished setup, and never reopens a lesson.
  const save = A.saved();
  let B = boot(save, 'http://localhost/#stats');
  check(where(B) === 'stats #stats', 'a hash should open its screen, got ' + where(B));
  B = boot(save, 'http://localhost/#type');
  check(B.ev('view') === 'prologue', 'a #type link should open the prologue, got ' + where(B));
  // A first visit always starts with the story, whatever the hash.
  B = boot(null, 'http://localhost/#lessons');
  check(B.ev('view') === 'prologue', 'a first visit should open the prologue, got ' + where(B));

  console.log('ERRORS', A.errors, B.errors);
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });

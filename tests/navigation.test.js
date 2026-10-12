// Every screen offers a visible way to the home screen, and Enter and Esc do what the buttons say.
const {boot} = require('./harness');
const check = (ok, msg) => { if (!ok) throw new Error(msg); };
const click = (A, sel) => { const b = A.d.querySelector(sel); check(b && !b.closest('[hidden]'), 'missing visible ' + sel); b.click(); };
const atHome = (A, from) => check(A.ev('view') === 'home' && !A.d.getElementById('tabs').hidden, `${from}: should end on the home screen`);

// First visit: skipping the story reaches a slide with a home button, before any sign-up.
let A = boot();
click(A, '[data-pro=skip]');
click(A, '[data-pro=home]');
atHome(A, 'first visit, skip, home');

// First visit through the sign-up: the keyboard setup has a home button too.
A = boot();
A.key('Escape'); A.key('Enter');
check(A.ev('view') === 'setup', 'Enter on the last slide of a first visit should open the setup');
click(A, '#setup [data-go=leave]');
atHome(A, 'setup on a first visit');

// Setup opened again from the profile goes back to the profile, and the header selector counts as a choice.
A = boot(); A.ready();
A.ev('showView("stats")'); click(A, '#btn-redo');
click(A, '.seg[data-set=layout] [data-val=abnt]');
check(A.ev('setup.layout') === 'abnt', 'the header keyboard selector should choose the layout in setup');
click(A, '#setup [data-go=leave]');
check(A.ev('view') === 'stats', 'leaving a repeated setup should return to the profile');

// Returning player with no lesson cleared: the main button starts lesson 1 and says so; the left button goes home.
A = boot(); A.ready();
A.ev('showView("prologue"); prologueAt = PROLOGUE.length; renderPrologue()');
check(A.d.querySelector('[data-pro=next]').textContent.includes('lição 1'), 'the main button should name lesson 1');
click(A, '[data-pro=home]');
atHome(A, 'last slide, home button');

// The lesson intro has a back button, and the logo leaves a lesson for home.
A = boot(); A.ready();
A.ev('startRun("lesson", {lessonIdx: 0, forceIntro: true})');
click(A, '#intro-back');
check(A.ev('view') === 'lessons' && A.ev('run') === null, 'the intro back button should leave the lesson');
A.ev('startRun("lesson", {lessonIdx: 0, forceIntro: true})');
click(A, '#logo');
atHome(A, 'logo during a lesson');

// A tip opened before typing closes with Esc instead of leaving the lesson.
A = boot(); A.ready();
A.ev('startRun("lesson", {lessonIdx: 0, forceIntro: true}); closeIntro(); openTip()');
A.key('Escape');
check(A.ev('view') === 'type' && A.ev('run && !run.introOpen'), 'Esc should close the tip and keep the lesson');

// The pause menu has a home button, and hides the keyboard banner.
A.ev('document.getElementById("banner").hidden = false; openMenu()');
check(A.d.getElementById('banner').hidden, 'the banner should hide behind the pause menu');
click(A, '#menu [data-m=home]');
atHome(A, 'pause menu');

// Every result has a home button; Enter on a focused button presses that button, not the main action.
A = boot(); A.ready();
A.playLesson(0);
click(A, '#results [data-act=home]');
atHome(A, 'results');
A.playLesson(0);
A.d.querySelector('#results [data-act=back]').focus();
A.d.activeElement.dispatchEvent(new A.w.KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
check(A.ev('run.done'), 'Enter on a focused secondary button should not start the next lesson');

// After the last lesson, the main action goes home.
A = boot(); A.ready();
A.ev('LESSON_DEFS.slice(0, -1).forEach(L => progress()[L.id] = {stars: 1, wpm: 20, acc: 95, last: 1})');
A.playLesson(A.ev('LESSON_DEFS.length - 1'));
A.key('Enter');
atHome(A, 'Enter after the last lesson');

console.log('ERRORS', A.errors);
process.exit(0);

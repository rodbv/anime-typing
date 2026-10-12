// Passing a lesson needs accuracy and a minimum speed, and the daily mission brings cleared lessons back on a schedule.
const {boot} = require('./harness');
const check = (ok, msg) => { if (!ok) throw new Error(msg); };
const A = boot(); A.ready();
const ev = A.ev;

// The minimum speed rises along the course: 8, 10 and 12 WPM.
check(ev('starsFor(7, 100, 0)') === 0, 'lesson 1 at 7 WPM should not pass');
check(ev('starsFor(8, 95, 0)') >= 1, 'lesson 1 at 8 WPM and 95% should pass');
check(ev('starsFor(9, 100, 6)') === 0 && ev('starsFor(10, 100, 6)') >= 1, 'lesson 7 should ask for 10 WPM');
check(ev('starsFor(11, 100, 13)') === 0 && ev('starsFor(12, 100, 13)') >= 1, 'lesson 14 should ask for 12 WPM');
check(ev('starsFor(30, 89, 0)') === 0, 'accuracy below 90% should not pass at any speed');

// A slow run fails with the speed message, and the run label shows the lesson's goal.
ev('startRun("lesson", {lessonIdx: 0})');
check(ev('runLabel()').includes('meta 8 PPM'), 'the run label should show the speed goal');
ev('activeMs = () => 600000; if (run.introOpen) closeIntro()');
A.type(ev('run.text'));
check(A.d.querySelector('#results h2').textContent.includes('8 PPM'), 'a slow run should fail with the speed message, got ' + A.d.querySelector('#results h2').textContent);
check(!ev('lessonDone(LESSON_DEFS[0].id)'), 'a slow run should not clear the lesson');

// Spaced review: a lesson cleared yesterday is due once; after its review it waits until day 3.
const B = boot(); B.ready();
const day = 86400000;
B.ev(`progress().fj = {stars: 1, wpm: 20, acc: 95, last: Date.now() - ${day}, cleared: Date.now() - ${day}};
      progress().dk = {stars: 1, wpm: 20, acc: 95, last: Date.now(), cleared: Date.now()}`);
check(B.ev('pickReviewLesson("sl")') === 'fj', 'a lesson cleared yesterday should be the review');
B.playLesson(0);
check(B.ev('progress().fj.reviews') === 1, 'passing a due lesson should count one review');
check(B.ev('progress().fj.cleared') < Date.now() - day / 2, 'the first clear date should stay');
check(!B.ev('reviewDue(LESSON_DEFS[0])'), 'after its first review the lesson should wait');
B.ev(`progress().fj.cleared = Date.now() - 3 * ${day}`);
check(B.ev('reviewDue(LESSON_DEFS[0])'), 'three days after the clear the lesson should be due again');
B.ev(`progress().fj.reviews = 3; progress().fj.cleared = Date.now() - 30 * ${day}`);
check(!B.ev('reviewDue(LESSON_DEFS[0])'), 'after three reviews the lesson should not come back');

console.log('ERRORS', A.errors, B.errors);
process.exit(0);

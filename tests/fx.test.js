// A theme with effects floats its marks during a long run of hits and bursts its rush word at each milestone; a miss starts over.
const {boot} = require('./harness');
const check = (ok, msg) => { if (!ok) throw new Error(msg); };
const typeClean = (A, n) => { for (let i = 0; i < n; i++) A.type(A.ev('run.text[run.pos]')); };
const count = (A, kind) => A.d.querySelectorAll('#fx .fx.' + kind).length;

const J = boot(); J.ready();
J.ev('startRun("lesson",{lessonIdx:5})'); J.ev('if (run.introOpen) closeIntro()');
typeClean(J, 11);
check(count(J, 'mark') === 0, 'no mark should float before 12 hits in a row');
typeClean(J, 1);
check(count(J, 'mark') === 1 && 'ゴド'.includes(J.d.querySelector('#fx .mark').textContent), 'the 12th hit in a row should float a menacing mark');
typeClean(J, 13);
check(count(J, 'rush') === 6 && J.d.querySelector('#fx .rush').textContent === 'ORA', 'the 25th hit in a row should burst six ORA');
J.type('\u0001');
const marks = count(J, 'mark');
typeClean(J, 11);
check(count(J, 'mark') === marks, 'a miss should restart the count');
J.ev('restart()');
check(count(J, 'mark') + count(J, 'rush') === 0, 'a new run should clear the effects');

// A theme without effects shows none.
const R = boot(null, 'http://localhost/', {page: 'rush.html'}); R.ready();
R.ev('startRun("lesson",{lessonIdx:5})'); R.ev('if (run.introOpen) closeIntro()');
typeClean(R, 30);
check(count(R, 'mark') + count(R, 'rush') === 0, 'a theme without fx should float nothing');
// A failed lesson ends with the theme's banner; a cleared one does not.
const failLesson = A => {
  A.ev('startRun("lesson",{lessonIdx:2})'); A.ev('if (run.introOpen) closeIntro()');
  while (!A.ev('run.done')) { A.type('\u0001'); typeClean(A, Math.min(3, A.ev('run.text.length - run.pos'))); }
};
failLesson(J);
check(J.d.querySelector('#results .tbc')?.textContent === 'To Be Continued' && J.d.getElementById('results').classList.contains('cliffhanger'),
  'a failed lesson should end with To Be Continued');
check(J.d.querySelector('#results .frozen img')?.getAttribute('src') === 'themes/jojo/johnny-falls.webp', 'a failed lesson should freeze the theme\'s fail art under the banner');
check(J.ev('clipTurns.fail') === 1 && J.ev('clipSets.fail[0].src').endsWith('themes/jojo/roundabout.mp3'), 'a failed lesson should play the theme\'s fail clip');
// Typing DERROTA during a lesson fails it at once.
J.ev('startRun("lesson",{lessonIdx:2})'); J.ev('if (run.introOpen) closeIntro()');
typeClean(J, 3); [...'DERROTA'].forEach(ch => J.type(ch));
check(J.ev('run.done') && !J.ev('run.passed') && J.d.querySelector('#results .frozen img'), 'typing DERROTA should fail the lesson');
J.playLesson(2);
check(!J.d.querySelector('#results .tbc') && !J.d.getElementById('results').classList.contains('cliffhanger'), 'a cleared lesson should not show the banner');
failLesson(R);
check(!R.d.querySelector('#results .tbc'), 'a theme without failBanner should not show it');
// Winning a race shows the theme's victory art; a lesson without a race does not.
const art = A => [...A.d.querySelectorAll('#results .victory img')].map(i => i.getAttribute('src'));
J.playLesson(2);
check(art(J).length === 0, 'a lesson without a race should not show the victory art');
// The ghost follows the recent speed, so an empty history keeps it at its floor.
J.ev('data.history = []'); J.playLesson(5);
check(J.ev('run.won') && art(J).join() === 'themes/jojo/johnny.webp,themes/jojo/gyro.webp', 'a won race should show the victory art, got ' + art(J));
R.playLesson(1);
check(R.ev('run.won') && art(R).length === 0, 'a theme without winArt should not show it');
console.log('ERRORS', J.errors, R.errors);
process.exit(0);

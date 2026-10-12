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
console.log('ERRORS', J.errors, R.errors);
process.exit(0);

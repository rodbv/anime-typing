// In a lesson, the accuracy and speed bars mark the lesson's goals, and each bar turns red below its goal.
const {boot} = require('./harness');
const check = (ok, msg) => { if (!ok) throw new Error(msg); };
const A = boot(null, 'http://localhost/', {clock: true}); const {d, ev} = A; A.ready();
const low = id => d.getElementById(id).classList.contains('low');
const goalLeft = () => d.getElementById('m-acc-goal').style.left;
const typeEvery = (ms, n) => { for (let i = 0; i < n; i++) { A.type(ev('run.text[run.pos]')); A.tick(ms); } };

// Lesson 3 asks for 90% and 8 WPM.
ev('startRun("lesson",{lessonIdx:2})'); ev('closeIntro()');
check(A.vis('m-goals') && goalLeft() === '80%', 'a lesson should mark 90% on the accuracy bar, got ' + goalLeft());
typeEvery(4000, 5);
check(!low('m-wpm-bar'), 'the speed bar should not turn red over the first keys');
typeEvery(4000, 6);
check(low('m-wpm-bar') && d.getElementById('m-wpm-txt').textContent.endsWith('/ 8 PPM'), 'slow typing should turn the speed bar red, got ' + d.getElementById('m-wpm-txt').textContent);

ev('startRun("lesson",{lessonIdx:2})');
typeEvery(200, 12);
check(!low('m-wpm-bar') && !low('m-acc-bar'), 'fast and clean typing should keep both bars green');
for (let i = 0; i < 3; i++) { A.type('\u0001'); typeEvery(200, 1); }
check(low('m-acc-bar'), 'misses below 90% should turn the accuracy bar red, got ' + ev('metrics().acc') + '%');

// A race asks for 92%, and the free run shows no goal bars.
ev('startRun("lesson",{lessonIdx:1})');
check(goalLeft() === '84%', 'a race should mark 92% on the accuracy bar, got ' + goalLeft());
ev('startRun("free")');
check(!A.vis('m-goals'), 'the free run should hide the goal bars');
console.log('ERRORS', A.errors);
process.exit(0);

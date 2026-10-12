// The race ghost: its speed, its position, the place and points, adaptive speed, pause, and no ghost outside races.
const {boot} = require('./harness');
const check = (ok, msg) => { if (!ok) throw new Error(msg); };
const A = boot(); const {d, ev} = A; A.ready();

// With no history, the ghost runs at the rival's floor.
ev('startRun("lesson",{lessonIdx:1, forceIntro:true})');
const race = ev('run.race');
console.log('race:', JSON.stringify(race));
check(race.id === 'sandman' && race.wpm >= ev('RIVALS.sandman.floor'), 'the lesson 2 ghost should be the Sandman, at least at his floor');
check(d.getElementById('type-label').textContent.includes('🏁 Sandman'), 'the run label should name the rival');
check(d.querySelector('#intro p.sub')?.textContent.includes('93%'), 'the intro should explain the race rule');
ev('closeIntro()');
check(A.vis('m-ghost') && d.querySelector('.c.ghost'), 'the ghost marker should show from the start');

// After 6 seconds, the ghost stands where its speed puts it.
const text = ev('run.text');
A.type(text.slice(0, 20));
ev('run.started -= 6000; run.lastKey = Date.now(); updateGhost()');
const ghostAt = [...d.querySelectorAll('#text-inner .c')].findIndex(e => e.classList.contains('ghost'));
check(ghostAt === Math.floor(ev('activeMs()') / 1000 * ev('run.race.cps')), 'the ghost should advance at its speed, got ' + ghostAt);

// A fast finish wins first place and its points; a slow one keeps the best place.
A.type(text.slice(20));
check(d.querySelector('#results .bubble')?.textContent.includes('1º lugar'), 'a fast finish should win first place');
check(ev('progress().dk.place') === 1 && ev('racePoints()') === 10, 'first place should be saved with 10 points');
ev('startRun("lesson",{lessonIdx:1})');
A.type(ev('run.text').slice(0, 5)); ev('run.started -= 300000; run.lastKey = Date.now()');
A.type(ev('run.text').slice(5));
check(d.querySelector('#results .bubble')?.textContent.includes('Fora do pódio'), 'a slow finish should be off the podium');
check(ev('progress().dk.place') === 1, 'a slow finish should keep the best place');

// The ghost runs 10% above the recent average, or 20% for a boss.
ev('data.history.push({wpm:20,acc:95},{wpm:22,acc:96},{wpm:18,acc:94})');
check(ev('makeRace(LESSON_DEFS[5]).wpm') === 22 && ev('makeRace(LESSON_DEFS[18]).wpm') === 24, 'the ghost should adapt to the recent speed');

// Pause freezes the ghost; a lesson without a rival has no ghost.
ev('startRun("lesson",{lessonIdx:1})'); A.type(ev('run.text').slice(0, 3));
ev('pause("menu")'); const g1 = ev('activeMs()');
setTimeout(() => {
  check(Math.abs(ev('activeMs()') - g1) < 5, 'the ghost clock should stop during a pause');
  ev('startRun("lesson",{lessonIdx:0})');
  check(!ev('run.race') && !A.vis('m-ghost'), 'lesson 1 should have no ghost');
  console.log('ERRORS', A.errors);
  process.exit(0);
}, 300);

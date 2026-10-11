const {boot} = require('./harness');
const A = boot(); const {d, ev} = A; A.ready();
// race floor with no history
ev('startRun("lesson",{lessonIdx:1, forceIntro:true})');
console.log('race:', JSON.stringify(ev('run.race')), '| label:', d.getElementById('type-label').textContent);
console.log('intro rule:', d.querySelector('#intro p.sub')?.textContent);
ev('closeIntro()');
console.log('ghost marker visible:', A.vis('m-ghost'), '| ghost class at start:', !!d.querySelector('.c.ghost'));
const text = ev('run.text');
A.type(text.slice(0, 20));
ev('run.started -= 6000; run.lastKey = Date.now()');   // 6 s at 6 PPM = 3 chars ahead? ghost cps 0.5 -> idx 3
ev('updateGhost()');
console.log('ghost idx after 6 s:', [...d.querySelectorAll('#text-inner .c')].findIndex(e => e.classList.contains('ghost')), '| expected ~', Math.floor(ev('activeMs()') / 1000 * ev('run.race.cps')));
A.type(text.slice(20));
console.log('result:', d.querySelector('#results .bubble')?.textContent);
console.log('saved place:', ev('progress().dk.place'), '| points:', ev('racePoints()'));
// slow finish: fake 5 minutes for the same text -> out of podium
ev('startRun("lesson",{lessonIdx:1})');
A.type(ev('run.text').slice(0, 5)); ev('run.started -= 300000; run.lastKey = Date.now()');
A.type(ev('run.text').slice(5));
console.log('slow result:', d.querySelector('#results .bubble')?.textContent, '| best place kept:', ev('progress().dk.place'));
// adaptive speed: history at ~20 PPM
ev('data.history.push({wpm:20,acc:95},{wpm:22,acc:96},{wpm:18,acc:94})');
console.log('adaptive diego (x1.1):', ev('makeRace(LESSON_DEFS[5]).wpm'), '| valentine boss (x1.2):', ev('makeRace(LESSON_DEFS[18]).wpm'));
// pause freezes the ghost
ev('startRun("lesson",{lessonIdx:1})'); A.type(ev('run.text').slice(0, 3));
ev('pause("menu")'); const g1 = ev('activeMs()');
setTimeout(() => {
  console.log('ghost frozen during pause:', Math.abs(ev('activeMs()') - g1) < 5);
  // non-race lesson has no ghost
  ev('startRun("lesson",{lessonIdx:0})'); console.log('no race on L1:', !ev('run.race'), '| marker hidden:', !A.vis('m-ghost'));
  console.log('ERRORS', A.errors);
  process.exit(0);
}, 300);

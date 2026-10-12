// The daily mission: next lesson, review and free run, the mission-done screen, the review pick and the break tip.
const {boot} = require('./harness');
const check = (ok, msg) => { if (!ok) throw new Error(msg); };
const A = boot(null, 'http://localhost/', {clock: true}); const {d, ev} = A; A.ready();
const tasks = () => JSON.stringify(ev('(({next,review,free,done})=>({next,review,free,done}))(today())'));

check(d.querySelectorAll('#home .mission button').length === 3, 'the home screen should list three mission tasks');
check(d.querySelectorAll('#home .week i').length === 7, 'the week strip should show seven days');
A.playLesson(0);
check(tasks() === '{"next":true,"review":false,"free":false,"done":false}', 'the first lesson should count as the next lesson, got ' + tasks());
// With no review lesson picked on day 1, any lesson after the next one counts as the review.
A.playLesson(0);
check(tasks() === '{"next":true,"review":true,"free":false,"done":false}', 'a replay should count as the review on day 1, got ' + tasks());

// The free run closes the mission with the mission-done box.
ev('S.time=30; startRun("free")'); A.type(ev('run.text').slice(0, 10)); ev('run.started -= 31000; run.lastKey = Date.now()');
A.tick(300);
check(ev('run.done'), 'the free run should end after its time');
check(d.querySelector('#results .done-box'), 'the mission-done box should show');
const acts = [...d.querySelectorAll('#results [data-act]')].map(b => b.dataset.act);
check(acts[0] === 'home' && acts.includes('back'), 'the mission-done result should offer home first and keep back, got ' + acts);
check(ev('data.unlocked.nyoho'), 'the first mission should unlock its achievement');
A.key('Enter');
check(ev('view') === 'home' && d.querySelector('#home .mission + p'), 'Enter should go home, which says the mission is done');

// The next day, the review lesson is the one with the key that has the most misses.
ev('data.keys.intl = {d:{h:20,m:8}, f:{h:40,m:1}}; progress().dk = {stars:1,wpm:10,acc:95,last:Date.now(),cleared:Date.now()}; delete data.days[dayKey(new Date())]');
check(ev('today().reviewLesson') === 'dk' && ev('today().nextLesson') === 'sl', 'the review should follow the worst key, D');
// After 20 minutes in a day, the result suggests a break.
ev('today().ms = 20*60000');
A.playLesson(2);
check(d.querySelector('#results .tipline')?.textContent.includes('20 minutos'), 'the result should suggest a break after 20 minutes');
ev('showView("home")'); d.querySelector('#home [data-go=review]').click();
check(ev('LESSON_DEFS[run.lessonIdx].id') === 'dk', 'the review task should start the review lesson');
console.log('ERRORS', A.errors);
process.exit(0);

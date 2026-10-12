// The daily mission: next lesson, review and free run, the streak of training days, the review pick and the break tip.
const {boot} = require('./harness');
const check = (ok, msg) => { if (!ok) throw new Error(msg); };
const A = boot(null, 'http://localhost/', {clock: true}); const {d, ev} = A; A.ready();
const tasks = () => JSON.stringify(ev('(({next,review,free,done})=>({next,review,free,done}))(today())'));

check(d.querySelectorAll('#home .mission button').length === 3, 'the home screen should list three mission tasks');
check(d.querySelectorAll('#home .week i').length === 7, 'the week strip should show seven days');
A.playLesson(0);
check(tasks() === '{"next":true,"review":false,"free":false,"done":false}', 'the first lesson should count as the next lesson, got ' + tasks());
check(d.querySelector('#results .done-box')?.textContent.includes('Primeiro dia da sequência'), 'the first run of the day should start the streak');
// With no review lesson picked on day 1, any lesson after the next one counts as the review.
A.playLesson(0);
check(tasks() === '{"next":true,"review":true,"free":false,"done":false}', 'a replay should count as the review on day 1, got ' + tasks());
check(!d.querySelector('#results .done-box'), 'only the first run of the day should celebrate the streak');

// The free run closes the mission, which the home screen marks without a prize on the result.
ev('S.time=30; startRun("free")'); A.type(ev('run.text').slice(0, 10)); ev('run.started -= 31000; run.lastKey = Date.now()');
A.tick(300);
check(ev('run.done') && ev('today().done'), 'the free run should end after its time and close the mission');
check(ev('[...document.querySelectorAll("#results [data-act]")][0].dataset.act') === 'again', 'the mission should not change the result buttons');
ev('showView("home")');
check(d.querySelector('#home .mission + p'), 'the home screen should say the mission is done');

// Days with a finished run in a row make the streak, and two of them unlock the first streak achievement.
check(ev('daysInARow()') === 1 && !ev('data.unlocked.nyoho'), 'one day of training should make a streak of 1');
ev('const k = dayKey(new Date()); data.days[dayBefore(k)] = {ms: 60000}; data.days[dayBefore(dayBefore(k))] = {ms: 60000}; data.days[dayBefore(dayBefore(dayBefore(dayBefore(k))))] = {ms: 60000}');
check(ev('daysInARow()') === 3 && ev('bestDaysInARow()') === 3, 'three days in a row should make a streak of 3, not counting the day after a gap');
A.playLesson(1);
check(ev('data.unlocked.nyoho'), 'two days in a row should unlock the first streak achievement');
ev('showView("home")');
check(d.querySelector('#home .week').textContent.includes('3 seguidos'), 'the week strip should show the streak');

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

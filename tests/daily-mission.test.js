const {boot} = require('./harness');
const A = boot(); const {d, ev} = A; A.ready();
console.log('home mission:', [...d.querySelectorAll('#home .mission button')].map(b => b.textContent.trim()).join(' / '));
console.log('week dots:', d.querySelectorAll('#home .week i').length, '|', d.querySelector('#home .week span:last-child').textContent);
// task 1: next lesson
A.playLesson(0);
console.log('after L1:', JSON.stringify(ev('(({next,review,free,done})=>({next,review,free,done}))(today())')));
// task 2 with no review lesson picked on day 1: any lesson after the next one
A.playLesson(0);
console.log('after replay L1:', JSON.stringify(ev('(({next,review,free,done})=>({next,review,free,done}))(today())')));
// task 3: free run, closes the mission with the mission done box
ev('S.time=30; startRun("free")'); A.type(ev('run.text').slice(0, 10)); ev('run.started -= 31000; run.lastKey = Date.now()');
setTimeout(() => {
  console.log('free done:', ev('run.done'), '| mission done box:', d.querySelector('#results .done-box')?.textContent.slice(0, 80));
  console.log('buttons:', [...d.querySelectorAll('#results [data-act]')].map(b => b.dataset.act + ':' + b.textContent).join(' | '));
  console.log('nyoho unlocked:', !!ev('data.unlocked.nyoho'));
  A.key('Enter'); console.log('Enter goes home:', ev('view'), '| home says done:', !!d.querySelector('#home .mission + p'));
  // next day: review lesson chosen by worst key
  ev('data.keys.intl = {d:{h:20,m:8}, f:{h:40,m:1}}; progress().dk = {stars:1,wpm:10,acc:95,last:1}; delete data.days[dayKey(new Date())]');
  console.log('review lesson by worst key D:', ev('today().reviewLesson'), '| next:', ev('today().nextLesson'));
  // break reminder after 20 min
  ev('today().ms = 20*60000');
  A.playLesson(2);
  console.log('break tip:', d.querySelector('#results .tipline')?.textContent);
  ev('showView("home")'); d.querySelector('#home [data-go=review]').click();
  console.log('review button starts lesson:', ev('run.lessonIdx'), ev('LESSON_DEFS[run.lessonIdx].id'));
  console.log('ERRORS', A.errors);
  process.exit(0);
}, 300);

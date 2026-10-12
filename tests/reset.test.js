// ?reset erases the progress and removes itself from the address; without it the progress stays.
const {boot} = require('./harness');
const check = (ok, msg) => { if (!ok) throw new Error(msg); };
const A = boot(); A.ready(); A.playLesson(0);
const saved = A.saved();
const R = boot(saved, 'http://localhost/jojo-typing/?reset');
console.log('after ?reset: view', R.ev('view'), '| setupDone', R.ev('S.setupDone'), '| lessons', R.ev('Object.keys(progress()).length'), '| url', R.w.location.href);
check(R.ev('view') === 'prologue' && !R.ev('S.setupDone'), '?reset should start over as a first visit');
check(R.ev('Object.keys(progress()).length') === 0, '?reset should erase the lessons');
check(!R.w.location.search.includes('reset'), '?reset should remove itself from the address');
const K = boot(saved, 'http://localhost/jojo-typing/');
check(K.ev('Object.keys(progress()).length') === 1, 'a load without ?reset should keep the progress');
console.log('ERRORS', A.errors, R.errors, K.errors);
process.exit(0);

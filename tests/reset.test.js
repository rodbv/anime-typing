const {boot} = require('./harness');
const A = boot(); A.ready(); A.playLesson(0);
const saved = A.w.localStorage.getItem('typedojo:v1');
const R = boot(saved, 'http://localhost/jojo-typing/?reset');
console.log('after ?reset: view', R.ev('view'), '| setupDone', R.ev('S.setupDone'), '| lessons', R.ev('Object.keys(progress()).length'), '| url', R.w.location.href);
const K = boot(saved, 'http://localhost/jojo-typing/');
console.log('without reset keeps progress:', K.ev('Object.keys(progress()).length'));
console.log('ERRORS', A.errors, R.errors, K.errors);
process.exit(0);

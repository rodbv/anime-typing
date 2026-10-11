const {boot} = require('./harness');
const A = boot(); const {d, ev} = A; A.ready();
const state = () => `kb=${A.vis('kb-wrap')} hint="${d.getElementById('hint').textContent.slice(0, 30)}" lit=${d.querySelectorAll('#kb .key.next').length}`;
ev('startRun("lesson",{lessonIdx:2})'); ev('closeIntro()');
console.log('new-key lesson, warm-up:', state(), '| btn:', d.getElementById('btn-kb').textContent);
A.type(ev('run.text').slice(0, ev('run.bounds[0]')));
console.log('words part, right after a key:', state());
setTimeout(() => {
  console.log('words part, after 1.3 s:', state());
  A.type('\u0001'); console.log('after a mistake:', state());
  // review lesson: keyboard hidden, hint after 1.5 s
  ev('startRun("lesson",{lessonIdx:5})'); ev('closeIntro()');
  console.log('review start:', state(), '| btn:', d.getElementById('btn-kb').textContent);
  setTimeout(() => {
    console.log('review after 1.6 s:', state());
    d.getElementById('btn-kb').click(); console.log('after Mostrar teclado:', state(), '| btn:', d.getElementById('btn-kb').textContent);
    ev('startRun("free")'); console.log('free run start:', state());
    ev('S.showKb=false; startRun("lesson",{lessonIdx:2})'); ev('closeIntro()'); console.log('setting off, new-key lesson:', state());
    console.log('ERRORS', A.errors);
    process.exit(0);
  }, 1600);
}, 1300);

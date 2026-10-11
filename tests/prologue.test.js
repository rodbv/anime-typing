const {boot} = require('./harness');
const A = boot(); const {d, ev} = A;
const title = X => X.d.querySelector('#prologue h1')?.textContent;
const nextBtn = X => X.d.querySelector('[data-pro=next]').textContent;
const body = X => [...X.d.querySelectorAll('#prologue .card > p')].map(p => p.textContent).join(' | ');
console.log('first run view:', ev('view'), '| tabs hidden:', d.getElementById('tabs').hidden, '| title:', title(A));
A.key('Enter'); console.log('Enter ->', title(A));
A.key('ArrowRight'); console.log('ArrowRight ->', title(A), '| hands art:', !!d.querySelector('#prologue .pro-art svg.hands'));
A.key('ArrowLeft'); console.log('ArrowLeft ->', title(A));
A.key('Escape'); console.log('Esc jumps to last:', title(A), '| map:', !!d.querySelector('#prologue .pro-art svg'), '| button:', nextBtn(A), '| skip shown:', !!d.querySelector('[data-pro=skip]'));
A.key('Enter'); console.log('first run after last -> view:', ev('view'));
// returning player mid-race: prologue opens on every load, last slide shows the position
A.ready(); A.playLesson(0); A.playLesson(1); A.playLesson(2);
const B = boot(A.w.localStorage.getItem('typedojo:v1'));
console.log('reload view:', B.ev('view'), '| title:', title(B));
B.d.querySelector('[data-pro=skip]').click();
console.log('last slide:', title(B), '|', body(B));
console.log('buttons:', nextBtn(B), '/', B.d.querySelector('[data-pro=home]')?.textContent);
B.key('Enter'); console.log('Enter starts lesson:', B.ev('view'), B.ev('run.lessonIdx'), B.ev('LESSON_DEFS[run.lessonIdx].id'));
// race lesson mention
const C = boot(A.w.localStorage.getItem('typedojo:v1'));
C.ev('S.unlockAll=false; LESSON_DEFS.slice(0,5).forEach(L => progress()[L.id] = {stars:1,wpm:20,acc:95,last:1}); save()');
C.ev('prologueAt = PROLOGUE.length; renderPrologue()'); console.log('before race:', body(C).split(' | ')[1]);
C.d.querySelector('[data-pro=home]').click(); console.log('home button ->', C.ev('view'));
// finished race
C.ev('LESSON_DEFS.forEach(L => progress()[L.id] = {stars:1,wpm:20,acc:95,last:1}); showView("prologue"); prologueAt = PROLOGUE.length; renderPrologue()');
console.log('finished:', title(C), '|', nextBtn(C)); C.key('Enter'); console.log('finished Enter ->', C.ev('view'));
// replay from Ficha
C.ev('showView("stats")'); C.d.getElementById('btn-prologue').click(); console.log('replay:', C.ev('view'), title(C));
console.log('ERRORS', A.errors, B.errors, C.errors);
process.exit(0);

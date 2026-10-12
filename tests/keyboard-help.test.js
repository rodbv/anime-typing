// The on-screen keyboard shows in new-key lessons; elsewhere the hint waits for a pause, and the player can toggle it.
const {boot} = require('./harness');
const check = (ok, msg) => { if (!ok) throw new Error(msg); };
const A = boot(null, 'http://localhost/', {clock: true}); const {d, ev} = A; A.ready();
const kb = () => A.vis('kb-wrap');
const hint = () => d.getElementById('hint').textContent;
const lit = () => d.querySelectorAll('#kb .key.next').length;
const btn = () => d.getElementById('btn-kb').textContent;
// The warm-up drill picks its key order at random, so the hint names the first key of this run.
const firstKeyHint = () => hint().startsWith('Próxima: ' + ev('run.text[0]').toUpperCase());

// New-key lesson: the keyboard shows in the warm-up and lights the next key.
ev('startRun("lesson",{lessonIdx:2})'); ev('closeIntro()');
check(kb() && firstKeyHint() && lit() === 1 && btn() === 'Esconder teclado', 'the warm-up should show the keyboard and the next key');
// Words part: right after a key the hint is empty, and it comes back after a 1.2 s pause.
A.type(ev('run.text').slice(0, ev('run.bounds[0]')));
check(kb() && hint() === '' && lit() === 0, 'right after a key the hint should be empty');
A.tick(1100);
check(hint() === '', 'the hint should still wait 1.1 s after a key');
A.tick(100);
check(hint().startsWith('Próxima:') && lit() === 1, 'after a pause the hint should come back');
A.type('\u0001');
check(hint().startsWith('Próxima:') && lit() === 1, 'after a mistake the hint should show');

// Review lesson: the keyboard is hidden, and the hint waits 1.5 s.
ev('startRun("lesson",{lessonIdx:5})'); ev('closeIntro()');
check(!kb() && hint() === '' && btn() === 'Mostrar teclado', 'a review should start with the keyboard hidden');
A.tick(1400);
check(hint() === '', 'a review hint should still wait 1.4 s after the start');
A.tick(100);
check(!kb() && hint().startsWith('Próxima:') && lit() === 1, 'a review should show the hint after a pause');
d.getElementById('btn-kb').click();
check(kb() && btn() === 'Esconder teclado', 'the button should show the keyboard');
ev('startRun("free")');
check(!kb() && hint() === '', 'a free run should start with the keyboard hidden');
ev('S.showKb=false; startRun("lesson",{lessonIdx:2})'); ev('closeIntro()');
check(!kb() && firstKeyHint(), 'with the setting off, a new-key lesson should hide the keyboard and keep the hint');
console.log('ERRORS', A.errors);
process.exit(0);

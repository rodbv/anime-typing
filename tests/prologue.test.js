// The opening story: keys move between slides, the last slide shows where the player is, and its buttons go to the right place.
const {boot} = require('./harness');
const check = (ok, msg) => { if (!ok) throw new Error(msg); };
const A = boot(); const {d, ev} = A;
const title = X => X.d.querySelector('#prologue h1')?.textContent;
const nextBtn = X => X.d.querySelector('[data-pro=next]').textContent;
const body = X => [...X.d.querySelectorAll('#prologue .card > p')].map(p => p.textContent).join(' | ');

// First visit: Enter and the arrows move between slides, and Esc jumps to the last one.
check(ev('view') === 'prologue' && d.getElementById('tabs').hidden, 'a first visit should open the story without tabs');
const first = title(A);
A.key('Enter'); const second = title(A);
check(second !== first, 'Enter should go to the next slide');
A.key('ArrowRight');
check(d.querySelector('#prologue .pro-art svg.hands'), 'the third slide should draw the hands');
A.key('ArrowLeft');
check(title(A) === second, 'ArrowLeft should go back one slide');
A.key('Escape');
check(title(A) === 'Na largada' && nextBtn(A).startsWith('Fazer a inscrição') && !d.querySelector('[data-pro=skip]'), 'Esc should jump to the start position slide');
A.key('Enter');
check(ev('view') === 'setup', 'Enter on the last slide of a first visit should open the setup');

// A returning player in the middle of the course sees the story again; the last slide shows the position.
A.ready(); A.playLesson(0); A.playLesson(1); A.playLesson(2);
const B = boot(A.saved());
check(B.ev('view') === 'prologue' && title(B) === first, 'a reload without a hash should open the story');
check(B.d.querySelector('.btn.primary').textContent.startsWith('Continuar a corrida') && nextBtn(B) === 'Relembrar a história', 'a returning player should get the race as the main button and the story as the other');
B.key('ArrowRight'); B.key('ArrowLeft');
check(nextBtn(B).startsWith('Próximo'), 'after the player moves through the story the first slide should offer the next slide');
B.ev('offerResume = true; renderPrologue()');
B.key('Enter');
console.log('last slide:', title(B), '|', body(B));
check(title(B) === 'Etapa 2: Deserto do Arizona' && body(B).includes('Próxima lição: 4'), 'the last slide should show the stage and the next lesson');
check(nextBtn(B).includes('lição 4') && B.d.querySelector('[data-pro=home]'), 'the last slide should offer lesson 4 and home');
B.key('Enter');
check(B.ev('view') === 'type' && B.ev('LESSON_DEFS[run.lessonIdx].id') === 'a', 'Enter should start lesson 4');

// Before a race, the last slide names the rival; its home button goes home.
const C = boot(A.saved());
C.ev('S.unlockAll=false; LESSON_DEFS.slice(0,5).forEach(L => progress()[L.id] = {stars:1,wpm:20,acc:95,last:1}); save()');
C.ev('prologueAt = PROLOGUE.length; renderPrologue()');
check(body(C).includes('corrida contra Diego Brando'), 'the slide before a race should name the rival');
C.d.querySelector('[data-pro=home]').click();
check(C.ev('view') === 'home', 'the home button should go home');

// After the course, the last slide shows the finish, and Enter goes home.
C.ev('LESSON_DEFS.forEach(L => progress()[L.id] = {stars:1,wpm:20,acc:95,last:1}); showView("prologue"); prologueAt = PROLOGUE.length; renderPrologue()');
check(title(C) === 'Trinity Church, Nova York' && nextBtn(C).startsWith('Ir para o início'), 'the finished slide should offer home');
C.key('Enter');
check(C.ev('view') === 'home', 'Enter on the finished slide should go home');
// The profile can replay the story from the first slide.
C.ev('showView("stats")'); C.d.getElementById('btn-prologue').click();
check(C.ev('view') === 'prologue' && title(C) === first, 'replaying the story should start at the first slide');
console.log('ERRORS', A.errors, B.errors, C.errors);
process.exit(0);

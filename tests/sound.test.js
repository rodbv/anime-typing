// Each game event asks for its sound, and the sound setting mutes them.
const {boot} = require('./harness');
const check = (ok, msg) => { if (!ok) throw new Error(msg); };
const A = boot(); const {d, ev} = A; A.ready();
ev('window.asked = []; const realSound = sound; sound = name => { asked.push(name); realSound(name); }; window.tones = 0; tone = () => tones++');
ev('window.clips = []; window.Audio = class { constructor(src) { this.src = src; } play() { clips.push(this.src); } }');
const asked = () => ev('asked.splice(0)');
const typeClean = n => { for (let i = 0; i < n; i++) A.type(ev('run.text[run.pos]')); };

ev('startRun("lesson",{lessonIdx:5})'); ev('if (run.introOpen) closeIntro()');
typeClean(1);
check(asked().join() === 'hit' && ev('tones') > 0, 'a hit should ask for its sound');
A.type('\u0001');
check(asked().join() === 'miss', 'a miss should ask for its sound');
typeClean(26);
check(asked().includes('burst') && ev('clips.join()') === 'themes/jojo/ora.mp3', '25 hits in a row should play the theme\'s ORA clip, got ' + ev('clips.join()'));
typeClean(ev('run.text.length - run.pos'));
check(asked().pop() === 'clear', 'a cleared lesson should end with the clear sound');

d.querySelector('#tabs [data-view=stats]').click();
d.getElementById('opt-sound').click();
check(ev('S.sound') === false && JSON.parse(A.saved()).settings.sound === false, 'the setting should turn the sound off and save it');
ev('tones = 0; startRun("lesson",{lessonIdx:5})'); ev('if (run.introOpen) closeIntro()');
typeClean(3); A.type('\u0001');
check(ev('tones') === 0, 'with the sound off no tone should play');
console.log('ERRORS', A.errors);
process.exit(0);

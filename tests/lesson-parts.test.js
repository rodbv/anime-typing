// Lesson texts on every layout: three parts, every character typable, only learned letters; stars and the part toast.
const {boot} = require('./harness');
const check = (ok, msg) => { if (!ok) throw new Error(msg); };
const A = boot(); const {d, ev} = A; A.ready();
const bad = [];
for (const layout of ['intl', 'abnt', 'us']) {
  ev(`S.layout='${layout}'`);
  for (let i = 0; i < 21; i++) for (let k = 0; k < 25; k++) {
    const parts = ev(`lessonParts(${i})`);
    if (parts.length !== 3) bad.push(`${layout}:${i} parts=${parts.length}`);
    const txt = parts.join(' ');
    const u = ev(`[...${JSON.stringify(txt)}].filter(c=>!strokes(c,true)).join('')`);
    if (u) bad.push(`${layout}:${i} untypable ${u}`);
    const allowed = ev(`[...allowedUpTo(${i})]`);
    // The accent lessons (14, 15) and the lessons after the last new key use every letter.
    if (i < 18 && !(i === 13 || i === 14)) {
      const strange = [...txt.toLowerCase()].filter(c => c !== ' ' && !allowed.includes(c));
      if (strange.length) bad.push(`${layout}:${i} letters not learned: ${[...new Set(strange)].join('')}`);
    }
  }
}
check(!bad.length, 'lesson text problems: ' + [...new Set(bad)].slice(0, 12).join('; '));
ev("S.layout='intl'");
for (const i of [0, 4, 13]) console.log(`L${i + 1}:`, ev(`lessonParts(${i})`).join(' | '));

// Up to the top-row review, stars depend on accuracy only; later they also ask for speed. A race asks for 92%.
check(JSON.stringify(ev('[starsFor(10,90,2), starsFor(10,95,2), starsFor(10,98,2)]')) === '[1,2,3]', 'lesson 3 stars should follow accuracy');
check(JSON.stringify(ev('[starsFor(12,98,15), starsFor(16,95,15), starsFor(22,97,15)]')) === '[1,2,3]', 'lesson 16 stars should follow accuracy and speed');
check(ev('starsFor(30,91,1)') === 0 && ev('starsFor(30,92,1)') === 1, 'a race should pass at 92% and fail at 91%');

// A toast marks the end of each part.
ev('startRun("lesson",{lessonIdx:2})'); ev('closeIntro()');
A.type(ev('run.text').slice(0, ev('run.bounds[0]')));
check(A.vis('toast') && d.getElementById('toast').textContent.startsWith('Trecho 1 de 3'), 'a toast should mark the end of part 1');

// A race with misses below 92% fails with the accuracy message.
A.playLesson(1, 0);
check(d.querySelector('#results h2').textContent.includes('concluída'), 'a clean race should clear the lesson');
ev('startRun("lesson",{lessonIdx:1})');
const text = ev('run.text');
for (let i = 0; i < 16; i++) { A.type('\u0001'); A.type(text[ev('run.pos')]); A.type(text.slice(ev('run.pos'), ev('run.pos') + 4)); }
A.type(text.slice(ev('run.pos')));
console.log('race with misses:', ev('metrics().acc') + '%');
check(ev('metrics().acc') < 92 && d.querySelector('#results h2').textContent.includes('92%'), 'a race below 92% should fail with the accuracy message');
console.log('ERRORS', A.errors);
process.exit(0);

const {boot} = require('./harness');
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
    if (i < 18 && !(i === 13 || i === 14)) {
      const strange = [...txt.toLowerCase()].filter(c => c !== ' ' && !allowed.includes(c));
      if (strange.length) bad.push(`${layout}:${i} letters not learned: ${[...new Set(strange)].join('')}`);
    }
  }
}
console.log('problems:', bad.length ? [...new Set(bad)].slice(0, 12) : 'none');
ev("S.layout='intl'");
for (const i of [0, 3, 4, 6, 9, 13, 14, 17, 18, 19]) console.log(`L${i + 1}:`, ev(`lessonParts(${i})`).join(' | '));
ev("S.layout='abnt'"); console.log('L15 abnt:', ev('lessonParts(14)').join(' | '));

// stars and race threshold
console.log('stars L3 (acc only):', ev('[starsFor(5,90,2), starsFor(5,95,2), starsFor(5,98,2)]'), '| L16:', ev('[starsFor(10,98,15), starsFor(16,95,15), starsFor(22,97,15)]'), '| race L2 at 92%:', ev('starsFor(30,92,1)'), 'at 93%:', ev('starsFor(30,93,1)'));
// toast between parts
ev("S.layout='intl'");
ev('startRun("lesson",{lessonIdx:2})'); ev('closeIntro()');
A.type(ev('run.text').slice(0, ev('run.bounds[0]')));
console.log('toast after part 1:', A.vis('toast'), d.getElementById('toast').textContent);
// failed race shows the 93% message: miss 8 letters on a ~150-char text
A.playLesson(1, 0);
console.log('race L2 clean:', d.querySelector('#results h2').textContent.trim());
ev('startRun("lesson",{lessonIdx:1})');
let text = ev('run.text');
for (let i = 0; i < 12; i++) { A.type('\u0001'); A.type(text[ev('run.pos')]); A.type(text.slice(ev('run.pos'), ev('run.pos') + 4)); }
A.type(text.slice(ev('run.pos')));
console.log('race L2 with misses:', ev('metrics().acc') + '%', '|', d.querySelector('#results h2').textContent.trim());
console.log('ERRORS', A.errors);
process.exit(0);

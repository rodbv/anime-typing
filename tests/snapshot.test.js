// Renders the main screens from a fixed save, a frozen clock and a seeded random,
// and compares the HTML with snapshot.txt. Run with UPDATE=1 to rewrite the snapshot.
const {boot, seededRandom} = require('./harness');
const fs = require('fs');
const path = require('path');

const {now, data} = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/progress.json'), 'utf8'));
const SAVE = JSON.stringify(data);
const SNAP = path.join(__dirname, 'snapshot.txt');
const sections = [];
const errors = [];
const add = (name, html) => sections.push(`=== ${name} ===\n${html.replace(/>\s*</g, '>\n<').trim()}`);
const fresh = (storage, url, seed = 1) => { const A = boot(storage, url, {seed, now}); errors.push(A.errors); return A; };

// first visit: prologue and registration
const P = fresh(null);
for (let i = 0; i < 6; i++) { add(`prologue ${i + 1}`, P.d.getElementById('prologue').innerHTML); P.key('Enter'); }
add('setup', P.d.getElementById('setup').innerHTML);

// returning player
const R = fresh(SAVE);
R.ev('prologueAt = PROLOGUE.length; renderPrologue()');
add('prologue position', R.d.getElementById('prologue').innerHTML);
for (const v of ['home', 'lessons', 'collection', 'stats']) { R.ev(`showView("${v}")`); add(`view ${v}`, R.d.getElementById(`v-${v}`).innerHTML); }
R.ev('openShare()');
add('share modal', R.d.getElementById('share-box').innerHTML);

// every lesson's intro and text, each with its own seed
const L = fresh(SAVE);
const lessons = L.ev('LESSON_DEFS.length');
for (let i = 0; i < lessons; i++) {
  L.w.Math.random = seededRandom(100 + i);
  L.ev(`startRun("lesson",{lessonIdx:${i}, forceIntro:true})`);
  add(`lesson ${i + 1} intro`, L.d.getElementById('intro').innerHTML);
  add(`lesson ${i + 1} text`, L.ev('run.text'));
}
L.w.Math.random = seededRandom(200);
L.ev('startRun("free")'); add('free run text', L.ev('run.text'));
L.ev('startRun("quote")'); add('quote text', L.ev('run.text') + '\n' + L.ev('run.quote[1]'));

// shared card
const card = Buffer.from(JSON.stringify({n: 'Theo', d: '2026-10-11', mi: 18, r: 7, w: 14, a: 96, ms: 3, md: 1, it: ['larm', 'act1', 'slowdancer'], dist: 1215, st: 1, lc: 6, act: 1, col: 5, pts: 16})).toString('base64url');
const C = fresh(null, `http://localhost/?card=${card}`);
add('shared card', C.d.getElementById('share-view').innerHTML);

const out = sections.join('\n\n') + '\n';
const bad = errors.flat();
if (process.env.UPDATE) { fs.writeFileSync(SNAP, out); console.log(`snapshot written: ${sections.length} sections`); }
else {
  const want = fs.existsSync(SNAP) ? fs.readFileSync(SNAP, 'utf8') : '';
  if (want !== out) {
    const a = want.split('\n'), b = out.split('\n');
    const i = a.findIndex((line, k) => line !== b[k]);
    const head = [...b.slice(0, i + 1)].reverse().find(l => l.startsWith('=== ')) || '';
    console.log(`snapshot differs at line ${i + 1}, ${head}\n- ${a[i]}\n+ ${b[i]}`);
    process.exitCode = 1;
  } else console.log(`snapshot ok: ${sections.length} sections`);
}
console.log('ERRORS', bad);
process.exit(process.exitCode || 0);

const {boot} = require('./harness');
const A = boot();
const {d, ev} = A;
A.key('Escape'); A.key('Enter');
console.log('boot view:', ev('view'), '| title:', d.title, '| header ctl count:', d.querySelectorAll('header .ctl').length);
console.log('setup cards:', [...d.querySelectorAll('#setup h2')].map(h => h.textContent).join(' / '), '| number:', ev('data.profile.number'));
A.key('ç', 'Semicolon');
const inp = d.getElementById('reg-name');
inp.value = 'Theo'; inp.dispatchEvent(new A.w.Event('input'));
inp.dispatchEvent(new A.w.KeyboardEvent('keydown', {key: 'T', bubbles: true}));
console.log('typing in name does not trigger detection, layout:', ev('S.layout'));
inp.dispatchEvent(new A.w.KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
console.log('after Enter in name:', ev('view'), '| profile:', JSON.stringify(ev('data.profile')));
console.log('home:', d.querySelector('#home .hero .sub').textContent, '|', d.querySelector('#home h1').textContent, '|', d.querySelector('#home .hero p').textContent);
console.log('home map horse:', !!d.querySelector('#home svg.map'), '| tip:', d.querySelector('#home .card:last-child p').textContent.slice(0, 60));

// every lesson: intro with story, typable text
const bad = [];
for (const layout of ['intl', 'abnt', 'us']) {
  ev(`S.layout='${layout}'`);
  for (let i = 0; i < ev('LESSON_DEFS.length'); i++) {
    ev(`startRun("lesson",{lessonIdx:${i}, forceIntro:true})`);
    if (!ev('run.intro')) bad.push(`${layout}:${i} no intro`);
    const txt = ev('run.text');
    const u = ev(`[...run.text].filter(c=>!strokes(c,true)).join('')`);
    if (u) bad.push(`${layout}:${i} untypable ${u}`);
    if (layout === 'intl' && [0, 2, 13, 17, 20].includes(i)) console.log(`  L${i + 1}`, d.querySelector('#intro .stage-tag').textContent, '|', (d.querySelector('#intro .bubble')?.textContent || '').slice(0, 70), '|', txt.slice(0, 60));
  }
}
console.log('problems:', bad.length ? bad : 'none');
ev("S.layout='abnt'");
// lessons view
ev('showView("lessons")');
console.log('stage headers:', d.querySelectorAll('#lesson-grid .stage-h').length, '| cards:', d.querySelectorAll('#lesson-grid .lesson').length, '| race tags:', d.querySelectorAll('#lesson-grid .race-tag').length);
// progress moves the horse and km
A.playLesson(0); A.playLesson(1);
const unlockText = [...d.querySelectorAll('#results .unlock')].map(u => u.textContent.replace(/\s+/g, ' ').trim());
console.log('unlocks on results:', unlockText.join(' / '));
if (!unlockText.length || unlockText.some(x => x.includes('undefined'))) throw new Error('results unlock text is missing or undefined');
ev('showView("lessons")');
console.log('after stage 1:', d.querySelector('#lesson-grid .card p').textContent, '| ball unlocked:', !!ev('data.unlocked.ball'));
// free and quotes
ev('showView("free")'); A.key('Enter'); console.log('free text:', ev('run.text').slice(0, 70));
ev('goBack(); showView("quotes")'); A.key('Enter'); console.log('quote:', ev('run.text'), '|', d.getElementById('attrib').textContent);
ev('goBack(); showView("collection")'); console.log('collection groups:', [...d.querySelectorAll('#collection h2')].map(h => h.textContent).join(' / '), '| items:', d.querySelectorAll('#collection .item').length);
ev('showView("stats")'); console.log('stats ok:', !!d.querySelector('#heat-kb .key'));
console.log('ERRORS', A.errors);
process.exit(0);

// The share modal builds a link with the day's progress, and the link opens a diary card that trusts nothing in it.
const {boot} = require('./harness');
const check = (ok, msg) => { if (!ok) throw new Error(msg); };
const A = boot(); const {d, ev} = A;
A.ready(); ev('data.profile.name = "Theo <b>"; save()');
A.playLesson(0); A.playLesson(1); A.playLesson(2);
ev('showView("home")');
d.querySelector('#home [data-go=share]').click();
check(!d.getElementById('share').hidden && d.querySelector('#share .qr svg'), 'the share button should open the modal with a QR code');
const url = d.getElementById('share-box').dataset.url;
check(url.startsWith('http://localhost/?card='), 'the link should point to this page with a card, got ' + url.slice(0, 40));
const wa = decodeURIComponent(d.querySelector('#share a').href.split('text=')[1]);
console.log('wa link:', wa.slice(0, 160));
check(wa.includes('Theo <b>') && wa.includes('Etapa 2') && wa.includes(url), 'the WhatsApp text should carry the name, the stage and the link');
A.key('Escape');
check(d.getElementById('share').hidden && ev('view') === 'home', 'Esc should close the modal and stay on home');

// A phone opens the link: no saved data on that device.
const P = boot(null, url);
const card = P.d.getElementById('share-view');
console.log('card text:', card.textContent.replace(/\s+/g, ' ').trim().slice(0, 200));
check(P.ev('view') === 'card' && P.d.body.className.includes('cardmode'), 'the link should open the card page');
check(card.innerHTML.includes('Theo &lt;b&gt;'), 'the card should escape the name');
check(card.textContent.includes('3/21'), 'the card should show 3 of 21 lessons');
check(P.saved() === null, 'opening a card should not write progress on the phone');

const bad = boot(null, 'http://localhost/?card=%%%garbage');
check(bad.d.querySelector('#share-view h1').textContent === 'Link inválido', 'a broken link should show the invalid card');
const evil = boot(null, 'http://localhost/?card=' + Buffer.from(JSON.stringify({n: '<img src=x onerror=alert(1)>', st: 99, dist: -5, it: ['nope', 'ball'], w: 'x'})).toString('base64url'));
const evilView = evil.d.getElementById('share-view');
check(!evilView.innerHTML.includes('<img'), 'the card should escape markup in the name');
check(evilView.textContent.includes('Etapa final'), 'an out-of-range stage should clamp to the last stage');
check(evil.d.querySelectorAll('.share-items span').length === 1, 'unknown achievement ids should be dropped');

d.getElementById('tabs').querySelector('[data-view=stats]').click(); d.getElementById('btn-share').click();
check(!d.getElementById('share').hidden, 'the profile share button should open the modal');
console.log('ERRORS', A.errors, P.errors, bad.errors, evil.errors);
process.exit(0);

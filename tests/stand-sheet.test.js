// The rhythm grade, the result stats, the best streak and the profile sheet with its race table.
const {boot} = require('./harness');
const check = (ok, msg) => { if (!ok) throw new Error(msg); };
const text = el => el.textContent.replace(/\s+/g, ' ').trim();
const A = boot(); const {d, ev} = A; A.ready();

check(ev('rhythmGrade(Array(30).fill(300))') === 'A', 'steady gaps should get rhythm A');
check(ev('rhythmGrade(Array.from({length:30},(_, i)=>i%2?150:900))') === 'D', 'jumpy gaps should get rhythm D');
check(ev('rhythmGrade([300,300])') === '-', 'too few gaps should get no grade');

A.playLesson(0); A.playLesson(1); A.playLesson(2);
const stats = [...d.querySelectorAll('#results .stat span')].map(s => s.textContent);
check(stats.join() === 'PPM,Precisão,Tempo,erros,Ritmo', 'the result should show five stats, got ' + stats);
check(ev('data.bestStreak') >= ev('run.text.length'), 'a lesson without misses should set the best streak to at least its length');

ev('showView("stats")');
const sheet = text(d.querySelector('#stats .sheet div[style]'));
const rows = [...d.querySelectorAll('#stats .sheet tr')].map(text);
console.log('sheet:', sheet, '|', rows.join(' / '));
check(sheet === 'Tusk ACT1', 'three lessons should wake the first evolution level, got ' + sheet);
check(rows.length === 6, 'the sheet should list six attributes');
check(rows.some(r => r.startsWith('Alcance') && r.includes('14%')), 'range should be 3 of 21 lessons, 14%');
const raceRows = [...d.querySelectorAll('#stats .card:nth-child(2) tr')].slice(1, 3).map(text);
console.log('race rows:', raceRows.join(' / '));
check(raceRows[0].startsWith('Etapa 1Sandman') && /\dº/.test(raceRows[0]), 'the race table should list the stage 1 race with a place');
check(raceRows[1].endsWith('-'), 'a race not run yet should show no place');
console.log('ERRORS', A.errors);
process.exit(0);

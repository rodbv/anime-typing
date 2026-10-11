const {boot} = require('./harness');
const A = boot(null, 'http://localhost/', {themeEdit: th => {
  th.journey.stages[0].lessons = ['fj', 'nope'];
  th.journey.stages[2].rival = 'ghost';
}});
const text = A.d.body.textContent.replace(/\s+/g, ' ');
console.log('problems screen:', text.slice(0, 260));
for (const e of ['"nope" não existe', '"ghost" não existe', '"dk" não está em nenhuma etapa']) {
  if (!text.includes(e)) throw new Error('missing problem: ' + e);
}
if (!A.errors.some(e => e.includes('theme problems'))) throw new Error('expected a theme problems error');
console.log('ERRORS', []);
process.exit(0);

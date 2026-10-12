// A theme with structure errors shows the list of problems instead of the game.
const {boot} = require('./harness');
const check = (ok, msg) => { if (!ok) throw new Error(msg); };
function problems(themeEdit, lang) {
  const A = boot(null, 'http://localhost/', {themeEdit, lang});
  check(A.errors.some(e => e.includes('theme problems')), 'expected a theme problems error');
  return A.d.body.textContent.replace(/\s+/g, ' ');
}
const expect = (text, list) => list.forEach(e => check(text.includes(e), 'missing problem: ' + e));

// Stages: an unknown lesson, an unknown rival, and a lesson left out.
expect(problems(th => {
  th.journey.stages[0].lessons = ['fj', 'nope'];
  th.journey.stages[2].rival = 'ghost';
}), ['"nope" não existe', '"ghost" não existe', '"dk" não está em nenhuma etapa']);

// Content that later screens read: short quotes, evolution lessons, rival names and achievement conditions.
const text = problems(th => {
  th.quotes = [['Uma frase curta.', 'Autor'], ['Outra frase curta.', 'Autor']];
  th.evolution.levels[0].lesson = 'zz';
  delete th.rivals.sandman.nm;
  th.achievements[0].when = {type: 'stageCleared', stage: 42};
  th.achievements[1].when = {type: 'flying'};
  th.achievements[2].when = {type: 'lessonDone', lesson: 'qq'};
});
expect(text, ['pelo menos 3 frases', 'evolution: a lição "zz" não existe', 'rival "sandman": falta o nome',
  'a etapa 42 não existe', 'o tipo "flying" não existe', 'a lição "qq" não existe']);
// An English browser lists the problems in English.
expect(problems(th => { th.journey.stages[0].lessons = ['fj', 'nope']; }, 'en-US'),
  ['The theme has problems', 'stage 1: the lesson "nope" does not exist', 'the lesson "dk" is in no stage']);
console.log('ERRORS', []);
process.exit(0);

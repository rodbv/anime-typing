const {boot} = require('./harness');

// Draws the JoJo course (9 stages plus the start) with the given view and stage 1 cleared.
function draw(view) {
  const A = boot(null, 'http://localhost/', {themeEdit: th => {
    if (view) th.journey.view = view; else delete th.journey.view;
    th.journey.stages.forEach(st => delete st.pt);
  }});
  A.ready();
  A.ev('LESSON_DEFS.slice(0, 2).forEach(L => progress()[L.id] = {stars: 1, wpm: 20, acc: 95, last: 1}); showView("lessons"); renderLessons()');
  const svg = A.d.querySelector('#lesson-grid svg.map');
  const points = [...svg.querySelectorAll('circle')].map(c => [+c.getAttribute('cx'), +c.getAttribute('cy')]);
  const marker = svg.querySelector('g').getAttribute('transform');
  console.log(view || 'default', JSON.stringify(points), marker);
  if (A.errors.some(e => e.includes('theme problems'))) throw new Error(`${view || 'default'} view should not need pt: ${A.errors}`);
  if (points.length !== 10) throw new Error('expected 10 points, got ' + points.length);
  if (marker.includes('scale')) throw new Error('only the map marker is mirrored');
  if (!marker.startsWith(`translate(${points[1][0].toFixed(1)},`)) throw new Error('the marker should stand on stage 1');
  return {A, points, rows: [...new Set(points.map(p => p[1]))]};
}

// Without a view, the course is one straight row from left to right.
const line = draw();
if (line.rows.length !== 1) throw new Error('the default view should be one row, got ' + line.rows);
if (!line.points.every((p, i) => i === 0 || p[0] > line.points[i - 1][0])) throw new Error('the row should run left to right');

// The snake splits the course into three rows, and the middle row runs right to left.
const snake = draw('snake');
if (snake.rows.length !== 3) throw new Error('the snake should have 3 rows, got ' + snake.rows);
const p = snake.points;
if (!(p[4][0] > p[5][0] && p[5][0] > p[6][0])) throw new Error('the second row should run right to left');

// The map needs a position for every stage, and an unknown view is a theme problem.
const B = boot(null, 'http://localhost/', {themeEdit: th => { delete th.journey.stages[3].pt; }});
if (!B.errors.some(e => e.includes('theme problems'))) throw new Error('a map stage without pt should be a theme problem');
const C = boot(null, 'http://localhost/', {themeEdit: th => { th.journey.view = 'globe'; }});
const problems = [B, C].map(X => X.d.body.textContent).join(' ');
for (const e of ['etapa 4: falta a posição no mapa (pt)', 'journey.view "globe" não existe']) {
  if (!problems.includes(e)) throw new Error('missing problem: ' + e);
}
console.log('ERRORS', [line.A.errors, snake.A.errors].flat());
process.exit(0);

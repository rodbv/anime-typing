const {boot, ROOT} = require('./harness');
const fs = require('fs');
const path = require('path');

const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'themes.json'), 'utf8'));
// Each page shows every theme of themes.json in the header and marks its own theme.
for (const entry of catalog) {
  const A = boot(null, 'http://localhost/', {page: entry.page});
  const buttons = [...A.d.querySelectorAll('#theme-seg button')];
  const shown = buttons.map(b => `${b.textContent}${b.classList.contains('on') ? '*' : ''}->${b.dataset.page}`);
  console.log(entry.page, '|', shown.join(' '));
  if (A.d.getElementById('theme-ctl').hidden) throw new Error(`${entry.page}: the theme selector should show`);
  if (buttons.length !== catalog.length) throw new Error(`${entry.page}: expected ${catalog.length} themes`);
  const on = buttons.filter(b => b.classList.contains('on'));
  if (on.length !== 1 || on[0].dataset.page !== entry.page) throw new Error(`${entry.page}: its own theme should be the marked one`);
  if (A.errors.length) throw new Error(A.errors.join('; '));
}

// With a single theme there is nothing to switch to, so the selector stays hidden.
const B = boot(null, 'http://localhost/', {themeEdit: () => {}});
B.ev('window.THEMES = window.THEMES.slice(0, 1); applyTheme()');
if (!B.d.getElementById('theme-ctl').hidden) throw new Error('one theme should hide the selector');
console.log('ERRORS', []);
process.exit(0);

// Runs every *.test.js file. A test fails when it exits non-zero or prints an ERRORS line with page errors.
const {spawnSync} = require('child_process');
const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.test.js')).sort();
let failed = 0;
for (const f of files) {
  const r = spawnSync(process.execPath, [path.join(__dirname, f)], {encoding: 'utf8', timeout: 120000});
  const out = (r.stdout || '') + (r.stderr || '');
  const pageErrors = out.split('\n').filter(l => l.startsWith('ERRORS') && /[^\s[\]]/.test(l.slice(6)));
  const ok = r.status === 0 && !pageErrors.length;
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${f}`);
  if (!ok || process.env.VERBOSE) console.log(out.replace(/^/gm, '     '));
}
console.log(`${files.length - failed}/${files.length} passed`);
process.exit(failed ? 1 : 0);

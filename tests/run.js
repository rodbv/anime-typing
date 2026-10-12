// Runs every *.test.js file, a few at a time. A test fails when it exits non-zero or prints an ERRORS line with page errors.
const {spawn} = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.test.js')).sort();
const workers = Math.max(1, Math.min(files.length, Math.floor(os.cpus().length / 2)));

function runFile(f) {
  return new Promise(resolve => {
    const child = spawn(process.execPath, [path.join(__dirname, f)]);
    let out = '';
    child.stdout.on('data', b => { out += b; });
    child.stderr.on('data', b => { out += b; });
    const timer = setTimeout(() => { out += '\ntimed out after 300 s'; child.kill(); }, 300000);
    child.on('close', status => {
      clearTimeout(timer);
      const pageErrors = out.split('\n').filter(l => l.startsWith('ERRORS') && /[^\s[\]]/.test(l.slice(6)));
      resolve({f, out, ok: status === 0 && !pageErrors.length});
    });
  });
}

(async () => {
  const queue = [...files], results = [];
  await Promise.all(Array.from({length: workers}, async () => {
    while (queue.length) results.push(await runFile(queue.shift()));
  }));
  results.sort((a, b) => a.f.localeCompare(b.f));
  for (const r of results) {
    console.log(`${r.ok ? 'ok  ' : 'FAIL'} ${r.f}`);
    if (!r.ok || process.env.VERBOSE) console.log(r.out.replace(/^/gm, '     '));
  }
  const failed = results.filter(r => !r.ok).length;
  console.log(`${files.length - failed}/${files.length} passed`);
  process.exit(failed ? 1 : 0);
})();

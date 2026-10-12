// Unit tests for layouts.js, run in plain node without a page.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert/strict');

const code = fs.readFileSync(path.join(__dirname, '..', 'layouts.js'), 'utf8');
const {strokesOn, sanitizeFor} = vm.runInNewContext(code + '\n;({strokesOn, sanitizeFor})');
// Array.from copies the presses into this context's arrays, so deepEqual compares them with local literals.
const keys = (layout, ch, accents = true) => {
  const st = strokesOn(layout, ch, accents);
  return st ? Array.from(st, s => (s.altgr ? 'AltGr+' : '') + s.c) : null;
};

// A character on a key, with or without shift, is one press.
assert.deepEqual(keys('intl', 'a'), ['a']);
assert.deepEqual(keys('intl', 'A'), ['A']);
assert.deepEqual(keys('abnt', 'ç'), ['ç']);

// A dead key is followed by space to type the mark alone; US has no dead keys.
assert.deepEqual(keys('intl', "'"), ["'", ' ']);
assert.deepEqual(keys('abnt', '~'), ['~', ' ']);
assert.deepEqual(keys('us', "'"), ["'"]);

// An accented letter is the dead key and then the letter, only when accents are on.
assert.deepEqual(keys('intl', 'é'), ["'", 'e']);
assert.deepEqual(keys('intl', 'ã'), ['~', 'a']);
assert.deepEqual(keys('abnt', 'é'), ['´', 'e']);
assert.equal(keys('intl', 'é', false), null);
assert.equal(keys('us', 'é'), null);

// US International types ç with AltGr.
assert.deepEqual(keys('intl', 'ç'), ['AltGr+,']);
assert.equal(keys('intl', 'ç', false), null);

// Typographic marks become plain ones and spaces collapse.
assert.equal(sanitizeFor('intl', '“It’s” — ok…', false), '"It\'s" - ok...');
assert.equal(sanitizeFor('us', '  two\n  lines ', false), 'two lines');

// A letter the layout cannot type loses its accent, and a character with no key drops out.
assert.equal(sanitizeFor('us', 'Ação', true), 'Acao');
assert.equal(sanitizeFor('intl', 'Ação', true), 'Ação');
assert.equal(sanitizeFor('intl', 'Ação', false), 'Acao');
assert.equal(sanitizeFor('abnt', 'Ação', false), 'Açao');
assert.equal(sanitizeFor('intl', 'a€b', true), 'ab');

console.log('ERRORS', []);

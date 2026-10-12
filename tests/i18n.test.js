// Every interface text exists in each language with the same shape, so the English interface never falls back to Portuguese.
const assert = require('assert/strict');
const pt = require('../i18n/pt.json');
const en = require('../i18n/en.json');

const kind = v => Array.isArray(v) ? 'list' : typeof v;
const placeholders = v => JSON.stringify(v).match(/\{\w+\}/g)?.sort().join(' ') ?? '';
assert.deepEqual(Object.keys(en).filter(k => !(k in pt)), [], 'en.json keys that pt.json does not have');
assert.deepEqual(Object.keys(pt).filter(k => !(k in en)), [], 'pt.json keys missing from en.json');
for (const k of Object.keys(pt)) {
  assert.equal(kind(en[k]), kind(pt[k]), `${k}: en.json and pt.json differ in type`);
  assert.equal(placeholders(en[k]), placeholders(pt[k]), `${k}: en.json and pt.json differ in placeholders`);
}
console.log('ERRORS', []);

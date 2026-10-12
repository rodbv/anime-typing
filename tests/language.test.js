// The interface follows the first browser language the game has texts for, and Portuguese otherwise.
const {boot} = require('./harness');
const check = (ok, msg) => { if (!ok) throw new Error(msg); };
const shown = lang => {
  const A = boot(null, 'http://localhost/', {lang});
  return {html: A.d.documentElement.lang, next: A.d.querySelector('#prologue .btn.primary')?.textContent.trim(), errors: A.errors};
};
const pt = shown('pt-BR'), en = shown('en-US'), fr = shown('fr-FR'), frEn = shown(['fr-FR', 'en-GB']);
check(pt.html === 'pt-BR' && pt.next === 'Próximo (Enter)', 'a Brazilian browser should get Portuguese, got ' + JSON.stringify(pt));
check(en.html === 'en' && en.next === 'Next (Enter)', 'an English browser should get English, got ' + JSON.stringify(en));
check(fr.html === 'pt-BR' && fr.next === 'Próximo (Enter)', 'a browser in a language the game lacks should get Portuguese, got ' + JSON.stringify(fr));
check(frEn.html === 'en', 'the first browser language the game has should win, got ' + JSON.stringify(frEn));
console.log('ERRORS', [...pt.errors, ...en.errors, ...fr.errors, ...frEn.errors]);
process.exit(0);

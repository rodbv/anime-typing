// Keyboard layouts and the key presses each character needs. The engine and the node unit tests both load this file.
// keys: [base chars, shifted chars, finger per key]. Fingers: 0-3 left pinky..index, 4-7 right index..pinky, 8 thumb.
const LAYOUTS = {
  intl: {
    rows: [
      {keys: ["`1234567890-=", "~!@#$%^&*()_+", "0012334456777"], post: [["⌫", 2]]},
      {pre: [["Tab", 2]], keys: ["qwertyuiop[]\\", "QWERTYUIOP{}|", "0123344567777"]},
      {pre: [["Caps", 1.75]], keys: ["asdfghjkl;'", "ASDFGHJKL:\"", "01233445677"], post: [["Enter", 2.25]]},
      {pre: [["Shift", 2.25, "shiftL"]], keys: ["zxcvbnm,./", "ZXCVBNM<>?", "0123344567"], post: [["Shift", 2.75, "shiftR"]]}
    ],
    dead: "'\"`~^",
    marks: {"\u0301": "'", "\u0300": "`", "\u0303": "~", "\u0302": "^"},
    altgr: {"ç": ","}
  },
  abnt: {
    rows: [
      {keys: ["'1234567890-=", "\"!@#$%¨&*()_+", "0012334456777"], post: [["⌫", 2]]},
      {pre: [["Tab", 1.5]], keys: ["qwertyuiop´[", "QWERTYUIOP`{", "012334456777"], post: [["Enter", 1.5]]},
      {pre: [["Caps", 1.75]], keys: ["asdfghjklç~]", "ASDFGHJKLÇ^}", "012334456777"], post: [["", 1.25]]},
      {pre: [["Shift", 1.25, "shiftL"]], keys: ["\\zxcvbnm,.;/", "|ZXCVBNM<>:?", "001233445677"], post: [["Shift", 1.75, "shiftR"]]}
    ],
    dead: "´`~^¨",
    marks: {"\u0301": "´", "\u0300": "`", "\u0303": "~", "\u0302": "^"},
    altgr: {}
  }
};
LAYOUTS.us = {rows: LAYOUTS.intl.rows, dead: "", marks: {}, altgr: {}};
const ROW4 = {pre: [["Ctrl", 1.5], ["Alt", 1.5], ["", 9, "space"], ["AltGr", 1.5, "altgr"], ["Ctrl", 1.5]]};
const FCOL = [0, 1, 2, 3, 3, 2, 1, 0, 8];

const DIRECT = {};
for (const [name, L] of Object.entries(LAYOUTS)) {
  const s = new Set([" "]);
  for (const r of L.rows) { for (const c of r.keys[0]) s.add(c); for (const c of r.keys[1]) s.add(c); }
  for (const c of L.dead) s.delete(c);
  DIRECT[name] = s;
}

// Key presses needed to produce ch on the layout, or null if it cannot be typed.
function strokesOn(layout, ch, accents) {
  const L = LAYOUTS[layout], D = DIRECT[layout];
  if (D.has(ch)) return [{c: ch}];
  if (L.dead.includes(ch)) return [{c: ch}, {c: " "}];
  if (!accents) return null;
  if (L.altgr[ch]) return [{c: L.altgr[ch], altgr: true}];
  const n = ch.normalize("NFD");
  if (n.length === 2 && L.marks[n[1]] && D.has(n[0])) return [{c: L.marks[n[1]]}, {c: n[0]}];
  return null;
}

const REPL = {"\u2019": "'", "\u2018": "'", "\u201C": '"', "\u201D": '"', "\u2013": "-", "\u2014": "-", "\u2026": "..."};
// The text the layout can type: typographic marks become plain ones, and a letter it cannot type loses its accent or drops out.
function sanitizeFor(layout, str, accents) {
  let out = "";
  for (const raw of str.normalize("NFC")) {
    for (const c of (REPL[raw] ?? raw)) {
      if (strokesOn(layout, c, accents)) out += c;
      else {
        const b = c.normalize("NFD")[0];
        if (strokesOn(layout, b, false)) out += b;
      }
    }
  }
  return out.replace(/\s+/g, " ").trim();
}

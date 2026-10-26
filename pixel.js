/* Rustam's Habit Tracker: pixel art, hero, items and the 999 levels.
   One style everywhere: chunky 1-pixel dark outline, three-tone shading, saturated colour.
   Sprites are written as plain fills; the dark outline is added by code, so they are cheap to draw and easy to add.
   Nothing here is copied from any game: every sprite is drawn for this app. */
(function (root) {
'use strict';

/* ---------- colours ---------- */
const OUT = '#14102b';
const BASE = { Y: '#f3c13a', y: '#a8741a', N: '#9a6234', n: '#5e381c', W: '#ffffff', R: '#e0463f', r: '#8e2630', P: '#a56bff', p: '#6034b8', k: '#14102b', H: '#d6ecff', h: '#8fb8e8', C: '#6fe3ff' };
/* materials: light, mid, dark, gem */
const MATS = [
  { id: 'wood',     name: 'Wooden',   a: '#c58a4a', b: '#9a6234', c: '#5e381c', G: '#ffd24a', lvl: 1,   mult: 1 },
  { id: 'bronze',   name: 'Bronze',   a: '#f0b070', b: '#c0733a', c: '#7a3f1e', G: '#ff6a3d', lvl: 8,   mult: 2 },
  { id: 'iron',     name: 'Iron',     a: '#d5dcea', b: '#8d98b0', c: '#4f5870', G: '#6fe3ff', lvl: 25,  mult: 4 },
  { id: 'steel',    name: 'Steel',    a: '#eef6ff', b: '#a9c3e6', c: '#5d7fb0', G: '#4de1ff', lvl: 60,  mult: 8 },
  { id: 'gold',     name: 'Golden',   a: '#fff0a8', b: '#f3c13a', c: '#a8741a', G: '#ff4d6d', lvl: 120, mult: 16 },
  { id: 'emerald',  name: 'Emerald',  a: '#a6f7cb', b: '#2fc27a', c: '#146e47', G: '#ffffff', lvl: 220, mult: 32 },
  { id: 'sapphire', name: 'Sapphire', a: '#b3d0ff', b: '#4a86ff', c: '#1f3f9a', G: '#ffe14a', lvl: 350, mult: 64 },
  { id: 'mythril',  name: 'Mythril',  a: '#c4fff7', b: '#3fd9c9', c: '#17737c', G: '#ff6ad5', lvl: 520, mult: 128 },
  { id: 'dragon',   name: 'Dragon',   a: '#ffb27a', b: '#e8472f', c: '#7a1a22', G: '#ffe14a', lvl: 720, mult: 256 },
  { id: 'cosmic',   name: 'Cosmic',   a: '#ecd2ff', b: '#a05bff', c: '#4a1f9a', G: '#6fffe0', lvl: 900, mult: 512 }
];

/* ---------- sprites (fills only; '.' is empty) ---------- */
const SPR = {
  sword: { grip: [4, 12], rows: [
    '....a....', '...Wab...', '...Wab...', '...Wab...', '...Wab...', '...Wab...', '...Wab...', '...Wbb...', '...Wbc...', '...Wbc...',
    'YYYYGYYYY', '....N....', '....N....', '....n....', '...YYY...'] },
  staff: { grip: [2, 10], rows: [
    '.GGG.', 'GGWGG', 'GGGGG', '.GGG.', '..a..', '..b..', '..a..', '..b..', '..a..', '..N..', '..a..', '..b..', '..a..', '..b..', '..c..'] },
  shield: { grip: [6, 6], rows: [
    'YYYYYYYYYYYYY', 'YWaaaaaaabbbY', 'YWaaaaGaaabbY', 'YWaaaGGGaaabY', 'YWaaaaGaaabbY', 'YWaaaaaaaabbY', '.YWaaaaaabbY.',
    '.YaaaaaaabbY.', '..YaaaaabbY..', '...YaaabbY...', '....YabbY....', '.....YbcY....', '......YYY....'] },
  helm: { rows: [
    '...aaaaaa...', '..Waaaaaab..', '.Waaaaaaaabb', '.Waaaaaaaabb', 'WWccccccccbb', '.Waaaaaaabb.', '.Wab....abb.', '.bbb....bbb.'] },
  crown: { rows: [
    'Y.....Y.....Y', 'YY...YYY...YY', 'YYY.YYYYY.YYY', 'YYYYYYYYYYYYY', 'YYYYRYYGYYRYY', 'YYYYYYYYYYYYY', 'yyyyyyyyyyyyy'] },
  armour: { rows: [
    'bbb......bbb', 'Waaaaaaaaabb', 'WaaaaYYaaabb', 'WaaaaYYaaabb', 'Waaaaaaaaabb', 'NNNNNYYNNNNN', '.aaaaaaaabb.', '.abbbbbbbbc.', '..bbbbbbbc..'] },
  cloak: { rows: [
    '..bbbbbbbbbb..', '.baaaaaaaaaab.', 'baaaaaaaaaaaab', 'baaaaaaaaaaaab', 'baaaaaaaaaaaab', 'bbaaaaaaaaaabb', 'cbaaaaaaaaaabc',
    'cbaaaaaaaaaabc', 'ccbaaaaaaaabcc', 'ccbbaaaaaabbcc', 'cccbbbbbbbbccc', 'cc.cc.cc.cc.cc'] },
  boot: { rows: ['..aaaa.', '..aabb.', '..abbb.', '..abbb.', '.aabbbb', 'aabbbbb', 'ccccccc'] },
  amulet: { rows: ['Y.....Y', '.Y...Y.', '..Y.Y..', '..Y.Y..', '...Y...', '..aaa..', '.aGGGb.', '.aGWGb.', '.aGGGb.', '..bbb..'] },
  eye: { rows: [
    '.....rrrrrr.....', '...rrRRRRRRrr...', '..rRRRRRRRRRRr..', '.rRRRkkkkkkRRRr.', '.rRRkWWWWWWkRRr.', 'rRRRkWPPPPWkRRRr', 'rRRRkWPkkPWkRRRr', 'rRRRkWPkkPWkRRRr',
    'rRRRkWPPPPWkRRRr', '.rRRkWWWWWWkRRr.', '.rRRRkkkkkkRRRr.', '..rRRRRRRRRRRr..', '...rrRRRRRRrr...', '....rrrrrrrr....'] }
};

const colourOf = (ch, m) => {
  if (ch === 'a') return m.a; if (ch === 'b') return m.b; if (ch === 'c') return m.c; if (ch === 'G') return m.G;
  return BASE[ch] || null;
};
/* turn fill rows into a map with a dark outline; returns { w, h, cells: [[x, y, colour]] } */
function build(rows, mat, mirror) {
  const m = mat || MATS[2], w = Math.max.apply(null, rows.map(r => r.length)), h = rows.length, grid = {};
  rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const c = colourOf(r[x], m); if (c) grid[(mirror ? w - 1 - x : x) + ',' + y] = c; } });
  const cells = [];
  for (let y = -1; y <= h; y++) for (let x = -1; x <= w; x++) {
    const k = x + ',' + y;
    if (grid[k]) { cells.push([x + 1, y + 1, grid[k]]); continue; }
    let near = false; for (let dy = -1; dy <= 1 && !near; dy++) for (let dx = -1; dx <= 1; dx++) if (grid[(x + dx) + ',' + (y + dy)]) { near = true; break; }
    if (near) cells.push([x + 1, y + 1, OUT]);
  }
  return { w: w + 2, h: h + 2, cells };
}
/* merge horizontal runs of one colour into one rectangle (fewer elements, still crisp) */
function rects(cells) {
  const rows = {}; cells.forEach(([x, y, c]) => { (rows[y] = rows[y] || []).push([x, c]); });
  let out = '';
  Object.keys(rows).forEach(y => {
    const r = rows[y].sort((a, b) => a[0] - b[0]); let i = 0;
    while (i < r.length) { let j = i; while (j + 1 < r.length && r[j + 1][0] === r[j][0] + 1 && r[j + 1][1] === r[i][1]) j++; out += `<rect x="${r[i][0]}" y="${y}" width="${j - i + 1}" height="1" fill="${r[i][1]}"/>`; i = j + 1; }
  });
  return out;
}
function spriteSVG(name, matIdx, px, cls) {
  const s = SPR[name], b = build(s.rows, MATS[matIdx || 0]), d = Math.max(b.w, b.h), ox = Math.floor((d - b.w) / 2), oy = Math.floor((d - b.h) / 2);
  return `<svg class="px ${cls || ''}" viewBox="0 0 ${d} ${d}" ${px ? `width="${px}" height="${px}"` : ''} aria-hidden="true">${rects(b.cells.map(([x, y, c]) => [x + ox, y + oy, c]))}</svg>`;
}

/* ---------- levels: 999 of them. Rank follows the total ever earned and never goes down ---------- */
const MAXLV = 999;
const need = n => n <= 1 ? 0 : 100 * Math.round(0.7 * Math.pow(n - 1, 1.5));          // cash earned to reach level n (a multiple of 100)
function levelOf(earned) { let lo = 1, hi = MAXLV; while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (need(mid) <= earned) lo = mid; else hi = mid - 1; } return lo; }
const TIERS = [
  { name: 'Newborn', from: 1, tunic: null, glow: '#ffd1dc' }, { name: 'Toddler', from: 5, tunic: null, glow: '#ffe29a' }, { name: 'Child', from: 12, tunic: '#4a86dc', glow: '#6fe3ff' },
  { name: 'Page', from: 25, tunic: '#3fb27f', glow: '#7dffb0' }, { name: 'Squire', from: 50, tunic: '#e0a03a', glow: '#ffd24a' }, { name: 'Young Prince', from: 100, tunic: '#a56bff', glow: '#c9a0ff' },
  { name: 'Trained Prince', from: 180, tunic: '#2fa3a3', glow: '#6fffe0' }, { name: 'Knight', from: 300, tunic: '#e0463f', glow: '#ff8f86' }, { name: 'Champion', from: 450, tunic: '#ff7a2f', glow: '#ffb27a' },
  { name: 'Warlord', from: 650, tunic: '#7a3cff', glow: '#b58cff' }, { name: 'Emperor', from: 850, tunic: '#f3c13a', glow: '#fff0a8' }, { name: 'Legend', from: 999, tunic: '#ffffff', glow: '#ffffff' }
];
function tierOf(level) { let t = 0; TIERS.forEach((x, i) => { if (level >= x.from) t = i; }); return t; }

/* ---------- items: 9 shapes x up to 10 materials, each with a slot, price and level ---------- */
const SHAPES = [
  { id: 'sword',  name: 'Sword',  slot: 'weapon', base: 200, from: 0 }, { id: 'staff',  name: 'Staff',  slot: 'weapon', base: 300, from: 0 },
  { id: 'shield', name: 'Shield', slot: 'shield', base: 200, from: 0 }, { id: 'helm',   name: 'Helm',   slot: 'head',   base: 300, from: 1 },
  { id: 'crown',  name: 'Crown',  slot: 'head',   base: 500, from: 3 }, { id: 'armour', name: 'Armour', slot: 'body',   base: 400, from: 1 },
  { id: 'cloak',  name: 'Cloak',  slot: 'back',   base: 300, from: 0 }, { id: 'boot',   name: 'Boots',  slot: 'feet',   base: 100, from: 0 },
  { id: 'amulet', name: 'Amulet', slot: 'neck',   base: 500, from: 2 }
];
const SLOTS = [['weapon', 'Weapon'], ['shield', 'Shield'], ['head', 'Head'], ['body', 'Body'], ['back', 'Cloak'], ['feet', 'Feet'], ['neck', 'Neck']];
const ITEMS = [], BYID = {};
SHAPES.forEach(sh => MATS.forEach((m, mi) => { if (mi < sh.from) return;
  const it = { id: sh.id + '.' + mi, shape: sh.id, mat: mi, slot: sh.slot, name: m.name + ' ' + sh.name, price: sh.base * m.mult, lvl: m.lvl, rare: mi >= 7 ? 'epic' : mi >= 4 ? 'rare' : '' };
  ITEMS.push(it); BYID[it.id] = it; }));
const itemsFor = slot => ITEMS.filter(i => i.slot === slot).sort((a, b) => a.price - b.price);

/* ---------- the hero: a thick-pixel stick figure with a dark outline, grown by rank, wearing what he owns ---------- */
const BODY = [
  { hd: 7, torso: 3, leg: 4, arm: 3, gear: false }, { hd: 9, torso: 6, leg: 8, arm: 5, gear: false },
  { hd: 11, torso: 13, leg: 15, arm: 11, gear: true }
];
const HEADW = { 7: [3, 5, 7, 7, 7, 5, 3], 9: [5, 7, 9, 9, 9, 9, 9, 7, 5].slice(0, 9), 11: [5, 7, 9, 11, 11, 11, 11, 11, 9, 7, 5] };
function heroSVG(level, eq, opt) {
  opt = opt || {}; const ti = tierOf(level), T = TIERS[ti], B = BODY[Math.min(2, ti < 1 ? 0 : ti < 2 ? 1 : 2)];
  const W = 48, H = 64, g = {}, put = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < W && y < H) g[x + ',' + y] = c; };
  const thick = (x0, y0, x1, y1, c, t) => { let dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, e = dx - dy;
    for (;;) { for (let i = 0; i < t; i++) put(x0 + i, y0, c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 > -dy) { e -= dy; x0 += sx; } if (e2 < dx) { e += dx; y0 += sy; } } };
  const cx = 24, gnd = 60, hip = gnd - B.leg, neck = hip - B.torso, ht = neck - B.hd;
  const body = {}; const bp = (x, y, c) => { body[Math.round(x) + ',' + Math.round(y)] = c; };
  // limbs and torso (collected as one shape so the outline wraps the whole figure)
  const th = (x0, y0, x1, y1, c, t) => { let dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, e = dx - dy;
    for (;;) { for (let i = 0; i < t; i++) bp(x0 + i, y0, c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 > -dy) { e -= dy; x0 += sx; } if (e2 < dx) { e += dx; y0 += sy; } } };
  const t = ti < 1 ? 1 : 2, leg = Math.round(B.leg * 0.4), arm = B.arm, sh = neck + (B.gear ? 2 : 1);
  th(cx - 1, neck, cx - 1, hip, '#d6ecff', t);
  th(cx - 1, sh, cx - 1 - arm, sh + Math.round(arm * 0.9), '#d6ecff', t); th(cx, sh, cx + arm, sh + Math.round(arm * 0.9), '#d6ecff', t);
  th(cx - 1, hip, cx - 1 - leg, gnd, '#d6ecff', t); th(cx, hip, cx + leg, gnd, '#d6ecff', t);
  const hw = HEADW[B.hd];
  hw.forEach((w, i) => { for (let x = 0; x < w; x++) bp(cx - Math.floor(w / 2) + x, ht + i, '#d6ecff'); });
  const eyeY = ht + Math.round(B.hd * 0.45);
  bp(cx - Math.round(B.hd / 4) - 1, eyeY, '#14102b'); bp(cx + Math.round(B.hd / 4), eyeY, '#14102b'); bp(cx - Math.round(B.hd / 4) - 1, eyeY + 1, '#14102b'); bp(cx + Math.round(B.hd / 4), eyeY + 1, '#14102b');
  if (ti === 0) { bp(cx - 3, eyeY + 2, '#ff9aa8'); bp(cx + 2, eyeY + 2, '#ff9aa8'); }
  else bp(cx - 1, eyeY + 3, '#14102b'), bp(cx, eyeY + 3, '#14102b');
  if (T.tunic) { for (let y = neck + 1; y < hip - 1; y++) for (let x = cx - 2; x <= cx + 1; x++) if (body[x + ',' + y]) bp(x, y, y === hip - 3 ? '#9a6234' : T.tunic); }
  // compose: cloak, outlined body, then gear in front
  const parts = [];
  const add = (name, mat, x, y, mirror) => { const s = SPR[name], b = build(s.rows, MATS[mat], mirror); parts.push({ b, x, y, s }); };
  const own = eq || {}; const mi = k => own[k] ? BYID[own[k]] : null;
  const hand = (side) => side < 0 ? [cx - 1 - arm, sh + Math.round(arm * 0.9)] : [cx + arm + 1, sh + Math.round(arm * 0.9)];
  let behind = null; const m = {};
  if (B.gear) {
    ['weapon', 'shield', 'head', 'body', 'back', 'feet', 'neck'].forEach(k => { m[k] = mi(k); });
    if (m.back) add('cloak', m.back.mat, cx - 7, neck - 1);
  }
  // body with outline
  const bcells = []; Object.keys(body).forEach(k => { const [x, y] = k.split(',').map(Number); bcells.push([x, y, body[k]]); });
  const bset = body; const out = [];
  bcells.forEach(([x, y]) => { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const k = (x + dx) + ',' + (y + dy); if (!bset[k] && !g[k]) g[k] = OUT; } });
  Object.keys(body).forEach(k => { g[k] = body[k]; });
  if (B.gear) {
    const [lx, ly] = hand(-1), [rx, ry] = hand(1);
    if (m.feet) { add('boot', m.feet.mat, cx - 1 - leg - 5, gnd - 7); add('boot', m.feet.mat, cx + leg - 1, gnd - 7, true); }
    if (m.body) add('armour', m.body.mat, cx - 7, neck + 1);
    if (m.neck) add('amulet', m.neck.mat, cx - 4, neck + 2);
    if (m.head) { if (m.head.shape === 'helm') add('helm', m.head.mat, cx - 7, ht - 2); else add('crown', m.head.mat, cx - 7, ht - 5); }
    if (m.weapon) { const s = SPR[m.weapon.shape]; add(m.weapon.shape, m.weapon.mat, rx - s.grip[0] - 1, ry - s.grip[1] - 1); }
    if (m.shield) { const s = SPR.shield; add('shield', m.shield.mat, lx - s.grip[0] - 3, ly - s.grip[1] - 1); }
  }
  const lay = [];
  parts.forEach(p => { if (p.s === SPR.cloak) lay.unshift(p); else lay.push(p); });
  let svgIn = '';
  const base = Object.keys(g).map(k => { const [x, y] = k.split(',').map(Number); return [x, y, g[k]]; });
  const cloak = lay.filter(p => p.s === SPR.cloak), rest = lay.filter(p => p.s !== SPR.cloak);
  cloak.forEach(p => { svgIn += rects(p.b.cells.map(([x, y, c]) => [x + p.x, y + p.y, c])); });
  svgIn += rects(base);
  rest.forEach(p => { svgIn += rects(p.b.cells.map(([x, y, c]) => [x + p.x, y + p.y, c])); });
  return `<svg class="px hero ${opt.cls || ''}" viewBox="0 0 ${W} ${H}" style="--glow:${T.glow}" aria-label="${esc(T.name)}, level ${level}">${svgIn}</svg>`;
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- the Nemesis: a pixel eye creature ---------- */
function nemesisSVG(cls) { const b = build(SPR.eye.rows, MATS[0]); return `<svg class="px ${cls || ''}" viewBox="0 0 ${b.w} ${b.h}" aria-hidden="true">${rects(b.cells)}</svg>`; }

/* ---------- static game background: neon night over a castle city (drawn once, never animated) ---------- */
function gameBg() {
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const W = 390, H = 844, HZ = 590; let s = '';
  s += `<defs><linearGradient id="gk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05021a"/><stop offset=".42" stop-color="#1b0b4d"/><stop offset=".72" stop-color="#5a1170"/><stop offset=".9" stop-color="#c3277f"/><stop offset="1" stop-color="#ff7a3d"/></linearGradient>
    <linearGradient id="gf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a0b4a"/><stop offset="1" stop-color="#07031a"/></linearGradient>
    <radialGradient id="gp" cx=".35" cy=".3"><stop offset="0" stop-color="#9ff3ff"/><stop offset=".55" stop-color="#4a5cff"/><stop offset="1" stop-color="#1a0b4d"/></radialGradient>
    <radialGradient id="gh" cx=".5" cy=".5"><stop offset="0" stop-color="#ff9a5a" stop-opacity=".85"/><stop offset="1" stop-color="#ff3d9a" stop-opacity="0"/></radialGradient></defs>`;
  s += `<rect width="${W}" height="${HZ}" fill="url(#gk)"/><rect y="${HZ}" width="${W}" height="${H - HZ}" fill="url(#gf)"/>`;
  for (let i = 0; i < 80; i++) { const x = rnd() * W, y = rnd() * (HZ - 120), r = 0.4 + rnd() * 1.1; s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="${rnd() > .7 ? '#8be3ff' : '#ffffff'}" opacity="${(0.35 + rnd() * 0.6).toFixed(2)}"/>`; }
  s += `<circle cx="300" cy="150" r="58" fill="url(#gp)"/><ellipse cx="300" cy="150" rx="96" ry="18" fill="none" stroke="#6fe3ff" stroke-width="2.4" opacity=".75" transform="rotate(-18 300 150)"/>
    <circle cx="70" cy="95" r="16" fill="#ffd1f0" opacity=".85"/><circle cx="64" cy="90" r="16" fill="#1b0b4d" opacity=".55"/>`;
  s += `<ellipse cx="195" cy="${HZ}" rx="260" ry="70" fill="url(#gh)"/>`;
  // far skyline: sci-fi spires
  let d = `M0 ${HZ}`; [[10, 40], [34, 78], [52, 46], [80, 100], [104, 52], [128, 88], [150, 40], [250, 60], [274, 104], [298, 50], [322, 92], [346, 56], [370, 82]].forEach(([x, h]) => { d += ` L${x} ${HZ} L${x} ${HZ - h} L${x + 6} ${HZ - h - 14} L${x + 12} ${HZ - h} L${x + 12} ${HZ}`; }); d += ` L${W} ${HZ} Z`;
  s += `<path d="${d}" fill="#14072f" stroke="#7a5cff" stroke-width="1" opacity=".9"/>`;
  // the castle: towers with battlements, flags and lit windows
  const tower = (x, w, h, spire) => { let t = `<rect x="${x}" y="${HZ - h}" width="${w}" height="${h}" fill="#0b0420" stroke="#4de1ff" stroke-width="1"/>`;
    for (let k = 0; k < Math.floor(w / 8); k++) t += `<rect x="${x + 1 + k * 8}" y="${HZ - h - 6}" width="5" height="6" fill="#0b0420" stroke="#4de1ff" stroke-width=".8"/>`;
    if (spire) t += `<path d="M${x - 2} ${HZ - h - 6} L${x + w / 2} ${HZ - h - 46} L${x + w + 2} ${HZ - h - 6} Z" fill="#0b0420" stroke="#ff4de1" stroke-width="1.2"/><path d="M${x + w / 2} ${HZ - h - 46} v-16" stroke="#ff4de1" stroke-width="1.2"/><path d="M${x + w / 2} ${HZ - h - 62} l14 5 l-14 5z" fill="#ff4de1"/>`;
    for (let k = 0; k < Math.floor(h / 22); k++) t += `<rect x="${x + w / 2 - 2}" y="${HZ - h + 10 + k * 22}" width="4" height="8" rx="1" fill="${(k + x) % 3 ? '#ffd24a' : '#6fe3ff'}"/>`; return t; };
  s += tower(150, 18, 120, true) + tower(172, 46, 90, false) + tower(222, 18, 140, true) + tower(244, 14, 100, false) + tower(130, 14, 80, false) + tower(112, 18, 100, true) + tower(274, 18, 108, true);
  s += `<rect x="130" y="${HZ - 40}" width="144" height="40" fill="#0b0420" stroke="#4de1ff" stroke-width="1"/><path d="M180 ${HZ} v-26 a15 15 0 0 1 30 0 v26z" fill="#ff8a3d" opacity=".9"/>`;
  // neon floor grid in perspective
  for (let i = -12; i <= 12; i++) s += `<line x1="195" y1="${HZ}" x2="${195 + i * 70}" y2="${H}" stroke="${i % 2 ? '#ff4de1' : '#4de1ff'}" stroke-width="1" opacity=".42"/>`;
  for (let k = 1; k <= 9; k++) { const y = HZ + Math.pow(k / 9, 2) * (H - HZ); s += `<line x1="0" y1="${y.toFixed(1)}" x2="${W}" y2="${y.toFixed(1)}" stroke="#ff4de1" stroke-width="1" opacity="${(0.18 + k * 0.05).toFixed(2)}"/>`; }
  s += `<rect y="${HZ - 1}" width="${W}" height="2" fill="#ff4de1" opacity=".8"/>`;
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${s}</svg>`;
}

root.HPix = { MATS, SPR, ITEMS, BYID, SHAPES, SLOTS, TIERS, MAXLV, need, levelOf, tierOf, itemsFor, spriteSVG, heroSVG, nemesisSVG, gameBg };
})(window);

/* Rustam's Habit Tracker v1.2: game art, all drawn in code (no image files).
   Pixel items and the pixel stick hero use one style: dark outline, lighter top edge, darker bottom edge.
   The Nemesis creature and the moonlit world are smooth vectors. */
(function (root) {
'use strict';
const PAL = { K: '#1b1a3a', Y: '#ffd45a', y: '#c9822a', W: '#ffffff', S: '#c9d6ee', s: '#7d93bd', R: '#ff5d5d', r: '#a8283f', B: '#4e8cff', b: '#2a3fa8',
  G: '#3de0a0', g: '#1d9a74', P: '#b58aff', p: '#6b3fc4', O: '#ff9a3c', N: '#c27b3c', n: '#6e3a1c', C: '#42f0ff', H: '#e8f6ff', k: '#2a2a55' };
const SP = {
  crown: ['Y...Y...Y', 'YY.YYY.YY', 'YYYYYYYYY', 'YRYYBYYRY', 'YYYYYYYYY', 'yyyyyyyyy'],
  helm: ['..KKKKK..', '.KSSSSSK.', 'KSSWSSSsK', 'KSSSSSSsK', 'KSKKKKKsK', 'KSKSSSKsK', 'KSKSSSKsK', 'KSS...SsK', '.KK...KK.'],
  sword: ['..W..', '..W..', '.SWs.', '.SWs.', '.SWs.', '.SWs.', '.SWs.', 'YYYYY', '..N..', '..N..', '..Y..'],
  shield: ['BBBBBBBBB', 'BBBBWBBBB', 'BBBBWBBBB', 'WWWWWWWWW', 'BBBBWBBBB', '.BBBWBBB.', '.bBBWBBb.', '..bBWBb..', '...bbb...'],
  armour: ['SS......SS', 'SSSSSSSSSS', '.SSSSSSSS.', '.SSWSSWSS.', '.SSSSSSSS.', '.SSSYYSSs.', '.ssSSSSss.', '.sssssss..', '..ssssss..'],
  boots: ['..NN..NN..', '..NN..NN..', '..NN..NN..', '.NNN..NNN.', '.NNNN.NNNN', 'nnnnn.nnnn'],
  cloak: ['..RRRRRR..', '.RRRRRRRR.', 'RRRRYYRRRR', 'RRRRRRRRRR', 'RRrRRRRrRR', 'RRrRRRRrRR', 'RrrRRRRrrR', 'RrrRRRRrrR', 'rrrRRRRrrr', 'rr.rrrr.rr'],
  potion: ['..SSSS..', '...WW...', '..SWWS..', '.SRRRRS.', 'SRRWRRRS', 'SRRRRRrS', 'SRRRRrrS', '.SrrrrS.', '..SSSS..'],
  heart: ['.RR...RR.', 'RRRR.RRRR', 'RWRRRRRRR', 'RRRRRRRRR', '.RRRRRRR.', '..RRRRR..', '...RRR...', '....R....'],
  amulet: ['.N...N.', '..N.N..', '..N.N..', '...N...', '..YYY..', '.YCCCY.', '.YCWCY.', '.YCCCY.', '..YYY..'],
  staff: ['.PPP.', 'PPWPP', '.PPP.', '..N..', '..N..', '..N..', '..N..', '..N..', '..N..', '..n..'],
  weights: ['..SS...SS..', 'SSSS...SSSS', 'SSSSNNNSSSS', 'SSSS...SSSS', '..SS...SS..'],
  star: ['....Y....', '...YWY...', 'YYYYWYYYY', '.YYWWWYY.', '..YWWWY..', '.YYY.YYY.', '.Y.....Y.']
};

/* Items. slot: head, rhand, lhand, body, cloak, feet, neck, aura (drawn on the hero) or perk (a power, not drawn).
   Prices are multiples of 100. "level" is the hero level needed to buy it. */
const CATALOG = [
  { id: 'potion', name: 'Calm Potion', slot: 'perk', sp: 'potion', price: 1200, level: 3, rar: '', perk: 'Urge Rescue pays 100 extra.' },
  { id: 'boots', name: 'Leather Boots', slot: 'feet', sp: 'boots', price: 800, level: 2, rar: '' },
  { id: 'shield', name: 'Blue Shield', slot: 'lhand', sp: 'shield', price: 1600, level: 5, rar: '' },
  { id: 'sword', name: 'Iron Sword', slot: 'rhand', sp: 'sword', price: 2000, level: 6, rar: 'rare' },
  { id: 'cloak', name: 'Royal Cloak', slot: 'cloak', sp: 'cloak', price: 2400, level: 8, rar: 'rare' },
  { id: 'crown', name: 'Gold Crown', slot: 'head', sp: 'crown', price: 3000, level: 10, rar: 'epic' },
  { id: 'weights', name: 'Strong Body', slot: 'perk', sp: 'weights', price: 3600, level: 12, rar: '', perk: 'Ducked pays 100 more in hard times.' },
  { id: 'helm', name: 'Steel Helm', slot: 'head', sp: 'helm', price: 2600, level: 14, rar: 'rare' },
  { id: 'armour', name: 'Chest Armour', slot: 'body', sp: 'armour', price: 4800, level: 20, rar: 'rare' },
  { id: 'heart', name: 'Heart Vigour', slot: 'perk', sp: 'heart', price: 8000, level: 25, rar: 'epic', perk: 'Every Yielded costs 100 less (never below 100).' },
  { id: 'amulet', name: 'Focus Amulet', slot: 'neck', sp: 'amulet', price: 6000, level: 30, rar: 'epic' },
  { id: 'staff', name: 'Mind Staff', slot: 'rhand', sp: 'staff', price: 5600, level: 40, rar: 'rare' },
  { id: 'star', name: 'Star Halo', slot: 'aura', sp: 'star', price: 12000, level: 60, rar: 'epic' }
];
const SLOTS = { head: 'Head', rhand: 'Right hand', lhand: 'Left hand', body: 'Body', cloak: 'Cloak', feet: 'Feet', neck: 'Neck', aura: 'Halo', perk: 'Perk' };

/* ---- pixel helpers ---- */
const hexRGB = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const toHex = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mix = (h, t, a) => toHex(hexRGB(h).map((v, i) => v + (t[i] - v) * a));
function stylize(cells) {
  const out = {}, has = (x, y) => cells[x + ',' + y] !== undefined;
  Object.keys(cells).forEach(k => {
    const p = k.split(',').map(Number), x = p[0], y = p[1]; let col = cells[k];
    if (col !== PAL.K) { if (!has(x, y - 1) || !has(x - 1, y)) col = mix(col, [255, 255, 255], 0.35); else if (!has(x, y + 1) || !has(x + 1, y)) col = mix(col, [10, 5, 40], 0.32); }
    out[k] = col;
  });
  Object.keys(cells).forEach(k => {
    const p = k.split(',').map(Number);
    [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]].forEach(d => { const kk = (p[0] + d[0]) + ',' + (p[1] + d[1]); if (out[kk] === undefined) out[kk] = PAL.K; });
  });
  return out;
}
/* Scale2x (EPX): doubles the pixel density and rounds off the stair-steps, so art looks finer without being blurred. */
function scale2(cells) {
  const ks = Object.keys(cells).map(k => k.split(',').map(Number)); if (!ks.length) return cells;
  const x0 = Math.min.apply(null, ks.map(a => a[0])) - 1, x1 = Math.max.apply(null, ks.map(a => a[0])) + 1, y0 = Math.min.apply(null, ks.map(a => a[1])) - 1, y1 = Math.max.apply(null, ks.map(a => a[1])) + 1, out = {};
  const at = (x, y) => cells[x + ',' + y] || null, put = (x, y, c) => { if (c) out[x + ',' + y] = c; };
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const P = at(x, y), A = at(x, y - 1), B = at(x + 1, y), C = at(x - 1, y), D = at(x, y + 1), X = x * 2, Y = y * 2;
    put(X, Y, C === A && C !== D && A !== B ? A : P); put(X + 1, Y, A === B && A !== C && B !== D ? B : P);
    put(X, Y + 1, D === C && D !== B && C !== A ? C : P); put(X + 1, Y + 1, B === D && B !== A && D !== C ? D : P);
  }
  return out;
}
const DENS = 2;   // how many times the pixel density is doubled (2 = four times finer than v1.2)
const up = c => { for (let i = 0; i < DENS; i++) c = scale2(c); return c; };
function rowsToCells(rows, ox, oy) { const c = {}; rows.forEach((r, j) => Array.from(r).forEach((ch, i) => { if (PAL[ch]) c[(i + (ox || 0)) + ',' + (j + (oy || 0))] = PAL[ch]; })); return c; }
function svgOf(cells, cls, extra) {
  const ks = Object.keys(cells).map(k => k.split(',').map(Number));
  const x0 = Math.min.apply(null, ks.map(a => a[0])), y0 = Math.min.apply(null, ks.map(a => a[1])), x1 = Math.max.apply(null, ks.map(a => a[0])) + 1, y1 = Math.max.apply(null, ks.map(a => a[1])) + 1;
  const w = x1 - x0, h = y1 - y0, d = Math.max(w, h), ox = x0 - Math.floor((d - w) / 2), oy = y0 - Math.floor((d - h) / 2);
  return `<svg class="px ${cls || ''}" viewBox="${ox} ${oy} ${d} ${d}" ${extra || ''} aria-hidden="true">${Object.keys(cells).map(k => { const p = k.split(','); return `<rect x="${p[0]}" y="${p[1]}" width="1.02" height="1.02" fill="${cells[k]}"/>`; }).join('')}</svg>`;
}
const cache = {};
function sprite(name, size) {
  const key = name + '|' + (size || 0);
  return cache[key] || (cache[key] = svgOf(stylize(up(rowsToCells(SP[name]))), '', size ? `width="${size}" height="${size}"` : ''));
}

/* ---- the pixel stick hero. look: 0 newborn, 1 child, 2 young, 3 grown, 4 tall. eq: { slot: itemId } ---- */
function bodyLook(level) { return level < 4 ? 0 : level < 16 ? 1 : level < 41 ? 2 : level < 261 ? 3 : 4; }
function hero(level, eq, size) {
  eq = eq || {};
  const g = {}, set = (x, y, c) => { if (x >= 0 && y >= 0 && x < 36 && y < 44) g[x + ',' + y] = c; };
  const line = (x0, y0, x1, y1, c) => { const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx - dy; for (;;) { set(x0, y0, c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 > -dy) { e -= dy; x0 += sx; } if (e2 < dx) { e += dx; y0 += sy; } } };
  const put = (name, x, y) => SP[name].forEach((r, j) => Array.from(r).forEach((ch, i) => { if (PAL[ch]) set(x + i, y + j, PAL[ch]); }));
  const item = slot => { const it = CATALOG.find(c => c.id === eq[slot]); return it ? it.sp : null; };
  const P = [{ L: 3, arm: 3, leg: 3 }, { L: 6, arm: 5, leg: 6 }, { L: 9, arm: 7, leg: 9 }, { L: 11, arm: 8, leg: 11 }, { L: 12, arm: 9, leg: 12 }][bodyLook(level)];
  const cx = 18, gnd = 41, hip = gnd - P.leg, neck = hip - P.L, ht = neck - 6, H = '#e8f6ff';
  if (item('aura')) put(item('aura'), cx - 4, ht - 9);
  if (item('cloak')) put(item('cloak'), cx - 5, neck - 1);
  line(cx, neck, cx, hip, H); const ay = neck + 2, ah = ay + Math.round(P.arm * 0.8);
  line(cx, ay, cx - P.arm, ah, H); line(cx, ay, cx + P.arm, ah, H);
  line(cx, hip, cx - Math.round(P.leg * 0.55), gnd, H); line(cx, hip, cx + Math.round(P.leg * 0.55), gnd, H);
  [[1, 0], [2, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [1, 4], [2, 4], [3, 4]].forEach(p => set(cx - 2 + p[0], ht + p[1], H));
  set(cx - 1, ht + 2, '#10213f'); set(cx + 1, ht + 2, '#10213f');
  if (item('body')) put(item('body'), cx - 5, neck);
  if (item('feet')) put(item('feet'), cx - 5, gnd - 5);
  if (item('neck')) put(item('neck'), cx - 3, neck - 3);
  if (item('head')) put(item('head'), cx - 4, item('head') === 'helm' ? ht - 3 : ht - 4);
  if (item('rhand')) { const s = item('rhand'); put(s, cx + P.arm - 1, ah - (SP[s].length - 2)); }
  if (item('lhand')) put(item('lhand'), cx - P.arm - 6, ah - 4);
  return svgOf(stylize(up(g)), 'hero', size ? `width="${size}" height="${size}"` : '');
}

/* ---- the Nemesis: a smooth creature. state 0 raging, 1 weakened, 2 defeated ---- */
let nid = 0;
function nemesis(state) {
  const i = 'n' + (nid++), s = state || 0, sc = s === 0 ? 1 : s === 1 ? 0.84 : 0.7;
  const eyes = s === 2
    ? '<path d="M62 84l18 18M80 84L62 102M120 84l18 18M138 84l-18 18" stroke="#2a0f2a" stroke-width="6" stroke-linecap="round"/>'
    : `<path d="M58 88q22-18 42 4q-6 16-24 16q-16 0-18-20z" fill="url(#${i}e)"/><path d="M142 88q-22-18-42 4q6 16 24 16q16 0 18-20z" fill="url(#${i}e)"/><ellipse cx="78" cy="96" rx="3.4" ry="9" fill="#2a0f2a"/><ellipse cx="122" cy="96" rx="3.4" ry="9" fill="#2a0f2a"/>${s === 1 ? '<path d="M60 74q18-8 36 4M104 78q18-12 36-4" stroke="#8a2240" stroke-width="5" fill="none" stroke-linecap="round"/>' : '<path d="M56 78l44 12M144 78l-44 12" stroke="#5e1230" stroke-width="7" stroke-linecap="round"/>'}`;
  const mouth = s === 2
    ? '<path d="M78 138q22 10 44 0" stroke="#2a0f2a" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M112 140q6 16 14 10" fill="#ff7a9a"/>'
    : s === 1 ? '<path d="M76 140q24-8 48 0" stroke="#2a0f2a" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M146 66q6 10 0 14q-6-4 0-14z" fill="#8be3ff"/>'
    : '<path d="M66 134q34 26 68 0q-10 6-34 6t-34-6z" fill="#2a0f2a"/><path d="M76 138l6 12 6-10M92 141l6 14 6-14M110 141l6 12 6-12" fill="#fff"/>';
  const body = s === 2 ? ['#c9b8c9', '#8d7490', '#4c3a58'] : ['#ff9a6a', '#e0463f', '#7a1d3a'];
  return `<svg class="nem" viewBox="0 0 200 200" aria-hidden="true"><defs><radialGradient id="${i}b" cx=".36" cy=".3" r=".85"><stop offset="0" stop-color="${body[0]}"/><stop offset=".55" stop-color="${body[1]}"/><stop offset="1" stop-color="${body[2]}"/></radialGradient><radialGradient id="${i}h" cx=".5" cy=".5" r=".5"><stop offset=".55" stop-color="${s === 2 ? '#a58bff' : '#ff4a7a'}" stop-opacity=".5"/><stop offset="1" stop-color="${s === 2 ? '#a58bff' : '#ff4a7a'}" stop-opacity="0"/></radialGradient><linearGradient id="${i}e" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6a8"/><stop offset="1" stop-color="#ffb32a"/></linearGradient></defs>
  <g transform="translate(100 108) scale(${sc}) translate(-100 -108)${s === 2 ? ' rotate(-8 100 120)' : ''}"><circle cx="100" cy="106" r="96" fill="url(#${i}h)"/>
  <path d="M52 62Q30 34 46 12q8 22 34 36z" fill="#ffd45a" stroke="#7a1d3a" stroke-width="3" stroke-linejoin="round"/><path d="M148 62Q170 34 154 12q-8 22-34 36z" fill="#ffd45a" stroke="#7a1d3a" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="100" cy="112" r="72" fill="url(#${i}b)" stroke="#4a1030" stroke-width="4"/><ellipse cx="76" cy="70" rx="24" ry="12" fill="#fff" opacity=".22" transform="rotate(-24 76 70)"/><g class="ey">${eyes}</g>${mouth}</g></svg>`;
}

/* ---- the world behind The Nemesis: moonlit citadel, drawn once, never animated ---- */
function scene() {
  let stars = '', seed = 11; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 90; i++) { const big = rnd() > 0.9; stars += `<rect x="${(rnd() * 390).toFixed(0)}" y="${(rnd() * 420).toFixed(0)}" width="${big ? 2.4 : 1.4}" height="${big ? 2.4 : 1.4}" fill="${rnd() > 0.6 ? '#bfe9ff' : '#ffffff'}" opacity="${(0.35 + rnd() * 0.65).toFixed(2)}"/>`; }
  let floor = ''; for (let i = -9; i <= 9; i++) floor += `<line x1="${195 + i * 14}" y1="560" x2="${195 + i * 74}" y2="860" stroke="#3fd8ff" stroke-width="1" opacity=".28"/>`;
  for (let j = 0; j < 9; j++) { const y = 560 + Math.pow(j, 1.75) * 8; floor += `<line x1="0" y1="${y.toFixed(0)}" x2="390" y2="${y.toFixed(0)}" stroke="#3fd8ff" stroke-width="1" opacity=".22"/>`; }
  const win = (x, y) => `<rect x="${x}" y="${y}" width="6" height="10" rx="1" fill="#ffd98a"/>`;
  return `<svg class="scene-svg" viewBox="0 0 390 860" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>
  <linearGradient id="wsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#040714"/><stop offset=".5" stop-color="#0b1a3c"/><stop offset="1" stop-color="#16406a"/></linearGradient>
  <radialGradient id="wmoon" cx=".4" cy=".35"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#d6ecff"/><stop offset="1" stop-color="#9cc6f0"/></radialGradient>
  <radialGradient id="whalo" cx=".5" cy=".5" r=".5"><stop offset=".4" stop-color="#7fd0ff" stop-opacity=".45"/><stop offset="1" stop-color="#7fd0ff" stop-opacity="0"/></radialGradient>
  <linearGradient id="waur" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3ff0c0" stop-opacity="0"/><stop offset=".5" stop-color="#5ad7ff" stop-opacity=".28"/><stop offset="1" stop-color="#9a7bff" stop-opacity="0"/></linearGradient></defs>
  <rect width="390" height="860" fill="url(#wsky)"/>${stars}
  <path d="M-10 190Q120 120 250 200T420 150V230Q300 280 160 230T-10 260z" fill="url(#waur)"/><path d="M-10 260Q140 200 260 270T420 230V290Q300 340 160 300T-10 330z" fill="url(#waur)" opacity=".7"/>
  <circle cx="290" cy="150" r="120" fill="url(#whalo)"/><circle cx="290" cy="150" r="54" fill="url(#wmoon)"/><circle cx="274" cy="138" r="9" fill="#b9d6f2" opacity=".6"/><circle cx="304" cy="166" r="6" fill="#b9d6f2" opacity=".55"/>
  <path d="M0 470l40-60 36 30 54-80 46 62 40-36 60 84 44-54 70 70v200H0z" fill="#0c1b3d"/><path d="M0 520l50-46 40 24 60-62 50 66 56-40 52 60 82-50v250H0z" fill="#081330"/>
  <g stroke="#030818" stroke-width="2" fill="#0a1536"><rect x="118" y="470" width="154" height="92"/><rect x="100" y="430" width="36" height="132"/><rect x="254" y="430" width="36" height="132"/><rect x="168" y="400" width="54" height="162"/><rect x="62" y="500" width="40" height="62"/><rect x="288" y="500" width="40" height="62"/>
  <path d="M100 430l18-34 18 34zM254 430l18-34 18 34zM168 400l27-50 27 50z" fill="#06102a"/></g>
  <path d="M195 350v-22l26 8-26 8" fill="#3fd8ff"/><path d="M118 396v-16l18 6-18 6" fill="#9a7bff"/><path d="M272 396v-16l18 6-18 6" fill="#9a7bff"/>
  ${win(190, 420)}${win(190, 450)}${win(112, 450)}${win(272, 450)}${win(144, 500)}${win(240, 500)}${win(76, 520)}${win(302, 520)}
  <rect y="560" width="390" height="300" fill="#071126"/><ellipse cx="195" cy="650" rx="190" ry="48" fill="none" stroke="#3fd8ff" stroke-width="1.4" opacity=".35"/><ellipse cx="195" cy="650" rx="130" ry="30" fill="none" stroke="#9a7bff" stroke-width="1.2" opacity=".35" stroke-dasharray="4 8"/>${floor}
  <rect y="556" width="390" height="3" fill="#3fd8ff" opacity=".55"/><rect width="390" height="860" fill="#040714" opacity=".12"/></svg>`;
}

const coin = sz => `<svg class="coin" width="${sz}" height="${sz}" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="#ffcf40" stroke="#8a5208" stroke-width="1.5"/><circle cx="10" cy="10" r="6.4" fill="none" stroke="#fff0a8" stroke-width="1.2"/><path d="M10 6l3.4 4L10 14 6.6 10z" fill="#c98a12" stroke="#8a5208" stroke-width=".8" stroke-linejoin="round"/><path d="M4.6 7.4A6.2 6.2 0 0 1 8 4.2" stroke="#fff" stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".8"/></svg>`;
root.HTGame = { coin, PAL, SP, CATALOG, SLOTS, sprite, hero, nemesis, scene, bodyLook };
})(window);

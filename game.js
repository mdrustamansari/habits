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
const OUTFITS = [   // [number on the art sheet, name, level, price, rarity]
  [12, 'Forest Archer', 2, 1200, ''], [25, 'Pine Shadow', 3, 1600, ''], [1, 'Azure Guard', 4, 2000, ''], [21, 'Cloud Walker', 5, 2400, ''], [15, 'Copper Captain', 6, 3000, ''], [19, 'Teal Marshal', 8, 3600, ''],
  [9, 'Sky Knight', 10, 4400, ''], [8, 'Sapphire Duke', 12, 5200, ''], [2, 'Crimson Regent', 14, 6000, 'rare'], [7, 'Ember Prince', 16, 7200, 'rare'], [20, 'Garnet Lord', 18, 8400, 'rare'], [16, 'Amethyst Heir', 20, 9600, 'rare'],
  [10, 'Violet Regent', 24, 11000, 'rare'], [24, 'Rose Prince', 28, 12000, 'rare'], [14, 'Crystal Mage', 32, 14000, 'rare'], [17, 'Royal Duelist', 36, 16000, 'rare'], [4, 'Night Warden', 42, 20000, 'epic'],
  [3, 'Ivory Heir', 48, 24000, 'epic'], [11, 'Pearl Crown', 55, 28000, 'epic'], [6, 'Frost Monarch', 62, 34000, 'epic'], [13, 'Winter King', 72, 40000, 'epic'], [18, 'Ash Sovereign', 84, 48000, 'epic'], [22, 'Starry Night', 100, 60000, 'epic']
];
/* ---- the royal outfit: ten parts, bought one by one with coins. Each is a transparent layer in art/doll/ ---- */
const PARTS = [   // [id, name, layers, level, price, crop box on the 440x700 canvas, blurb]
  ['coat', 'Royal Coat', ['jacket', 'gloves'], 2, 1500, [101, 260, 339, 490], 'White and gold coat with gloves'],
  ['trousers', 'Royal Trousers', ['trousers'], 2, 1200, [139, 408, 309, 598], 'Cream trousers with gold piping'],
  ['boots', 'Royal Boots', ['boots'], 3, 1400, [137, 524, 287, 686], 'Tall leather boots'],
  ['belt', 'Gold Buckle Belt', ['belt'], 4, 1600, [125, 402, 315, 446], 'A belt with a gold buckle'],
  ['collar', 'Standing Collar', ['collar'], 5, 1800, [163, 250, 277, 326], 'A high collar with gold trim'],
  ['knee', 'Knee Guards', ['knee'], 7, 2400, [145, 536, 277, 602], 'Gold and leather knee guards'],
  ['straps', 'Cross Straps', ['straps', 'brooch'], 9, 3200, [163, 284, 277, 420], 'Gold straps and a brooch'],
  ['paul', 'Golden Pauldrons', ['paul'], 12, 4400, [109, 268, 331, 352], 'Carved shoulder guards'],
  ['sword', 'Sword and Scabbard', ['sword', 'scabbard'], 16, 6000, [230, 140, 350, 620], 'A blade for the brave'],
  ['cloak', 'Royal Cloak', ['cloak'], 20, 8000, [23, 258, 417, 530], 'A cloak that crowns the set']
].map(p => ({ id: p[0], name: p[1], slot: 'part', layers: p[2], level: p[3], price: p[4], crop: p[5], rar: p[3] >= 16 ? 'rare' : '', perk: p[6] }));
const DOLL = ['cloak', 'sword', 'legs', 'shorts', 'trousers', 'boots', 'knee', 'arms', 'shirt', 'jacket', 'gloves', 'belt', 'straps', 'brooch', 'scabbard', 'collar', 'paul', 'head'];
const DOLL_OF = {}; PARTS.forEach(p => p.layers.forEach(l => { DOLL_OF[l] = p.id; }));
function dollLayers(worn) {   // which layers to draw for the parts being worn
  const w = new Set(worn || []), hide = new Set();
  if (w.has('coat')) { hide.add('shirt'); hide.add('arms'); } if (w.has('trousers')) hide.add('shorts'); if (w.has('boots')) hide.add('legs');
  return DOLL.filter(l => !hide.has(l) && (!DOLL_OF[l] || w.has(DOLL_OF[l])));
}
const layerImg = l => `<img src="art/doll/${l}.webp" alt="" draggable="false">`;
const doll = worn => `<span class="doll">${dollLayers(worn).map(layerImg).join('')}</span>`;
const partThumb = (it, sz) => { const c = it.crop, w = c[2] - c[0], h = c[3] - c[1], s = Math.min(sz / w, sz / h); return `<span class="pthumb" style="width:${sz}px;height:${sz}px"><span style="position:absolute;width:${(440 * s).toFixed(1)}px;height:${(700 * s).toFixed(1)}px;left:${((sz - w * s) / 2 - c[0] * s).toFixed(1)}px;top:${((sz - h * s) / 2 - c[1] * s).toFixed(1)}px">${it.layers.map(layerImg).join('')}</span></span>`; };
const setDone = (own, worn) => PARTS.every(p => own.indexOf(p.id) >= 0 && (worn || []).indexOf(p.id) >= 0);
const CATALOG = [
  { id: 'potion', name: 'Calm Potion', slot: 'perk', sp: 'potion', price: 1200, level: 3, rar: '', perk: 'Urge Rescue pays 100 extra.' },
  { id: 'weights', name: 'Strong Body', slot: 'perk', sp: 'weights', price: 3600, level: 12, rar: '', perk: 'Ducked pays 100 more in hard times.' },
  { id: 'heart', name: 'Heart Vigour', slot: 'perk', sp: 'heart', price: 8000, level: 25, rar: 'epic', perk: 'Every Yielded costs 100 less (never below 100).' },
].concat(PARTS).concat(OUTFITS.map(o => ({ id: 'p' + String(o[0]).padStart(2, '0'), name: o[1], slot: 'skin', art: o[0], price: o[3], level: o[2], rar: o[4] })));
const SLOTS = { skin: 'Outfit', part: 'Royal part', head: 'Head', rhand: 'Right hand', lhand: 'Left hand', body: 'Body', cloak: 'Cloak', feet: 'Feet', neck: 'Neck', aura: 'Halo', perk: 'Perk' };

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
function cellsToImg(cells, size) {   // one small PNG per sprite, drawn once: far lighter than thousands of SVG rectangles
  try {
    const ks = Object.keys(cells).map(k => k.split(',').map(Number)); if (!ks.length) return '';
    const x0 = Math.min.apply(null, ks.map(a => a[0])), y0 = Math.min.apply(null, ks.map(a => a[1])), x1 = Math.max.apply(null, ks.map(a => a[0])) + 1, y1 = Math.max.apply(null, ks.map(a => a[1])) + 1;
    const w = x1 - x0, h = y1 - y0, d = Math.max(w, h), c = document.createElement('canvas'); c.width = c.height = d; const g = c.getContext('2d'); if (!g) return '';
    const ox = Math.floor((d - w) / 2), oy = Math.floor((d - h) / 2);
    Object.keys(cells).forEach(k => { const p = k.split(',').map(Number); g.fillStyle = cells[k]; g.fillRect(p[0] - x0 + ox, p[1] - y0 + oy, 1, 1); });
    return `<img class="px" src="${c.toDataURL('image/png')}" ${size ? `width="${size}" height="${size}"` : ''} alt="" draggable="false">`;
  } catch (e) { return ''; }
}
function sprite(name, size) {
  const key = name + '|' + (size || 0);
  return cache[key] || (cache[key] = (() => { const c = stylize(up(rowsToCells(SP[name]))); return cellsToImg(c, size) || svgOf(c, '', size ? `width="${size}" height="${size}"` : ''); })());
}

/* ---- the pixel stick hero. look: 0 newborn, 1 child, 2 young, 3 grown, 4 tall. eq: { slot: itemId } ---- */
function bodyLook(level) { return level < 4 ? 0 : level < 16 ? 1 : level < 41 ? 2 : level < 261 ? 3 : 4; }
function heroOld(level, eq, size) {
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

/* ---- the prince: painted pixel art, one image per outfit (art/prince-NN.webp) ---- */
const artOf = id => { const it = CATALOG.find(c => c.id === id); return it ? it.art : 23; };
const prince = id => `<img class="pr" src="art/prince-${String(artOf(id)).padStart(2, '0')}.webp" alt="" draggable="false">`;
function hero(level, eq) { return eq && eq.skin ? prince(eq.skin) : doll(eq && eq.parts); }
const look = (eq, sz) => `<span class="bust" style="width:${sz}px;height:${sz}px">${hero(0, eq)}</span>`;
const thumb = (it, sz) => it.layers ? partThumb(it, sz) : it.art ? `<span class="bust" style="width:${sz}px;height:${sz}px">${prince(it.id)}</span>` : sprite(it.sp, sz);

/* ---- the Nemesis: the green one-eyed monster, a sprite atlas (art/mon-green.webp, 5 x 4 cells) ----
   frames: 0 normal 1 calm 2 angry 3 sneering 4 astonished 5 happy 6 sad 7-10 idle 11-13 hurt 14 dizzy 15-17 down 18 ghost */
const MON = { normal: 0, calm: 1, angry: 2, sneer: 3, shock: 4, happy: 5, sad: 6, dizzy: 14 };
const TIERF = [1, 0, 2, 3], EYE = { 0: 132, 1: 148, 2: 146, 3: 140, 6: 142 };
function nemesis(state, full, o) {
  o = o || {}; const t = o.tier == null ? 1 : o.tier; let f;
  if (o.sleep) f = MON.calm;
  else if (o.fx === 'y') f = MON.happy;
  else if (state === 2) f = o.hub ? MON.normal : MON.dizzy;
  else if (state === 1) f = MON.sad;
  else f = TIERF[t];
  const cls = 'nem mon' +  (o.fx === 'd' ? ' hurt' : (!o.hub && !o.sleep && state === 0 && t === 1 && !o.fx ? ' idle' : ''));
  return `<span class="${cls}" style="--c:${f % 5};--r:${Math.floor(f / 5)};--ey:${EYE[f] || 138}" aria-hidden="true"><i></i></span>`;
}

/* ---- the centre tab: a gold hexagon with a green rune gem ---- */
const gem = () => `<svg class="gem" viewBox="0 0 96 96" aria-hidden="true"><defs><linearGradient id="gmg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0a8"/><stop offset=".5" stop-color="#e2a836"/><stop offset="1" stop-color="#8a5a14"/></linearGradient><radialGradient id="gmc" cx=".4" cy=".3" r=".9"><stop offset="0" stop-color="#e9ff9a"/><stop offset=".45" stop-color="#7fd62a"/><stop offset="1" stop-color="#1f5a14"/></radialGradient><radialGradient id="gmd" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#1d2a22"/><stop offset="1" stop-color="#060a08"/></radialGradient></defs><polygon points="48,3 90,26 90,70 48,93 6,70 6,26" fill="url(#gmg)" stroke="#3a2306" stroke-width="2.5" stroke-linejoin="round"/><polygon points="48,10 84,30 84,66 48,86 12,66 12,30" fill="url(#gmd)" stroke="#6a4310" stroke-width="2"/><polygon points="48,20 74,35 74,61 48,76 22,61 22,35" fill="none" stroke="#7fd62a" stroke-width="1.5" opacity=".6"/><polygon points="48,28 66,48 48,68 30,48" fill="url(#gmc)" stroke="#173d0e" stroke-width="2.2" stroke-linejoin="round"/><polygon points="48,28 66,48 48,48" fill="#fff" opacity=".35"/><polygon points="48,48 66,48 48,68" fill="#000" opacity=".22"/></svg>`;

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
root.HTGame = { coin, PAL, SP, CATALOG, SLOTS, sprite, hero, prince, thumb, look, doll, PARTS, setDone, nemesis, gem, scene, bodyLook };
})(window);

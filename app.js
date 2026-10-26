/* Rustam's Habit Tracker v1.2: private, offline, on this phone only.
   Look: shared style files (style.css, flagship.css, buttons.css, btnlook.js). Words follow DESIGN-LANGUAGE.md section 10. */
(function () {
'use strict';
const KEY = 'ht_v1', VERSION = '1.3';
const G = window.HTGame;
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- state ---------- */
function defaults() {
  return { v: 2, name: '', follow: true, look: 'flagship', accent: 'sapphire', flFont: 'system', glow: false, pin: null, salt: Math.random().toString(36).slice(2), lockAfter: 15,
    base: 200, goal: 2000, target: 120, learn: true, logs: [], ul: [], ideas: [], done: false, sound: true, vib: true, lastBackup: 0, btnAccent: 9, btnBlack: 0,
    ucats: [{ id: 'vid', n: 'Videos', w: 1 }, { id: 'web', n: 'Browsing', w: 1 }, { id: 'pic', n: 'Pictures', w: 2 }, { id: 'soc', n: 'Social media', w: 1 }, { id: 'oth', n: 'Other', w: 1 }],
    gear: { own: [], eq: {} }, buys: [], dismiss: {} };
}
function migrate(o) {
  if (!o.v || o.v < 2) {   // 1.0 and 1.1 kept small points; 1.2 keeps Nemesis Cash in hundreds
    const yv = Math.max(1, Math.min(3, o.yv || 1)); o.base = 200 * yv; o.goal = 2000;
    (o.logs || []).forEach(l => { if (l.p === undefined) { l.p = l.k === 'd' ? 2 * o.base : -o.base; l.tier = 1; } });
    (o.ul || []).forEach(u => { if (!u.c) u.c = 'oth'; }); delete o.yv; o.v = 2;
  }
  if (o.sound === undefined) o.sound = true; if (o.vib === undefined) o.vib = true;
  const d = defaults(); ['ucats', 'gear', 'buys', 'dismiss'].forEach(k => { if (!o[k]) o[k] = d[k]; }); if (!o.gear.own) o.gear = d.gear;
  return o;
}
let S = load();
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return migrate(Object.assign(defaults(), JSON.parse(raw)));
    const old = localStorage.getItem('rht.v1');   // version 1.0 data
    if (old) { const o = JSON.parse(old), d = defaults(); ['name', 'yv', 'goal', 'target', 'logs', 'ul', 'ideas', 'pin', 'salt', 'lockAfter', 'sound', 'vib'].forEach(k => { if (o[k] !== undefined) d[k] = o[k]; }); d.done = !!o.done; d.v = 1; return migrate(d); }
  } catch (e) {}
  return defaults();
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

/* ---------- icons (Lucide style) ---------- */
const IC = {
  trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="3"/><path d="M8 11V7a4 4 0 018 0v4"/>',
  wind: '<path d="M3 8h11a3 3 0 10-3-3M3 12h16a3 3 0 11-3 3M3 16h8"/>',
  flame: '<path d="M12 3c1 4 5 5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z"/>',
  phone: '<rect x="7" y="2" width="10" height="20" rx="3"/><path d="M11 18h2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 00-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0012 3z"/>',
  palette: '<path d="M12 3a9 9 0 100 18c1.5 0 2-1 1.5-2s0-2 1.5-2h2a3 3 0 003-3c0-6-4-11-8-11z"/><circle cx="8" cy="11" r="1"/><circle cx="12" cy="7" r="1"/><circle cx="16" cy="10" r="1"/>',
  speaker: '<path d="M11 5L6 9H3v6h3l5 4zM15 9a4 4 0 010 6M18 6a8 8 0 010 12"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  disk: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
  left: '<path d="M15 5l-7 7 7 7"/>', right: '<path d="M9 5l7 7-7 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>'
};
const svg = (n, extra) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra || ''}>${IC[n]}</svg>`;
const siTile = (n, c) => `<span class="si-tile" style="--c:${c}">${svg(n, 'stroke="#fff"')}</span>`;

/* ---------- dates and words ---------- */
const pad = n => n < 10 ? '0' + n : '' + n;
const dk = t => { const d = new Date(t); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
const todayK = () => dk(Date.now());
const fromKey = k => { const p = k.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); };
const addDays = (k, n) => { const d = fromKey(k); d.setDate(d.getDate() + n); return dk(d); };
const weekStart = k => { const d = fromKey(k); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return dk(d); };
function clock(t) { const d = new Date(t); let h = d.getHours(); const a = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12; return h + ':' + pad(d.getMinutes()) + ' ' + a; }
function when(t) {
  const k = dk(t), T = todayK(), DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  if (k === T) return 'today at ' + clock(t);
  if (k === addDays(T, -1)) return 'yesterday at ' + clock(t);
  if (k > addDays(T, -7)) return 'on ' + DAYS[new Date(t).getDay()] + ' at ' + clock(t);
  return 'on ' + new Date(t).getDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][new Date(t).getMonth()] + ' at ' + clock(t);
}
const hr12 = h => (h % 12 || 12) + (h >= 12 ? ' pm' : ' am');

/* ---------- Nemesis Cash, levels and learning ---------- */
const fmt = n => (n < 0 ? '−' : '') + Math.abs(Math.round(n)).toLocaleString('en-US');
const kfmt = n => Math.abs(n) >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'k' : String(n);
const r100 = v => Math.max(100, Math.round(v / 100) * 100);
const has = id => S.gear.own.indexOf(id) >= 0;
const TIER = ['Easy', 'Normal', 'Hard', 'Very hard'], TIERW = ['Calm hour', 'Steady hour', 'Hard hour', 'Danger hour'];
function tierValues(t) { const B = S.base; return [{ d: r100(B), y: r100(B * 1.5) }, { d: r100(B * 2), y: r100(B) }, { d: r100(B * 3), y: r100(B / 2) }, { d: r100(B * 4), y: r100(B / 2) }][t]; }
function valuesNow(t) { const v = tierValues(t), o = { d: v.d, y: v.y }; if (has('weights') && t >= 2) o.d += 100; if (has('heart')) o.y = Math.max(100, o.y - 100); return o; }
const PRIOR = h => (h >= 22 || h < 4) ? 0.7 : h < 8 ? 0.5 : h < 16 ? 0.15 : h < 18 ? 0.3 : 0.5;
function riskAt(t) {
  const d = new Date(t), h = d.getHours(), wd = d.getDay(); let y = 0, n = 0, wy = 0, wn = 0;
  if (S.learn) S.logs.forEach(l => { const x = new Date(l.t), dh = Math.min((x.getHours() - h + 24) % 24, (h - x.getHours() + 24) % 24); if (dh <= 1) { n++; if (l.k === 'y') y++; } if (x.getDay() === wd) { wn++; if (l.k === 'y') wy++; } });
  const rh = (y + 3 * PRIOR(h)) / (n + 3), rw = (wy + 3 * 0.3) / (wn + 3);
  return { r: 0.75 * rh + 0.25 * rw, learned: n + wn >= 12 };
}
const tierOf = r => r < 0.2 ? 0 : r < 0.4 ? 1 : r < 0.59 ? 2 : 3;
const tierNow = t => { const x = riskAt(t || Date.now()); return { tier: tierOf(x.r), r: x.r, learned: x.learned }; };
const needAt = L => L <= 1 ? 0 : Math.round(550 * Math.pow(L - 1, 1.2) / 100) * 100;
function levelOf(e) { let L = Math.min(999, Math.floor(Math.pow(e / 550, 1 / 1.2)) + 1); while (L < 999 && needAt(L + 1) <= e) L++; while (L > 1 && needAt(L) > e) L--; return L; }
const RANKS = [[1, 'Newborn'], [4, 'Child'], [16, 'Young Prince'], [41, 'Trained Prince'], [81, 'Squire Knight'], [151, 'Knight'], [261, 'Champion'], [401, 'Warlord'], [601, 'Emperor'], [851, 'Immortal Legend']];
const rankName = l => RANKS.filter(r => r[0] <= l).pop()[1];
const nextRank = l => { const r = RANKS.find(x => x[0] > l); return r ? r[1] : null; };
const ucw = id => { const c = S.ucats.find(x => x.id === id) || S.ucats.find(x => x.id === 'oth'); return c ? c.w : 1; };
function build() {
  const I = {}, g = k => I[k] || (I[k] = { d: 0, y: 0, m: 0, e: 0, c: 0, hasUl: false });
  S.logs.forEach(l => { const o = g(dk(l.t)); if (l.k === 'd') o.d++; else o.y++; o.c += l.p; });
  S.ul.forEach(u => { const o = g(dk(u.t)); o.m += u.m; o.e += u.m * ucw(u.c); o.hasUl = true; });
  return I;
}
const ulScore = o => (o && o.hasUl) ? Math.round(Math.max(0, Math.min(1, (S.target - o.e) / S.target)) * 10) : 0;
const ulBonus = o => ulScore(o) * 50;
const score = o => o ? o.c + ulBonus(o) : 0;
function ledger() {   // cash balance never goes below zero; the Unplug bonus of a day is paid when the day is over
  const I = build(), ev = []; let earned = 0, T = todayK();
  S.logs.forEach(l => { ev.push([l.t, l.p]); if (l.p > 0) earned += l.p; });
  Object.keys(I).forEach(k => { if (k >= T) return; const b = ulBonus(I[k]); if (b) { ev.push([fromKey(k).getTime() + 86399000, b]); earned += b; } });
  S.buys.forEach(b => ev.push([b.t, -b.cost]));
  ev.sort((a, b) => a[0] - b[0]); let bal = 0; ev.forEach(e => { bal = Math.max(0, bal + e[1]); });
  return { earned, bal };
}
function stats() {
  const I = build(), keys = Object.keys(I).sort(), L = ledger(); let best = 0, D = 0, Y = 0;
  keys.forEach(k => { best = Math.max(best, score(I[k])); D += I[k].d; Y += I[k].y; });
  let streak = 0, k = todayK(); if (!(I[k] && score(I[k]) > 0)) k = addDays(k, -1);
  while (I[k] && score(I[k]) > 0) { streak++; k = addDays(k, -1); }
  const clear = keys.filter(x => I[x].d > 0 && I[x].y === 0).length;
  const lvl = levelOf(L.earned), cur = needAt(lvl), nxt = needAt(lvl + 1);
  return { I, earned: L.earned, bal: L.bal, best, D, Y, streak, clear, lvl, prog: lvl >= 999 ? 1 : (L.earned - cur) / (nxt - cur), toNext: lvl >= 999 ? 0 : nxt - L.earned };
}
const weekDays = k => { const I = build(), s = weekStart(k); return [0, 1, 2, 3, 4, 5, 6].map(i => { const d = addDays(s, i); return { k: d, o: I[d] }; }); };

/* ---------- kind words ---------- */
const pick = a => a[Math.floor(Math.random() * a.length)];
const KIND_D = ['Well done. You rode out that urge.', 'Strong. Each time you resist, the habit gets weaker.', 'A real win. Keep going.', 'You chose yourself just now. Good.'];
const KIND_Y = ['It happened. It does not define you. Reset and go again.', 'One slip is only one slip. The next choice is yours.', 'Be kind to yourself. Shame feeds the habit; calm weakens it.', 'It is done. Breathe, then change the room you are in.'];
const TIPS = ['Stand up and leave the room you are in.', 'Wash your face and drink a glass of water.', 'Charge your phone away from your bed tonight.', 'Do 20 slow squats or push-ups.', 'Step outside for five minutes.', 'Message a friend or call someone at home.', 'Read one page aloud from a book.'];
const WISE = ['An urge is like a wave. It rises, peaks and falls.', 'You do not need to win the day, only the next ten minutes.', 'Small wins build a strong character.', 'Evenings are the hard hours. Plan them before they come.'];

/* ---------- feedback: toast (Companion voice), sound, vibration ---------- */
let toastT, AC;
function say(text, undo) {
  const t = $('#toast');
  t.innerHTML = esc(text).replace(/\{c\}/g, G.coin(14)) + (undo ? ' <button class="mini-btn" id="t-undo">Undo</button>' : '');
  t.classList.toggle('act', !!undo); t.classList.add('show');
  if (undo) $('#t-undo').onclick = () => { undo(); t.classList.remove('show'); render(); };
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), undo ? 6500 : 4200);
}
function tone(f, d, v) {
  if (!S.sound) return;
  try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const o = AC.createOscillator(), g = AC.createGain(); o.frequency.value = f; o.type = 'sine'; g.gain.value = 0; o.connect(g); g.connect(AC.destination);
    const t = AC.currentTime; g.gain.linearRampToValueAtTime(v || .07, t + .04); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.start(t); o.stop(t + d + .05); } catch (e) {}
}
const vib = p => { if (S.vib && navigator.vibrate) try { navigator.vibrate(p); } catch (e) {} };

/* ---------- sheets ---------- */
let sheetLocked = false, rt = null;
function sheet(html, lock) { sheetLocked = !!lock; $('#sheet').innerHTML = html; $('#sheet-bg').classList.add('show'); }
function closeSheet() { clearInterval(rt); $('#sheet-bg').classList.remove('show'); $('#sheet').innerHTML = ''; }
$('#sheet-bg').addEventListener('click', e => { if (e.target.id === 'sheet-bg' && !sheetLocked) closeSheet(); });
function confirmSheet(o) {
  sheet(`<h2>${esc(o.title)}</h2>${o.text ? `<p>${esc(o.text)}</p>` : ''}<div class="modal-actions"><button class="btn-line hb" id="c-no">Cancel</button><button class="${o.danger ? 'btn-danger' : 'btn-primary'} hb" id="c-yes">${esc(o.yes)}</button></div>`);
  $('#c-no').onclick = closeSheet; $('#c-yes').onclick = () => { closeSheet(); o.fn(); };
}

/* ---------- actions ---------- */
function logHab(k, viaRescue) {
  const lv0 = stats().lvl, tn = tierNow(), v = valuesNow(tn.tier); let p = k === 'd' ? v.d : -v.y; if (k === 'd' && viaRescue && has('potion')) p += 100;
  const l = { id: Date.now() + Math.random(), t: Date.now(), k, p, tier: tn.tier }; if (viaRescue) l.r = 1; S.logs.push(l); save();
  const lv1 = stats().lvl; FX = { k, p }; closeGS();
  if (k === 'd') { tone(660, .35); setTimeout(() => tone(880, .4), 150); setTimeout(() => tone(1320, .25, .04), 300); vib([14, 30, 22]); render(); if (lv1 <= lv0) say(pick(KIND_D) + ' +{c} ' + fmt(p)); }
  else { tone(300, .5, .05); setTimeout(() => tone(220, .5, .05), 160); vib([30, 60, 30]); render(); setTimeout(() => yieldSheet(p), 700); }
  if (lv1 > lv0) setTimeout(() => levelUp(lv0, lv1), 900);
}
function yieldSheet(p) {
  const h = new Date().getHours(), late = h >= 16 || h < 5;
  sheet(`<h2>It happened</h2><p>${esc(pick(KIND_Y))} <b>${coin(14)} ${fmt(p || 0)}</b></p><div class="card" style="margin:0 0 12px"><div class="hint">Try this now</div><div style="margin-top:6px;font-size:1.5rem;font-weight:300">${esc(pick(TIPS))}</div></div>${late ? '<p>Evenings and nights are the hardest hours. Charge your phone away from your bed tonight.</p>' : ''}<div class="modal-actions"><button class="btn-quiet hb" id="y2">Close</button><button class="btn-primary hb" id="y1">${svg('wind')}Start Urge Rescue</button></div>`);
  $('#y1').onclick = () => { closeSheet(); rescue(); }; $('#y2').onclick = closeSheet;
}
function rescue() {
  let left = 120, ti = 0;
  sheet(`<h2>Urge Rescue</h2><p>Breathe in as the circle grows and out as it shrinks. The urge will peak and pass. Stay for two minutes.</p><div class="hb-breath"><span id="bt">In</span></div>
    <div class="hb-row" style="justify-content:space-between"><div class="hb-time" id="rc">2:00</div><div class="hint" id="rtip" style="text-align:right;max-width:60%"></div></div>
    <div class="modal-actions"><button class="btn-quiet hb" id="rx">Close</button><button class="btn-primary hb" id="rd" disabled style="opacity:.45">I rode it out</button></div>`, true);
  const tip = () => { $('#rtip').textContent = TIPS[ti++ % TIPS.length]; }; tip();
  rt = setInterval(() => {
    left--; const e = $('#rc'); if (!e) { clearInterval(rt); return; }
    e.textContent = Math.floor(left / 60) + ':' + pad(left % 60); $('#bt').textContent = (120 - left) % 10 < 4 ? 'In' : 'Out'; if ((120 - left) % 20 === 0) tip();
    if (left <= 0) { clearInterval(rt); const b = $('#rd'); b.disabled = false; b.style.opacity = 1; $('#bt').textContent = 'Done'; }
  }, 1000);
  $('#rx').onclick = closeSheet; $('#rd').onclick = () => { closeSheet(); logHab('d', true); };
}
function delEntry(list, id, label) {
  confirmSheet({ title: 'Delete this entry?', text: label, yes: 'Delete', danger: true, fn() {
    const i = S[list].findIndex(x => x.id === id); if (i < 0) return; const rm = S[list].splice(i, 1)[0]; save(); render();
    say('Entry deleted.', () => { S[list].push(rm); save(); });
  } });
}
function addUl(m) {
  S.ul.push({ id: Date.now() + Math.random(), t: Date.now(), m, c: ucSel || 'oth' }); save(); tone(520, .3); vib(12); render();
  const o = build()[todayK()], left = Math.round(S.target - o.e);
  say(left > 0 ? 'Added. ' + left + ' weighted minutes left before your daily limit.' : 'Over the limit today. Tomorrow is a fresh page.');
}
function customMinutes() {
  sheet(`<h2>Minutes of screen time</h2><p>Add the minutes you spent on pointless videos, browsing or pictures.</p><label class="field"><span>Minutes</span><input id="um" type="number" inputmode="numeric" min="1" placeholder="0"></label><div class="modal-actions"><button class="btn-line hb" id="un">Cancel</button><button class="btn-primary hb" id="uy">Add</button></div>`);
  $('#un').onclick = closeSheet; $('#uy').onclick = () => { const v = parseInt($('#um').value, 10); if (v > 0) { closeSheet(); addUl(v); } };
}

/* ---------- theme ---------- */
const mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
function apply() {
  const dark = S.follow ? !!(mq && mq.matches) : S.look === 'flagshipd', H = document.documentElement;
  H.setAttribute('data-scheme', dark ? 'dark' : 'light'); H.setAttribute('data-look', dark ? 'flagshipd' : 'flagship');
  H.setAttribute('data-acc', S.accent === 'gold' ? 'gold' : 'sapphire'); H.setAttribute('data-fl', S.flFont || 'system');
  H.classList.toggle('fl-glow', !!S.glow);
  if (window.GBtnLook) GBtnLook.apply();
}
if (mq && mq.addEventListener) mq.addEventListener('change', () => { if (S.follow) { apply(); } });

/* ---------- PIN ---------- */
function hash(p) {
  const s = S.salt + ':' + p;
  if (window.crypto && crypto.subtle && window.TextEncoder) return crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)).then(b => Array.from(new Uint8Array(b)).map(x => ('0' + x.toString(16)).slice(-2)).join(''));
  let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return Promise.resolve('x' + h);
}
function pinPad(title, cb, cancel) {
  let v = ''; const L = $('#lock'); $('#lock-title').textContent = title; $('#lock-msg').textContent = ''; L.classList.add('show');
  const dots = () => { $('#lock-dots').innerHTML = [0, 1, 2, 3].map(i => `<i class="${i < v.length ? 'f' : ''}"></i>`).join(''); }; dots();
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', cancel ? '×' : '', '0', '⌫'];
  $('#lock-pad').innerHTML = keys.map(k => k ? `<button data-k="${k}" aria-label="${k === '⌫' ? 'Delete digit' : k === '×' ? 'Cancel' : k}">${k}</button>` : '<span></span>').join('');
  $('#lock-pad').onclick = e => {
    const b = e.target.closest('button'); if (!b) return; const k = b.getAttribute('data-k');
    if (k === '⌫') { v = v.slice(0, -1); dots(); return; } if (k === '×') { L.classList.remove('show'); return; }
    if (v.length < 4) { v += k; vib(8); dots(); }
    if (v.length === 4) { const x = v; v = ''; setTimeout(() => { dots(); cb(x, m => { $('#lock-msg').textContent = m || ''; }); }, 120); }
  };
}
let hiddenAt = 0;
function lockNow() { if (!S.pin) return; pinPad('Enter your PIN', (p, msg) => hash(p).then(h => { if (h === S.pin) $('#lock').classList.remove('show'); else { msg('Wrong PIN. Try again.'); vib([40, 40, 40]); } })); }
function setPin(done) {
  pinPad('Choose a 4-digit PIN', a => pinPad('Repeat the PIN', (b, msg) => {
    if (a !== b) { msg('The PINs do not match.'); setTimeout(() => setPin(done), 900); return; }
    hash(a).then(h => { S.pin = h; save(); $('#lock').classList.remove('show'); if (done) done(); });
  }, true), true);
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { hiddenAt = Date.now(); document.body.classList.add('cover'); }
  else { document.body.classList.remove('cover'); if (S.pin && Date.now() - hiddenAt > S.lockAfter * 1000) lockNow(); }
});

/* ---------- backup (encrypted with a passphrase) ---------- */
const b64 = u => btoa(String.fromCharCode.apply(null, u)), unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
async function deriveKey(pass, salt) {
  const km = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' }, km, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function encryptData(text, pass) {
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12)), key = await deriveKey(pass, salt);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(text)));
  return JSON.stringify({ enc: 1, app: 'rustams-habit-tracker', salt: b64(salt), iv: b64(iv), data: b64(ct) });
}
async function decryptData(obj, pass) {
  const key = await deriveKey(pass, unb64(obj.salt));
  return new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(obj.iv) }, key, unb64(obj.data)));
}
function backupSheet(mode) {
  sheet(`<h2>Back up</h2><p>Choose a passphrase. Your copy is locked with it. Keep the passphrase safe: nobody can recover it.</p><label class="field"><span>Passphrase</span><input id="bp" type="password" autocomplete="new-password" placeholder="At least 6 characters"></label><div class="error" id="be"></div><div class="modal-actions"><button class="btn-line hb" id="bn">Cancel</button><button class="btn-primary hb" id="by">${mode === 'share' ? 'Back up' : 'Save'}</button></div>`);
  $('#bn').onclick = closeSheet;
  $('#by').onclick = async () => {
    const p = $('#bp').value; if (p.length < 6) { $('#be').textContent = 'Use at least 6 characters.'; return; }
    if (!(window.crypto && crypto.subtle)) { $('#be').textContent = 'This browser cannot lock backups.'; return; }
    const text = await encryptData(JSON.stringify(S), p), name = 'habit-tracker-backup-' + todayK() + '.json', blob = new Blob([text], { type: 'application/json' });
    closeSheet(); let file; try { file = new File([blob], name, { type: 'application/json' }); } catch (e) {}
    if (mode === 'share' && file && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: 'Habit Tracker backup' }).then(() => { S.lastBackup = Date.now(); save(); render(); say('Backup saved.'); }).catch(() => {});
    } else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); S.lastBackup = Date.now(); save(); render(); say('Backup saved to Downloads.'); }
  };
}
$('#file-restore').addEventListener('change', e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return; const r = new FileReader();
  r.onload = () => {
    let o; try { o = JSON.parse(r.result); } catch (x) { say('That file is not a valid backup.'); return; }
    const finish = d => { if (!d || !Array.isArray(d.logs)) { say('That file is not a valid backup.'); return; }
      confirmSheet({ title: 'Replace your data?', text: 'Your current entries will be replaced by this copy.', yes: 'Replace', danger: true, fn() { S = migrate(Object.assign(defaults(), d)); save(); apply(); render(); say('Backup restored.'); } }); };
    if (o && o.enc) {
      sheet(`<h2>Open backup</h2><label class="field"><span>Passphrase</span><input id="rp" type="password" autocomplete="off"></label><div class="error" id="re"></div><div class="modal-actions"><button class="btn-line hb" id="rn">Cancel</button><button class="btn-primary hb" id="ry">Open</button></div>`);
      $('#rn').onclick = closeSheet;
      $('#ry').onclick = async () => { try { const t = await decryptData(o, $('#rp').value); closeSheet(); finish(JSON.parse(t)); } catch (x) { $('#re').textContent = 'Wrong passphrase.'; } };
    } else finish(o);
  };
  r.readAsText(f);
});

/* ---------- views ---------- */
let screen = 'today', setPage = 'top', pTab = 'week', monthOff = 0, tipI = 0;
const arc = (frac, color) => { const c = 2 * Math.PI * 36, f = Math.max(0, Math.min(1, frac)); return `<svg viewBox="0 0 80 80"><circle class="tr" cx="40" cy="40" r="36" stroke-width="7"/><circle class="ar" cx="40" cy="40" r="36" stroke-width="7" stroke="${color}" stroke-dasharray="${(f * c).toFixed(1)} ${c.toFixed(1)}"/></svg>`; };
const greet = () => { const h = new Date().getHours(); return (h < 5 ? 'Late night' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening') + (S.name ? ', ' + esc(S.name) : ''); };

function renderBanner() {
  const last = S.logs.length ? S.logs.slice().sort((a, b) => b.t - a.t)[0] : null;
  const items = [];
  if (last) items.push(['info', 'Last entry: ' + (last.k === 'd' ? 'Ducked' : 'Yielded') + ' ' + when(last.t)]);
  items.push(['bulb', pick(WISE.concat(TIPS))]);
  const it = items[tipI % items.length];
  $('#banner').innerHTML = `<div class="banner" id="bn-tap"><svg class="bn-ic" viewBox="0 0 24 24">${IC[it[0]]}</svg><span class="bn-t">${esc(it[1])}</span></div>`;
  $('#bn-tap').onclick = () => { tipI++; renderBanner(); };
}
function dangerInfo() {
  const c = new Array(24).fill(0); S.logs.forEach(l => { if (l.k === 'y') c[new Date(l.t).getHours()]++; });
  const n = c.reduce((a, b) => a + b, 0); return { c, n };
}

/* ---------- The Nemesis (the game screen) ---------- */
const slotChip = id => { const it = G.CATALOG.find(c => c.id === S.gear.eq[id]); return `<span class="g-slot${it ? '' : ' e'}" title="${it ? esc(it.name) : 'Empty'}">${it ? G.sprite(it.sp, 22) : '+'}</span>`; };
let FX = null, curTier = 1, hubSt = -1;
const coin = s => G.coin(s || 16);
const gauge = (f, lab, val, col) => { const C = 2 * Math.PI * 22; return `<div class="g-gauge"><svg viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="22" fill="none" stroke="#17305f" stroke-width="6"/><circle cx="28" cy="28" r="22" fill="none" stroke="${col}" stroke-width="6" stroke-linecap="round" stroke-dasharray="${(Math.max(0, Math.min(1, f)) * C).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 28 28)"/></svg><b>${val}</b><span>${lab}</span></div>`; };
function viewToday() {
  const st = stats(), k = todayK(), o = st.I[k] || { d: 0, y: 0, m: 0, e: 0, c: 0, hasUl: false }, tn = tierNow(), vv = valuesNow(tn.tier);
  curTier = tn.tier; const fx = FX; FX = null;
  const net = o.c, pct = Math.max(0, Math.min(1, net / S.goal)), state = net >= S.goal ? 2 : pct >= 0.5 ? 1 : 0, C = 2 * Math.PI * 138;
  const perks = S.gear.own.filter(i => (G.CATALOG.find(c => c.id === i) || {}).slot === 'perk').length;
  const logs = S.logs.filter(l => dk(l.t) === k);
  const nx = nextRank(st.lvl), fl = st.streak >= 100 ? 3 : st.streak >= 30 ? 2 : st.streak >= 7 ? 1 : 0;
  let burst = '';
  if (fx) {
    burst = `<div class="g-float ${fx.k}">${fx.p > 0 ? '+' : '−'}${fmt(Math.abs(fx.p))}</div>`;
    if (fx.k === 'd') for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283 + 0.3, r = 95 + (i * 37) % 40; burst += `<i class="g-spark" style="--dx:${Math.round(Math.cos(a) * r)}px;--dy:${Math.round(Math.sin(a) * r)}px;animation-delay:${(i % 4) * 40}ms"></i>`; }
  }
  let out = `<div class="g-hud"><button class="g-av" data-to="arm" aria-label="Open the Armoury" title="Open the Armoury">${G.hero(st.lvl, S.gear.eq)}<span class="g-lv">Lv ${st.lvl} / 999</span></button>
    <div class="g-hi"><div class="g-rank">${rankName(st.lvl)}</div><div class="g-sub">${fmt(st.earned)} earned in total</div>
    <div class="g-xp"><i style="width:${Math.round(Math.max(0, Math.min(1, st.prog)) * 100)}%"></i></div><div class="g-xl"><span>${st.lvl >= 999 ? 'Highest level' : 'Level ' + (st.lvl + 1) + (nx && RANKS.some(r => r[0] === st.lvl + 1) ? ': ' + nx : '')}</span><span>${fmt(st.toNext)} to go</span></div></div>
    <button class="cc orb g-orb" aria-label="Companion. Tap for a tip." title="Tap for a tip"><i></i></button></div>
    <div class="g-row2"><div class="g-slots">${slotChip('head')}${slotChip('rhand')}${slotChip('lhand')}<span class="g-slot e" title="Perks">${perks ? perks : '+'}</span></div>
    <button class="g-cash" data-to="arm" aria-label="${fmt(st.bal)} coins. Open the Armoury">${coin(20)}<b>${fmt(st.bal)}</b></button></div>`;
  out += `<div class="g-arena${tn.tier >= 2 ? ' hard' : ''}${fx ? ' fx-' + fx.k : ''}"><svg class="g-ring" viewBox="0 0 300 300" aria-hidden="true"><circle cx="150" cy="150" r="138" fill="rgba(5,9,26,.84)" stroke="#0a1230" stroke-width="14"/><circle cx="150" cy="150" r="138" fill="none" stroke="#17305f" stroke-width="8"/>
    <circle cx="150" cy="150" r="138" fill="none" stroke="#5ad7ff" stroke-width="8" stroke-linecap="round" stroke-dasharray="${(pct * C).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 150 150)" style="transition:stroke-dasharray 1.1s ease"/><circle cx="150" cy="150" r="118" fill="none" stroke="rgba(154,123,255,.5)" stroke-width="1.5" stroke-dasharray="3 7"/></svg>
    <div class="g-cre">${G.nemesis(state)}</div><div class="g-prog">${net < 0 ? '−' : '+'}${fmt(Math.abs(net))} of ${fmt(S.goal)} today</div>${burst}</div>
    <div class="g-threat"><span>${TIERW[tn.tier]}${tn.tier === 1 ? '' : ' · Ducked ' + (tn.tier >= 2 ? '▲' : '▼') + ' Yielded ' + (tn.tier >= 2 ? '▼' : '▲')}</span></div><div class="g-why">${tn.learned ? 'Learned from your own days.' : 'From the usual pattern. It learns as you log.'}</div>
    <div class="g-btns"><button class="g-btn d" id="bd">Ducked<small>+${fmt(vv.d)}</small></button><button class="g-btn y" id="by">Yielded<small>−${fmt(vv.y)}</small></button></div>
    <button class="g-btn q" id="br">${svg('wind')}Urge Rescue${has('potion') ? ' · +100' : ''}</button>
    <div class="g-chips"><span class="g-chip fl fl${fl}">${svg('flame')}${st.streak} day streak</span>${logs.length ? `<button class="g-chip" id="ent" aria-label="Show today's entries">Ducked ${o.d} · Yielded ${o.y} ▴</button>` : `<span class="g-chip">Ducked ${o.d} · Yielded ${o.y}</span>`}</div>`;
  return out;
}
function entriesSheet() {
  const k = todayK(), logs = S.logs.filter(l => dk(l.t) === k).sort((a, b) => b.t - a.t); closeGS();
  const d = document.createElement('div'); d.id = 'gsb'; d.className = 'g-sheet-bg';
  d.innerHTML = `<div class="g-sheet"><div class="g-grip"></div><div class="g-cap" style="margin-bottom:6px">Today's entries</div>${logs.length ? logs.map(l => { const dd = l.k === 'd'; return `<div class="g-log"><span class="t">${clock(l.t)}</span><span class="n">${dd ? 'Ducked' + (l.r ? ' (rescue)' : '') : 'Yielded'}</span><span class="p ${dd ? 'pos' : 'neg'}">${l.p > 0 ? '+' : '−'}${fmt(Math.abs(l.p))}</span><button class="g-del" data-dl="${l.id}" title="Delete" aria-label="Delete entry">${svg('trash')}</button></div>`; }).join('') : '<div class="g-sub">Nothing yet today.</div>'}<button class="g-btn q" id="gsx" style="margin-top:14px">Close</button></div>`;
  document.body.appendChild(d); requestAnimationFrame(() => d.classList.add('show')); vib(8); $('#toast').classList.remove('show');
}
function closeGS() { const d = $('#gsb'); if (d) d.remove(); }
function levelUp(a, b) {
  closeGS(); const un = G.CATALOG.filter(c => c.level > a && c.level <= b);
  const d = document.createElement('div'); d.className = 'lvlup';
  d.innerHTML = `<div class="lu-in"><div class="g-cap">Level up</div><div class="lu-hero">${G.hero(b, S.gear.eq)}</div><div class="lu-n">Level ${b}</div><div class="lu-r">${rankName(b)}</div>${un.length ? `<div class="g-sub">New in the Armoury</div><div class="lu-items">${un.map(c => G.sprite(c.sp, 40)).join('')}</div>` : ''}<div class="g-sub" style="margin-top:14px">Tap to continue</div></div>`;
  document.body.appendChild(d); const x = () => { d.classList.add('out'); setTimeout(() => d.remove(), 380); }; d.onclick = x; setTimeout(x, 5200);
  tone(523, .3); setTimeout(() => tone(659, .3), 130); setTimeout(() => tone(784, .3), 260); setTimeout(() => tone(1046, .7), 390); vib([20, 40, 20, 40, 70]);
}
function todayState() { const o = stats().I[todayK()], net = o ? o.c : 0; return net >= S.goal ? 2 : net >= S.goal / 2 ? 1 : 0; }

/* ---------- Armoury ---------- */
function buyItem(id) {
  const it = G.CATALOG.find(c => c.id === id), st = stats(); if (!it || has(id)) return;
  if (st.lvl < it.level) { say('You need level ' + it.level + ' for this.'); return; }
  if (st.bal < it.price) { say('You need {c} ' + fmt(it.price - st.bal) + ' more.'); return; }
  const b = { id: 'b' + Date.now(), t: Date.now(), item: id, cost: it.price }, had = S.gear.eq[it.slot];
  S.buys.push(b); S.gear.own.push(id); if (it.slot !== 'perk' && !had) S.gear.eq[it.slot] = id; save(); tone(740, .3); setTimeout(() => tone(990, .45), 140); vib([20, 40, 20]); render();
  say(it.name + ' is yours.', () => { S.buys = S.buys.filter(x => x.id !== b.id); S.gear.own = S.gear.own.filter(x => x !== id); if (S.gear.eq[it.slot] === id) delete S.gear.eq[it.slot]; save(); });
}
function equipItem(id, on) {
  const it = G.CATALOG.find(c => c.id === id); if (!it || !has(id) || it.slot === 'perk') return;
  if (on) S.gear.eq[it.slot] = id; else delete S.gear.eq[it.slot]; save(); tone(on ? 620 : 420, .2); vib(10); render();
}
function viewArmoury() {
  const st = stats(), eq = S.gear.eq, perks = S.gear.own.map(i => G.CATALOG.find(c => c.id === i)).filter(c => c && c.slot === 'perk');
  const rate = st.D + st.Y ? st.D / (st.D + st.Y) : 0;
  let out = `<div class="g-top"><div class="g-title">Armoury</div><div class="g-cash static">${coin(20)}<b>${fmt(st.bal)}</b></div></div><div class="g-card g-panel"><div class="g-herobox">${G.hero(st.lvl, eq)}</div><div class="g-hinfo"><div class="g-rank">${rankName(st.lvl)}</div><div class="g-sub">Level ${st.lvl} of 999</div><div class="g-sub" style="margin-top:10px">Your level follows the coins you earn, never the coins you spend.</div></div></div>`;
  out += `<div class="g-gauges">${gauge(rate, 'Resolve', Math.round(rate * 100) + '%', '#4fe0a8')}${gauge(Math.min(1, st.streak / 30), 'Streak', st.streak + 'd', '#ffb35a')}${gauge(st.prog, 'Climb', Math.round(Math.max(0, Math.min(1, st.prog)) * 100) + '%', '#5ad7ff')}</div>`;
  if (perks.length) out += `<div class="g-card"><div class="g-cap">Active perks</div>${perks.map(p => `<div class="g-perk">${G.sprite(p.sp, 28)}<span><b>${esc(p.name)}</b><br><small>${esc(p.perk)}</small></span></div>`).join('')}</div>`;
  out += `<div class="g-cap" style="margin:14px 4px 8px">Gear and perks</div><div class="g-shop">`;
  G.CATALOG.slice().sort((a, b) => a.level - b.level).forEach(it => {
    const own = has(it.id), worn = eq[it.slot] === it.id && it.slot !== 'perk', locked = st.lvl < it.level, afford = st.bal >= it.price;
    let act;
    if (own) act = it.slot === 'perk' ? '<span class="g-own">Active</span>' : worn ? `<button class="g-btn q sm" data-ueq="${it.id}">Take off</button>` : `<button class="g-btn p sm" data-eq="${it.id}">Wear</button>`;
    else if (locked) act = `<span class="g-lock">Level ${it.level}</span>`;
    else act = `<button class="g-btn p sm${afford ? '' : ' off'}" data-buy="${it.id}">Buy · ${coin(14)} ${fmt(it.price)}</button>`;
    out += `<div class="g-item ${it.rar}${own ? ' own' : ''}${locked ? ' locked' : ''}"><div class="g-art">${G.sprite(it.sp, 52)}</div><div class="g-in">${esc(it.name)}</div><div class="g-is">${it.slot === 'perk' ? 'Perk' : G.SLOTS[it.slot]}${own ? '' : ' · ' + coin(12) + ' ' + fmt(it.price)}</div>${act}</div>`;
  });
  return out + '</div>';
}

/* ---------- Unplug ---------- */
let ucSel = null;
function ucSuggest() {
  const out = [], yl = S.logs.filter(l => l.k === 'y').map(l => l.t); if (S.ul.length < 6) return out;
  const hit = e => yl.some(t => t > e.t && t - e.t <= 3 * 36e5), all = S.ul.filter(e => e.m > 0), base = all.length ? all.filter(hit).length / all.length : 0;
  S.ucats.forEach(c => {
    const es = all.filter(e => (e.c || 'oth') === c.id); if (es.length < 4) return; const r = es.filter(hit).length / es.length;
    const dir = r >= base + 0.25 ? 'u' : r <= base - 0.25 ? 'd' : ''; if (!dir) return;
    if (S.dismiss[c.id + dir] && Date.now() - S.dismiss[c.id + dir] < 14 * 864e5) return;
    if (dir === 'u' && c.w < 3) out.push({ c, dir, r, n: es.length, to: Math.min(3, c.w + 0.5) }); else if (dir === 'd' && c.w > 0.5) out.push({ c, dir, r, n: es.length, to: Math.max(0.5, c.w - 0.5) });
  });
  return out;
}
function viewUnplug() {
  const k = todayK(), I = build(), o = I[k] || { d: 0, y: 0, m: 0, e: 0, c: 0, hasUl: false };
  if (!ucSel || !S.ucats.find(c => c.id === ucSel)) ucSel = S.ucats[0].id;
  const eff = Math.round(o.e), pct = Math.min(1, eff / S.target), over = eff > S.target;
  const prevS = addDays(weekStart(k), -7); let pm = 0, pAny = false, ws = 0;
  weekDays(prevS).forEach(x => { if (x.o && x.o.hasUl) { pm += x.o.e; pAny = true; } }); weekDays(k).forEach(x => { if (x.o && x.o.hasUl) ws += x.o.e; });
  const wT = pAny ? Math.round(pm * 0.9) : S.target * 7; ws = Math.round(ws);
  const uls = S.ul.filter(u => dk(u.t) === k).sort((a, b) => b.t - a.t), sg = ucSuggest();
  const catName = id => (S.ucats.find(c => c.id === id) || { n: 'Other' }).n;
  let out = `<div class="card wd-card"><div class="wd-cap">Unplug</div><div class="wd-main"><span class="wd-it">${svg('phone', 'stroke="#fff" width="22" height="22"')}</span>
    <div class="wd-mid"><div class="wd-big">${eff}</div><div class="wd-un">of ${S.target} weighted minutes of pointless screen time (${Math.round(o.m)} real)</div></div>
    <div class="hb-ring" style="width:52px;height:52px">${arc(pct, over ? '#d23b34' : 'var(--blue-b)')}</div></div>
    <div class="hb-bar ${over ? 'r' : ''}"><i style="width:${Math.round(pct * 100)}%"></i></div>
    <div class="hint" style="margin-top:8px">Bonus when today ends: ${coin(14)} ${fmt(ulBonus(o))} of 500. Under the limit earns more.</div></div>`;
  out += `<div class="card"><h3>Log screen time</h3><div class="hint">Choose what you were doing, then add the minutes.</div><div class="hb-chiprow">${S.ucats.map(c => `<button class="mini-btn${c.id === ucSel ? ' on' : ''}" data-uc="${c.id}" aria-pressed="${c.id === ucSel}">${esc(c.n)}${c.w !== 1 ? ' ×' + c.w : ''}</button>`).join('')}</div>
    <div class="hb-chiprow"><button class="mini-btn" data-ul="15">+15</button><button class="mini-btn" data-ul="30">+30</button><button class="mini-btn" data-ul="60">+60</button><button class="btn-quiet mini-btn" id="ulc">Other</button><button class="btn-quiet mini-btn" id="ulz">Zero today</button></div></div>`;
  sg.forEach(s => {
    out += `<div class="card"><div class="hb-cap">A suggestion</div><div>${s.dir === 'u' ? 'After' : 'After'} ${esc(s.c.n)}, you yielded within three hours ${Math.round(s.r * 100)}% of the time (${s.n} entries). ${s.dir === 'u' ? 'It may count for more.' : 'It may count for less.'}</div>
      <div class="hb-actions" style="margin:12px 0 0"><button class="btn-quiet hb" data-sg="${s.c.id}:${s.dir}:no">Not now</button><button class="btn-primary hb" data-sg="${s.c.id}:${s.dir}:ok:${s.to}">Change weight to ×${s.to}</button></div></div>`;
  });
  out += `<div class="card"><div class="hb-cap">This week</div><div class="wd-sub" style="margin-top:0"><span>${ws} of ${wT} weighted minutes</span><b>${pAny ? '10% below last week' : 'first week target'}</b></div><div class="hb-bar ${ws > wT ? 'r' : 'g'}"><i style="width:${Math.min(100, Math.round(ws / Math.max(1, wT) * 100))}%"></i></div></div>`;
  if (uls.length) out += `<div class="card"><details open><summary class="hint" style="cursor:pointer">Today's entries · ${uls.length}</summary><div style="margin-top:8px">${uls.map(u => `<div class="hb-log"><span class="t">${clock(u.t)}</span><span class="n">${esc(catName(u.c))}</span><span class="p">${u.m} min</span><button class="ico-btn ico-del" data-du="${u.id}" title="Delete" aria-label="Delete entry">${svg('trash')}</button></div>`).join('')}</div></details></div>`;
  out += `<div class="card"><details><summary class="hint" style="cursor:pointer">Categories and weights</summary><p class="hint" style="margin:8px 0">A weight of ×2 means each minute counts double towards your limit. The app suggests changes as it learns.</p>
    ${S.ucats.map(c => `<div class="sw-row"><span>${esc(c.n)}</span><div class="hb-stepper"><button class="mini-btn" data-cw="${c.id}" data-d="-1" aria-label="Lower weight">−</button><b>×${c.w}</b><button class="mini-btn" data-cw="${c.id}" data-d="1" aria-label="Raise weight">+</button>${c.id === 'oth' ? '' : `<button class="ico-btn ico-del" data-cdel="${c.id}" title="Delete" aria-label="Delete category">${svg('trash')}</button>`}</div></div>`).join('')}
    <div class="hb-add"><input id="cn" maxlength="20" placeholder="New category"><button class="btn-primary hb" id="cadd">Add</button></div></details></div>`;
  return out;
}

function viewProgress() {
  const st = stats(), I = st.I, k = todayK(); let out = '';
  out += `<div class="seg" id="pseg" style="margin-bottom:14px"><button data-p="week" class="${pTab === 'week' ? 'on' : ''}">Week</button><button data-p="month" class="${pTab === 'month' ? 'on' : ''}">Month</button></div>`;
  if (pTab === 'week') {
    const days = weekDays(k), prev = weekDays(addDays(weekStart(k), -7)), n = days.filter(x => x.k <= k).length; let tot = 0, ptot = 0, mx = 1;
    days.forEach(x => { const s = score(x.o); tot += s; mx = Math.max(mx, Math.abs(s)); }); prev.forEach((x, i) => { if (i < n) ptot += score(x.o); });
    const diff = tot - ptot, L = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    out += `<div class="card"><div class="hb-cap">This week</div><div class="hb-row"><div class="hb-big">${tot}<small>${coin(14)}</small></div><div class="hint hb-grow" style="text-align:right;color:${diff >= 0 ? '#1f9d63' : 'var(--warning)'}">${diff === 0 ? '– same as last week' : (diff > 0 ? '▲ ' : '▼ ') + Math.abs(diff) + ' vs same days last week'}</div></div>
      <div class="hb-wk">${days.map((x, i) => { const s = score(x.o), hh = s === 0 ? 4 : Math.round(Math.abs(s) / mx * 88) + 4; return `<div><span>${s ? kfmt(s) : ''}</span><b class="${s < 0 ? 'n' : s === 0 ? 'z' : ''}" style="height:${hh}px"></b>${L[i]}</div>`; }).join('')}</div></div>`;
  } else {
    const d0 = fromKey(k); d0.setDate(1); d0.setMonth(d0.getMonth() + monthOff);
    const y = d0.getFullYear(), m = d0.getMonth(), dim = new Date(y, m + 1, 0).getDate(), off = (d0.getDay() + 6) % 7; let mt = 0, mD = 0, mY = 0;
    let cells = ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(x => `<span class="h">${x}</span>`).join(''); for (let i = 0; i < off; i++) cells += '<span class="h"></span>';
    for (let d = 1; d <= dim; d++) {
      const key = y + '-' + pad(m + 1) + '-' + pad(d), o = I[key], s = score(o); let c = '';
      if (o) { mt += s; mD += o.d; mY += o.y; c = s > 0 ? (s >= S.goal ? 'p3' : s >= S.goal / 2 ? 'p2' : 'p1') : s < 0 ? 'n1' : ''; }
      cells += `<span class="${c}${key === k ? ' td' : ''}">${d}</span>`;
    }
    const mn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m];
    out += `<div class="card"><div class="hb-nav"><button class="ico-btn" id="mp" aria-label="Previous month" title="Previous month">${svg('left')}</button><h3 style="margin:0">${mn} ${y}</h3><button class="ico-btn" id="mn" aria-label="Next month" title="Next month" ${monthOff >= 0 ? 'disabled style="opacity:.35"' : ''}>${svg('right')}</button></div>
      <div class="hb-row" style="margin:14px 0 4px"><div class="hb-big">${mt}<small>${coin(14)}</small></div></div><div class="hint">Ducked ${mD} · Yielded ${mY}</div><div class="hb-cal">${cells}</div>
      <div class="hint" style="margin-top:12px">Darker green is a stronger day. Red is a day that lost points.</div></div>`;
  }
  const rate = st.D + st.Y ? Math.round(st.D / (st.D + st.Y) * 100) : 0;
  out += `<div class="card"><div class="hb-cap">All time</div><div class="hb-row"><div class="hb-ring">${arc(rate / 100, '#1f9d63')}<div class="ct">${rate}%</div></div>
    <div class="hb-grow"><div class="hb-stats" style="margin-top:0"><div><span class="hint">Ducked</span><b class="hb-pos">${st.D}</b></div><div><span class="hint">Yielded</span><b class="hb-neg">${st.Y}</b></div><div><span class="hint">Clear days</span><b>${st.clear}</b></div><div><span class="hint">Best day</span><b>${st.best}</b></div></div></div></div>
    <div class="hint" style="margin-top:12px">${st.D + st.Y < 10 ? 'Based on only ' + (st.D + st.Y) + ' entries so far. It becomes more reliable with use.' : 'Based on ' + (st.D + st.Y) + ' entries.'}</div></div>`;
  const hc = new Array(24).fill(0), hd = new Array(24).fill(0); S.logs.forEach(l => { const h = new Date(l.t).getHours(); if (l.k === 'y') hc[h]++; else hd[h]++; });
  const mxh = Math.max(1, Math.max.apply(null, hc), Math.max.apply(null, hd));
  out += `<div class="card"><h3>Your hours</h3><div class="hint">When you resisted and when you gave in. The app learns your hard hours from this.</div><div class="hb-hours">${hc.map((c, i) => `<div><u style="height:${Math.round(hd[i] / mxh * 38)}px"></u><i style="height:${Math.round(c / mxh * 48)}px"></i></div>`).join('')}</div>
    <div class="hb-lbls"><span>12 am</span><span>6 am</span><span>12 pm</span><span>6 pm</span><span>11 pm</span></div><div class="hint" style="margin-top:10px"><span class="hb-pos">■</span> resisted &nbsp; <span class="hb-neg">■</span> yielded</div></div>`;
  const BK = [[1, '12 am to 4 am'], [5, '4 am to 8 am'], [9, '8 am to 12 pm'], [13, '12 pm to 4 pm'], [17, '4 pm to 8 pm'], [21, '8 pm to 12 am']];
  out += `<div class="card"><h3>How the app sees your day</h3><div class="hint">Hard hours pay more for Ducked and cost less for Yielded. Easy hours do the opposite. ${S.learn ? 'It learns from your own entries.' : 'Learning is switched off, so it uses the usual pattern.'}</div><div style="margin-top:8px">${BK.map(b => { const dd = new Date(); dd.setHours(b[0], 30, 0, 0); const x = riskAt(dd.getTime()), t = tierOf(x.r), v = tierValues(t);
    return `<div class="hb-log"><span class="n">${b[1]}</span><span class="hb-chip" style="height:24px">${TIER[t]}</span><span class="p hb-pos" style="min-width:auto">+${fmt(v.d)}</span><span class="p hb-neg" style="min-width:auto">−${fmt(v.y)}</span></div>`; }).join('')}</div></div>`;
  return out;
}

/* ---------- Settings (Apple-like: state first, then rows; one page per group) ---------- */
const swRow = (k, t, d) => `<div class="sw-row"><div><div>${t}</div>${d ? `<div class="set-meta">${d}</div>` : ''}</div><label class="switch"><input type="checkbox" data-pref="${k}" ${S[k] ? 'checked' : ''}><i></i></label></div>`;
const stepRow = (k, t, d, u, cash) => `<div class="sw-row"><div><div>${t}</div>${d ? `<div class="set-meta">${d}</div>` : ''}</div><div class="hb-stepper"><button class="mini-btn" data-st="${k}" data-d="-1" aria-label="Less">−</button><b>${cash ? fmt(S[k]) : S[k]}${u || ''}</b><button class="mini-btn" data-st="${k}" data-d="1" aria-label="More">+</button></div></div>`;
const row = (go, ic, col, label, val) => `<button class="si-row" data-go="${go}">${siTile(ic, col)}<span class="si-l">${label}</span><span class="si-v">${val || ''}</span><svg class="si-ch" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IC.right}</svg></button>`;
const back = () => `<button class="si-back" data-go="top">${svg('left')}Settings</button>`;
function daysSince(t) { return t ? Math.floor((Date.now() - t) / 86400000) : null; }
function viewSettings() {
  if (setPage === 'top') {
    const ds = daysSince(S.lastBackup);
    return `<div class="si-title big">Settings</div>
      <div class="si-tiles"><button class="si-tile2" data-go="backup"><span class="si-cap">Backup</span><span class="si-big ${ds === null || ds > 7 ? 'warn' : ''}">${ds === null ? '–' : ds}<small>${ds === null ? '' : ds === 1 ? ' day' : ' days'}</small></span><span class="si-small">${ds === null ? 'no copy yet' : 'since your last copy'}</span><span class="si-foot">Tap to open</span></button>
      <button class="si-tile2" data-go="look"><span class="si-cap">Look</span><span class="si-dots"><i style="background:#f6f7fa"></i><i style="background:#17191d"></i><i style="background:linear-gradient(135deg,#5c9fe6,#3560bd)"></i><i style="background:linear-gradient(135deg,#f3d36e,#c9a43a)"></i></span><span class="si-small">${S.follow ? 'Follows your phone' : S.look === 'flagshipd' ? 'Dark' : 'Light'} · ${S.accent === 'gold' ? 'Champagne' : 'Sapphire'}</span><span class="si-foot">Tap to open</span></button></div>
      <div class="si-group">${row('look', 'palette', '#4a86dc', 'Appearance', S.accent === 'gold' ? 'Champagne' : 'Sapphire')}${row('sound', 'speaker', '#8e6bd8', 'Sound and feel', S.sound ? 'On' : 'Off')}</div>
      <div class="si-group">${row('points', 'star', '#e0a03a', 'Cash and limits', fmt(tierValues(1).d) + ' / −' + fmt(tierValues(1).y))}${row('future', 'list', '#2fa36b', 'Future habits', S.ideas.length ? String(S.ideas.length) : '')}</div>
      <div class="si-group">${row('privacy', 'shield', '#d9534f', 'Privacy and security', S.pin ? 'PIN on' : 'No PIN')}${row('backup', 'disk', '#5a6a7e', 'Backup and data', '')}</div>
      <div class="si-erase"><button class="link-btn danger" id="erase">Erase everything…</button></div>
      <div class="si-foot-note">Rustam's Habit Tracker · Version ${VERSION}<br>All entries stay on this phone.</div>`;
  }
  const P = {
    look: () => `<div class="si-title">Appearance</div><div class="card">${swRow('follow', 'Follow my phone', 'Light by day, dark by night, as your phone decides')}
      ${S.follow ? '' : `<div class="hb-sw"><div class="seg" id="lk" style="flex:1"><button data-lk="flagship" class="${S.look === 'flagship' ? 'on' : ''}">Light</button><button data-lk="flagshipd" class="${S.look === 'flagshipd' ? 'on' : ''}">Dark</button></div></div>`}</div>
      <div class="card"><h3>Colour</h3><div class="seg" id="ac"><button data-ac="sapphire" class="${S.accent === 'sapphire' ? 'on' : ''}">Sapphire</button><button data-ac="gold" class="${S.accent === 'gold' ? 'on' : ''}">Champagne</button></div>
      <h3 style="margin-top:16px">Type</h3><div class="seg" id="fn"><button data-fn="system" class="${S.flFont === 'system' ? 'on' : ''}">System</button><button data-fn="inter" class="${S.flFont === 'inter' ? 'on' : ''}">Inter</button><button data-fn="manrope" class="${S.flFont === 'manrope' ? 'on' : ''}">Manrope</button></div></div>
      <div class="card">${swRow('glow', 'Faint inner glow', 'A soft light on the lower edge of cards')}</div>${window.GBtnLook ? GBtnLook.settingsHTML() : ''}`,
    sound: () => `<div class="si-title">Sound and feel</div><div class="card">${swRow('sound', 'Sounds', 'Short, soft tones')}${swRow('vib', 'Vibration', 'Gentle pulses')}</div>`,
    points: () => `<div class="si-title">Cash and limits</div><div class="card">${stepRow('base', 'Usual cost of a Yielded', 'Ducked pays twice this in steady hours', '', true)}${stepRow('goal', 'Daily cash goal', 'Fills the ring on The Nemesis', '', true)}${stepRow('target', 'Daily screen-time limit', 'Weighted minutes of pointless screen time', ' min')}</div>
      <div class="card">${swRow('learn', 'Learn my hard times', 'Hard hours pay more and cost less. Easy hours do the opposite. Every value stays in hundreds.')}</div>`,
    future: () => `<div class="si-title">Future habits</div><div class="card"><p class="hint">Write habits you want to add later, such as exercise or sleep. We will add them one by one as you use the app.</p>
      ${S.ideas.map((t, i) => `<div class="hb-idea"><span>${esc(t)}</span><button class="ico-btn ico-del" data-di="${i}" title="Delete" aria-label="Delete idea">${svg('trash')}</button></div>`).join('')}
      <div class="hb-add"><input id="idn" maxlength="60" placeholder="For example: sleep by 10 pm"><button class="btn-primary hb" id="ida">Add</button></div></div>`,
    privacy: () => `<div class="si-title">Privacy and security</div><div class="card"><div class="sw-row"><div><div>PIN lock</div><div class="set-meta">${S.pin ? 'On' : 'Off'}</div></div><div style="display:flex;gap:8px">${S.pin ? '<button class="btn-line mini-btn" id="pc">Change</button><button class="btn-quiet mini-btn" id="pr">Remove</button>' : '<button class="btn-primary mini-btn" id="ps">Set a PIN</button>'}</div></div>
      ${stepRow('lockAfter', 'Lock after leaving', 'Seconds away before the PIN is asked', ' s')}</div>
      <div class="card"><p class="hint" style="margin:0">When you switch to another app, this app hides its content. Nothing leaves your phone unless you back it up.</p></div>`,
    backup: () => { const ds = daysSince(S.lastBackup); return `<div class="si-title">Backup and data</div><div class="card si-bk" style="text-align:center"><div class="si-hero"><div class="si-cap">Last copy</div><div class="si-big ${ds === null || ds > 7 ? 'warn' : ''}">${ds === null ? '–' : ds}<small>${ds === null ? '' : ds === 1 ? ' day ago' : ' days ago'}</small></div><div class="si-small">${ds === null ? 'You have not made a copy yet.' : 'Copies are locked with your passphrase.'}</div></div>
      <button class="btn-primary hb hb-full" id="bk-share">Back up now</button><button class="btn-line hb hb-full" id="bk-dl">Save to Downloads</button></div>
      <div class="si-links"><button class="link-btn" id="bk-rs">Restore from a copy…</button></div>`; }
  };
  return back() + (P[setPage] || P.look)();
}

/* ---------- render and events ---------- */
function render() {
  $$('.screen').forEach(s => s.classList.remove('on')); const el = $('#s-' + screen); el.classList.add('on');
  const sy = window.scrollY;
  el.innerHTML = ({ today: viewToday, arm: viewArmoury, prog: viewProgress, unp: viewUnplug, set: viewSettings })[screen]();
  $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.s === screen));
  document.body.classList.toggle('game', screen === 'today' || screen === 'arm'); document.body.classList.toggle('hard', screen === 'today' && curTier >= 2); $('#banner').style.display = 'none';
  const hs = todayState(); if (hs !== hubSt) { hubSt = hs; $('#hub').innerHTML = G.nemesis(hs); } $('#hub').classList.toggle('sleep', screen !== 'today');
  window.scrollTo(0, sy);
}
document.addEventListener('click', e => {
  const t = e.target, c = s => t.closest(s);
  let b;
  if (t.id === 'gsb' || c('#gsx')) return closeGS(); if (c('#ent')) return entriesSheet();
  if ((b = c('.nav-item'))) { tone(screen === b.dataset.s ? 400 : 520, .12, .05); vib(8); closeGS(); if (b.dataset.s === 'set' && screen === 'set') setPage = 'top'; screen = b.dataset.s; render(); window.scrollTo(0, 0); return; }
  if ((b = c('[data-to]'))) { screen = b.dataset.to; render(); window.scrollTo(0, 0); return; }
  if ((b = c('[data-buy]'))) return buyItem(b.dataset.buy); if ((b = c('[data-eq]'))) return equipItem(b.dataset.eq, true); if ((b = c('[data-ueq]'))) return equipItem(b.dataset.ueq, false);
  if ((b = c('[data-uc]'))) { ucSel = b.dataset.uc; return render(); }
  if ((b = c('[data-cw]'))) { const cc = S.ucats.find(x => x.id === b.dataset.cw); cc.w = Math.max(0.5, Math.min(3, cc.w + 0.5 * +b.dataset.d)); save(); return render(); }
  if ((b = c('[data-cdel]'))) { S.ucats = S.ucats.filter(x => x.id !== b.dataset.cdel); if (ucSel === b.dataset.cdel) ucSel = null; save(); return render(); }
  if (c('#cadd')) { const v = $('#cn').value.trim(); if (v) { S.ucats.push({ id: 'c' + Date.now(), n: v.slice(0, 20), w: 1 }); save(); render(); } return; }
  if ((b = c('[data-sg]'))) { const p = b.dataset.sg.split(':'), cc = S.ucats.find(x => x.id === p[0]); if (p[2] === 'ok') { const was = cc.w; cc.w = +p[3]; save(); render(); say('Weight changed to ' + cc.w + '.', () => { cc.w = was; save(); }); } else { S.dismiss[p[0] + p[1]] = Date.now(); save(); render(); } return; }
  if (c('#bd')) return logHab('d'); if (c('#by')) return logHab('y'); if (c('#br')) return rescue();
  if ((b = c('[data-ul]'))) return addUl(+b.dataset.ul); if (c('#ulc')) return customMinutes(); if (c('#ulz')) return addUl(0);
  if ((b = c('[data-dl]'))) { closeGS(); return delEntry('logs', +b.dataset.dl, 'It will be removed from your points.'); }
  if ((b = c('[data-du]'))) return delEntry('ul', +b.dataset.du, 'It will be removed from your screen time.');
  if ((b = c('[data-p]'))) { pTab = b.dataset.p; return render(); }
  if (c('#mp')) { monthOff--; return render(); } if (c('#mn')) { if (monthOff < 0) { monthOff++; render(); } return; }
  if ((b = c('[data-go]'))) { setPage = b.dataset.go; screen = 'set'; render(); window.scrollTo(0, 0); return; }
  if ((b = c('[data-lk]'))) { S.look = b.dataset.lk; save(); apply(); return render(); }
  if ((b = c('[data-ac]'))) { S.accent = b.dataset.ac; save(); apply(); return render(); }
  if ((b = c('[data-fn]'))) { S.flFont = b.dataset.fn; save(); apply(); return render(); }
  if ((b = c('[data-st]'))) { const k = b.dataset.st, d = +b.dataset.d, T = { base: [200, 200, 600], goal: [500, 500, 10000], target: [15, 15, 600], lockAfter: [5, 0, 300] }[k]; S[k] = Math.max(T[1], Math.min(T[2], S[k] + d * T[0])); save(); return render(); }
  if ((b = c('[data-di]'))) { S.ideas.splice(+b.dataset.di, 1); save(); return render(); }
  if (c('#ida')) { const v = $('#idn').value.trim(); if (v) { S.ideas.push(v); save(); render(); } return; }
  if (c('#ps')) return setPin(render);
  if (c('#pc')) return pinPad('Enter current PIN', (p, msg) => hash(p).then(h => { if (h === S.pin) setPin(render); else msg('Wrong PIN.'); }), true);
  if (c('#pr')) return pinPad('Enter PIN to remove it', (p, msg) => hash(p).then(h => { if (h === S.pin) { S.pin = null; save(); $('#lock').classList.remove('show'); render(); } else msg('Wrong PIN.'); }), true);
  if (c('#bk-share')) return backupSheet('share'); if (c('#bk-dl')) return backupSheet('download'); if (c('#bk-rs')) return $('#file-restore').click();
  if (c('#erase')) return confirmSheet({ title: 'Erase everything?', text: 'All entries on this phone will be deleted. This cannot be undone.', yes: 'Erase', danger: true, fn() {
    confirmSheet({ title: 'Are you sure?', text: 'Make a backup first if you may want your entries again.', yes: 'Yes, erase', danger: true, fn() { localStorage.removeItem(KEY); S = defaults(); save(); apply(); screen = 'today'; setPage = 'top'; render(); wizard(1); } }); } });
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset && t.dataset.pref) { S[t.dataset.pref] = t.checked; save(); apply(); render(); }
});
document.addEventListener('click', e => { if (e.target.closest('.orb')) say(pick(WISE.concat(TIPS))); });
document.addEventListener('input', e => { if (e.target.id === 'idn' && e.key === 'Enter') return; });
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'idn') $('#ida').click(); });

/* ---------- first-launch wizard (short) ---------- */
function wizard(step) {
  if (step === 1) { sheet(`<h2>Welcome</h2><p>This is a private space to build strong habits. Everything stays on your phone. What should I call you?</p><label class="field"><span>Your name</span><input id="wn" type="text" value="${esc(S.name)}" placeholder="Name"></label><div class="modal-actions"><button class="btn-primary hb" id="wx">Continue</button></div>`, true); $('#wx').onclick = () => { S.name = $('#wn').value.trim() || 'Friend'; save(); wizard(2); }; }
  else if (step === 2) { sheet(`<h2>How it works</h2><p>Your main habit is called <b>The Nemesis</b>. When you resist an urge, press <b>Ducked</b> and earn coins. When you give in, press <b>Yielded</b> and lose some. In steady hours Ducked pays twice what Yielded costs. In hard hours it pays even more and costs less, so every win is worth more when it is hardest. The coins buy gear for your hero, and your hero has 999 levels to climb.</p><p>A second habit, <b>Unplug</b>, helps you spend fewer minutes on pointless screen time.</p><div class="modal-actions"><button class="btn-primary hb" id="wx">Continue</button></div>`, true); $('#wx').onclick = () => wizard(3); }
  else if (step === 3) { sheet(`<h2>Your look</h2><p>Pick a colour. You can change it later in Settings.</p><div class="seg" id="wa"><button data-wa="sapphire" class="${S.accent === 'sapphire' ? 'on' : ''}">Sapphire</button><button data-wa="gold" class="${S.accent === 'gold' ? 'on' : ''}">Champagne</button></div><div class="modal-actions"><button class="btn-primary hb" id="wx">Continue</button></div>`, true);
    $$('[data-wa]').forEach(b => b.onclick = () => { S.accent = b.dataset.wa; save(); apply(); $$('[data-wa]').forEach(x => x.classList.toggle('on', x === b)); }); $('#wx').onclick = () => wizard(4); }
  else { sheet(`<h2>Protect your privacy</h2><p>A PIN keeps this app private. The app also hides its content when you switch to another app.</p><div class="modal-actions"><button class="btn-quiet hb" id="p2">Later</button><button class="btn-primary hb" id="p1">${svg('lock')}Set a PIN</button></div>`, true);
    const fin = () => { S.done = true; save(); closeSheet(); render(); say('Welcome, ' + S.name + '. One small win at a time.'); };
    $('#p1').onclick = () => { closeSheet(); S.done = true; save(); setPin(() => { render(); say('Welcome, ' + S.name + '. One small win at a time.'); }); }; $('#p2').onclick = fin; }
}

/* ---------- start ---------- */
if (window.GBtnLook) GBtnLook.config({ prefs: () => S, set: (k, v) => { S[k] = v; save(); }, render });
$('#world').innerHTML = G.scene(); 
apply(); render();
if (!S.done) wizard(1); else if (S.pin) lockNow();
window.__ht = { S: () => S, stats, score, build, tierNow, valuesNow, levelOf, needAt, ledger, riskAt, tierValues };
})();

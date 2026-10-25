/* Rustam's Habit Tracker v1.1: private, offline, on this phone only.
   Look: shared style files (style.css, flagship.css, buttons.css, btnlook.js). Words follow DESIGN-LANGUAGE.md section 10. */
(function () {
'use strict';
const KEY = 'ht_v1', VERSION = '1.1';
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- state ---------- */
function defaults() {
  return { name: '', follow: true, look: 'flagship', accent: 'sapphire', flFont: 'system', glow: false, pin: null, salt: Math.random().toString(36).slice(2), lockAfter: 15,
    yv: 1, goal: 20, target: 120, logs: [], ul: [], ideas: [], done: false, sound: true, vib: true, lastBackup: 0, btnAccent: 9, btnBlack: 0 };
}
let S = load();
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return Object.assign(defaults(), JSON.parse(raw));
    const old = localStorage.getItem('rht.v1');   // version 1.0 data
    if (old) { const o = JSON.parse(old), d = defaults(); ['name', 'yv', 'goal', 'target', 'logs', 'ul', 'ideas', 'pin', 'salt', 'lockAfter', 'sound', 'vib'].forEach(k => { if (o[k] !== undefined) d[k] = o[k]; }); d.done = !!o.done; return d; }
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

/* ---------- scoring ---------- */
const dv = () => S.yv * 2;
function build() {
  const I = {}, g = k => I[k] || (I[k] = { d: 0, y: 0, m: 0, hasUl: false });
  S.logs.forEach(l => { const o = g(dk(l.t)); if (l.k === 'd') o.d++; else o.y++; });
  S.ul.forEach(u => { const o = g(dk(u.t)); o.m += u.m; o.hasUl = true; });
  return I;
}
const ulScore = o => (o && o.hasUl) ? Math.round(Math.max(0, Math.min(1, (S.target - o.m) / S.target)) * 10) : 0;
const score = o => o ? o.d * dv() - o.y * S.yv + ulScore(o) : 0;
function stats() {
  const I = build(), keys = Object.keys(I).sort(); let total = 0, best = 0, D = 0, Y = 0;
  keys.forEach(k => { const s = score(I[k]); total += Math.max(0, s); best = Math.max(best, s); D += I[k].d; Y += I[k].y; });
  let streak = 0, k = todayK(); if (!(I[k] && score(I[k]) > 0)) k = addDays(k, -1);
  while (I[k] && score(I[k]) > 0) { streak++; k = addDays(k, -1); }
  const clear = keys.filter(x => I[x].d > 0 && I[x].y === 0).length;
  const lvl = Math.floor(Math.sqrt(total / 12)) + 1, cur = Math.pow(lvl - 1, 2) * 12, nxt = Math.pow(lvl, 2) * 12;
  return { I, total, best, D, Y, streak, clear, lvl, prog: (total - cur) / (nxt - cur), toNext: Math.ceil(nxt - total) };
}
const LVL = ['Seed', 'Sprout', 'Sapling', 'Young tree', 'Strong tree', 'Oak', 'Forest', 'Mountain', 'Sky', 'Star'];
const lvlName = n => LVL[Math.min(n - 1, LVL.length - 1)];
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
  t.innerHTML = esc(text) + (undo ? ' <button class="mini-btn" id="t-undo">Undo</button>' : '');
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
  const l = { id: Date.now() + Math.random(), t: Date.now(), k }; if (viaRescue) l.r = 1; S.logs.push(l); save();
  if (k === 'd') { tone(660, .35); setTimeout(() => tone(880, .4), 150); vib(18); render(); say(pick(KIND_D) + ' +' + dv()); }
  else { tone(300, .5, .05); vib([30, 60, 30]); render(); yieldSheet(); }
}
function yieldSheet() {
  const h = new Date().getHours(), late = h >= 16 || h < 5;
  sheet(`<h2>It happened</h2><p>${esc(pick(KIND_Y))}</p><div class="card" style="margin:0 0 12px"><div class="hint">Try this now</div><div style="margin-top:6px;font-size:1.5rem;font-weight:300">${esc(pick(TIPS))}</div></div>${late ? '<p>Evenings and nights are the hardest hours. Charge your phone away from your bed tonight.</p>' : ''}<div class="modal-actions"><button class="btn-quiet hb" id="y2">Close</button><button class="btn-primary hb" id="y1">${svg('wind')}Start Urge Rescue</button></div>`);
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
  S.ul.push({ id: Date.now() + Math.random(), t: Date.now(), m }); save(); tone(520, .3); vib(12); render();
  const o = build()[todayK()], left = S.target - o.m;
  say(left > 0 ? 'Added. ' + left + ' minutes left before your daily limit.' : 'Over the limit today. Tomorrow is a fresh page.');
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
      confirmSheet({ title: 'Replace your data?', text: 'Your current entries will be replaced by this copy.', yes: 'Replace', danger: true, fn() { S = Object.assign(defaults(), d); save(); apply(); render(); say('Backup restored.'); } }); };
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

function viewToday() {
  const st = stats(), k = todayK(), o = st.I[k] || { d: 0, y: 0, m: 0, hasUl: false }, sc = score(o), h = new Date().getHours(), dh = dangerInfo();
  const hard = h >= 16 || h < 5;
  let win = hard ? 'Hard hours: after 4 pm and late at night.' : 'Calm hours. A good time to plan your evening.';
  if (dh.n >= 5) win = 'Your hardest hour is ' + hr12(dh.c.indexOf(Math.max.apply(null, dh.c))) + '. Plan something before it.';
  const logs = S.logs.filter(l => dk(l.t) === k), uls = S.ul.filter(u => dk(u.t) === k);
  const pct = Math.min(1, o.m / S.target), over = o.m > S.target;
  const prevS = addDays(weekStart(k), -7); let pm = 0, pAny = false, ws = 0;
  weekDays(prevS).forEach(x => { if (x.o && x.o.hasUl) { pm += x.o.m; pAny = true; } });
  weekDays(k).forEach(x => { if (x.o && x.o.hasUl) ws += x.o.m; });
  const wT = pAny ? Math.round(pm * 0.9) : S.target * 7;
  let out = `<div class="hint" style="margin:0 4px 10px">${greet()}</div>`;
  out += `<div class="card"><div class="hb-cap">Points today</div><div class="hb-row"><div class="hb-grow"><div class="hb-big">${sc}<small>of ${S.goal}</small></div>
    <div class="hb-chips"><span class="hb-chip">${svg('flame')}${st.streak} day streak</span><span class="hb-chip">${svg('star')}Level ${st.lvl} · ${lvlName(st.lvl)}</span></div></div>
    <div class="hb-ring">${arc(sc / S.goal, 'var(--blue-b)')}<div class="ct">${Math.round(Math.max(0, sc) / S.goal * 100)}%</div></div></div>
    <div class="hint" style="margin-top:12px">${st.toNext} points to the next level</div><div class="hb-bar"><i style="width:${Math.round(st.prog * 100)}%"></i></div></div>`;
  out += `<div class="card"><div class="flex-between"><h3 style="margin:0">The Nemesis</h3><span class="hint">Resist +${dv()} · Yield −${S.yv}</span></div>
    <div class="hb-actions"><button class="btn-primary hb hb-main" id="bd">Ducked</button><button class="btn-quiet hb hb-main" id="by">Yielded</button></div>
    <div class="hb-meta"><span class="hb-pos">Ducked ${o.d}</span><span style="text-align:center">${esc(win)}</span><span class="hb-neg">Yielded ${o.y}</span></div>
    <button class="btn-line hb hb-full" id="br">${svg('wind')}Urge Rescue</button></div>`;
  out += `<div class="card wd-card"><div class="wd-cap">Unplug</div><div class="wd-main"><span class="wd-it">${svg('phone', 'stroke="#fff" width="22" height="22"')}</span>
    <div class="wd-mid"><div class="wd-big">${o.m}</div><div class="wd-un">of ${S.target} minutes of pointless screen time</div></div>
    <div class="hb-ring" style="width:52px;height:52px">${arc(pct, over ? '#d23b34' : 'var(--blue-b)')}</div></div>
    <div class="hb-bar ${over ? 'r' : ''}"><i style="width:${Math.round(pct * 100)}%"></i></div>
    <div class="hb-chiprow"><button class="mini-btn" data-ul="15">+15</button><button class="mini-btn" data-ul="30">+30</button><button class="mini-btn" data-ul="60">+60</button><button class="btn-quiet mini-btn" id="ulc">Other</button><button class="btn-quiet mini-btn" id="ulz">Zero today</button></div>
    <div class="wd-sub"><span>This week: ${ws} of ${wT} minutes</span><b>${pAny ? '10% below last week' : 'first week target'}</b></div>
    <div class="hb-bar ${ws > wT ? 'r' : 'g'}"><i style="width:${Math.min(100, Math.round(ws / Math.max(1, wT) * 100))}%"></i></div>
    <div class="hint" style="margin-top:8px">Unplug score today: ${o.hasUl ? ulScore(o) : 0} of 10</div></div>`;
  if (logs.length || uls.length) {
    const all = logs.map(l => ({ t: l.t, l })).concat(uls.map(u => ({ t: u.t, u }))).sort((a, b) => b.t - a.t);
    out += `<div class="card"><details><summary class="hint" style="cursor:pointer">Today's entries · ${all.length}</summary><div style="margin-top:8px">`;
    all.forEach(x => {
      if (x.l) { const d = x.l.k === 'd'; out += `<div class="hb-log"><span class="t">${clock(x.t)}</span><span class="n">${d ? 'Ducked' + (x.l.r ? ' (rescue)' : '') : 'Yielded'}</span><span class="p ${d ? 'hb-pos' : 'hb-neg'}">${d ? '+' + dv() : '−' + S.yv}</span><button class="ico-btn ico-del" data-dl="${x.l.id}" title="Delete" aria-label="Delete entry">${svg('trash')}</button></div>`; }
      else out += `<div class="hb-log"><span class="t">${clock(x.t)}</span><span class="n">Screen time</span><span class="p">${x.u.m} min</span><button class="ico-btn ico-del" data-du="${x.u.id}" title="Delete" aria-label="Delete entry">${svg('trash')}</button></div>`;
    });
    out += '</div></details></div>';
  }
  return out;
}

function viewProgress() {
  const st = stats(), I = st.I, k = todayK(); let out = '';
  out += `<div class="seg" id="pseg" style="margin-bottom:14px"><button data-p="week" class="${pTab === 'week' ? 'on' : ''}">Week</button><button data-p="month" class="${pTab === 'month' ? 'on' : ''}">Month</button></div>`;
  if (pTab === 'week') {
    const days = weekDays(k), prev = weekDays(addDays(weekStart(k), -7)), n = days.filter(x => x.k <= k).length; let tot = 0, ptot = 0, mx = 1;
    days.forEach(x => { const s = score(x.o); tot += s; mx = Math.max(mx, Math.abs(s)); }); prev.forEach((x, i) => { if (i < n) ptot += score(x.o); });
    const diff = tot - ptot, L = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    out += `<div class="card"><div class="hb-cap">This week</div><div class="hb-row"><div class="hb-big">${tot}<small>points</small></div><div class="hint hb-grow" style="text-align:right;color:${diff >= 0 ? '#1f9d63' : 'var(--warning)'}">${diff === 0 ? '– same as last week' : (diff > 0 ? '▲ ' : '▼ ') + Math.abs(diff) + ' vs same days last week'}</div></div>
      <div class="hb-wk">${days.map((x, i) => { const s = score(x.o), hh = s === 0 ? 4 : Math.round(Math.abs(s) / mx * 88) + 4; return `<div><span>${s || ''}</span><b class="${s < 0 ? 'n' : s === 0 ? 'z' : ''}" style="height:${hh}px"></b>${L[i]}</div>`; }).join('')}</div></div>`;
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
      <div class="hb-row" style="margin:14px 0 4px"><div class="hb-big">${mt}<small>points</small></div></div><div class="hint">Ducked ${mD} · Yielded ${mY}</div><div class="hb-cal">${cells}</div>
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
  return out;
}

/* ---------- Settings (Apple-like: state first, then rows; one page per group) ---------- */
const swRow = (k, t, d) => `<div class="sw-row"><div><div>${t}</div>${d ? `<div class="set-meta">${d}</div>` : ''}</div><label class="switch"><input type="checkbox" data-pref="${k}" ${S[k] ? 'checked' : ''}><i></i></label></div>`;
const stepRow = (k, t, d, u) => `<div class="sw-row"><div><div>${t}</div>${d ? `<div class="set-meta">${d}</div>` : ''}</div><div class="hb-stepper"><button class="mini-btn" data-st="${k}" data-d="-1" aria-label="Less">−</button><b>${S[k]}${u || ''}</b><button class="mini-btn" data-st="${k}" data-d="1" aria-label="More">+</button></div></div>`;
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
      <div class="si-group">${row('points', 'star', '#e0a03a', 'Points and limits', '+' + dv() + ' / −' + S.yv)}${row('future', 'list', '#2fa36b', 'Future habits', S.ideas.length ? String(S.ideas.length) : '')}</div>
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
    points: () => `<div class="si-title">Points and limits</div><div class="card">${stepRow('yv', 'Cost of a Yielded', 'Ducked earns twice this: +' + dv())}${stepRow('goal', 'Daily points goal', 'Fills your ring')}${stepRow('target', 'Daily screen-time limit', 'Minutes of pointless screen time', ' min')}</div>`,
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
  el.innerHTML = screen === 'today' ? viewToday() : screen === 'prog' ? viewProgress() : viewSettings();
  $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.s === screen));
  $('#banner').style.display = screen === 'today' ? '' : 'none'; if (screen === 'today') renderBanner();
  window.scrollTo(0, sy);
}
document.addEventListener('click', e => {
  const t = e.target, c = s => t.closest(s);
  let b;
  if ((b = c('.nav-item'))) { if (b.dataset.s === 'set' && screen === 'set') setPage = 'top'; screen = b.dataset.s; render(); window.scrollTo(0, 0); return; }
  if (c('#bd')) return logHab('d'); if (c('#by')) return logHab('y'); if (c('#br')) return rescue();
  if ((b = c('[data-ul]'))) return addUl(+b.dataset.ul); if (c('#ulc')) return customMinutes(); if (c('#ulz')) return addUl(0);
  if ((b = c('[data-dl]'))) return delEntry('logs', +b.dataset.dl, 'It will be removed from your points.');
  if ((b = c('[data-du]'))) return delEntry('ul', +b.dataset.du, 'It will be removed from your screen time.');
  if ((b = c('[data-p]'))) { pTab = b.dataset.p; return render(); }
  if (c('#mp')) { monthOff--; return render(); } if (c('#mn')) { if (monthOff < 0) { monthOff++; render(); } return; }
  if ((b = c('[data-go]'))) { setPage = b.dataset.go; screen = 'set'; render(); window.scrollTo(0, 0); return; }
  if ((b = c('[data-lk]'))) { S.look = b.dataset.lk; save(); apply(); return render(); }
  if ((b = c('[data-ac]'))) { S.accent = b.dataset.ac; save(); apply(); return render(); }
  if ((b = c('[data-fn]'))) { S.flFont = b.dataset.fn; save(); apply(); return render(); }
  if ((b = c('[data-st]'))) { const k = b.dataset.st, d = +b.dataset.d, stp = { yv: 1, goal: 5, target: 15, lockAfter: 5 }[k], lo = { yv: 1, goal: 5, target: 15, lockAfter: 0 }[k], hi = { yv: 5, goal: 200, target: 600, lockAfter: 300 }[k]; S[k] = Math.max(lo, Math.min(hi, S[k] + d * stp)); save(); return render(); }
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
$('#orb').addEventListener('click', () => say(pick(WISE.concat(TIPS))));
document.addEventListener('input', e => { if (e.target.id === 'idn' && e.key === 'Enter') return; });
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'idn') $('#ida').click(); });

/* ---------- first-launch wizard (short) ---------- */
function wizard(step) {
  if (step === 1) { sheet(`<h2>Welcome</h2><p>This is a private space to build strong habits. Everything stays on your phone. What should I call you?</p><label class="field"><span>Your name</span><input id="wn" type="text" value="${esc(S.name)}" placeholder="Name"></label><div class="modal-actions"><button class="btn-primary hb" id="wx">Continue</button></div>`, true); $('#wx').onclick = () => { S.name = $('#wn').value.trim() || 'Friend'; save(); wizard(2); }; }
  else if (step === 2) { sheet(`<h2>How it works</h2><p>Your main habit is called <b>The Nemesis</b>. When you resist an urge, press <b>Ducked</b> and earn ${dv()} points. When you give in, press <b>Yielded</b> and lose ${S.yv}. Resisting is worth twice as much, so progress is always possible.</p><p>A second habit, <b>Unplug</b>, helps you spend fewer minutes on pointless screen time.</p><div class="modal-actions"><button class="btn-primary hb" id="wx">Continue</button></div>`, true); $('#wx').onclick = () => wizard(3); }
  else if (step === 3) { sheet(`<h2>Your look</h2><p>Pick a colour. You can change it later in Settings.</p><div class="seg" id="wa"><button data-wa="sapphire" class="${S.accent === 'sapphire' ? 'on' : ''}">Sapphire</button><button data-wa="gold" class="${S.accent === 'gold' ? 'on' : ''}">Champagne</button></div><div class="modal-actions"><button class="btn-primary hb" id="wx">Continue</button></div>`, true);
    $$('[data-wa]').forEach(b => b.onclick = () => { S.accent = b.dataset.wa; save(); apply(); $$('[data-wa]').forEach(x => x.classList.toggle('on', x === b)); }); $('#wx').onclick = () => wizard(4); }
  else { sheet(`<h2>Protect your privacy</h2><p>A PIN keeps this app private. The app also hides its content when you switch to another app.</p><div class="modal-actions"><button class="btn-quiet hb" id="p2">Later</button><button class="btn-primary hb" id="p1">${svg('lock')}Set a PIN</button></div>`, true);
    const fin = () => { S.done = true; save(); closeSheet(); render(); say('Welcome, ' + S.name + '. One small win at a time.'); };
    $('#p1').onclick = () => { closeSheet(); S.done = true; save(); setPin(() => { render(); say('Welcome, ' + S.name + '. One small win at a time.'); }); }; $('#p2').onclick = fin; }
}

/* ---------- start ---------- */
if (window.GBtnLook) GBtnLook.config({ prefs: () => S, set: (k, v) => { S[k] = v; save(); }, render });
apply(); render();
if (!S.done) wizard(1); else if (S.pin) lockNow();
window.__ht = { S: () => S, stats, score, build };
})();

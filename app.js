/* Lauréat — logique de l'application (révision du test de juriste en droit social) */
'use strict';
const KEY = 'laureat_v1';
const EXAM = BUILD.exam;
const INTERVALS = [0, 1, 2, 4, 7, 12]; // jours avant la prochaine révision, selon la boîte (0 à 5)
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const MOISC = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const JOURSC = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
const GRID = [
  ['QUI', 'Qualifier les personnes : statut, ancienneté, rémunération, protection, employeur.'],
  ['QUOI', 'Isoler chaque question de droit et la reformuler précisément.'],
  ['RÈGLE', 'Citer la source exacte et sa place dans la hiérarchie des normes.'],
  ['COMBIEN', 'Appliquer et chiffrer : préavis, indemnité, allocation ; montrer le calcul.'],
  ['QUAND', 'Le délai : prescription ou recours, et son point de départ.'],
  ['COMMENT', "Le conseil concret : pièces, mise en demeure, requête, réflexe sécurité sociale."]
];

/* ---------- utilitaires ---------- */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function iso(d) { const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return z.toISOString().slice(0, 10); }
function parse(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
function today() { return iso(new Date()); }
function addDays(s, n) { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); }
function daysBetween(a, b) { return Math.round((parse(b) - parse(a)) / 864e5); }
function dnum(d) { return d.getDate() === 1 ? '1er' : d.getDate(); }
function dlong(s) { const d = parse(s); return `${JOURS[d.getDay()]} ${dnum(d)} ${MOIS[d.getMonth()]}`; }
function dshort(s) { const d = parse(s); return `${JOURSC[d.getDay()]} ${dnum(d)} ${MOISC[d.getMonth()]}`; }
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function shuffle(a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
function pct(a, b) { return b ? Math.round(100 * a / b) : 0; }
function strip(h) { const d = document.createElement('div'); d.innerHTML = h; return (d.textContent || '').replace(/\s+/g, ' ').trim(); }
function norm(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
function plural(n, one, many) { return n + ' ' + (n > 1 ? many : one); }
function clock(s) { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = String(s % 60).padStart(2, '0'); return h ? `${h}:${String(m).padStart(2, '0')}:${x}` : `${m}:${x}`; }
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 2600); }
function go(h, replace) { const u = '#/' + h; if (replace) location.replace(u); else location.hash = u; }
function view(html) { $('#view').innerHTML = html; }

/* ---------- icônes ---------- */
const ICONS = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/><path d="M10 20v-5h4v5"/>',
  cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  book: '<path d="M12 6.5C10.5 5 8 4.5 4 4.5v14c4 0 6.5.5 8 2 1.5-1.5 4-2 8-2v-14c-4 0-6.5.5-8 2Z"/><path d="M12 6.5v14"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
  sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  laurel: '<path d="M12 21c-4.5-1.5-7.5-5.5-7.5-10.5M12 21c4.5-1.5 7.5-5.5 7.5-10.5"/><path d="M6 15c-1.5 0-2.5-1-3-2.5 1.5-.2 2.6.4 3 2.5ZM5 11c-1.4-.5-2-1.7-2-3.2 1.4.4 2.2 1.4 2 3.2ZM7.5 18.3c-1.6.4-2.9-.2-3.7-1.4 1.5-.5 2.8-.1 3.7 1.4ZM18 15c1.5 0 2.5-1 3-2.5-1.5-.2-2.6.4-3 2.5ZM19 11c1.4-.5 2-1.7 2-3.2-1.4.4-2.2 1.4-2 3.2ZM16.5 18.3c1.6.4 2.9-.2 3.7-1.4-1.5-.5-2.8-.1-3.7 1.4Z"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>'
};
const icon = (k, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[k] || ''}</svg>`;

/* ---------- état (stocké sur l'appareil) ---------- */
function blank() { return { v: 1, read: {}, cards: {}, qcm: {}, wrong: {}, casus: {}, days: {}, exams: [], exam: null, prefs: { theme: 'auto', fs: 100, body: 'sans' } }; }
function load() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(KEY)); } catch (e) { s = null; }
  const b = blank();
  if (!s || typeof s !== 'object') return b;
  const o = Object.assign(b, s);
  o.prefs = Object.assign(blank().prefs, s.prefs || {});
  return o;
}
let S = load();
let saveFailed = false;
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { if (!saveFailed) toast("Stockage indisponible : la progression n'est pas enregistrée."); saveFailed = true; }
}

/* ---------- accès au contenu ---------- */
const READY = () => MODULES.filter(m => m.ready);
const MOD = n => MODULES.find(m => m.n === +n);
function allCards() {
  const out = [];
  READY().forEach(m => {
    m.memo.forEach(c => out.push(Object.assign({ kind: 'memo', mod: m.n }, c)));
    m.lex.forEach(c => out.push(Object.assign({ kind: 'lex', mod: m.n }, c)));
  });
  return out;
}
const allQcm = () => READY().flatMap(m => m.qcm.map(q => Object.assign({ mod: m.n }, q)));
const allCasus = () => READY().flatMap(m => m.casus.map(c => Object.assign({ mod: m.n }, c)));
const allLex = () => READY().flatMap(m => m.lex.map(l => Object.assign({ mod: m.n }, l)));
const qById = id => allQcm().find(q => q.id === id);
const lexById = id => allLex().find(l => l.id === id);
const casById = id => allCasus().find(c => c.id === id);
const box = id => (S.cards[id] || {}).b || 0;
const isDue = c => { const st = S.cards[c.id]; return !st || !st.due || st.due <= today(); };
const mastered = c => box(c.id) >= 3;
const EV = { ko: 'À revoir', part: 'Partiellement', ok: 'Maîtrisé' };

function progress(m) {
  if (!m.ready) return null;
  const read = m.sections.filter(s => S.read[s.id]).length;
  const cards = m.memo.concat(m.lex), known = cards.filter(mastered).length;
  const q = S.qcm[m.n], best = q ? q.best : 0;
  const cas = m.casus.reduce((a, c) => a + ({ ok: 1, part: 0.5 }[(S.casus[c.id] || {}).ev] || 0), 0);
  const parts = [m.sections.length ? read / m.sections.length : 0, cards.length ? known / cards.length : 0, m.qcm.length ? best / m.qcm.length : 0, m.casus.length ? cas / m.casus.length : 0];
  return { read, nsec: m.sections.length, known, ncards: cards.length, best, nq: m.qcm.length, cas, ncas: m.casus.length, all: Math.round(100 * parts.reduce((a, b) => a + b, 0) / 4) };
}
function bar(p, cls = '') { return `<div class="bar ${cls}"><i style="width:${Math.max(0, Math.min(100, p))}%"></i></div>`; }

/* ---------- apparence ---------- */
function applyPrefs() {
  const r = document.documentElement, p = S.prefs;
  if (p.theme === 'auto') r.removeAttribute('data-theme'); else r.dataset.theme = p.theme;
  r.dataset.body = p.body;
  r.style.fontSize = p.fs + '%';
  const dark = p.theme === 'nuit' || (p.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  const meta = $('meta[name=theme-color]'); if (meta) meta.content = dark ? '#12141a' : '#f6f1e7';
}

/* ---------- minuteries ---------- */
let TIMERS = [];
function every(ms, fn) { const id = setInterval(fn, ms); TIMERS.push(id); return id; }
function stopTimers() { TIMERS.forEach(clearInterval); TIMERS = []; CT = null; }

/* ---------- navigation ---------- */
const TABS = [['', 'Accueil', 'home'], ['plan', 'Programme', 'cal'], ['modules', 'Modules', 'book'], ['train', 'Entraînement', 'target'], ['reglages', 'Réglages', 'sliders']];
function renderNav() {
  $('#tabs').innerHTML = `<div class="brand"><img src="icon-192.png" alt=""><span>Lauréat</span></div>` +
    TABS.map(([h, l, i]) => `<a href="#/${h}" data-tab="${h}">${icon(i)}<span>${l}</span></a>`).join('');
}
function setTab(h) {
  const top = h.split('/')[0];
  const t = { m: 'modules', cards: 'train', qcm: 'train', casus: 'train', exam: 'train' }[top] ?? top;
  $$('#tabs a').forEach(a => a.classList.toggle('on', a.dataset.tab === t));
}
const ROUTES = [
  [/^$/, home], [/^plan$/, plan], [/^modules$/, modules],
  [/^m\/(\d+)(?:\/(cours|memo|casus|qcm|lexique))?(?:\/(.+))?$/, moduleView],
  [/^train$/, train], [/^cards\/(.+)$/, cardsSession], [/^qcm\/(.+)$/, qcmSession], [/^casus\/(.+)$/, casusView],
  [/^exam$/, examSetup], [/^exam\/run$/, examRun], [/^exam\/result$/, examResult], [/^reglages$/, settings]
];
let lastRoute = null;
function router() {
  const h = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  for (const [re, fn] of ROUTES) {
    const m = h.match(re);
    if (m) {
      stopTimers();
      const same = lastRoute === h;
      lastRoute = h;
      fn(...m.slice(1));
      setTab(h);
      if (!same && !m[3]) window.scrollTo(0, 0);
      return;
    }
  }
  go('', true);
}

/* ---------- accueil ---------- */
function home() {
  const t = today(), j = daysBetween(t, EXAM);
  const big = j > 1 ? `J-${j}` : j === 1 ? 'Demain' : j === 0 ? 'Jour J' : 'Accompli';
  const sub = j >= 0 ? `Épreuve le ${dlong(EXAM)} 2026` : "L'épreuve a eu lieu le jeudi 10 décembre 2026";
  const e = CALENDAR.find(c => c.date === t), next = e || CALENDAR.find(c => c.date > t);
  const cards = allCards(), due = cards.filter(isDue).length, ready = READY();
  const wrong = allQcm().filter(q => S.wrong[q.id]).length;
  let todayHtml = '';
  if (next) {
    const btns = next.mods.map(MOD).filter(Boolean).slice(0, 5).map(m => m.ready
      ? `<a class="btn ${next.mods.length === 1 ? 'pri' : ''}" href="#/m/${m.n}">Module ${m.n}</a>`
      : `<span class="chip">Module ${m.n} : ${m.avail <= t ? 'en préparation' : 'disponible le ' + dshort(m.avail)}</span>`).join('');
    const extra = next.kind === 'mixte' ? '<a class="btn pri" href="#/casus/rand">Casus au hasard</a>' : next.kind === 'exam' ? '<a class="btn pri" href="#/exam">Examen blanc</a>' : '';
    const done = !!S.days[next.date];
    todayHtml = `<section class="card today ${done ? 'done' : ''}">
      <div class="kick">${e ? "Aujourd'hui" : 'Prochaine étape'} · ${dlong(next.date)}</div>
      <h2>${esc(next.task)}</h2>
      ${next.rev && next.rev !== '—' ? `<p class="mut">Relecture espacée : ${esc(next.rev)}</p>` : ''}
      <div class="row">${extra}${btns}${e ? `<button class="btn ${done ? 'ok' : ''}" data-a="day" data-d="${next.date}">${icon('check')}${done ? 'Journée faite' : 'Marquer la journée faite'}</button>` : ''}</div>
    </section>`;
  }
  const mods = MODULES.map(m => {
    const p = progress(m);
    if (!p) return `<div class="mrow off"><span class="mn">${m.n}</span><span class="mt">${esc(m.title)}</span><span class="mut sm">${m.avail <= t ? 'en préparation' : dshort(m.avail)}</span></div>`;
    return `<a class="mrow" href="#/m/${m.n}"><span class="mn">${m.n}</span><span class="mt">${esc(m.title)}${bar(p.all)}</span><span class="pc">${p.all} %</span></a>`;
  }).join('');
  const q = QUOTES[((daysBetween('2026-11-21', t) % QUOTES.length) + QUOTES.length) % QUOTES.length];
  view(`
    <section class="hero">
      <div class="cd"><div class="cdn">${big}</div><div class="cds">${sub}</div></div>
      <img class="hero-ic" src="icon-192.png" alt="">
    </section>
    ${todayHtml}
    <div class="tiles">
      <a class="card tile" href="#/cards/due"><div class="tn">${due}</div><div class="tl">${due > 1 ? 'cartes à revoir' : 'carte à revoir'}</div><div class="mut sm">Fiches mémo et lexique</div></a>
      <a class="card tile" href="#/qcm/mix-10"><div class="tn">${Math.min(10, allQcm().length)}</div><div class="tl">questions de QCM</div><div class="mut sm">Tirées au hasard</div></a>
      <a class="card tile" href="#/qcm/err"><div class="tn">${wrong}</div><div class="tl">${wrong > 1 ? 'erreurs à reprendre' : 'erreur à reprendre'}</div><div class="mut sm">QCM manqués</div></a>
      <a class="card tile" href="#/exam"><div class="tn">${icon('clock')}</div><div class="tl">Examen blanc</div><div class="mut sm">En temps limité</div></a>
    </div>
    <section class="card"><h3>Vos modules <span class="mut sm">${ready.length} sur ${MODULES.length} disponibles</span></h3><div class="mlist">${mods}</div></section>
    <blockquote class="quote"><p>« ${esc(q[0]).replace(' / ', '<br>')} »</p><footer>${esc(q[1])}</footer></blockquote>`);
}

/* ---------- programme ---------- */
function plan() {
  const t = today();
  const items = CALENDAR.map(c => {
    const cls = [c.date === t ? 'now' : '', c.date < t ? 'past' : '', S.days[c.date] ? 'done' : '', c.kind === 'jourj' ? 'jj' : ''].join(' ');
    const links = c.mods.map(MOD).filter(m => m && m.ready).slice(0, 2).map(m => `<a class="chip link" href="#/m/${m.n}">Module ${m.n}</a>`).join('');
    return `<li class="cal-i ${cls}">
      ${c.kind === 'jourj' ? `<span class="ck jj">${icon('laurel')}</span>` : `<button class="ck" data-a="day" data-d="${c.date}" aria-label="Marquer le ${dlong(c.date)} comme fait">${icon('check')}</button>`}
      <div class="cal-b"><div class="cal-d">${dshort(c.date)}${c.date === t ? " · aujourd'hui" : ''}</div><div class="cal-t">${esc(c.task)}</div>${c.rev && c.rev !== '—' ? `<div class="cal-r">Relecture : ${esc(c.rev)}</div>` : ''}</div>
      <div class="cal-l">${links}</div></li>`;
  }).join('');
  const doneN = CALENDAR.filter(c => S.days[c.date]).length;
  view(`<h1>Programme</h1>
    <p class="lead">Dix-huit jours d'étude et une veille d'armes : ${doneN} ${doneN > 1 ? 'journées faites' : 'journée faite'} sur ${CALENDAR.length - 1}.</p>
    <section class="card"><h2>Calendrier</h2><ol class="cal">${items}</ol></section>
    ${PLAN.map((s, i) => `<details class="card acc" ${i === 2 ? 'open' : ''}><summary><h2>${esc(s.title)}</h2></summary><div class="prose">${s.html}</div></details>`).join('')}`);
}

/* ---------- modules et recherche ---------- */
function modules() {
  const t = today();
  const cards = MODULES.map(m => {
    const p = progress(m);
    if (!p) return `<div class="card mod off"><div class="mnum">${m.n}</div><div class="mbody"><h3>${esc(m.title)}</h3><p>${esc(m.contenu)}</p><div class="meta">${m.avail <= t ? 'En préparation' : 'Disponible le ' + dlong(m.avail)}</div></div></div>`;
    return `<a class="card mod" href="#/m/${m.n}"><div class="mnum">${m.n}</div><div class="mbody"><h3>${esc(m.title)}</h3><p>${esc(m.contenu)}</p>${bar(p.all)}
      <div class="meta">Lecture ${p.read}/${p.nsec} · Cartes ${p.known}/${p.ncards} · QCM ${p.best}/${p.nq} · Casus ${p.cas}/${p.ncas}</div></div></a>`;
  }).join('');
  view(`<h1>Modules</h1>
    <div class="search">${icon('target')}<input id="q" type="search" placeholder="Rechercher : prescription, art. 728, auditorat…" autocomplete="off"></div>
    <div id="results"></div>
    <div class="mgrid">${cards}</div>`);
}
function search(qs) {
  const out = $('#results'); if (!out) return;
  const q = norm(qs.trim());
  if (q.length < 2) { out.innerHTML = ''; return; }
  const res = [];
  const snip = (txt) => { const n = norm(txt), i = n.indexOf(q); if (i < 0) return esc(txt.slice(0, 140)); const a = Math.max(0, i - 60); return (a ? '…' : '') + esc(txt.slice(a, i)) + '<mark>' + esc(txt.slice(i, i + q.length)) + '</mark>' + esc(txt.slice(i + q.length, i + q.length + 80)) + '…'; };
  READY().forEach(m => {
    m.sections.forEach(s => { const txt = s.title + ' ' + strip(s.html); if (norm(txt).includes(q)) res.push([`#/m/${m.n}/cours/${s.id}`, `Module ${m.n} · cours`, s.title, snip(strip(s.html))]); });
    m.lex.forEach(l => { const txt = l.f + ' ' + strip(l.b); if (norm(txt).includes(q)) res.push([`#/m/${m.n}/lexique/${l.id}`, `Module ${m.n} · lexique`, l.f, snip(strip(l.b))]); });
    m.memo.forEach(c => { const txt = strip(c.f) + ' — ' + strip(c.b); if (norm(txt).includes(q)) res.push([`#/m/${m.n}/memo`, `Module ${m.n} · fiche mémo`, strip(c.f), snip(txt)]); });
    m.casus.forEach(c => { const txt = c.title + ' ' + strip(c.enonce) + ' ' + strip(c.corrige); if (norm(txt).includes(q)) res.push([`#/casus/${c.id}`, `Module ${m.n} · casus ${c.num}`, c.title, snip(strip(c.enonce))]); });
  });
  out.innerHTML = res.length
    ? `<div class="card res"><div class="kick">${plural(res.length, 'résultat', 'résultats')}</div>${res.slice(0, 40).map(r => `<a class="ri" href="${r[0]}"><span class="mut sm">${esc(r[1])}</span><strong>${esc(r[2])}</strong><span class="sm">${r[3]}</span></a>`).join('')}</div>`
    : `<div class="card res"><p class="mut">Aucun résultat pour « ${esc(qs.trim())} ».</p></div>`;
}

function moduleView(n, tab, sub) {
  const m = MOD(n);
  if (!m) return go('modules', true);
  if (!m.ready) {
    view(`<a class="back" href="#/modules">‹ Modules</a><h1>Module ${m.n}</h1><p class="sub">${esc(m.title)}</p>
      <div class="card"><p>${esc(m.contenu)}</p><p class="mut">Ce module sera disponible le ${dlong(m.avail)} ; il apparaîtra ici de lui-même, sans rien réinstaller.</p></div>`);
    return;
  }
  tab = tab || 'cours';
  const p = progress(m);
  const tabs = [['cours', 'Cours', `${p.read}/${p.nsec}`], ['memo', 'Fiche mémo', m.memo.length], ['casus', 'Casus', m.casus.length], ['qcm', 'QCM', m.qcm.length], ['lexique', 'Lexique', m.lex.length]];
  let body = '';
  if (tab === 'cours') {
    body = `<div class="cours">
      <nav class="toc card"><div class="kick">Sommaire</div>${m.sections.map(s => `<button data-a="goto" data-id="${s.id}" class="${S.read[s.id] ? 'done' : ''}">${icon('check')}<span>${esc(s.title)}</span></button>`).join('')}</nav>
      <div class="cbody"><div class="prose intro">${m.intro}</div>
      ${m.sections.map(s => `<article class="sec card" id="${s.id}"><h2>${esc(s.title)}</h2><div class="prose">${s.html}</div>
        <button class="btn ${S.read[s.id] ? 'ok' : ''}" data-a="read" data-id="${s.id}">${icon('check')}${S.read[s.id] ? 'Lu' : 'Marquer comme lu'}</button></article>`).join('')}
      ${m.sources ? `<article class="sec card"><h2>Sources</h2><div class="prose">${m.sources}</div></article>` : ''}</div></div>`;
  } else if (tab === 'memo') {
    body = `<div class="prose">${m.memoNote}</div>
      <div class="row"><a class="btn pri" href="#/cards/m${m.n}-memo">Réviser en cartes</a><button class="btn" data-a="revealall">Tout révéler</button><button class="btn" data-a="hideall">Tout masquer</button></div>
      <div class="recite card">${m.memo.map(c => `<div class="rc"><div class="rq">${c.f}</div><button class="ra" data-a="reveal" aria-label="Révéler la réponse">${c.b}</button></div>`).join('')}</div>`;
  } else if (tab === 'casus') {
    body = `<div class="prose">${m.casusNote}</div><div class="clist">${m.casus.map(c => {
      const ev = (S.casus[c.id] || {}).ev;
      return `<a class="card ci" href="#/casus/${c.id}"><div class="kick">Casus ${c.num}${ev ? ` · <span class="ev ${ev}">${EV[ev]}</span>` : ''}</div><h3>${esc(c.title)}</h3><p class="mut sm">${esc(strip(c.enonce).slice(0, 170))}…</p></a>`;
    }).join('')}</div>`;
  } else if (tab === 'qcm') {
    const r = S.qcm[m.n], err = m.qcm.filter(q => S.wrong[q.id]).length;
    body = `<div class="prose">${m.qcmNote}</div>
      <div class="card stats">${r ? `<div><span class="tn">${r.best}/${m.qcm.length}</span><span class="mut sm">meilleur score</span></div><div><span class="tn">${r.runs[r.runs.length - 1].s}/${r.runs[r.runs.length - 1].n}</span><span class="mut sm">dernier essai, ${dshort(r.runs[r.runs.length - 1].d)}</span></div><div><span class="tn">${r.runs.length}</span><span class="mut sm">${r.runs.length > 1 ? 'essais' : 'essai'}</span></div>` : '<p class="mut">Pas encore d\'essai. Objectif : 9 sur 10.</p>'}</div>
      <div class="row"><a class="btn pri" href="#/qcm/m${m.n}">Commencer le QCM (${m.qcm.length} questions)</a>${err ? `<a class="btn" href="#/qcm/m${m.n}-err">Reprendre ${plural(err, 'erreur', 'erreurs')}</a>` : ''}</div>`;
  } else {
    body = `<div class="prose">${m.lexNote}</div>
      <div class="row"><a class="btn pri" href="#/cards/m${m.n}-lex">Réviser en cartes</a></div>
      <div class="lex">${m.lex.map(l => `<details class="card lx" id="${l.id}" ${sub === l.id ? 'open' : ''}><summary><span>${esc(l.f)}</span>${mastered(l) ? `<span class="chip ok">${icon('check')}maîtrisé</span>` : ''}</summary><div class="prose">${l.b}</div></details>`).join('')}</div>`;
  }
  view(`<a class="back" href="#/modules">‹ Modules</a>
    <div class="mhead"><div><div class="kick">Module ${m.n}</div><h1>${esc(m.title)}</h1></div><div class="pcircle" style="--p:${p.all}"><span>${p.all} %</span></div></div>
    <nav class="seg">${tabs.map(([k, l, c]) => `<a href="#/m/${m.n}/${k}" class="${k === tab ? 'on' : ''}">${l} <span class="cnt">${c}</span></a>`).join('')}</nav>
    <div class="tabbody">${body}</div>`);
  if (sub) { const el = document.getElementById(sub); if (el) setTimeout(() => el.scrollIntoView({ block: 'start' }), 30); }
}

/* ---------- cartes (répétition espacée) ---------- */
let CS = null;
function deckCards(deck) {
  const all = allCards();
  if (deck === 'due') return shuffle(all.filter(isDue)).sort((a, b) => box(a.id) - box(b.id));
  if (deck === 'all') return shuffle(all);
  const m = deck.match(/^m(\d+)-(memo|lex|all)$/);
  return m ? shuffle(all.filter(c => c.mod === +m[1] && (m[2] === 'all' || c.kind === m[2]))) : [];
}
function cardsBack(deck) { const m = deck.match(/^m(\d+)-(memo|lex)/); return m ? `#/m/${m[1]}/${m[2] === 'lex' ? 'lexique' : 'memo'}` : '#/train'; }
function cardsSession(deck) {
  const q = deckCards(deck);
  if (!q.length) {
    view(`<a class="back" href="${cardsBack(deck)}">‹ Retour</a><h1>Cartes</h1><div class="card"><p>${deck === 'due' ? "Aucune carte à revoir aujourd'hui : la répétition espacée vous les représentera au bon moment." : 'Aucune carte dans ce paquet pour le moment.'}</p><div class="row"><a class="btn" href="#/cards/all">Revoir toutes les cartes</a></div></div>`);
    return;
  }
  CS = { deck, q, i: 0, ok: 0, ko: 0, flip: false, again: {} };
  renderCard();
}
function renderCard() {
  const c = CS.q[CS.i];
  if (!c) return cardsEnd();
  view(`<div class="sess-h"><a class="back" href="${cardsBack(CS.deck)}">‹ Quitter</a><div class="sess-p">${CS.i + 1} / ${CS.q.length}</div></div>
    ${bar(pct(CS.i, CS.q.length), 'thin')}
    <div class="flash ${CS.flip ? 'flipped' : ''}" data-a="flip" role="button" tabindex="0">
      <div class="fkind">${c.kind === 'lex' ? 'Lexique · définissez' : 'Fiche mémo'} · module ${c.mod} · boîte ${box(c.id)}/5</div>
      <div class="ffront">${c.kind === 'lex' ? esc(c.f) : c.f}</div>
      ${CS.flip ? `<div class="fback prose">${c.b}</div>` : '<div class="fhint">Récitez, puis touchez la carte</div>'}
    </div>
    <div class="row ans">${CS.flip
      ? '<button class="btn ko" data-a="ans" data-v="0">À revoir</button><button class="btn ok" data-a="ans" data-v="1">Je savais</button>'
      : '<button class="btn pri wide" data-a="flip">Retourner la carte</button>'}</div>`);
}
function answerCard(ok) {
  const c = CS.q[CS.i]; if (!c) return;
  const st = Object.assign({ b: 0, due: null, n: 0, k: 0 }, S.cards[c.id]);
  st.n++;
  if (ok) { st.k++; st.b = Math.min(5, st.b + 1); st.due = addDays(today(), INTERVALS[st.b]); CS.ok++; }
  else { st.b = 1; st.due = today(); CS.ko++; if (!CS.again[c.id]) { CS.again[c.id] = 1; CS.q.push(c); } }
  S.cards[c.id] = st; save();
  CS.i++; CS.flip = false; renderCard();
}
function cardsEnd() {
  const n = CS.ok + CS.ko;
  view(`<a class="back" href="${cardsBack(CS.deck)}">‹ Retour</a><h1>Paquet terminé</h1>
    <div class="card result"><div class="tn">${CS.ok}/${n}</div><p>${CS.ko ? `Les ${plural(CS.ko, 'carte manquée revient', 'cartes manquées reviennent')} dès demain dans les cartes du jour.` : 'Aucune hésitation : ces cartes ne reviendront que dans quelques jours.'}</p>
    <div class="row"><button class="btn pri" data-a="rerun">Recommencer</button><a class="btn" href="#/cards/due">Cartes du jour</a><a class="btn" href="#/">Accueil</a></div></div>`);
}

/* ---------- QCM ---------- */
let QS = null;
function qcmSession(id) {
  let qs = [], label = 'QCM', back = '#/train', mod = null, full = false, mm;
  if ((mm = id.match(/^m(\d+)(-err)?$/))) {
    const m = MOD(mm[1]); if (!m || !m.ready) return go('modules', true);
    mod = m.n; back = `#/m/${m.n}/qcm`; full = !mm[2];
    qs = m.qcm.map(q => Object.assign({ mod: m.n }, q)).filter(q => full || S.wrong[q.id]);
    label = full ? `QCM · module ${m.n}` : `Erreurs · module ${m.n}`;
  } else if (id === 'err') { qs = allQcm().filter(q => S.wrong[q.id]); label = 'Mes erreurs'; }
  else if ((mm = id.match(/^mix-(\d+|all)$/))) { qs = shuffle(allQcm()); if (mm[1] !== 'all') qs = qs.slice(0, +mm[1]); label = 'QCM mélangé'; }
  if (!qs.length) {
    view(`<a class="back" href="${back}">‹ Retour</a><h1>${esc(label)}</h1><div class="card"><p>${id.includes('err') ? "Aucune erreur en attente : toutes vos réponses manquées ont été reprises avec succès." : 'Aucune question disponible.'}</p></div>`);
    return;
  }
  QS = { id, label, back, mod, full, qs: shuffle(qs).map(q => Object.assign({}, q, { order: shuffle(q.c.map((_, i) => i)) })), i: 0, picks: [], score: 0 };
  renderQ();
}
function renderQ() {
  const q = QS.qs[QS.i];
  if (!q) return qcmEnd();
  const pick = QS.picks[QS.i], done = pick !== undefined;
  view(`<div class="sess-h"><a class="back" href="${QS.back}">‹ Quitter</a><div class="sess-p">${esc(QS.label)} · ${QS.i + 1} / ${QS.qs.length} · ${QS.score} ${QS.score > 1 ? 'bonnes' : 'bonne'}</div></div>
    ${bar(pct(QS.i, QS.qs.length), 'thin')}
    <div class="card qq"><div class="kick">Question ${QS.i + 1} · module ${q.mod}</div><div class="qtext">${q.q}</div>
    <div class="choices">${q.order.map((ci, k) => {
      const cls = !done ? '' : ci === q.a ? 'right' : ci === pick ? 'wrong' : 'dim';
      return `<button class="choice ${cls}" data-a="pick" data-c="${ci}" ${done ? 'disabled' : ''}><span class="cl">${'ABCDEF'[k]}</span><span class="ct">${q.c[ci]}</span></button>`;
    }).join('')}</div>
    ${done ? `<div class="expl ${pick === q.a ? 'good' : 'bad'}"><strong>${pick === q.a ? 'Exact.' : 'Inexact.'}</strong> Réponse : ${q.c[q.a]}${q.w ? ` <span class="mut">(${esc(q.w)})</span>` : ''}</div>
      <button class="btn pri wide" data-a="nextq">${QS.i + 1 < QS.qs.length ? 'Question suivante' : 'Voir le résultat'}</button>` : ''}</div>`);
}
function pickQ(ci) {
  const q = QS.qs[QS.i]; if (!q || QS.picks[QS.i] !== undefined) return;
  QS.picks[QS.i] = ci;
  if (ci === q.a) { QS.score++; delete S.wrong[q.id]; } else S.wrong[q.id] = 1;
  save(); renderQ();
}
function qcmEnd() {
  const n = QS.qs.length, s = QS.score, p = pct(s, n);
  if (QS.full) {
    const r = S.qcm[QS.mod] || { best: 0, runs: [] };
    r.best = Math.max(r.best, s); r.runs.push({ d: today(), s, n }); r.runs = r.runs.slice(-30);
    S.qcm[QS.mod] = r; save();
  }
  const msg = p === 100 ? "Sans faute. Le jury n'aura plus qu'à s'incliner." : p >= 90 ? "Excellent : l'objectif est atteint." : p >= 70 ? 'Bon résultat ; reprenez les erreurs avant de poursuivre.' : 'Il faut y revenir : relisez les sections concernées, puis reprenez les erreurs.';
  const errs = QS.qs.filter((q, i) => QS.picks[i] !== q.a);
  const errLink = QS.mod !== null ? `#/qcm/m${QS.mod}-err` : '#/qcm/err';
  view(`<a class="back" href="${QS.back}">‹ Retour</a><h1>Résultat</h1>
    <div class="card result"><div class="tn">${s}/${n}</div><div class="mut">${p} %</div><p>${msg}</p>
    <div class="row"><button class="btn pri" data-a="rerun">Recommencer</button>${errs.length ? `<a class="btn" href="${errLink}">Reprendre les erreurs</a>` : ''}<a class="btn" href="${QS.back}">Retour</a></div></div>
    ${errs.length ? `<section class="card"><h3>À retenir</h3>${errs.map(q => `<div class="errq"><div class="qtext sm">${q.q}</div><div class="good-t">${icon('check')} ${q.c[q.a]}${q.w ? ` <span class="mut">(${esc(q.w)})</span>` : ''}</div></div>`).join('')}</section>` : ''}`);
}

/* ---------- casus ---------- */
let CT = null;
function casusView(id) {
  if (id === 'rand') {
    const all = allCasus();
    if (!all.length) return go('train', true);
    const pool = all.filter(c => (S.casus[c.id] || {}).ev !== 'ok');
    const list = pool.length ? pool : all;
    return go('casus/' + list[Math.floor(Math.random() * list.length)].id, true);
  }
  const c = casById(id); if (!c) return go('train', true);
  const m = MOD(c.mod), st = S.casus[id] || {}, idx = m.casus.findIndex(x => x.id === id);
  const prev = m.casus[idx - 1], next = m.casus[idx + 1];
  view(`<a class="back" href="#/m/${m.n}/casus">‹ Module ${m.n} · casus</a>
    <div class="kick">Casus ${c.num} · module ${m.n}</div><h1>${esc(c.title)}</h1>
    <div class="card dossier"><div class="kick">L'affilié vous consulte</div><div class="prose">${c.enonce}</div></div>
    <div class="card">
      <div class="timer-row"><div class="timer" id="tm">20:00</div><button class="btn" data-a="tgo" id="tgo">Démarrer</button><button class="btn" data-a="treset">Remettre à 20 min</button></div>
      <details class="grid6"><summary>Grille de résolution</summary><ol>${GRID.map(g => `<li><strong>${g[0]}</strong> ${esc(g[1])}</li>`).join('')}</ol><button class="btn sm" data-a="plan6">Insérer ce plan dans ma réponse</button></details>
      <label class="lbl" for="ans">Votre consultation</label>
      <textarea id="ans" data-id="${id}" rows="12" placeholder="Rédigez votre réponse comme pour l'épreuve…">${esc(st.ans || '')}</textarea>
      <div class="mut sm" id="saved">${st.ans ? 'Brouillon enregistré sur cet appareil' : ''}</div>
    </div>
    <div class="card" id="corr">${st.shown ? corrHtml(c) : '<button class="btn pri wide" data-a="showcorr">Afficher le corrigé</button>'}</div>
    <div class="row between">${prev ? `<a class="btn" href="#/casus/${prev.id}">‹ Casus ${prev.num}</a>` : '<span></span>'}${next ? `<a class="btn" href="#/casus/${next.id}">Casus ${next.num} ›</a>` : '<a class="btn" href="#/casus/rand">Casus au hasard</a>'}</div>`);
  CT = { left: 1200, run: false };
}
function corrHtml(c) {
  const ev = (S.casus[c.id] || {}).ev;
  return `<h3>Corrigé</h3><div class="prose">${c.corrige}</div>
    <div class="kick">Votre auto-évaluation</div>
    <div class="row">${Object.entries(EV).map(([k, l]) => `<button class="btn ev-b ${k} ${ev === k ? 'on' : ''}" data-a="ev" data-v="${k}" data-id="${c.id}">${l}</button>`).join('')}</div>`;
}
function tick() {
  if (!CT || !CT.run) return;
  CT.left--;
  const el = $('#tm'); if (el) el.textContent = clock(CT.left);
  if (CT.left <= 0) { CT.run = false; stopTimers(); CT = { left: 0, run: false }; const b = $('#tgo'); if (b) b.textContent = 'Démarrer'; toast('Temps écoulé : concluez par le délai et la démarche.'); if (navigator.vibrate) navigator.vibrate([200, 100, 200]); }
}

/* ---------- entraînement ---------- */
function train() {
  const due = allCards().filter(isDue).length, nq = allQcm().length, err = allQcm().filter(q => S.wrong[q.id]).length, nc = allCasus().length;
  const ex = S.exams.slice().reverse();
  view(`<h1>Entraînement</h1>
    <div class="tiles t3">
      <a class="card tile" href="#/cards/due"><div class="tn">${due}</div><div class="tl">Cartes du jour</div><div class="mut sm">Répétition espacée : fiches mémo et lexique</div></a>
      <div class="card tile"><div class="tl">QCM mélangé</div><div class="mut sm">${nq} questions disponibles</div><div class="row"><a class="btn" href="#/qcm/mix-10">10</a><a class="btn" href="#/qcm/mix-20">20</a><a class="btn" href="#/qcm/mix-all">Toutes</a></div></div>
      <a class="card tile" href="#/qcm/err"><div class="tn">${err}</div><div class="tl">Erreurs à reprendre</div><div class="mut sm">Chaque question manquée revient ici jusqu'à la bonne réponse</div></a>
      <a class="card tile" href="#/casus/rand"><div class="tn">${nc}</div><div class="tl">Casus au hasard</div><div class="mut sm">20 minutes, puis le corrigé</div></a>
      <a class="card tile" href="#/exam"><div class="tn">${icon('clock')}</div><div class="tl">Examen blanc</div><div class="mut sm">QCM, définitions et casus en temps limité</div></a>
      <a class="card tile" href="#/cards/all"><div class="tn">${allCards().length}</div><div class="tl">Toutes les cartes</div><div class="mut sm">Pour une révision complète</div></a>
    </div>
    <section class="card"><h3>Examens blancs</h3>${ex.length ? `<div class="tw"><table><thead><tr><th>Date</th><th>QCM</th><th>Définitions</th><th>Casus</th><th>Note</th></tr></thead><tbody>${ex.map(e => `<tr><td>${dshort(e.d)}</td><td>${e.q[0]}/${e.q[1]}</td><td>${e.df[0]}/${e.df[1]}</td><td>${e.c[0]}/${e.c[1]}</td><td><strong>${e.note}/20</strong></td></tr>`).join('')}</tbody></table></div>` : '<p class="mut">Aucun examen blanc pour le moment.</p>'}</section>`);
}

/* ---------- examen blanc ---------- */
function examSetup() {
  if (S.exam && !S.exam.done) {
    view(`<a class="back" href="#/train">‹ Entraînement</a><h1>Examen blanc</h1><div class="card"><p>Un examen est en cours depuis ${clock((Date.now() - S.exam.start) / 1000)}.</p>
      <div class="row"><a class="btn pri" href="#/exam/run">Reprendre</a><button class="btn ko" data-a="exabandon">Abandonner</button></div></div>`);
    return;
  }
  if (S.exam && S.exam.done) return go('exam/result', true);
  const nq = Math.min(10, allQcm().length), nd = Math.min(4, allLex().length), nc = Math.min(2, allCasus().length);
  view(`<a class="back" href="#/train">‹ Entraînement</a><h1>Examen blanc</h1>
    <p class="lead">Une épreuve tirée au hasard parmi les ${plural(READY().length, 'module disponible', 'modules disponibles')}, à composer d'une traite, codes en main, Code judiciaire fermé.</p>
    <div class="card"><ol class="exparts"><li><strong>${nq} questions de QCM</strong> <span class="mut">(1 point chacune)</span></li><li><strong>${nd} définitions</strong> <span class="mut">(2 points chacune)</span></li><li><strong>${nc} casus</strong> <span class="mut">(6 points chacun, selon la grille QUI – QUOI – RÈGLE – COMBIEN – QUAND – COMMENT)</span></li></ol>
    <p class="mut">À la remise de la copie, le QCM est corrigé automatiquement ; vous notez vous-même définitions et casus, corrigé sous les yeux.</p>
    <div class="kick">Durée</div><div class="row">${[60, 90, 120].map(d => `<button class="btn ${d === 90 ? 'pri' : ''}" data-a="exstart" data-dur="${d}">${d} minutes</button>`).join('')}</div></div>
    <p class="mut sm">La simulation complète du module 12 viendra s'ajouter le 8 décembre.</p>`);
}
function examStart(dur) {
  const qs = shuffle(allQcm()).slice(0, 10).map(q => ({ id: q.id, o: shuffle(q.c.map((_, i) => i)) }));
  const defs = shuffle(allLex()).slice(0, 4).map(l => l.id);
  const cas = shuffle(allCasus()).slice(0, 2).map(c => c.id);
  S.exam = { start: Date.now(), dur: dur * 60, qs, qa: {}, defs, da: {}, cas, ca: {}, done: false, g: {} };
  save(); go('exam/run');
}
function examLeft() { return S.exam.dur - (Date.now() - S.exam.start) / 1000; }
function examRun() {
  const E = S.exam;
  if (!E) return go('exam', true);
  if (E.done) return go('exam/result', true);
  if (examLeft() <= 0) return examSubmit(true);
  const qs = E.qs.map(x => [x, qById(x.id)]).filter(x => x[1]);
  view(`<div class="exbar"><span>${icon('clock')}<strong id="extm">${clock(examLeft())}</strong></span><button class="btn pri" data-a="exsubmit">Remettre ma copie</button></div>
    <h1>Examen blanc</h1>
    <section class="card"><h2>Partie I · QCM</h2>${qs.map(([x, q], i) => `<div class="exq"><div class="qtext"><span class="mut">${i + 1}.</span> ${q.q}</div><div class="choices">${x.o.map((ci, k) => `<button class="choice ${E.qa[q.id] === ci ? 'sel' : ''}" data-a="expick" data-q="${q.id}" data-c="${ci}"><span class="cl">${'ABCDEF'[k]}</span><span class="ct">${q.c[ci]}</span></button>`).join('')}</div></div>`).join('')}</section>
    <section class="card"><h2>Partie II · Définitions</h2>${E.defs.map(id => lexById(id)).filter(Boolean).map((l, i) => `<div class="exd"><label class="lbl" for="d-${l.id}">${i + 1}. Définissez : « ${esc(l.f)} »</label><textarea id="d-${l.id}" rows="4" data-ex="da" data-id="${l.id}" placeholder="Catégorie, trait distinctif, base légale, exemple, enjeu">${esc(E.da[l.id] || '')}</textarea></div>`).join('')}</section>
    <section class="card"><h2>Partie III · Casus</h2>${E.cas.map(id => casById(id)).filter(Boolean).map((c, i) => `<div class="exc"><div class="kick">Casus ${i + 1}</div><div class="dossier prose">${c.enonce}</div><textarea rows="12" data-ex="ca" data-id="${c.id}" placeholder="Votre consultation">${esc(E.ca[c.id] || '')}</textarea></div>`).join('')}</section>
    <button class="btn pri wide" data-a="exsubmit">Remettre ma copie</button>`);
  every(1000, () => {
    if (!S.exam || S.exam.done) return;
    const left = examLeft(), el = $('#extm');
    if (el) { el.textContent = clock(left); el.classList.toggle('late', left < 600); }
    if (left <= 0) examSubmit(true);
  });
}
function examSubmit(auto) {
  if (!S.exam || S.exam.done) return;
  S.exam.done = true; S.exam.end = Math.min(Date.now(), S.exam.start + S.exam.dur * 1000); save();
  stopTimers(); closeModal();
  if (auto) toast('Temps écoulé : la copie a été remise.');
  go('exam/result');
}
function examScore(E) {
  const qs = E.qs.map(x => qById(x.id)).filter(Boolean);
  const q = qs.filter(x => E.qa[x.id] === x.a).length;
  const defs = E.defs.filter(id => lexById(id)), cas = E.cas.filter(id => casById(id));
  const df = defs.reduce((a, id) => a + (E.g['d:' + id] || 0), 0);
  const c = cas.reduce((a, id) => a + (E.g['c:' + id] || []).filter(Boolean).length, 0);
  const tot = q + df + c, max = qs.length + 2 * defs.length + 6 * cas.length;
  return { q: [q, qs.length], df: [df, 2 * defs.length], c: [c, 6 * cas.length], note: max ? Math.round(20 * tot / max * 10) / 10 : 0 };
}
function examResult() {
  const E = S.exam;
  if (!E) return go('exam', true);
  if (!E.done) return go('exam/run', true);
  const sc = examScore(E);
  const qs = E.qs.map(x => [x, qById(x.id)]).filter(x => x[1]);
  view(`<a class="back" href="#/train">‹ Entraînement</a><h1>Correction</h1>
    <div class="card result" id="exsum">${examSumHtml(sc, E)}</div>
    <section class="card"><h2>Partie I · QCM <span class="mut sm">${sc.q[0]}/${sc.q[1]}</span></h2>${qs.map(([x, q], i) => {
      const a = E.qa[q.id], ok = a === q.a;
      return `<div class="errq"><div class="qtext sm"><span class="mut">${i + 1}.</span> ${q.q}</div>${ok ? `<div class="good-t">${icon('check')} ${q.c[q.a]}</div>` : `<div class="bad-t">Votre réponse : ${a === undefined ? 'aucune' : q.c[a]}</div><div class="good-t">${icon('check')} ${q.c[q.a]}${q.w ? ` <span class="mut">(${esc(q.w)})</span>` : ''}</div>`}</div>`;
    }).join('')}</section>
    <section class="card"><h2>Partie II · Définitions</h2>${E.defs.map(id => lexById(id)).filter(Boolean).map(l => `<div class="exd"><h3>« ${esc(l.f)} »</h3><div class="yours"><div class="kick">Votre définition</div><p>${esc(E.da[l.id] || '—').replace(/\n/g, '<br>')}</p></div><div class="model prose"><div class="kick">Définition de référence</div>${l.b}</div>
      <div class="row grade">${[0, 1, 2].map(v => `<button class="btn sm ${(E.g['d:' + l.id] || 0) === v && E.g['d:' + l.id] !== undefined ? 'on' : ''}" data-a="exgrade" data-k="d:${l.id}" data-v="${v}">${v} ${v > 1 ? 'points' : 'point'}</button>`).join('')}</div></div>`).join('')}</section>
    <section class="card"><h2>Partie III · Casus</h2>${E.cas.map(id => casById(id)).filter(Boolean).map(c => {
      const g = E.g['c:' + c.id] || [];
      return `<div class="exc"><h3>${esc(c.title)}</h3><div class="yours"><div class="kick">Votre consultation</div><p>${esc(E.ca[c.id] || '—').replace(/\n/g, '<br>')}</p></div>
      <details class="model"><summary>Corrigé</summary><div class="prose">${c.corrige}</div></details>
      <div class="kick">Cochez ce que votre réponse contenait</div><div class="checks">${GRID.map((x, i) => `<button class="chk ${g[i] ? 'on' : ''}" data-a="excheck" data-id="${c.id}" data-i="${i}">${icon('check')}<span><strong>${x[0]}</strong> ${esc(x[1])}</span></button>`).join('')}</div></div>`;
    }).join('')}</section>
    <div class="row"><button class="btn pri" data-a="exsave">Enregistrer la note et terminer</button><button class="btn" data-a="exdiscard">Terminer sans enregistrer</button></div>`);
}
function examSumHtml(sc, E) {
  const used = Math.round((E.end - E.start) / 60000);
  return `<div class="tn">${String(sc.note).replace('.', ',')}/20</div><div class="mut">QCM ${sc.q[0]}/${sc.q[1]} · définitions ${sc.df[0]}/${sc.df[1]} · casus ${sc.c[0]}/${sc.c[1]} · ${used} min sur ${Math.round(E.dur / 60)}</div><p class="sm mut">La note se met à jour à mesure que vous notez définitions et casus.</p>`;
}
function refreshExamSum() { const el = $('#exsum'); if (el && S.exam) el.innerHTML = examSumHtml(examScore(S.exam), S.exam); }

/* ---------- réglages ---------- */
function settings() {
  const cards = allCards(), p = S.prefs;
  const secs = READY().flatMap(m => m.sections), read = secs.filter(s => S.read[s.id]).length;
  const cas = allCasus(), casDone = cas.filter(c => (S.casus[c.id] || {}).ev).length;
  const opt = (k, v, l) => `<button class="btn ${p[k] === v ? 'pri' : ''}" data-a="pref" data-k="${k}" data-v="${v}">${l}</button>`;
  view(`<h1>Réglages</h1>
    <section class="card"><h3>Apparence</h3>
      <div class="kick">Thème</div><div class="row">${opt('theme', 'auto', 'Automatique')}${opt('theme', 'parchemin', 'Parchemin')}${opt('theme', 'nuit', 'Nuit')}</div>
      <div class="kick">Texte courant</div><div class="row">${opt('body', 'sans', 'Moderne')}${opt('body', 'serif', 'Garamond')}</div>
      <div class="kick">Taille du texte</div><div class="row"><button class="btn" data-a="fs" data-v="-10" aria-label="Réduire">A−</button><span class="fsv">${p.fs} %</span><button class="btn" data-a="fs" data-v="10" aria-label="Agrandir">A+</button></div>
    </section>
    <section class="card"><h3>Progression</h3>
      <div class="stats"><div><span class="tn">${read}/${secs.length}</span><span class="mut sm">sections lues</span></div><div><span class="tn">${cards.filter(mastered).length}/${cards.length}</span><span class="mut sm">cartes maîtrisées</span></div><div><span class="tn">${casDone}/${cas.length}</span><span class="mut sm">casus évalués</span></div><div><span class="tn">${S.exams.length}</span><span class="mut sm">examens blancs</span></div></div>
      <p class="mut sm">Vos données restent sur cet appareil. Exportez-les de temps en temps : elles se réimportent en un geste, sur cet appareil ou sur un autre.</p>
      <div class="row"><button class="btn" data-a="export">Exporter un fichier</button><button class="btn" data-a="copy">Copier la sauvegarde</button><button class="btn" data-a="import">Importer un fichier</button><button class="btn" data-a="paste">Coller une sauvegarde</button></div>
      <div class="row"><button class="btn ko" data-a="reset">Effacer toute la progression</button></div>
    </section>
    <section class="card"><h3>À propos</h3>
      <p>Lauréat rassemble le programme de préparation au test de juriste en droit social du ${dlong(EXAM)} 2026 : ${plural(READY().length, 'module disponible', 'modules disponibles')} sur ${MODULES.length}. Les modules suivants s'ajoutent d'eux-mêmes dès leur publication, sans réinstallation.</p>
      <p class="mut sm">Contenu du ${esc(BUILD.date)}. Fonctionne hors connexion une fois ouvert en ligne.</p>
      <div class="row"><button class="btn" data-a="update">Rechercher une mise à jour</button></div>
    </section>`);
}
function backupText() { return JSON.stringify({ app: 'laureat', saved: new Date().toISOString(), state: S }); }
function restore(txt) {
  try {
    const o = JSON.parse(txt), st = o && o.state ? o.state : o;
    if (!st || typeof st !== 'object' || !('cards' in st)) throw new Error('format');
    S = Object.assign(blank(), st); S.prefs = Object.assign(blank().prefs, st.prefs || {});
    save(); applyPrefs(); closeModal(); toast('Sauvegarde restaurée.'); router();
  } catch (e) { toast("Ce texte n'est pas une sauvegarde de Lauréat."); }
}

/* ---------- fenêtre modale ---------- */
function modal(html) { const m = $('#modal'); m.innerHTML = `<div class="mbox card">${html}</div>`; m.classList.remove('hidden'); }
function closeModal() { const m = $('#modal'); m.classList.add('hidden'); m.innerHTML = ''; }
function confirmBox(text, ok, fn) { CONFIRM = fn; modal(`<p>${text}</p><div class="row end"><button class="btn" data-a="mclose">Annuler</button><button class="btn pri" data-a="mok">${ok}</button></div>`); }
let CONFIRM = null;

/* ---------- actions ---------- */
const ACT = {
  day: el => { const d = el.dataset.d; if (S.days[d]) delete S.days[d]; else S.days[d] = 1; save(); router(); },
  goto: el => { const s = document.getElementById(el.dataset.id); if (s) s.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
  read: el => {
    const id = el.dataset.id; if (S.read[id]) delete S.read[id]; else S.read[id] = 1; save();
    const on = !!S.read[id];
    el.classList.toggle('ok', on); el.innerHTML = icon('check') + (on ? 'Lu' : 'Marquer comme lu');
    const t = $(`.toc [data-id="${id}"]`); if (t) t.classList.toggle('done', on);
    if (on) toast('Section marquée comme lue.');
  },
  reveal: el => el.classList.toggle('on'),
  revealall: () => $$('.ra').forEach(e => e.classList.add('on')),
  hideall: () => $$('.ra').forEach(e => e.classList.remove('on')),
  flip: () => { if (CS && !CS.flip) { CS.flip = true; renderCard(); } },
  ans: el => answerCard(el.dataset.v === '1'),
  pick: el => pickQ(+el.dataset.c),
  nextq: () => { QS.i++; renderQ(); window.scrollTo(0, 0); },
  rerun: () => { lastRoute = null; router(); },
  tgo: el => {
    if (!CT) CT = { left: 1200, run: false };
    if (CT.left <= 0) CT.left = 1200;
    CT.run = !CT.run; el.textContent = CT.run ? 'Pause' : 'Reprendre';
    if (CT.run && !TIMERS.length) every(1000, tick);
  },
  treset: () => { stopTimers(); CT = { left: 1200, run: false }; const t = $('#tm'); if (t) t.textContent = '20:00'; const b = $('#tgo'); if (b) b.textContent = 'Démarrer'; },
  plan6: () => {
    const ta = $('#ans'); if (!ta) return;
    const tpl = GRID.map(g => g[0] + ' :\n').join('\n');
    ta.value = ta.value.trim() ? ta.value.replace(/\s*$/, '\n\n') + tpl : tpl;
    ta.dispatchEvent(new Event('input')); ta.focus();
  },
  showcorr: () => {
    const ta = $('#ans'), id = ta.dataset.id, c = casById(id);
    S.casus[id] = Object.assign(S.casus[id] || {}, { shown: 1 }); save();
    $('#corr').innerHTML = corrHtml(c);
  },
  ev: el => {
    const id = el.dataset.id; S.casus[id] = Object.assign(S.casus[id] || {}, { ev: el.dataset.v, evd: today() }); save();
    $$('.ev-b').forEach(b => b.classList.toggle('on', b === el)); toast('Auto-évaluation enregistrée.');
  },
  exstart: el => examStart(+el.dataset.dur),
  exabandon: () => confirmBox("Abandonner l'examen en cours ? Vos réponses seront perdues.", 'Abandonner', () => { S.exam = null; save(); closeModal(); router(); }),
  expick: el => {
    const q = el.dataset.q, c = +el.dataset.c;
    S.exam.qa[q] = c; save();
    $$(`[data-a=expick][data-q="${q}"]`).forEach(b => b.classList.toggle('sel', +b.dataset.c === c));
  },
  exsubmit: () => {
    const E = S.exam, blanks = E.qs.filter(x => E.qa[x.id] === undefined).length;
    confirmBox(`Remettre votre copie maintenant ?${blanks ? ` ${plural(blanks, 'question de QCM reste', 'questions de QCM restent')} sans réponse.` : ''}`, 'Remettre', () => examSubmit(false));
  },
  exgrade: el => {
    S.exam.g[el.dataset.k] = +el.dataset.v; save();
    $$(`[data-a=exgrade][data-k="${el.dataset.k}"]`).forEach(b => b.classList.toggle('on', b === el)); refreshExamSum();
  },
  excheck: el => {
    const k = 'c:' + el.dataset.id, g = S.exam.g[k] || [false, false, false, false, false, false];
    g[+el.dataset.i] = !g[+el.dataset.i]; S.exam.g[k] = g; save();
    el.classList.toggle('on', g[+el.dataset.i]); refreshExamSum();
  },
  exsave: () => {
    const E = S.exam, sc = examScore(E);
    S.exams.push({ d: today(), dur: Math.round(E.dur / 60), q: sc.q, df: sc.df, c: sc.c, note: sc.note });
    S.exam = null; save(); toast(`Note enregistrée : ${String(sc.note).replace('.', ',')}/20.`); go('train');
  },
  exdiscard: () => confirmBox("Terminer sans enregistrer la note ?", 'Terminer', () => { S.exam = null; save(); closeModal(); go('train'); }),
  pref: el => { S.prefs[el.dataset.k] = el.dataset.v; save(); applyPrefs(); router(); },
  fs: el => { S.prefs.fs = Math.max(80, Math.min(140, S.prefs.fs + +el.dataset.v)); save(); applyPrefs(); router(); },
  export: () => {
    try {
      const blob = new Blob([backupText()], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `laureat-sauvegarde-${today()}.json`;
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      toast('Fichier de sauvegarde créé.');
    } catch (e) { ACT.copy(); }
  },
  copy: () => {
    const txt = backupText();
    const done = () => toast('Sauvegarde copiée : collez-la dans une note ou un courriel.');
    const fallback = () => modal(`<h3>Votre sauvegarde</h3><p class="sm mut">Sélectionnez tout le texte, copiez-le et conservez-le.</p><textarea rows="8" readonly onfocus="this.select()">${esc(txt)}</textarea><div class="row end"><button class="btn pri" data-a="mclose">Fermer</button></div>`);
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, fallback); else fallback();
  },
  import: () => $('#impf').click(),
  paste: () => modal(`<h3>Coller une sauvegarde</h3><textarea id="pastebox" rows="8" placeholder="Collez ici le texte de la sauvegarde"></textarea><div class="row end"><button class="btn" data-a="mclose">Annuler</button><button class="btn pri" data-a="dopaste">Restaurer</button></div>`),
  dopaste: () => restore($('#pastebox').value),
  reset: () => confirmBox('Effacer toute la progression (lectures, cartes, QCM, casus, examens) ? Cette opération est définitive.', 'Tout effacer', () => { const prefs = S.prefs; S = blank(); S.prefs = prefs; save(); closeModal(); toast('Progression effacée.'); router(); }),
  update: () => {
    if (!('serviceWorker' in navigator)) { location.reload(); return; }
    navigator.serviceWorker.getRegistration().then(r => (r ? r.update() : null)).finally(() => { toast('Recherche de mise à jour…'); setTimeout(() => location.reload(), 900); });
  },
  mclose: () => closeModal(),
  mok: () => { const f = CONFIRM; CONFIRM = null; if (f) f(); else closeModal(); }
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]');
  if (!el) { if (e.target.id === 'modal') closeModal(); return; }
  const fn = ACT[el.dataset.a];
  if (fn) { e.preventDefault(); fn(el, e); }
});
let typing = null;
document.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'q') { search(t.value); return; }
  if (t.id === 'ans') {
    clearTimeout(typing);
    typing = setTimeout(() => { const id = t.dataset.id; S.casus[id] = Object.assign(S.casus[id] || {}, { ans: t.value }); save(); const s = $('#saved'); if (s) s.textContent = 'Brouillon enregistré sur cet appareil'; }, 400);
    return;
  }
  if (t.dataset.ex && S.exam) {
    clearTimeout(typing);
    typing = setTimeout(() => { S.exam[t.dataset.ex][t.dataset.id] = t.value; save(); }, 400);
  }
});
document.addEventListener('keydown', e => {
  if (/^(INPUT|TEXTAREA)$/.test(e.target.tagName) || !$('.flash')) return;
  if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (CS && !CS.flip) ACT.flip(); }
  else if (CS && CS.flip && (e.key === '1' || e.key === '2')) answerCard(e.key === '2');
});
$('#impf').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader(); r.onload = () => restore(String(r.result)); r.readAsText(f); e.target.value = '';
});
window.addEventListener('hashchange', router);
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyPrefs);

/* ---------- démarrage ---------- */
applyPrefs();
renderNav();
router();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});

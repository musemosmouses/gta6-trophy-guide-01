// Leonida Trophy Guide — boot and wiring. Loads app/data/trophies.json
// (same origin, a file of this app), renders the checklist / roadmap /
// missables / about tabs, and keeps progress in localStorage.
import { loadEarned, saveEarned, seedDemoIfRequested, exportProgress, importProgress } from './js/store.js';
import { KIND_LABELS, gradeCounts, normalizeQuery, trophyMatches } from './js/filters.js';
import { renderAbout, renderDetail, renderMissables, trophyCard } from './js/views.js';
import { renderRoadmap } from './js/roadmap.js';

const doc = await (await fetch('data/trophies.json')).json();
const TROPHIES = doc.trophies;
const SOURCES = doc.sources;

let earned = seedDemoIfRequested() ?? loadEarned();
let selectedId = 28; // Positive Mental Attitude: the missable one, open on load.
let view = 'checklist';
let spoilersOn = true;
const filters = { grade: 'all', kind: 'all', status: 'all', missableOnly: false, query: '' };

const main = document.getElementById('main');
const progressBox = document.getElementById('progressBox');

function el(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text !== undefined) n.textContent = text;
  return n;
}

function renderProgress() {
  const counts = gradeCounts(TROPHIES, earned);
  const pct = Math.round((earned.size / TROPHIES.length) * 100);
  progressBox.replaceChildren();
  const big = el('div', 'big');
  const b = el('b', undefined, `${earned.size} / ${TROPHIES.length}`);
  big.append(b, document.createTextNode(` earned · ${pct}% to platinum`));
  const bar = el('div', 'bar');
  const fill = el('i');
  fill.style.width = `${pct}%`;
  bar.append(fill);
  const line = el('div', 'counts',
    `Platinum ${counts.platinum[0]}/${counts.platinum[1]} · Gold ${counts.gold[0]}/${counts.gold[1]} · Silver ${counts.silver[0]}/${counts.silver[1]} · Bronze ${counts.bronze[0]}/${counts.bronze[1]}`);
  progressBox.append(big, bar, line);
}

function selectedTrophy() {
  return TROPHIES.find((t) => t.id === selectedId) ?? null;
}

function renderTabs() {
  const tabs = el('div', 'tabs');
  tabs.setAttribute('role', 'tablist');
  for (const [key, label] of [['checklist', 'Checklist'], ['roadmap', 'Platinum roadmap'], ['missables', 'Missables'], ['about', 'Sources & about']]) {
    const btn = el('button', undefined, label);
    btn.type = 'button';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', String(view === key));
    btn.addEventListener('click', () => { view = key; render(); });
    tabs.append(btn);
  }
  return tabs;
}

function renderControls() {
  const box = el('div', 'controls');
  const search = el('input');
  search.type = 'search';
  search.placeholder = 'Search trophies by name or description…';
  search.setAttribute('aria-label', 'Search trophies');
  search.value = filters.query;
  search.addEventListener('input', () => { filters.query = normalizeQuery(search.value); renderList(); });
  const grade = el('select');
  grade.setAttribute('aria-label', 'Filter by grade');
  for (const [v, label] of [['all', 'All grades'], ['platinum', 'Platinum'], ['gold', 'Gold'], ['silver', 'Silver'], ['bronze', 'Bronze']]) {
    const o = el('option', undefined, label);
    o.value = v;
    if (filters.grade === v) o.selected = true;
    grade.append(o);
  }
  grade.addEventListener('change', () => { filters.grade = grade.value; renderList(); });
  const kind = el('select');
  kind.setAttribute('aria-label', 'Filter by kind');
  const kindAll = el('option', undefined, 'All kinds');
  kindAll.value = 'all';
  if (filters.kind === 'all') kindAll.selected = true;
  kind.append(kindAll);
  for (const [v, label] of Object.entries(KIND_LABELS)) {
    const o = el('option', undefined, label);
    o.value = v;
    if (filters.kind === v) o.selected = true;
    kind.append(o);
  }
  kind.addEventListener('change', () => { filters.kind = kind.value; renderList(); });
  const status = el('select');
  status.setAttribute('aria-label', 'Filter by status');
  for (const [v, label] of [['all', 'All trophies'], ['earned', 'Earned'], ['remaining', 'Still to earn']]) {
    const o = el('option', undefined, label);
    o.value = v;
    if (filters.status === v) o.selected = true;
    status.append(o);
  }
  status.addEventListener('change', () => { filters.status = status.value; renderList(); });
  const missLabel = el('label', 'toggle');
  const missBox = el('input');
  missBox.type = 'checkbox';
  missBox.checked = filters.missableOnly;
  missBox.addEventListener('change', () => { filters.missableOnly = missBox.checked; renderList(); });
  missLabel.append(missBox, document.createTextNode('Missable only'));
  const spoilLabel = el('label', 'toggle');
  const spoilBox = el('input');
  spoilBox.type = 'checkbox';
  spoilBox.checked = spoilersOn;
  spoilBox.addEventListener('change', () => { spoilersOn = spoilBox.checked; renderList(); });
  spoilLabel.append(spoilBox, document.createTextNode('Hide story spoilers'));
  const exportBtn = el('button', 'btn', 'Export progress');
  exportBtn.type = 'button';
  exportBtn.addEventListener('click', () => exportProgress(earned));
  const importLabel = el('label', 'btn', 'Import progress');
  const importInput = el('input');
  importInput.type = 'file';
  importInput.accept = 'application/json';
  importInput.hidden = true;
  importInput.addEventListener('change', async () => {
    const file = importInput.files[0];
    if (!file) return;
    try {
      earned = await importProgress(file);
      saveEarned(earned);
    } catch {
      alert('That file is not a trophy-progress export from this guide.');
    }
    render();
  });
  importLabel.append(importInput);
  box.append(search, grade, kind, status, missLabel, spoilLabel, exportBtn, importLabel);
  return box;
}

let listHost = null;
let detailHost = null;
let resultLine = null;

function renderList() {
  if (!listHost) return;
  const shown = TROPHIES.filter((t) => trophyMatches(t, filters, earned, spoilersOn));
  resultLine.textContent = `Showing ${shown.length} of ${TROPHIES.length} trophies` +
    (filters.query ? ` matching “${filters.query}”` : '') +
    (spoilersOn ? ' · story spoilers hidden until earned' : '');
  listHost.replaceChildren();
  for (const t of shown) {
    listHost.append(trophyCard(t, {
      earned,
      spoilersOn,
      selectedId,
      onToggle: (id, checked) => {
        if (checked) earned.add(id);
        else earned.delete(id);
        saveEarned(earned);
        renderProgress();
        renderList();
        renderDetail(detailHost, selectedTrophy(), { earned, sources: SOURCES });
      },
      onSelect: (id) => {
        selectedId = id;
        renderList();
        renderDetail(detailHost, selectedTrophy(), { earned, sources: SOURCES });
      },
    }));
  }
  if (!shown.length) {
    listHost.append(el('p', 'note', 'No trophies match those filters. Clear the search or widen the filters.'));
  }
}

function footer() {
  return el('footer', undefined,
    'Leonida Trophy Guide — an unofficial, open-source fan guide. Grand Theft Auto and GTA are trademarks of Rockstar Games; no Rockstar logo, artwork or font is used here. Names, descriptions and grades are the official PS5 list as Exophase and PSNProfiles publish it; guides are this entry’s own words.');
}

function renderChecklist() {
  const layout = el('div', 'layout');
  const left = el('div');
  left.append(renderControls());
  resultLine = el('p', 'resultline');
  left.append(resultLine);
  listHost = el('div', 'list');
  left.append(listHost);
  detailHost = el('aside', 'detail');
  layout.append(left, detailHost);
  main.replaceChildren(renderTabs(), layout);
  renderList();
  renderDetail(detailHost, selectedTrophy(), { earned, sources: SOURCES });
  main.append(footer());
}

function render() {
  renderProgress();
  if (view === 'checklist') {
    renderChecklist();
    return;
  }
  listHost = null;
  detailHost = null;
  const host = el('div');
  main.replaceChildren(renderTabs(), host);
  if (view === 'roadmap') renderRoadmap(host);
  else if (view === 'missables') renderMissables(host, TROPHIES);
  else renderAbout(host, SOURCES);
  main.append(footer());
}

render();

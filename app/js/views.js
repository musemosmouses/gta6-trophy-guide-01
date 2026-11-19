// Views: the checklist with its detail pane, the missables page and the
// about/sources page. All DOM is built with createElement/textContent, so no
// trophy name or guide text is ever parsed as HTML.
import { KIND_LABELS, isSpoilerMasked, trophyMatches } from './filters.js';

const GRADE_LETTER = { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' };

export function medalFor(grade) {
  const span = document.createElement('span');
  span.className = `medal ${grade}`;
  span.textContent = GRADE_LETTER[grade] ?? '?';
  span.title = grade;
  return span;
}

export function tagRow(t, sources) {
  const tags = document.createElement('div');
  tags.className = 'tags';
  const gradeTag = document.createElement('span');
  gradeTag.className = `tag grade-${t.grade}`;
  gradeTag.textContent = t.grade;
  tags.append(gradeTag);
  const kindTag = document.createElement('span');
  kindTag.className = 'tag';
  kindTag.textContent = KIND_LABELS[t.kind] ?? t.kind;
  tags.append(kindTag);
  if (t.hidden) {
    const hiddenTag = document.createElement('span');
    hiddenTag.className = 'tag';
    hiddenTag.textContent = 'hidden on PSN';
    tags.append(hiddenTag);
  }
  if (t.missable) {
    const missTag = document.createElement('span');
    missTag.className = 'tag missable';
    missTag.textContent = 'MISSABLE';
    tags.append(missTag);
  }
  return tags;
}

// One checklist row: checkbox, medal, name + official description, tags,
// and the PSN progress target where the list tracks one (e.g. 0/250).
export function trophyCard(t, ctx) {
  const { earned, spoilersOn, selectedId, onToggle, onSelect } = ctx;
  const masked = isSpoilerMasked(t, earned, spoilersOn);
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'card' + (earned.has(t.id) ? ' earned' : '');
  card.setAttribute('aria-selected', String(selectedId === t.id));
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', `Earned: ${t.name}`);
  box.addEventListener('click', (e) => e.stopPropagation());
  box.addEventListener('change', () => onToggle(t.id, box.checked));
  const mid = document.createElement('span');
  const name = document.createElement('div');
  name.className = 'name';
  name.textContent = masked ? 'Hidden story trophy — earn it to reveal' : t.name;
  if (t.hidden && !masked) {
    const mark = document.createElement('span');
    mark.className = 'hiddenmark';
    mark.textContent = ' (hidden on PSN)';
    name.append(mark);
  }
  const desc = document.createElement('div');
  desc.className = 'desc';
  desc.textContent = masked ? 'Spoiler hidden until earned.' : t.description;
  mid.append(name, desc, tagRow(t));
  const target = document.createElement('span');
  target.className = 'target';
  target.textContent = t.target ? `PSN target ${t.target}` : '';
  card.append(box, medalFor(t.grade), mid, target);
  card.addEventListener('click', () => onSelect(t.id));
  return card;
}

// The detail pane: official description, the guide in this entry's own
// words, the missable warning where one applies, and the sources each fact
// comes from. Links open only when the reader follows them; the app itself
// fetches nothing.
export function renderDetail(host, t, ctx) {
  const { earned, sources } = ctx;
  if (!t) {
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = 'Pick a trophy to see its guide, sources and tips.';
    host.replaceChildren(p);
    return;
  }
  const wrap = document.createElement('div');
  const h = document.createElement('h2');
  h.textContent = t.name;
  wrap.append(h, medalFor(t.grade));
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = `Official description: “${t.description}” — ${t.grade}, PSN target ${t.target ?? 'none'}.`;
  wrap.append(official);
  wrap.append(tagRow(t));
  if (t.missable) {
    const warn = document.createElement('div');
    warn.className = 'warnbox';
    const b = document.createElement('b');
    b.textContent = 'Possibly missable. ';
    warn.append(b, document.createTextNode(t.missableNote ?? 'Do it when it first appears — it may not come back.'));
    wrap.append(warn);
  }
  const guideTitle = document.createElement('h3');
  guideTitle.textContent = 'Guide';
  const guide = document.createElement('p');
  guide.className = 'guide';
  guide.textContent = t.guide;
  wrap.append(guideTitle, guide);
  if (t.tips && t.tips.length) {
    const tipsTitle = document.createElement('h3');
    tipsTitle.textContent = 'Tips';
    const ul = document.createElement('ul');
    for (const tip of t.tips) {
      const li = document.createElement('li');
      li.textContent = tip;
      ul.append(li);
    }
    wrap.append(tipsTitle, ul);
  }
  const srcTitle = document.createElement('h3');
  srcTitle.textContent = 'Sources';
  const ul = document.createElement('ul');
  ul.className = 'sources';
  for (const key of t.sources ?? []) {
    const s = sources[key];
    if (!s) continue;
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.rel = 'noopener';
    a.textContent = s.label;
    li.append(a, document.createTextNode(` — ${s.note}`));
    ul.append(li);
  }
  if (!ul.children.length) {
    const li = document.createElement('li');
    li.textContent = 'Official list (Exophase / PSNProfiles) — name, description and grade only.';
    ul.append(li);
  }
  wrap.append(srcTitle, ul);
  const state = document.createElement('p');
  state.className = 'note';
  state.textContent = earned.has(t.id) ? 'Earned — ticked in your checklist.' : 'Not earned yet — tick the box in the list when you get it.';
  wrap.append(state);
  host.replaceChildren(wrap);
}

// The missables page: the one trophy that may be missed, plus the things
// that look missable but are not, so a reader does not restart a run over
// nothing. Built from the official descriptions and PowerPyx's roadmap.
export function renderMissables(host, trophies) {
  const wrap = document.createElement('div');
  wrap.className = 'missable-list';
  const flagged = trophies.filter((t) => t.missable);
  for (const t of flagged) {
    const section = document.createElement('section');
    section.className = 'flag';
    const h = document.createElement('h2');
    h.textContent = `${t.name} — the only possibly missable trophy`;
    const p = document.createElement('p');
    p.textContent = t.missableNote ?? '';
    const guide = document.createElement('p');
    guide.textContent = t.guide;
    section.append(h, p, guide);
    wrap.append(section);
  }
  const safe = document.createElement('section');
  safe.className = 'safe';
  const h2 = document.createElement('h2');
  h2.textContent = 'Everything else cannot be missed';
  const p = document.createElement('p');
  p.textContent = 'Per PowerPyx (18 Nov 2026): every story trophy pops as you play; every side-quest giver (Andy, Kenton, Billy, Randy, Tyrone, Bret) is available again after the story; optional missions that disappear do not matter for trophies; the 100% checklist is fully doable in free roam after the credits. There is no mission replay and no New Game+, so keep manual saves at the start and end of each chapter anyway.';
  const p2 = document.createElement('p');
  p2.textContent = 'One more trap: cheats disable trophies and saving for the session (61 cheats, all unlocked only after the story). Save first, then cheat in a throwaway session.';
  safe.append(h2, p, p2);
  wrap.append(safe);
  host.replaceChildren(wrap);
}

// The about page: what the list is, where every fact comes from, and the
// honest limits of a guide written on launch week.
export function renderAbout(host, sources) {
  const wrap = document.createElement('div');
  wrap.className = 'about';
  const h = document.createElement('h2');
  h.textContent = 'About this guide';
  const p = document.createElement('p');
  p.textContent = 'An offline, open-source tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI: 1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden on PSN until earned. Progress is saved in this browser only (localStorage) and can be exported and imported as JSON. The app makes no network request at run time.';
  const h2 = document.createElement('h2');
  h2.textContent = 'Sources';
  const ul = document.createElement('ul');
  for (const key of Object.keys(sources)) {
    const s = sources[key];
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.rel = 'noopener';
    a.textContent = s.label;
    li.append(a, document.createTextNode(` — ${s.note}`));
    ul.append(li);
  }
  const h3 = document.createElement('h2');
  h3.textContent = 'What is not yet confirmed';
  const p2 = document.createElement('p');
  p2.textContent = 'GTA VI released 19 Nov 2026. Five trophies (In The Beginning…, Capital Offense, Bad Luck, I Guess, The Truth Is Out There, Ten Pin) have no confirmed unlock method in any published guide yet; their entries say so plainly and give only what the official description suggests. Where a guide step is not pinned down, the entry says so instead of inventing a location.';
  wrap.append(h, p, h2, ul, h3, p2);
  host.replaceChildren(wrap);
}

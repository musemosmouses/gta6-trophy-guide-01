// The platinum roadmap, built from the official descriptions and the
// published roadmaps (PowerPyx, 18 Nov 2026): three steps, about 200 hours,
// one playthrough, no online trophies, one possibly missable trophy.
export const ROADMAP_FACTS = [
  { label: 'Difficulty', value: '4 / 10 (PowerPyx)' },
  { label: 'Time to platinum', value: 'about 200 hours' },
  { label: 'Playthroughs', value: '1 — free roam after the story, no mission replay' },
  { label: 'Online trophies', value: '0 — every trophy is single-player' },
  { label: 'Missable', value: 'potentially 1 — Positive Mental Attitude' },
  { label: 'Cheats', value: 'disable trophies and saving — keep runs cheat-free' },
];

export const ROADMAP_STEPS = [
  {
    title: 'Step 1 — Play the story, take the side quests as they come',
    hours: '60–80 hours',
    body: 'Finish the five chapters (Gone Fishing to the final mission) and do optional missions as they appear: the character questlines for Andy, Kenton, Billy, Randy, Tyrone and Bret, plus Cal’s fishing line. Scan vehicles with the WAiNK app and study animals through the binoculars as you go — progress toward the 100% checklist counts before the checklist itself becomes visible.',
    items: [
      'Meditate at Jason’s house in Chapter 1: the one possibly missable trophy (Positive Mental Attitude). After the mission “Down to Earth”, talk to Lucia in the kitchen in the morning, follow her to the balcony and accept.',
      'Keep a manual save at the start and end of each chapter (15 manual slots, 1 autosave). There is no mission replay and no New Game+.',
      'Do not use cheats: they disable trophies and saving for the session.',
    ],
  },
  {
    title: 'Step 2 — The 100% Completion checklist',
    hours: 'about 100 hours',
    body: 'After the credits the checklist opens under Progress > Stats > 100% Completion. It is lenient — closer to 60% true completion — and nothing on it is missable. Most of it falls out of the other trophies.',
    items: [
      'Any 100 optional missions (there are 200–300+), 200 of 277 base-model vehicles scanned, 100 of 255 animals studied, 50 of 66 weapons.',
      '300 of 397 stunts (250 for the Cunning Stunts trophy), 70 of 80 challenges (50 for One Last Thing), all 42 Shooting Range golds, all 42 drone races, all 8 bank vaults, all 39 gang operations, all 15 of Bret’s target decks.',
      '15 of 18 meditation spots count for 100% — the Chapter 1 house meditation is not needed here, only (maybe) for Positive Mental Attitude.',
    ],
  },
  {
    title: 'Step 3 — Strangers & Freaks and cleanup',
    hours: 'about 10 hours',
    body: 'Strangers & Freaks strands do not count toward 100%, so finish the 8 that count (Kirk, Kyle, Yago and Pilot Pete are confirmed) and sweep up whatever is left: the odd one-off trophies, the last card sets, garages and vehicle registrations.',
    items: [
      'Buy the 8 purchasable garages ($160,000 total) through the Vice City Real Estate phone app, then register 10 vehicles with the Scooter Bros app.',
      'Launder $250,000 of marked bills through a fence (Yasmani pays best) and spend $100,000 across shops — both are running totals.',
      'Earn the platinum, Vice Got a Price!, the moment the 54th other trophy pops.',
    ],
  },
];

export function renderRoadmap(host) {
  const wrap = document.createElement('div');
  wrap.className = 'roadmap';
  const facts = document.createElement('p');
  facts.className = 'facts';
  for (const f of ROADMAP_FACTS) {
    const s = document.createElement('span');
    const b = document.createElement('b');
    b.textContent = `${f.label}: `;
    s.append(b, document.createTextNode(f.value));
    facts.append(s);
  }
  wrap.append(facts);
  for (const step of ROADMAP_STEPS) {
    const section = document.createElement('section');
    section.className = 'step';
    const h = document.createElement('h2');
    h.textContent = step.title;
    const hours = document.createElement('span');
    hours.className = 'hours';
    hours.textContent = ` — ${step.hours}`;
    h.append(hours);
    const p = document.createElement('p');
    p.textContent = step.body;
    const ul = document.createElement('ul');
    for (const item of step.items) {
      const li = document.createElement('li');
      li.textContent = item;
      ul.append(li);
    }
    section.append(h, p, ul);
    wrap.append(section);
  }
  const note = document.createElement('p');
  note.className = 'note';
  note.textContent = 'Roadmap facts: PowerPyx GTA 6 Trophy Guide & Roadmap, 18 Nov 2026 (difficulty, hours, missable, checklist thresholds). Names, descriptions and grades are the official list as Exophase and PSNProfiles publish it.';
  wrap.append(note);
  host.replaceChildren(wrap);
}

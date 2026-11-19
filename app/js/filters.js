// Filtering rules for the checklist: grade, kind, status, search text, and
// the spoiler setting (story trophies stay masked until earned).
export const KIND_LABELS = {
  story: 'Story',
  'side-quest': 'Side quests',
  collectible: 'Collectibles',
  activity: 'Activities',
  crime: 'Crime & robbery',
  exploration: 'Exploration',
  money: 'Money',
  combat: 'Combat',
  platinum: 'Platinum',
};

export function normalizeQuery(q) {
  return q.trim().toLowerCase();
}

export function trophyMatches(t, filters, earned, spoilersOn) {
  if (filters.grade !== 'all' && t.grade !== filters.grade) return false;
  if (filters.kind !== 'all' && t.kind !== filters.kind) return false;
  if (filters.missableOnly && !t.missable) return false;
  if (filters.status === 'earned' && !earned.has(t.id)) return false;
  if (filters.status === 'remaining' && earned.has(t.id)) return false;
  if (filters.query) {
    const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
    if (!hay.includes(filters.query)) return false;
  }
  return true;
}

// With spoilers on, a story trophy the reader has not earned shows a mask
// instead of its name and description. Earned ones always show in full.
export function isSpoilerMasked(t, earned, spoilersOn) {
  return spoilersOn && t.kind === 'story' && !earned.has(t.id);
}

export function gradeCounts(trophies, earned) {
  const out = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
  for (const t of trophies) {
    out[t.grade][1] += 1;
    if (earned.has(t.id)) out[t.grade][0] += 1;
  }
  return out;
}

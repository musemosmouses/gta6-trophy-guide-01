// Progress store: earned trophy ids kept in localStorage, with export/import.
// Nothing here touches the network; the file a reader downloads is plain JSON.
export const STORE_KEY = 'leonida-trophy-guide-v1';
export const SEED_KEY = 'leonida-trophy-guide-seed';

// A fixed demo set (13 of 55) used only when the page opens with ?seed=1,
// so screenshots show a guide part-way through. Deterministic by design.
export const DEMO_EARNED = [2, 3, 4, 8, 16, 20, 21, 35, 42, 44, 52, 53, 55];

export function loadEarned() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((n) => Number.isInteger(n)));
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
  } catch {
    // Private mode or a full quota: the checklist still works in memory.
  }
}

export function seedDemoIfRequested() {
  const params = new URLSearchParams(location.search);
  if (params.get('seed') !== '1') return null;
  const seeded = new Set(DEMO_EARNED);
  saveEarned(seeded);
  return seeded;
}

export function exportProgress(earned) {
  const blob = new Blob([JSON.stringify({ app: 'leonida-trophy-guide', earned: [...earned].sort((a, b) => a - b) }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(url);
}

export async function importProgress(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const list = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(list)) throw new Error('not a progress file');
  return new Set(list.filter((n) => Number.isInteger(n)));
}

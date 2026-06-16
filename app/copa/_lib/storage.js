const KEY = 'copa_2026';
const CACHE_TTL = 5 * 60 * 1000;

const DEFAULTS = { favorites: [], cache: {} };

function load() {
  if (typeof window === 'undefined') return structuredClone(DEFAULTS);
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    return structuredClone(DEFAULTS);
  }
}

function save(data) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function getFavorites() {
  return load().favorites || [];
}

export function toggleFavorite(teamName) {
  const data = load();
  const favs = data.favorites || [];
  const idx = favs.indexOf(teamName);
  if (idx >= 0) favs.splice(idx, 1);
  else favs.push(teamName);
  data.favorites = favs;
  save(data);
  return [...favs];
}

export function getCached(cacheKey) {
  const data = load();
  const entry = data.cache?.[cacheKey];
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) return null;
  return entry.value;
}

export function setCached(cacheKey, value) {
  const data = load();
  if (!data.cache) data.cache = {};
  data.cache[cacheKey] = { ts: Date.now(), value };
  save(data);
}

export function clearCache() {
  const data = load();
  data.cache = {};
  save(data);
}

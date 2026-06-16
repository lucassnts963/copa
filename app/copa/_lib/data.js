// app/copa/_lib/data.js — Data fetching from lucas-data (live) + public/ (static)

const LIVE_BASE = 'https://raw.githubusercontent.com/lucassnts963/lucas-data/main/wc2026';
const STATIC_BASE = '/data/copa';

async function fetchJSON(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

// Live data (updates every 15 min via cronjob)
export async function fetchLiveScores() {
  return fetchJSON(`${LIVE_BASE}/live-scores.json`);
}

export async function fetchStandings() {
  return fetchJSON(`${LIVE_BASE}/standings.json`);
}

export async function fetchBracket() {
  return fetchJSON(`${LIVE_BASE}/bracket.json`);
}

// Static data (bundled at build time)
export async function fetchTeams() {
  return fetchJSON(`${STATIC_BASE}/teams.json`);
}

export async function fetchVenues() {
  return fetchJSON(`${STATIC_BASE}/venues.json`);
}

export async function fetchCazetv() {
  try {
    return await fetchJSON(`${STATIC_BASE}/cazetv.json`);
  } catch {
    return {};
  }
}

// Fallback: try live, fall back to static
export async function fetchLiveWithFallback(liveFile, staticFile) {
  try {
    return await fetchJSON(`${LIVE_BASE}/${liveFile}.json`);
  } catch {
    console.warn(`Live data unavailable for ${liveFile}, using static fallback`);
    try {
      return await fetchJSON(`${STATIC_BASE}/${staticFile || liveFile}.json`);
    } catch {
      return null;
    }
  }
}

// Utility helpers (preserved from old api.js)
export function matchDate(match) {
  return new Date(match.date_utc || match.local_date || Date.now());
}

export function isToday(match) {
  const d = matchDate(match);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export function formatDate(match) {
  return matchDate(match).toLocaleDateString('pt-BR', {
    weekday: 'short', day: '2-digit', month: '2-digit',
  });
}

export function formatTime(match) {
  return matchDate(match).toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit',
  });
}

export function groupByDate(matches) {
  const map = {};
  for (const m of matches) {
    const key = matchDate(m).toISOString().slice(0, 10);
    if (!map[key]) map[key] = [];
    map[key].push(m);
  }
  return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
}

export function isLive(match) {
  return match.status === 'in_progress';
}

export function isFinished(match) {
  return match.status === 'completed';
}

export function isFuture(match) {
  return match.status === 'future';
}

export function stagePtBR(stageName) {
  const map = {
    'First Stage': 'Fase de Grupos',
    'Group Stage': 'Fase de Grupos',
    'Round of sixteen': 'Oitavas de Final',
    'Quarter-final': 'Quartas de Final',
    'Semi-final': 'Semifinais',
    'Play-off for third place': 'Disputa 3º Lugar',
    'Final': 'Final',
  };
  return map[stageName] || stageName || '';
}

// Flag helper: returns local flag URL via API route (cache-friendly)
export function flagSrc(countryCode, size = 64) {
  if (!countryCode) return '';
  const code = countryCode.toLowerCase();
  return `/api/flags/${code}?size=${size}`;
}

export function flagSrcSet(countryCode) {
  if (!countryCode) return '';
  const code = countryCode.toLowerCase();
  return `/api/flags/${code}?size=16 16w, /api/flags/${code}?size=32 32w, /api/flags/${code}?size=64 64w, /api/flags/${code}?size=128 128w, /api/flags/${code}?size=256 256w`;
}

export function computeScorers(matches) {
  const map = {};
  for (const m of matches) {
    for (const ev of m.home_team_events || []) {
      if (ev.type_of_event === 'goal' || ev.type_of_event === 'goal-penalty') {
        if (!map[ev.player]) map[ev.player] = { player: ev.player, team: m.home_team?.name || '', goals: 0, penalties: 0 };
        map[ev.player].goals++;
        if (ev.type_of_event === 'goal-penalty') map[ev.player].penalties++;
      }
    }
    for (const ev of m.away_team_events || []) {
      if (ev.type_of_event === 'goal' || ev.type_of_event === 'goal-penalty') {
        if (!map[ev.player]) map[ev.player] = { player: ev.player, team: m.away_team?.name || '', goals: 0, penalties: 0 };
        map[ev.player].goals++;
        if (ev.type_of_event === 'goal-penalty') map[ev.player].penalties++;
      }
    }
  }
  return Object.values(map).sort((a, b) => b.goals - a.goals);
}

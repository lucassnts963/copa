async function call(path) {
  const res = await fetch(path);
  if (!res.ok) {
    let msg = `Erro ${res.status}`;
    try {
      const j = await res.json();
      if (j.error) msg += `: ${j.error}`;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function getMatches() {
  return call('/api/copa/matches');
}

export async function getGroups() {
  return call('/api/copa/groups');
}

export async function getTeams() {
  return call('/api/copa/teams');
}

export async function getPlayers(teamId) {
  return call(`/api/copa/players${teamId ? `?team=${teamId}` : ''}`);
}

export async function getBracket() {
  return call('/api/copa/bracket');
}

export async function getRankings() {
  return call('/api/copa/rankings');
}

export async function getScorers() {
  return call('/api/copa/scorers');
}

export function matchDate(match) {
  return new Date(match.datetime);
}

export function isToday(match) {
  const d = matchDate(match);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export function formatDate(match) {
  return matchDate(match).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
}

export function formatTime(match) {
  return matchDate(match).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
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
  return match.status === 'in progress';
}

export function isFinished(match) {
  return match.status === 'completed';
}

export function stagePtBR(stageName) {
  const map = {
    group: 'Fase de Grupos',
    'Group Stage': 'Fase de Grupos',
    round_of_32: 'Oitavos de Final',
    round_of_16: 'Oitavas de Final',
    'Round of 16': 'Oitavas de Final',
    quarter_finals: 'Quartas de Final',
    'Quarter-finals': 'Quartas de Final',
    semi_finals: 'Semifinais',
    'Semi-finals': 'Semifinais',
    third_place: 'Disputa 3º Lugar',
    'Third-place play-off': 'Disputa 3º Lugar',
    final: 'Final',
    'Final': 'Final',
  };
  return map[stageName] || stageName || '';
}

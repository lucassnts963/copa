// Bolão da Copa — estado client-side (localStorage) + pontuação.
// Funcionalidade do app Copa 2026.

const KEY = 'bolao_2026';

function load() {
  if (typeof window === 'undefined') return { pools: [] };
  try { return JSON.parse(localStorage.getItem(KEY) || '{"pools":[]}'); } catch { return { pools: [] }; }
}

function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function uid() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export function getPools() {
  return load().pools;
}

export function getPool(id) {
  return load().pools.find(p => p.id === id) ?? null;
}

export function createPool(title, ownerName) {
  const data = load();
  const pool = {
    id: uid(),
    code: uid().slice(0, 6),
    title,
    createdAt: new Date().toISOString(),
    participants: [
      { id: uid(), name: ownerName, guesses: {} },
    ],
  };
  data.pools.push(pool);
  save(data);
  return pool;
}

export function addParticipant(poolId, name) {
  const data = load();
  const pool = data.pools.find(p => p.id === poolId);
  if (!pool) return null;
  const participant = { id: uid(), name, guesses: {} };
  pool.participants.push(participant);
  save(data);
  return participant;
}

export function removeParticipant(poolId, participantId) {
  const data = load();
  const pool = data.pools.find(p => p.id === poolId);
  if (!pool) return;
  pool.participants = pool.participants.filter(p => p.id !== participantId);
  save(data);
}

export function setGuess(poolId, participantId, matchId, home, away) {
  const data = load();
  const pool = data.pools.find(p => p.id === poolId);
  if (!pool) return;
  const participant = pool.participants.find(p => p.id === participantId);
  if (!participant) return;
  participant.guesses[matchId] = { home: Number(home), away: Number(away) };
  save(data);
}

export function deletePool(poolId) {
  const data = load();
  data.pools = data.pools.filter(p => p.id !== poolId);
  save(data);
}

// ── Pontuação ──────────────────────────────────────────────
// 3pts placar exato, 1pt resultado certo (V/E/D), 0pts errado
export function pointsForGuess(guess, result) {
  if (!guess || result.homeGoals == null || result.awayGoals == null) return null;

  const { home: gh, away: ga } = guess;
  const { homeGoals: rh, awayGoals: ra } = result;

  if (gh === rh && ga === ra) return 3;

  const guessOutcome = gh > ga ? 'H' : gh < ga ? 'A' : 'D';
  const resultOutcome = rh > ra ? 'H' : rh < ra ? 'A' : 'D';

  return guessOutcome === resultOutcome ? 1 : 0;
}

export function rankParticipants(participants, completedMatches) {
  return participants
    .map(p => {
      let points = 0;
      let exact = 0;
      let correct = 0;
      let guessed = 0;

      for (const match of completedMatches) {
        const guess = p.guesses[match.id];
        if (!guess) continue;
        guessed++;
        const pts = pointsForGuess(guess, match);
        if (pts === 3) { points += 3; exact++; }
        else if (pts === 1) { points += 1; correct++; }
      }

      return { ...p, points, exact, correct, guessed };
    })
    .sort((a, b) => b.points - a.points || b.exact - a.exact || b.correct - a.correct);
}

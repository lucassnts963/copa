'use client';

const ROUNDS = [
  { key: 'round_of_32', label: 'Oitavas de Final', short: 'R32' },
  { key: 'round_of_16', label: 'Quartas de Final', short: 'R16' },
  { key: 'quarter_finals', label: 'Semifinais', short: 'QF' },
  { key: 'semi_finals', label: 'Final 4', short: 'SF' },
  { key: 'final', label: 'Final', short: 'FIN', single: true },
];

function teamFlag(teamId, teamLookup) {
  if (!teamId) return '❓';
  const t = teamLookup[teamId];
  return t?.emoji_string || t?.flag || teamId;
}

function teamName(teamId, teamLookup) {
  if (!teamId) return '?';
  return teamLookup[teamId]?.name || teamId;
}

function MatchCard({ match, teamLookup, compact }) {
  if (!match) return null;
  const { homeId, awayId, homeGoals, awayGoals, status } = match;
  const done = status === 'completed';
  const live = status === 'in progress';

  const homeWin = done && homeGoals > awayGoals;
  const awayWin = done && awayGoals > homeGoals;

  return (
    <div className={`bg-zinc-900 border rounded-lg overflow-hidden ${live ? 'border-yellow-400/50' : 'border-zinc-800'} ${compact ? 'text-xs' : 'text-sm'}`}>
      {live && (
        <div className="bg-yellow-400/10 px-2 py-0.5 text-yellow-400 text-xs font-medium text-center">
          AO VIVO
        </div>
      )}
      {[{ id: homeId, goals: homeGoals, win: homeWin }, { id: awayId, goals: awayGoals, win: awayWin }].map((side, i) => (
        <div
          key={i}
          className={`flex items-center gap-2 px-3 py-2 ${i === 0 ? 'border-b border-zinc-800' : ''} ${side.win ? 'bg-zinc-800/50' : ''}`}
        >
          <span className="text-base leading-none flex-shrink-0">{teamFlag(side.id, teamLookup)}</span>
          <span className={`flex-1 truncate font-medium ${side.win ? 'text-white' : done ? 'text-zinc-500' : 'text-zinc-300'}`}>
            {teamName(side.id, teamLookup)}
          </span>
          {done || live ? (
            <span className={`tabular-nums font-bold flex-shrink-0 ${side.win ? 'text-yellow-400' : 'text-zinc-400'}`}>
              {side.goals ?? 0}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function RoundColumn({ round, matches, teamLookup }) {
  const items = Array.isArray(matches) ? matches : (matches ? [matches] : []);
  return (
    <div className="flex-shrink-0 w-52">
      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 text-center">{round.label}</h3>
      <div className="flex flex-col gap-2">
        {items.length === 0 ? (
          <div className="text-zinc-700 text-xs text-center py-4">A definir</div>
        ) : (
          items.map((m, i) => <MatchCard key={m?.id || i} match={m} teamLookup={teamLookup} />)
        )}
      </div>
    </div>
  );
}

export default function Bracket({ bracket, teamLookup }) {
  if (!bracket) {
    return <div className="text-center py-20 text-zinc-500 text-sm">Chaveamento indisponível.</div>;
  }

  const rounds = ROUNDS.filter(r => r.single ? bracket[r.key] : Array.isArray(bracket[r.key]) && bracket[r.key].length > 0);
  const hasAny = rounds.length > 0 || bracket.third_place;

  if (!hasAny) {
    return (
      <div className="text-center py-20 text-zinc-500 space-y-2">
        <div className="text-4xl">🏆</div>
        <p className="text-sm">Chaveamento disponível após a fase de grupos.</p>
        <p className="text-xs text-zinc-600">Execute <code className="text-yellow-400/80">pnpm copa:live</code> para atualizar.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max">
          {ROUNDS.map(r => {
            const data = bracket[r.key];
            if (!data && (!Array.isArray(data) || data.length === 0)) return null;
            return (
              <RoundColumn
                key={r.key}
                round={r}
                matches={data}
                teamLookup={teamLookup}
              />
            );
          })}
          {bracket.third_place && (
            <div className="flex-shrink-0 w-52 self-end">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 text-center">3º Lugar</h3>
              <MatchCard match={bracket.third_place} teamLookup={teamLookup} />
            </div>
          )}
        </div>
      </div>
      {bracket.updated_at && (
        <p className="text-xs text-zinc-700 text-center mt-4">
          Atualizado em {new Date(bracket.updated_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  );
}

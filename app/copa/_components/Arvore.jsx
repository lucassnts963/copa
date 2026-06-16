'use client';

function MatchSlot({ match, teamFlagMap, countryCodeMap }) {
  if (!match) {
    return (
      <div className="py-3 px-3 rounded-lg border border-zinc-800 bg-zinc-900/50">
        <div className="text-xs text-zinc-600 text-center">A definir</div>
      </div>
    );
  }

  const home = match.home_team || {};
  const away = match.away_team || {};
  const isDone = match.status === 'completed';
  const codeH = countryCodeMap[home.name] || home.country_code || '';
  const codeA = countryCodeMap[away.name] || away.country_code || '';
  const flagH = teamFlagMap[home.name] || home.flag || '';
  const flagA = teamFlagMap[away.name] || away.flag || '';

  return (
    <div className={`py-2 px-3 rounded-lg border ${isDone ? 'border-green-500/30 bg-green-500/5' : 'border-zinc-700 bg-zinc-900'}`}>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs">
          {codeH ? (
            <img src={flagSrc(codeH, 32)} srcSet={flagSrcSet(codeH)} sizes="32px" alt={home.name || ''} className="w-5 h-4 object-cover rounded-sm flex-shrink-0" />
          ) : flagH ? (
            <span className="text-sm">{flagH}</span>
          ) : null}
          <span className={isDone && home.score > away.score ? 'text-white font-semibold' : 'text-zinc-300'}>{home.name || '?'}</span>
          <span className="ml-auto tabular-nums font-bold text-white">{home.score ?? '-'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {codeA ? (
            <img src={flagSrc(codeA, 32)} srcSet={flagSrcSet(codeA)} sizes="32px" alt={away.name || ''} className="w-5 h-4 object-cover rounded-sm flex-shrink-0" />
          ) : flagA ? (
            <span className="text-sm">{flagA}</span>
          ) : null}
          <span className={isDone && away.score > home.score ? 'text-white font-semibold' : 'text-zinc-300'}>{away.name || '?'}</span>
          <span className="ml-auto tabular-nums font-bold text-white">{away.score ?? '-'}</span>
        </div>
      </div>
      {isDone && (
        <div className="mt-1 text-xs text-zinc-500">
          {match.venue} · {match.attendance ? `${Number(match.attendance).toLocaleString('pt-BR')} pessoas` : match.match_time ? `${match.match_time}'` : ''}
        </div>
      )}
    </div>
  );
}

function RoundColumn({ name, matches }) {
  return (
    <div className="flex flex-col gap-2 min-w-[180px] max-w-[220px]">
      <h3 className="text-xs font-semibold text-yellow-400 text-center mb-1">{name}</h3>
      {matches.map((m, i) => (
<MatchSlot key={m.id || i} match={m} teamFlagMap={teamFlagMap} countryCodeMap={countryCodeMap} />
      ))}
    </div>
  );
}

const ROUND_ORDER = ['round_of_16', 'quarter_finals', 'semi_finals', 'third_place', 'final'];

export default function Arvore({ bracket, teamFlagMap, countryCodeMap }) {
  // Build a flat array of rounds with their matches
  const rounds = [];
  if (bracket && typeof bracket === 'object') {
    for (const key of ROUND_ORDER) {
      if (bracket[key]) {
        let matches = bracket[key].matches || [];
        if (key === 'final' && matches.length === 1) {
          // Final: show as single match
        }
        rounds.push({ name: bracket[key].name, matches });
      }
    }
  }

  if (rounds.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-500 space-y-2">
        <div className="text-4xl">🏟️</div>
        <p className="text-sm">Chaveamento disponível durante o mata-mata.</p>
        <p className="text-xs text-zinc-600">Acompanhando fase de grupos no momento.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-zinc-500 mb-4">Chaveamento do mata-mata</p>
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {rounds.map((round, i) => (
            <RoundColumn key={i} name={round.name} matches={round.matches} />
          ))}
        </div>
      </div>
    </div>
  );
}

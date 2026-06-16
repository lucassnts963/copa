'use client';

export default function Artilharia({ scorers, teamLookup }) {
  const list = Array.isArray(scorers) ? scorers.slice(0, 30) : [];

  if (list.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-500 space-y-2">
        <div className="text-4xl">⚽</div>
        <p className="text-sm">Artilharia disponível após os primeiros gols.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
          <span>⚽</span>
          <h3 className="font-bold text-white text-sm">Artilheiros</h3>
        </div>
        {list.map((s, idx) => {
          const teamId = s.teamId || s.team_id;
          const teamEntry = teamId ? teamLookup[teamId] : Object.values(teamLookup).find(t => t.name === s.team);
          const flag = teamEntry?.emoji_string || teamEntry?.flag || '';
          const name = s.name || s.player || '';
          const team = teamEntry?.name || s.team || '';
          return (
            <div
              key={`${name}-${idx}`}
              className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors"
            >
              <span className={`w-7 text-center font-bold text-sm tabular-nums flex-shrink-0 ${idx < 3 ? 'text-yellow-400' : 'text-zinc-600'}`}>
                {idx + 1}
              </span>
              {flag && <span className="text-xl leading-none flex-shrink-0">{flag}</span>}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{name}</p>
                <p className="text-zinc-500 text-xs">{team}</p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-center">
                  <p className="font-bold text-white text-sm tabular-nums">{s.goals ?? 0}</p>
                  <p className="text-zinc-600 text-xs">gols</p>
                </div>
                {(s.assists ?? 0) > 0 && (
                  <div className="text-center">
                    <p className="font-bold text-zinc-400 text-sm tabular-nums">{s.assists}</p>
                    <p className="text-zinc-600 text-xs">ass.</p>
                  </div>
                )}
                {(s.penalties ?? 0) > 0 && (
                  <div className="text-center">
                    <p className="font-bold text-zinc-500 text-sm tabular-nums">{s.penalties}</p>
                    <p className="text-zinc-600 text-xs">pen.</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

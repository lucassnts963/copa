'use client';

function classifyTeams(rankings) {
  // Group by group letter, find top 2 per group
  const byGroup = {};
  for (const t of rankings) {
    if (!byGroup[t.group]) byGroup[t.group] = [];
    byGroup[t.group].push(t);
  }

  const top2Ids = new Set();
  const third = [];

  for (const teams of Object.values(byGroup)) {
    const sorted = [...teams].sort((a, b) =>
      (b.points ?? 0) - (a.points ?? 0) ||
      ((b.gd ?? 0) - (a.gd ?? 0)) ||
      ((b.gf ?? 0) - (a.gf ?? 0))
    );
    if (sorted[0]) top2Ids.add(sorted[0].team_id);
    if (sorted[1]) top2Ids.add(sorted[1].team_id);
    if (sorted[2]) third.push(sorted[2]);
  }

  // Best 8 third-place by points→gd→gf
  third.sort((a, b) =>
    (b.points ?? 0) - (a.points ?? 0) ||
    ((b.gd ?? 0) - (a.gd ?? 0)) ||
    ((b.gf ?? 0) - (a.gf ?? 0))
  );
  const best8ThirdIds = new Set(third.slice(0, 8).map(t => t.team_id));

  return { top2Ids, best8ThirdIds };
}

export default function RankingGeral({ rankings, teamLookup, updatedAt }) {
  const list = Array.isArray(rankings) ? rankings : [];

  if (list.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-500 space-y-2">
        <div className="text-4xl">📊</div>
        <p className="text-sm">Ranking disponível após início da competição.</p>
        <p className="text-xs text-zinc-600">Execute <code className="text-yellow-400/80">pnpm copa:live</code> para atualizar.</p>
      </div>
    );
  }

  const { top2Ids, best8ThirdIds } = classifyTeams(list);

  const rowClass = (team) => {
    if (top2Ids.has(team.team_id)) return 'border-green-500/20 bg-green-500/5';
    if (best8ThirdIds.has(team.team_id)) return 'border-blue-500/20 bg-blue-500/5';
    return '';
  };

  const posColor = (team) => {
    if (top2Ids.has(team.team_id)) return 'text-green-400';
    if (best8ThirdIds.has(team.team_id)) return 'text-blue-400';
    return 'text-zinc-600';
  };

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />Top 2 do grupo (24)</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />Melhores 3ºs (8)</span>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-800">
                <th className="text-center px-3 py-2.5 font-medium w-8">#</th>
                <th className="text-left px-3 py-2.5 font-medium">Seleção</th>
                <th className="text-center px-2 py-2.5 font-medium w-8">Grp</th>
                <th className="text-center px-2 py-2.5 font-medium w-8">Pts</th>
                <th className="text-center px-2 py-2.5 font-medium w-8">J</th>
                <th className="text-center px-2 py-2.5 font-medium w-8">V</th>
                <th className="text-center px-2 py-2.5 font-medium w-8">E</th>
                <th className="text-center px-2 py-2.5 font-medium w-8">D</th>
                <th className="text-center px-2 py-2.5 font-medium w-8">GP</th>
                <th className="text-center px-2 py-2.5 font-medium w-8">GC</th>
                <th className="text-center px-2 py-2.5 font-medium w-8">SG</th>
              </tr>
            </thead>
            <tbody>
              {list.map((team) => {
                const t = teamLookup[team.team_id];
                const flag = t?.emoji_string || t?.flag || '';
                const name = team.team_name || t?.name || team.team_id;
                const sg = team.gd ?? ((team.gf ?? 0) - (team.ga ?? 0));
                return (
                  <tr
                    key={team.team_id}
                    className={`border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors ${rowClass(team)}`}
                  >
                    <td className={`text-center px-3 py-2.5 font-bold tabular-nums ${posColor(team)}`}>{team.rank}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        {flag && <span className="text-base leading-none flex-shrink-0">{flag}</span>}
                        <span className="text-white font-medium truncate max-w-[120px]">{name}</span>
                      </div>
                    </td>
                    <td className="text-center px-2 py-2.5 text-zinc-500">{team.group}</td>
                    <td className="text-center px-2 py-2.5 font-bold text-white">{team.points ?? 0}</td>
                    <td className="text-center px-2 py-2.5 text-zinc-400">{team.played ?? 0}</td>
                    <td className="text-center px-2 py-2.5 text-zinc-400">{team.won ?? 0}</td>
                    <td className="text-center px-2 py-2.5 text-zinc-400">{team.drawn ?? 0}</td>
                    <td className="text-center px-2 py-2.5 text-zinc-400">{team.lost ?? 0}</td>
                    <td className="text-center px-2 py-2.5 text-zinc-400">{team.gf ?? 0}</td>
                    <td className="text-center px-2 py-2.5 text-zinc-400">{team.ga ?? 0}</td>
                    <td className={`text-center px-2 py-2.5 ${sg > 0 ? 'text-green-400' : sg < 0 ? 'text-red-400' : 'text-zinc-400'}`}>
                      {sg > 0 ? `+${sg}` : sg}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {updatedAt && (
        <p className="text-xs text-zinc-700 text-center mt-3">
          Atualizado em {new Date(updatedAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  );
}

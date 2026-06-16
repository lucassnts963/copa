'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';

function GroupTable({ group, favorites, teamLookup }) {
  const sorted = [...(group.teams || [])].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const sgA = (a.goals_for || 0) - (a.goals_against || 0);
    const sgB = (b.goals_for || 0) - (b.goals_against || 0);
    if (sgB !== sgA) return sgB - sgA;
    return (b.goals_for || 0) - (a.goals_for || 0);
  });

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800">
        <h3 className="font-bold text-white text-sm">{group.name}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-zinc-500 border-b border-zinc-800">
              <th className="text-left px-4 py-2 font-medium">Seleção</th>
              <th className="text-center px-2 py-2 font-medium w-8">PT</th>
              <th className="text-center px-2 py-2 font-medium w-8">J</th>
              <th className="text-center px-2 py-2 font-medium w-8">V</th>
              <th className="text-center px-2 py-2 font-medium w-8">E</th>
              <th className="text-center px-2 py-2 font-medium w-8">D</th>
              <th className="text-center px-2 py-2 font-medium w-8">GP</th>
              <th className="text-center px-2 py-2 font-medium w-8">GC</th>
              <th className="text-center px-2 py-2 font-medium w-8">SG</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((team, idx) => {
              const isFav = favorites.includes(team.id);
              const qualifies = idx < 2;
              const sg = (team.goals_for || 0) - (team.goals_against || 0);
              const t = teamLookup[team.id];
              const flag = t?.emoji_string || t?.flag || '';
              return (
                <tr
                  key={team.id}
                  className={`border-b border-zinc-800/50 last:border-0 ${isFav ? 'bg-yellow-400/5' : 'hover:bg-zinc-800/40'}`}
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 text-center font-bold flex-shrink-0 ${qualifies ? 'text-green-400' : 'text-zinc-600'}`}>{idx + 1}</span>
                      {flag && <span className="text-base leading-none flex-shrink-0">{flag}</span>}
                      <Link href={`/copa/${team.id}`} className={`font-medium truncate max-w-[110px] hover:underline ${isFav ? 'text-yellow-300' : 'text-white'}`}>
                        {team.name}
                      </Link>
                      {isFav && <Star size={10} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />}
                    </div>
                  </td>
                  <td className="text-center px-2 py-2.5 font-bold text-white">{team.points ?? 0}</td>
                  <td className="text-center px-2 py-2.5 text-zinc-400">{team.games_played ?? 0}</td>
                  <td className="text-center px-2 py-2.5 text-zinc-400">{team.wins ?? 0}</td>
                  <td className="text-center px-2 py-2.5 text-zinc-400">{team.draws ?? 0}</td>
                  <td className="text-center px-2 py-2.5 text-zinc-400">{team.losses ?? 0}</td>
                  <td className="text-center px-2 py-2.5 text-zinc-400">{team.goals_for ?? 0}</td>
                  <td className="text-center px-2 py-2.5 text-zinc-400">{team.goals_against ?? 0}</td>
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
  );
}

export default function Grupos({ groups, favorites, teamLookup }) {
  if (!Array.isArray(groups) || groups.length === 0) {
    return <div className="text-center py-16 text-zinc-500">Dados de grupos indisponíveis.</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
          Classificado (top 2)
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Star size={10} className="text-yellow-400 fill-yellow-400" />
          Favorito
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {groups.map(g => (
          <GroupTable key={g.id} group={g} favorites={favorites} teamLookup={teamLookup} />
        ))}
      </div>
    </div>
  );
}

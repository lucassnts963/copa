'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { groupByDate, formatDate, formatTime, isToday, isLive, isFinished, stagePtBR } from '../_lib/api';

const CAZETV_LIVE = 'https://www.youtube.com/@CazéTV/streams';

function statusBadge(match) {
  if (isLive(match)) {
    return (
      <span className="flex items-center gap-1 text-red-400 font-bold text-xs">
        <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
        AO VIVO
      </span>
    );
  }
  if (isFinished(match)) return <span className="text-zinc-500 text-xs">Encerrado</span>;
  if (match.status === 'postponed') return <span className="text-orange-400 text-xs">Adiado</span>;
  return <span className="text-zinc-400 text-sm font-medium">{formatTime(match)}</span>;
}

function ScoreOrVs({ match }) {
  if (isFinished(match) || isLive(match)) {
    return (
      <div className={`text-center px-3 flex-shrink-0 ${isLive(match) ? 'text-red-400' : 'text-white'}`}>
        <span className="text-2xl font-bold tabular-nums">
          {match.home_goals ?? '?'} <span className="text-zinc-500">–</span> {match.away_goals ?? '?'}
        </span>
      </div>
    );
  }
  return (
    <div className="text-center px-3 flex-shrink-0">
      <span className="text-zinc-500 text-lg font-medium">vs</span>
    </div>
  );
}

function TeamCell({ teamId, teamLookup, align = 'left' }) {
  const team = teamLookup[teamId] || {};
  const flag = team.flag || team.emoji_string || '';
  const name = team.name_pt || team.name || teamId || '?';
  return (
    <div className={`flex items-center gap-2 flex-1 min-w-0 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
      {flag
        ? <span className="text-2xl leading-none flex-shrink-0">{flag}</span>
        : <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs flex-shrink-0">?</div>
      }
      <span className="text-sm font-medium text-white truncate">{name}</span>
    </div>
  );
}

function MatchCard({ match, teamLookup, isFav }) {
  const live = isLive(match);
  const hasVideo = match.video_url || live;

  return (
    <div className={`bg-zinc-900 border rounded-xl overflow-hidden transition-colors ${isFav ? 'border-yellow-500/40' : 'border-zinc-800 hover:border-zinc-700'}`}>
      {/* Card principal — navega para página do jogo */}
      <Link href={`/copa/match/${match.id}`} className="block p-4">
        <div className="flex items-center gap-1 mb-3">
          <span className="text-xs text-zinc-500">{stagePtBR(match.stage)}</span>
          {match.group && <span className="text-xs text-zinc-600">• Grupo {match.group}</span>}
          <span className="ml-auto">{statusBadge(match)}</span>
        </div>
        <div className="flex items-center">
          <TeamCell teamId={match.home_team_id} teamLookup={teamLookup} />
          <ScoreOrVs match={match} />
          <TeamCell teamId={match.away_team_id} teamLookup={teamLookup} align="right" />
        </div>
      </Link>

      {/* Botão CazéTV — separado para não conflitar com o Link */}
      {hasVideo && (
        <div className="border-t border-zinc-800 px-4 py-2">
          <a
            href={match.video_url || CAZETV_LIVE}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-medium">{live ? 'Assistir ao vivo' : 'Assistir replay'}</span>
            <span className="text-zinc-600 ml-0.5">• CazéTV</span>
          </a>
        </div>
      )}
    </div>
  );
}

const FILTERS = [
  { id: 'todos',      label: 'Todos' },
  { id: 'hoje',       label: 'Hoje' },
  { id: 'proximos',   label: 'Próximos' },
  { id: 'encerrados', label: 'Encerrados' },
];

export default function Jogos({ matches: matchesProp, favorites, teamLookup }) {
  const [filter, setFilter] = useState('todos');

  const matches = useMemo(() => {
    if (Array.isArray(matchesProp)) return matchesProp;
    if (matchesProp?.matches) return matchesProp.matches;
    return [];
  }, [matchesProp]);

  const filtered = useMemo(() => {
    switch (filter) {
      case 'hoje':       return matches.filter(m => isToday(m));
      case 'proximos':   return matches.filter(m => m.status === 'upcoming' && new Date(m.datetime) > new Date());
      case 'encerrados': return matches.filter(m => isFinished(m));
      default:           return matches;
    }
  }, [matches, filter]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  return (
    <div>
      <div className="flex gap-2 mb-6 flex-wrap items-center">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.id ? 'bg-yellow-400 text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-zinc-600 self-center">{filtered.length} jogo(s)</span>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-zinc-500">Nenhum jogo encontrado.</div>
      )}

      <div className="space-y-6">
        {grouped.map(([dateKey, dayMatches]) => {
          const isT = isToday(dayMatches[0]);
          return (
            <div key={dateKey}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-sm font-semibold ${isT ? 'text-yellow-400' : 'text-zinc-400'}`}>
                  {isT ? '🔥 Hoje' : formatDate(dayMatches[0])}
                </span>
                <div className="flex-1 h-px bg-zinc-800" />
                <span className="text-xs text-zinc-600">{dayMatches.length} jogo(s)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dayMatches.map(m => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    teamLookup={teamLookup}
                    isFav={favorites.includes(m.home_team_id) || favorites.includes(m.away_team_id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Play } from 'lucide-react';

const POSITION_ORDER  = ['GK', 'DF', 'MF', 'FW'];
const POSITION_LABEL  = { GK: 'Goleiros', DF: 'Defensores', MF: 'Meio-campistas', FW: 'Atacantes' };
const CAZETV_LIVE     = 'https://www.youtube.com/@CazéTV/streams';

function flag(teamId, tl) {
  const t = tl[teamId];
  return t?.flag || t?.emoji_string || '🏳️';
}

function name(teamId, tl) {
  const t = tl[teamId];
  return t?.name_pt || t?.name || teamId || '?';
}

function stagePt(s) {
  const m = { group: 'Fase de Grupos', round_of_32: 'Round of 32', round_of_16: 'Round of 16',
    quarter_finals: 'Quartas de Final', semi_finals: 'Semifinais', third_place: '3º Lugar', final: 'Final' };
  return m[s] || s || '';
}

function formatDateTime(dt) {
  const d = new Date(dt);
  return d.toLocaleString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' });
}

function PlayerList({ players }) {
  if (!players || players.length === 0) {
    return <p className="text-xs text-zinc-600 py-2">Elenco não disponível</p>;
  }
  const byPos = POSITION_ORDER.reduce((acc, pos) => {
    const group = players.filter(p => p.position === pos).sort((a, b) => (a.number ?? 99) - (b.number ?? 99));
    if (group.length) acc[pos] = group;
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      {POSITION_ORDER.filter(pos => byPos[pos]).map(pos => (
        <div key={pos}>
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">{POSITION_LABEL[pos]}</p>
          {byPos[pos].map(p => (
            <div key={p.name} className="flex items-center gap-2 py-1.5 border-b border-zinc-800/50 last:border-0 text-xs">
              <span className="w-5 text-zinc-600 font-mono text-right flex-shrink-0">{p.number ?? '—'}</span>
              <span className="flex-1 text-white font-medium truncate">{p.name}</span>
              <span className="text-zinc-500 truncate max-w-[100px] hidden sm:block">{p.club}</span>
              {p.age && <span className="text-zinc-700 flex-shrink-0">{p.age}a</span>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function MatchPage({ params }) {
  const { matchId } = params;
  const [match,       setMatch]       = useState(null);
  const [teamLookup,  setTeamLookup]  = useState({});
  const [homePlayers, setHomePlayers] = useState([]);
  const [awayPlayers, setAwayPlayers] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [squad,       setSquad]       = useState('home');

  useEffect(() => {
    async function load() {
      try {
        const [matchRes, teamsRes] = await Promise.all([
          fetch('/api/copa/matches'),
          fetch('/api/copa/teams'),
        ]);
        const matchData = await matchRes.json();
        const teamsData = await teamsRes.json();

        const list  = Array.isArray(matchData) ? matchData : (matchData.matches || []);
        const found = list.find(m => m.id === matchId);
        setMatch(found || null);

        if (Array.isArray(teamsData)) {
          setTeamLookup(Object.fromEntries(teamsData.map(t => [t.id, t])));
        }

        if (found?.home_team_id && found?.away_team_id) {
          const [hp, ap] = await Promise.all([
            fetch(`/api/copa/players?team=${found.home_team_id}`).then(r => r.json()),
            fetch(`/api/copa/players?team=${found.away_team_id}`).then(r => r.json()),
          ]);
          setHomePlayers(Array.isArray(hp) ? hp : []);
          setAwayPlayers(Array.isArray(ap) ? ap : []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [matchId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <p className="text-zinc-500 text-sm">Carregando...</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center flex-col gap-3">
        <p className="text-zinc-500 text-sm">Partida não encontrada.</p>
        <Link href="/copa" className="text-yellow-400 text-sm hover:underline">← Voltar para Copa</Link>
      </div>
    );
  }

  const done    = match.status === 'completed';
  const live    = match.status === 'in progress' || match.status === 'live';
  const homeId  = match.home_team_id;
  const awayId  = match.away_team_id;
  const hGoals  = match.home_goals;
  const aGoals  = match.away_goals;
  const homeWin = done && hGoals > aGoals;
  const awayWin = done && aGoals > hGoals;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Link href="/copa" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft size={14} /> Copa do Mundo 2026
        </Link>

        {/* Stage + date */}
        <div className="flex items-center gap-2 mb-4 text-xs text-zinc-500">
          <span>{stagePt(match.stage)}</span>
          {match.group && <span>• Grupo {match.group}</span>}
          <span>•</span>
          <Calendar size={11} />
          <span>{formatDateTime(match.datetime)}</span>
        </div>

        {/* Match header */}
        <div className={`bg-zinc-900 border rounded-2xl p-6 mb-6 ${live ? 'border-yellow-400/40' : 'border-zinc-800'}`}>
          {live && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 font-bold text-sm tracking-wider">AO VIVO</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            {/* Home */}
            <Link href={`/copa/${homeId}`} className="flex flex-col items-center gap-2 flex-1 group">
              <span className="text-5xl sm:text-6xl leading-none">{flag(homeId, teamLookup)}</span>
              <p className={`text-sm font-bold text-center leading-tight group-hover:text-yellow-300 transition-colors ${homeWin ? 'text-white' : done ? 'text-zinc-400' : 'text-white'}`}>
                {name(homeId, teamLookup)}
              </p>
            </Link>

            {/* Score */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              {done || live ? (
                <div className={`text-4xl sm:text-5xl font-bold tabular-nums ${live ? 'text-red-400' : 'text-white'}`}>
                  {hGoals ?? '?'} <span className="text-zinc-600">–</span> {aGoals ?? '?'}
                </div>
              ) : (
                <div className="text-2xl text-zinc-500 font-medium px-4">vs</div>
              )}
              {done && <span className="text-xs text-zinc-600">Encerrado</span>}
            </div>

            {/* Away */}
            <Link href={`/copa/${awayId}`} className="flex flex-col items-center gap-2 flex-1 group">
              <span className="text-5xl sm:text-6xl leading-none">{flag(awayId, teamLookup)}</span>
              <p className={`text-sm font-bold text-center leading-tight group-hover:text-yellow-300 transition-colors ${awayWin ? 'text-white' : done ? 'text-zinc-400' : 'text-white'}`}>
                {name(awayId, teamLookup)}
              </p>
            </Link>
          </div>

          {/* CazéTV link */}
          {(match.video_url || live) && (
            <div className="mt-5 pt-4 border-t border-zinc-800 flex justify-center">
              <a
                href={match.video_url || CAZETV_LIVE}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold transition-colors"
              >
                <Play size={14} fill="white" />
                {live ? 'Assistir ao vivo • CazéTV' : 'Assistir no CazéTV'}
              </a>
            </div>
          )}
        </div>

        {/* Elencos */}
        {(homePlayers.length > 0 || awayPlayers.length > 0) && (
          <div>
            <div className="flex gap-1 mb-4 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
              {[
                { id: 'home', label: name(homeId, teamLookup), flag: flag(homeId, teamLookup) },
                { id: 'away', label: name(awayId, teamLookup), flag: flag(awayId, teamLookup) },
              ].map(side => (
                <button
                  key={side.id}
                  onClick={() => setSquad(side.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                    squad === side.id ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <span>{side.flag}</span>
                  <span className="truncate">{side.label}</span>
                </button>
              ))}
            </div>

            <PlayerList players={squad === 'home' ? homePlayers : awayPlayers} />
          </div>
        )}
      </div>
    </div>
  );
}

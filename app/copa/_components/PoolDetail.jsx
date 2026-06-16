'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import { getPool, addParticipant, removeParticipant, setGuess, rankParticipants, pointsForGuess } from '../_lib/bolao';

const TABS = [
  { id: 'palpites', label: 'Palpites' },
  { id: 'ranking',  label: 'Ranking' },
];

function ScoreInput({ value, onChange }) {
  return (
    <input
      type="number"
      min="0"
      max="20"
      value={value ?? ''}
      onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      className="w-9 text-center bg-zinc-800 border border-zinc-700 rounded-lg py-1.5 text-white text-sm font-bold focus:outline-none focus:border-yellow-400 tabular-nums"
    />
  );
}

function matchTeamId(match, side) {
  return side === 'home'
    ? (match.homeId || match.home_team_id || match.home_team?.id)
    : (match.awayId || match.away_team_id || match.away_team?.id);
}

function matchGoals(match, side) {
  return side === 'home'
    ? (match.homeGoals ?? match.home_goals ?? match.home_team?.goals ?? null)
    : (match.awayGoals ?? match.away_goals ?? match.away_team?.goals ?? null);
}

function MatchRow({ match, participants, teamLookup, onGuessChange }) {
  const [expanded, setExpanded] = useState(false);
  const done = match.status === 'completed';
  const live = match.status === 'in progress' || match.status === 'live';

  const homeId  = matchTeamId(match, 'home');
  const awayId  = matchTeamId(match, 'away');
  const homeTeam = teamLookup[homeId] || { name: match.home_team?.name || homeId || '?' };
  const awayTeam = teamLookup[awayId] || { name: match.away_team?.name || awayId || '?' };
  const homeFlag = homeTeam.flag || homeTeam.emoji_string || '';
  const awayFlag = awayTeam.flag || awayTeam.emoji_string || '';
  const homeName = homeTeam.name_pt || homeTeam.name || homeId || '?';
  const awayName = awayTeam.name_pt || awayTeam.name || awayId || '?';

  const result = (done || live)
    ? { homeGoals: matchGoals(match, 'home'), awayGoals: matchGoals(match, 'away') }
    : null;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full px-3 sm:px-4 py-3 flex items-center gap-2 hover:bg-zinc-800/50 transition-colors text-left"
      >
        {/* Home team */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
          <span className="text-sm font-medium text-white truncate text-right">{homeName}</span>
          {homeFlag && <span className="text-base flex-shrink-0">{homeFlag}</span>}
        </div>

        {/* Score / vs */}
        <div className="flex-shrink-0 w-14 text-center">
          {result ? (
            <span className={`text-sm font-bold tabular-nums ${live ? 'text-yellow-400' : 'text-white'}`}>
              {result.homeGoals} – {result.awayGoals}
            </span>
          ) : (
            <span className="text-xs text-zinc-600">vs</span>
          )}
        </div>

        {/* Away team */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {awayFlag && <span className="text-base flex-shrink-0">{awayFlag}</span>}
          <span className="text-sm font-medium text-white truncate">{awayName}</span>
        </div>

        {expanded
          ? <ChevronUp size={14} className="text-zinc-500 flex-shrink-0 ml-1" />
          : <ChevronDown size={14} className="text-zinc-500 flex-shrink-0 ml-1" />}
      </button>

      {expanded && (
        <div className="border-t border-zinc-800 divide-y divide-zinc-800/50">
          {participants.map(p => {
            const guess = p.guesses[match.id];
            const pts   = result && guess != null ? pointsForGuess(guess, result) : null;
            return (
              <div key={p.id} className="px-3 sm:px-4 py-2.5 flex items-center gap-2 sm:gap-3">
                <span className="text-xs text-zinc-400 w-20 sm:w-24 truncate flex-shrink-0">{p.name}</span>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-center">
                  <ScoreInput
                    value={guess?.home ?? ''}
                    onChange={v => onGuessChange(p.id, match.id, v, guess?.away ?? 0)}
                  />
                  <span className="text-zinc-600 text-xs">–</span>
                  <ScoreInput
                    value={guess?.away ?? ''}
                    onChange={v => onGuessChange(p.id, match.id, guess?.home ?? 0, v)}
                  />
                </div>
                {pts != null && (
                  <span className={`text-xs font-bold w-8 text-right flex-shrink-0 ${pts === 3 ? 'text-yellow-400' : pts === 1 ? 'text-blue-400' : 'text-zinc-600'}`}>
                    {pts > 0 ? `+${pts}` : '0'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RankingTab({ participants, matches }) {
  const completed = matches
    .filter(m => m.status === 'completed')
    .map(m => ({ id: m.id, homeGoals: matchGoals(m, 'home'), awayGoals: matchGoals(m, 'away') }));
  const ranked = rankParticipants(participants, completed);

  if (completed.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-500 text-sm">
        Ranking disponível após os primeiros resultados.
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {ranked.map((p, idx) => (
          <div key={p.id} className={`flex items-center gap-3 px-4 py-3.5 border-b border-zinc-800/50 last:border-0 ${idx === 0 ? 'bg-yellow-400/5' : ''}`}>
            <span className={`w-6 text-center font-bold text-sm flex-shrink-0 ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-zinc-300' : idx === 2 ? 'text-amber-600' : 'text-zinc-600'}`}>
              {idx + 1}
            </span>
            {idx === 0 && <Trophy size={14} className="text-yellow-400 flex-shrink-0" />}
            <span className="flex-1 text-white font-medium text-sm">{p.name}</span>
            <div className="flex items-center gap-3 sm:gap-4 text-xs flex-shrink-0">
              <div className="text-center">
                <p className="font-bold text-yellow-400 tabular-nums">{p.exact}</p>
                <p className="text-zinc-600">✓✓</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-blue-400 tabular-nums">{p.correct}</p>
                <p className="text-zinc-600">✓</p>
              </div>
              <div className="text-center min-w-[28px]">
                <p className="font-bold text-white tabular-nums">{p.points}</p>
                <p className="text-zinc-600">pts</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-4 justify-center mt-3 text-xs text-zinc-600">
        <span><span className="text-yellow-400">✓✓</span> Placar exato = 3pts</span>
        <span><span className="text-blue-400">✓</span> Resultado = 1pt</span>
      </div>
    </div>
  );
}

export default function PoolDetail({ poolId, matches, teamLookup }) {
  const [pool,        setPool]        = useState(null);
  const [activeTab,   setActiveTab]   = useState('palpites');
  const [newName,     setNewName]     = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const refresh = useCallback(() => setPool(getPool(poolId)), [poolId]);

  useEffect(() => { refresh(); }, [refresh]);

  const handleGuessChange = useCallback((participantId, matchId, home, away) => {
    if (home === '' || away === '') return;
    setGuess(poolId, participantId, matchId, home, away);
    refresh();
  }, [poolId, refresh]);

  const handleAddParticipant = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addParticipant(poolId, newName.trim());
    setNewName('');
    setShowAddForm(false);
    refresh();
  };

  const handleRemoveParticipant = (id) => {
    if (!confirm('Remover participante?')) return;
    removeParticipant(poolId, id);
    refresh();
  };

  if (!pool) return <div className="text-center py-20 text-zinc-500">Bolão não encontrado.</div>;

  const matchList = Array.isArray(matches?.matches) ? matches.matches : Array.isArray(matches) ? matches : [];

  return (
    <div>
      {/* Pool header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5 mb-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-bold text-white text-lg sm:text-xl">{pool.title}</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Código: <span className="font-mono text-yellow-400">{pool.code}</span>
            </p>
          </div>
        </div>

        {/* Participants */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 font-medium">Participantes</span>
            <button
              onClick={() => setShowAddForm(s => !s)}
              className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center gap-1 transition-colors min-h-[32px]"
            >
              <Plus size={12} /> Adicionar
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddParticipant} className="flex gap-2 mb-3">
              <input
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Nome do participante"
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400"
              />
              <button type="submit" className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-bold rounded-lg transition-colors">
                OK
              </button>
            </form>
          )}

          <div className="flex flex-wrap gap-2">
            {pool.participants.map(p => (
              <div key={p.id} className="flex items-center gap-1.5 bg-zinc-800 rounded-full px-3 py-1.5 text-xs text-white group min-h-[32px]">
                <span>{p.name}</span>
                <button
                  onClick={() => handleRemoveParticipant(p.id)}
                  className="text-zinc-600 hover:text-red-400 transition-colors ml-0.5"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors min-h-[44px] ${
              activeTab === tab.id
                ? 'border-yellow-400 text-yellow-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'palpites' && (
        <div className="space-y-3">
          {matchList.length === 0 && (
            <div className="text-center py-16 text-zinc-500 text-sm">
              Jogos indisponíveis.
            </div>
          )}
          {matchList.map(match => (
            <MatchRow
              key={match.id}
              match={match}
              participants={pool.participants}
              teamLookup={teamLookup}
              onGuessChange={handleGuessChange}
            />
          ))}
        </div>
      )}

      {activeTab === 'ranking' && (
        <RankingTab participants={pool.participants} matches={matchList} />
      )}
    </div>
  );
}

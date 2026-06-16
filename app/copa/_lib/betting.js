'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'copa_bets_2026';

function loadBets() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch { return {}; }
}

function saveBets(bets) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bets));
}

export function useBetting() {
  const [bets, setBets] = useState({});

  useEffect(() => { setBets(loadBets()); }, []);

  const placeBet = useCallback((matchId, type, value) => {
    setBets(prev => {
      const next = { ...prev, [matchId]: { type, value, placedAt: Date.now() } };
      saveBets(next);
      return next;
    });
  }, []);

  const removeBet = useCallback((matchId) => {
    setBets(prev => {
      const next = { ...prev };
      delete next[matchId];
      saveBets(next);
      return next;
    });
  }, []);

  const getBet = useCallback((matchId) => bets[matchId] || null, [bets]);

  return { bets, placeBet, removeBet, getBet };
}

export function BettingPanel({ match, bets, onPlaceBet, onRemoveBet }) {
  const [mode, setMode] = useState('score'); // 'score' | 'winner'
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [winner, setWinner] = useState('');

  const existing = bets[match.id];
  const isFinished = match.status === 'completed';

  const handleSubmit = () => {
    if (mode === 'score') {
      const h = parseInt(homeScore), a = parseInt(awayScore);
      if (isNaN(h) || isNaN(a)) return;
      onPlaceBet(match.id, 'score', { home: h, away: a });
    } else {
      if (!winner) return;
      onPlaceBet(match.id, 'winner', { team: winner });
    }
  };

  if (isFinished) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-zinc-400 mb-2">Sua aposta</h4>
        {existing ? (
          <div>
            {existing.type === 'score' ? (
              <p className="text-sm text-white">
                {existing.value.home} x {existing.value.away}
                {match.home_team?.score !== undefined && (
                  <span className={existing.value.home === match.home_team.score && existing.value.away === match.away_team.score
                    ? ' text-green-400 ml-2' : ' text-red-400 ml-2'}>
                    {existing.value.home === match.home_team.score && existing.value.away === match.away_team.score ? '✓ Acertou!' : '✗ Errou'}
                  </span>
                )}
              </p>
            ) : (
              <p className="text-sm text-white">
                Vencedor: {existing.value.team}
                {match.home_team?.score !== undefined && (
                  <span className={
                    (existing.value.team === match.home_team.name && match.home_team.score > match.away_team.score) ||
                    (existing.value.team === match.away_team.name && match.away_team.score > match.home_team.score)
                    ? ' text-green-400 ml-2' : ' text-red-400 ml-2'}>
                    {(existing.value.team === match.home_team.name && match.home_team.score > match.away_team.score) ||
                     (existing.value.team === match.away_team.name && match.away_team.score > match.home_team.score)
                     ? '✓ Acertou!' : '✗ Errou'}
                  </span>
                )}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">Nenhuma aposta registrada</p>
        )}
      </div>
    );
  }

  if (existing) {
    return (
      <div className="bg-zinc-900 border border-yellow-500/30 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-yellow-400 mb-2">Sua aposta</h4>
        {existing.type === 'score' ? (
          <p className="text-sm text-white mb-2">{existing.value.home} x {existing.value.away}</p>
        ) : (
          <p className="text-sm text-white mb-2">Vencedor: {existing.value.team}</p>
        )}
        <button onClick={() => onRemoveBet(match.id)}
          className="text-xs text-zinc-500 hover:text-red-400 transition-colors">
          Remover aposta
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <h4 className="text-xs font-semibold text-zinc-400 mb-3">Fazer aposta</h4>

      <div className="flex gap-2 mb-3">
        {['score', 'winner'].map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${mode === m ? 'bg-yellow-400 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
            {m === 'score' ? 'Placar exato' : 'Vencedor'}
          </button>
        ))}
      </div>

      {mode === 'score' ? (
        <div className="flex items-center gap-2 mb-3">
          <input type="number" min="0" max="20" value={homeScore} onChange={e => setHomeScore(e.target.value)}
            placeholder="0" className="w-14 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-center text-white text-sm" />
          <span className="text-zinc-500 text-xs">x</span>
          <input type="number" min="0" max="20" value={awayScore} onChange={e => setAwayScore(e.target.value)}
            placeholder="0" className="w-14 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-center text-white text-sm" />
        </div>
      ) : (
        <div className="flex gap-2 mb-3">
          {[match.home_team?.name, match.away_team?.name, 'Empate'].filter(Boolean).map(t => (
            <button key={t} onClick={() => setWinner(t)}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${winner === t ? 'bg-yellow-400 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
              {t}
            </button>
          ))}
        </div>
      )}

      <button onClick={handleSubmit}
        disabled={(mode === 'score' && (!homeScore || !awayScore)) || (mode === 'winner' && !winner)}
        className="w-full py-1.5 bg-yellow-400 text-black rounded-lg text-sm font-medium hover:bg-yellow-300 disabled:opacity-40 transition-colors">
        Apostar
      </button>
    </div>
  );
}

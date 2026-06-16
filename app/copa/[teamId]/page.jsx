'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getTeams, getPlayers } from '../_lib/api';

const POSITION_ORDER = ['GK', 'DF', 'MF', 'FW'];
const POSITION_LABEL = { GK: 'Goleiros', DF: 'Defensores', MF: 'Meio-campistas', FW: 'Atacantes' };

export default function TeamPage({ params }) {
  const { teamId } = params;
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [teams, playerData] = await Promise.all([getTeams(), getPlayers(teamId)]);
        const found = Array.isArray(teams) ? teams.find(t => t.id === teamId) : null;
        setTeam(found || { id: teamId, name: teamId });
        setPlayers(Array.isArray(playerData) ? playerData : []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [teamId]);

  const byPosition = POSITION_ORDER.reduce((acc, pos) => {
    const group = players.filter(p => p.position === pos);
    if (group.length) acc[pos] = group.sort((a, b) => (a.number ?? 99) - (b.number ?? 99));
    return acc;
  }, {});

  const otherPlayers = players.filter(p => !POSITION_ORDER.includes(p.position));

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Link href="/copa" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft size={14} /> Voltar
        </Link>

        {loading && (
          <div className="text-center py-20 text-zinc-500">Carregando...</div>
        )}

        {error && (
          <div className="text-center py-20 text-zinc-500">
            <p className="text-sm">Erro ao carregar: {error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="flex items-center gap-4 mb-8">
              <span className="text-6xl leading-none">{team?.emoji_string || team?.flag || '🏳️'}</span>
              <div>
                <h1 className="text-2xl font-bold">{team?.name || teamId}</h1>
                <div className="flex flex-wrap gap-3 mt-1 text-sm text-zinc-500">
                  {team?.group && <span>Grupo {team.group}</span>}
                  {team?.confederation && <span>{team.confederation}</span>}
                  {team?.fifaRanking && <span>FIFA #{team.fifaRanking}</span>}
                </div>
              </div>
            </div>

            {players.length === 0 ? (
              <div className="text-center py-12 text-zinc-600">
                <p className="text-sm">Elenco ainda não disponível.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {POSITION_ORDER.filter(pos => byPosition[pos]).map(pos => (
                  <div key={pos}>
                    <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{POSITION_LABEL[pos]}</h2>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                      {byPosition[pos].map((p, i) => (
                        <div
                          key={p.name}
                          className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors"
                        >
                          <span className="w-8 text-center text-zinc-600 font-mono text-sm flex-shrink-0">
                            {p.number ?? '—'}
                          </span>
                          <span className="flex-1 text-white font-medium text-sm">{p.name}</span>
                          <span className="text-zinc-500 text-xs">{p.club}</span>
                          {p.age && <span className="text-zinc-700 text-xs flex-shrink-0">{p.age}a</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {otherPlayers.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Outros</h2>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                      {otherPlayers.map(p => (
                        <div key={p.name} className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800/50 last:border-0">
                          <span className="w-8 text-center text-zinc-600 font-mono text-sm">{p.number ?? '—'}</span>
                          <span className="flex-1 text-white font-medium text-sm">{p.name}</span>
                          <span className="text-zinc-500 text-xs">{p.club}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

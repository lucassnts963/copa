'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { fetchLiveWithFallback, flagSrc, flagSrcSet } from '../_lib/data';

export default function Jogadores({ matches, teams, teamFlagMap, countryCodeMap }) {
  const [playersData, setPlayersData] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [searchPlayer, setSearchPlayer] = useState('');

  useEffect(() => {
    fetchLiveWithFallback('players', 'players').then(setPlayersData).catch(() => {});
  }, []);

  // Extract all unique teams
  const teamList = useMemo(() => {
    const map = new Map();
    if (Array.isArray(teams)) {
      for (const t of teams) map.set(t.name, { name: t.name, flag: t.flag || '', group: t.group });
    }
    if (playersData && typeof playersData === 'object') {
      for (const name of Object.keys(playersData)) {
        if (!map.has(name)) map.set(name, { name, flag: teamFlagMap[name] || '', group: '' });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [teams, playersData, teamFlagMap]);

  const teamPlayers = useMemo(() => {
    if (!selectedTeam || !playersData) return [];
    return playersData[selectedTeam] || [];
  }, [selectedTeam, playersData]);

  const filteredPlayers = useMemo(() => {
    if (!searchPlayer) return teamPlayers;
    return teamPlayers.filter(p =>
      p.name.toLowerCase().includes(searchPlayer.toLowerCase()) ||
      p.position.toLowerCase().includes(searchPlayer.toLowerCase())
    );
  }, [teamPlayers, searchPlayer]);

  const hasPlayerData = playersData && Object.keys(playersData).length > 0;

  return (
    <div>
      {/* Team selector */}
      <div className="mb-6">
        <p className="text-sm text-zinc-400 mb-3">
          {hasPlayerData
            ? 'Escolha uma seleção para ver seu elenco:'
            : 'Carregando elencos...'}
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {teamList.map(t => (
            <button
              key={t.name}
              onClick={() => { setSelectedTeam(t.name === selectedTeam ? '' : t.name); setSearchPlayer(''); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                t.name === selectedTeam
                  ? 'bg-yellow-400 text-black font-medium'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
              }`}
            >
              {countryCodeMap[t.name] ? (
                <img src={flagSrc(countryCodeMap[t.name], 32)} srcSet={flagSrcSet(countryCodeMap[t.name])} sizes="32px" alt={t.name} className="w-5 h-4 object-cover rounded-sm flex-shrink-0" />
              ) : t.flag ? (
                <span className="text-base">{t.flag}</span>
              ) : null}
              <span className="truncate">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Team squad */}
      {selectedTeam && teamPlayers.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            {countryCodeMap[selectedTeam] ? (
              <img src={flagSrc(countryCodeMap[selectedTeam], 64)} srcSet={flagSrcSet(countryCodeMap[selectedTeam])} sizes="64px" alt={selectedTeam} className="w-9 h-7 object-cover rounded-sm" />
            ) : teamFlagMap[selectedTeam] ? (
              <span className="text-3xl">{teamFlagMap[selectedTeam]}</span>
            ) : null}
            <div>
              <h3 className="text-lg font-bold text-white">{selectedTeam}</h3>
              <p className="text-xs text-zinc-500">{teamPlayers.length} jogadores</p>
            </div>
          </div>

          <input
            type="text"
            placeholder="Buscar jogador ou posição..."
            value={searchPlayer}
            onChange={e => setSearchPlayer(e.target.value)}
            className="w-full mb-4 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400"
          />

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[48px_48px_1fr] px-4 py-2 border-b border-zinc-800 text-xs text-zinc-500 font-medium">
              <span>#</span>
              <span>Pos</span>
              <span>Nome</span>
            </div>
            {/* Player rows */}
            {filteredPlayers.map((p, i) => (
              <div
                key={`${p.number}-${p.name}`}
                className={`grid grid-cols-[48px_48px_1fr] px-4 py-2.5 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors items-center text-sm ${
                  i % 2 === 0 ? '' : ''
                }`}
              >
                <span className="text-zinc-400 font-mono text-xs">{p.number}</span>
                <span className={`font-medium text-xs ${
                  p.position === 'GK' ? 'text-yellow-400' :
                  p.position === 'DF' ? 'text-blue-400' :
                  p.position === 'MF' ? 'text-green-400' :
                  p.position === 'FW' ? 'text-red-400' :
                  'text-zinc-300'
                }`}>{p.position}</span>
                <Link
                  href={`/copa/jogador/${encodeURIComponent(p.name)}`}
                  className="text-white truncate hover:text-yellow-400 transition-colors"
                >
                  {p.name}
                </Link>
              </div>
            ))}
            {filteredPlayers.length === 0 && (
              <div className="px-4 py-8 text-center text-zinc-500 text-sm">
                Nenhum jogador encontrado.
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-3 text-xs text-zinc-600">
            <span><span className="text-yellow-400">GK</span> Goleiro</span>
            <span><span className="text-blue-400">DF</span> Defensor</span>
            <span><span className="text-green-400">MF</span> Meio-campo</span>
            <span><span className="text-red-400">FW</span> Atacante</span>
          </div>
        </div>
      )}

      {selectedTeam && teamPlayers.length === 0 && hasPlayerData && (
        <div className="text-center py-16 text-zinc-500">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-sm">Elenco ainda não disponível para {selectedTeam}.</p>
        </div>
      )}

      {!selectedTeam && (
        <div className="text-center py-16 text-zinc-500">
          <div className="text-4xl mb-3">👥</div>
          <p className="text-sm">Selecione uma seleção acima para ver o elenco completo.</p>
          {hasPlayerData ? (
            <p className="text-xs text-zinc-600 mt-1">{Object.keys(playersData).length} elencos disponíveis</p>
          ) : (
            <p className="text-xs text-zinc-600 mt-1">Dados via Wikipedia · FIFA World Cup squads</p>
          )}
        </div>
      )}
    </div>
  );
}

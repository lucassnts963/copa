'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';

function TeamCard({ team, isFav, onToggle }) {
  const flag = team.emoji_string || team.flag || '🏳️';
  return (
    <div className={`bg-zinc-900 border rounded-xl p-3 flex flex-col items-center gap-2 transition-all group relative ${isFav ? 'border-yellow-500/50 bg-yellow-400/5' : 'border-zinc-800 hover:border-zinc-700'}`}>
      <div className="w-full flex justify-end">
        <button
          onClick={(e) => { e.preventDefault(); onToggle(team.id); }}
          className={`p-1 rounded transition-colors z-10 relative ${
            isFav ? 'text-red-400 hover:text-red-300' : 'text-zinc-700 hover:text-red-400 opacity-0 group-hover:opacity-100'
          }`}
        >
          <Heart size={14} className={isFav ? 'fill-red-400' : ''} />
        </button>
      </div>
      <Link href={`/copa/${team.id}`} className="flex flex-col items-center gap-2 w-full">
        <span className="text-4xl leading-none">{flag}</span>
        <p className={`text-xs font-medium text-center leading-tight ${isFav ? 'text-yellow-300' : 'text-white'}`}>
          {team.name}
        </p>
        {team.group && <p className="text-zinc-600 text-xs">Grupo {team.group}</p>}
      </Link>
    </div>
  );
}

export default function Selecoes({ teams, favorites, onToggleFavorite }) {
  const [filter, setFilter] = useState('todas');
  const [search, setSearch] = useState('');

  const visible = (Array.isArray(teams) ? teams : []).filter(t => {
    if (filter === 'favoritas' && !favorites.includes(t.id)) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2">
          {['todas', 'favoritas'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f ? 'bg-yellow-400 text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {f === 'favoritas' ? `❤️ Favoritas (${favorites.length})` : 'Todas'}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Buscar seleção..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400"
        />
      </div>

      {visible.length === 0 && (
        <div className="text-center py-16 text-zinc-500">
          {filter === 'favoritas'
            ? 'Nenhuma seleção favoritada. Clique no ❤️ nos cards.'
            : 'Nenhuma seleção encontrada.'}
        </div>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {visible.map(t => (
          <TeamCard
            key={t.id}
            team={t}
            isFav={favorites.includes(t.id)}
            onToggle={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
}

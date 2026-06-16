'use client';

import { useState } from 'react';
import { Plus, Trophy, Users, Target } from 'lucide-react';
import CreatePoolModal from './CreatePoolModal';

function StatCard({ icon, value, label }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-yellow-400/10 flex items-center justify-center text-yellow-400 flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-white tabular-nums">{value}</p>
        <p className="text-xs text-zinc-500">{label}</p>
      </div>
    </div>
  );
}

function PoolCard({ pool, onSelect }) {
  const totalGuesses = pool.participants.reduce((sum, p) => sum + Object.keys(p.guesses).length, 0);
  return (
    <button
      onClick={() => onSelect(pool.id)}
      className="text-left bg-zinc-900 border border-zinc-800 hover:border-yellow-400/30 rounded-xl p-5 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-full bg-yellow-400/10 flex items-center justify-center text-yellow-400 font-bold text-sm">
          {pool.code.slice(0, 2)}
        </div>
        <span className="text-xs text-zinc-600 font-mono">{pool.code}</span>
      </div>
      <h3 className="font-bold text-white group-hover:text-yellow-300 transition-colors">{pool.title}</h3>
      <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
        <span className="flex items-center gap-1"><Users size={10} />{pool.participants.length} participante{pool.participants.length !== 1 ? 's' : ''}</span>
        <span className="flex items-center gap-1"><Target size={10} />{totalGuesses} palpite{totalGuesses !== 1 ? 's' : ''}</span>
      </div>
    </button>
  );
}

export default function BolaoLanding({ pools, onSelectPool, onPoolCreated }) {
  const [showCreate, setShowCreate] = useState(false);

  const totalParticipants = new Set(pools.flatMap(p => p.participants.map(par => par.name))).size;
  const totalGuesses = pools.reduce((sum, p) => sum + p.participants.reduce((s2, par) => s2 + Object.keys(par.guesses).length, 0), 0);

  return (
    <>
      {/* Intro */}
      <div className="flex items-start gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center flex-shrink-0">
          <Trophy size={20} className="text-yellow-400" />
        </div>
        <div>
          <h2 className="font-bold text-white">Bolão da Copa</h2>
          <p className="text-zinc-400 text-sm">
            Crie um bolão, adicione participantes, faça palpites e acompanhe o ranking conforme os resultados saem.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard icon={<Trophy size={16} />} value={pools.length} label="Bolões" />
        <StatCard icon={<Users size={16} />} value={totalParticipants} label="Participantes" />
        <StatCard icon={<Target size={16} />} value={totalGuesses} label="Palpites" />
      </div>

      {/* Action */}
      <button
        onClick={() => setShowCreate(true)}
        className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 rounded-xl text-sm transition-colors mb-4"
      >
        <Plus size={16} /> Criar novo bolão
      </button>

      {/* Pool list */}
      {pools.length > 0 ? (
        <div>
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Meus bolões</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pools.map(pool => <PoolCard key={pool.id} pool={pool} onSelect={onSelectPool} />)}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-zinc-600 text-sm">
          Nenhum bolão criado ainda. Crie o primeiro!
        </div>
      )}

      {showCreate && (
        <CreatePoolModal
          onClose={() => setShowCreate(false)}
          onCreated={(pool) => { setShowCreate(false); onPoolCreated(pool); }}
        />
      )}
    </>
  );
}

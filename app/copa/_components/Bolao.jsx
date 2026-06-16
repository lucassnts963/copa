'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getPools } from '../_lib/bolao';
import BolaoLanding from './BolaoLanding';
import PoolDetail from './PoolDetail';

export default function Bolao({ matches, teamLookup }) {
  const [pools, setPools] = useState([]);
  const [activePoolId, setActivePoolId] = useState(null);

  const refresh = useCallback(() => setPools(getPools()), []);

  useEffect(() => { refresh(); }, [refresh]);

  if (activePoolId) {
    return (
      <div>
        <button
          onClick={() => { setActivePoolId(null); refresh(); }}
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Bolões
        </button>
        <PoolDetail poolId={activePoolId} matches={matches} teamLookup={teamLookup} />
      </div>
    );
  }

  return (
    <BolaoLanding
      pools={pools}
      onSelectPool={setActivePoolId}
      onPoolCreated={(pool) => { refresh(); setActivePoolId(pool.id); }}
    />
  );
}

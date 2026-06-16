'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { getFavorites, toggleFavorite, getCached, setCached, clearCache } from '../_lib/storage';
import { getMatches, getGroups, getTeams, getRankings, getBracket, getScorers } from '../_lib/api';
import Jogos from './Jogos';
import Grupos from './Grupos';
import Artilharia from './Artilharia';
import Selecoes from './Selecoes';
import RankingGeral from './RankingGeral';
import Chaveamento from './Chaveamento';
import Bolao from './Bolao';

const TABS = [
  { id: 'jogos',       label: 'Jogos' },
  { id: 'grupos',      label: 'Grupos' },
  { id: 'chaveamento', label: 'Chaveamento' },
  { id: 'ranking',     label: 'Ranking' },
  { id: 'artilharia',  label: 'Artilharia' },
  { id: 'selecoes',    label: 'Seleções' },
  { id: 'bolao',       label: 'Bolão' },
];

const FETCHERS = {
  jogos:       getMatches,
  grupos:      getGroups,
  selecoes:    getTeams,
  ranking:     getRankings,
  chaveamento: getBracket,
  artilharia:  getScorers,
};

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <RefreshCw size={24} className="animate-spin text-yellow-400" />
      <span className="text-sm text-zinc-500">Carregando dados...</span>
    </div>
  );
}

function ErrorCard({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="text-5xl">⚠️</div>
      <p className="text-zinc-400 text-sm max-w-sm text-center">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm flex items-center gap-2 transition-colors"
      >
        <RefreshCw size={14} /> Tentar novamente
      </button>
    </div>
  );
}

function LastUpdated({ timestamp }) {
  const [ago, setAgo] = useState('');
  useEffect(() => {
    if (!timestamp) return;
    const update = () => {
      const diff = Math.floor((Date.now() - timestamp) / 60000);
      if (diff < 1) setAgo('agora');
      else if (diff === 1) setAgo('1 min atrás');
      else if (diff < 60) setAgo(`${diff} min atrás`);
      else setAgo(`${Math.floor(diff / 60)}h atrás`);
    };
    update();
    const iv = setInterval(update, 30000);
    return () => clearInterval(iv);
  }, [timestamp]);

  if (!ago) return null;
  return (
    <span className="text-xs text-zinc-600" title={new Date(timestamp).toLocaleTimeString('pt-BR')}>
      · Atualizado {ago}
    </span>
  );
}

export default function CopaClient() {
  const [activeTab, setActiveTab] = useState('jogos');
  const [favorites, setFavorites] = useState([]);
  const [tabData, setTabData] = useState({});
  const [teamLookup, setTeamLookup] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(null);

  // Eager-load teams for flag emoji lookup across all tabs
  useEffect(() => {
    setFavorites(getFavorites());

    const load = async () => {
      const cached = getCached('selecoes');
      if (cached) {
        setTeamLookup(toLookup(cached));
        setTabData(prev => ({ ...prev, selecoes: cached }));
        return;
      }
      try {
        const teams = await getTeams();
        setCached('selecoes', teams);
        setTeamLookup(toLookup(teams));
        setTabData(prev => ({ ...prev, selecoes: teams }));
      } catch {} // non-critical — flags degrade gracefully
    };
    load();
  }, []);

  function toLookup(teams) {
    if (!Array.isArray(teams)) return {};
    return Object.fromEntries(teams.map(t => [t.id, t]));
  }

  const fetchTab = useCallback(async (tab) => {
    if (tabData[tab]) return;

    const cached = getCached(tab);
    if (cached) {
      setTabData(prev => ({ ...prev, [tab]: cached }));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await FETCHERS[tab]();
      setCached(tab, result);
      setTabData(prev => ({ ...prev, [tab]: result }));
      setLastSync(Date.now());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [tabData]);

  useEffect(() => {
    // o Bolão reaproveita os jogos (matches) já carregados
    if (activeTab === 'bolao') fetchTab('jogos');
    else fetchTab(activeTab);
    // Chaveamento precisa dos grupos para exibir os qualificados nas colunas laterais
    if (activeTab === 'chaveamento') fetchTab('grupos');
  }, [activeTab, fetchTab]);

  const handleToggleFavorite = useCallback((teamId) => {
    setFavorites(toggleFavorite(teamId));
  }, []);

  const handleRefresh = useCallback(() => {
    clearCache();
    setTabData({});
    setLastSync(null);
  }, []);

  const currentData = useMemo(() => tabData[activeTab], [activeTab, tabData]);

  const rankingData = useMemo(() => {
    const d = tabData.ranking;
    if (!d) return { rankings: null, updatedAt: null };
    if (Array.isArray(d)) return { rankings: d, updatedAt: null };
    return { rankings: d.rankings ?? null, updatedAt: d.updated_at ?? null };
  }, [tabData.ranking]);

  const scorersData = useMemo(() => {
    const d = tabData.artilharia;
    if (!d) return [];
    if (Array.isArray(d)) return d;
    return d.scorers ?? [];
  }, [tabData.artilharia]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 sticky top-0 bg-zinc-950/95 backdrop-blur-sm z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold leading-tight">🏆 Copa do Mundo 2026</h1>
            <p className="text-xs text-zinc-500">EUA · Canadá · México <LastUpdated timestamp={lastSync} /></p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-40 transition-colors"
            title="Forçar atualização"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="max-w-6xl mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'border-yellow-400 text-yellow-400'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading && !currentData && activeTab !== 'bolao' && <Spinner />}
        {error && activeTab !== 'bolao' && <ErrorCard message={error} onRetry={() => fetchTab(activeTab)} />}

        {!error && (
          <>
            {activeTab === 'jogos' && currentData && (
              <Jogos matches={currentData} favorites={favorites} teamLookup={teamLookup} />
            )}
            {activeTab === 'grupos' && currentData && (
              <Grupos groups={currentData} favorites={favorites} teamLookup={teamLookup} />
            )}
            {activeTab === 'chaveamento' && (
              <Chaveamento
                bracket={currentData || null}
                grupos={tabData.grupos}
                teamLookup={teamLookup}
              />
            )}
            {activeTab === 'ranking' && (
              <RankingGeral
                rankings={rankingData.rankings}
                updatedAt={rankingData.updatedAt}
                teamLookup={teamLookup}
              />
            )}
            {activeTab === 'artilharia' && (
              <Artilharia scorers={scorersData} teamLookup={teamLookup} />
            )}
            {activeTab === 'selecoes' && currentData && (
              <Selecoes teams={currentData} favorites={favorites} onToggleFavorite={handleToggleFavorite} />
            )}
            {activeTab === 'bolao' && (
              <Bolao matches={tabData.jogos} teamLookup={teamLookup} />
            )}
          </>
        )}

        {!loading && !error && !currentData && !['chaveamento', 'ranking', 'artilharia', 'bolao'].includes(activeTab) && (
          <Spinner />
        )}

        <p className="mt-10 text-center text-xs text-zinc-700">
          Dados via lucas-data · cache de 5 min
        </p>
      </div>
    </div>
  );
}

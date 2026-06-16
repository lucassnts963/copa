'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Globe, Users, Shirt, Calendar, Trophy } from 'lucide-react';
import { fetchLiveWithFallback, stagePtBR, isFinished, isLive, isFuture, matchDate } from '../../_lib/data';

const LANG_KEY = 'copa_lang_pref';

export default function SelecaoPage() {
  const params = useParams();
  const teamName = decodeURIComponent(params.name || '');
  const [lang, setLang] = useState('pt');
  const [team, setTeam] = useState(null);
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [wikiData, setWikiData] = useState(null);
  const [translated, setTranslated] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved) setLang(saved);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [liveScores, teamsData, playersData] = await Promise.all([
          fetchLiveWithFallback('live-scores', 'matches'),
          fetch('/data/copa/teams.json').then(r => r.json()),
          fetch('/data/copa/players.json').then(r => r.json()),
        ]);

        // Find team info
        const teamInfo = Array.isArray(teamsData) ? teamsData.find(t => t.name === teamName) : null;
        setTeam(teamInfo);

        // Find matches for this team
        if (Array.isArray(liveScores)) {
          const teamMatches = liveScores.filter(m =>
            m.home_team?.name === teamName || m.away_team?.name === teamName
          ).sort((a, b) => (a.date_utc || '').localeCompare(b.date_utc || ''));
          setMatches(teamMatches);
        }

        // Find players
        const squad = playersData?.[teamName] || [];
        setPlayers(squad);

        // Fetch Wikipedia summary
        if (teamName) {
          try {
            const res = await fetch(`/api/copa/player?name=${encodeURIComponent(teamName + ' national football team')}`);
            if (res.ok) {
              const data = await res.json();
              if (!data.not_found && !data.error) setWikiData(data);
            }
          } catch {}
        }
      } catch {}
    }
    load().finally(() => setLoading(false));
  }, [teamName]);

  // Translate on demand
  const translateText = async (text) => {
    if (!text || lang === 'en') return text;
    if (translated[text]) return translated[text];
    try {
      const res = await fetch(`/api/copa/translate?text=${encodeURIComponent(text)}&target=${lang}`);
      if (res.ok) {
        const data = await res.json();
        const result = data.translated || text;
        setTranslated(prev => ({ ...prev, [text]: result }));
        return result;
      }
    } catch {}
    return text;
  };

  const toggleLang = (l) => {
    setLang(l);
    localStorage.setItem(LANG_KEY, l);
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Carregando...</div>;

  if (!team && matches.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <div className="text-5xl">🏳️</div>
        <p className="text-zinc-400">Seleção não encontrada</p>
        <Link href="/copa" className="text-yellow-400 hover:underline text-sm">← Copa 2026</Link>
      </div>
    );
  }

  const langLabel = { pt: 'PT', en: 'EN' };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/copa" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
              <ArrowLeft size={14} /> Copa 2026
            </Link>
            <div className="flex items-center gap-1 bg-zinc-800 rounded-lg p-0.5">
              {['pt', 'en'].map(l => (
                <button key={l} onClick={() => toggleLang(l)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors ${lang === l ? 'bg-yellow-400 text-black font-medium' : 'text-zinc-400 hover:text-white'}`}>
                  {langLabel[l]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {team?.flag && <span className="text-5xl">{team.flag}</span>}
            <div>
              <h1 className="text-2xl font-bold">{teamName}</h1>
              {team?.group && <p className="text-sm text-zinc-500">Grupo {team.group}</p>}
              {team?.fifa_rank && <p className="text-xs text-zinc-600">Ranking FIFA: #{team.fifa_rank}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Wikipedia description */}
        {wikiData?.extract && (
          <LangSection lang={lang} onTranslate={translateText}>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-8">
              <h2 className="text-sm font-semibold text-zinc-400 mb-2 flex items-center gap-2">
                <Globe size={14} /> Sobre
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                <Translatable text={wikiData.extract} lang={lang} onTranslate={translateText} />
              </p>
            </div>
          </LangSection>
        )}

        {/* Matches */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-zinc-400 mb-3 flex items-center gap-2">
            <Trophy size={14} /> {lang === 'pt' ? 'Jogos' : 'Matches'}
          </h2>
          {matches.length === 0 ? (
            <p className="text-sm text-zinc-500">{lang === 'pt' ? 'Nenhum jogo encontrado' : 'No matches found'}</p>
          ) : (
            <div className="space-y-2">
              {matches.map(m => {
                const isHome = m.home_team?.name === teamName;
                const opp = isHome ? m.away_team?.name : m.home_team?.name;
                const oppFlag = isHome ? m.away_team?.flag : m.home_team?.flag;
                const myScore = isHome ? m.home_team?.score : m.away_team?.score;
                const opScore = isHome ? m.away_team?.score : m.home_team?.score;

                return (
                  <Link key={m.id} href={`/copa/partida/${m.id}`}
                    className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg px-4 py-3 transition-colors group">
                    <span className="text-xs text-zinc-500 w-16 flex-shrink-0">
                      {matchDate(m).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      {oppFlag && <span className="text-sm">{oppFlag}</span>}
                      <span className="text-sm text-zinc-300 truncate">{opp}</span>
                    </div>
                    {isFinished(m) ? (
                      <span className={`font-bold text-sm tabular-nums group-hover:text-white ${myScore > opScore ? 'text-green-400' : myScore < opScore ? 'text-red-400' : 'text-zinc-400'}`}>
                        {myScore} - {opScore}
                      </span>
                    ) : isLive(m) ? (
                      <span className="text-red-400 font-bold text-xs animate-pulse">AO VIVO</span>
                    ) : (
                      <span className="text-zinc-500 text-xs">
                        {matchDate(m).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                    <span className="text-zinc-600 text-xs group-hover:text-zinc-400">→</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Squad */}
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 mb-3 flex items-center gap-2">
            <Users size={14} /> {lang === 'pt' ? 'Elenco' : 'Squad'}
          </h2>
          {players.length === 0 ? (
            <p className="text-sm text-zinc-500">{lang === 'pt' ? 'Elenco não disponível' : 'Squad not available'}</p>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="grid grid-cols-[48px_48px_1fr] px-4 py-2 border-b border-zinc-800 text-xs text-zinc-500">
                <span>#</span>
                <span>Pos</span>
                <span>{lang === 'pt' ? 'Nome' : 'Name'}</span>
              </div>
              {players.map((p, i) => (
                <Link key={`${p.number}-${p.name}`} href={`/copa/jogador/${encodeURIComponent(p.name)}`}
                  className={`grid grid-cols-[48px_48px_1fr] px-4 py-2.5 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors items-center text-sm`}>
                  <span className="text-zinc-400 font-mono text-xs">{p.number}</span>
                  <span className={`font-medium text-xs ${
                    p.position === 'GK' ? 'text-yellow-400' : p.position === 'DF' ? 'text-blue-400' :
                    p.position === 'MF' ? 'text-green-400' : p.position === 'FW' ? 'text-red-400' : 'text-zinc-300'
                  }`}>{p.position}</span>
                  <span className="text-white truncate hover:text-yellow-400 transition-colors">{p.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-12">
        <Link href="/copa" className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-zinc-300">
          <ArrowLeft size={14} /> {lang === 'pt' ? 'Voltar' : 'Back'}
        </Link>
      </div>
    </div>
  );
}

// Helper components
function LangSection({ children }) {
  return <>{children}</>;
}

function Translatable({ text, lang, onTranslate }) {
  const [display, setDisplay] = useState(text);
  const [translating, setTranslating] = useState(lang === 'pt');

  useEffect(() => {
    if (lang === 'en') { setDisplay(text); setTranslating(false); return; }
    setTranslating(true);
    onTranslate(text).then(t => { setDisplay(t); setTranslating(false); });
  }, [lang, text]);

  if (translating && lang === 'pt') {
    return <span className="text-zinc-500 italic">Traduzindo...</span>;
  }
  return <span>{display}</span>;
}

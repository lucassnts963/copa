'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Users, Clock, Calendar, Flag, Play, Youtube } from 'lucide-react';
import { fetchLiveWithFallback, stagePtBR, isFinished, isLive, isFuture, matchDate, fetchCazetv, flagSrc, flagSrcSet } from '../../_lib/data';
import { useBetting, BettingPanel } from '../../_lib/betting';

export default function PartidaPage() {
  const params = useParams();
  const matchId = params.id || '';
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cazetvLink, setCazetvLink] = useState(null);
  const { bets, placeBet, removeBet } = useBetting();

  useEffect(() => {
    Promise.all([
      fetchLiveWithFallback('live-scores', 'matches'),
      fetchCazetv()
    ]).then(([data, cazetvData]) => {
      if (Array.isArray(data)) {
        const found = data.find(m => m.id === matchId);
        setMatch(found || null);
        if (found && cazetvData[found.id]) {
          setCazetvLink(cazetvData[found.id]);
        }
      }
    }).finally(() => setLoading(false));
  }, [matchId]);

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Carregando...</div>;

  if (!match) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <div className="text-5xl">⚽</div>
        <p className="text-zinc-400">Partida não encontrada</p>
        <Link href="/copa" className="text-yellow-400 hover:underline text-sm">← Copa 2026</Link>
      </div>
    );
  }

  const home = match.home_team || {};
  const away = match.away_team || {};
  const done = isFinished(match);
  const live = isLive(match);
  const upcoming = isFuture(match);
  const dateObj = new Date(match.date_utc || match.local_date);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="border-b border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link href="/copa" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-4">
            <ArrowLeft size={14} /> Copa 2026
          </Link>

          {/* Stage + Group */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
              {stagePtBR(match.stage)}
            </span>
            {match.group && <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">Grupo {match.group}</span>}
            {live && <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold animate-pulse">AO VIVO</span>}
            {done && <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">Encerrado</span>}
          </div>

          {/* Scoreboard */}
          <div className="flex items-center justify-center gap-6 sm:gap-12 py-8">
            {/* Home */}
            <div className="flex flex-col items-center gap-3 flex-1 max-w-[200px]">
              {home.country_code ? (
                <img
                  src={flagSrc(home.country_code, 128)}
                  srcSet={flagSrcSet(home.country_code)}
                  sizes="(max-width: 640px) 64px, 128px"
                  alt={home.name || ''}
                  className="w-20 h-15 object-cover rounded shadow-lg"
                  width={128}
                  height={96}
                />
              ) : home.flag ? (
                <span className="text-5xl">{home.flag}</span>
              ) : null}
              <Link href={`/copa/selecao/${encodeURIComponent(home.name || '')}`} className="text-sm font-bold text-center hover:text-yellow-400 transition-colors">
                {home.name || '?'}
              </Link>
              {home.tactics && <span className="text-xs text-zinc-500">{home.tactics}</span>}
            </div>

            {/* Score */}
            <div className="flex flex-col items-center">
              {done || live ? (
                <div className="text-5xl font-bold tabular-nums tracking-wider">
                  <span className={home.score > away.score ? 'text-white' : 'text-zinc-400'}>{home.score ?? '?'}</span>
                  <span className="text-zinc-600 mx-2">-</span>
                  <span className={away.score > home.score ? 'text-white' : 'text-zinc-400'}>{away.score ?? '?'}</span>
                </div>
              ) : (
                <div className="text-3xl font-bold text-zinc-600">VS</div>
              )}
              {done && <span className="text-xs text-zinc-500 mt-1">{match.match_time || 'Fim'}</span>}
              {upcoming && (
                <div className="text-center mt-1">
                  <p className="text-sm text-zinc-300">{dateObj.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</p>
                  <p className="text-lg font-bold text-white">{dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              )}
            </div>

            {/* Away */}
            <div className="flex flex-col items-center gap-3 flex-1 max-w-[200px]">
              {away.country_code ? (
                <img
                  src={flagSrc(away.country_code, 128)}
                  srcSet={flagSrcSet(away.country_code)}
                  sizes="(max-width: 640px) 64px, 128px"
                  alt={away.name || ''}
                  className="w-20 h-15 object-cover rounded shadow-lg"
                  width={128}
                  height={96}
                />
              ) : away.flag ? (
                <span className="text-5xl">{away.flag}</span>
              ) : null}
              <Link href={`/copa/selecao/${encodeURIComponent(away.name || '')}`} className="text-sm font-bold text-center hover:text-yellow-400 transition-colors">
                {away.name || '?'}
              </Link>
              {away.tactics && <span className="text-xs text-zinc-500">{away.tactics}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Match info */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
            <Calendar size={18} className="text-zinc-500" />
            <div>
              <p className="text-xs text-zinc-500">Data</p>
              <p className="text-sm font-medium">{dateObj.toLocaleDateString('pt-BR')}</p>
              <p className="text-xs text-zinc-500">{dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
            <MapPin size={18} className="text-zinc-500" />
            <div>
              <p className="text-xs text-zinc-500">Estádio</p>
              <p className="text-sm font-medium">{match.venue || '?'}</p>
              {match.city && <p className="text-xs text-zinc-500">{match.city}</p>}
            </div>
          </div>
          {match.attendance && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
              <Users size={18} className="text-zinc-500" />
              <div>
                <p className="text-xs text-zinc-500">Público</p>
                <p className="text-sm font-medium">{Number(match.attendance).toLocaleString('pt-BR')}</p>
              </div>
            </div>
          )}
          {match.referee && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
              <Flag size={18} className="text-zinc-500" />
              <div>
                <p className="text-xs text-zinc-500">Árbitro</p>
                <p className="text-sm font-medium">{match.referee}</p>
              </div>
            </div>
          )}
          {match.match_number && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
              <Clock size={18} className="text-zinc-500" />
              <div>
                <p className="text-xs text-zinc-500">Jogo #</p>
                <p className="text-sm font-medium">{match.match_number}</p>
              </div>
            </div>
          )}
        </div>

        {/* Teams links */}
        <div className="flex justify-center gap-4 mb-8">
          <Link href={`/copa/selecao/${encodeURIComponent(home.name || '')}`}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-zinc-300 transition-colors">
            Ver {home.name || 'Time A'}
          </Link>
          <Link href={`/copa/selecao/${encodeURIComponent(away.name || '')}`}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-zinc-300 transition-colors">
            Ver {away.name || 'Time B'}
          </Link>
        </div>

        {/* CazéTV */}
        {cazetvLink && (
          <div className="mb-8">
            {cazetvLink.type === 'replay' ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${cazetvLink.videoId}?origin=https://elucas.dev`}
                    title="CazéTV"
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
                <div className="p-3 flex items-center gap-2 text-xs text-zinc-500">
                  <Youtube size={14} className="text-red-400" />
                  <span>Replay completo na CazéTV</span>
                </div>
              </div>
            ) : (
              <a
                href={cazetvLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 hover:text-red-300 transition-colors"
              >
                <Play size={16} />
                <span className="text-sm font-medium">
                  {cazetvLink.type === 'live' ? '🔴 AO VIVO na CazéTV' :
                   cazetvLink.type === 'pregame' ? 'Pré-jogo na CazéTV' :
                   'Ver na CazéTV'}
                </span>
              </a>
            )}
          </div>
        )}

        {/* Betting */}
        <div className="max-w-sm mx-auto">
          <BettingPanel match={match} bets={bets} onPlaceBet={placeBet} onRemoveBet={removeBet} />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-12">
        <Link href="/copa" className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-zinc-300">
          <ArrowLeft size={14} /> Voltar
        </Link>
      </div>
    </div>
  );
}

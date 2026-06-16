'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Ruler, Shirt, Trophy, Users, ExternalLink } from 'lucide-react';

export default function JogadorPage() {
  const params = useParams();
  const playerName = decodeURIComponent(params.name || '');
  const [player, setPlayer] = useState(null);
  const [wikiData, setWikiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // 1. Try enriched DBpedia data first
      try {
        const res = await fetch('/data/copa/players-detail.json');
        if (res.ok) {
          const data = await res.json();
          for (const [team, players] of Object.entries(data)) {
            const found = players.find(p => p.name === playerName);
            if (found) {
              setPlayer({ ...found, team });
              break;
            }
          }
        }
      } catch {}

      // 2. Fallback to basic players.json
      if (!player) {
        try {
          const res = await fetch('/data/copa/players.json');
          if (res.ok) {
            const data = await res.json();
            for (const [team, players] of Object.entries(data)) {
              const found = players.find(p => p.name === playerName);
              if (found) {
                setPlayer({ ...found, team });
                break;
              }
            }
          }
        } catch {}
      }

      // 3. Fetch Wikipedia data (parallel)
      try {
        const res = await fetch(`/api/copa/player?name=${encodeURIComponent(playerName)}`);
        if (res.ok) {
          const data = await res.json();
          if (!data.not_found && !data.error) {
            setWikiData(data);
          }
        }
      } catch {}
    }
    load().finally(() => setLoading(false));
  }, [playerName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-500">Carregando...</div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <div className="text-5xl">🔍</div>
        <p className="text-zinc-400">Jogador não encontrado</p>
        <Link href="/copa" className="text-yellow-400 hover:underline text-sm">
          ← Voltar para Copa 2026
        </Link>
      </div>
    );
  }

  const detail = player._detail || {};
  const wiki = wikiData || {};
  const hasDetail = detail.birth_date || detail.current_club || detail.height_m;
  const hasWiki = wiki.title && wiki.extract;

  // Use Wikipedia thumbnail over DBpedia if available
  const imageUrl = wiki.thumbnail || detail.thumbnail || null;

  // Parse birth description from Wikipedia (e.g., "Brazilian footballer (born 1992)")
  const birthFromWiki = wiki.description?.match(/\(born (\d{4})\)/)?.[1] || null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link href="/copa" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-4">
            <ArrowLeft size={14} />
            Copa do Mundo 2026
          </Link>

          <div className="flex items-start gap-5">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={player.name}
                className="w-24 h-24 rounded-xl object-cover border border-zinc-700"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="w-24 h-24 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <Users size={36} className="text-zinc-600" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                  #{player.number}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                  player.position === 'GK' ? 'bg-yellow-400/20 text-yellow-400' :
                  player.position === 'DF' ? 'bg-blue-400/20 text-blue-400' :
                  player.position === 'MF' ? 'bg-green-400/20 text-green-400' :
                  player.position === 'FW' ? 'bg-red-400/20 text-red-400' :
                  'bg-zinc-800 text-zinc-400'
                }`}>
                  {player.position || '?'}
                </span>
              </div>
              <h1 className="text-2xl font-bold">{player.name}</h1>
              {wiki.description && (
                <p className="text-sm text-zinc-400 mt-0.5">{wiki.description}</p>
              )}
              {detail.full_name && detail.full_name !== player.name && !wiki.description && (
                <p className="text-sm text-zinc-500 mt-0.5">{detail.full_name}</p>
              )}
              {player.team && (
                <p className="text-sm text-zinc-500 mt-1">{player.team}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Stats from DBpedia */}
        {hasDetail && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {detail.birth_date && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
                <Calendar size={18} className="text-zinc-500" />
                <div>
                  <p className="text-xs text-zinc-500">Nascimento</p>
                  <p className="text-sm font-medium">
                    {new Date(detail.birth_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    {birthFromWiki && <span className="text-zinc-500 text-xs ml-1">({birthFromWiki})</span>}
                  </p>
                </div>
              </div>
            )}
            {detail.birth_place && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
                <MapPin size={18} className="text-zinc-500" />
                <div>
                  <p className="text-xs text-zinc-500">Naturalidade</p>
                  <p className="text-sm font-medium truncate">{detail.birth_place}</p>
                </div>
              </div>
            )}
            {detail.height_m && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
                <Ruler size={18} className="text-zinc-500" />
                <div>
                  <p className="text-xs text-zinc-500">Altura</p>
                  <p className="text-sm font-medium">{detail.height_m}m</p>
                </div>
              </div>
            )}
            {detail.current_club && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
                <Shirt size={18} className="text-zinc-500" />
                <div>
                  <p className="text-xs text-zinc-500">Clube</p>
                  <p className="text-sm font-medium truncate">{detail.current_club}</p>
                </div>
              </div>
            )}
            {detail.national_caps && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
                <Trophy size={18} className="text-zinc-500" />
                <div>
                  <p className="text-xs text-zinc-500">Jogos pela seleção</p>
                  <p className="text-sm font-medium">{detail.national_caps}</p>
                </div>
              </div>
            )}
            {detail.national_goals && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
                <Trophy size={18} className="text-zinc-500" />
                <div>
                  <p className="text-xs text-zinc-500">Gols pela seleção</p>
                  <p className="text-sm font-medium">{detail.national_goals}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Wikipedia bio */}
        {hasWiki && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-8">
            <h2 className="text-sm font-semibold text-zinc-400 mb-2">Sobre</h2>
            <p className="text-sm text-zinc-300 leading-relaxed">{wiki.extract}</p>
            {wiki.wikipedia_url && (
              <a
                href={wiki.wikipedia_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-3 text-xs text-yellow-400 hover:underline"
              >
                <ExternalLink size={12} />
                Ver na Wikipedia
              </a>
            )}
          </div>
        )}

        {/* DBpedia bio (fallback if no Wikipedia) */}
        {!hasWiki && detail.abstract && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-8">
            <h2 className="text-sm font-semibold text-zinc-400 mb-2">Sobre</h2>
            <p className="text-sm text-zinc-300 leading-relaxed">{detail.abstract}</p>
            {detail.wikipedia_url && (
              <a
                href={detail.wikipedia_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-3 text-xs text-yellow-400 hover:underline"
              >
                <ExternalLink size={12} />
                Ver na Wikipedia
              </a>
            )}
          </div>
        )}

        {/* No data at all */}
        {!hasDetail && !hasWiki && (
          <div className="text-center py-12 text-zinc-500 space-y-3">
            <div className="text-4xl">📋</div>
            <p className="text-sm">Dados detalhados indisponíveis para este jogador.</p>
          </div>
        )}
      </div>

      {/* Back */}
      <div className="max-w-3xl mx-auto px-4 pb-12">
        <Link
          href="/copa"
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-zinc-300 transition-colors"
        >
          <ArrowLeft size={14} />
          Voltar para Copa 2026
        </Link>
      </div>
    </div>
  );
}

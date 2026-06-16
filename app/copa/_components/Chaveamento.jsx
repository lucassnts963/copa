'use client';

const MATCH_H = 72;    // px — fixed height per match card
const TOTAL_H = 832;   // px — total bracket height (8 slots × 104px/slot)
const CONN_W  = 22;    // px — width of SVG bracket connector
const COL_W   = 174;   // px — round column width
const GROUP_W = 160;   // px — group qualifier column width
const FINAL_W = 196;   // px — center final column width

// ─── helpers ───────────────────────────────────────────────────────────────

function getFlag(id, tl) {
  if (!id) return '❓';
  const t = tl[id];
  return t?.flag || t?.emoji_string || '🏳️';
}

function getName(id, tl) {
  if (!id) return 'A definir';
  const t = tl[id];
  return t?.name_pt || t?.name || id;
}

function readMatch(m) {
  return {
    homeId:    m?.home_team_id ?? m?.homeId    ?? null,
    awayId:    m?.away_team_id ?? m?.awayId    ?? null,
    homeGoals: m?.home_goals   ?? m?.homeGoals ?? null,
    awayGoals: m?.away_goals   ?? m?.awayGoals ?? null,
    status:    m?.status ?? 'upcoming',
    id:        m?.id ?? null,
  };
}

function pad(arr, n) {
  return [...arr, ...Array(Math.max(0, n - arr.length)).fill(null)];
}

// ─── MatchCard ──────────────────────────────────────────────────────────────

function MatchCard({ match, tl }) {
  if (!match) {
    return (
      <div
        className="rounded border border-zinc-800/40 bg-zinc-900/30 flex items-center justify-center flex-shrink-0"
        style={{ height: MATCH_H }}
      >
        <span className="text-[10px] text-zinc-700">A definir</span>
      </div>
    );
  }

  const { homeId, awayId, homeGoals, awayGoals, status } = readMatch(match);
  const done    = status === 'completed';
  const live    = status === 'in progress' || status === 'live';
  const pending = !homeId && !awayId;
  const homeWin = done && homeGoals > awayGoals;
  const awayWin = done && awayGoals > homeGoals;

  const sides = [
    { id: homeId, goals: homeGoals, win: homeWin },
    { id: awayId, goals: awayGoals, win: awayWin },
  ];

  return (
    <div
      className={`rounded border overflow-hidden text-[11px] leading-none flex-shrink-0 ${
        live ? 'border-yellow-400/60' : 'border-zinc-800'
      } bg-zinc-900`}
      style={{ height: MATCH_H }}
    >
      {live && (
        <div className="bg-yellow-400/15 text-yellow-400 text-[9px] font-bold text-center py-[3px] tracking-widest">
          AO VIVO
        </div>
      )}
      {sides.map((side, i) => (
        <div
          key={i}
          className={`flex items-center gap-1.5 px-2 ${i === 0 ? 'border-b border-zinc-800' : ''} ${side.win ? 'bg-zinc-800/50' : ''}`}
          style={{ paddingTop: live ? 5 : 8, paddingBottom: live ? 5 : 8 }}
        >
          <span className="text-sm leading-none">{getFlag(side.id, tl)}</span>
          <span className={`flex-1 truncate font-medium ${
            pending       ? 'text-zinc-700'
            : side.win    ? 'text-white'
            : done        ? 'text-zinc-500'
            : 'text-zinc-300'
          }`}>
            {getName(side.id, tl)}
          </span>
          {(done || live) && side.id && (
            <span className={`tabular-nums font-bold ml-1 ${side.win ? 'text-yellow-400' : 'text-zinc-500'}`}>
              {side.goals ?? 0}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── SVG bracket connectors ─────────────────────────────────────────────────
// inCount = number of items in the "feeder" (larger) column
// rev=false → feeder on LEFT, output on RIGHT  (left bracket)
// rev=true  → feeder on RIGHT, output on LEFT  (right bracket)

function BConn({ inCount, rev = false }) {
  const midX = CONN_W / 2;

  if (inCount <= 1) {
    return (
      <svg width={CONN_W} height={TOTAL_H} className="flex-shrink-0">
        <line x1={0} y1={TOTAL_H / 2} x2={CONN_W} y2={TOTAL_H / 2} stroke="#3f3f46" strokeWidth="1.5" />
      </svg>
    );
  }

  const outCount = inCount / 2;
  const xIn  = rev ? CONN_W : 0;
  const xOut = rev ? 0 : CONN_W;

  return (
    <svg width={CONN_W} height={TOTAL_H} className="flex-shrink-0">
      {Array.from({ length: outCount }, (_, i) => {
        const y1 = ((2 * i + 0.5) / inCount) * TOTAL_H;
        const y2 = ((2 * i + 1.5) / inCount) * TOTAL_H;
        const yn = ((i + 0.5) / outCount) * TOTAL_H;
        return (
          <g key={i} stroke="#3f3f46" strokeWidth="1.5" fill="none">
            <line x1={xIn} y1={y1} x2={midX} y2={y1} />
            <line x1={xIn} y1={y2} x2={midX} y2={y2} />
            <line x1={midX} y1={y1} x2={midX} y2={y2} />
            <line x1={midX} y1={yn} x2={xOut} y2={yn} />
          </g>
        );
      })}
    </svg>
  );
}

// ─── Round column ───────────────────────────────────────────────────────────

function RoundCol({ matches, tl }) {
  return (
    <div
      className="flex-shrink-0 flex flex-col justify-around"
      style={{ width: COL_W, height: TOTAL_H }}
    >
      {matches.map((m, i) => (
        <MatchCard key={m?.id ?? `slot-${i}`} match={m} tl={tl} />
      ))}
    </div>
  );
}

// ─── Group qualifiers column ─────────────────────────────────────────────────

function sortTeams(teams) {
  return [...(teams || [])].sort((a, b) => {
    const dp = (b.points ?? 0) - (a.points ?? 0);
    if (dp !== 0) return dp;
    const gdA = (a.goals_for ?? 0) - (a.goals_against ?? 0);
    const gdB = (b.goals_for ?? 0) - (b.goals_against ?? 0);
    return gdB - gdA;
  });
}

function GroupsCol({ groups, tl }) {
  const sorted = (groups || []).map(g => ({ ...g, teams: sortTeams(g.teams) }));

  return (
    <div
      className="flex-shrink-0 flex flex-col justify-around"
      style={{ width: GROUP_W, height: TOTAL_H }}
    >
      {sorted.length === 0
        ? Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="border border-zinc-800/40 rounded bg-zinc-900/30 flex items-center justify-center" style={{ height: 88 }}>
              <span className="text-[10px] text-zinc-700">Grupo —</span>
            </div>
          ))
        : sorted.map(g => (
            <div key={g.id} className="border border-zinc-800 rounded overflow-hidden bg-zinc-900/50">
              <div className="bg-zinc-800/70 px-2 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                Grupo {g.id}
              </div>
              {(g.teams || []).slice(0, 3).map((team, idx) => {
                const q = idx < 2;
                return (
                  <div
                    key={team.id}
                    className={`flex items-center gap-1 px-1.5 py-[5px] text-[10px] border-t border-zinc-800/40 ${q ? 'text-zinc-200' : 'text-zinc-600'}`}
                  >
                    <span className={`w-2.5 text-[8px] font-bold ${q ? 'text-green-500' : 'text-zinc-700'}`}>
                      {q ? '✓' : '?'}
                    </span>
                    <span>{getFlag(team.id, tl)}</span>
                    <span className="flex-1 truncate">{getName(team.id, tl)}</span>
                    <span className="font-bold text-zinc-500 tabular-nums">{team.points ?? 0}p</span>
                  </div>
                );
              })}
            </div>
          ))}
    </div>
  );
}

// ─── Final center column ─────────────────────────────────────────────────────

function FinalCol({ final, thirdPlace, tl }) {
  return (
    <div
      className="flex-shrink-0 flex flex-col items-stretch justify-center gap-5 px-2"
      style={{ width: FINAL_W, height: TOTAL_H }}
    >
      <div>
        <p className="text-yellow-400 text-[10px] font-bold uppercase tracking-widest text-center mb-1.5">
          🏆 Final
        </p>
        <MatchCard match={final ?? null} tl={tl} />
      </div>
      {thirdPlace && (
        <div>
          <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest text-center mb-1">
            3º Lugar
          </p>
          <MatchCard match={thirdPlace} tl={tl} />
        </div>
      )}
    </div>
  );
}

// ─── Phase header labels ─────────────────────────────────────────────────────

const PHASE_LABELS = [
  { label: 'Grupos A–F', w: GROUP_W },
  { label: '',            w: CONN_W + 8 },
  { label: 'Round of 32',w: COL_W },
  { label: '',            w: CONN_W },
  { label: 'Round of 16',w: COL_W },
  { label: '',            w: CONN_W },
  { label: 'Quartas',     w: COL_W },
  { label: '',            w: CONN_W },
  { label: 'Semis',       w: COL_W },
  { label: '',            w: CONN_W },
  { label: '🏆 Final',   w: FINAL_W, gold: true },
  { label: '',            w: CONN_W },
  { label: 'Semis',       w: COL_W },
  { label: '',            w: CONN_W },
  { label: 'Quartas',     w: COL_W },
  { label: '',            w: CONN_W },
  { label: 'Round of 16',w: COL_W },
  { label: '',            w: CONN_W },
  { label: 'Round of 32',w: COL_W },
  { label: '',            w: CONN_W + 8 },
  { label: 'Grupos G–L', w: GROUP_W },
];

// ─── Main component ──────────────────────────────────────────────────────────

export default function Chaveamento({ bracket, grupos, teamLookup: tl = {} }) {
  if (!bracket) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-3">
        <span className="text-5xl">🏆</span>
        <p className="text-sm">Chaveamento indisponível.</p>
      </div>
    );
  }

  const r32 = bracket.round_of_32    || [];
  const r16 = bracket.round_of_16    || [];
  const qf  = bracket.quarter_finals || [];
  const sf  = bracket.semi_finals    || [];

  const lR32 = pad(r32.slice(0, 8),  8);
  const rR32 = pad(r32.slice(8, 16), 8);
  const lR16 = pad(r16.slice(0, 4),  4);
  const rR16 = pad(r16.slice(4, 8),  4);
  const lQF  = pad(qf.slice(0, 2),   2);
  const rQF  = pad(qf.slice(2, 4),   2);
  const lSF  = pad(sf.slice(0, 1),   1);
  const rSF  = pad(sf.slice(1, 2),   1);

  const groupsArr = Array.isArray(grupos) ? grupos : [];
  const lGroups   = groupsArr.slice(0, 6);
  const rGroups   = groupsArr.slice(6, 12);

  // Dashed vertical separator between groups col and R32 col (seeding TBD)
  const DashedSep = ({ alignRight = false }) => (
    <div className="flex-shrink-0 flex items-center justify-center" style={{ width: CONN_W + 8, height: TOTAL_H }}>
      <svg width={1} height={TOTAL_H}>
        <line x1={0} y1={0} x2={0} y2={TOTAL_H} stroke="#3f3f46" strokeWidth="1" strokeDasharray="5 5" />
      </svg>
    </div>
  );

  return (
    <div className="space-y-2">
      <p className="text-center text-[11px] text-zinc-500">
        Round of 32 começa em 28/06 &nbsp;·&nbsp; Fase de grupos em andamento &nbsp;·&nbsp; 48 seleções
      </p>

      <div className="overflow-x-auto pb-4 -mx-4 px-4">
        <div className="min-w-max">

          {/* Phase header */}
          <div className="flex items-end mb-2">
            {PHASE_LABELS.map((p, i) => (
              <div
                key={i}
                className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wider pb-1 text-center ${
                  p.gold ? 'text-yellow-400/80' : 'text-zinc-600'
                }`}
                style={{ width: p.w }}
              >
                {p.label}
              </div>
            ))}
          </div>

          {/* Bracket */}
          <div className="flex items-center">

            {/* ← LEFT SIDE (Groups A-F → R32 → R16 → QF → SF → Final) */}
            <GroupsCol groups={lGroups} tl={tl} />
            <DashedSep />
            <RoundCol matches={lR32} tl={tl} />
            <BConn inCount={8} />
            <RoundCol matches={lR16} tl={tl} />
            <BConn inCount={4} />
            <RoundCol matches={lQF} tl={tl} />
            <BConn inCount={2} />
            <RoundCol matches={lSF} tl={tl} />
            <BConn inCount={1} />

            {/* CENTER — Final + 3rd place */}
            <FinalCol final={bracket.final} thirdPlace={bracket.third_place} tl={tl} />

            {/* RIGHT SIDE (Final ← SF ← QF ← R16 ← R32 ← Groups G-L) */}
            <BConn inCount={1} rev />
            <RoundCol matches={rSF} tl={tl} />
            <BConn inCount={2} rev />
            <RoundCol matches={rQF} tl={tl} />
            <BConn inCount={4} rev />
            <RoundCol matches={rR16} tl={tl} />
            <BConn inCount={8} rev />
            <RoundCol matches={rR32} tl={tl} />
            <DashedSep alignRight />
            <GroupsCol groups={rGroups} tl={tl} />

          </div>
        </div>
      </div>

      <p className="text-center text-[10px] text-zinc-700">
        Os 8 melhores 3ºs lugares também avançam &nbsp;·&nbsp; Chaveamento oficial definido após fase de grupos
      </p>
      {bracket.updated_at && (
        <p className="text-center text-[10px] text-zinc-700 mt-0.5">
          Atualizado em{' '}
          {new Date(bracket.updated_at).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
          })}
        </p>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';

const TEAMS_RAW = '/api/copa/teams';
const MATCHES_API = '/api/copa/matches';
const SCORERS_API = '/api/copa/scorers';
const BRACKET_API = '/api/copa/bracket';
const ADMIN_API   = '/api/copa/admin';

const TABS = [
  { id: 'resultados', label: '⚽ Resultados' },
  { id: 'artilheiros', label: '🥅 Artilheiros' },
  { id: 'chaveamento', label: '🏆 Chaveamento R32' },
];

const STATUS_OPTIONS = [
  { value: 'upcoming',    label: 'Aguardando' },
  { value: 'live',        label: 'Ao vivo' },
  { value: 'completed',   label: 'Encerrado' },
];

// ─── Auth screen ────────────────────────────────────────────────────────────

function AuthScreen({ onAuth }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');

  const handleSubmit = async () => {
    if (!pw) return;
    const res = await fetch(ADMIN_API, {
      headers: { 'x-admin-key': pw },
    });
    const json = await res.json().catch(() => ({ ok: false }));
    if (json.ok) { onAuth(pw); }
    else { setErr('Senha incorreta'); }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center">
          <div className="text-4xl mb-2">🏆</div>
          <h1 className="text-xl font-bold text-yellow-400">Copa Admin</h1>
          <p className="text-xs text-zinc-500 mt-1">Acesso restrito</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="Chave de admin (ADMIN_KEY)"
            className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-400"
            autoFocus
          />
          {err && <p className="text-red-400 text-xs">{err}</p>}
          <button
            onClick={handleSubmit}
            className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg text-sm transition-colors"
          >
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Save button ─────────────────────────────────────────────────────────────

function SaveBtn({ onClick, saving, status }) {
  return (
    <div className="flex items-center gap-3">
      {status && (
        <span className={`text-xs ${status.startsWith('✅') ? 'text-green-400' : status.startsWith('⚠️') ? 'text-yellow-400' : 'text-red-400'}`}>
          {status}
        </span>
      )}
      <button
        onClick={onClick}
        disabled={saving}
        className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg text-sm transition-colors disabled:opacity-50"
      >
        {saving ? 'Salvando...' : '💾 Salvar'}
      </button>
    </div>
  );
}

// ─── Resultados tab ───────────────────────────────────────────────────────────

function ResultadosTab({ teamLookup, adminKey }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [status, setStatus]   = useState('');
  const [filter, setFilter]   = useState('');

  useEffect(() => {
    fetch(MATCHES_API)
      .then(r => r.json())
      .then(d => setMatches(Array.isArray(d) ? d : (d.matches || [])))
      .catch(() => setStatus('❌ Erro ao carregar partidas'))
      .finally(() => setLoading(false));
  }, []);

  const update = (idx, field, value) =>
    setMatches(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m));

  const handleSave = async () => {
    setSaving(true);
    setStatus('');
    try {
      const data = { updated_at: new Date().toISOString(), matches };
      const res  = await fetch(ADMIN_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ type: 'matches', data }),
      });
      const json = await res.json();
      if (!json.ok && !json.warning) throw new Error(json.error);
      setStatus(json.warning ? `⚠️ Local salvo. GitHub: ${json.warning}` : '✅ Salvo!');
      setTimeout(() => setStatus(''), 5000);
    } catch (e) {
      setStatus(`❌ ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const visible = matches.filter(m =>
    !filter || m.home_team_id?.includes(filter.toUpperCase()) || m.away_team_id?.includes(filter.toUpperCase()) ||
    m.group?.includes(filter.toUpperCase()) || m.id?.includes(filter)
  );

  if (loading) return <p className="text-zinc-500 text-sm text-center py-10">Carregando...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filtrar por ID do time, grupo..."
          className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-400"
        />
        <SaveBtn onClick={handleSave} saving={saving} status={status} />
      </div>

      <div className="space-y-1">
        {visible.map((m, i) => {
          const realIdx = matches.indexOf(m);
          const hFlag = teamLookup[m.home_team_id]?.flag || m.home_team_id || '?';
          const aFlag = teamLookup[m.away_team_id]?.flag || m.away_team_id || '?';
          return (
            <div key={m.id} className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-zinc-500 w-20 shrink-0">{m.id}</span>
              <span className="text-sm">{hFlag}</span>
              <span className="text-xs text-zinc-300 w-20 truncate">{m.home_team_id}</span>
              <span className="text-xs text-zinc-500">vs</span>
              <span className="text-xs text-zinc-300 w-20 truncate">{m.away_team_id}</span>
              <span className="text-sm">{aFlag}</span>

              <span className="text-zinc-600 text-xs mx-1">|</span>

              <select
                value={m.status || 'upcoming'}
                onChange={e => update(realIdx, 'status', e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200"
              >
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>

              <input
                type="number"
                min={0}
                max={99}
                value={m.home_goals ?? ''}
                onChange={e => update(realIdx, 'home_goals', e.target.value === '' ? null : Number(e.target.value))}
                placeholder="—"
                className="w-12 text-center bg-zinc-800 border border-zinc-700 rounded px-1 py-1 text-sm text-white"
              />
              <span className="text-zinc-600">×</span>
              <input
                type="number"
                min={0}
                max={99}
                value={m.away_goals ?? ''}
                onChange={e => update(realIdx, 'away_goals', e.target.value === '' ? null : Number(e.target.value))}
                placeholder="—"
                className="w-12 text-center bg-zinc-800 border border-zinc-700 rounded px-1 py-1 text-sm text-white"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Artilheiros tab ─────────────────────────────────────────────────────────

function empty() {
  return { name: '', name_pt: '', team_id: '', goals: 1, assists: 0, penalties: 0 };
}

function ArtilheirosTab({ teamLookup, adminKey }) {
  const [scorers, setScorers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [status, setStatus]   = useState('');

  useEffect(() => {
    fetch(SCORERS_API)
      .then(r => r.json())
      .then(d => setScorers(Array.isArray(d) ? d : (d.scorers || [])))
      .catch(() => setStatus('❌ Erro ao carregar'))
      .finally(() => setLoading(false));
  }, []);

  const add    = () => setScorers(prev => [empty(), ...prev]);
  const remove = i  => setScorers(prev => prev.filter((_, j) => j !== i));
  const update = (i, field, value) =>
    setScorers(prev => prev.map((s, j) => j === i ? { ...s, [field]: value } : s));

  const handleSave = async () => {
    setSaving(true);
    setStatus('');
    try {
      const sorted = [...scorers].sort((a, b) => (b.goals || 0) - (a.goals || 0));
      const data   = { updated_at: new Date().toISOString(), scorers: sorted };
      const res    = await fetch(ADMIN_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ type: 'scorers', data }),
      });
      const json = await res.json();
      if (!json.ok && !json.warning) throw new Error(json.error);
      setScorers(sorted);
      setStatus(json.warning ? `⚠️ ${json.warning}` : '✅ Salvo!');
      setTimeout(() => setStatus(''), 5000);
    } catch (e) {
      setStatus(`❌ ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-zinc-500 text-sm text-center py-10">Carregando...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={add} className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-colors">
          + Artilheiro
        </button>
        <SaveBtn onClick={handleSave} saving={saving} status={status} />
      </div>

      <div className="space-y-2">
        {scorers.map((s, i) => {
          const flag = teamLookup[s.team_id]?.flag || '';
          return (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex flex-wrap gap-2 items-center">
              <span className="text-lg">{flag || '🏳️'}</span>

              <input
                value={s.team_id}
                onChange={e => update(i, 'team_id', e.target.value.toUpperCase())}
                placeholder="ID (ex: BRA)"
                className="w-16 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-white focus:outline-none focus:border-yellow-400"
              />
              <input
                value={s.name}
                onChange={e => update(i, 'name', e.target.value)}
                placeholder="Nome EN"
                className="flex-1 min-w-32 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-white focus:outline-none focus:border-yellow-400"
              />
              <input
                value={s.name_pt || ''}
                onChange={e => update(i, 'name_pt', e.target.value)}
                placeholder="Nome PT"
                className="flex-1 min-w-32 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-white focus:outline-none focus:border-yellow-400"
              />

              <div className="flex items-center gap-1 text-xs text-zinc-400">
                <span>⚽</span>
                <input
                  type="number" min={0} max={99}
                  value={s.goals ?? 0}
                  onChange={e => update(i, 'goals', Number(e.target.value))}
                  className="w-10 text-center px-1 py-1 bg-zinc-800 border border-zinc-700 rounded text-white"
                />
              </div>
              <div className="flex items-center gap-1 text-xs text-zinc-400">
                <span>🎯</span>
                <input
                  type="number" min={0} max={99}
                  value={s.assists ?? 0}
                  onChange={e => update(i, 'assists', Number(e.target.value))}
                  className="w-10 text-center px-1 py-1 bg-zinc-800 border border-zinc-700 rounded text-white"
                />
              </div>
              <div className="flex items-center gap-1 text-xs text-zinc-400">
                <span>🅿️</span>
                <input
                  type="number" min={0} max={99}
                  value={s.penalties ?? 0}
                  onChange={e => update(i, 'penalties', Number(e.target.value))}
                  className="w-10 text-center px-1 py-1 bg-zinc-800 border border-zinc-700 rounded text-white"
                />
              </div>

              <button onClick={() => remove(i)} className="ml-auto text-zinc-600 hover:text-red-400 text-lg leading-none">×</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Chaveamento R32 tab ─────────────────────────────────────────────────────

function ChaveamentoTab({ teamLookup, adminKey }) {
  const [bracket, setBracket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [status, setStatus]   = useState('');

  const teamIds = Object.keys(teamLookup).sort();

  useEffect(() => {
    fetch(BRACKET_API)
      .then(r => r.json())
      .then(d => setBracket(d))
      .catch(() => setStatus('❌ Erro ao carregar'))
      .finally(() => setLoading(false));
  }, []);

  const updateMatch = (round, idx, field, value) => {
    setBracket(prev => {
      const isArr = Array.isArray(prev[round]);
      if (isArr) {
        const arr = [...prev[round]];
        arr[idx] = { ...arr[idx], [field]: value === '' ? null : value };
        return { ...prev, [round]: arr };
      }
      return { ...prev, [round]: { ...prev[round], [field]: value === '' ? null : value } };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus('');
    try {
      const data = { ...bracket, updated_at: new Date().toISOString() };
      const res  = await fetch(ADMIN_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ type: 'bracket', data }),
      });
      const json = await res.json();
      if (!json.ok && !json.warning) throw new Error(json.error);
      setStatus(json.warning ? `⚠️ ${json.warning}` : '✅ Salvo!');
      setTimeout(() => setStatus(''), 5000);
    } catch (e) {
      setStatus(`❌ ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !bracket) return <p className="text-zinc-500 text-sm text-center py-10">Carregando...</p>;

  const rounds = [
    { key: 'round_of_32',    label: 'Round of 32' },
    { key: 'round_of_16',    label: 'Round of 16' },
    { key: 'quarter_finals', label: 'Quartas de Final' },
    { key: 'semi_finals',    label: 'Semifinais' },
  ];
  const singles = [
    { key: 'third_place', label: '3º Lugar' },
    { key: 'final',       label: 'Final' },
  ];

  const MatchRow = ({ m, round, idx, single = false }) => {
    if (!m) return null;
    const hFlag = teamLookup[m.home_team_id]?.flag || '';
    const aFlag = teamLookup[m.away_team_id]?.flag || '';
    const upd = (field, val) => updateMatch(round, single ? 0 : idx, field, val);
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex flex-wrap gap-2 items-center text-sm">
        <span className="text-[10px] text-zinc-500 w-20 shrink-0">{m.id}</span>

        <span className="text-base">{hFlag || '❓'}</span>
        <select
          value={m.home_team_id || ''}
          onChange={e => upd('home_team_id', e.target.value || null)}
          className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 w-28"
        >
          <option value="">-- TBD --</option>
          {teamIds.map(id => (
            <option key={id} value={id}>{teamLookup[id]?.flag} {id}</option>
          ))}
        </select>

        <input
          type="number" min={0} max={99}
          value={m.home_goals ?? ''}
          onChange={e => upd('home_goals', e.target.value === '' ? null : Number(e.target.value))}
          placeholder="—"
          className="w-12 text-center bg-zinc-800 border border-zinc-700 rounded px-1 py-1 text-white"
        />
        <span className="text-zinc-600">×</span>
        <input
          type="number" min={0} max={99}
          value={m.away_goals ?? ''}
          onChange={e => upd('away_goals', e.target.value === '' ? null : Number(e.target.value))}
          placeholder="—"
          className="w-12 text-center bg-zinc-800 border border-zinc-700 rounded px-1 py-1 text-white"
        />

        <select
          value={m.away_team_id || ''}
          onChange={e => upd('away_team_id', e.target.value || null)}
          className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 w-28"
        >
          <option value="">-- TBD --</option>
          {teamIds.map(id => (
            <option key={id} value={id}>{id} {teamLookup[id]?.flag}</option>
          ))}
        </select>
        <span className="text-base">{aFlag || '❓'}</span>

        <select
          value={m.status || 'upcoming'}
          onChange={e => upd('status', e.target.value)}
          className="ml-auto bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200"
        >
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <SaveBtn onClick={handleSave} saving={saving} status={status} />
      </div>

      {rounds.map(r => {
        const arr = bracket[r.key];
        if (!Array.isArray(arr) || arr.length === 0) return null;
        return (
          <div key={r.key}>
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">{r.label} ({arr.length} jogos)</h3>
            <div className="space-y-1.5">
              {arr.map((m, i) => <MatchRow key={m?.id || i} m={m} round={r.key} idx={i} />)}
            </div>
          </div>
        );
      })}

      {singles.map(s => {
        const m = bracket[s.key];
        if (!m) return null;
        return (
          <div key={s.key}>
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">{s.label}</h3>
            <MatchRow m={m} round={s.key} idx={0} single />
          </div>
        );
      })}
    </div>
  );
}

// ─── Main admin page ─────────────────────────────────────────────────────────

export default function CopaAdmin() {
  const [auth, setAuth]           = useState(false);
  const [adminKey, setAdminKey]   = useState('');
  const [checking, setChecking]   = useState(false);
  const [activeTab, setActiveTab] = useState('resultados');
  const [teamLookup, setTeamLookup] = useState({});

  useEffect(() => {
    if (!auth) return;
    fetch(TEAMS_RAW)
      .then(r => r.json())
      .then(teams => {
        if (!Array.isArray(teams)) return;
        setTeamLookup(Object.fromEntries(teams.map(t => [t.id, t])));
      })
      .catch(() => {});
  }, [auth]);

  if (!auth) return (
    <AuthScreen onAuth={(key) => { setAdminKey(key); setAuth(true); }} />
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 sticky top-0 bg-zinc-950/95 backdrop-blur-sm z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-yellow-400">🏆 Copa Admin</h1>
            <a href="/copa" className="text-[11px] text-zinc-600 hover:text-zinc-400">← Voltar para Copa</a>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex-shrink-0 ${
                  activeTab === t.id
                    ? 'border-yellow-400 text-yellow-400'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === 'resultados'  && <ResultadosTab   teamLookup={teamLookup} adminKey={adminKey} />}
        {activeTab === 'artilheiros' && <ArtilheirosTab  teamLookup={teamLookup} adminKey={adminKey} />}
        {activeTab === 'chaveamento' && <ChaveamentoTab  teamLookup={teamLookup} adminKey={adminKey} />}
      </div>
    </div>
  );
}

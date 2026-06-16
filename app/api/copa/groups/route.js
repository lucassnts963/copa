import { NextResponse } from 'next/server';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const RAW = 'https://raw.githubusercontent.com/lucassnts963/lucas-data/main/worldcup/standings.json';

export const revalidate = 300;

function parseStandings({ groups, updated_at }) {
  return Object.entries(groups || {}).map(([letter, teams]) => ({
    id: letter,
    name: `Grupo ${letter}`,
    updated_at,
    teams: (teams || []).map(t => ({
      id: t.team_id,
      name: t.team_name,
      name_pt: t.team_name_pt,
      points: t.points ?? 0,
      games_played: t.played ?? 0,
      wins: t.won ?? 0,
      draws: t.drawn ?? 0,
      losses: t.lost ?? 0,
      goals_for: t.gf ?? 0,
      goals_against: t.ga ?? 0,
    })),
  }));
}

function localFallback() {
  try {
    const path = join(process.cwd(), 'public', 'data', 'worldcup', 'standings.json');
    const data = JSON.parse(readFileSync(path, 'utf8'));
    return parseStandings(data);
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const res = await fetch(RAW, { next: { revalidate: 300 } });
    if (res.status === 404) return NextResponse.json(localFallback());
    if (!res.ok) throw new Error(`GitHub raw ${res.status}`);
    return NextResponse.json(parseStandings(await res.json()));
  } catch {
    return NextResponse.json(localFallback());
  }
}

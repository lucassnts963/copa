import { NextResponse } from 'next/server';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const RAW = 'https://raw.githubusercontent.com/lucassnts963/lucas-data/main/worldcup/standings.json';

export const revalidate = 300;

function fairPlay(t) {
  return -((t.yellow_cards ?? 0) + 3 * (t.red_cards ?? 0));
}

function buildRankings({ groups, updated_at }) {
  const all = [];
  for (const [letter, teams] of Object.entries(groups || {})) {
    for (const team of teams || []) {
      all.push({ ...team, group: letter });
    }
  }
  all.sort((a, b) =>
    (b.points ?? 0) - (a.points ?? 0) ||
    ((b.gd ?? 0) - (a.gd ?? 0)) ||
    ((b.gf ?? 0) - (a.gf ?? 0)) ||
    (fairPlay(b) - fairPlay(a)),
  );
  return { updated_at, rankings: all.map((t, i) => ({ ...t, rank: i + 1 })) };
}

function localFallback() {
  try {
    const path = join(process.cwd(), 'public', 'data', 'worldcup', 'standings.json');
    return buildRankings(JSON.parse(readFileSync(path, 'utf8')));
  } catch {
    return { rankings: [], updated_at: null };
  }
}

export async function GET() {
  try {
    const res = await fetch(RAW, { next: { revalidate: 300 } });
    if (res.status === 404) return NextResponse.json(localFallback());
    if (!res.ok) throw new Error(`GitHub raw ${res.status}`);
    return NextResponse.json(buildRankings(await res.json()));
  } catch {
    return NextResponse.json(localFallback());
  }
}

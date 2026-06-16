import { NextResponse } from 'next/server';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const RAW = 'https://raw.githubusercontent.com/lucassnts963/lucas-data/main/worldcup/bracket.json';

export const revalidate = 300;

const EMPTY = { round_of_32: [], round_of_16: [], quarter_finals: [], semi_finals: [], third_place: null, final: null };

function localFallback() {
  try {
    const path = join(process.cwd(), 'public', 'data', 'worldcup', 'bracket.json');
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return EMPTY;
  }
}

export async function GET() {
  try {
    const res = await fetch(RAW, { next: { revalidate: 300 } });
    if (res.status === 404) return NextResponse.json(localFallback());
    if (!res.ok) throw new Error(`GitHub raw ${res.status}`);
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json(localFallback());
  }
}

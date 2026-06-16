import { NextResponse } from 'next/server';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const RAW = 'https://raw.githubusercontent.com/lucassnts963/lucas-data/main/worldcup/scorers.json';

export const revalidate = 300;

function localFallback() {
  try {
    const path = join(process.cwd(), 'public', 'data', 'worldcup', 'scorers.json');
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return { scorers: [], updated_at: null };
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

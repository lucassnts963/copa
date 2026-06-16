import { NextResponse } from 'next/server';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('team');

  try {
    const path = join(process.cwd(), 'public', 'data', 'worldcup', 'players.json');
    const all = JSON.parse(readFileSync(path, 'utf8'));
    const data = teamId ? (all[teamId] ?? []) : all;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(teamId ? [] : {});
  }
}

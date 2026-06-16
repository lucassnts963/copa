import { NextResponse } from 'next/server';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const dynamic = 'force-static';

export async function GET() {
  try {
    const path = join(process.cwd(), 'public', 'data', 'worldcup', 'teams.json');
    const data = JSON.parse(readFileSync(path, 'utf8'));
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json([]);
  }
}

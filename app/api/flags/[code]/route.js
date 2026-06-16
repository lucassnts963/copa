// app/api/flags/[code]/route.js — Serve bandeiras locais com cache agressivo
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const FLAGS_DIR = path.join(process.cwd(), 'public', 'flags');
const AVAIL_SIZES = [16, 32, 64, 128, 256];

export async function GET(request, { params }) {
  const { code } = await params; // Next.js 15: params é async
  const size = request.nextUrl.searchParams.get('size') || '64';

  // Sanitize inputs
  const safeCode = code.replace(/[^a-z0-9-]/gi, '').toLowerCase();
  const safeSize = Math.min(Math.max(parseInt(size) || 64, 16), 256);
  const closestSize = AVAIL_SIZES.reduce((a, b) => 
    Math.abs(b - safeSize) < Math.abs(a - safeSize) ? b : a
  );

  const filePath = path.join(FLAGS_DIR, `${safeCode}_${closestSize}.png`);

  try {
    const buf = fs.readFileSync(filePath);
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': String(buf.length),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Flag not found' }, { status: 404 });
  }
}

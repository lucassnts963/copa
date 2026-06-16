import { NextResponse } from 'next/server';

// Cache translations permanently (text doesn't change)
export const revalidate = false; // immutable

const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY;

// In-memory translation cache
const cache = new Map();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');
  const target = searchParams.get('target') || 'pt';

  if (!text || text.length < 5) {
    return NextResponse.json({ error: 'text too short' }, { status: 400 });
  }

  const cacheKey = `${text.slice(0, 100)}_${target}`;
  if (cache.has(cacheKey)) {
    return NextResponse.json({ translated: cache.get(cacheKey), cached: true });
  }

  if (!DEEPSEEK_KEY) {
    return NextResponse.json({ translated: text, cached: false, note: 'no key' });
  }

  try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{
          role: 'user',
          content: `Traduza o seguinte texto do inglês para português (Brasil). Mantenha nomes próprios, números e termos técnicos iguais. Retorne APENAS a tradução, sem explicações:\n\n${text}`,
        }],
        temperature: 0,
        max_tokens: 1024,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const translated = data.choices[0].message.content.trim();
      cache.set(cacheKey, translated);
      return NextResponse.json({ translated, cached: false });
    }
  } catch {}

  return NextResponse.json({ translated: text, cached: false, note: 'fallback' });
}

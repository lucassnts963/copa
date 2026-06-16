import { NextResponse } from 'next/server';

// Cache Wikipedia responses for 24h (player data doesn't change during tournament)
export const revalidate = 86400;

const WIKI_REST = 'https://en.wikipedia.org/api/rest_v1/page/summary';
const USER_AGENT = 'elucas.dev/1.0 (contact@elucas.dev)';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json({ error: 'name required' }, { status: 400 });
  }

  // Try Wikipedia REST API
  const slug = encodeURIComponent(name);
  try {
    const res = await fetch(`${WIKI_REST}/${slug}`, {
      headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        title: data.title,
        description: data.description,
        extract: data.extract,
        thumbnail: data.thumbnail?.source || null,
        wikipedia_url: data.content_urls?.desktop?.page || null,
        type: data.type,
      });
    }

    // 404 = player not on Wikipedia
    if (res.status === 404) {
      return NextResponse.json({ not_found: true });
    }
  } catch {
    // Network error — fall through
  }

  return NextResponse.json({ error: 'wikipedia unavailable' }, { status: 502 });
}

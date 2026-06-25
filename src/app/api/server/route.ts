import { NextRequest, NextResponse } from 'next/server';
import { resolveServerUrl } from '@/lib/scrapers/otakudesu';

const SANKA_SERVER = 'https://www.sankavollerei.com/anime/server';

async function fetchSanka(serverId: string) {
  try {
    const res = await fetch(`${SANKA_SERVER}/${serverId}`, {
      next: { revalidate: 3600 },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || (json?.url ? json : null);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing serverId' }, { status: 400 });

  // If it's our otaku- prefixed ID, resolve via direct mirror
  if (id.startsWith('otaku-')) {
    const url = await resolveServerUrl(id);
    if (url) {
      return NextResponse.json({ url }, {
        headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600' },
      });
    }
    console.warn(`[Server] Direct failed for ${id}, falling back to Sanka`);
  }

  // Fallback to Sanka
  const sanka = await fetchSanka(id);
  if (sanka) return NextResponse.json(sanka);

  return NextResponse.json({ error: 'Server not found' }, { status: 404 });
}

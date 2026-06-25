import { NextRequest, NextResponse } from 'next/server';
import { resolveServerUrl } from '@/lib/scrapers/otakudesu';

export async function GET(request: NextRequest) {
  const serverId = request.nextUrl.searchParams.get('id');

  if (!serverId) {
    return NextResponse.json({ error: 'Missing serverId' }, { status: 400 });
  }

  try {
    const url = await resolveServerUrl(serverId);
    if (!url) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 });
    }
    return NextResponse.json({ url }, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600' },
    });
  } catch (e) {
    console.error('[Otakudesu Server]', e);
    return NextResponse.json({ error: 'Failed to resolve server' }, { status: 500 });
  }
}

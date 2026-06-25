import { NextRequest, NextResponse } from 'next/server';
import { getEpisodeResponse } from '@/lib/scrapers/otakudesu';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.json({ error: 'Missing episode slug' }, { status: 400 });
  }

  try {
    const data = await getEpisodeResponse(slug);
    if (!data) {
      return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
    }
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600' },
    });
  } catch (e) {
    console.error('[Otakudesu Episode]', e);
    return NextResponse.json({ error: 'Failed to fetch episode' }, { status: 500 });
  }
}

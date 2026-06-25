import { NextRequest, NextResponse } from 'next/server';
import { AnimeService } from '@/lib/services/anime';
import { sanitizeAnimeList } from '@/lib/sanitize';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slugs } = body;

    if (!Array.isArray(slugs) || slugs.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const MAX_SLUGS = 50;
    const safeSlugs = slugs
      .filter((s: unknown) => typeof s === 'string' && s.length < 200)
      .slice(0, MAX_SLUGS);

    if (safeSlugs.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const recommendations = await AnimeService.getForYouRecommendations(safeSlugs, 6);
    return NextResponse.json({ data: sanitizeAnimeList(recommendations) });
  } catch (error) {
    console.error('For You API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}

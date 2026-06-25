import { NextRequest, NextResponse } from 'next/server';
import { AnimeService } from '@/lib/services/anime';
import { sanitizeAnimeList, clampLimit } from '@/lib/sanitize';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = clampLimit(parseInt(searchParams.get('limit') || '20'), 20);
  
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  try {
    const result = await AnimeService.getAnimeByGenre(slug, page, limit);
    return NextResponse.json({ ...result, items: sanitizeAnimeList(result.items) });
  } catch (error) {
    console.error('Error fetching anime by genre:', error);
    return NextResponse.json({ error: 'Failed to fetch anime' }, { status: 500 });
  }
}

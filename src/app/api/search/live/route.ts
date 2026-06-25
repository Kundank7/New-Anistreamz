import { NextRequest, NextResponse } from 'next/server';
import { AnimeService } from '@/lib/services/anime';
import { sanitizeAnimeList } from '@/lib/sanitize';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  
  if (!query || query.length < 2) {
    return NextResponse.json({ data: [] });
  }
  
  try {
    const results = await AnimeService.searchAnime(query, 4);
    return NextResponse.json({ data: sanitizeAnimeList(results) });
  } catch (error) {
    console.error('Live Search API Error:', error);
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
  }
}

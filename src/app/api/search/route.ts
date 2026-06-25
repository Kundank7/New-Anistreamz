import { NextRequest, NextResponse } from 'next/server';
import { AnimeService } from '@/lib/services/anime';
import { sanitizeAnimeList, clampLimit } from '@/lib/sanitize';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const genre = searchParams.get('genre') || '';
  const genres = searchParams.get('genres') || '';
  const genreMode = searchParams.get('genreMode') || 'any';
  const status = searchParams.get('status') || '';
  const type = searchParams.get('type') || '';
  const letter = searchParams.get('letter') || '';
  const year = searchParams.get('year') || '';
  const season = searchParams.get('season') || '';
  const rating = searchParams.get('rating') || '';
  const source = searchParams.get('source') || '';
  const studio = searchParams.get('studio') || '';
  const studios = searchParams.get('studios') || '';
  const order = searchParams.get('order') || 'popularity';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = clampLimit(parseInt(searchParams.get('limit') || '24'));

  const titleLang = searchParams.get('titleLang') || 'jp';

  try {
    const results = await AnimeService.advancedSearch({
      query, genre, genres, genreMode, status, type, letter, year, season, rating, source, studio, studios, order, page, limit, titleLang
    });
    return NextResponse.json({ ...results, items: sanitizeAnimeList(results.items) });
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

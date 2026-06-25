import { NextRequest, NextResponse } from 'next/server';
import { AnimeService } from '@/lib/services/anime';
import { sanitizeGenreList } from '@/lib/sanitize';

export async function GET() {
  try {
    const genres = await AnimeService.getAllGenres();
    return NextResponse.json(sanitizeGenreList(genres));
  } catch (error) {
    console.error('Genres API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch genres' }, { status: 500 });
  }
}

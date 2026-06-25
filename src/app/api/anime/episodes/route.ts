import { NextRequest, NextResponse } from 'next/server';
import { AnimeService } from '@/lib/services/anime';
import { sanitizeEpisodeList } from '@/lib/sanitize';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug') || '';
  
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }
  
  try {
    const anime = await AnimeService.getAnimeBySlug(slug);
    if (!anime) {
      return NextResponse.json({ error: 'Anime not found' }, { status: 404 });
    }
    
    const episodes = await AnimeService.getEpisodes(anime.id);
    const filteredEpisodes = episodes.filter(ep => ep.eps_number !== null && ep.eps_number !== undefined);
    
    return NextResponse.json({ 
      animeId: slug, 
      title: anime.title, 
      titleEnglish: anime.title_english, 
      image: anime.poster,
      episodes: sanitizeEpisodeList(filteredEpisodes)
    });
  } catch (error) {
    console.error('Episodes API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch episodes' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getEpisodeResponse } from '@/lib/scrapers/otakudesu';

const SANKA_EPISODE = 'https://www.sankavollerei.com/anime/episode';

async function fetchSanka(path: string) {
  try {
    const res = await fetch(`${SANKA_EPISODE}/${path}`, {
      next: { revalidate: 3600 },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || (json?.title ? json : null);
  } catch {
    return null;
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 });

  // Validate slug format to prevent SSRF or directory traversal
  const SLUG_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
  if (!SLUG_REGEX.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug format' }, { status: 400 });
  }

  // Try direct scraper first
  const direct = await getEpisodeResponse(slug);
  if (direct) {
    return NextResponse.json(direct, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600' },
    });
  }

  // Fallback to Sanka
  console.warn(`[Episode] Direct failed for ${slug}, falling back to Sanka`);
  const sanka = await fetchSanka(slug);
  if (sanka) {
    return NextResponse.json(sanka, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600' },
    });
  }

  return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
}

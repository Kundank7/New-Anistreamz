import * as cheerio from 'cheerio';

const BASE_URL = 'https://otakudesu.blog';
const AJAX_URL = `${BASE_URL}/wp-admin/admin-ajax.php`;

async function fetchWithRetry(url: string, options?: RequestInit): Promise<string | null> {
  try {
    const res = await fetch(url, {
      ...options,
      next: { revalidate: 3600 },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        ...options?.headers,
      },
    });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

export async function fetchNonce(): Promise<string | null> {
  try {
    const res = await fetch(AJAX_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'action=aa1208d27f29ca340c92c66d1926f13f',
    });
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}

export async function resolveMirrorUrl(postId: number, index: number, quality: string): Promise<string | null> {
  try {
    const nonce = await fetchNonce();
    if (!nonce) return null;

    const res = await fetch(AJAX_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `action=2a3505c93b0035d3f455df82bf976b84&nonce=${nonce}&id=${postId}&i=${index}&q=${quality}`,
    });
    const json = await res.json();
    if (!json?.data) return null;

    const html = Buffer.from(json.data, 'base64').toString('utf-8');
    const $ = cheerio.load(html);
    return $('iframe').attr('src') || null;
  } catch {
    return null;
  }
}

export async function scrapeEpisodePage(slug: string) {
  const html = await fetchWithRetry(`${BASE_URL}/episode/${slug}/`);
  if (!html) return null;

  const $ = cheerio.load(html);
  const title = $('.posttl').text().trim() || slug;

  const canonical = $('link[rel="shortlink"]').attr('href') || '';
  const pMatch = canonical.match(/p=(\d+)/);
  const postId = pMatch ? parseInt(pMatch[1]) : 0;

  const defaultStreamUrl = $('#embed_holder iframe').attr('src') || null;

  const animeLink = $(`.flir a[rel="follow"]`).attr('href') || '';
  const animeId = animeLink.replace(`${BASE_URL}/anime/`, '').replace('/', '') || slug.split('-episode-')[0] || slug;
  const animeImage = $('.cukder img').attr('src') || '';
  const animeTitle = title.replace(/\s+Episode\s+\d+.*$/i, '').trim() || animeId;

  const mirrors: { quality: string; servers: { name: string; postId: number; index: number; quality: string }[] }[] = [];
  $('.mirrorstream ul').each((_, ul) => {
    const $ul = $(ul);
    const cls = $ul.attr('class') || '';
    const quality = cls.replace('m', '').replace('p', '');
    const servers: { name: string; postId: number; index: number; quality: string }[] = [];
    $ul.find('li a').each((_, a) => {
      const $a = $(a);
      const content = $a.attr('data-content') || '';
      try {
        const parsed = JSON.parse(Buffer.from(content, 'base64').toString());
        servers.push({ name: $a.text().trim(), postId: parsed.id, index: parsed.i, quality: parsed.q });
      } catch { /* skip */ }
    });
    if (servers.length) mirrors.push({ quality, servers });
  });

  const downloadLinks: { quality: string; size: string; links: { name: string; url: string }[] }[] = [];
  $('.download ul li').each((_, li) => {
    const $li = $(li);
    const quality = $li.find('strong').text().trim();
    const size = $li.find('i').text().trim();
    const links: { name: string; url: string }[] = [];
    $li.find('a').each((_, a) => {
      links.push({ name: $(a).text().trim(), url: $(a).attr('href') || '' });
    });
    if (quality) downloadLinks.push({ quality, size, links });
  });

  let prevEpisode: { title: string; slug: string } | null = null;
  let nextEpisode: { title: string; slug: string } | null = null;

  const selectOpts: { title: string; value: string }[] = [];
  $('#selectcog option').each((_, opt) => {
    const val = $(opt).attr('value') || '';
    if (val && val !== '0') {
      selectOpts.push({ title: $(opt).text().trim(), value: val });
    }
  });

  if (selectOpts.length > 0) {
    const idx = selectOpts.findIndex(e => e.value.includes(slug));
    if (idx < selectOpts.length - 1) {
      const prev = selectOpts[idx + 1];
      prevEpisode = { title: prev.title, slug: prev.value.replace(`${BASE_URL}/episode/`, '').replace('/', '') };
    }
    if (idx > 0) {
      const next = selectOpts[idx - 1];
      nextEpisode = { title: next.title, slug: next.value.replace(`${BASE_URL}/episode/`, '').replace('/', '') };
    }
  }

  return {
    title,
    animeId,
    animeTitle,
    animeImage,
    postId,
    defaultStreamUrl,
    mirrors,
    downloadLinks,
    prevEpisode,
    nextEpisode,
  };
}

export interface OtakudesuEpisodeResponse {
  title: string;
  animeTitle?: string;
  animeImage?: string;
  animeId?: string;
  defaultStreamingUrl?: string;
  hasPrevEpisode: boolean;
  prevEpisode: { title: string; episodeId: string } | null;
  hasNextEpisode: boolean;
  nextEpisode: { title: string; episodeId: string } | null;
  server: {
    qualities: {
      title: string;
      serverList: { title: string; serverId: string }[];
    }[];
  };
  downloadUrl: {
    qualities: {
      title: string;
      size: string;
      urls: { title: string; url: string }[];
    }[];
  };
}

export async function getEpisodeResponse(slug: string): Promise<OtakudesuEpisodeResponse | null> {
  const data = await scrapeEpisodePage(slug);
  if (!data) return null;

  const qualities = data.mirrors.map(m => ({
    title: `${m.quality}p`,
    serverList: m.servers.map(s => ({
      title: s.name,
      serverId: `otaku-${s.postId}-${s.index}-${s.quality}`,
    })),
  }));

  const dlQualities = data.downloadLinks.map(q => ({
    title: q.quality,
    size: q.size,
    urls: q.links.map(l => ({ title: l.name, url: l.url })),
  }));

  return {
    title: data.title,
    animeTitle: data.animeTitle,
    animeImage: data.animeImage,
    animeId: data.animeId,
    defaultStreamingUrl: data.defaultStreamUrl || undefined,
    hasPrevEpisode: !!data.prevEpisode,
    prevEpisode: data.prevEpisode ? { title: data.prevEpisode.title, episodeId: data.prevEpisode.slug } : null,
    hasNextEpisode: !!data.nextEpisode,
    nextEpisode: data.nextEpisode ? { title: data.nextEpisode.title, episodeId: data.nextEpisode.slug } : null,
    server: { qualities },
    downloadUrl: { qualities: dlQualities },
  };
}

export async function resolveServerUrl(serverId: string): Promise<string | null> {
  const match = serverId.match(/^otaku-(\d+)-(\d+)-(.+)$/);
  if (!match) return null;
  const postId = parseInt(match[1]);
  const index = parseInt(match[2]);
  const quality = match[3];
  return resolveMirrorUrl(postId, index, quality);
}

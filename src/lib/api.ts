export async function getEpisode(slug: string) {
  try {
    const res = await fetch(`/api/episode/${slug}`, { next: { revalidate: 3600 } });
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

export async function getServer(serverId: string) {
  try {
    const res = await fetch(`/api/server?id=${encodeURIComponent(serverId)}`);
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

export const AnimeAPI = {
  getEpisode,
  getServer,
};

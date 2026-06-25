const API = "http://localhost:4000";

export async function getEpisodes(anilistId: number) {
  const res = await fetch(`${API}/episodes/${anilistId}`);
  return res.json();
}

export async function getWatch(
  provider: string,
  anilistId: number,
  audio: string,
  episodeId: string
) {
  const res = await fetch(
    `${API}/watch/${provider}/${anilistId}/${audio}/${episodeId}`
  );

  return res.json();
}
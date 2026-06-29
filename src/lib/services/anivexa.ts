const API = "http://129.80.214.186:4000";

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

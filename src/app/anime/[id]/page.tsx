import { getAnimeById } from "@/lib/services/anilist";
import { getEpisodes } from "@/lib/services/anivexa";
import type { Metadata } from 'next';
import { notFound } from "next/navigation";
import { DesktopAnimeDetail } from "@/components/anime/DesktopAnimeDetail";
import { MobileAnimeDetail } from "@/components/anime/MobileAnimeDetail";
import { parseIndonesianDate, formatDate } from "@/lib/utils";
import { Suspense, cache } from "react";
import { AnimeDetailSkeleton } from "@/components/anime/AnimeDetailSkeleton";

// Use React cache to deduplicate requests within the same render cycle
// (e.g. across generateMetadata and the page component)
const getCachedAnime = cache((id: string) =>
  getAnimeById(id)
);

async function getAnimeDetails(anime: any) {
  if (!anime) return null;

  const episodesResponse = await getEpisodes(anime.id);

const episodes =
  episodesResponse?.reanime?.episodes?.sub ||
  episodesResponse?.allmanga?.episodes?.sub ||
  episodesResponse?.anikoto?.episodes?.sub ||
  [];
 

  return {
    source: "anilist",
    data: {
      ...anime,

      title: anime.title?.romaji || anime.title?.english || "",
      title_english: anime.title?.english || "",

      poster: anime.coverImage?.extraLarge || "",
      banner: anime.bannerImage || anime.coverImage?.extraLarge || "",

      score: anime.averageScore || 0,
      synopsis: anime.description || "",

      episodes_count: anime.episodes || 0,
      actual_episodes_count: anime.episodes || 0,

      year: anime.seasonYear,
      duration_minutes: anime.duration,

      studios:
        anime.studios?.nodes?.map((s: any) => s.name) || [],

      episodeList: Array.isArray(episodes)
  ? episodes.map((ep: any) => ({
      episodeId: ep.id,
      eps: ep.number,
      title: ep.title || `Episode ${ep.number}`,
      date: ep.airDate || ""
    }))
  : []
    }
  };
}

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params;
  const { id } = params;
  
  if (!id || id === 'undefined') {
    notFound();
  }

  const anime = await getCachedAnime(id);
  
  if (!anime) {
    notFound();
  }

  return {
    title: anime.title || 'Anime Details',
    description: `Watch ${anime.title} on Anistreamz`,
  };
}

async function AnimeDetailContent({ id, anime }: { id: string, anime: any }) {
  const result = await getAnimeDetails(anime);

  if (!result || !result.data) {
    notFound();
  }

  const { data } = result;
	const source = 'anilist';
	const similarAnime: any[] = [];

  const poster = data.poster;
  const episodes = data.episodeList || [];
  const genres = data.genres || [];
  const synopsis = data.description || "No synopsis available.";
  const rating = data.averageScore;
  const status = data.status;
  
  // Always use episodes_count from data, defaulting to '??' if null or 0
  const totalEpisodes = data.episodes || '??';
  const numEpisodes = `${totalEpisodes} eps`;
  
  const studios = data.studios?.nodes?.map((s: any) => s.name).join(', ') || 'Unknown';
  const producers = Array.isArray(data.producers) ? data.producers.join(', ') : (data.producers || 'Unknown');
  const aired = data.aired || 'Unknown';
  const animeType = data.type || 'Unknown';
  const animeSource = data.source || 'Unknown';
  const ageRating = data.rating || 'Unknown';
  const duration = data.duration
  ? `${data.duration} min`
  : 'Unknown';
  const season = data.season && data.seasonYear
  ? `${data.season} ${data.seasonYear}`
  : 'Unknown';
  
  const trailerUrl = data.youtube_trailer_id
    ? `https://www.youtube.com/embed/${data.youtube_trailer_id}?autoplay=0`
    : null;

  // Map DB characters to CharacterCarousel expected shape
  const charactersData =
  data.characters?.edges?.map((edge: any, i: number) => ({
    character: {
      mal_id: i,
      name: edge.node?.name?.full,
      images: {
        webp: {
          image_url: edge.node?.image?.large
        }
      }
    },
    role: edge.role,
    voice_actors: edge.voiceActors?.length
      ? [{
          language: 'Japanese',
          person: {
            name: edge.voiceActors[0]?.name?.full,
            images: {
              jpg: {
                image_url: edge.voiceActors[0]?.image?.large
              }
            }
          }
        }]
      : []
  })) || [];

  return (
    <>
      <div className="lg:hidden">
        <MobileAnimeDetail 
          id={id} 
          data={data} 
          source={source} 
          similarAnime={similarAnime} 
          charactersData={charactersData} 
        />
      </div>
      <div className="hidden lg:block">
        <DesktopAnimeDetail 
          id={id} 
          data={data} 
          source={source} 
          similarAnime={similarAnime} 
          charactersData={charactersData} 
        />
      </div>
    </>
  );
}

export default async function AnimeDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  
  if (!id || id === 'undefined') {
    notFound();
  }

  // Fast synchronous check to trigger 404 BEFORE streaming the Suspense boundary.
  // This guarantees that Next.js will return HTTP 404 instead of HTTP 200, crucial for SEO.
  const anime = await getCachedAnime(id);
  if (!anime) {
    notFound();
  }

  return (
    <Suspense fallback={<AnimeDetailSkeleton />}>
      <AnimeDetailContent id={id} anime={anime} />
    </Suspense>
  );
}


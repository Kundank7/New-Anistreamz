const API = "https://graphql.anilist.co";

export async function getHomeData() {
  const query = `
  query {
    trending: Page(page: 1, perPage: 20) {
      media(sort: TRENDING_DESC, type: ANIME) {
        id
        title {
          romaji
          english
        }
        coverImage {
          extraLarge
        }
        bannerImage
        averageScore
        status
        episodes
        genres
        description(asHtml: false)
        studios(isMain: true) {
          nodes {
            name
          }
        }
        nextAiringEpisode {
          episode
          airingAt
        }
      }
    }

    completed: Page(page: 1, perPage: 20) {
      media(
        type: ANIME
        status: FINISHED
        sort: POPULARITY_DESC
      ) {
        id
        title {
          romaji
          english
        }
        coverImage {
          extraLarge
        }
        bannerImage
        averageScore
        episodes
        status
        genres
        description(asHtml: false)
      }
    }

    popular: Page(page: 1, perPage: 20) {
      media(sort: POPULARITY_DESC, type: ANIME) {
        id
        title {
          romaji
          english
        }
        coverImage {
          extraLarge
        }
        bannerImage
        averageScore
        status
        episodes
        genres
        description(asHtml: false)
      }
    }
  }
  `;

  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query }),
    next: { revalidate: 3600 }
  });

  const json = await res.json();

  if (!res.ok || json.errors) {
    throw new Error(
      json.errors?.[0]?.message || "Failed to fetch home data"
    );
  }

  return {
    trending: json?.data?.trending?.media ?? [],
    popular: json?.data?.popular?.media ?? [],
    completed: json?.data?.completed?.media ?? []
  };
}

export async function getTodaySchedule() {
  const now = Math.floor(Date.now() / 1000);
  const tomorrow = now + 86400;

  const query = `
  query {
    Page(page: 1, perPage: 50) {
      airingSchedules(
        airingAt_greater: ${now}
        airingAt_lesser: ${tomorrow}
        sort: TIME
      ) {
        episode
        airingAt
        media {
          id
          title {
            romaji
            english
          }
          coverImage {
            extraLarge
          }
        }
      }
    }
  }
  `;

  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query }),
    next: { revalidate: 1800 }
  });

  const json = await res.json();

  if (!res.ok || json.errors) {
    throw new Error(
      json.errors?.[0]?.message || "Failed to fetch airing schedule"
    );
  }

  return json?.data?.Page?.airingSchedules ?? [];
}

export async function getAnimeById(id: string) {
  const query = `
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      id

      title {
        romaji
        english
        native
      }

      description(asHtml: false)

      coverImage {
        extraLarge
      }

      bannerImage

      averageScore

      episodes

      status

      genres

      season

      seasonYear

      duration

      source

      studios(isMain: true) {
        nodes {
          name
        }
      }

      nextAiringEpisode {
        episode
        airingAt
      }

      characters(perPage: 20) {
        edges {
          role

          node {
            name {
              full
            }

            image {
              large
            }
          }

          voiceActors(language: JAPANESE) {
            name {
              full
            }

            image {
              large
            }
          }
        }
      }
    }
  }
  `;

  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query,
      variables: {
        id: Number(id)
      }
    }),
    next: {
      revalidate: 3600
    }
  });

  const json = await res.json();

  if (!res.ok || json.errors) {
    throw new Error(
      json.errors?.[0]?.message || "Failed to fetch anime details"
    );
  }

  return json?.data?.Media ?? null;
}

export async function getAnimeByLetter(
  letter: string,
  page = 1,
  perPage = 24
) {
  const query = `
  query ($page:Int,$perPage:Int){
    Page(page:$page, perPage:$perPage){
      pageInfo{
        currentPage
        lastPage
        total
      }

      media(
        type:ANIME
        sort:POPULARITY_DESC
      ){
        id

        title{
          romaji
          english
        }

        coverImage{
          extraLarge
        }

        averageScore

        status

        episodes
      }
    }
  }
  `;

  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      "Content-Type":"application/json"
    },
    body: JSON.stringify({
      query,
      variables:{
        page,
        perPage
      }
    }),
    next:{
      revalidate:3600
    }
  });

  const json=await res.json();

  let media=json.data.Page.media;

  if(letter!=="ALL"){
    media=media.filter((a:any)=>{
      const title=(a.title.english||a.title.romaji||"").toUpperCase();

      if(letter==="0-9"){
        return /^[0-9]/.test(title);
      }

      if(letter==="#"){
        return /^[^A-Z0-9]/.test(title);
      }

      return title.startsWith(letter);
    });
  }

   return {
  items: media,
  pagination: {
    current_page: json.data.Page.pageInfo.currentPage,
    last_page: json.data.Page.pageInfo.lastPage,
    total: media.length
  }
};
}
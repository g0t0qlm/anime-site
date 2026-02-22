// src/lib/api/anilist.ts

const ANILIST_URL = 'https://graphql.anilist.co';

const ANIME_QUERY = `
  query ($id: Int, $search: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(id: $id, search: $search, type: ANIME, sort: TRENDING_DESC) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        description(asHtml: false)
        coverImage {
          extraLarge
          large
          color
        }
        bannerImage
        episodes
        status
        genres
        averageScore
        season
        seasonYear
        studios(isMain: true) {
          nodes { name }
        }
        nextAiringEpisode {
          timeUntilAiring
          episode
        }
        trailer {
          id
          site
        }
        tags {
          name
          rank
        }
      }
    }
  }
`;

const TRENDING_QUERY = `
  query ($page: Int, $perPage: Int, $season: MediaSeason, $year: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, sort: TRENDING_DESC, season: $season, seasonYear: $year) {
        id
        idMal
        title { romaji english }
        coverImage { extraLarge color }
        bannerImage
        episodes
        status
        genres
        averageScore
        seasonYear
      }
    }
  }
`;

async function anilistRequest(query: string, variables: Record<string, any>) {
  const response = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 3600 }, // Кэш на 1 час
  });
  const { data, errors } = await response.json();
  if (errors) throw new Error(errors[0].message);
  return data;
}

export async function searchAniList(search: string, page = 1, perPage = 20) {
  const data = await anilistRequest(ANIME_QUERY, { search, page, perPage });
  return data.Page.media;
}

export async function getAniListById(id: number) {
  const data = await anilistRequest(ANIME_QUERY, { id, page: 1, perPage: 1 });
  return data.Page.media[0];
}

export async function getTrendingAniList(page = 1, perPage = 20) {
  const now = new Date();
  const seasons = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];
  const season = seasons[Math.floor((now.getMonth() / 12) * 4)];
  
  const data = await anilistRequest(TRENDING_QUERY, {
    page,
    perPage,
    season,
    year: now.getFullYear(),
  });
  return data.Page.media;
}
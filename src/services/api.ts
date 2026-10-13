import {
  MediaItem,
  Episode,
  Season,
  FilterOptions,
  PlaybackSource,
  MoviesApiResponse,
  MoviesApiRawItem,
} from '../types';
import { FALLBACK_CATALOG } from '../lib/catalogData';

export const GENRES = [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'History',
  'Horror',
  'Music',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Thriller',
  'War',
  'Western',
];

const MOVIES_API_BASE = 'https://moviesapi.to/api';
const MOVIES_API_PROXY = '/api/moviesapi';
const CINEMETA_BASE = 'https://v3-cinemeta.strem.io';
const BRAND_THEME_HEX = '800000'; // Juan4All maroon accent

class ApiService {
  // Helper to fetch from MoviesAPI with fallback to proxy
  private async fetchMoviesApi<T = MoviesApiRawItem[]>(endpoint: string, params: Record<string, string | number | boolean | undefined> = {}): Promise<MoviesApiResponse<T>> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== '') {
        query.set(key, String(val));
      }
    });

    const queryString = query.toString() ? `?${query.toString()}` : '';

    // Try direct fetch first
    try {
      const directUrl = `${MOVIES_API_BASE}${endpoint}${queryString}`;
      const res = await fetch(directUrl);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Direct fetch may fail due to browser extensions or adblockers, fall back to local proxy
    }

    // Proxy fallback
    try {
      const proxyUrl = `${MOVIES_API_PROXY}${endpoint}${queryString}`;
      const res = await fetch(proxyUrl);
      if (res.ok) {
        return await res.json();
      }
      throw new Error(`MoviesAPI request failed with status ${res.status}`);
    } catch (err) {
      console.error(`Failed to fetch from MoviesAPI (${endpoint})`, err);
      throw err;
    }
  }

  // Construct real playback sources using MoviesAPI Embed documentation
  private buildPlaybackSources(
    id: string | number,
    type: 'movie' | 'series',
    seasonNumber = 1,
    episodeNumber = 1
  ): PlaybackSource[] {
    const cleanId = String(id);
    if (type === 'movie') {
      return [
        {
          id: 'moviesapi-embed-primary',
          name: 'Server 1 (Standard Player)',
          type: 'embed',
          url: `https://moviesapi.to/movie/${cleanId}?theme=${BRAND_THEME_HEX}`,
          quality: '1080p',
          isAuthorized: true,
        },
        {
          id: 'moviesapi-embed-mirror',
          name: 'Server 2 (Alternative Mirror)',
          type: 'embed',
          url: `https://moviesapi.to/movie/${cleanId}?theme=${BRAND_THEME_HEX}&server=mirror`,
          quality: 'Auto',
          isAuthorized: true,
        },
      ];
    } else {
      return [
        {
          id: `moviesapi-tv-${cleanId}-s${seasonNumber}-e${episodeNumber}`,
          name: 'Server 1 (MoviesAPI Standard Player)',
          type: 'embed',
          url: `https://moviesapi.to/tv/${cleanId}/${seasonNumber}/${episodeNumber}?theme=${BRAND_THEME_HEX}`,
          quality: '1080p',
          isAuthorized: true,
        },
        {
          id: `moviesapi-tv-hyphen-${cleanId}-s${seasonNumber}-e${episodeNumber}`,
          name: 'Server 2 (MoviesAPI Hyphen Stream)',
          type: 'embed',
          url: `https://moviesapi.to/tv/${cleanId}-${seasonNumber}-${episodeNumber}?theme=${BRAND_THEME_HEX}`,
          quality: 'Auto',
          isAuthorized: true,
        },
      ];
    }
  }

  // Map MoviesAPI Raw item into normalized MediaItem
  private mapRawToMediaItem(raw: MoviesApiRawItem, enrichMeta?: any): MediaItem {
    const imdbId = raw.imdb_id || raw.imdbid || enrichMeta?.imdb_id;
    const tmdbId = raw.tmdbid || enrichMeta?.moviedb_id;
    const id = imdbId || (tmdbId ? String(tmdbId) : String(Math.random()));
    const title = enrichMeta?.name || raw.orig_title || raw.title || 'Untitled';
    const isSeries = raw.type === 'tv' || enrichMeta?.type === 'series';
    const type: 'movie' | 'series' = isSeries ? 'series' : 'movie';
    const releaseYear = raw.year || (enrichMeta?.year ? parseInt(enrichMeta.year, 10) : 2024);

    // High quality poster and backdrop
    const posterUrl =
      enrichMeta?.poster ||
      (imdbId ? `https://images.metahub.space/poster/medium/${imdbId}/img` : '');

    const backdropUrl =
      enrichMeta?.background ||
      (imdbId ? `https://images.metahub.space/background/medium/${imdbId}/img` : posterUrl);

    // Build playback sources using MoviesAPI Embed
    const playbackId = tmdbId || imdbId || id;
    const playbackSources = this.buildPlaybackSources(playbackId, type);

    const ratingVal = enrichMeta?.imdbRating
      ? parseFloat(enrichMeta.imdbRating)
      : 7.8;

    return {
      id,
      imdbId,
      tmdbId,
      title,
      type,
      overview: enrichMeta?.description || '',
      posterUrl,
      backdropUrl,
      releaseYear,
      rating: isNaN(ratingVal) ? 7.5 : ratingVal,
      genres: enrichMeta?.genre || enrichMeta?.genres || ['Featured'],
      quality: raw.quality || raw.Quality || 'HD',
      runtime: enrichMeta?.runtime ? parseInt(enrichMeta.runtime, 10) : undefined,
      cast: enrichMeta?.cast?.map((name: string) => ({ name, character: 'Actor' })) || [],
      director: enrichMeta?.director?.[0] || undefined,
      tagline: enrichMeta?.awards || undefined,
      featured: raw.featured || raw.slider || false,
      playbackSources,
    };
  }

  // Enrich items with Cinemeta metadata in parallel batches
  private async enrichItems(rawItems: MoviesApiRawItem[]): Promise<MediaItem[]> {
    if (!rawItems || rawItems.length === 0) return [];

    const enriched = await Promise.all(
      rawItems.map(async (raw) => {
        const imdbId = raw.imdb_id || raw.imdbid;
        if (!imdbId) return this.mapRawToMediaItem(raw);

        try {
          const type = raw.type === 'tv' ? 'series' : 'movie';
          const metaRes = await fetch(`${CINEMETA_BASE}/meta/${type}/${imdbId}.json`);
          if (metaRes.ok) {
            const data = await metaRes.json();
            if (data?.meta) {
              return this.mapRawToMediaItem(raw, data.meta);
            }
          }
        } catch {
          // If metadata enrichment fails, still return valid MediaItem from MoviesAPI raw data
        }
        return this.mapRawToMediaItem(raw);
      })
    );

    return enriched;
  }

  // 1. Get Featured Content (Hero banner)
  async getFeatured(): Promise<MediaItem[]> {
    try {
      // Request slider content from MoviesAPI discover
      const res = await this.fetchMoviesApi<MoviesApiRawItem[]>('/discover/movies', {
        slider: true,
        resultsPerPage: 6,
      });

      if (res.data && res.data.length > 0) {
        const enriched = await this.enrichItems(res.data.slice(0, 5));
        if (enriched.length > 0) return enriched;
      }
    } catch (err) {
      console.warn('MoviesAPI slider failed, trying trending views for featured', err);
    }

    try {
      // Fallback to top weekly views
      const viewsRes = await this.fetchMoviesApi<MoviesApiRawItem[]>('/discover/views', {
        type: 'movie',
        views: 'week',
        resultsPerPage: 5,
      });
      const enriched = await this.enrichItems(viewsRes.data?.slice(0, 5) || []);
      if (enriched.length > 0) return enriched;
    } catch {}

    // Verified catalog fallback
    return FALLBACK_CATALOG.filter((i) => i.featured).slice(0, 5);
  }

  // 2. Get Trending Titles
  async getTrending(type: 'all' | 'movie' | 'series' = 'all'): Promise<MediaItem[]> {
    try {
      if (type === 'all') {
        const [moviesRes, tvRes] = await Promise.allSettled([
          this.fetchMoviesApi<MoviesApiRawItem[]>('/discover/views', {
            type: 'movie',
            views: 'week',
            resultsPerPage: 10,
          }),
          this.fetchMoviesApi<MoviesApiRawItem[]>('/discover/views', {
            type: 'tv',
            views: 'week',
            resultsPerPage: 10,
          }),
        ]);

        const moviesData = moviesRes.status === 'fulfilled' ? moviesRes.value.data : [];
        const tvData = tvRes.status === 'fulfilled' ? tvRes.value.data : [];

        const combined: MoviesApiRawItem[] = [];
        const maxLen = Math.max(moviesData.length, tvData.length);
        for (let i = 0; i < maxLen; i++) {
          if (moviesData[i]) combined.push(moviesData[i]);
          if (tvData[i]) combined.push(tvData[i]);
        }

        const items = await this.enrichItems(combined.slice(0, 16));
        if (items.length > 0) {
          return items.map((item, idx) => ({ ...item, trendingRank: idx + 1 }));
        }
      } else {
        const contentType = type === 'series' ? 'tv' : 'movie';
        const res = await this.fetchMoviesApi<MoviesApiRawItem[]>('/discover/views', {
          type: contentType,
          views: 'week',
          resultsPerPage: 16,
        });

        const items = await this.enrichItems(res.data || []);
        if (items.length > 0) {
          return items.map((item, idx) => ({ ...item, trendingRank: idx + 1 }));
        }
      }
    } catch (err) {
      console.warn('MoviesAPI trending fetch failed, using catalog fallback', err);
    }

    const filtered =
      type === 'all'
        ? FALLBACK_CATALOG
        : FALLBACK_CATALOG.filter((i) => i.type === type);
    return filtered.map((item, idx) => ({ ...item, trendingRank: idx + 1 }));
  }

  // 3. Get Movies Catalog
  async getMovies(options?: FilterOptions): Promise<{
    items: MediaItem[];
    total: number;
    currentPage: number;
    lastPage: number;
  }> {
    const page = options?.page || 1;
    const resultsPerPage = options?.perPage || 20;

    let ordering: string = 'views';
    let direction: 'asc' | 'desc' = 'desc';

    if (options?.sortBy === 'year') {
      ordering = 'year';
    } else if (options?.sortBy === 'title') {
      ordering = 'title';
      direction = 'asc';
    } else if (options?.sortBy === 'views_day') {
      ordering = 'views_day';
    } else if (options?.sortBy === 'views_week') {
      ordering = 'views_week';
    }

    try {
      const res = await this.fetchMoviesApi<MoviesApiRawItem[]>('/discover/movies', {
        page,
        resultsPerPage,
        ordering,
        direction,
        query: options?.search && options.search.length >= 3 ? options.search : undefined,
        year: options?.year,
      });

      let items = await this.enrichItems(res.data || []);

      if (options?.genre && options.genre !== 'All') {
        items = items.filter((item) =>
          item.genres.some((g) => g.toLowerCase() === options.genre!.toLowerCase())
        );
      }

      if (items.length > 0) {
        return {
          items,
          total: res.total || items.length,
          currentPage: res.current_page || page,
          lastPage: res.last_page || 1,
        };
      }
    } catch (err) {
      console.warn('MoviesAPI getMovies failed, using fallback catalog', err);
    }

    let fallbackItems = FALLBACK_CATALOG.filter((i) => i.type === 'movie');
    if (options?.genre && options.genre !== 'All') {
      fallbackItems = fallbackItems.filter((i) =>
        i.genres.some((g) => g.toLowerCase() === options.genre!.toLowerCase())
      );
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      fallbackItems = fallbackItems.filter((i) => i.title.toLowerCase().includes(q));
    }
    return {
      items: fallbackItems,
      total: fallbackItems.length,
      currentPage: 1,
      lastPage: 1,
    };
  }

  // 4. Get TV Series Catalog
  async getSeries(options?: FilterOptions): Promise<{
    items: MediaItem[];
    total: number;
    currentPage: number;
    lastPage: number;
  }> {
    const page = options?.page || 1;
    const resultsPerPage = options?.perPage || 20;

    let ordering: string = 'views';
    const direction: 'asc' | 'desc' = 'desc';

    if (options?.sortBy === 'year' || options?.sortBy === 'views_week') {
      ordering = 'views_week';
    }

    try {
      const res = await this.fetchMoviesApi<MoviesApiRawItem[]>('/discover/tv', {
        page,
        resultsPerPage,
        ordering,
        direction,
        query: options?.search && options.search.length >= 3 ? options.search : undefined,
      });

      let items = await this.enrichItems(res.data || []);

      if (options?.genre && options.genre !== 'All') {
        items = items.filter((item) =>
          item.genres.some((g) => g.toLowerCase() === options.genre!.toLowerCase())
        );
      }

      if (items.length > 0) {
        return {
          items,
          total: res.total || items.length,
          currentPage: res.current_page || page,
          lastPage: res.last_page || 1,
        };
      }
    } catch (err) {
      console.warn('MoviesAPI getSeries failed, using fallback catalog', err);
    }

    let fallbackItems = FALLBACK_CATALOG.filter((i) => i.type === 'series');
    if (options?.genre && options.genre !== 'All') {
      fallbackItems = fallbackItems.filter((i) =>
        i.genres.some((g) => g.toLowerCase() === options.genre!.toLowerCase())
      );
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      fallbackItems = fallbackItems.filter((i) => i.title.toLowerCase().includes(q));
    }
    return {
      items: fallbackItems,
      total: fallbackItems.length,
      currentPage: 1,
      lastPage: 1,
    };
  }

  // 5. Get Top Rated (using total views on MoviesAPI)
  async getTopRated(type: 'all' | 'movie' | 'series' = 'all'): Promise<MediaItem[]> {
    const contentType = type === 'series' ? 'tv' : 'movie';
    const res = await this.fetchMoviesApi<MoviesApiRawItem[]>('/discover/views', {
      type: contentType,
      views: 'total',
      page: 1,
      resultsPerPage: 16,
    });

    return this.enrichItems(res.data || []);
  }

  // 6. Get Titles by Genre
  async getByGenre(genre: string, type: 'all' | 'movie' | 'series' = 'all'): Promise<MediaItem[]> {
    try {
      const contentType = type === 'series' ? 'series' : 'movie';
      const cinemetaUrl = `${CINEMETA_BASE}/catalog/${contentType}/top/genre=${encodeURIComponent(genre)}.json`;
      const res = await fetch(cinemetaUrl);
      if (res.ok) {
        const json = await res.json();
        if (json?.metas && json.metas.length > 0) {
          return json.metas.slice(0, 16).map((m: any) => {
            const imdbId = m.imdb_id || m.id;
            const tmdbId = m.moviedb_id;
            const playbackId = tmdbId || imdbId;
            const isSeries = m.type === 'series';
            const mediaType: 'movie' | 'series' = isSeries ? 'series' : 'movie';

            return {
              id: imdbId,
              imdbId,
              tmdbId,
              title: m.name,
              type: mediaType,
              overview: m.description || '',
              posterUrl: m.poster || `https://images.metahub.space/poster/medium/${imdbId}/img`,
              backdropUrl: m.background || `https://images.metahub.space/background/medium/${imdbId}/img`,
              releaseYear: m.year ? parseInt(m.year, 10) : (m.releaseInfo ? parseInt(m.releaseInfo, 10) : 2024),
              rating: m.imdbRating ? parseFloat(m.imdbRating) : 8.0,
              genres: m.genres || m.genre || [genre],
              runtime: m.runtime ? parseInt(m.runtime, 10) : undefined,
              playbackSources: this.buildPlaybackSources(playbackId, mediaType),
            };
          });
        }
      }
    } catch (err) {
      console.warn(`Genre fetch failed for ${genre}`, err);
    }

    // Fallback: fetch from MoviesAPI discover and filter
    const moviesRes = await this.fetchMoviesApi<MoviesApiRawItem[]>('/discover/movies', {
      resultsPerPage: 30,
    });
    const enriched = await this.enrichItems(moviesRes.data || []);
    return enriched
      .filter((item) => item.genres.some((g) => g.toLowerCase() === genre.toLowerCase()))
      .slice(0, 16);
  }

  // 7. Get Media Details by ID (IMDb ID or TMDB ID)
  async getMediaById(id: string, preferredType?: 'movie' | 'series'): Promise<MediaItem | null> {
    if (!id) return null;

   const isImdb = id.startsWith('tt');
const lookupId = id;

    // If preferredType is series, or if looking up a series, try series first
    const typesToTry: ('series' | 'movie')[] =
      preferredType === 'series' ? ['series', 'movie'] : ['movie', 'series'];

    for (const t of typesToTry) {
      try {
        const res = await fetch(`${CINEMETA_BASE}/meta/${t}/${lookupId}.json`);
        if (res.ok) {
          const json = await res.json();
          // If we tried movie first but it looks like a series (releaseInfo has dash or no poster or we have series to try), check if series endpoint has videos
          if (t === 'movie' && (!json?.meta?.poster || json?.meta?.releaseInfo?.includes('–') || json?.meta?.releaseInfo?.includes('-'))) {
            // Check series endpoint first
            try {
              const seriesRes = await fetch(`${CINEMETA_BASE}/meta/series/${lookupId}.json`);
              if (seriesRes.ok) {
                const seriesJson = await seriesRes.json();
                if (seriesJson?.meta?.videos?.length) {
                  json.meta = seriesJson.meta;
                }
              }
            } catch {}
          }

          if (json?.meta) {
            const meta = json.meta;
            const imdbId = meta.imdb_id || id;
            const tmdbId = meta.moviedb_id;
            const playbackId = tmdbId || imdbId;
            const mediaType: 'movie' | 'series' =
              meta.type === 'series' || (meta.videos && meta.videos.length > 0)
                ? 'series'
                : 'movie';

            // Parse seasons and episodes for TV series
            let seasons: Season[] | undefined = undefined;
            if (meta.videos && Array.isArray(meta.videos) && meta.videos.length > 0) {
              const seasonMap: Record<number, Episode[]> = {};

              meta.videos.forEach((v: any) => {
                const sNum = v.season !== undefined ? v.season : 1;
                // Exclude season 0 (specials/interviews) if standard season 1+ exist
                if (sNum === 0 && meta.videos.length > 5) return;

                const eNum = v.number || v.episode || 1;
                const ep: Episode = {
                  seasonNumber: sNum,
                  episodeNumber: eNum,
                  title: v.name || v.title || `Episode ${eNum}`,
                  overview: v.overview || v.description || '',
                  airDate: v.firstAired || v.released ? String(v.firstAired || v.released).split('T')[0] : undefined,
                  stillUrl: v.thumbnail || `https://images.metahub.space/background/medium/${imdbId}/img`,
                  runtime: v.runtime ? parseInt(v.runtime, 10) : undefined,
                  playbackSources: this.buildPlaybackSources(playbackId, 'series', sNum, eNum),
                };

                if (!seasonMap[sNum]) seasonMap[sNum] = [];
                seasonMap[sNum].push(ep);
              });

              seasons = Object.entries(seasonMap).map(([sNumStr, episodes]) => ({
                seasonNumber: parseInt(sNumStr, 10),
                title: `Season ${sNumStr}`,
                episodesCount: episodes.length,
                episodes: episodes.sort((a, b) => a.episodeNumber - b.episodeNumber),
              })).sort((a, b) => a.seasonNumber - b.seasonNumber);
            }

            return {
              id: imdbId,
              imdbId,
              tmdbId,
              title: meta.name || 'Untitled',
              type: mediaType,
              overview: meta.description || '',
              posterUrl: meta.poster || `https://images.metahub.space/poster/medium/${imdbId}/img`,
              backdropUrl: meta.background || `https://images.metahub.space/background/medium/${imdbId}/img`,
              releaseYear: meta.year ? parseInt(meta.year, 10) : (meta.releaseInfo ? parseInt(meta.releaseInfo, 10) : 2024),
              rating: meta.imdbRating ? parseFloat(meta.imdbRating) : 8.0,
              genres: meta.genre || meta.genres || ['Entertainment'],
              runtime: meta.runtime ? parseInt(meta.runtime, 10) : undefined,
              seasonsCount: seasons ? seasons.length : undefined,
              episodesCount: seasons ? seasons.reduce((acc, s) => acc + s.episodesCount, 0) : undefined,
              cast: meta.cast?.map((name: string) => ({ name, character: 'Actor' })) || [],
              director: meta.director?.[0] || undefined,
              tagline: meta.awards || undefined,
              seasons,
              playbackSources: this.buildPlaybackSources(playbackId, mediaType),
            };
          }
        }
      } catch {}
    }

    // 2. If Cinemeta direct lookup didn't succeed, search MoviesAPI
    try {
      const searchRes = await this.fetchMoviesApi<MoviesApiRawItem[]>('/discover/movies', {
        imdb_id: isImdb ? id : undefined,
        tmdbid: !isImdb ? id : undefined,
      });

      if (searchRes.data && searchRes.data.length > 0) {
        const raw = searchRes.data[0];
        return this.mapRawToMediaItem(raw);
      }
    } catch {}

    const matched = FALLBACK_CATALOG.find(
      (item) => item.id === id || String(item.tmdbId) === id || item.imdbId === id
    );
    if (matched) return matched;

    // Return minimal working media item with MoviesAPI embed rather than failing
    return {
      id,
      imdbId: isImdb ? id : undefined,
      tmdbId: !isImdb ? id : undefined,
      title: 'Streaming Title',
      type: preferredType || 'movie',
      overview: 'Watch now on Juan4All via authorized MoviesAPI stream.',
      posterUrl: isImdb ? `https://images.metahub.space/poster/medium/${id}/img` : '',
      backdropUrl: isImdb ? `https://images.metahub.space/background/medium/${id}/img` : '',
      releaseYear: 2024,
      rating: 8.0,
      genres: ['Cinema'],
      playbackSources: this.buildPlaybackSources(id, preferredType || 'movie'),
    };
  }

  // 8. Get TV Episode Details
  async getEpisode(
    seriesId: string,
    seasonNumber: number,
    episodeNumber: number
  ): Promise<{ series: MediaItem; episode: Episode } | null> {
    const series = await this.getMediaById(seriesId);
    if (!series) return null;

    // Find in series seasons
    const season = series.seasons?.find((s) => s.seasonNumber === seasonNumber);
    const existingEp = season?.episodes.find((e) => e.episodeNumber === episodeNumber);

    const playbackId = series.tmdbId || series.imdbId || seriesId;
    const playbackSources = this.buildPlaybackSources(playbackId, 'series', seasonNumber, episodeNumber);

    const episode: Episode = existingEp || {
      seasonNumber,
      episodeNumber,
      title: `Season ${seasonNumber}, Episode ${episodeNumber}`,
      overview: `Streaming episode ${episodeNumber} of ${series.title}.`,
      stillUrl: series.backdropUrl,
      playbackSources,
    };

    return { series, episode };
  }

  // 9. Search Catalog across Movies and TV
  async search(query: string, type: 'all' | 'movie' | 'series' = 'all'): Promise<MediaItem[]> {
    const clean = query.trim();
    if (!clean) return [];

    try {
      if (type === 'movie') {
        const res = await this.fetchMoviesApi<MoviesApiRawItem[]>('/discover/movies', {
          query: clean,
          resultsPerPage: 24,
        });
        return this.enrichItems(res.data || []);
      } else if (type === 'series') {
        const res = await this.fetchMoviesApi<MoviesApiRawItem[]>('/discover/tv', {
          query: clean,
          resultsPerPage: 24,
        });
        return this.enrichItems(res.data || []);
      } else {
        const [moviesRes, tvRes] = await Promise.allSettled([
          this.fetchMoviesApi<MoviesApiRawItem[]>('/discover/movies', {
            query: clean,
            resultsPerPage: 15,
          }),
          this.fetchMoviesApi<MoviesApiRawItem[]>('/discover/tv', {
            query: clean,
            resultsPerPage: 15,
          }),
        ]);

        const moviesData = moviesRes.status === 'fulfilled' ? moviesRes.value.data : [];
        const tvData = tvRes.status === 'fulfilled' ? tvRes.value.data : [];

        const combined = [...moviesData, ...tvData];
        return this.enrichItems(combined);
      }
    } catch (err) {
      console.error('MoviesAPI search failed', err);
      return [];
    }
  }

  // 10. Get Similar Titles
  async getSimilar(currentId: string, genres: string[] = []): Promise<MediaItem[]> {
    const primaryGenre = genres[0] || 'Action';
    const genreItems = await this.getByGenre(primaryGenre);
    return genreItems.filter((i) => i.id !== currentId).slice(0, 8);
  }

  // 11. Get Genres
  getGenres(): string[] {
    return GENRES;
  }
}

export const api = new ApiService();

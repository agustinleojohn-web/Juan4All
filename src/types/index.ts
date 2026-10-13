export type MediaType = 'movie' | 'series';

export interface PlaybackSource {
  id: string;
  name: string;
  type: 'embed' | 'mp4' | 'hls' | 'archive';
  url: string;
  quality: '1080p' | '720p' | 'Auto';
  isAuthorized: boolean;
  subtitles?: { label: string; src: string; lang: string }[];
}

export interface CastMember {
  name: string;
  character: string;
  avatarUrl?: string;
}

export interface Episode {
  episodeNumber: number;
  seasonNumber: number;
  title: string;
  overview: string;
  runtime?: number;
  stillUrl?: string;
  airDate?: string;
  playbackSources?: PlaybackSource[];
}

export interface Season {
  seasonNumber: number;
  title: string;
  episodesCount: number;
  episodes: Episode[];
}

export interface MediaItem {
  id: string;
  tmdbId?: string | number;
  imdbId?: string;
  title: string;
  originalTitle?: string;
  type: MediaType;
  overview: string;
  posterUrl: string;
  backdropUrl: string;
  releaseYear: number;
  releaseDate?: string;
  rating: number; // e.g. 8.6
  ratingSource?: string;
  voteCount?: number;
  genres: string[];
  quality?: string;
  runtime?: number; // minutes for movie
  seasonsCount?: number; // for series
  episodesCount?: number; // for series
  status?: string;
  tagline?: string;
  cast?: CastMember[];
  director?: string;
  creator?: string;
  trailerUrl?: string;
  featured?: boolean;
  trendingRank?: number;
  seasons?: Season[];
  playbackSources: PlaybackSource[];
}

export interface WatchHistoryItem {
  mediaId: string;
  title: string;
  type: MediaType;
  posterUrl: string;
  backdropUrl: string;
  progressSeconds: number;
  durationSeconds: number;
  watchedAt: number; // timestamp
  seasonNumber?: number;
  episodeNumber?: number;
  episodeTitle?: string;
}

export interface FilterOptions {
  genre?: string;
  type?: MediaType | 'all';
  sortBy?: 'popular' | 'rating' | 'year' | 'title' | 'views' | 'views_day' | 'views_week' | 'views_month';
  search?: string;
  year?: number;
  page?: number;
  perPage?: number;
  viewsPeriod?: 'day' | 'week' | 'month' | 'total';
}

// MoviesAPI Raw Payloads
export interface MoviesApiRawItem {
  orig_title?: string;
  title?: string;
  imdb_id?: string;
  imdbid?: string;
  tmdbid?: string;
  year?: number;
  quality?: string;
  Quality?: string;
  type?: 'movie' | 'tv';
  featured?: boolean;
  slider?: boolean;
  update?: boolean;
  credits?: string | null;
  last_update?: string;
}

export interface MoviesApiResponse<T = MoviesApiRawItem[]> {
  result: boolean;
  data: T;
  current_page: number;
  from: number;
  to: number;
  total: number;
  total_count: number;
  last_page: number;
  per_page: number;
  views_mode?: string;
}

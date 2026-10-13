import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { FilterOptions } from '../types';

export const useFeatured = () => {
  return useQuery({
    queryKey: ['featured'],
    queryFn: () => api.getFeatured(),
    staleTime: 1000 * 60 * 10,
  });
};

export const useTrending = (type: 'all' | 'movie' | 'series' = 'all') => {
  return useQuery({
    queryKey: ['trending', type],
    queryFn: () => api.getTrending(type),
    staleTime: 1000 * 60 * 5,
  });
};

export const useMovies = (options?: FilterOptions) => {
  return useQuery({
    queryKey: ['movies', options],
    queryFn: () => api.getMovies(options),
    staleTime: 1000 * 60 * 5,
  });
};

export const useSeries = (options?: FilterOptions) => {
  return useQuery({
    queryKey: ['series', options],
    queryFn: () => api.getSeries(options),
    staleTime: 1000 * 60 * 5,
  });
};

export const useTopRated = (type: 'all' | 'movie' | 'series' = 'all') => {
  return useQuery({
    queryKey: ['top-rated', type],
    queryFn: () => api.getTopRated(type),
    staleTime: 1000 * 60 * 10,
  });
};

export const useGenreRow = (genre: string, type: 'all' | 'movie' | 'series' = 'all') => {
  return useQuery({
    queryKey: ['genre-row', genre, type],
    queryFn: () => api.getByGenre(genre, type),
    staleTime: 1000 * 60 * 10,
  });
};

export const useMediaDetails = (id?: string, type?: 'movie' | 'series') => {
  return useQuery({
    queryKey: ['media-details', id, type],
    queryFn: () => (id ? api.getMediaById(id, type) : null),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 10,
  });
};

export const useEpisodeDetails = (
  seriesId?: string,
  seasonNumber?: number,
  episodeNumber?: number
) => {
  return useQuery({
    queryKey: ['episode-details', seriesId, seasonNumber, episodeNumber],
    queryFn: () =>
      seriesId && seasonNumber !== undefined && episodeNumber !== undefined
        ? api.getEpisode(seriesId, seasonNumber, episodeNumber)
        : null,
    enabled: Boolean(seriesId && seasonNumber !== undefined && episodeNumber !== undefined),
    staleTime: 1000 * 60 * 10,
  });
};

export const useSearch = (query: string, type: 'all' | 'movie' | 'series' = 'all') => {
  return useQuery({
    queryKey: ['search', query, type],
    queryFn: () => api.search(query, type),
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60 * 2,
  });
};

export const useSimilarMedia = (id?: string, genres: string[] = []) => {
  return useQuery({
    queryKey: ['similar-media', id, genres],
    queryFn: () => (id ? api.getSimilar(id, genres) : []),
    enabled: Boolean(id && genres.length > 0),
    staleTime: 1000 * 60 * 10,
  });
};

export const useGenres = () => {
  return useQuery({
    queryKey: ['genres-list'],
    queryFn: () => api.getGenres(),
    staleTime: 1000 * 60 * 60,
  });
};

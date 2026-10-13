import React, { useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Plus, Check, Star, ArrowLeft, Clock, Calendar, Film } from 'lucide-react';
import { useMediaDetails, useSimilarMedia } from '../hooks/useCatalog';
import { useWatchlist } from '../../src/hooks/useWatchlist';
import { VideoPlayer } from '../components/player/VideoPlayer';
import { MovieRow } from '../components/carousel/MovieRow';

export const MovieDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const playerRef = useRef<HTMLDivElement>(null);

  const { data: movie, isLoading, isError } = useMediaDetails(id, 'movie');
  const { data: similarMovies } = useSimilarMedia(id, movie?.genres);
  const { isSaved, toggle } = useWatchlist();

  const saved = movie ? isSaved(movie.id) : false;

  const scrollToPlayer = () => {
    playerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 pt-24 animate-pulse">
        <div className="h-8 w-40 bg-[#181818] rounded-lg mb-6" />
        <div className="w-full aspect-video bg-[#181818] rounded-lg mb-8" />
        <div className="h-10 w-96 bg-[#181818] rounded-lg mb-4" />
        <div className="h-24 w-full bg-[#181818] rounded-lg" />
      </div>
    );
  }

  if (isError || !movie) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <Film className="w-16 h-16 text-[#800000] mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Movie Not Found</h1>
        <p className="text-sm text-[#B3B3B3] mb-6">
          The requested movie could not be found or may have been removed from the catalog.
        </p>
        <Link
          to="/movies"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#800000] hover:bg-[#9B111E] text-white text-xs font-semibold rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Movies
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full pb-12">
      {/* Back Link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-20 pb-4">
        <Link
          to="/movies"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#B3B3B3] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Movies</span>
        </Link>
      </div>

      {/* Hero Backdrop & Details Section */}
      <div className="relative w-full bg-[#101010] border-b border-[#222222]">
        {/* Background Backdrop */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <img
            src={movie.backdropUrl}
            alt=""
            className="w-full h-full object-cover filter blur-md"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-[#101010]/80 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col md:flex-row gap-8 items-start">
          {/* Movie Poster */}
          <div className="w-44 sm:w-56 flex-none rounded-lg overflow-hidden border border-[#333333] shadow-2xl bg-[#181818] aspect-[2/3]">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover rounded-lg"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Metadata & Actions */}
          <div className="flex-1">
            {movie.tagline && (
              <p className="text-xs font-semibold text-[#800000] uppercase tracking-widest mb-1.5">
                {movie.tagline}
              </p>
            )}

            <h1 className="font-bebas text-3xl sm:text-5xl md:text-6xl font-normal text-white tracking-wider uppercase mb-2">
              {movie.title}
            </h1>

            {/* Unboxed Metadata row */}
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[#B3B3B3] mb-5">
              <span className="flex items-center gap-1 font-semibold text-white">
                <Star className="w-4 h-4 fill-[#800000] text-[#800000]" />
                {movie.rating.toFixed(1)}
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {movie.releaseYear}
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {movie.runtime} min
              </span>
              <span aria-hidden="true">·</span>
              <span>{movie.genres.join(', ')}</span>
            </div>

            {/* Synopsis */}
            <p className="text-sm sm:text-base text-[#B3B3B3] leading-relaxed mb-6 max-w-3xl">
              {movie.overview}
            </p>

            {/* Crew / Cast Kicker */}
            {movie.director && (
              <p className="text-xs text-[#808080] mb-4">
                <span className="font-semibold text-white">Director:</span> {movie.director}
              </p>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={scrollToPlayer}
                className="flex items-center gap-2 px-6 py-3 bg-[#800000] hover:bg-[#9B111E] text-white font-semibold text-sm transition-colors rounded-lg shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Play Movie</span>
              </button>

              <button
                type="button"
                onClick={() => toggle(movie)}
                className={`flex items-center gap-2 px-5 py-3 border font-semibold text-sm transition-colors rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  saved
                    ? 'bg-[#800000] border-[#800000] text-white'
                    : 'bg-[#222222] hover:bg-[#333333] border-[#333333] text-white'
                }`}
              >
                {saved ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                <span>{saved ? 'In Watchlist' : 'Add to Watchlist'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated Streaming Player Section */}
      <div ref={playerRef} className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-wider">Streaming Player</h2>
            <p className="text-xs text-[#808080]">
              Authorized streaming stream with switchable servers and subtitle options.
            </p>
          </div>
        </div>

        <VideoPlayer media={movie} sources={movie.playbackSources} />
      </div>

      {/* Cast & Characters */}
      {movie.cast && movie.cast.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
          <h2 className="text-lg font-bold text-white tracking-wider mb-4">Top Cast</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {movie.cast.map((actor) => (
              <div
                key={actor.name}
                className="p-3 bg-[#181818] border border-[#333333] rounded-lg text-center"
              >
                <p className="text-xs font-bold text-white truncate">{actor.name}</p>
                <p className="text-[11px] text-[#808080] truncate mt-0.5">{actor.character}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Similar Titles Carousel */}
      {similarMovies && similarMovies.length > 0 && (
        <div className="max-w-7xl mx-auto mt-6">
          <MovieRow title="More Like This" items={similarMovies} />
        </div>
      )}
    </div>
  );
};

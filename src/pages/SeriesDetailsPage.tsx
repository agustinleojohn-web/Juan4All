import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, Plus, Check, Star, ArrowLeft, Calendar, Tv, Clock } from 'lucide-react';
import { useMediaDetails, useSimilarMedia } from '../hooks/useCatalog';
import { useWatchlist } from '../../src/hooks/useWatchlist';
import { MovieRow } from '../components/carousel/MovieRow';

export const SeriesDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: series, isLoading, isError } = useMediaDetails(id, 'series');
  const { data: similarSeries } = useSimilarMedia(id, series?.genres);
  const { isSaved, toggle } = useWatchlist();

  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState(1);

  const saved = series ? isSaved(series.id) : false;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 pt-24 animate-pulse">
        <div className="h-8 w-40 bg-[#181818] rounded-lg mb-6" />
        <div className="w-full aspect-video bg-[#181818] rounded-lg mb-8" />
        <div className="h-10 w-96 bg-[#181818] rounded-lg mb-4" />
      </div>
    );
  }

  if (isError || !series) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <Tv className="w-16 h-16 text-[#800000] mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Series Not Found</h1>
        <p className="text-sm text-[#B3B3B3] mb-6">
          The requested TV series could not be found or may not be available.
        </p>
        <Link
          to="/series"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#800000] hover:bg-[#9B111E] text-white text-xs font-semibold rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to TV Series
        </Link>
      </div>
    );
  }

  const currentSeason =
    series.seasons?.find((s) => s.seasonNumber === selectedSeasonNumber) ||
    series.seasons?.[0];

  const handlePlayFirstEpisode = () => {
    const s = series.seasons?.[0]?.seasonNumber || 1;
    const e = series.seasons?.[0]?.episodes?.[0]?.episodeNumber || 1;
    navigate(`/series/${series.id}/season/${s}/episode/${e}`);
  };

  return (
    <div className="w-full pb-12">
      {/* Back Link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-20 pb-4">
        <Link
          to="/series"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#B3B3B3] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to TV Series</span>
        </Link>
      </div>

      {/* Hero Backdrop & Details Section */}
      <div className="relative w-full bg-[#101010] border-b border-[#222222]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <img
            src={series.backdropUrl}
            alt=""
            className="w-full h-full object-cover filter blur-md"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-[#101010]/80 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col md:flex-row gap-8 items-start">
          {/* Series Poster */}
          <div className="w-44 sm:w-56 flex-none rounded-lg overflow-hidden border border-[#333333] shadow-2xl bg-[#181818] aspect-[2/3]">
            <img
              src={series.posterUrl}
              alt={series.title}
              className="w-full h-full object-cover rounded-lg"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Details Info */}
          <div className="flex-1">
            {series.tagline && (
              <p className="text-xs font-semibold text-[#800000] uppercase tracking-widest mb-1.5">
                {series.tagline}
              </p>
            )}

            <h1 className="font-bebas text-3xl sm:text-5xl md:text-6xl font-normal text-white tracking-wider uppercase mb-2">
              {series.title}
            </h1>

            {/* Unboxed Metadata row */}
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[#B3B3B3] mb-5">
              <span className="flex items-center gap-1 font-semibold text-white">
                <Star className="w-4 h-4 fill-[#800000] text-[#800000]" />
                {series.rating.toFixed(1)}
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {series.releaseYear}
              </span>
              <span aria-hidden="true">·</span>
              <span>{series.seasonsCount || 1} Season{((series.seasonsCount || 1) > 1) ? 's' : ''}</span>
              <span aria-hidden="true">·</span>
              <span>{series.genres.join(', ')}</span>
            </div>

            {/* Synopsis */}
            <p className="text-sm sm:text-base text-[#B3B3B3] leading-relaxed mb-6 max-w-3xl">
              {series.overview}
            </p>

            {/* Creator Info */}
            {series.creator && (
              <p className="text-xs text-[#808080] mb-4">
                <span className="font-semibold text-white">Created by:</span> {series.creator}
              </p>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handlePlayFirstEpisode}
                className="flex items-center gap-2 px-6 py-3 bg-[#800000] hover:bg-[#9B111E] text-white font-semibold text-sm transition-colors rounded-lg shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Start Watching S1 E1</span>
              </button>

              <button
                type="button"
                onClick={() => toggle(series)}
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

      {/* Season and Episode Browser */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#222222]">
          <h2 className="text-xl font-bold text-white tracking-tight">Episodes</h2>

          {/* Season Selector Tabs */}
          {series.seasons && series.seasons.length > 1 && (
            <div className="flex items-center gap-1.5 p-1 bg-[#181818] border border-[#333333] rounded-lg">
              {series.seasons.map((season) => (
                <button
                  key={season.seasonNumber}
                  type="button"
                  onClick={() => setSelectedSeasonNumber(season.seasonNumber)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    selectedSeasonNumber === season.seasonNumber
                      ? 'bg-[#800000] text-white font-semibold'
                      : 'text-[#B3B3B3] hover:text-white'
                  }`}
                >
                  Season {season.seasonNumber}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Episode Cards List */}
        <div className="space-y-4">
          {currentSeason?.episodes.map((ep) => (
            <div
              key={ep.episodeNumber}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-[#181818] hover:bg-[#222222] border border-[#333333] hover:border-[#800000] transition-colors rounded-lg group"
            >
              <div className="flex items-start gap-4 flex-1">
                {/* Thumbnail Still */}
                <div className="relative w-32 sm:w-40 aspect-video flex-none bg-black rounded-lg overflow-hidden border border-[#333333]">
                  {ep.stillUrl ? (
                    <img
                      src={ep.stillUrl}
                      alt={ep.title}
                      className="w-full h-full object-cover rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#222222]">
                      <Tv className="w-6 h-6 text-[#808080]" />
                    </div>
                  )}
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 text-[10px] bg-black/80 font-mono text-white rounded-lg">
                    {ep.runtime || 25}m
                  </span>
                </div>

                {/* Episode Summary Info */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[#800000]">
                      EP {ep.episodeNumber}
                    </span>
                    <span aria-hidden="true" className="text-[#808080]">·</span>
                    <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-[#B3B3B3] transition-colors">
                      {ep.title}
                    </h3>
                  </div>

                  <p className="text-xs text-[#B3B3B3] line-clamp-2 max-w-2xl leading-relaxed">
                    {ep.overview}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-[#808080] mt-2">
                    {ep.airDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {ep.airDate}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {ep.runtime || 25} min
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct Play Button */}
              <Link
                to={`/series/${series.id}/season/${currentSeason.seasonNumber}/episode/${ep.episodeNumber}`}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#800000] hover:bg-[#9B111E] text-white text-xs font-semibold rounded-lg transition-colors shadow-md self-end sm:self-center shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play</span>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Cast & Crew */}
      {series.cast && series.cast.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
          <h2 className="text-lg font-bold text-white tracking-tight mb-4">Cast & Characters</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {series.cast.map((actor) => (
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

      {/* Similar Series Carousel */}
      {similarSeries && similarSeries.length > 0 && (
        <div className="max-w-7xl mx-auto mt-6">
          <MovieRow title="More Series Like This" items={similarSeries} />
        </div>
      )}
    </div>
  );
};

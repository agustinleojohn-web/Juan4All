import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Tv, Calendar } from 'lucide-react';
import { useEpisodeDetails } from '../hooks/useCatalog';
import { VideoPlayer } from '../components/player/VideoPlayer';

export const EpisodePlayerPage: React.FC = () => {
  const { id, seasonNumber, episodeNumber } = useParams<{
    id: string;
    seasonNumber: string;
    episodeNumber: string;
  }>();

  const sNum = parseInt(seasonNumber || '1', 10);
  const eNum = parseInt(episodeNumber || '1', 10);

  const { data, isLoading, isError } = useEpisodeDetails(id, sNum, eNum);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12 pt-24 animate-pulse">
        <div className="h-8 w-48 bg-[#181818] rounded-lg mb-6" />
        <div className="w-full aspect-video bg-[#181818] rounded-lg mb-6" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="max-w-7xl mx-auto  px-4 py-24 text-center">
        <Tv className="w-16 h-16 text-[#800000] mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Episode Unavailable</h1>
        <p className="text-sm text-[#B3B3B3] mb-6">
          This episode could not be found or has not been released yet.
        </p>
        <Link
          to={`/series/${id}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#800000] hover:bg-[#9B111E] text-white text-xs font-semibold rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Series Details
        </Link>
      </div>
    );
  }

  const { series, episode } = data;
  const currentSeason = series.seasons?.find((s) => s.seasonNumber === sNum);
  const totalEpisodesInSeason = currentSeason?.episodesCount || 1;

  const hasPrev = eNum > 1;
  const hasNext = eNum < totalEpisodesInSeason;

  const sources = episode.playbackSources && episode.playbackSources.length > 0
    ? episode.playbackSources
    : series.playbackSources;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 pt-20">
      {/* Navigation Bar */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <Link
          to={`/series/${series.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#B3B3B3] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {series.title}</span>
        </Link>

        {/* Next / Previous Episode Controls */}
        <div className="flex items-center gap-2">
          {hasPrev ? (
            <Link
              to={`/series/${series.id}/season/${sNum}/episode/${eNum - 1}`}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[#181818] hover:bg-[#222222] text-[#B3B3B3] hover:text-white border border-[#333333] rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Ep</span>
            </Link>
          ) : (
            <span className="opacity-40 flex items-center gap-1 px-3 py-1.5 text-xs bg-[#181818] text-[#808080] border border-[#333333] rounded-lg cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Ep</span>
            </span>
          )}

          {hasNext ? (
            <Link
              to={`/series/${series.id}/season/${sNum}/episode/${eNum + 1}`}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[#800000] hover:bg-[#9B111E] text-white font-medium rounded-lg transition-colors"
            >
              <span>Next Ep</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <span className="opacity-40 flex items-center gap-1 px-3 py-1.5 text-xs bg-[#181818] text-[#808080] border border-[#333333] rounded-lg cursor-not-allowed">
              <span>Next Ep</span>
              <ChevronRight className="w-4 h-4" />
            </span>
          )}
        </div>
      </div>

      {/* Main Video Player */}
      <div className="mb-6">
        <VideoPlayer media={series} episode={episode} sources={sources} />
      </div>

      {/* Episode Header & Info */}
      <div className="p-6 bg-[#181818] border border-[#333333] rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
          <div>
            <span className="text-xs font-bold text-[#800000] uppercase tracking-wider">
              {series.title} · Season {sNum} · Episode {eNum}
            </span>
            <h1 className="font-bebas text-2xl sm:text-3xl font-normal text-white tracking-wide uppercase mt-1">
              {episode.title}
            </h1>
          </div>

          {episode.airDate && (
            <span className="flex items-center gap-1 text-xs text-[#808080]">
              <Calendar className="w-3.5 h-3.5" />
              Aired: {episode.airDate}
            </span>
          )}
        </div>

        <p className="text-sm text-[#B3B3B3] leading-relaxed max-w-4xl mt-3">
          {episode.overview}
        </p>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, Check, Star } from 'lucide-react';
import { MediaItem } from '../../types';
import { useWatchlist } from '../../hooks/useWatchlist';

interface MovieCardProps {
  item: MediaItem;
  aspectRatio?: 'poster' | 'backdrop';
  showRank?: number;
  isDragging?: boolean;
  isCarousel?: boolean;
}

// Clean helper to format and color-code quality tags (HD, CAM, TS, 4K, SD, etc.)
const getQualityInfo = (quality?: string): { label: string; badgeClasses: string } => {
  if (!quality) {
    return {
      label: 'HD',
      badgeClasses: 'bg-black/85 text-emerald-400 border-emerald-500/40',
    };
  }
  const q = quality.toUpperCase();
  if (q.includes('4K') || q.includes('2160P') || q.includes('UHD')) {
    return {
      label: '4K',
      badgeClasses: 'bg-purple-950/90 text-purple-300 border-purple-500/50',
    };
  }
  if (q.includes('IMAX')) {
    return {
      label: 'IMAX',
      badgeClasses: 'bg-cyan-950/90 text-cyan-300 border-cyan-500/50',
    };
  }
  if (q.includes('CAM')) {
    return {
      label: 'CAM',
      badgeClasses: 'bg-amber-950/90 text-amber-300 border-amber-500/50',
    };
  }
  if (q.includes('TS') || q.includes('TELESYNC')) {
    return {
      label: 'TS',
      badgeClasses: 'bg-orange-950/90 text-orange-300 border-orange-500/50',
    };
  }
  if (q.includes('TC') || q.includes('HDTC')) {
    return {
      label: 'TC',
      badgeClasses: 'bg-yellow-950/90 text-yellow-300 border-yellow-500/50',
    };
  }
  if (q.includes('SD') || q.includes('480P')) {
    return {
      label: 'SD',
      badgeClasses: 'bg-zinc-900/90 text-zinc-300 border-zinc-600/40',
    };
  }
  return {
    label: 'HD',
    badgeClasses: 'bg-black/85 text-emerald-400 border-emerald-500/40',
  };
};

export const MovieCard: React.FC<MovieCardProps> = ({
  item,
  aspectRatio = 'poster',
  showRank,
  isDragging = false,
  isCarousel = false,
}) => {
  const navigate = useNavigate();
  const { isSaved, toggle } = useWatchlist();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const saved = isSaved(item.id);
  const quality = getQualityInfo(item.quality);

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    const targetUrl = item.type === 'movie' ? `/movie/${item.id}` : `/series/${item.id}`;
    navigate(targetUrl);
  };

  const handleToggleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(item);
  };

  const handleQuickPlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (item.type === 'movie') {
      navigate(`/movie/${item.id}`);
    } else {
      const firstSeason = item.seasons?.[0]?.seasonNumber || 1;
      const firstEpisode = item.seasons?.[0]?.episodes?.[0]?.episodeNumber || 1;
      navigate(`/series/${item.id}/season/${firstSeason}/episode/${firstEpisode}`);
    }
  };

  const imageUrl = aspectRatio === 'poster' ? item.posterUrl : item.backdropUrl;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e as unknown as React.MouseEvent);
        }
      }}
      className={`spotlight-card group relative cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#800000] rounded-lg select-none ${
        isCarousel
          ? `flex-none ${aspectRatio === 'poster' ? 'w-[155px] sm:w-[185px] md:w-[195px]' : 'w-[260px] sm:w-[290px]'}`
          : 'w-full'
      }`}
      aria-label={`${item.title} (${item.releaseYear})`}
    >
      {/* Card Image Container */}
      <div
        className={`relative w-full overflow-hidden bg-[#181818] border border-[#333333] transition-colors duration-200 group-hover:border-[#800000] rounded-lg ${
          aspectRatio === 'poster' ? 'aspect-[2/3]' : 'aspect-video'
        }`}
      >
        {/* Placeholder skeleton while image loads */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-[#222222] animate-pulse rounded-lg" />
        )}

        {/* Fallback container if image fails */}
        {imageError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-[#181818] rounded-lg">
            <span className="text-xs font-semibold text-[#B3B3B3] uppercase tracking-wider mb-1">
              {item.type}
            </span>
            <p className="text-sm font-bold text-white line-clamp-2">{item.title}</p>
            <span className="text-xs text-[#808080] mt-1">{item.releaseYear}</span>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={item.title}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover rounded-lg transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Quality Badge on Top-Right Corner */}
        <div
          className={`absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded border shadow-md z-20 pointer-events-none backdrop-blur-xs ${quality.badgeClasses}`}
        >
          {quality.label}
        </div>

        {/* Top-Left Trending Rank Badge:
            Positioned strictly at top-left inside poster so it NEVER overlaps the title below! */}
        {showRank !== undefined && (
          <div className="absolute top-2 left-2 z-20 flex items-center justify-center min-w-[28px] h-7 sm:min-w-[32px] sm:h-8 px-1.5 bg-[#800000] text-white font-bebas text-base sm:text-lg tracking-wider rounded-lg shadow-lg border border-red-400/40 select-none pointer-events-none">
            #{showRank}
          </div>
        )}

        {/* Gradient Scrim for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-transparent to-transparent opacity-75 group-hover:opacity-95 transition-opacity duration-200 rounded-lg pointer-events-none" />

        {/* Hover Overlay with Quick Actions */}
        <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3 flex flex-col justify-end opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 z-30">
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
            <button
              type="button"
              onClick={handleQuickPlay}
              className="flex items-center justify-center w-8 h-8 bg-white hover:bg-[#800000] text-black hover:text-white transition-colors rounded-lg shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white shrink-0"
              title="Play Now"
              aria-label={`Play ${item.title}`}
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </button>

            <button
              type="button"
              onClick={handleToggleWatchlist}
              className={`flex items-center justify-center w-8 h-8 border transition-colors rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white shrink-0 ${
                saved
                  ? 'bg-[#800000] border-[#800000] text-white'
                  : 'bg-[#222222]/90 hover:bg-[#333333] border-[#333333] text-white'
              }`}
              title={saved ? 'Remove from Watchlist' : 'Add to Watchlist'}
              aria-label={saved ? `Remove ${item.title} from Watchlist` : `Add ${item.title} to Watchlist`}
            >
              {saved ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>

          <p className="text-[11px] sm:text-xs text-[#B3B3B3] line-clamp-1 font-medium">
            {item.genres.slice(0, 2).join(' · ')}
          </p>
        </div>
      </div>

      {/* Card Info Below Poster: Totally clear of any overlap */}
      <div className="mt-2 px-0.5">
        <h3 className="font-bebas text-base sm:text-lg tracking-wide uppercase text-white truncate group-hover:text-red-400 transition-colors">
          {item.title}
        </h3>

        {/* Clean unboxed metadata with subtle dot separators */}
        <div className="flex items-center gap-1.5 text-xs text-[#808080] font-sans mt-0.5">
          <span>{item.releaseYear}</span>
          <span aria-hidden="true">·</span>
          <span>{item.type === 'movie' ? `${item.runtime || 90}m` : `${item.seasonsCount || 1} Season`}</span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-0.5 text-white/90 font-medium">
            <Star className="w-3 h-3 fill-[#800000] text-[#800000]" />
            {item.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
};

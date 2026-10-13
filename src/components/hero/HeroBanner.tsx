import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info, Plus, Check, Star } from 'lucide-react';
import { MediaItem } from '../../types';
import { useWatchlist } from '../../hooks/useWatchlist';

interface HeroBannerProps {
  items: MediaItem[];
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ items }) => {
  const navigate = useNavigate();
  const { isSaved, toggle } = useWatchlist();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const itemCount = items?.length || 0;

  // Next slide helper
  const nextSlide = useCallback(() => {
    if (itemCount <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % itemCount);
  }, [itemCount]);

  // Autoplay slider every 5.5 seconds unless hovered/paused
  useEffect(() => {
    if (itemCount <= 1 || isPaused) return;

    autoplayTimerRef.current = setInterval(() => {
      nextSlide();
    }, 5500);

    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }
    };
  }, [itemCount, isPaused, nextSlide, currentIndex]);

  const handleSelectIndex = (idx: number) => {
    setCurrentIndex(idx);
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      className="relative w-full h-[68vh] sm:h-[76vh] md:h-[84vh] max-h-[850px] overflow-hidden bg-[#101010] select-none"
    >
      {/* Background Backdrop Images with cross-fade */}
      <div className="absolute inset-0">
        {items.map((item, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={item.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-1 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={item.backdropUrl}
                alt={item.title}
                className={`w-full h-full object-cover object-center filter brightness-90 transform transition-transform duration-[6000ms] ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
                referrerPolicy="no-referrer"
              />
            </div>
          );
        })}

        {/* Cinematic Gradient Overlays placed above background images */}
        <div className="absolute inset-0 z-2 bg-gradient-to-t from-[#101010] via-[#101010]/55 to-transparent pointer-events-none" />
        <div className="absolute inset-0 z-2 bg-gradient-to-r from-[#101010] via-[#101010]/75 to-transparent w-full md:w-4/5 pointer-events-none" />
      </div>

      {/* Layered Content Slides with synchronized smooth fade & gentle translate transition */}
      <div className="relative h-full z-10">
        {items.map((item, idx) => {
          const isActive = idx === currentIndex;
          const saved = isSaved(item.id);

          const handleWatchNow = () => {
            if (item.type === 'movie') {
              navigate(`/movie/${item.id}`);
            } else {
              const s = item.seasons?.[0]?.seasonNumber || 1;
              const e = item.seasons?.[0]?.episodes?.[0]?.episodeNumber || 1;
              navigate(`/series/${item.id}/season/${s}/episode/${e}`);
            }
          };

          const handleMoreInfo = () => {
            navigate(item.type === 'movie' ? `/movie/${item.id}` : `/series/${item.id}`);
          };

          return (
            <div
              key={item.id}
              className={`max-w-7xl mx-auto absolute inset-0 flex flex-col justify-end px-4 sm:px-8 md:px-12 pb-14 sm:pb-16 md:pb-20 max-w-4xl transition-all duration-700 ease-in-out ${
                isActive
                  ? 'opacity-100 translate-y-0 pointer-events-auto z-10'
                  : 'opacity-0 translate-y-2 pointer-events-none z-0'
              }`}
            >
              {/* Title Kicker & Tagline */}
              {item.tagline && (
                <p className="text-xs sm:text-sm font-semibold text-[#B3B3B3] uppercase tracking-widest mb-1.5 line-clamp-1">
                  {item.tagline}
                </p>
              )}

              {/* Bebas Neue Title */}
              <h1 className="font-bebas text-3xl sm:text-6xl md:text-7xl font-normal text-white tracking-wider leading-none mb-2 text-balance drop-shadow-lg">
                {item.title}
              </h1>

              {/* Clean Unboxed Metadata */}
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#B3B3B3] font-medium mb-3">
                <span className="flex items-center gap-1 text-white font-semibold">
                  <Star className="w-4 h-4 fill-[#800000] text-[#800000]" />
                  {item.rating.toFixed(1)}
                </span>
                <span aria-hidden="true">·</span>
                <span>{item.releaseYear}</span>
                <span aria-hidden="true">·</span>
                <span>{item.genres.slice(0, 3).join(', ')}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {item.type === 'movie'
                    ? `${item.runtime || 90}m`
                    : `${item.seasonsCount || 1} Season${(item.seasonsCount || 1) > 1 ? 's' : ''}`}
                </span>
              </div>

              {/* Synopsis Overview */}
              <p className="text-xs sm:text-base text-[#B3B3B3] line-clamp-2 sm:line-clamp-3 mb-5 sm:mb-6 max-w-2xl leading-relaxed">
                {item.overview}
              </p>

              {/* Action Buttons:
                  On mobile, Watch and More Info show ONLY icons to give space to the Add to Watchlist button */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Watch Button (Icon only on mobile) */}
                <button
                  type="button"
                  onClick={handleWatchNow}
                  className="flex items-center justify-center gap-2 p-3 sm:px-6 sm:py-3 bg-[#800000] hover:bg-[#9B111E] text-white font-semibold text-sm sm:text-base transition-colors rounded-lg shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white shrink-0"
                  title="Watch Now"
                  aria-label={`Watch ${item.title}`}
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span className="hidden sm:inline font-medium">Watch Now</span>
                </button>

                {/* More Info Button (Icon only on mobile) */}
                <button
                  type="button"
                  onClick={handleMoreInfo}
                  className="flex items-center justify-center gap-2 p-3 sm:px-5 sm:py-3 bg-[#222222]/85 hover:bg-[#333333] text-white border border-[#333333] font-semibold text-sm sm:text-base transition-colors rounded-lg backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white shrink-0"
                  title="More Info"
                  aria-label={`More information about ${item.title}`}
                >
                  <Info className="w-5 h-5" />
                  <span className="hidden sm:inline font-medium">More Info</span>
                </button>

                {/* Add to Watchlist Button */}
                <button
                  type="button"
                  onClick={() => toggle(item)}
                  className={`flex items-center justify-center gap-2 px-3.5 py-3 sm:px-5 sm:py-3 border transition-colors rounded-lg backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white shrink-0 text-xs sm:text-sm font-semibold ${
                    saved
                      ? 'bg-[#800000] border-[#800000] text-white'
                      : 'bg-[#222222]/85 hover:bg-[#333333] border-[#333333] text-white'
                  }`}
                  title={saved ? 'Remove from Watchlist' : 'Add to Watchlist'}
                  aria-label={saved ? 'Remove from Watchlist' : 'Add to Watchlist'}
                >
                  {saved ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  ) : (
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  )}
                  <span className="inline font-medium">{saved ? 'In Watchlist' : 'Watchlist'}</span>
                </button>
              </div>
            </div>
          );
        })}

       {/* Multi-item Position Indicators — centered */}
{items.length > 1 && (
  <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 z-20">
    {items.map((_, idx) => (
      <button
        key={idx}
        type="button"
        onClick={() => handleSelectIndex(idx)}
        aria-label={`Go to featured slide ${idx + 1}`}
        aria-current={idx === currentIndex ? 'true' : undefined}
        className={`h-1.5 transition-all duration-500 rounded-lg ${
          idx === currentIndex
            ? 'w-8 bg-[#800000]'
            : 'w-3 bg-[#333333] hover:bg-[#808080]'
        }`}
      />
    ))}
  </div>
)}
      </div>
    </div>
  );
};

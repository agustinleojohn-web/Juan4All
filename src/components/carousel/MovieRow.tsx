import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaItem } from '../../types';
import { MovieCard } from './MovieCard';

interface MovieRowProps {
  title: string;
  items: MediaItem[];
  viewAllLink?: string;
  aspectRatio?: 'poster' | 'backdrop';
  showRanks?: boolean;
  isLoading?: boolean;
}

export const MovieRow: React.FC<MovieRowProps> = ({
  title,
  items,
  viewAllLink,
  aspectRatio = 'poster',
  showRanks = false,
  isLoading = false,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Drag-vs-click state
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollBounds = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    checkScrollBounds();
    el.addEventListener('scroll', checkScrollBounds, { passive: true });
    window.addEventListener('resize', checkScrollBounds);
    return () => {
      el.removeEventListener('scroll', checkScrollBounds);
      window.removeEventListener('resize', checkScrollBounds);
    };
  }, [checkScrollBounds, items]);

  // Arrow button scrolling
  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const { clientWidth } = scrollContainerRef.current;
    const scrollAmount = clientWidth * 0.75;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || !scrollContainerRef.current) return;
    setIsMouseDown(true);
    setIsDragging(false);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftState(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !scrollContainerRef.current) return;
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = x - startX;

    if (Math.abs(walk) > 6) {
      if (!isDragging) {
        setIsDragging(true);
      }
      scrollContainerRef.current.scrollLeft = scrollLeftState - walk;
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
    setTimeout(() => {
      setIsDragging(false);
    }, 50);
  };

  const handleMouseLeave = () => {
    if (isMouseDown) {
      setIsMouseDown(false);
      setTimeout(() => {
        setIsDragging(false);
      }, 50);
    }
  };

  if (!isLoading && items.length === 0) {
    return null;
  }

  return (
    <section className="relative my-6 md:my-8 px-4 md:px-12 group/row">
      {/* Row Header with Bebas Neue typography */}
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-bebas text-xl md:text-2xl font-normal text-white tracking-wider uppercase">
          {title}
        </h2>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-xs font-semibold text-[#B3B3B3] hover:text-white transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#800000] rounded-lg px-2 py-1 font-sans"
          >
            Explore All →
          </Link>
        )}
      </div>

      {/* Carousel Track Container */}
      <div className="relative">
        {/* Left Arrow Button (Desktop) */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-24 bg-[#101010]/85 hover:bg-[#800000] text-white border border-[#333333] hover:border-[#800000] items-center justify-center transition-all duration-200 rounded-lg backdrop-blur-sm opacity-0 group-hover/row:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Right Arrow Button (Desktop) */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-24 bg-[#101010]/85 hover:bg-[#800000] text-white border border-[#333333] hover:border-[#800000] items-center justify-center transition-all duration-200 rounded-lg backdrop-blur-sm opacity-0 group-hover/row:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Scrollable Track with Spotlight Group */}
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className={`spotlight-group flex gap-3 md:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1 select-none ${
            isMouseDown ? 'cursor-grabbing' : 'cursor-grab md:cursor-pointer'
          }`}
          style={{
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex-none bg-[#181818] border border-[#333333] rounded-lg animate-pulse"
                  style={{
                    width: aspectRatio === 'poster' ? '180px' : '280px',
                    height: aspectRatio === 'poster' ? '270px' : '158px',
                  }}
                />
              ))
            : items.map((item, index) => (
                <MovieCard
                  key={item.id}
                  item={item}
                  aspectRatio={aspectRatio}
                  showRank={showRanks ? index + 1 : undefined}
                  isDragging={isDragging}
                  isCarousel={true}
                />
              ))}
        </div>
      </div>
    </section>
  );
};

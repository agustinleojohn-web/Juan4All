import React, { useState } from 'react';
import { Flame, Star } from 'lucide-react';
import { useTrending } from '../hooks/useCatalog';
import { MovieCard } from '../components/carousel/MovieCard';
import { MediaType } from '../types';

export const TrendingPage: React.FC = () => {
  const [filterType, setFilterType] = useState<'all' | MediaType>('all');
  const [sortBy, setSortBy] = useState<'rank' | 'rating'>('rank');

  const { data: trendingItems, isLoading } = useTrending(filterType);

  const items = [...(trendingItems || [])];
  if (sortBy === 'rating') {
    items.sort((a, b) => b.rating - a.rating);
  } else {
    items.sort((a, b) => (a.trendingRank || 99) - (b.trendingRank || 99));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 pt-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-[#800000] text-xs font-bold uppercase tracking-wider mb-1">
            <Flame className="w-4 h-4 fill-current" />
            <span>Top Picks</span>
          </div>
          <h1 className="font-bebas text-3xl sm:text-5xl font-normal text-white tracking-wider uppercase">
            Trending Now
          </h1>
          <p className="text-sm text-[#B3B3B3] mt-1 font-sans">
            The most watched, talked about movies and series on Juan4All this week.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Type Segmented Buttons */}
          <div className="flex items-center p-1 bg-[#181818] border border-[#333333] rounded-lg">
            {(['all', 'movie', 'series'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilterType(t)}
                className={`px-3 py-1 text-xs font-medium transition-colors rounded-lg font-sans ${
                  filterType === t
                    ? 'bg-[#800000] text-white font-semibold'
                    : 'text-[#B3B3B3] hover:text-white'
                }`}
              >
                {t === 'all' ? 'All Titles' : t === 'movie' ? 'Movies Only' : 'TV Series'}
              </button>
            ))}
          </div>

          {/* Sort Switch */}
          <button
            type="button"
            onClick={() => setSortBy(sortBy === 'rank' ? 'rating' : 'rank')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#181818] hover:bg-[#222222] text-[#B3B3B3] hover:text-white border border-[#333333] rounded-lg transition-colors font-sans"
          >
            <Star className="w-3.5 h-3.5 fill-[#800000] text-[#800000]" />
            <span>Sort: {sortBy === 'rank' ? 'Trending Rank' : 'Highest Rating'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Trending Titles with Spotlight Effect and proper mobile gap (gap-3 on mobile, gap-4 on sm/md) */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div
              key={idx}
              className="aspect-[2/3] bg-[#181818] border border-[#333333] rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="spotlight-group grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((item, index) => (
            <MovieCard
              key={item.id}
              item={item}
              aspectRatio="poster"
              showRank={sortBy === 'rank' ? index + 1 : undefined}
              isCarousel={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

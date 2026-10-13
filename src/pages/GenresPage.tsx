import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Compass, Sparkles, SlidersHorizontal, Search, Check, X, SearchIcon } from 'lucide-react';
import { useGenres, useGenreRow } from '../hooks/useCatalog';
import { MovieCard } from '../components/carousel/MovieCard';

export const GenresPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: genresData } = useGenres();

  const selectedGenre = searchParams.get('genre') || 'Action';
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: matchingItems, isLoading } = useGenreRow(selectedGenre);

  const handleSelectGenre = (genre: string) => {
    setSearchParams({ genre });
    setShowFilters(false);
  };

  const genres = genresData || [];

  const filteredItems = (matchingItems || []).filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return item.title.toLowerCase().includes(q) || item.overview.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 pt-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-[#800000] text-xs font-bold uppercase tracking-wider mb-1">
            <SearchIcon className="w-4 h-4" />
            <span>Discovery Hub</span>
          </div>
          <h1 className="font-bebas text-3xl sm:text-5xl font-normal text-white tracking-wider uppercase">
            Browse by Genre
          </h1>
          <p className="text-sm text-[#B3B3B3] mt-1 font-sans">
            Discover specialized collections and hidden cinematic gems by genre.
          </p>
        </div>

        {/* Clean Controls: Search within Genre & Smart Filter Button (Genre choices hidden by default) */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder={`Search in ${selectedGenre}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 pl-9 pr-8 text-xs sm:text-sm bg-[#181818] border border-[#333333] focus:border-[#800000] text-white placeholder-[#808080] rounded-lg focus:outline-none"
            />
            <Search className="w-4 h-4 text-[#808080] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#808080] hover:text-white"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Smart Filter Trigger Button */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border transition-colors shrink-0 ${
              showFilters
                ? 'bg-[#800000] border-[#800000] text-white'
                : 'bg-[#181818] hover:bg-[#222222] border-[#333333] text-[#B3B3B3] hover:text-white'
            }`}
            aria-expanded={showFilters}
            aria-label="Toggle genre selector"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter</span>
            <span className="px-2 py-0.5 bg-[#222222] text-white text-[10px] font-bold rounded-full border border-[#333333]">
              {selectedGenre}
            </span>
          </button>
        </div>
      </div>

      {/* Smart Filter Collapsible Genre Selector */}
      {showFilters && (
        <div className="p-4 bg-[#181818] border border-[#333333] rounded-lg mb-8 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#222222]">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#800000]" />
              <h3 className="font-bebas text-lg tracking-wide uppercase text-white">Select a Genre</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(false)}
              className="p-1 text-[#808080] hover:text-white rounded-lg"
              aria-label="Close filters"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {genres.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => handleSelectGenre(g)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors rounded-lg ${
                  selectedGenre === g
                    ? 'bg-[#800000] text-white font-semibold shadow-sm'
                    : 'bg-[#222222] hover:bg-[#333333] text-[#B3B3B3] hover:text-white border border-[#333333]'
                }`}
              >
                {selectedGenre === g && <Check className="w-3.5 h-3.5" />}
                <span>{g}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Genre Banner */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#222222]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#800000]" />
          <h2 className="font-bebas text-xl md:text-2xl font-normal text-white tracking-wider uppercase">
            {selectedGenre} Collection
          </h2>
        </div>
        <span className="text-xs text-[#808080] font-sans">
          {filteredItems.length} Titles Available
        </span>
      </div>

      {/* Items Grid with Spotlight Effect and proper mobile gap (gap-3 on mobile, gap-4 on sm/md) */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div
              key={idx}
              className="aspect-[2/3] bg-[#181818] border border-[#333333] rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="spotlight-group grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredItems.map((item) => (
            <MovieCard key={item.id} item={item} aspectRatio="poster" isCarousel={false} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-[#181818] border border-[#333333] rounded-lg">
          <Compass className="w-10 h-10 text-[#808080] mb-3" />
          <h3 className="font-bebas text-xl text-white mb-1">
            {searchQuery ? 'No Matching Titles Found' : 'No Titles in this Category'}
          </h3>
          <p className="text-xs text-[#B3B3B3] max-w-xs mb-3 font-sans">
            {searchQuery
              ? `No titles in ${selectedGenre} matched "${searchQuery}".`
              : 'Try selecting another genre.'}
          </p>
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="px-3 py-1.5 bg-[#800000] text-white text-xs font-medium rounded-lg font-sans"
            >
              Clear Search
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSelectGenre('Action')}
              className="px-3 py-1.5 bg-[#800000] text-white text-xs font-medium rounded-lg font-sans"
            >
              Explore Action
            </button>
          )}
        </div>
      )}
    </div>
  );
};

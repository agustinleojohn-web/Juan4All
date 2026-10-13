import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Film, RotateCcw, X, Check } from 'lucide-react';
import { useMovies, useGenres } from '../hooks/useCatalog';
import { MovieCard } from '../components/carousel/MovieCard';

export const MoviesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedGenre = searchParams.get('genre') || 'All';
  const selectedSort = (searchParams.get('sort') as 'popular' | 'rating' | 'year' | 'title') || 'popular';
  const searchQuery = searchParams.get('q') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);

  const { data: genresData } = useGenres();
  const { data: movieData, isLoading } = useMovies({
    genre: selectedGenre !== 'All' ? selectedGenre : undefined,
    sortBy: selectedSort,
    search: searchQuery || undefined,
    page: currentPage,
    perPage: 24,
  });

  const activeFilterCount = (selectedGenre !== 'All' ? 1 : 0) + (selectedSort !== 'popular' ? 1 : 0);

  const handleGenreChange = (genre: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (genre === 'All') {
      params.delete('genre');
    } else {
      params.set('genre', genre);
    }
    setSearchParams(params);
  };

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (sort === 'popular') {
      params.delete('sort');
    } else {
      params.set('sort', sort);
    }
    setSearchParams(params);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (localSearch.trim()) {
      params.set('q', localSearch.trim());
    } else {
      params.delete('q');
    }
    setSearchParams(params);
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    const params = new URLSearchParams(searchParams);
    params.delete('q');
    params.set('page', '1');
    setSearchParams(params);
  };

  const resetFilters = () => {
    setLocalSearch('');
    setSearchParams(new URLSearchParams());
    setShowFilters(false);
  };

  const allGenres = ['All', ...(genresData || [])];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 pt-20">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-[#800000] text-xs font-bold uppercase tracking-wider mb-1">
            <Film className="w-4 h-4" />
            <span>Catalog</span>
          </div>
          <h1 className="font-bebas text-3xl sm:text-5xl font-normal text-white tracking-wider uppercase">
            Movies
          </h1>
          <p className="text-sm text-[#B3B3B3] mt-1 font-sans">
            Explore 36,000+ premier feature films, blockbusters, and authorized cinema.
          </p>
        </div>

        {/* Clean Controls: Search Bar & Smart Filter Button (Filters hidden by default) */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-72">
            <input
              type="text"
              placeholder="Search movies..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full px-3 py-2 pl-9 pr-8 text-xs sm:text-sm bg-[#181818] border border-[#333333] focus:border-[#800000] text-white placeholder-[#808080] rounded-lg focus:outline-none"
            />
            <Search className="w-4 h-4 text-[#808080] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            {localSearch && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="p-1 text-[#808080] hover:text-white absolute right-2 top-1/2 -translate-y-1/2"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Smart Filter Trigger Button */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border transition-colors shrink-0 ${
              showFilters || activeFilterCount > 0
                ? 'bg-[#800000] border-[#800000] text-white'
                : 'bg-[#181818] hover:bg-[#222222] border-[#333333] text-[#B3B3B3] hover:text-white'
            }`}
            aria-expanded={showFilters}
            aria-label="Toggle filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 flex items-center justify-center bg-white text-black text-[10px] font-bold rounded-full ml-0.5">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Smart Filter Collapsible Panel (Revealed only when Filter button is clicked) */}
      {showFilters && (
        <div className="p-4 bg-[#181818] border border-[#333333] rounded-lg mb-8 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#222222]">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#800000]" />
              <h3 className="font-bebas text-lg tracking-wide uppercase text-white">Smart Filter Options</h3>
            </div>
            <div className="flex items-center gap-3">
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-[#800000] hover:text-[#9B111E] font-medium flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="p-1 text-[#808080] hover:text-white rounded-lg"
                aria-label="Close filters"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Genre Section */}
          <div className="mb-4">
            <span className="text-xs text-[#808080] font-semibold block mb-2 font-sans">Genre</span>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto no-scrollbar py-1">
              {allGenres.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleGenreChange(g)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors rounded-lg ${
                    selectedGenre === g
                      ? 'bg-[#800000] text-white font-semibold'
                      : 'bg-[#222222] hover:bg-[#333333] text-[#B3B3B3] hover:text-white border border-[#333333]'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Section */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#222222]">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#808080] font-semibold font-sans">Sort by:</span>
              <select
                value={selectedSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3 py-1.5 text-xs bg-[#222222] text-white border border-[#333333] rounded-lg focus:outline-none focus:border-[#800000]"
              >
                <option value="popular">Popularity (Views)</option>
                <option value="rating">Top Rated</option>
                <option value="year">Release Year</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setShowFilters(false)}
              className="flex items-center gap-1 px-4 py-1.5 bg-[#800000] hover:bg-[#9B111E] text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply &amp; Close</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Filter Tags Indicator (When filters closed) */}
      {!showFilters && (selectedGenre !== 'All' || selectedSort !== 'popular' || searchQuery) && (
        <div className="flex items-center justify-between mb-6 text-xs text-[#B3B3B3] bg-[#181818]/70 p-2.5 border border-[#333333] rounded-lg">
          <div className="flex flex-wrap items-center gap-2">
            <span>Active filters:</span>
            {selectedGenre !== 'All' && (
              <span className="px-2 py-0.5 bg-[#222222] text-white border border-[#333333] rounded-lg text-[11px]">
                Genre: {selectedGenre}
              </span>
            )}
            {selectedSort !== 'popular' && (
              <span className="px-2 py-0.5 bg-[#222222] text-white border border-[#333333] rounded-lg text-[11px]">
                Sort: {selectedSort}
              </span>
            )}
            {searchQuery && (
              <span className="px-2 py-0.5 bg-[#222222] text-white border border-[#333333] rounded-lg text-[11px]">
                Query: &quot;{searchQuery}&quot;
              </span>
            )}
            <span className="text-[#808080]">({movieData?.total || 0} results)</span>
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1 text-[#800000] hover:text-[#9B111E] font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      )}

      {/* Movies Grid with Spotlight Effect and proper mobile gap (gap-3 on mobile, gap-4 on sm/md) */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div
              key={idx}
              className="aspect-[2/3] bg-[#181818] border border-[#333333] rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : movieData?.items && movieData.items.length > 0 ? (
        <>
          <div className="spotlight-group grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {movieData.items.map((movie) => (
              <MovieCard key={movie.id} item={movie} aspectRatio="poster" isCarousel={false} />
            ))}
          </div>

          {/* Real Pagination Navigation */}
          {movieData.lastPage > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12 pt-6 border-t border-[#222222]">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => {
                  const p = new URLSearchParams(searchParams);
                  p.set('page', String(currentPage - 1));
                  setSearchParams(p);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-2 text-xs font-semibold bg-[#181818] hover:bg-[#222222] disabled:opacity-30 disabled:cursor-not-allowed text-white border border-[#333333] rounded-lg transition-colors"
              >
                Previous Page
              </button>

              <span className="px-4 py-2 text-xs font-medium text-[#B3B3B3] bg-[#101010] border border-[#333333] rounded-lg font-sans">
                Page {currentPage} of {Math.min(movieData.lastPage, 500)}
              </span>

              <button
                type="button"
                disabled={currentPage >= movieData.lastPage}
                onClick={() => {
                  const p = new URLSearchParams(searchParams);
                  p.set('page', String(currentPage + 1));
                  setSearchParams(p);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-2 text-xs font-semibold bg-[#800000] hover:bg-[#9B111E] disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Next Page
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-[#181818] border border-[#333333] rounded-lg">
          <Film className="w-12 h-12 text-[#808080] mb-3" />
          <h3 className="font-bebas text-xl text-white mb-1">No Movies Found</h3>
          <p className="text-sm text-[#B3B3B3] max-w-sm mb-4 font-sans">
            We couldn&apos;t find any movies matching your current filters or search term.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 bg-[#800000] hover:bg-[#9B111E] text-white text-xs font-semibold rounded-lg transition-colors font-sans"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, X, Clock, Trash2 } from 'lucide-react';
import { useSearch } from '../hooks/useCatalog';
import { MovieCard } from '../components/carousel/MovieCard';
import { MediaType } from '../types';

const RECENT_SEARCHES_KEY = 'juan4all_recent_searches_v1';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [inputVal, setInputVal] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [filterType, setFilterType] = useState<'all' | MediaType>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Debounce input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputVal.trim());
      const p = new URLSearchParams(searchParams);
      if (inputVal.trim()) {
        p.set('q', inputVal.trim());
      } else {
        p.delete('q');
      }
      setSearchParams(p, { replace: true });

      if (inputVal.trim().length > 1) {
        setRecentSearches((prev) => {
          const filtered = prev.filter((s) => s.toLowerCase() !== inputVal.trim().toLowerCase());
          const updated = [inputVal.trim(), ...filtered].slice(0, 8);
          try {
            localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputVal, searchParams, setSearchParams]);

  const { data: results, isLoading } = useSearch(debouncedQuery, filterType);

  const handleClear = () => {
    setInputVal('');
    setDebouncedQuery('');
    setSearchParams({}, { replace: true });
  };

  const handleSelectRecent = (term: string) => {
    setInputVal(term);
    setDebouncedQuery(term);
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 pt-20">
      {/* Search Input Box */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="relative">
          <input
            type="text"
            autoFocus
            placeholder="Search by title, director, cast, or genre..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="w-full h-14 pl-12 pr-12 text-base sm:text-lg bg-[#181818] border border-[#333333] focus:border-[#800000] text-white placeholder-[#808080] rounded-lg focus:outline-none transition-colors shadow-lg font-sans"
          />
          <SearchIcon className="w-6 h-6 text-[#808080] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          {inputVal && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2 text-[#808080] hover:text-white absolute right-3 top-1/2 -translate-y-1/2 rounded-lg"
              aria-label="Clear search input"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filter by Type & Recent Searches */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
          <div className="flex items-center gap-1.5 p-1 bg-[#181818] border border-[#333333] rounded-lg self-start">
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
                {t === 'all' ? 'All Results' : t === 'movie' ? 'Movies Only' : 'TV Series'}
              </button>
            ))}
          </div>

          {recentSearches.length > 0 && (
            <button
              type="button"
              onClick={clearAllRecent}
              className="flex items-center gap-1 text-xs text-[#808080] hover:text-red-400 transition-colors self-end sm:self-auto font-sans"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Recent Searches</span>
            </button>
          )}
        </div>

        {/* Recent Searches Buttons */}
        {!debouncedQuery && recentSearches.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#222222]">
            <div className="flex items-center gap-2 text-xs text-[#808080] mb-2 font-medium font-sans">
              <Clock className="w-3.5 h-3.5" />
              <span>Recent Searches</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => handleSelectRecent(term)}
                  className="px-3 py-1 text-xs bg-[#181818] hover:bg-[#222222] text-[#B3B3B3] hover:text-white border border-[#333333] rounded-lg transition-colors font-sans"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Header */}
      {debouncedQuery && (
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#222222]">
          <h2 className="font-bebas text-xl sm:text-2xl font-normal text-white tracking-wider uppercase">
            Results for &ldquo;{debouncedQuery}&rdquo;
          </h2>
          <span className="text-xs text-[#808080] font-sans">
            {results?.length || 0} Matches found
          </span>
        </div>
      )}

      {/* Results Grid with Spotlight Effect and proper mobile gap (gap-3 on mobile, gap-4 on sm/md) */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="aspect-[2/3] bg-[#181818] border border-[#333333] rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : debouncedQuery && results && results.length > 0 ? (
        <div className="spotlight-group grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {results.map((item) => (
            <MovieCard key={item.id} item={item} aspectRatio="poster" isCarousel={false} />
          ))}
        </div>
      ) : debouncedQuery && (!results || results.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-[#181818] border border-[#333333] rounded-lg">
          <SearchIcon className="w-12 h-12 text-[#808080] mb-3" />
          <h3 className="font-bebas text-xl text-white mb-1">No Results Found</h3>
          <p className="text-sm text-[#B3B3B3] max-w-sm mb-4 font-sans">
            We couldn&apos;t find any matches for &ldquo;{debouncedQuery}&rdquo;. Try another title, actor, or genre.
          </p>
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 bg-[#800000] hover:bg-[#9B111E] text-white text-xs font-semibold rounded-lg transition-colors font-sans"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="text-center py-16 text-[#808080] font-sans">
          <p className="text-sm">Type in the search bar above to instantly find movies and TV shows.</p>
        </div>
      )}
    </div>
  );
};

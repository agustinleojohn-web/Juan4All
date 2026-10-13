import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Film, Trash2, ArrowRight } from 'lucide-react';
import { useWatchlist } from '../hooks/useWatchlist';
import { MovieCard } from '../components/carousel/MovieCard';
import { MediaType } from '../types';

export const WatchlistPage: React.FC = () => {
  const { watchlist, remove } = useWatchlist();
  const [filterType, setFilterType] = useState<'all' | MediaType>('all');

  const filteredItems = watchlist.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 pt-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-[#800000] text-xs font-bold uppercase tracking-wider mb-1">
            <Bookmark className="w-4 h-4" />
            <span>Saved Library</span>
          </div>
          <h1 className="font-bebas text-3xl sm:text-5xl font-normal text-white tracking-wider uppercase">
            My Watchlist
          </h1>
          <p className="text-sm text-[#B3B3B3] mt-1 font-sans">
            Titles you have saved for movie nights. Stored securely in your browser.
          </p>
        </div>

        {/* Filter Segmented Buttons */}
        {watchlist.length > 0 && (
          <div className="flex items-center p-1 bg-[#181818] border border-[#333333] rounded-lg">
            {(['all', 'movie', 'series'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors rounded-lg font-sans ${
                  filterType === t
                    ? 'bg-[#800000] text-white font-semibold'
                    : 'text-[#B3B3B3] hover:text-white'
                }`}
              >
                {t === 'all'
                  ? `All (${watchlist.length})`
                  : t === 'movie'
                  ? `Movies (${watchlist.filter((i) => i.type === 'movie').length})`
                  : `Series (${watchlist.filter((i) => i.type === 'series').length})`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Watchlist Grid with Spotlight Effect and mobile gap-3 */}
      {filteredItems.length > 0 ? (
        <div className="spotlight-group grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="relative group">
              <MovieCard item={item} aspectRatio="poster" isCarousel={false} />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(item.id);
                }}
                className="absolute top-2 left-2 p-1.5 bg-[#101010]/95 hover:bg-[#800000] text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-lg z-30 border border-[#333333]"
                title="Remove from watchlist"
                aria-label={`Remove ${item.title} from watchlist`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-[#181818] border border-[#333333] rounded-lg">
          <Bookmark className="w-14 h-14 text-[#808080] mb-4" />
          <h2 className="font-bebas text-2xl text-white mb-1">Your Watchlist is Empty</h2>
          <p className="text-sm text-[#B3B3B3] max-w-sm mb-6 leading-relaxed font-sans">
            {filterType !== 'all'
              ? `No ${filterType === 'movie' ? 'movies' : 'TV series'} found in your saved list.`
              : 'Add movies and series to your watchlist while browsing so you can easily find them later.'}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/movies"
              className="flex items-center gap-2 px-4 py-2.5 bg-[#800000] hover:bg-[#9B111E] text-white text-xs font-semibold rounded-lg transition-colors font-sans"
            >
              <Film className="w-4 h-4" />
              <span>Browse Movies</span>
            </Link>
            <Link
              to="/trending"
              className="flex items-center gap-2 px-4 py-2.5 bg-[#222222] hover:bg-[#333333] text-white text-xs font-semibold rounded-lg border border-[#333333] transition-colors font-sans"
            >
              <span>Explore Trending</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

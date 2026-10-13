import React from 'react';
import { Link } from 'react-router-dom';
import { History as HistoryIcon, Play, Trash2, ArrowRight } from 'lucide-react';
import { useHistory } from '../hooks/useHistory';

export const HistoryPage: React.FC = () => {
  const { history, remove, clear } = useHistory();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  const formatRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 pt-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-[#800000] text-xs font-bold uppercase tracking-wider mb-1">
            <HistoryIcon className="w-4 h-4" />
            <span>Activity</span>
          </div>
          <h1 className="font-bebas text-3xl sm:text-5xl font-normal text-white tracking-wider uppercase">
            Watch History
          </h1>
          <p className="text-sm text-[#B3B3B3] mt-1 font-sans">
            Pick up right where you left off. Stored locally in your browser.
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#B3B3B3] hover:text-red-400 bg-[#181818] hover:bg-[#222222] border border-[#333333] rounded-lg transition-colors self-start sm:self-auto font-sans"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* History Items */}
      {history.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {history.map((item) => {
            const percent = Math.min(
              100,
              Math.max(5, Math.round((item.progressSeconds / (item.durationSeconds || 1)) * 100))
            );

            const watchUrl =
              item.type === 'movie'
                ? `/movie/${item.mediaId}`
                : `/series/${item.mediaId}/season/${item.seasonNumber || 1}/episode/${item.episodeNumber || 1}`;

            return (
              <div
                key={`${item.mediaId}-${item.seasonNumber || 0}-${item.episodeNumber || 0}`}
                className="flex flex-col bg-[#181818] border border-[#333333] rounded-lg overflow-hidden group hover:border-[#800000] transition-colors"
              >
                {/* Thumbnail with Scrim & Progress Bar */}
                <div className="relative aspect-video w-full bg-black overflow-hidden">
                  <img
                    src={item.backdropUrl || item.posterUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {/* Play Resume Overlay Button */}
                  <Link
                    to={watchUrl}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Resume watching ${item.title}`}
                  >
                    <div className="w-10 h-10 flex items-center justify-center bg-[#800000] text-white rounded-lg shadow-lg">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </Link>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => remove(item.mediaId, item.seasonNumber, item.episodeNumber)}
                    className="absolute top-2 right-2 p-1.5 bg-[#101010]/90 hover:bg-[#800000] text-white rounded-lg z-10 border border-[#333333] opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove from history"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Progress Bar at Bottom of Thumbnail */}
                  <div className="absolute bottom-0 inset-x-0 h-1.5 bg-[#333333]">
                    <div
                      className="h-full bg-[#800000] transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Info Text */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bebas text-base text-white tracking-wide uppercase truncate">
                      {item.title}
                    </h3>

                    {item.episodeTitle && (
                      <p className="text-xs text-[#B3B3B3] truncate mt-0.5 font-sans">
                        S{item.seasonNumber} E{item.episodeNumber}: {item.episodeTitle}
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 text-[11px] text-[#808080] mt-1 font-sans">
                      <span>{formatDuration(item.progressSeconds)} watched</span>
                      <span aria-hidden="true">·</span>
                      <span>{percent}% done</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatRelativeTime(item.watchedAt)}</span>
                    </div>
                  </div>

                  <Link
                    to={watchUrl}
                    className="mt-3 inline-flex items-center justify-center gap-1.5 w-full py-1.5 text-xs font-semibold bg-[#222222] hover:bg-[#800000] text-white rounded-lg transition-colors border border-[#333333] font-sans"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Resume</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-[#181818] border border-[#333333] rounded-lg">
          <HistoryIcon className="w-14 h-14 text-[#808080] mb-4" />
          <h2 className="font-bebas text-2xl text-white mb-1">No Watch History Yet</h2>
          <p className="text-sm text-[#B3B3B3] max-w-sm mb-6 leading-relaxed font-sans">
            When you watch movies and episodes on Juan4All, your playback progress will automatically appear here so you can resume anytime.
          </p>
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#800000] hover:bg-[#9B111E] text-white text-xs font-semibold rounded-lg transition-colors font-sans"
          >
            <span>Start Watching</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

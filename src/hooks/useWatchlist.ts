import { useState, useEffect, useCallback } from 'react';
import { MediaItem } from '../types';
import {
  getWatchlist,
  isInWatchlist as checkInWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  toggleWatchlist as toggleStorageWatchlist,
  STORAGE_CHANGE_EVENT,
} from '../services/storage';

export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState<MediaItem[]>(() => getWatchlist());

  const refresh = useCallback(() => {
    setWatchlist(getWatchlist());
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ type?: string }>;
      if (!customEvent.detail || customEvent.detail.type === 'watchlist') {
        refresh();
      }
    };

    window.addEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
    window.addEventListener('storage', refresh);

    return () => {
      window.removeEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);

  const isSaved = useCallback(
    (id: string) => {
      return checkInWatchlist(id);
    },
    [watchlist]
  );

  const toggle = useCallback((item: MediaItem) => {
    const added = toggleStorageWatchlist(item);
    return added;
  }, []);

  const add = useCallback((item: MediaItem) => {
    return addToWatchlist(item);
  }, []);

  const remove = useCallback((id: string) => {
    return removeFromWatchlist(id);
  }, []);

  return {
    watchlist,
    isSaved,
    toggle,
    add,
    remove,
    refresh,
    count: watchlist.length,
  };
};

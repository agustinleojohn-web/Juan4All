import { useState, useEffect, useCallback } from 'react';
import { WatchHistoryItem, MediaItem } from '../types';
import {
  getWatchHistory,
  saveWatchHistory,
  removeFromHistory as removeStorageHistory,
  clearWatchHistory as clearStorageHistory,
  STORAGE_CHANGE_EVENT,
} from '../services/storage';

export const useHistory = () => {
  const [history, setHistory] = useState<WatchHistoryItem[]>(() => getWatchHistory());

  const refresh = useCallback(() => {
    setHistory(getWatchHistory());
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ type?: string }>;
      if (!customEvent.detail || customEvent.detail.type === 'history') {
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

  const saveProgress = useCallback(
    (params: {
      media: MediaItem;
      progressSeconds: number;
      durationSeconds: number;
      seasonNumber?: number;
      episodeNumber?: number;
      episodeTitle?: string;
    }) => {
      saveWatchHistory(params);
    },
    []
  );

  const remove = useCallback((mediaId: string, seasonNumber?: number, episodeNumber?: number) => {
    removeStorageHistory(mediaId, seasonNumber, episodeNumber);
  }, []);

  const clear = useCallback(() => {
    clearStorageHistory();
  }, []);

  return {
    history,
    saveProgress,
    remove,
    clear,
    refresh,
    count: history.length,
  };
};

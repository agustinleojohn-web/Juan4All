import { MediaItem, WatchHistoryItem } from '../types';

const WATCHLIST_KEY = 'juan4all_watchlist_v1';
const HISTORY_KEY = 'juan4all_history_v1';
const PREFS_KEY = 'juan4all_preferences_v1';

export const STORAGE_CHANGE_EVENT = 'juan4all_storage_change';

const notifyChange = (type: 'watchlist' | 'history') => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STORAGE_CHANGE_EVENT, { detail: { type } }));
  }
};

// --- WATCHLIST ---
export const getWatchlist = (): MediaItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to read watchlist from localStorage', e);
    return [];
  }
};

export const isInWatchlist = (id: string): boolean => {
  const list = getWatchlist();
  return list.some((item) => item.id === id);
};

export const addToWatchlist = (item: MediaItem): boolean => {
  try {
    const list = getWatchlist();
    if (list.some((existing) => existing.id === item.id)) {
      return false; // Already in list
    }
    const updated = [item, ...list];
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
    notifyChange('watchlist');
    return true;
  } catch (e) {
    console.error('Failed to save to watchlist', e);
    return false;
  }
};

export const removeFromWatchlist = (id: string): boolean => {
  try {
    const list = getWatchlist();
    const updated = list.filter((item) => item.id !== id);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
    notifyChange('watchlist');
    return true;
  } catch (e) {
    console.error('Failed to remove from watchlist', e);
    return false;
  }
};

export const toggleWatchlist = (item: MediaItem): boolean => {
  if (isInWatchlist(item.id)) {
    removeFromWatchlist(item.id);
    return false; // Now removed
  } else {
    addToWatchlist(item);
    return true; // Now added
  }
};

// --- HISTORY ---
export const getWatchHistory = (): WatchHistoryItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to read history from localStorage', e);
    return [];
  }
};

export const saveWatchHistory = (item: {
  media: MediaItem;
  progressSeconds: number;
  durationSeconds: number;
  seasonNumber?: number;
  episodeNumber?: number;
  episodeTitle?: string;
}): void => {
  try {
    const history = getWatchHistory();
    // Remove if existing record exists for this item/episode
    const key = `${item.media.id}-${item.seasonNumber || 0}-${item.episodeNumber || 0}`;
    const filtered = history.filter(
      (h) => `${h.mediaId}-${h.seasonNumber || 0}-${h.episodeNumber || 0}` !== key
    );

    const newItem: WatchHistoryItem = {
      mediaId: item.media.id,
      title: item.media.title,
      type: item.media.type,
      posterUrl: item.media.posterUrl,
      backdropUrl: item.media.backdropUrl,
      progressSeconds: Math.floor(item.progressSeconds),
      durationSeconds: Math.floor(item.durationSeconds || 1),
      watchedAt: Date.now(),
      seasonNumber: item.seasonNumber,
      episodeNumber: item.episodeNumber,
      episodeTitle: item.episodeTitle,
    };

    const updated = [newItem, ...filtered].slice(0, 50); // Keep last 50
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    notifyChange('history');
  } catch (e) {
    console.error('Failed to save watch history', e);
  }
};

export const removeFromHistory = (mediaId: string, seasonNumber?: number, episodeNumber?: number): void => {
  try {
    const history = getWatchHistory();
    const updated = history.filter((h) => {
      if (h.mediaId !== mediaId) return true;
      if (seasonNumber !== undefined && h.seasonNumber !== seasonNumber) return true;
      if (episodeNumber !== undefined && h.episodeNumber !== episodeNumber) return true;
      return false;
    });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    notifyChange('history');
  } catch (e) {
    console.error('Failed to remove history item', e);
  }
};

export const clearWatchHistory = (): void => {
  try {
    localStorage.removeItem(HISTORY_KEY);
    notifyChange('history');
  } catch (e) {
    console.error('Failed to clear watch history', e);
  }
};

// --- PREFERENCES ---
export interface UserPreferences {
  volume: number;
  muted: boolean;
  preferredQuality: 'Auto' | '1080p' | '720p';
}

export const getPreferences = (): UserPreferences => {
  const defaults: UserPreferences = {
    volume: 0.8,
    muted: false,
    preferredQuality: 'Auto',
  };
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    return defaults;
  }
};

export const savePreferences = (prefs: Partial<UserPreferences>): void => {
  try {
    const current = getPreferences();
    localStorage.setItem(PREFS_KEY, JSON.stringify({ ...current, ...prefs }));
  } catch (e) {
    console.error('Failed to save preferences', e);
  }
};

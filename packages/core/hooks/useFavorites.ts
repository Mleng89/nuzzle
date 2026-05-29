/**
 * useFavorites.ts
 *
 * Platform-agnostic favorites hook.
 *
 * On web: uses localStorage directly.
 * On mobile: caller injects AsyncStorage via the `storage` prop so this
 *            file stays free of React Native imports (important for web SSR).
 *
 * Usage (web):
 *   const favs = useFavorites()
 *
 * Usage (mobile — pass AsyncStorage):
 *   import AsyncStorage from '@react-native-async-storage/async-storage'
 *   const favs = useFavorites({ storage: AsyncStorage })
 */

import { useEffect, useState, useCallback } from 'react';

const KEY = 'nurture_spot_favorites_v1';

interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

// Web fallback using localStorage
const webStorage: StorageAdapter = {
  getItem: async (key) => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key);
  },
  setItem: async (key, value) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, value);
  },
};

interface Options {
  storage?: StorageAdapter;
}

interface FavoritesResult {
  favoriteIds: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => Promise<void>;
}

export function useFavorites(options: Options = {}): FavoritesResult {
  const storage = options.storage ?? webStorage;
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  // Load on mount
  useEffect(() => {
    storage.getItem(KEY).then((raw) => {
      if (raw) {
        try {
          setFavoriteIds(JSON.parse(raw) as string[]);
        } catch {
          // corrupt storage — reset
          setFavoriteIds([]);
        }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleFavorite = useCallback(
    async (id: string) => {
      setFavoriteIds((prev) => {
        const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
        // Persist asynchronously (fire-and-forget, state is already updated)
        storage.setItem(KEY, JSON.stringify(next));
        return next;
      });
    },
    [storage]
  );

  const isFavorite = useCallback(
    (id: string) => favoriteIds.includes(id),
    [favoriteIds]
  );

  return { favoriteIds, isFavorite, toggleFavorite };
}

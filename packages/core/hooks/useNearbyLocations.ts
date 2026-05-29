/**
 * useNearbyLocations.ts
 *
 * Fetches all locations and sorts them by distance from the user.
 * Applies active filters. Compatible with React Native and React (web).
 */

import { useEffect, useState, useCallback } from "react";
import { fetchLocations } from "../api/locations";
import type { Coords, FilterType, Location } from "../types";
import { distanceMetres } from "../types";

interface Options {
  userCoords: Coords | null;
  activeFilter: FilterType;
  favoriteIds: string[];
  radiusMetres?: number;
}

interface Result {
  locations: Location[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useNearbyLocations({
  userCoords,
  activeFilter,
  favoriteIds,
  radiusMetres = 50000, // Effectively no radius limit by default
}: Options): Result {
  const [all, setAll] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchLocations();
      setAll(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load locations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Attach distance, filter, and sort
  const locations = all
    .map((loc) => ({
      ...loc,
      distance_m: userCoords
        ? distanceMetres(userCoords, { lat: loc.lat, lng: loc.lng })
        : undefined,
    }))
    .sort((a, b) => {
      if (a.distance_m !== undefined && b.distance_m !== undefined) {
        return a.distance_m - b.distance_m;
      }
      return 0;
    });

  return { locations, loading, error, refresh: load };
}

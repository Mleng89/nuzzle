/**
 * useGeolocation.ts
 *
 * Web version — uses navigator.geolocation.
 * The React Native version uses expo-location instead
 * (see apps/mobile/hooks/useLocation.ts).
 */

import { useEffect, useState } from 'react';
import type { Coords } from '../types';

interface GeolocationResult {
  coords: Coords | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation(): GeolocationResult {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 }
    );

    return () => navigator.geolocation.clearWatch(id);
  }, []);

  return { coords, error, loading };
}

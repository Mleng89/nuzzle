/**
 * geocoding.ts
 *
 * Thin wrapper around the Google Maps Geocoding API.
 * Works in both React Native and Next.js (pure fetch, no Node APIs).
 *
 * Env var: EXPO_PUBLIC_GOOGLE_MAPS_API_KEY / NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
 */

import type { Coords } from '../types';

function mapsKey(): string {
  if (typeof process !== 'undefined' && process.env) {
    return (
      process.env['EXPO_PUBLIC_GOOGLE_MAPS_API_KEY'] ??
      process.env['NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'] ??
      ''
    );
  }
  return '';
}

export interface GeocodeResult {
  address: string;
  coords: Coords;
}

/**
 * Forward geocode: address string → lat/lng
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  const key = mapsKey();
  const encoded = encodeURIComponent(address);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&key=${key}`;

  const res = await fetch(url);
  const data = (await res.json()) as {
    status: string;
    results: Array<{
      formatted_address: string;
      geometry: { location: { lat: number; lng: number } };
    }>;
  };

  if (data.status !== 'OK' || !data.results.length) {
    throw new Error(`Geocoding failed: ${data.status}`);
  }

  const result = data.results[0];
  return {
    address: result.formatted_address,
    coords: {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
    },
  };
}

/**
 * Reverse geocode: lat/lng → human-readable address
 */
export async function reverseGeocode(coords: Coords): Promise<string> {
  const key = mapsKey();
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${coords.lng}&key=${key}`;

  const res = await fetch(url);
  const data = (await res.json()) as {
    status: string;
    results: Array<{ formatted_address: string }>;
  };

  if (data.status !== 'OK' || !data.results.length) {
    throw new Error(`Reverse geocoding failed: ${data.status}`);
  }

  return data.results[0].formatted_address;
}

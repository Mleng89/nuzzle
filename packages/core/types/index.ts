// ─── Amenity types ───────────────────────────────────────────────────────────

export type AmenityType =
  | 'private_room'
  | 'changing_table'
  | 'power_outlet'
  | 'sink'
  | 'comfortable_seating'
  | 'fridge'
  | 'free_access'
  | 'requires_purchase'
  | 'lockable_door'
  | 'wheelchair_accessible';

export const AMENITY_LABELS: Record<AmenityType, string> = {
  private_room: 'Private room',
  changing_table: 'Changing table',
  power_outlet: 'Power outlet',
  sink: 'Sink',
  comfortable_seating: 'Comfortable seating',
  fridge: 'Fridge access',
  free_access: 'Free access',
  requires_purchase: 'Requires purchase',
  lockable_door: 'Lockable door',
  wheelchair_accessible: 'Wheelchair accessible',
};

// ─── Location ────────────────────────────────────────────────────────────────

export interface Location {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  verified: boolean;
  amenities: AmenityType[];
  hours?: string;           // human-readable for MVP, e.g. "Mon–Sat 9am–9pm"
  notes?: string;
  submitted_at: string;     // ISO timestamp
  rating_avg: number | null;
  rating_count: number;
  distance_m?: number;      // populated client-side after geolocation
}

// ─── Filters ─────────────────────────────────────────────────────────────────

export type FilterType =
  | 'all'
  | 'favorites'
  | 'changing_table'
  | 'free_access'
  | 'private_room';

export const FILTER_LABELS: Record<FilterType, string> = {
  all: 'Nearby',
  favorites: 'Favorites',
  changing_table: 'Changing table',
  free_access: 'Free access',
  private_room: 'Private room',
};

// ─── Location submission ─────────────────────────────────────────────────────

export interface LocationSubmission {
  name: string;
  address: string;
  lat: number;
  lng: number;
  amenities: AmenityType[];
  hours?: string;
  notes?: string;
}

// ─── Geo ─────────────────────────────────────────────────────────────────────

export interface Coords {
  lat: number;
  lng: number;
}

export function distanceMetres(a: Coords, b: Coords): number {
  const R = 6_371_000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const aa =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
}

export function formatDistance(metres: number): string {
  if (metres < 1000) return `${Math.round(metres)} m`;
  return `${(metres / 1609.344).toFixed(1)} mi`;
}

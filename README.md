# Nuzzle 🤱

> Community-powered map of nursing lounges and baby changing facilities.

A TypeScript monorepo with a **React Native (Expo)** mobile app and a **Next.js** web app, sharing core business logic. No user accounts required — favorites are stored on-device.

---

## Stack

| Layer        | Technology                                                     |
| ------------ | -------------------------------------------------------------- |
| Mobile app   | Expo (React Native) + TypeScript                               |
| Web app      | Next.js 14 (App Router) + TypeScript                           |
| Shared logic | `packages/core` (hooks, API, types)                            |
| Map (mobile) | `react-native-maps` + Google Maps SDK                          |
| Map (web)    | `@vis.gl/react-google-maps`                                    |
| Backend / DB | Supabase (Postgres + PostGIS)                                  |
| Geocoding    | Google Maps Geocoding API                                      |
| Monorepo     | Turborepo + npm workspaces                                     |
| Favorites    | AsyncStorage (mobile) / localStorage (web) — no account needed |

---

## Project structure

```
nuzzle/
├── apps/
│   ├── mobile/                    ← Expo (iOS + Android)
│   │   ├── app/
│   │   │   ├── (tabs)/
│   │   │   │   ├── index.tsx      ← Map tab
│   │   │   │   ├── list.tsx       ← List tab
│   │   │   │   └── saved.tsx      ← Favorites tab
│   │   │   ├── location/[id].tsx  ← Location detail
│   │   │   └── add.tsx            ← Submit new location
│   │   └── app.json
│   │
│   └── web/                       ← Next.js
│       ├── app/
│       │   ├── layout.tsx
│       │   └── page.tsx           ← Map homepage
│       └── components/
│           ├── Header.tsx
│           ├── Sidebar.tsx        ← Search + filter + list
│           ├── MapView.tsx        ← Google Maps
│           └── AddLocationModal.tsx
│
├── packages/
│   └── core/                      ← Shared by both apps
│       ├── types/index.ts         ← Location, Amenity, Filter types
│       ├── api/
│       │   ├── locations.ts       ← Supabase CRUD
│       │   └── geocoding.ts       ← Google Maps Geocoding
│       └── hooks/
│           ├── useNearbyLocations.ts
│           ├── useFavorites.ts    ← Platform-agnostic (inject storage)
│           └── useGeolocation.ts  ← Web browser geolocation
│
└── supabase/
    ├── migrations/001_locations.sql
    └── seed.sql
```

---

## Getting started

### 1. Clone and install

```bash
git clone
cd nuzzle
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in the SQL editor:
   ```
   supabase/migrations/001_locations.sql
   ```
3. Optionally seed sample data:
   ```
   supabase/seed.sql
   ```
4. Copy your **Project URL** and **anon public key** from Project Settings → API

### 3. Set up Google Maps

Go to [console.cloud.google.com](https://console.cloud.google.com) and enable:

- Maps JavaScript API (web)
- Maps SDK for Android / iOS (mobile)
- Places API
- Geocoding API

### 4. Configure environment variables

**Web:**

```bash
cp apps/web/.env.example apps/web/.env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
```

**Mobile:**

```bash
cp apps/mobile/.env.example apps/mobile/.env
# Fill in EXPO_PUBLIC_ prefixed vars
# Also update app.json with your iOS/Android Google Maps keys
```

### 5. Run

```bash
# Web
cd apps/web && npm run dev
# → http://localhost:3000

# Mobile
cd apps/mobile && npm run dev
# → Scan QR with Expo Go app
```

---

## How favorites work (no user database)

Favorites are stored entirely on the user's device:

- **Mobile:** `AsyncStorage` from `@react-native-async-storage/async-storage`
- **Web:** `localStorage`

The `useFavorites` hook in `packages/core` accepts a `storage` adapter, so the same logic runs on both platforms. Only location IDs are stored — the full location data is fetched from Supabase when needed.

To add cross-device sync in the future: add Supabase Auth, store favorite IDs in a `user_favorites` table, and migrate the stored IDs on first sign-in.

---

## Data model

```typescript
interface Location {
  id: string; // UUID
  name: string;
  address: string;
  lat: number;
  lng: number;
  amenities: AmenityType[];
  hours?: string; // Human-readable, e.g. "Mon–Sat 9am–9pm"
  notes?: string;
  verified: boolean; // Moderated before going live
  rating_avg: number | null;
  rating_count: number;
  submitted_at: string;
  distance_m?: number; // Populated client-side after geolocation
}

type AmenityType =
  | "private_room"
  | "changing_table"
  | "power_outlet"
  | "sink"
  | "comfortable_seating"
  | "fridge"
  | "free_access"
  | "requires_purchase"
  | "lockable_door"
  | "wheelchair_accessible";
```

---

## Troubleshooting

Supabase RLS blocking inserts (submitLocation failed: 401)

If you see this error when submitting a new location, Row Level Security is blocking anonymous inserts. This is a known issue with how Supabase handles the `anon` role for insert policies.

Quick fix for development (recommended for MVP):

Go to the Supabase SQL Editor and run:
`ALTER TABLE locations DISABLE ROW LEVEL SECURITY;`

This disables RLS entirely. All reads and writes will work without restriction. Fine for development and early testing.

Before going to production, re-enable RLS with:

```sql
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read verified locations
CREATE POLICY "public read verified locations"
  ON locations FOR SELECT
  USING (verified = true);

-- Allow anyone to submit (lands as unverified, reviewed manually)
CREATE POLICY "public submit locations"
  ON locations FOR INSERT
  TO anon, authenticated, public
  WITH CHECK (true);

GRANT INSERT ON locations TO anon;
GRANT INSERT ON locations TO public;
```

What "submitted for review" means:
Submitted locations are saved to the database with `verified = false`. They won't appear publicly on the map until you manually approve them. To approve a submission:

1. Go to Supabase Table Editor → locations
2. Find the row with verified = false
3. Click the cell and change it to true
4. Save

A proper moderation dashboard is on the roadmap.

---

## Roadmap

- [ ] Ratings & reviews
- [ ] Photo uploads (Supabase Storage)
- [ ] Push notifications for new rooms near saved areas
- [ ] Moderation dashboard for location submissions
- [ ] Cross-device favorites sync (opt-in, with Supabase Auth)
- [ ] Offline support / cached locations
- [ ] Accessibility improvements (screen reader full support)
- [ ] Community reporting / flagging inaccurate listings

---

## Contributing

Community submissions are the heart of Nuzzle. All submitted locations land with `verified = false` and are reviewed before going live on the map.

MIT License

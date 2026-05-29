-- 001_locations.sql
-- Run via: supabase db push
-- Or paste into the Supabase SQL editor.

-- Enable the PostGIS extension (available on all Supabase projects)
CREATE EXTENSION IF NOT EXISTS postgis;

-- ─── Locations table ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS locations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic info
  name          TEXT        NOT NULL,
  address       TEXT        NOT NULL,
  lat           DOUBLE PRECISION NOT NULL,
  lng           DOUBLE PRECISION NOT NULL,

  -- PostGIS point (populated by trigger for spatial queries)
  geom          GEOGRAPHY(POINT, 4326),

  -- Amenities stored as a Postgres text array
  -- e.g. {'private_room','changing_table','power_outlet'}
  amenities     TEXT[]      NOT NULL DEFAULT '{}',

  -- Optional metadata
  hours         TEXT,
  notes         TEXT,

  -- Community moderation
  verified      BOOLEAN     NOT NULL DEFAULT FALSE,

  -- Ratings (updated by a separate ratings table trigger in future)
  rating_avg    NUMERIC(3,2),
  rating_count  INTEGER     NOT NULL DEFAULT 0,

  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Auto-populate geom from lat/lng ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION locations_set_geom()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geom := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::GEOGRAPHY;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_locations_geom
BEFORE INSERT OR UPDATE OF lat, lng ON locations
FOR EACH ROW EXECUTE FUNCTION locations_set_geom();

-- ─── Spatial index ───────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_locations_geom ON locations USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_locations_verified ON locations (verified);

-- ─── Row Level Security ──────────────────────────────────────────────────────
-- Anyone can read verified locations. Only the service role can insert/update.

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read verified locations"
  ON locations FOR SELECT
  USING (verified = TRUE);

CREATE POLICY "public submit locations"
  ON locations FOR INSERT
  WITH CHECK (verified = FALSE);  -- New submissions always land unverified

-- ─── Helpful view: locations with distance from a point ──────────────────────
-- Usage (from app): SELECT * FROM nearby_locations('POINT(-73.98 40.75)', 2000)

CREATE OR REPLACE FUNCTION nearby_locations(
  origin  GEOGRAPHY,
  radius  DOUBLE PRECISION DEFAULT 5000   -- metres
)
RETURNS TABLE (
  id            UUID,
  name          TEXT,
  address       TEXT,
  lat           DOUBLE PRECISION,
  lng           DOUBLE PRECISION,
  amenities     TEXT[],
  hours         TEXT,
  notes         TEXT,
  verified      BOOLEAN,
  rating_avg    NUMERIC(3,2),
  rating_count  INTEGER,
  submitted_at  TIMESTAMPTZ,
  distance_m    DOUBLE PRECISION
) AS $$
  SELECT
    l.id, l.name, l.address, l.lat, l.lng,
    l.amenities, l.hours, l.notes, l.verified,
    l.rating_avg, l.rating_count, l.submitted_at,
    ST_Distance(l.geom, origin) AS distance_m
  FROM locations l
  WHERE
    l.verified = TRUE
    AND ST_DWithin(l.geom, origin, radius)
  ORDER BY distance_m ASC;
$$ LANGUAGE sql STABLE;

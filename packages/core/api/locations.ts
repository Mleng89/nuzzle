/**
 * locations.ts
 *
 * All Supabase calls for the locations resource.
 * Uses the REST API directly so this file is usable in both
 * React Native (no Node APIs) and Next.js without any adapter.
 *
 * Environment variables required:
 *   EXPO_PUBLIC_SUPABASE_URL  (mobile)
 *   NEXT_PUBLIC_SUPABASE_URL  (web)
 *   EXPO_PUBLIC_SUPABASE_ANON_KEY
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

import type { Location, LocationSubmission } from "../types";

function getSupabaseUrl(): string {
  return (
    (typeof process !== "undefined" &&
      (process.env["NEXT_PUBLIC_SUPABASE_URL"] ||
        process.env["EXPO_PUBLIC_SUPABASE_URL"])) ||
    ""
  );
}

function getSupabaseKey(): string {
  return (
    (typeof process !== "undefined" &&
      (process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] ||
        process.env["EXPO_PUBLIC_SUPABASE_ANON_KEY"])) ||
    ""
  );
}

async function supabaseFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const url = `${getSupabaseUrl()}${path}`;
  const key = getSupabaseKey();
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: "return=representation",
      ...options.headers,
    },
  });
}

export async function fetchLocations(): Promise<Location[]> {
  const res = await supabaseFetch(
    "/rest/v1/locations?select=*&order=submitted_at.desc",
  );
  if (!res.ok) throw new Error(`fetchLocations failed: ${res.status}`);
  return res.json() as Promise<Location[]>;
}

export async function fetchLocation(id: string): Promise<Location> {
  const res = await supabaseFetch(
    `/rest/v1/locations?id=eq.${id}&select=*&limit=1`,
  );
  if (!res.ok) throw new Error(`fetchLocation failed: ${res.status}`);
  const rows = (await res.json()) as Location[];
  if (!rows.length) throw new Error("Location not found");
  return rows[0];
}

export async function submitLocation(
  payload: LocationSubmission,
): Promise<{ id: string }> {
  const res = await supabaseFetch("/rest/v1/locations", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      verified: false,
      rating_avg: null,
      rating_count: 0,
      submitted_at: new Date().toISOString(),
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(
      `submitLocation failed: ${res.status} — ${JSON.stringify(err)}`,
    );
  }
  const rows = (await res.json()) as { id: string }[];
  return rows[0];
}

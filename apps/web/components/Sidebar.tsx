"use client";

import { useState } from "react";
import type { FilterType, Location } from "@nuzzle/core";
import { FILTER_LABELS, AMENITY_LABELS, formatDistance } from "@nuzzle/core";
import styles from "./Sidebar.module.css";

const ALL_FILTERS: FilterType[] = [
  "all",
  "favorites",
  "changing_table",
  "free_access",
  "private_room",
];

const AMENITY_ICONS: Record<string, string> = {
  private_room: "🚪",
  changing_table: "👶",
  power_outlet: "🔌",
  sink: "💧",
  comfortable_seating: "🛋️",
  fridge: "❄️",
  free_access: "✅",
  requires_purchase: "🛍️",
  lockable_door: "🔒",
  wheelchair_accessible: "♿",
};

interface Props {
  locations: Location[];
  loading: boolean;
  activeFilter: FilterType;
  onFilterChange: (f: FilterType) => void;
  selectedLocation: Location | null;
  onSelectLocation: (loc: Location | null) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
}

export default function Sidebar({
  locations,
  loading,
  activeFilter,
  onFilterChange,
  selectedLocation,
  onSelectLocation,
  isFavorite,
  onToggleFavorite,
}: Props) {
  const [query, setQuery] = useState("");

  const visible = query.trim()
    ? locations.filter(
        (l) =>
          l.name.toLowerCase().includes(query.toLowerCase()) ||
          l.address.toLowerCase().includes(query.toLowerCase()),
      )
    : locations;

  return (
    <aside className={styles.sidebar}>
      {/* Search */}
      <div className={styles.searchWrap}>
        <svg
          className={styles.searchIcon}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M11 11l3 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <input
          className={styles.search}
          type="search"
          placeholder="Search venues…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search locations"
        />
      </div>

      {/* Filter chips */}
      <div
        className={styles.filters}
        role="group"
        aria-label="Filter locations"
      >
        {ALL_FILTERS.map((f) => (
          <button
            key={f}
            className={`${styles.chip} ${activeFilter === f ? styles.chipActive : ""}`}
            onClick={() => onFilterChange(f)}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Count */}
      <div className={styles.meta}>
        {loading
          ? "Loading…"
          : `${visible.length} location${visible.length !== 1 ? "s" : ""}`}
      </div>

      {/* List */}
      <ul className={styles.list} aria-label="Nearby nursing locations">
        {visible.map((loc) => (
          <li key={loc.id}>
            <button
              className={`${styles.card} ${selectedLocation?.id === loc.id ? styles.cardActive : ""}`}
              onClick={() =>
                onSelectLocation(loc.id === selectedLocation?.id ? null : loc)
              }
              aria-pressed={selectedLocation?.id === loc.id}
            >
              <div className={styles.cardTop}>
                <span className={styles.cardName}>{loc.name}</span>
                <div className={styles.cardRight}>
                  {loc.distance_m !== undefined && (
                    <span className={styles.dist}>
                      {formatDistance(loc.distance_m)}
                    </span>
                  )}
                  <button
                    className={`${styles.fav} ${isFavorite(loc.id) ? styles.favActive : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(loc.id);
                    }}
                    aria-label={
                      isFavorite(loc.id)
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    {isFavorite(loc.id) ? "♥" : "♡"}
                  </button>
                </div>
              </div>

              <p className={styles.address}>{loc.address}</p>

              {/* Amenity tags */}
              {loc.amenities.length > 0 && (
                <div className={styles.tags}>
                  {loc.amenities.slice(0, 4).map((a) => (
                    <span key={a} className={styles.tag}>
                      {AMENITY_ICONS[a] ?? "•"}{" "}
                      {AMENITY_LABELS[a as keyof typeof AMENITY_LABELS] ?? a}
                    </span>
                  ))}
                  {loc.amenities.length > 4 && (
                    <span className={styles.tagMore}>
                      +{loc.amenities.length - 4}
                    </span>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className={styles.cardFoot}>
                {loc.hours && (
                  <span className={styles.hours}>🕐 {loc.hours}</span>
                )}
                {loc.rating_avg && (
                  <span className={styles.rating}>
                    ★ {loc.rating_avg} ({loc.rating_count})
                  </span>
                )}
              </div>
            </button>
          </li>
        ))}

        {!loading && visible.length === 0 && (
          <li className={styles.empty}>
            <p>No locations found.</p>
            <p>Be the first to add one!</p>
          </li>
        )}
      </ul>
    </aside>
  );
}

"use client";

import {
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps";
import { useEffect } from "react";
import type { Coords, Location } from "@nuzzle/core";
import { AMENITY_LABELS, formatDistance } from "@nuzzle/core";
import styles from "./MapView.module.css";

const AMENITY_ICONS: Record<string, string> = {
  private_room: "🚪",
  changing_table: "👶",
  power_outlet: "🔌",
  sink: "💧",
  comfortable_seating: "🛋️",
  fridge: "❄️",
  free_access: "✅",
  requires_purchase: "🛍️",
};

interface Props {
  locations: Location[];
  userCoords: Coords | null;
  selectedLocation: Location | null;
  onSelectLocation: (loc: Location | null) => void;
  onAdd: () => void;
}

// Default center: NYC
const DEFAULT_CENTER = { lat: 40.7549, lng: -73.984 };

function MapPanner({
  target,
}: {
  target: { lat: number; lng: number } | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (map && target) map.panTo(target);
  }, [map, target]);
  return null;
}

export default function MapView({
  locations,
  userCoords,
  selectedLocation,
  onSelectLocation,
  onAdd,
}: Props) {
  const center = userCoords ?? DEFAULT_CENTER;

  return (
    <div className={styles.wrap}>
      <Map
        mapId="nurture-spot-map"
        defaultCenter={center}
        defaultZoom={14}
        gestureHandling="greedy"
        disableDefaultUI={false}
        mapTypeControl={false}
        streetViewControl={false}
        fullscreenControl={false}
        style={{ width: "100%", height: "100%" }}
      >
        <MapPanner
          target={
            selectedLocation
              ? { lat: selectedLocation.lat, lng: selectedLocation.lng }
              : null
          }
        />

        {/* User location dot */}
        {userCoords && (
          <AdvancedMarker position={userCoords} title="Your location">
            <div className={styles.userDot} aria-label="Your location" />
          </AdvancedMarker>
        )}

        {/* Nursing room pins */}
        {locations.map((loc) => (
          <AdvancedMarker
            key={loc.id}
            position={{ lat: loc.lat, lng: loc.lng }}
            onClick={() =>
              onSelectLocation(loc.id === selectedLocation?.id ? null : loc)
            }
            title={loc.name}
          >
            <Pin
              background={
                loc.id === selectedLocation?.id ? "#3d7a35" : "#6aaa60"
              }
              borderColor={
                loc.id === selectedLocation?.id ? "#234820" : "#3d7a35"
              }
              glyphColor="white"
              scale={loc.id === selectedLocation?.id ? 1.3 : 1}
            />
          </AdvancedMarker>
        ))}

        {/* Info window for selected location */}
        {selectedLocation && (
          <InfoWindow
            position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
            onCloseClick={() => onSelectLocation(null)}
            pixelOffset={[0, -48]}
          >
            <div className={styles.infoWindow}>
              <p className={styles.iwName}>{selectedLocation.name}</p>
              <p className={styles.iwAddr}>{selectedLocation.address}</p>
              {selectedLocation.distance_m !== undefined && (
                <p className={styles.iwDist}>
                  {formatDistance(selectedLocation.distance_m)} away
                </p>
              )}
              <div className={styles.iwTags}>
                {selectedLocation.amenities.slice(0, 3).map((a) => (
                  <span key={a} className={styles.iwTag}>
                    {AMENITY_ICONS[a] ?? "•"}{" "}
                    {AMENITY_LABELS[a as keyof typeof AMENITY_LABELS] ?? a}
                  </span>
                ))}
              </div>
              {selectedLocation.hours && (
                <p className={styles.iwHours}>🕐 {selectedLocation.hours}</p>
              )}
              {selectedLocation.notes && (
                <p className={styles.iwNotes}>{selectedLocation.notes}</p>
              )}
            </div>
          </InfoWindow>
        )}
      </Map>

      {/* FAB to add location */}
      <button
        className={styles.fab}
        onClick={onAdd}
        aria-label="Add a nursing room location"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M10 4v12M4 10h12"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        Add location
      </button>
    </div>
  );
}

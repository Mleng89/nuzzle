"use client";

import { useState } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import MapView from "../components/MapView";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import AddLocationModal from "../components/AddLocationModal";
import { useGeolocation, useFavorites, useNearbyLocations } from "@nuzzle/core";
import type { FilterType, Location } from "@nuzzle-spot/core";
import styles from "./page.module.css";

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const [showAddModal, setShowAddModal] = useState(false);

  const { coords } = useGeolocation();
  const { favoriteIds, toggleFavorite, isFavorite } = useFavorites();
  const { locations, loading, refresh } = useNearbyLocations({
    userCoords: coords,
    activeFilter,
    favoriteIds,
  });
  // console.log("SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  // console.log(
  //   "GOOGLE MAPS API KEY:",
  //   process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  // );
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""}>
      <div className={styles.shell}>
        <Header onAdd={() => setShowAddModal(true)} />

        <div className={styles.body}>
          <Sidebar
            locations={locations}
            loading={loading}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            selectedLocation={selectedLocation}
            onSelectLocation={setSelectedLocation}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
          />

          <MapView
            locations={locations}
            userCoords={coords}
            selectedLocation={selectedLocation}
            onSelectLocation={setSelectedLocation}
            onAdd={() => setShowAddModal(true)}
          />
        </div>

        {showAddModal && (
          <AddLocationModal
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false);
              refresh();
            }}
          />
        )}
      </div>
    </APIProvider>
  );
}

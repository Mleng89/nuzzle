import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Pressable,
} from "react-native";
import MapView, { Marker, Callout, Region } from "react-native-maps";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import {
  useFavorites,
  useNearbyLocations,
  FILTER_LABELS,
  formatDistance,
} from "@nuzzle/core";
import type { FilterType, Location as NLocation } from "@nuzzle/core";

const FILTERS: FilterType[] = [
  "all",
  "changing_table",
  "free_access",
  "private_room",
];

const DEFAULT_REGION: Region = {
  latitude: 40.7549,
  longitude: -73.984,
  latitudeDelta: 0.03,
  longitudeDelta: 0.03,
};

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [selected, setSelected] = useState<NLocation | null>(null);

  const { favoriteIds, toggleFavorite, isFavorite } = useFavorites({
    storage: AsyncStorage,
  });
  const { locations } = useNearbyLocations({
    userCoords,
    activeFilter,
    favoriteIds,
  });

  // Request location permission
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      mapRef.current?.animateToRegion(
        {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.025,
          longitudeDelta: 0.025,
        },
        600,
      );
    })();
  }, []);

  const handleMarkerPress = (loc: NLocation) => {
    setSelected(loc);
    mapRef.current?.animateToRegion(
      {
        latitude: loc.lat,
        longitude: loc.lng,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      },
      400,
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.wordmark}>Nuzzle</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push("/add")}
          accessibilityLabel="Add a nursing room"
        >
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, activeFilter === f && styles.chipActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text
              style={[
                styles.chipText,
                activeFilter === f && styles.chipTextActive,
              ]}
            >
              {FILTER_LABELS[f]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Map */}
      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          initialRegion={DEFAULT_REGION}
          showsUserLocation
          showsMyLocationButton={false}
        >
          {locations.map((loc) => (
            <Marker
              key={loc.id}
              coordinate={{ latitude: loc.lat, longitude: loc.lng }}
              pinColor={selected?.id === loc.id ? "#234820" : "#6aaa60"}
              onPress={() => handleMarkerPress(loc)}
            >
              <Callout tooltip={false}>
                <View style={styles.callout}>
                  <Text style={styles.calloutName}>{loc.name}</Text>
                  <Text style={styles.calloutAddr}>{loc.address}</Text>
                  <TouchableOpacity
                    style={styles.calloutBtn}
                    onPress={() => router.push(`/location/${loc.id}`)}
                  >
                    <Text style={styles.calloutBtnText}>View details →</Text>
                  </TouchableOpacity>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>

        {/* Selected card overlay */}
        {selected && (
          <View style={styles.selectedCard}>
            <View style={styles.selectedCardTop}>
              <Text style={styles.selectedName} numberOfLines={1}>
                {selected.name}
              </Text>
              <TouchableOpacity
                onPress={() => toggleFavorite(selected.id)}
                accessibilityLabel={
                  isFavorite(selected.id)
                    ? "Remove from favorites"
                    : "Add to favorites"
                }
              >
                <Text
                  style={[
                    styles.favIcon,
                    isFavorite(selected.id) && styles.favActive,
                  ]}
                >
                  {isFavorite(selected.id) ? "♥" : "♡"}
                </Text>
              </TouchableOpacity>
            </View>
            {selected.distance_m !== undefined && (
              <Text style={styles.selectedDist}>
                {formatDistance(selected.distance_m)} away
              </Text>
            )}
            <TouchableOpacity
              style={styles.detailBtn}
              onPress={() => router.push(`/location/${selected.id}`)}
            >
              <Text style={styles.detailBtnText}>View details</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fdfaf4" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(30,30,20,0.08)",
  },
  wordmark: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a18",
    letterSpacing: -0.5,
  },
  addBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    backgroundColor: "#3d7a35",
    borderRadius: 100,
  },
  addBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  filterRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(30,30,20,0.15)",
    backgroundColor: "#fff",
  },
  chipActive: { backgroundColor: "#3d7a35", borderColor: "#3d7a35" },
  chipText: { fontSize: 13, color: "#4a4a44" },
  chipTextActive: { color: "#fff" },
  mapWrap: { flex: 1 },
  callout: {
    padding: 12,
    minWidth: 200,
    maxWidth: 260,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  calloutName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a18",
    marginBottom: 2,
  },
  calloutAddr: { fontSize: 12, color: "#888880", marginBottom: 8 },
  calloutBtn: { alignSelf: "flex-start" },
  calloutBtnText: { fontSize: 13, color: "#3d7a35", fontWeight: "600" },
  selectedCard: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: "#fdfaf4",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(30,30,20,0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  selectedCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  selectedName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a18",
    flex: 1,
    marginRight: 8,
  },
  selectedDist: { fontSize: 13, color: "#3d7a35", marginBottom: 12 },
  favIcon: { fontSize: 22, color: "rgba(30,30,20,0.2)" },
  favActive: { color: "#d4537e" },
  detailBtn: {
    backgroundColor: "#3d7a35",
    paddingVertical: 10,
    borderRadius: 100,
    alignItems: "center",
  },
  detailBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});

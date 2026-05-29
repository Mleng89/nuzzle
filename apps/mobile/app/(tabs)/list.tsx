import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import {
  useFavorites,
  useNearbyLocations,
  useGeolocation,
  AMENITY_LABELS,
  FILTER_LABELS,
  formatDistance,
} from "@nuzzle/core";
import type { FilterType, Location } from "@nuzzle/core";

const FILTERS: FilterType[] = [
  "all",
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
};

export default function ListScreen() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const { coords } = useGeolocation();
  const { favoriteIds, toggleFavorite, isFavorite } = useFavorites({
    storage: AsyncStorage,
  });
  const { locations, loading } = useNearbyLocations({
    userCoords: coords,
    activeFilter,
    favoriteIds,
  });

  const visible = query.trim()
    ? locations.filter(
        (l) =>
          l.name.toLowerCase().includes(query.toLowerCase()) ||
          l.address.toLowerCase().includes(query.toLowerCase()),
      )
    : locations;

  const renderItem = ({ item: loc }: { item: Location }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/location/${loc.id}`)}
      accessibilityLabel={`${loc.name}, ${loc.address}`}
    >
      <View style={styles.cardTop}>
        <Text style={styles.cardName} numberOfLines={2}>
          {loc.name}
        </Text>
        <TouchableOpacity
          onPress={() => toggleFavorite(loc.id)}
          accessibilityLabel={
            isFavorite(loc.id) ? "Remove from favorites" : "Save"
          }
        >
          <Text style={[styles.fav, isFavorite(loc.id) && styles.favActive]}>
            {isFavorite(loc.id) ? "♥" : "♡"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.addr} numberOfLines={1}>
        {loc.address}
      </Text>

      {loc.distance_m !== undefined && (
        <Text style={styles.dist}>{formatDistance(loc.distance_m)} away</Text>
      )}

      <View style={styles.tags}>
        {loc.amenities.slice(0, 3).map((a) => (
          <View key={a} style={styles.tag}>
            <Text style={styles.tagText}>
              {AMENITY_ICONS[a] ?? "•"}{" "}
              {AMENITY_LABELS[a as keyof typeof AMENITY_LABELS] ?? a}
            </Text>
          </View>
        ))}
      </View>

      {loc.rating_avg && (
        <Text style={styles.rating}>
          ★ {loc.rating_avg} ({loc.rating_count} reviews)
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Nearby rooms</Text>
        <Text style={styles.count}>{visible.length} found</Text>
      </View>

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.search}
          placeholder="Search venues…"
          value={query}
          onChangeText={setQuery}
          placeholderTextColor="#888880"
          returnKeyType="search"
        />
      </View>

      <View style={styles.filterRow}>
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={(f) => f}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item: f }) => (
            <TouchableOpacity
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
          )}
        />
      </View>

      <FlatList
        data={visible}
        keyExtractor={(l) => l.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          loading ? (
            <Text style={styles.empty}>Loading…</Text>
          ) : (
            <Text style={styles.empty}>No locations found.</Text>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fdfaf4" },
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a18",
    letterSpacing: -0.5,
  },
  count: { fontSize: 13, color: "#888880" },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    margin: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(30,30,20,0.15)",
    gap: 8,
  },
  searchIcon: { fontSize: 14 },
  search: { flex: 1, fontSize: 14, color: "#1a1a18" },
  filterRow: { paddingLeft: 12, paddingBottom: 8 },
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
  list: { padding: 12, gap: 10 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(30,30,20,0.08)",
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 3,
  },
  cardName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a18",
    flex: 1,
    marginRight: 8,
  },
  addr: { fontSize: 12, color: "#888880", marginBottom: 3 },
  dist: { fontSize: 12, color: "#3d7a35", fontWeight: "500", marginBottom: 8 },
  fav: { fontSize: 21, color: "rgba(30,30,20,0.2)" },
  favActive: { color: "#d4537e" },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginBottom: 6 },
  tag: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    backgroundColor: "#f0f5ef",
    borderRadius: 100,
  },
  tagText: { fontSize: 11, color: "#3d7a35", fontWeight: "500" },
  rating: { fontSize: 12, color: "#4a4a44" },
  empty: { textAlign: "center", color: "#888880", marginTop: 60, fontSize: 15 },
});

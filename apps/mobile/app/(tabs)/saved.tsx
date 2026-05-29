import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import {
  useFavorites,
  useNearbyLocations,
  formatDistance,
  AMENITY_LABELS,
} from "@nuzzle/core";
import type { Location } from "@nuzzle/core";

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

export default function SavedScreen() {
  const { favoriteIds, toggleFavorite } = useFavorites({
    storage: AsyncStorage,
  });
  const { locations } = useNearbyLocations({
    userCoords: null,
    activeFilter: "favorites",
    favoriteIds,
    radiusMetres: Infinity,
  });

  const renderItem = ({ item: loc }: { item: Location }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/location/${loc.id}`)}
    >
      <View style={styles.cardTop}>
        <Text style={styles.cardName} numberOfLines={2}>
          {loc.name}
        </Text>
        <TouchableOpacity
          onPress={() => toggleFavorite(loc.id)}
          accessibilityLabel="Remove from saved"
        >
          <Text style={styles.favIcon}>♥</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.addr}>{loc.address}</Text>
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
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved places</Text>
        <Text style={styles.count}>{favoriteIds.length} saved</Text>
      </View>

      <FlatList
        data={locations}
        keyExtractor={(l) => l.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>♡</Text>
            <Text style={styles.emptyTitle}>No saved places yet</Text>
            <Text style={styles.emptySub}>
              Tap the heart on any location to save it here for quick access.
            </Text>
          </View>
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
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a18",
    letterSpacing: -0.5,
  },
  count: { fontSize: 13, color: "#888880" },
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
    marginBottom: 4,
  },
  cardName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a18",
    flex: 1,
    marginRight: 8,
  },
  favIcon: { fontSize: 21, color: "#d4537e" },
  addr: { fontSize: 12, color: "#888880", marginBottom: 8 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  tag: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    backgroundColor: "#f0f5ef",
    borderRadius: 100,
  },
  tagText: { fontSize: 11, color: "#3d7a35", fontWeight: "500" },
  emptyWrap: { alignItems: "center", paddingTop: 80, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12, opacity: 0.3 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a18",
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: "#888880",
    textAlign: "center",
    lineHeight: 21,
  },
});

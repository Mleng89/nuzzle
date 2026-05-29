import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, router } from "expo-router";
import {
  fetchLocation,
  useFavorites,
  AMENITY_LABELS,
  formatDistance,
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
  lockable_door: "🔒",
  wheelchair_accessible: "♿",
};

export default function LocationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);

  const { isFavorite, toggleFavorite } = useFavorites({
    storage: AsyncStorage,
  });

  useEffect(() => {
    if (!id) return;
    fetchLocation(id)
      .then(setLocation)
      .catch(() => Alert.alert("Error", "Could not load location details."))
      .finally(() => setLoading(false));
  }, [id]);

  const openMaps = () => {
    if (!location) return;
    const encoded = encodeURIComponent(location.address);
    const url = `https://maps.apple.com/?q=${encoded}&sll=${location.lat},${location.lng}`;
    Linking.openURL(url);
  };

  if (loading || !location) {
    return (
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.loadingText}>
          {loading ? "Loading…" : "Location not found."}
        </Text>
      </SafeAreaView>
    );
  }

  const fav = isFavorite(location.id);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => toggleFavorite(location.id)}
          style={styles.favBtn}
          accessibilityLabel={fav ? "Remove from saved" : "Save this location"}
        >
          <Text style={[styles.favIcon, fav && styles.favActive]}>
            {fav ? "♥" : "♡"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroIcon}>🤱</Text>
        </View>

        {/* Info */}
        <View style={styles.body}>
          <Text style={styles.name}>{location.name}</Text>
          <Text style={styles.address}>{location.address}</Text>

          {location.distance_m !== undefined && (
            <Text style={styles.dist}>
              {formatDistance(location.distance_m)} away
            </Text>
          )}

          {location.rating_avg && (
            <View style={styles.ratingRow}>
              <Text style={styles.stars}>★ {location.rating_avg}</Text>
              <Text style={styles.ratingCount}>
                ({location.rating_count} reviews)
              </Text>
            </View>
          )}

          {/* Amenities */}
          <Text style={styles.sectionLabel}>What's available</Text>
          <View style={styles.amenityGrid}>
            {location.amenities.map((a) => (
              <View key={a} style={styles.amenityChip}>
                <Text style={styles.amenityIcon}>
                  {AMENITY_ICONS[a] ?? "•"}
                </Text>
                <Text style={styles.amenityLabel}>
                  {AMENITY_LABELS[a as keyof typeof AMENITY_LABELS] ?? a}
                </Text>
              </View>
            ))}
          </View>

          {/* Hours */}
          {location.hours && (
            <>
              <Text style={styles.sectionLabel}>Opening hours</Text>
              <Text style={styles.hours}>{location.hours}</Text>
            </>
          )}

          {/* Notes */}
          {location.notes && (
            <>
              <Text style={styles.sectionLabel}>Parent notes</Text>
              <View style={styles.notesBox}>
                <Text style={styles.notes}>{location.notes}</Text>
              </View>
            </>
          )}

          {/* Actions */}
          <TouchableOpacity style={styles.directionsBtn} onPress={openMaps}>
            <Text style={styles.directionsBtnText}>🧭 Get directions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.suggestBtn}
            onPress={() =>
              Alert.alert(
                "Suggest an edit",
                "Coming soon! Thank you for helping keep NurtureSpot accurate.",
              )
            }
          >
            <Text style={styles.suggestBtnText}>✏️ Suggest an edit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fdfaf4" },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(30,30,20,0.08)",
  },
  backBtn: { paddingVertical: 4 },
  backText: { fontSize: 15, color: "#3d7a35", fontWeight: "600" },
  favBtn: { padding: 4 },
  favIcon: { fontSize: 26, color: "rgba(30,30,20,0.2)" },
  favActive: { color: "#d4537e" },
  scroll: { paddingBottom: 40 },
  hero: {
    height: 160,
    backgroundColor: "#f0f5ef",
    alignItems: "center",
    justifyContent: "center",
  },
  heroIcon: { fontSize: 64 },
  body: { padding: 20 },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a18",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  address: { fontSize: 13, color: "#888880", marginBottom: 4 },
  dist: { fontSize: 14, color: "#3d7a35", fontWeight: "600", marginBottom: 10 },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },
  stars: { fontSize: 15, fontWeight: "700", color: "#1a1a18" },
  ratingCount: { fontSize: 13, color: "#888880" },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#888880",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 20,
  },
  amenityGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  amenityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(30,30,20,0.1)",
  },
  amenityIcon: { fontSize: 15 },
  amenityLabel: { fontSize: 12, color: "#1a1a18" },
  hours: { fontSize: 14, color: "#4a4a44", lineHeight: 22 },
  notesBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(30,30,20,0.08)",
  },
  notes: {
    fontSize: 14,
    color: "#4a4a44",
    lineHeight: 22,
    fontStyle: "italic",
  },
  directionsBtn: {
    marginTop: 24,
    backgroundColor: "#3d7a35",
    paddingVertical: 14,
    borderRadius: 100,
    alignItems: "center",
  },
  directionsBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  suggestBtn: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(30,30,20,0.15)",
    paddingVertical: 13,
    borderRadius: 100,
    alignItems: "center",
  },
  suggestBtnText: { color: "#4a4a44", fontSize: 14, fontWeight: "500" },
  loadingText: {
    textAlign: "center",
    color: "#888880",
    marginTop: 60,
    fontSize: 15,
  },
});

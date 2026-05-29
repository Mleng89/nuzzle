import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { submitLocation, geocodeAddress } from "@nuzzle/core";
import type { AmenityType } from "@nuzzle/core";

const AMENITY_OPTIONS: { value: AmenityType; label: string; icon: string }[] = [
  { value: "private_room", label: "Private room", icon: "🚪" },
  { value: "changing_table", label: "Changing table", icon: "👶" },
  { value: "power_outlet", label: "Power outlet", icon: "🔌" },
  { value: "sink", label: "Sink", icon: "💧" },
  { value: "comfortable_seating", label: "Comfortable seating", icon: "🛋️" },
  { value: "fridge", label: "Fridge access", icon: "❄️" },
  { value: "free_access", label: "Free access", icon: "✅" },
  { value: "requires_purchase", label: "Requires purchase", icon: "🛍️" },
  { value: "lockable_door", label: "Lockable door", icon: "🔒" },
  {
    value: "wheelchair_accessible",
    label: "Wheelchair accessible",
    icon: "♿",
  },
];

type Step = "form" | "submitting" | "success";

export default function AddScreen() {
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [amenities, setAmenities] = useState<AmenityType[]>([]);
  const [hours, setHours] = useState("");
  const [notes, setNotes] = useState("");

  const toggle = (a: AmenityType) => {
    setAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
    );
  };

  const handleSubmit = async () => {
    if (!name.trim() || !address.trim()) {
      Alert.alert(
        "Missing fields",
        "Please fill in the venue name and address.",
      );
      return;
    }
    setStep("submitting");
    try {
      const geo = await geocodeAddress(address.trim());
      await submitLocation({
        name: name.trim(),
        address: geo.address,
        lat: geo.coords.lat,
        lng: geo.coords.lng,
        amenities,
        hours: hours.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setStep("success");
    } catch (e) {
      setStep("form");
      Alert.alert(
        "Submission failed",
        e instanceof Error ? e.message : "Please try again.",
      );
    }
  };

  if (step === "success") {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successWrap}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.successTitle}>Thank you!</Text>
          <Text style={styles.successSub}>
            Your submission will appear on the map once it's verified by our
            team.
          </Text>
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={() => router.replace("/(tabs)/")}
          >
            <Text style={styles.submitBtnText}>Back to map</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Add a location</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={step === "submitting"}
        >
          <Text
            style={[
              styles.submitText,
              step === "submitting" && styles.submitDisabled,
            ]}
          >
            {step === "submitting" ? "Saving…" : "Submit"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionLabel}>Basic info</Text>

        <TextInput
          style={styles.input}
          placeholder="Venue name *"
          placeholderTextColor="#888880"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Full address *"
          placeholderTextColor="#888880"
          value={address}
          onChangeText={setAddress}
        />
        <TextInput
          style={styles.input}
          placeholder="Opening hours (e.g. Mon–Sat 9am–9pm)"
          placeholderTextColor="#888880"
          value={hours}
          onChangeText={setHours}
        />

        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Amenities</Text>
        <View style={styles.amenityGrid}>
          {AMENITY_OPTIONS.map((opt) => {
            const on = amenities.includes(opt.value);
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.amenityChip, on && styles.amenityChipOn]}
                onPress={() => toggle(opt.value)}
                accessibilityState={{ selected: on }}
              >
                <Text style={styles.amenityIcon}>{opt.icon}</Text>
                <Text
                  style={[styles.amenityLabel, on && styles.amenityLabelOn]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>
          Notes for parents
        </Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Floor, access instructions, cleanliness, anything helpful…"
          placeholderTextColor="#888880"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Text style={styles.disclaimer}>
          Submissions are reviewed before going live. Thank you for helping
          parents everywhere! 🙏
        </Text>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(30,30,20,0.08)",
  },
  cancel: { fontSize: 15, color: "#4a4a44" },
  screenTitle: { fontSize: 16, fontWeight: "600", color: "#1a1a18" },
  submitText: { fontSize: 15, color: "#3d7a35", fontWeight: "700" },
  submitDisabled: { opacity: 0.4 },
  scroll: { padding: 16, paddingBottom: 40 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#888880",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(30,30,20,0.12)",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1a1a18",
    marginBottom: 10,
  },
  textarea: { minHeight: 100, paddingTop: 12 },
  amenityGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  amenityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(30,30,20,0.12)",
  },
  amenityChipOn: {
    backgroundColor: "#f0f5ef",
    borderColor: "#6aaa60",
  },
  amenityIcon: { fontSize: 16 },
  amenityLabel: { fontSize: 13, color: "#4a4a44" },
  amenityLabelOn: { color: "#3d7a35", fontWeight: "600" },
  disclaimer: {
    marginTop: 24,
    fontSize: 13,
    color: "#888880",
    textAlign: "center",
    lineHeight: 20,
  },
  successWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 12,
  },
  successIcon: { fontSize: 56, marginBottom: 8 },
  successTitle: { fontSize: 24, fontWeight: "700", color: "#1a1a18" },
  successSub: {
    fontSize: 15,
    color: "#888880",
    textAlign: "center",
    lineHeight: 23,
  },
  submitBtn: {
    marginTop: 20,
    backgroundColor: "#3d7a35",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 100,
  },
  submitBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});

"use client";

import { useState } from "react";
import { submitLocation, geocodeAddress } from "@nuzzle/core";
import type { AmenityType } from "@nuzzle/core";
import styles from "./AddLocationModal.module.css";

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

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

type Step = "form" | "submitting" | "success";

export default function AddLocationModal({ onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [amenities, setAmenities] = useState<AmenityType[]>([]);
  const [hours, setHours] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const toggleAmenity = (a: AmenityType) => {
    setAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
    );
  };

  const handleSubmit = async () => {
    if (!name.trim() || !address.trim()) {
      setError("Name and address are required.");
      return;
    }
    setError("");
    setStep("submitting");
    try {
      const geo = await geocodeAddress(address);
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
      setError(
        e instanceof Error ? e.message : "Submission failed. Please try again.",
      );
    }
  };

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Add a nursing room location"
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Add a location</h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {step === "success" ? (
          <div className={styles.success}>
            <div className={styles.successIcon}>🎉</div>
            <h3>Thank you!</h3>
            <p>
              Your submission is under review and will appear on the map once
              verified.
            </p>
            <button className={styles.submitBtn} onClick={onSuccess}>
              Done
            </button>
          </div>
        ) : (
          <div className={styles.formBody}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="loc-name">
                Venue name *
              </label>
              <input
                id="loc-name"
                className={styles.input}
                type="text"
                placeholder="e.g. Nordstrom Nursing Lounge"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="loc-address">
                Address *
              </label>
              <input
                id="loc-address"
                className={styles.input}
                type="text"
                placeholder="Full street address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <span className={styles.hint}>
                We'll geocode this automatically.
              </span>
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Amenities</span>
              <div className={styles.amenityGrid}>
                {AMENITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`${styles.amenityChip} ${amenities.includes(opt.value) ? styles.amenityOn : ""}`}
                    onClick={() => toggleAmenity(opt.value)}
                    type="button"
                    aria-pressed={amenities.includes(opt.value)}
                  >
                    <span className={styles.amenityIcon}>{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="loc-hours">
                Opening hours
              </label>
              <input
                id="loc-hours"
                className={styles.input}
                type="text"
                placeholder="e.g. Mon–Sat 9am–9pm, Sun 10am–6pm"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="loc-notes">
                Notes for parents
              </label>
              <textarea
                id="loc-notes"
                className={`${styles.input} ${styles.textarea}`}
                placeholder="Anything else parents should know: floor, access instructions, cleanliness…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.actions}>
              <button className={styles.cancelBtn} onClick={onClose}>
                Cancel
              </button>
              <button
                className={styles.submitBtn}
                onClick={handleSubmit}
                disabled={step === "submitting"}
              >
                {step === "submitting" ? "Submitting…" : "Submit for review"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nuzzle — Find Nursing & Family Rooms Near You!",
  description:
    "Community-powered map of breastfeeding rooms, nursing lounges, and baby changing facilities near you.",
  keywords: [
    "breastfeeding room",
    "nursing lounge",
    "baby changing",
    "family room",
    "mothers room",
  ],
  openGraph: {
    title: "Nuzzle",
    description: "Find nursing & family rooms near you!",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}

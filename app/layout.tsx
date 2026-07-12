import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FarmOS — Verdant Acres",
  description:
    "The autonomous operating system for a one-person, off-grid eco-farm in Malaysia.",
  icons: { icon: "/farmos-mark.svg" },
  openGraph: {
    title: "FarmOS — the autonomous OS for a one-person farm company",
    description:
      "An AI agent that runs an off-grid eco-farm — and keeps it alive through a blackout.",
    images: ["/og-image.svg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

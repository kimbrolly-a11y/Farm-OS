import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FarmOS — Verdant Acres",
  description:
    "The operating system for a one-person, off-grid eco-farm in Malaysia.",
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

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sliva News — Berita Hewan & Pet Care Indonesia",
  description: "Berita, panduan kesehatan, gaya hidup pet, fauna, dan konservasi terpercaya untuk Indonesia.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

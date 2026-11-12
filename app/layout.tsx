import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Oshpaz Ta’lim",
  description: "Umarova Zulfiya bilan 1-kurs oshpazlik ta’limi.",
  icons: {
    icon: "/assets/texnikum-building-2026.jpg",
    shortcut: "/assets/texnikum-building-2026.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body className="antialiased">{children}</body>
    </html>
  );
}

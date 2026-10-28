import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Web Ta’lim",
  description: "Texnikum o‘quvchilari va o‘qituvchilari uchun raqamli ta’lim resursi.",
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

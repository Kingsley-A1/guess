import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "King Guesser — A little guess. A big adventure.",
  description:
    "Follow the clues, find the number. Ten joyful puzzles and private duels with friends.",
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

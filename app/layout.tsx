import type { Metadata } from "next";
import "./globals.css";
import { interfaceBootstrap } from "@/lib/interfaces";
export const metadata: Metadata = {
  title: "King Guesser — A little guess. A big adventure.",
  description:
    "Follow the clues, find the number. Ten joyful puzzles and private duels with friends.",
  icons: { icon: "/favicon-64.png", apple: "/apple-icon-180.png" },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-interface="cobalt" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: interfaceBootstrap }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

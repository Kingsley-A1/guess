import type { Metadata, Viewport } from "next";
import "./globals.css";
import { interfaceBootstrap } from "@/lib/interfaces";
export const metadata: Metadata = {
  metadataBase: new URL("https://guess.bespoketech.com.ng"),
  applicationName: "King Guesser",
  appleWebApp: {
    capable: true,
    title: "King Guesser",
    statusBarStyle: "default",
  },
  title: "King Guesser — A little guess. A big adventure.",
  description:
    "Follow the clues, find the number. Ten joyful puzzles and private duels with friends.",
  icons: { icon: "/favicon-64.png", apple: "/apple-icon-180.png" },
};
export const viewport: Viewport = { themeColor: "#123b91" };

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

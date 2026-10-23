import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "King Guesser",
    short_name: "King Guesser",
    description:
      "A little guess. A big adventure. Play ten joyful puzzles and challenge your friends.",
    lang: "en",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#071d49",
    theme_color: "#123b91",
    categories: ["games", "entertainment"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

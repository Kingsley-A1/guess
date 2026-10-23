import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = `${directory}/${entry.name}`;
      return entry.isDirectory() ? files(path) : [path];
    }),
  );
  return nested.flat();
}
const chunks = (await files(".next/static"))
  .filter((path) => /\.(js|css|woff2)$/.test(path))
  .map((path) => path.replace(".next", "/_next"));
const art = (await files("public/art"))
  .filter((path) => path.endsWith(".webp"))
  .map((path) => path.slice(6));
const assets = [
  "/",
  "/manifest.webmanifest",
  "/favicon-64.png",
  "/apple-icon-180.png",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable.png",
  "/fonts/nunito-sans-latin.woff2",
  ...art,
  ...chunks,
].sort();
// Include content, not just filenames: HTML, artwork and the worker can change.
const hash = createHash("sha256");
for (const path of assets) {
  const file =
    path === "/"
      ? ".next/server/app/index.html"
      : path.startsWith("/_next/")
        ? path.replace("/_next", ".next")
        : path === "/manifest.webmanifest"
          ? ".next/server/app/manifest.webmanifest.body"
          : `public${path}`;
  hash.update(path).update(await readFile(file));
}
const template = await readFile("pwa/service-worker.js", "utf8");
hash.update(template);
const version = hash.digest("hex").slice(0, 16);
await writeFile(
  "public/sw.js",
  template
    .replace('"__PWA_VERSION__"', JSON.stringify(version))
    .replace("__PWA_ASSETS__", JSON.stringify(assets)),
);
console.log(
  `PWA ${version}: ${assets.length} shell assets prepared for offline play.`,
);

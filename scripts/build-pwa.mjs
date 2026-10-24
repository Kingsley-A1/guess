import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { join, relative, sep } from "node:path";

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? files(path) : [path];
    }),
  );
  return nested.flat();
}

/**
 * Runs after compilation, before prerendering and deployment adapters package
 * public files. Never depend on generated page HTML or route-body locations.
 * @param {{ distDir: string, projectDir: string }} paths
 */
export async function buildPwa({ distDir, projectDir }) {
  const staticDir = join(distDir, "static");
  const publicDir = join(projectDir, "public");
  const urlPath = (root, file) => relative(root, file).split(sep).join("/");
  const chunks = (await files(staticDir))
    .filter((path) => /\.(js|css|woff2)$/.test(path))
    .map((path) => `/_next/static/${urlPath(staticDir, path)}`);
  const art = (await files(join(publicDir, "art")))
    .filter((path) => path.endsWith(".webp"))
    .map((path) => `/${urlPath(publicDir, path)}`);
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
  // A build nonce also invalidates the shell for server-only HTML/metadata
  // changes. Rendered routes are fetched atomically when the worker installs.
  const hash = createHash("sha256").update(randomUUID());
  for (const path of assets) {
    if (path === "/" || path === "/manifest.webmanifest") continue;
    const file = path.startsWith("/_next/static/")
      ? join(staticDir, path.slice("/_next/static/".length))
      : join(publicDir, path.slice(1));
    hash.update(path).update(await readFile(file));
  }
  const template = await readFile(
    join(projectDir, "pwa/service-worker.js"),
    "utf8",
  );
  hash.update(template);
  const version = hash.digest("hex").slice(0, 16);
  await writeFile(
    join(publicDir, "sw.js"),
    template
      .replace('"__PWA_VERSION__"', JSON.stringify(version))
      .replace("__PWA_ASSETS__", JSON.stringify(assets)),
  );
  console.log(
    `PWA ${version}: ${assets.length} shell assets prepared before deployment packaging.`,
  );
}

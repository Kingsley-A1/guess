import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  writeFile,
  readFile,
  rm,
  copyFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildPwa } from "../scripts/build-pwa.mjs";

test("PWA generation needs compiled assets, not prerendered HTML or route bodies", async () => {
  const projectDir = await mkdtemp(join(tmpdir(), "king-pwa-build-"));
  const distDir = join(projectDir, "custom-output");
  try {
    for (const directory of [
      "public/art",
      "public/fonts",
      "pwa",
      "custom-output/static/chunks",
    ]) {
      await mkdir(join(projectDir, directory), { recursive: true });
    }
    for (const name of [
      "favicon-64.png",
      "apple-icon-180.png",
      "icon-192.png",
      "icon-512.png",
      "icon-maskable.png",
      "fonts/nunito-sans-latin.woff2",
      "art/companion.webp",
    ]) {
      await writeFile(join(projectDir, "public", name), "fixture");
    }
    await writeFile(
      join(distDir, "static/chunks/game.js"),
      "/* compiled chunk */",
    );
    await copyFile(
      "pwa/service-worker.js",
      join(projectDir, "pwa/service-worker.js"),
    );
    // No .next/server/app/index.html or manifest.webmanifest.body exists here.
    await buildPwa({ projectDir, distDir });
    const first = await readFile(join(projectDir, "public/sw.js"), "utf8");
    const assets = JSON.parse(
      first.match(/const ASSETS = (\[.*?\]);/s)![1],
    ) as string[];
    assert.ok(assets.includes("/"));
    assert.ok(assets.includes("/manifest.webmanifest"));
    assert.ok(assets.includes("/_next/static/chunks/game.js"));
    assert.ok(assets.includes("/art/companion.webp"));
    assert.ok(!first.includes("__PWA_VERSION__"));
    assert.ok(!first.includes("__PWA_ASSETS__"));
    // Server-only changes must not accidentally retain an old offline shell.
    await buildPwa({ projectDir, distDir });
    assert.notEqual(
      await readFile(join(projectDir, "public/sw.js"), "utf8"),
      first,
    );
  } finally {
    await rm(projectDir, { recursive: true, force: true });
  }
});

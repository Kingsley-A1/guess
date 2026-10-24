import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// A build-only check: deployment adapters must see the completed worker before
// they package or relocate prerendered routes. This fixture does not deploy.
export default {
  name: "pwa-packaging-regression",
  async onBuildComplete({ projectDir, outputs }) {
    const worker = await readFile(join(projectDir, "public/sw.js"), "utf8");
    const assets = JSON.parse(worker.match(/const ASSETS = (\[.*?\]);/s)[1]);
    const emitted = new Set(outputs.staticFiles.map((file) => file.pathname));
    for (const path of assets.filter((path) =>
      path.startsWith("/_next/static/"),
    )) {
      assert.ok(emitted.has(path), `Precached chunk was not emitted: ${path}`);
    }
    assert.ok(!worker.includes("__PWA_VERSION__"));
    console.log(
      "PWA packaging check: generated worker and all precached chunks are ready before adapter packaging.",
    );
  },
};

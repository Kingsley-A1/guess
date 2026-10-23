import { test, expect } from "@playwright/test";

test("installable manifest, offline launch, six interfaces and gameplay without caching rooms", async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?room=ABC234");
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  const manifest = await (
    await page.request.get("/manifest.webmanifest")
  ).json();
  expect(manifest).toMatchObject({
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
  });
  for (const icon of manifest.icons) {
    expect((await page.request.get(icon.src)).ok()).toBeTruthy();
  }
  const headers = (await page.request.get("/sw.js")).headers();
  expect(headers["cache-control"]).toContain("no-store");
  // An authenticated room response must never enter a service-worker cache.
  await page.evaluate(() =>
    fetch("/api/rooms/ABC234", {
      headers: { Authorization: "Bearer not-a-real-token" },
    }).catch(() => {}),
  );
  await context.setOffline(true);
  await page.goto("/");
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "You’re offline" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close settings" }).click();
  for (const id of [
    "cobalt",
    "friendly",
    "studio",
    "golden",
    "midnight",
    "evergreen",
  ]) {
    await page.getByLabel("Interface", { exact: true }).selectOption(id);
    await expect(page.locator("html")).toHaveAttribute("data-interface", id);
    expect(
      await page.evaluate(() =>
        [...document.images]
          .filter((i) => i.getAttribute("src")?.startsWith("/art/"))
          .every((i) => i.complete && i.naturalWidth > 0),
      ),
    ).toBeTruthy();
  }
  for (let attempt = 0; attempt < 4; attempt++) {
    if (await page.locator(".result-number").count()) break;
    const [low, high] = (
      await page.locator(".range-numbers strong").allTextContents()
    ).map(Number);
    await page
      .getByLabel("Your best guess")
      .fill(String(Math.floor((low + high) / 2)));
    await page.getByLabel("Your best guess").press("Enter");
  }
  await expect(page.getByText("Oh, you brilliant thing.")).toBeVisible();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute(
    "data-interface",
    "evergreen",
  );
  await page
    .getByRole("button", { name: "Choose a level", exact: true })
    .click();
  await expect(page.getByRole("button", { name: /Level 2:/ })).toBeEnabled();
  await page.getByRole("button", { name: "Close levels" }).click();
  await page.getByLabel("Game mode", { exact: true }).selectOption("daily");
  await expect(
    page.getByText("THE DAILY PUZZLE", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Your best guess").fill("50");
  await page.getByLabel("Your best guess").press("Enter");
  await expect(page.getByLabel("Your best guess")).toHaveValue("");
  const cached = await page.evaluate(async () => {
    const names = await caches.keys();
    const urls = await Promise.all(
      names.map(async (name) =>
        (await (await caches.open(name)).keys()).map((r) => r.url),
      ),
    );
    return urls.flat();
  });
  expect(cached.some((url) => url.includes("/_next/static/"))).toBeTruthy();
  expect(
    cached.some(
      (url) =>
        url.includes("/api/") ||
        url.includes("?room=") ||
        url.includes("/designs/"),
    ),
  ).toBeFalsy();
  expect(
    await page.evaluate(() =>
      fetch("/api/rooms/ABC234").then(
        () => false,
        () => true,
      ),
    ),
  ).toBeTruthy();
  expect(errors).toEqual([]);
});

test("a waiting update preserves the active round until the player accepts it", async ({
  page,
  context,
}) => {
  const { readFile, writeFile } = await import("node:fs/promises");
  const original = await readFile("public/sw.js", "utf8");
  await page.goto("/");
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await page.getByLabel("Interface", { exact: true }).selectOption("friendly");
  await page.getByLabel("Your best guess").fill("7");
  // Serve the same built assets as a new worker version, like a deployment.
  try {
    await writeFile(
      "public/sw.js",
      original.replace(
        /const VERSION = "[^"]+"/,
        'const VERSION = "browser-update-check"',
      ),
    );
    await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      await registration?.update();
    });
    await page.getByRole("button", { name: "Settings", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Update game" }),
    ).toBeVisible();
    // The input and chosen interface survive installation of a waiting update.
    await page.getByRole("button", { name: "Close settings" }).click();
    await expect(page.getByLabel("Your best guess")).toHaveValue("7");
    await expect(page.locator("html")).toHaveAttribute(
      "data-interface",
      "friendly",
    );
    await page.getByRole("button", { name: "Settings", exact: true }).click();
    await page.getByRole("button", { name: "Update game" }).click();
    await expect(page.getByLabel("Your best guess")).toHaveValue("");
    await expect(page.locator("html")).toHaveAttribute(
      "data-interface",
      "friendly",
    );
    await expect
      .poll(() =>
        page.evaluate(async () =>
          (await caches.keys()).includes(
            "king-guesser-pwa-browser-update-check",
          ),
        ),
      )
      .toBeTruthy();
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByLabel("Your best guess")).toBeEnabled();
  } finally {
    await writeFile("public/sw.js", original);
  }
});

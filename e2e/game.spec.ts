import { test, expect, type Page } from "@playwright/test";
async function solveSolo(page: Page) {
  for (let n = 0; n < 4; n++) {
    if (await page.locator(".result-number").count()) break;
    const [low, high] = (
      await page.locator(".range-numbers strong").allTextContents()
    ).map(Number);
    await page
      .getByLabel("Your best guess")
      .fill(String(Math.floor((low + high) / 2)));
    await page.getByLabel("Your best guess").press("Enter");
  }
}
test("solo play unlocks levels, persists progress, supports keyboard and responsive layouts", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page
    .getByRole("button", { name: "Choose a level", exact: true })
    .click();
  await expect(page.getByRole("button", { name: /Level 2:/ })).toBeDisabled();
  await page.getByRole("button", { name: "Close levels" }).click();
  await solveSolo(page);
  await expect(page.getByText("Oh, you brilliant thing.")).toBeVisible();
  await page
    .getByRole("button", { name: "Choose a level", exact: true })
    .click();
  await expect(page.getByRole("button", { name: /Level 2:/ })).toBeEnabled();
  await page.getByRole("button", { name: "Close levels" }).click();
  await page.reload();
  await page
    .getByRole("button", { name: "Choose a level", exact: true })
    .click();
  await expect(page.getByRole("button", { name: /Level 2:/ })).toBeEnabled();
  await page.getByRole("button", { name: "Close levels" }).click();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByLabel("Game mode", { exact: true }).selectOption("daily");
  await expect(
    page.getByText("THE DAILY PUZZLE", { exact: true }),
  ).toBeVisible();
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
  }
  expect(errors).toEqual([]);
});
test("two independent browsers can duel, reconnect and agree to a rematch", async ({
  page,
  browser,
  baseURL,
}) => {
  await page.goto("/");
  await page.getByLabel("Game mode", { exact: true }).selectOption("friends");
  await page.getByLabel("What should we call you?").fill("Ada");
  await page.getByRole("button", { name: "Create a private room" }).click();
  const code = await page.locator(".room-code").innerText();
  const guestContext = await browser.newContext();
  const guest = await guestContext.newPage();
  try {
    await guest.goto(`${baseURL}/?room=${code}`);
    await guest.getByLabel("What should we call you?").fill("Grace");
    await guest.getByRole("button", { name: "Join room", exact: true }).click();
    await expect(page.getByLabel("Your best guess")).toBeEnabled();
    await expect(guest.getByLabel("Your best guess")).toBeDisabled();
    // Both player views retain the shared budget in every interface.
    for (const id of [
      "cobalt",
      "friendly",
      "studio",
      "golden",
      "midnight",
      "evergreen",
    ]) {
      await page.getByLabel("Interface", { exact: true }).selectOption(id);
      await guest.getByLabel("Interface", { exact: true }).selectOption(id);
      await expect(page.locator(".chances")).toContainText("12 guesses left");
      await expect(guest.locator(".chances")).toContainText("12 guesses left");
    }
    for (let turn = 0; turn < 8; turn++) {
      const actor = turn % 2 === 0 ? page : guest;
      await actor.waitForFunction(
        () =>
          document.querySelector(".result-number") ||
          document.querySelector<HTMLInputElement>("#guess")?.disabled ===
            false,
      );
      if (await actor.locator(".result-number").count()) break;
      const [low, high] = (
        await actor.locator(".range-numbers strong").allTextContents()
      ).map(Number);
      await actor
        .getByLabel("Your best guess")
        .fill(String(Math.floor((low + high) / 2)));
      await actor
        .getByRole("button", { name: "Make a guess", exact: true })
        .click();
    }
    await expect(page.locator(".result-number")).toBeVisible();
    await expect(guest.locator(".result-number")).toBeVisible();
    expect(await page.locator(".result-number").innerText()).toBe(
      await guest.locator(".result-number").innerText(),
    );
    await page.getByRole("button", { name: "Play a rematch" }).click();
    await guest.getByRole("button", { name: "Play a rematch" }).click();
    await expect(guest.getByLabel("Your best guess")).toBeEnabled();
    await page.reload();
    await expect(page.getByLabel("Your best guess")).toBeDisabled();
    const publicRead = await page.request.get(`/api/rooms/${code}`);
    expect(publicRead.status()).toBe(401);
  } finally {
    await guestContext.close();
  }
});

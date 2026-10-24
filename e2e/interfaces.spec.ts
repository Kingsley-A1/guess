import { test, expect } from "@playwright/test";

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() =>
    localStorage.setItem("king:v2:welcomed", "true"),
  );
});
const interfaces = [
  "cobalt",
  "friendly",
  "studio",
  "golden",
  "midnight",
  "evergreen",
];
test("Cobalt is default, interfaces are ordered, and switching preserves the current turn", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  const menu = page.getByLabel("Interface", { exact: true });
  await expect(menu).toHaveValue("cobalt");
  expect(
    await menu
      .locator("option")
      .evaluateAll((els) => els.map((e) => (e as HTMLOptionElement).value)),
  ).toEqual(interfaces);
  await page.getByRole("button", { name: "Digit 1", exact: true }).click();
  await page.getByRole("button", { name: "Digit 0", exact: true }).click();
  await expect(page.getByLabel("Your best guess")).toHaveValue("10");
  await page.getByRole("button", { name: "Delete last digit" }).click();
  await expect(page.getByLabel("Your best guess")).toHaveValue("1");
  await page.getByRole("button", { name: "Clear guess" }).click();
  await expect(page.getByLabel("Your best guess")).toHaveValue("");
  await page.getByLabel("Your best guess").fill("6");
  const range = await page.locator(".range-numbers strong").allTextContents();
  for (const id of interfaces) {
    await menu.selectOption(id);
    await expect(page.locator("html")).toHaveAttribute("data-interface", id);
    await expect(page.getByLabel("Your best guess")).toHaveValue("6");
    expect(
      await page.locator(".range-numbers strong").allTextContents(),
    ).toEqual(range);
    await expect(page.locator(".chances")).toContainText("4 guesses left");
    await expect(page.locator(".keypad")).toHaveCount(
      ["cobalt", "studio"].includes(id) ? 1 : 0,
    );
    const image = page.locator(".stage-heading img");
    if (await image.count())
      await expect
        .poll(() =>
          image.evaluate(
            (e: HTMLImageElement) => e.complete && e.naturalWidth > 0,
          ),
        )
        .toBe(true);
  }
  await menu.selectOption("friendly");
  await page.reload();
  await expect(menu).toHaveValue("friendly");
  await page.getByLabel("Game mode", { exact: true }).selectOption("daily");
  await expect(menu).toHaveValue("friendly");
  await page.getByLabel("Game mode", { exact: true }).selectOption("friends");
  await expect(menu).toHaveValue("friendly");
  await expect(
    page.getByRole("button", { name: "Create a private room" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("every interface supports keyboard play and fits narrow screens", async ({
  page,
}) => {
  await page.goto("/");
  for (const id of interfaces) {
    await page.getByLabel("Interface", { exact: true }).selectOption(id);
    for (const width of [360, 390, 768, 1366]) {
      await page.setViewportSize({ width, height: width < 700 ? 844 : 768 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${id} at ${width}`,
      ).toBe(true);
      const button = page.getByRole("button", {
        name: "Make a guess",
        exact: true,
      });
      expect(
        await button.evaluate(
          (e) => e.getBoundingClientRect().bottom <= innerHeight,
        ),
        `${id}: main action at ${width}`,
      ).toBe(true);
    }
    for (let turn = 0; turn < 4; turn++) {
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
    await page
      .getByRole("button", { name: "Choose a level", exact: true })
      .click();
    await page.getByRole("button", { name: /Level 1:/ }).click();
  }
});
test("invalid saved interface falls back safely and hints keep giving useful feedback", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("king:v2:interface", "unknown-theme"),
  );
  await page.goto("/");
  await expect(page.getByLabel("Interface", { exact: true })).toHaveValue(
    "cobalt",
  );
  await page.getByRole("button", { name: "Hint", exact: false }).click();
  await expect(page.locator(".chances")).toContainText("3 guesses left");
  await expect(page.locator("#game-feedback")).toContainText("A little nudge.");
  await page.getByLabel("Your best guess").fill("0");
  await page.getByLabel("Your best guess").press("Enter");
  await expect(page.locator("#game-error")).toContainText(
    "Choose a whole number",
  );
  await expect(page.getByLabel("Your best guess")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
});

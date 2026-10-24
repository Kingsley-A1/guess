import { test, expect } from "@playwright/test";

test("first visit welcomes the player, preserves invitations and stays dismissed on return", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/?room=ABC234");
  const welcome = page.getByRole("dialog", { name: "Welcome to King Guesser" });
  await expect(welcome).toBeVisible();
  await expect(
    welcome.getByRole("button", { name: "Let’s play" }),
  ).toBeFocused();
  const bounds = await welcome.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(360);
  await welcome.getByRole("button", { name: "Let’s play" }).click();
  await expect(welcome).not.toBeVisible();
  await expect(page.getByLabel("Game mode", { exact: true })).toHaveValue(
    "friends",
  );
  await expect(
    page.getByRole("button", { name: "Join room", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Game mode", { exact: true })).toHaveValue(
    "friends",
  );
  expect(
    await page.evaluate(() => localStorage.getItem("king:v2:welcomed")),
  ).toBe("true");
  await expect(welcome).not.toBeVisible();
});

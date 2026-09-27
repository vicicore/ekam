import { test, expect } from "@playwright/test";

test("skip link exists", async ({ page }) => {
  await page.goto("/accessibility");
  await expect(page.getByRole("link", { name: /skip to main content/i })).toBeVisible();
});

test("accessibility controls expose states", async ({ page }) => {
  await page.goto("/accessibility");
  await expect(page.getByRole("button", { name: /contrast/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /reduce motion/i })).toBeVisible();
});

import { test, expect } from "@playwright/test";

test("home page renders", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/SETU/i);
});

test("services page is reachable", async ({ page }) => {
  await page.goto("/services");
  await expect(page.locator("body")).toContainText(/service/i);
});

test("accessibility page is reachable", async ({ page }) => {
  await page.goto("/accessibility");
  await expect(page.locator("main")).toBeVisible();
});

test("assistant page is reachable", async ({ page }) => {
  await page.goto("/assistant");
  await expect(page.locator("main")).toBeVisible();
});

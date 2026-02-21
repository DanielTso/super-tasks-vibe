import { test, expect } from "@playwright/test";

test.describe("App", () => {
  test("should load the homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Super-Task Vibe/i);
  });

  test("should display the kanban board", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Todo")).toBeVisible();
    await expect(page.getByText("In Progress")).toBeVisible();
    await expect(page.getByText("Done")).toBeVisible();
  });
});

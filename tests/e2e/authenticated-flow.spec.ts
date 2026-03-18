import { test, expect } from "@playwright/test";

test("authenticated user can access dashboard modules", async ({ page }) => {
  test.skip(
    !process.env.E2E_EMAIL || !process.env.E2E_PASSWORD,
    "E2E_EMAIL/E2E_PASSWORD are required for authenticated flow",
  );

  await page.goto("/home");
  await expect(page.getByText("Study dashboard")).toBeVisible();

  await page.goto("/upload");
  await expect(
    page.getByText("Upload & Generate Study Materials"),
  ).toBeVisible();

  await page.goto("/library");
  await expect(page.getByText("My PDF Library")).toBeVisible();

  await page.goto("/results");
  await expect(page.getByText("Generated Results")).toBeVisible();
});

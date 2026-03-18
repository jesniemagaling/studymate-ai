import { test, expect } from "@playwright/test";

test("login page renders", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText("Welcome back")).toBeVisible();
  await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
});

test("register page renders", async ({ page }) => {
  await page.goto("/register");
  await expect(page.getByText("Create an Account")).toBeVisible();
  await expect(page.getByRole("button", { name: "Register" })).toBeVisible();
});

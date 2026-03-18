import { test as setup } from "@playwright/test";

const authFile = "tests/e2e/.auth/user.json";

setup("authenticate", async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;

  setup.skip(
    !email || !password,
    "E2E_EMAIL/E2E_PASSWORD are required for authenticated flow",
  );

  await page.goto("/login");
  await page.getByPlaceholder("Email").fill(email!);
  await page.getByPlaceholder("Password").fill(password!);
  await page.getByRole("button", { name: "Login" }).click();

  await page.waitForURL("**/home", { timeout: 15000 });
  await page.context().storageState({ path: authFile });
});

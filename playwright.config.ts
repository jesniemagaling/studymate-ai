import { defineConfig, devices } from "@playwright/test";

const authFile = "tests/e2e/.auth/user.json";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chromium-public",
      testIgnore: [/.*\.setup\.ts/, /.*authenticated-flow\.spec\.ts/],
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chromium-auth",
      testMatch: /.*authenticated-flow\.spec\.ts/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: authFile,
      },
    },
  ],
});

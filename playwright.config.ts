import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "tests",
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  use: { baseURL: "http://127.0.0.1:4173", trace: "retain-on-failure" },
  webServer: {
    command: "npm run preview -- --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: "android-chromium",
      use: { ...devices["Pixel 7"], browserName: "chromium" },
    },
    {
      name: "iphone-webkit",
      // Playwright's service-worker interception is Chromium-only.
      // WebKit covers offline mutations; cold offline startup is a physical iPhone check.
      use: { ...devices["iPhone 13"], browserName: "webkit", serviceWorkers: "block" },
    },
  ],
});

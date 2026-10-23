import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e-pwa",
  workers: 1,
  timeout: 60000,
  use: {
    baseURL: "http://localhost:3500",
    trace: "retain-on-failure",
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    },
  },
  webServer: {
    command: "npm run start -- --port 3500",
    url: "http://localhost:3500",
    reuseExistingServer: false,
  },
});

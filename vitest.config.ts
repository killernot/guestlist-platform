import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["__tests__/**/*.test.ts", "src/**/*.test.tsx", "src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["pages/api/**/*.ts", "lib/**/*.ts", "src/**/*.ts"],
    },
  },
});

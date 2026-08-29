import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    watch: false,
    isolate: true,
    passWithNoTests: true,
    environment: "happy-dom",
    coverage: {
      enabled: true,
      reporter: ["text-summary"],
      include: ["src/**/*"],
      thresholds: {
        statements: 100,
        functions: 100,
        branches: 100,
        lines: 100,
        perFile: true,
        autoUpdate: true,
      },
    },
  },
});

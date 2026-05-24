import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),

      "server-only": resolve(__dirname, "./src/test/mocks/empty-module.ts"),
      "client-only": resolve(__dirname, "./src/test/mocks/empty-module.ts"),
    },
  },

  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],

    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**", ".next/**"],

    coverage: {
      provider: "istanbul",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",

      include: ["src/**/*.{ts,tsx}", "app/**/*.{ts,tsx}"],

      exclude: [
        "src/test/**",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",

        "**/*.d.ts",
        "**/*.config.*",
        "**/node_modules/**",
        "**/.next/**",
        "**/coverage/**",
        "**/playwright-report/**",
        "**/test-results/**",

        "**/index.ts",
        "**/types.ts",
      ],
    },
  },
});

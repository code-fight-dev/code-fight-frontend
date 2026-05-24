import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tailwindCanonicalClasses from "eslint-plugin-tailwind-canonical-classes";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      "tailwind-canonical-classes": tailwindCanonicalClasses,
    },
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/widgets/*/ui/*", "@/widgets/*/model/*"],
              message: "Import widgets through their public API: @/widgets/<slice>.",
            },
            {
              group: ["@/shared/ui/*/*"],
              message: "Import shared UI through public API: @/shared/ui/<slice>.",
            },
            {
              group: ["@/entities/*/api/*", "@/entities/*/model/*"],
              message:
                "Import entities through public API: @/entities/<slice> or allowed entrypoints like @/entities/challenge/client and @/entities/challenge/server.",
            },
            {
              group: ["@/entities/*/testing"],
              message:
                "Testing entrypoints are allowed only in test files under src/test/**.",
            },
          ],
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",
      "tailwind-canonical-classes/tailwind-canonical-classes": [
        "warn",
        {
          cssPath: "./src/app/globals.css",
          rootFontSize: 16,
          calleeFunctions: ["cn", "clsx", "classNames", "twMerge", "cva"],
        },
      ],
    },
  },
  {
    files: ["src/test/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/widgets/*/ui/*", "@/widgets/*/model/*"],
              message: "Import widgets through their public API: @/widgets/<slice>.",
            },
            {
              group: ["@/shared/ui/*/*"],
              message: "Import shared UI through public API: @/shared/ui/<slice>.",
            },
            {
              group: ["@/entities/*/api/*", "@/entities/*/model/*"],
              message:
                "Import entities through public API: @/entities/<slice> or allowed entrypoints like @/entities/challenge/client and @/entities/challenge/server.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
  ]),
  eslintConfigPrettier,
]);

export default eslintConfig;

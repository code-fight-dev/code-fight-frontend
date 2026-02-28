/** @type {import("@commitlint/types").UserConfig} */
const config = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "docs", "style", "refactor", "test", "chore", "deps"],
    ],
    "subject-empty": [2, "never"],
    "type-case": [2, "always", "lower-case"],
  },
};

export default config;

/** @type {import("prettier").Config} */
const config = {
  plugins: ["prettier-plugin-tailwindcss"],
  printWidth: 90,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  bracketSpacing: true,
  arrowParens: "always",
  endOfLine: "lf",
};

export default config;

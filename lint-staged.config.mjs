/** @type {import("lint-staged").Configuration} */
const config = {
  "*.{js,jsx,ts,tsx,mjs,cjs}": ["prettier --write", "eslint --fix"],
  "*.{json,md,css}": ["prettier --write"],
};

export default config;

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "prettier",
    "next"
  ),
  ...compat.config({
    extends: ["next"],
    rules: {
      "react/no-unescaped-entities": 0,
      "@next/next/no-page-custom-font": 0,
      "@typescript-eslint/no-explicit-any": 0,
      "react-hooks/rules-of-hooks": 0,
      // typescript
      "@typescript-eslint/naming-convention": 0,
      "@typescript-eslint/no-use-before-define": 0,
      "@typescript-eslint/consistent-type-exports": 0,
      "@typescript-eslint/consistent-type-imports": 0,
      "@typescript-eslint/no-unused-vars": [1, { args: "none" }],
      "@typescript-eslint/no-empty-object-type": 0,
    },
  }),
  {
    ignores: ["**/hooks/*", "**/utils/*", "**/auth/*", "**/actions/*"],
  },
];

export default eslintConfig;

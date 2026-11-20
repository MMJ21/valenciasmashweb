import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import boundaries from "eslint-plugin-boundaries";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const config = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: { boundaries },
    settings: {
      "boundaries/elements": [
        { type: "app", pattern: "src/app/**" },
        { type: "lib", pattern: "src/lib/**" },
        { type: "module-domain", pattern: "src/modules/*/domain/**", capture: ["module"] },
        {
          type: "module-application",
          pattern: "src/modules/*/application/**",
          capture: ["module"],
        },
        { type: "module-infra", pattern: "src/modules/*/infra/**", capture: ["module"] },
        { type: "module-public", pattern: "src/modules/*/index.ts", capture: ["module"] },
      ],
    },
    rules: {
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            { from: "app", allow: ["lib", "module-public"] },
            { from: "lib", allow: ["lib"] },
            { from: "module-domain", allow: ["module-domain", "lib"] },
            {
              from: "module-application",
              allow: [
                "module-domain",
                "module-application",
                "module-infra",
                "module-public",
                "lib",
              ],
            },
            {
              from: "module-infra",
              allow: ["module-domain", "module-application", "module-infra", "lib"],
            },
            { from: "module-public", allow: ["module-domain", "module-application"] },
          ],
        },
      ],
      "boundaries/no-private": ["error", { allowUncles: false }],
    },
  },
  {
    ignores: [
      ".next/**",
      ".open-next/**",
      "drizzle/**",
      "playwright-report/**",
      "test-results/**",
      "next-env.d.ts",
    ],
  },
];

export default config;

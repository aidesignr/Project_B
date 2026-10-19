import { fileURLToPath, URL } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import type { Plugin } from "vite";
import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

const configDir = fileURLToPath(new URL("./.storybook", import.meta.url));

/**
 * Runs every story (render + play function + axe WCAG 2.2 AA) in Chromium, once per
 * toolbar combination below. `.storybook/vitest.setup.ts` applies each project's globals.
 */
const combos = [
  { name: "dark-en", globals: { theme: "dark", locale: "en" } },
  { name: "light-ar", globals: { theme: "light", locale: "ar" } },
];

// The Storybook UI's test runner (VITEST_STORYBOOK) renames every project to
// "storybook:<configDir>", so it can only take one; the CLI and CI run all combos.
const projects = process.env.VITEST_STORYBOOK === "true" ? combos.slice(0, 1) : combos;

// The UI's Coverage option adds the addon's reporter, which Vitest 5 can't load (no
// default export) and which then stops Storybook. Point it at our re-export instead, and
// leave the i18n JSON out of coverage (it isn't code and fails the source-map parse).
const ADDON_REPORTER = "@storybook/addon-vitest/internal/coverage-reporter";
const fixedReporter = fileURLToPath(new URL("./.storybook/coverage-reporter.mjs", import.meta.url));
const coverageReporterFix: Plugin = {
  name: "accuknox:storybook-coverage-reporter",
  configureVitest({ vitest }) {
    const coverage = vitest.config.coverage;
    if (!coverage?.enabled) return;
    if (Array.isArray(coverage.exclude) && !coverage.exclude.includes("**/*.json")) coverage.exclude.push("**/*.json");
    const reporters = coverage.reporter;
    if (!Array.isArray(reporters)) return;
    for (const entry of reporters) {
      if (Array.isArray(entry) && entry[0] === ADDON_REPORTER) entry[0] = fixedReporter;
    }
  },
};

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      projects: projects.map(({ name, globals }) => ({
        extends: true,
        plugins: [storybookTest({ configDir, storybookScript: "npm run storybook -- --ci" }), coverageReporterFix],
        test: {
          name: `storybook:${name}`,
          provide: { storybookGlobals: globals },
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      })),
    },
  }),
);

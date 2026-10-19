import { fileURLToPath, URL } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
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

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      projects: combos.map(({ name, globals }) => ({
        extends: true,
        plugins: [storybookTest({ configDir, storybookScript: "npm run storybook -- --ci" })],
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

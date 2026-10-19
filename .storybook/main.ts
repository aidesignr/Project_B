import type { StorybookConfig } from "@storybook/react-vite";

// Reuses vite.config.ts (React, Tailwind v4, the "@" alias), so stories render with the app's tokens.
const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-designs", "@storybook/addon-vitest"],
  framework: { name: "@storybook/react-vite", options: {} },
  core: { disableTelemetry: true },
};

export default config;

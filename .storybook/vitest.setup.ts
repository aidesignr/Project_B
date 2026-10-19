import * as a11yAnnotations from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from "@storybook/react-vite";
import { inject } from "vitest";
import * as projectAnnotations from "./preview";

declare module "vitest" {
  export interface ProvidedContext {
    storybookGlobals: Record<string, string>;
  }
}

// The toolbar globals (theme, locale) for this Vitest project; see vitest.config.ts.
setProjectAnnotations([a11yAnnotations, projectAnnotations, { initialGlobals: inject("storybookGlobals") }]);

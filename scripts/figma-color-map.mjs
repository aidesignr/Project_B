// Maps the obra-ds Figma library's "shadcn colors" variables to AccuKnox tokens
// (tokens/tokens.json). Shared by sync-figma-colors.mjs and check-figma-drift.mjs.
// Library file: https://www.figma.com/design/CFxxYv6TbuUzDW910DNv6v/obra-ds (D-048)
import { readFileSync } from "node:fs";

export const LIBRARY_FILE_KEY = "CFxxYv6TbuUzDW910DNv6v";
export const COLLECTION = "shadcn colors";
// Figma mode name → token theme
export const MODES = { shadcn: "light", "shadcn-dark": "dark" };

// Figma variable name (inside the collection) → token name.
// Obra uses `destructive` as red text and strokes (error labels, error inputs,
// Destructive button text over a tint), so it maps to `destructive-text`, not
// to our solid `destructive` button fill (D-048).
export const MAP = {
  "shadcn colors/general/background": "background",
  "shadcn colors/general/foreground": "foreground",
  "shadcn colors/general/card": "card",
  "shadcn colors/general/card foreground": "card-foreground",
  "shadcn colors/general/popover": "popover",
  "shadcn colors/general/popover foreground": "popover-foreground",
  "shadcn colors/general/primary": "primary",
  "shadcn colors/general/primary foreground": "primary-foreground",
  "shadcn colors/general/secondary": "secondary",
  "shadcn colors/general/secondary foreground": "secondary-foreground",
  "shadcn colors/general/muted": "muted",
  "shadcn colors/general/muted foreground": "muted-foreground",
  "shadcn colors/general/accent": "accent",
  "shadcn colors/general/accent foreground": "accent-foreground",
  "shadcn colors/general/destructive": "destructive-text",
  "shadcn colors/general/border": "border",
  "shadcn colors/general/input": "input",
  "shadcn colors/focus/ring": "ring",
  "shadcn colors/focus/ring error": "destructive-text",
  "shadcn colors/sidebar/sidebar": "sidebar",
  "shadcn colors/sidebar/sidebar foreground": "sidebar-foreground",
  "shadcn colors/sidebar/sidebar primary": "sidebar-primary",
  "shadcn colors/sidebar/sidebar primary foreground": "sidebar-primary-foreground",
  "shadcn colors/sidebar/sidebar accent": "sidebar-accent",
  "shadcn colors/sidebar/sidebar accent foreground": "sidebar-accent-foreground",
  "shadcn colors/sidebar/sidebar border": "sidebar-border",
  "shadcn colors/sidebar/sidebar ring": "sidebar-ring",
  // AccuKnox additions (not in the Obra kit): created by the sync script if missing.
  "shadcn colors/accuknox/avatar 1": "avatar-1",
  "shadcn colors/accuknox/avatar 2": "avatar-2",
  "shadcn colors/accuknox/avatar 3": "avatar-3",
  "shadcn colors/accuknox/avatar 4": "avatar-4",
  "shadcn colors/accuknox/avatar 5": "avatar-5",
  "shadcn colors/accuknox/avatar 6": "avatar-6",
  "shadcn colors/accuknox/avatar 7": "avatar-7",
  "shadcn colors/accuknox/avatar 8": "avatar-8",
};

/** Variables the sync script may create; every other name must already exist in the kit. */
export const CREATABLE_PREFIX = "shadcn colors/accuknox/";

// Expected Figma values: { "<variable name>": { light: "#rrggbb", dark: "#rrggbb" } }
export function expectedValues() {
  const tokens = JSON.parse(readFileSync(new URL("../tokens/tokens.json", import.meta.url), "utf8"));
  const out = {};
  for (const [variable, token] of Object.entries(MAP)) {
    out[variable] = {};
    for (const theme of ["light", "dark"]) {
      const value = tokens.theme[theme][token]?.$value;
      if (!/^#[0-9a-f]{6}$/i.test(value ?? "")) throw new Error(`Token ${theme}.${token} is missing or not a hex color`);
      out[variable][theme] = value.toLowerCase();
    }
  }
  return out;
}

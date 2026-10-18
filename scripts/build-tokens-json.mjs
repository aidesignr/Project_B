// Builds tokens/tokens.json (W3C Design Tokens format) from tokens/tokens.css + tokens/theme.css,
// so the CSS stays the single source of truth and Figma variables can be synced from the JSON.
// Run: node scripts/build-tokens-json.mjs
import { readFileSync, writeFileSync } from "node:fs";

const read = (f) => readFileSync(new URL(`../tokens/${f}`, import.meta.url), "utf8");
const tokensCss = read("tokens.css");
const themeCss = read("theme.css");

function vars(css, start, end) {
  const i = css.indexOf(start);
  const body = css.slice(css.indexOf("{", i) + 1, end ? css.indexOf(end, i) : css.indexOf("\n}", i));
  return [...body.matchAll(/--([\w-]+):\s*([^;]+);/g)]
    .filter((m) => !m[1].endsWith("*"))
    .map(([, k, v]) => [k, v.trim()]);
}

const typeOf = (k, v) =>
  /^#[0-9a-f]{6}$/i.test(v) ? "color"
  : /^-?\d+(\.\d+)?px$/.test(v) ? "dimension"
  : /^\d+ms$/.test(v) ? "duration"
  : k.startsWith("font-weight") ? "fontWeight"
  : k.startsWith("font-") ? "fontFamily"
  : k.startsWith("ease") ? "cubicBezier"
  : k.startsWith("elevation") ? "shadow"
  : null;

const group = (entries) => {
  const out = {};
  for (const [k, v] of entries) {
    const $type = typeOf(k, v);
    if (!$type || v.startsWith("var(")) continue;
    let $value = v;
    if ($type === "fontWeight") $value = Number(v);
    if ($type === "fontFamily") $value = v.split(",").map((s) => s.trim().replace(/^"|"$/g, ""));
    if ($type === "cubicBezier") $value = v.match(/[\d.]+/g).map(Number);
    if ($type === "duration") $value = { value: parseFloat(v), unit: "ms" };
    if ($type === "dimension") $value = { value: parseFloat(v), unit: "px" };
    if ($type === "shadow") $value = v; // kept as CSS string; Figma sync maps it manually
    out[k] = { $type, $value };
  }
  return out;
};

const json = {
  $description: "AccuKnox design tokens. Generated from tokens/*.css by scripts/build-tokens-json.mjs — do not edit by hand.",
  global: group([...vars(tokensCss, ":root {", "\n}"), ...vars(themeCss, "@theme {", "\n}")]),
  theme: {
    dark: { $description: "Default theme", ...group(vars(tokensCss, ":root,\n.dark")) },
    light: group(vars(tokensCss, ".light,\n[data-theme=\"light\"]")),
  },
};
writeFileSync(new URL("../tokens/tokens.json", import.meta.url), JSON.stringify(json, null, 2) + "\n");
const n = (o) => Object.keys(o).filter((k) => !k.startsWith("$")).length;
console.log(`tokens.json: ${n(json.global)} global · ${n(json.theme.dark)} dark · ${n(json.theme.light)} light`);

// Lints source files for design-system rule breaks that Tailwind can't block at build time:
//   1. fractional spacing utilities (p-1.5 = 6px)            → 4px grid (D-015, D-029)
//   2. arbitrary px values that aren't multiples of 4 ([13px]) → 4px grid (1px/2px allowed)
//   3. physical direction utilities (ml-, pr-, text-left …)  → logical properties for RTL
//   4. arbitrary colors (bg-[#ff0000], text-[rgb(...)])       → semantic tokens only
// Run: node scripts/check-spacing.mjs [dir ...]   (default: src). Exit 1 on any violation.
// Stock shadcn components (components/ui) are skipped; review them when they're added.
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const EXT = new Set([".tsx", ".ts", ".jsx", ".js", ".html", ".css", ".mdx"]);
const SKIP = [/node_modules/, /[\\/]components[\\/]ui[\\/]/, /[\\/]dist[\\/]/];
const roots = process.argv.slice(2).length ? process.argv.slice(2) : ["src"];

const SPACING = "p|px|py|ps|pe|pt|pb|m|mx|my|ms|me|mt|mb|gap|gap-x|gap-y|space-x|space-y|w|h|size|min-w|min-h|max-w|max-h|inset|inset-x|inset-y|start|end|top|bottom|translate-x|translate-y|scroll-p|scroll-m|basis";
const RULES = [
  { name: "fractional spacing (not on 4px grid)", re: new RegExp(`(?<![\\w-])-?(?:${SPACING})-\\d+\\.5(?![\\w.])`, "g") },
  {
    name: "arbitrary px not a multiple of 4",
    re: /\[(-?\d+(?:\.\d+)?)px\]/g,
    test: (m) => { const n = Math.abs(parseFloat(m[1])); return n % 4 !== 0 && n !== 1 && n !== 2; },
  },
  {
    name: "physical direction (use logical start/end)",
    // ml-/left- etc. need a value suffix so plain words like "right" in copy don't match
    re: /(?<![\w-])(?:-?(?:ml|mr|pl|pr|left|right|scroll-ml|scroll-mr)-[\w.[\]/]+|(?:border-[lr]|rounded-(?:[lr]|tl|tr|bl|br))(?:-[\w.[\]/]+)?|text-(?:left|right))(?![\w-])/g,
  },
  { name: "arbitrary color (use a semantic token)", re: /(?<![\w-])(?:bg|text|border|fill|stroke|ring|outline|from|to|via|decoration|shadow)-\[(?:#|rgb|hsl|oklch)[^\]]*\]/g },
];

function* walk(p) {
  if (SKIP.some((r) => r.test(p))) return;
  const s = statSync(p);
  if (s.isDirectory()) for (const f of readdirSync(p)) yield* walk(join(p, f));
  else if (EXT.has(extname(p))) yield p;
}

let count = 0;
for (const root of roots) {
  if (!existsSync(root)) { console.log(`skip: ${root} not found`); continue; }
  for (const file of walk(root)) {
    readFileSync(file, "utf8").split("\n").forEach((line, i) => {
      for (const rule of RULES)
        for (const m of line.matchAll(rule.re)) {
          if (rule.test && !rule.test(m)) continue;
          count++;
          console.log(`${file}:${i + 1}  ${rule.name}: ${m[0]}`);
        }
    });
  }
}
console.log(count ? `\n${count} violation(s)` : "No spacing, direction or color violations.");
process.exit(count ? 1 : 0);

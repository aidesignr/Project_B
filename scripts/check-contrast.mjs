// Checks WCAG 2.2 AA contrast for every foreground/background token pair in
// tokens/tokens.css, in both themes, and reports failures.
// Run: node scripts/check-contrast.mjs [--verbose]   (exit 1 on any failure)
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../tokens/tokens.css", import.meta.url), "utf8");
const verbose = process.argv.includes("--verbose");

function block(start) {
  const i = css.indexOf(start);
  const body = css.slice(css.indexOf("{", i) + 1, css.indexOf("\n}", i));
  return Object.fromEntries([...body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\b/g)].map((m) => [m[1], m[2].toLowerCase()]));
}
const themes = { dark: block(":root,\n.dark"), light: block(".light,\n[data-theme=\"light\"]") };

const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

const TEXT = 4.5, UI = 3;
const SURFACES = ["background", "card", "popover", "surface-0", "surface-1", "surface-2", "surface-3"];
const SETS = {
  severity: ["critical", "high", "medium", "low", "info"],
  status: ["open", "in-progress", "resolved", "ignored"],
  health: ["healthy", "at-risk", "failing"],
};

// [foreground token, background tokens, minimum ratio, kind]
const rules = [
  ["foreground", SURFACES, TEXT, "text"],
  ["card-foreground", ["card"], TEXT, "text"],
  ["popover-foreground", ["popover"], TEXT, "text"],
  ["muted-foreground", [...SURFACES, "muted", "accent"], TEXT, "text"],
  ["primary-foreground", ["primary"], TEXT, "text"],
  ["destructive-foreground", ["destructive"], TEXT, "text"],
  ["destructive-text", [...SURFACES, "muted"], TEXT, "text"],
  ["error-foreground", [...SURFACES, "error-muted"], TEXT, "text"],
  ["error-border", SURFACES, UI, "ui"],
  ["success-foreground", [...SURFACES, "success-muted"], TEXT, "text"],
  ["info-foreground", ["info-muted"], TEXT, "text"],
  ["foreground", ["pane"], TEXT, "text"],
  ["muted-foreground", ["pane"], TEXT, "text"],
  ["dot", ["pane"], UI, "ui"],
  ["ring", ["pane"], UI, "ui"],
  ["secondary-foreground", ["secondary"], TEXT, "text"],
  ["accent-foreground", ["accent"], TEXT, "text"],
  ["sidebar-foreground", ["sidebar", "sidebar-accent"], TEXT, "text"],
  ["sidebar-accent-foreground", ["sidebar-accent"], TEXT, "text"],
  ["sidebar-primary-foreground", ["sidebar-primary"], TEXT, "text"],
  ["link", SURFACES, TEXT, "text"],
  ["foreground", Array.from({ length: 8 }, (_, i) => `avatar-${i + 1}`), TEXT, "text"],
  ["chart-label", ["chart-surface"], TEXT, "text"],
  ["graph-node-foreground", ["graph-node"], TEXT, "text"],
  ["primary", ["background", "card", "popover"], UI, "ui"],
  ["input", SURFACES, UI, "ui"],
  ["ring", [...SURFACES, "muted", "primary"].filter((s) => s !== "primary"), UI, "ui"],
  ["sidebar-ring", ["sidebar", "sidebar-accent"], UI, "ui"],
  ["graph-node-border", ["graph-canvas", "graph-cluster"], UI, "ui"],
  ["graph-node-selected", ["graph-canvas", "graph-node"], UI, "ui"],
  ["graph-edge-attack", ["graph-canvas", "graph-cluster"], UI, "ui"],
  ...Object.entries(SETS).flatMap(([set, levels]) => levels.flatMap((l) => {
    const t = `${set}-${l}`;
    const r = [
      [`${t}-foreground`, [...SURFACES, `${t}-muted`], TEXT, "text"],
      [`${t}-border`, SURFACES, UI, "ui"],
    ];
    // status/health solids are used as standalone icons and dots → must be ≥3:1
    if (set !== "severity") r.push([t, SURFACES, UI, "ui"]);
    return r;
  })),
];

// Chart marks: ≥3:1 on the chart surface, or listed here under the relief rule
// (always shipped with visible labels or a table view — D-022, D-023).
const RELIEF = { light: ["severity-medium", "severity-info", "chart-3", "chart-4", "chart-5"], dark: [] };
const MARKS = [...SETS.severity.map((s) => `severity-${s}`), ...Array.from({ length: 8 }, (_, i) => `chart-${i + 1}`)];

let fails = 0, checks = 0;
for (const [name, t] of Object.entries(themes)) {
  const lines = [];
  for (const [fg, bgs, min, kind] of rules)
    for (const bg of bgs) {
      checks++;
      if (!t[fg] || !t[bg]) { fails++; lines.push(`  MISSING ${fg} on ${bg}`); continue; }
      const r = ratio(t[fg], t[bg]);
      const ok = r >= min;
      if (!ok) fails++;
      if (!ok || verbose) lines.push(`  ${ok ? "PASS" : "FAIL"}  ${r.toFixed(2).padStart(5)}  ${fg} on ${bg}  (${kind} ≥ ${min})`);
    }
  for (const m of MARKS) {
    checks++;
    const r = ratio(t[m], t["chart-surface"]);
    const relief = RELIEF[name].includes(m);
    if (r < UI && !relief) fails++;
    if (r < UI || verbose) lines.push(`  ${r >= UI ? "PASS" : relief ? "RELIEF" : "FAIL"}  ${r.toFixed(2).padStart(5)}  ${m} mark on chart-surface`);
  }
  console.log(`\n=== ${name}\n${lines.join("\n") || "  all pass"}`);
}
console.log(`\n${checks} checks · ${fails ? `${fails} failure(s)` : "all pass WCAG 2.2 AA"}`);
process.exit(fails ? 1 : 0);

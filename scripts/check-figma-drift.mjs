// Checks that the obra-ds library's "shadcn colors" variables match tokens/tokens.json (D-048).
// Run: node scripts/check-figma-drift.mjs [export.json]   (exit 1 on any drift)
//      node scripts/check-figma-drift.mjs --print-export   prints the read-only plugin
//      script that returns the live values; save its JSON result to
//      tokens/figma/shadcn-colors.export.json (the default file checked here).
// The committed export is the last verified state of the library, so a token
// change fails this check until the library is synced and re-exported.
import { existsSync, readFileSync } from "node:fs";
import { COLLECTION, MAP, MODES, expectedValues } from "./figma-color-map.mjs";

if (process.argv.includes("--print-export")) {
  console.log(`// Read-only. Run in the obra-ds library file; save the returned JSON as tokens/figma/shadcn-colors.export.json
const MODES = ${JSON.stringify(MODES)};
const NAMES = ${JSON.stringify(Object.keys(MAP))};
const col = (await figma.variables.getLocalVariableCollectionsAsync()).find((c) => c.name === ${JSON.stringify(COLLECTION)});
const hex = (c) => "#" + [c.r, c.g, c.b].map((x) => Math.round(x * 255).toString(16).padStart(2, "0")).join("");
const resolve = async (val, modeId, depth = 0) => {
  if (val && val.type === "VARIABLE_ALIAS") { const a = await figma.variables.getVariableByIdAsync(val.id); return depth > 6 || !a ? null : resolve(a.valuesByMode[modeId] ?? Object.values(a.valuesByMode)[0], modeId, depth + 1); }
  return val && "r" in val ? hex(val) : null;
};
const out = {};
for (const id of col.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  if (!NAMES.includes(v.name)) continue;
  out[v.name] = {};
  for (const m of col.modes) if (MODES[m.name]) out[v.name][MODES[m.name]] = await resolve(v.valuesByMode[m.modeId], m.modeId);
}
return out;`);
  process.exit(0);
}

const file = process.argv[2] ?? new URL("../tokens/figma/shadcn-colors.export.json", import.meta.url);
if (!existsSync(file)) { console.error(`No export at ${file}. Run with --print-export first.`); process.exit(1); }
const live = JSON.parse(readFileSync(file, "utf8"));
const expected = expectedValues();

let drift = 0;
for (const [name, want] of Object.entries(expected)) {
  for (const theme of ["light", "dark"]) {
    const got = live[name]?.[theme]?.toLowerCase();
    if (got !== want[theme]) { drift++; console.log(`  DRIFT  ${theme.padEnd(5)}  ${name}: Figma ${got ?? "missing"} ≠ token ${MAP[name]} ${want[theme]}`); }
  }
}
const total = Object.keys(expected).length * 2;
console.log(drift ? `\n${drift} of ${total} values drifted. Run node scripts/sync-figma-colors.mjs and apply it to the library.` : `\n${total} values match tokens.json`);
process.exit(drift ? 1 : 0);

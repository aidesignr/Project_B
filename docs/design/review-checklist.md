# Review checklist: new screen or component

Copy into the PR description. Mark each row **Pass**, **Fail** or **N/A** (N/A needs a reason).
**Any Fail blocks the merge**, unless a decision-log entry accepts it.

## 0 · Automated gates

| ID | Check | How | Result |
|---|---|---|---|
| A1 | Token contrast passes | `node scripts/check-contrast.mjs` exits 0 | |
| A2 | No off-grid spacing, physical directions or raw colors | `node scripts/check-spacing.mjs src` exits 0 | |
| A3 | No missing translations | `formatjs extract` + `compile` succeed for en, ar, ja | |
| A4 | No literal strings in JSX | ESLint `formatjs/no-literal-string-in-jsx` | |
| A5 | No serious/critical a11y violations | axe-core on the route, both themes, en + ar | |
| A6 | `tokens.json` in sync | `node scripts/build-tokens-json.mjs` produces no diff | |

## Test matrix

Review the screen in every cell below and attach a screenshot of each.

| | en | ar (RTL) | ja | en-XA (+40%) |
|---|---|---|---|---|
| **Dark** (default) | ☐ | ☐ | ☐ | ☐ |
| **Light** | ☐ | ☐ | ☐ | — |

Viewports: 1280, 1440 and 1920 wide (dark + en is enough for viewport checks).

## 1 · Competitor-informed patterns ([01](01-competitor-analysis.md))

| ID | Check | Result |
|---|---|---|
| 1.1 | Uses the matching pattern P1–P7 where one applies (e.g. ranked list before graph, KPI tiles filter content) | |
| 1.2 | No competitor asset, icon, illustration or signature visual style is copied | |
| 1.3 | No competitor jargon listed under Avoid ("toxic combination", "imminent compromise", "blast radius") | |

## 2 · Layout, style and visual language ([02](02-design-principles.md))

| ID | Check | Result |
|---|---|---|
| 2.1 | Built from shadcn/ui components; any new component has a row in the extension log | |
| 2.2 | The screen states which core question it answers (riskiest thing / better or worse / fix first) | |
| 2.3 | Exactly 1 primary button per region | |
| 2.4 | ≤3 text colors per view (`foreground`, `muted-foreground`, one semantic `-foreground`) | |
| 2.5 | Lucide icons at 16px (dense) or 20px (nav); none custom-drawn | |
| 2.6 | Correct logo file per theme; logo not recolored | |

## 3 · Data visualization ([05](05-data-visualization.md))

| ID | Check | Result |
|---|---|---|
| 3.1 | Each chart's title states its question or answer | |
| 3.2 | Each chart leads to an action: a click filters, drills down or opens the detail panel | |
| 3.3 | Scope, time range and freshness are visible | |
| 3.4 | Chart type matches the question → chart table; no dual axis, pie >4 slices, gauge, 3D or radar | |
| 3.5 | Loading, empty, partial, error and stale states are designed | |
| 3.6 | Text summary in the `figcaption` + "View as table" toggle | |
| 3.7 | Legend for ≥2 series; direct labels for ≤4 series; values use text tokens, not series colors | |
| 3.8 | Severity colors only for severity data; categorical colors in fixed order; ≤3 series in scatter/small multiples | |
| 3.9 | Marks below 3:1 (light: severity medium/info, chart-3/4/5) have visible labels or the table view | |

## 4 · Dark and light mode ([04](04-color-and-severity.md))

| ID | Check | Result |
|---|---|---|
| 4.1 | Screenshots in both themes attached (test matrix) | |
| 4.2 | No `dark:`/`light:` color utilities in our components | |
| 4.3 | Elevation uses `surface-1/2/3` + `shadow-1/2/3`; layers are distinguishable in both themes | |
| 4.4 | Charts, severity badges, borders and focus rings are checked visually in both themes | |

## 5 · Status and severity color ([04](04-color-and-severity.md), [02](02-design-principles.md#alert-fatigue-rules))

| ID | Check | Result |
|---|---|---|
| 5.1 | Every severity, status and health indicator has icon + text (icon-only only in table cells, with `aria-label` + tooltip) | |
| 5.2 | No text placed on a solid severity/status/health fill | |
| 5.3 | A grayscale screenshot is still understandable | |
| 5.4 | AF1: Resolved/Ignored items carry no severity color | |
| 5.5 | AF2–AF3: no severity row tints; no Critical/High fill larger than a 4px accent | |
| 5.6 | AF4–AF5: a zero KPI is neutral; at most 1 page banner | |
| 5.7 | `destructive` used only for destructive actions, never for severity | |

## 6 · Copy ([06](06-content-and-tone.md))

| ID | Check | Result |
|---|---|---|
| 6.1 | Alerts, findings and errors state what happened → why it matters → what to do next | |
| 6.2 | Sentence case; buttons are verb + object, ≤3 words; no "!" | |
| 6.3 | No word from the banned list | |
| 6.4 | Glossary plain terms used; any remaining technical term has a tooltip | |
| 6.5 | Empty states follow the matching pattern (good news / not set up / filtered / loading) | |
| 6.6 | Destructive actions follow the right tier (Undo / AlertDialog / type to confirm) | |
| 6.7 | AI output has: label, confidence + reason, evidence links, limits, a next step, feedback; it never acts unconfirmed | |
| 6.8 | "Why am I seeing this?" is available on alerts, findings, recommendations and AI answers | |
| 6.9 | AskAI speaks as "I" only inside AskAI (product copy uses "We"); no feelings, jokes or apologies; the name is untranslated | |

## 7 · Grid and spacing ([03](03-layout-and-grid.md))

| ID | Check | Result |
|---|---|---|
| 7.1 | All spacing, sizes and radii are multiples of 4 (A2 passes; exceptions only: 1/2px borders, focus ring, chart gaps) | |
| 7.2 | Regions snap to the 12-column grid at 1280, 1440 and 1920 | |
| 7.3 | Density tokens used: controls 32, rows 36/28, detail panel 480/560 | |
| 7.4 | No page-level horizontal scroll at 1280 | |

## 8 · i18n and RTL ([07](07-i18n-and-rtl.md))

| ID | Check | Result |
|---|---|---|
| 8.1 | All strings through react-intl with semantic keys and descriptions (A3, A4 pass) | |
| 8.2 | ICU plurals for every count (Arabic has 6 forms); no concatenation | |
| 8.3 | **ar:** layout mirrored; sidebar on the right; directional icons flipped; time axes, numbers, IDs and logos not mirrored | |
| 8.4 | **ar:** Western digits by default; technical values wrapped in `<bdi>`; no letter-spacing; no italics | |
| 8.5 | **ja:** no awkward line breaks inside words, numbers or units; no italics | |
| 8.6 | **en-XA:** no clipped or overlapping text at +40% | |
| 8.7 | Dates, numbers, percents and relative times use `Intl` with the active locale | |
| 8.8 | No text baked into images, SVG illustrations or chart canvases | |

## 9 · Accessibility ([08](08-accessibility.md))

| ID | Check | Result |
|---|---|---|
| 9.1 | A1 + A5 pass | |
| 9.2 | Keyboard only: the persona's top task completes; tab order matches visual order (in en and ar) | |
| 9.3 | Focus ring visible on every interactive element and never hidden by sticky elements | |
| 9.4 | Overlays trap focus, close on Esc and return focus to the trigger | |
| 9.5 | Targets ≥24×24; every drag action has a click/keyboard alternative | |
| 9.6 | Complex components use the ARIA pattern in 08 (table, menu, combobox, dialog, chart, graph) | |
| 9.7 | Screen reader (NVDA or VoiceOver) announces names, roles, states, filter result counts and AI completion | |
| 9.8 | Reduced motion: no animation; no flashing or pulsing | |
| 9.9 | 200% zoom and 320px reflow work; the text-spacing override clips nothing | |
| 9.10 | `forced-colors` mode: borders, focus and severity icons remain visible | |

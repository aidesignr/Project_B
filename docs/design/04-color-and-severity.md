# 04 · Color, severity, status and health

All colors are **semantic CSS variables** in `tokens/tokens.css`, exposed as Tailwind utilities by `tokens/theme.css` (`bg-card`, `text-severity-high-foreground` …). The default Tailwind palette is removed, so `red-500` doesn't compile. Themes switch by swapping variables. Our components never use `dark:`/`light:` color overrides.

**Verify after any token change:** `node scripts/check-contrast.mjs` → must report `all pass` (currently **606 checks**, both themes).

## Files

| File | Role |
|---|---|
| `tokens/tokens.css` | Source of truth: colors, elevation, layout, density, motion (dark default + light) |
| `tokens/theme.css` | Tailwind v4 `@theme`: spacing, breakpoints, type, radius, shadows, easing; color → utility mapping; per-language type |
| `tokens/tokens.json` | W3C Design Tokens export for Figma sync. **Generated:** `node scripts/build-tokens-json.mjs`. Never edit by hand. |
| `public/brand/accuknox-logo-on-dark.svg` · `-on-light.svg` | Theme logos; `--logo` points to the right one per theme |
| `scripts/figma-color-map.mjs` | Maps the obra-ds Figma library's `shadcn colors` variables to our tokens (D-048), including AccuKnox additions under `shadcn colors/accuknox/` (`avatar 1`–`avatar 8`, D-070) |
| `tokens/figma/sync-shadcn-colors.js` | **Generated:** `node scripts/sync-figma-colors.mjs`. Plugin script that writes our values into the library. |
| `tokens/figma/shadcn-colors.export.json` | Last exported library values. `node scripts/check-figma-drift.mjs` fails if they differ from `tokens.json`. |

## Neutrals and brand

Neutrals follow the **Obra kit's Tailwind gray scale** (read from Figma 2026-10-18, D-044). Kit values shown where they differ.

| Token | Dark (default) | Light | Obra kit (light) | Use |
|---|---|---|---|---|
| `background` / `surface-0` | `#030712` | `#FFFFFF` / `#F9FAFB` | — | page |
| `card` / `surface-1` | `#111827` | `#FFFFFF` | — | cards, tables |
| `popover` / `surface-2` / `surface-3` | `#1F2937` | `#FFFFFF` | — | menus, panels, dialogs (dark: separated by elevation borders) |
| `foreground` | `#F9FAFB` | `#000000` | `#000000` | primary text |
| `secondary` / `muted` / `accent` | `#1F2937` | `#F3F4F6` | `#F3F4F6` | subtle fills |
| `secondary-foreground` | `#F9FAFB` | `#111827` | `#111827` | text on subtle fills |
| `muted-foreground` | `#9CA3AF` | `#4B5563` | `#6B7280` ✗ 4.39 on muted | secondary text |
| `border` | `#1F2937` | `#E5E7EB` | `#E5E7EB` | **decorative** dividers only |
| `input` | `#737B8A` | `#868C98` | — | control outlines (≥3:1) |
| `primary` | `#1E6FE8` | `#1565D8` | `#1D4ED8` | primary action, selection (D-012, D-043) |
| `ring` | `#4D94FF` | `#1565D8` | `#D1D5DB` ✗ 1.47 | focus ring |
| `link` | `#6AA8FF` | `#0F5BC4` | — | inline links (always underlined) |
| `destructive` | `#C81E28` | `#DC2626` | `#DC2626` | destructive buttons. **Not** severity. |
| `destructive-text` | `#F87171` | `#B91C1C` | `#F87171` / `#DC2626` ✗ 4.39 on muted | red text and strokes on surfaces: error labels, field errors (D-048). Figma's `destructive` maps here. |

✗ = kit value fails WCAG AA; ours wins under priority 1 (D-045).

**Elevation:** `shadow-1/2/3` (from `--elevation-1/2/3`) + `surface-1/2/3`. Dark = lighter surface + 1px border. Light = shadow + border.

## Token anatomy for severity, status and health

| Suffix | Utility example | Use | Contrast rule |
|---|---|---|---|
| *(solid)* | `bg-severity-high`, `fill-severity-high` | Chart marks, dots, ≤4px accent bars, standalone icons (status/health) | ≥3:1 marks (relief rule in 05) |
| `-foreground` | `text-severity-high-foreground` | Text and icons in badges, cells, chips | ≥4.5:1 on background, card, popover and own `-muted` |
| `-muted` | `bg-severity-high-muted` | Badge/chip background | — |
| `-border` | `border-severity-high-border` | Outlined badge/chip | ≥3:1 on background, card, popover |

**Never put text on a solid fill.**

## Severity: definitions and response times

Severity = base impact, adjusted by context (D-019): internet-exposed, exploit available, production, sensitive data. Each finding also carries a **risk score 0–100** (integer, D-020), always shown with its severity name.

| Level | Score | Means (plain words) | Target fix time | Icon (Lucide) |
|---|---|---|---|---|
| **Critical** | 90–100 | Can be exploited now and would cause serious damage | **24 hours** | `octagon-alert` |
| **High** | 70–89 | Likely to be exploited, with significant impact | **7 days** | `triangle-alert` |
| **Medium** | 40–69 | Exploitable only if other conditions are met | **30 days** | `circle-alert` |
| **Low** | 10–39 | Small risk or hard to exploit | **90 days** | `circle-minus` |
| **Info** | 0–9 | No direct risk; good-practice advice | No deadline | `info` |

Each icon shape is unique, so severity reads in grayscale. Order is always Critical → Info (mirrored in RTL).

| Level | Dark: solid · fg · muted · border | Light: solid · fg · muted · border |
|---|---|---|
| Critical | `#E5343F` · `#FF8B8F` · `#3A1417` · `#C9434A` | `#A8131A` · `#B4161F` · `#FDECEC` · `#D9545B` |
| High | `#FF8A3D` · `#FFA463` · `#361D0C` · `#C46A2C` | `#E8590C` · `#A84200` · `#FFF0E4` · `#D0661F` |
| Medium | `#FFD04D` · `#F7C95C` · `#33270B` · `#B8891F` | `#F4B400` · `#875900` · `#FFF6D9` · `#B7862A` |
| Low | `#7894E0` · `#B3BFD4` · `#1D222C` · `#5F78BD` | `#5B7BD5` · `#475672` · `#EEF1F6` · `#7489C4` |
| Info | `#6B7280` · `#9CA3AF` · `#1F2937` · `#737B8A` | `#9CA3AF` · `#4B5563` · `#F3F4F6` · `#868C98` |

**Severity badge:** `-muted` background · 16px icon + label in `-foreground` · `rounded-sm` · height 20 · padding-inline 8. The label is always visible. Icon-only is allowed in table cells, with a tooltip and `aria-label`.

## Status (workflow state)

| Status | Icon | Dark: solid · fg · muted · border | Light: solid · fg · muted · border | Note |
|---|---|---|---|---|
| Open | `circle` | `#D1D5DB` · `#E5E7EB` · `#1F2937` · `#737B8A` | `#374151` · `#374151` · `#F3F4F6` · `#868C98` | Neutral on purpose: urgency comes from severity |
| In progress | `circle-dashed` | `#5B9DFF` · `#8FBCFF` · `#13233D` · `#3D7FE0` | `#1565D8` · `#0F5BC4` · `#EAF2FD` · `#5B8FE0` | Static icon (no spinner) |
| Resolved | `circle-check` | `#3FBF6F` · `#6FD896` · `#11291B` · `#2F9E5A` | `#16833F` · `#126B34` · `#E8F6ED` · `#3F9A62` | |
| Ignored | `circle-slash` | `#9CA3AF` · `#9CA3AF` · `#1F2937` · `#737B8A` | `#6B7280` · `#4B5563` · `#F3F4F6` · `#868C98` | Always show reason + who |

## Health (posture of an asset, account or control)

| Health | Icon | Dark: solid · fg · muted · border | Light: solid · fg · muted · border |
|---|---|---|---|
| Healthy | `shield-check` | `#3FBF6F` · `#6FD896` · `#11291B` · `#2F9E5A` | `#16833F` · `#126B34` · `#E8F6ED` · `#3F9A62` |
| At risk | `shield-alert` | `#F0B429` · `#F7C95C` · `#33270B` · `#B8891F` | `#B97A00` · `#875900` · `#FFF6D9` · `#B7862A` |
| Failing | `shield-x` | `#F2555A` · `#FF8B8F` · `#3A1417` · `#C9434A` | `#D92D36` · `#B4161F` · `#FDECEC` · `#D9545B` |

Health deliberately shares hues with severity (at risk ≈ medium, failing ≈ critical). Health always uses shield icons, so the two never get confused.

## Alert fatigue (rules AF1–AF7 in 02)

| Situation | Treatment |
|---|---|
| Open Critical/High finding | Full severity color (badge, icon, accent bar) |
| Resolved or Ignored finding | Icon + label in `muted-foreground`; no severity color |
| Table row | Only the severity cell is colored; no row tint |
| KPI = 0 | Neutral text + check icon |
| Page banner | Max 1 at a time; never a solid Critical/High fill (use `-muted` + `-border`) |

## Measured contrast (worst case per group, from `check-contrast.mjs`)

| Group | Dark | Light | Min |
|---|---|---|---|
| `foreground` on any surface | 14.05 | 20.10 | 4.5 |
| `muted-foreground` on `muted` | 5.78 | 6.87 | 4.5 |
| `primary-foreground` on `primary` | 4.67 | 5.41 | 4.5 |
| Severity `-foreground` on any surface or own `-muted` | 5.78 (info on popover) | 5.47 (high on its muted) | 4.5 |
| Status/health `-foreground` on any surface or own `-muted` | 5.78 (ignored on popover) | 5.62 (in progress on its muted) | 4.5 |
| Any `-border` on any surface | 3.07 (critical on popover) | 3.11 (medium on surface-0) | 3.0 |
| `input` on any surface | 3.45 | 3.23 | 3.0 |
| `ring` on any surface | 4.89 | 4.91 | 3.0 |

"Any surface" = background, card, popover, surface-0…3.

Chart marks below 3:1 (light only: severity Medium/Info, chart 3/4/5) are allowed under the relief rule in 05.

## Theme rules

| Rule | Test |
|---|---|
| Dark is default (`:root`). Light via `.light` or `[data-theme="light"]` on `<html>`. | App renders dark with no class |
| No `dark:`/`light:` color utilities in our components | `grep -rE "(dark|light):(bg|text|border|fill|stroke)-" src --exclude-dir=ui` returns nothing |
| First visit follows the OS (`prefers-color-scheme`); the user's choice persists after that | |
| Logo via `--logo` or the theme-matching SVG; never recolor the logo | |

## Figma sync (D-048)

The obra-ds Figma library takes its `shadcn colors` values from our tokens, never the other way round.
1. Change `tokens/tokens.css`, then run `node scripts/build-tokens-json.mjs` and `node scripts/check-contrast.mjs`.
2. Run `node scripts/sync-figma-colors.mjs`, then run `tokens/figma/sync-shadcn-colors.js` in the obra-ds file (Figma MCP `use_figma`, or the plugin console).
3. Publish the library in Figma and accept the update in files that use it.
4. Export the live values (`node scripts/check-figma-drift.mjs --print-export`), save them to `tokens/figma/shadcn-colors.export.json`, and run `node scripts/check-figma-drift.mjs`. It must exit 0.

**AccuKnox additions.** A token the Obra kit has no variable for goes under `shadcn colors/accuknox/` in the same collection, so it switches with the kit's light and dark modes. Add it to `MAP` in `figma-color-map.mjs`; the sync script creates any missing variable under that prefix (fill scopes only) and refuses to create kit names. Today: `avatar 1`–`avatar 8` (D-070), synced 2026-10-27.

## Form feedback and auth tokens (login app)

Added for the login screens so the app matches the validated canvas without raw colors. All text pairs are in `check-contrast.mjs`.

| Token | Dark | Light | Use |
|---|---|---|---|
| `error-muted` / `error-foreground` / `error-border` | `#3A1417` / `#FF8B8F` / `#C9434A` | `#FDECEC` / `#B4161F` / `#D9545B` | Error banner, field errors, invalid input border |
| `success-muted` / `success-foreground` | `#11291B` / `#6FD896` | `#E8F6ED` / `#126B34` | Success icon chip, met password rule |
| `info-muted` / `info-foreground` | `#13233D` / `#8FBCFF` | `#EAF2FD` / `#0F5BC4` | Info icon chip |
| `control-border` | `#374151` | `#D1D5DB` | Outline buttons and toggle groups only (text identifies them). Below 3:1, so never an input outline (D-049). |
| `track` | `#374151` | `#D1D5DB` | Unfilled progress bars (decorative; the step label carries the meaning) |
| `pane` | `#111827` | `#F9FAFB` | Auth feature pane background |
| `dot` | `#6B7280` | `#6B7280` | Inactive carousel dot (≥3:1 on `pane`) |

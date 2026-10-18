# 03 · Layout and grid

## Hard rules

| Rule | Testable as |
|---|---|
| Every spacing, size and radius is a multiple of **4px** | `node scripts/check-spacing.mjs` passes: no `0.5`/`1.5`/`2.5`/`3.5` utilities and no arbitrary `[13px]` values outside `components/ui` (D-029). |
| Exceptions | Only 1px/2px borders, 2px focus ring + 2px offset, and 2px chart gaps. Font sizes 14 and 18 are allowed; their line-heights stay on the grid. |
| Layouts use the **12-column grid** | Region widths are expressed in columns (`col-span-*`), never fixed px. The exceptions are sidebar and detail panel, which are tokens. |
| Logical properties only | `ps-/pe-/ms-/me-/start-/end-/text-start`. Never `pl-/pr-/ml-/mr-/left-/right-/text-left` (see 07). |

## Breakpoints (desktop only)

| Token | Min width | Columns | Gutter | Outer margin | Detail panel |
|---|---|---|---|---|---|
| (base) | 1280 | 12 | 16 | 24 | 480 |
| `xl` | 1440 | 12 | 24 | 32 | 560 |
| `2xl` | 1920 | 12 | 24 | 32 | 560; content max width 1920, centered |

Below 1280px: no mobile layout. The page scrolls horizontally inside the main region, never the whole app. It must still **reflow at 400% zoom** (see 08).

## App shell

```
┌──────────┬───────────────────────────────────────────────┐
│ Sidebar  │ Header 56 — breadcrumb · scope/filter · search│
│ 240      ├───────────────────────────────────────────────┤
│ (56      │ Page title row (title · freshness · actions)  │
│ collapsed│ KPI tiles row                                 │
│ )        │ Content (12-col grid)          │ Detail panel │
│          │                                 │ 480/560     │
└──────────┴───────────────────────────────────────────────┘
```

| Region | Spec |
|---|---|
| Sidebar | 240 expanded, 56 collapsed. Item height 32, icon 20, padding-inline 12. |
| Header | 56 high. Holds the global scope (account/cluster/project) and time range on the inline-end side. |
| Page title row | H1 `text-xl/28`. Freshness ("Updated 2 min ago") is always visible. One primary action max. |
| Detail panel | Opens on the inline-end side and **pushes** content (doesn't overlay) at ≥1440. At 1280 it overlays with a scrim. Close with Esc; focus returns to the trigger row. |

## Dashboards

| Rule | Value |
|---|---|
| KPI tile | 3 cols (4 per row) or 2 cols (6 per row) at ≥1440. Height 96. Padding 16. |
| Chart card | Min 4 cols. Standard heights 240 / 320 / 400. Padding 16. Header 40. |
| Card gap | Equals the gutter (16 / 24) |
| Vertical rhythm | 24 between sections, 16 inside cards, 8 between label and value |
| Order | Top-left = the most important question. Reading order = priority order, mirrored in RTL. |

## Tables (dense default)

| Element | Value |
|---|---|
| Row height | 36 (default), 28 (compact toggle). Never below 28. |
| Cell padding | inline 12, block 8 |
| Header | 36, `text-xs/16` medium, `--muted-foreground`, sticky |
| Numbers | `tabular-nums`, aligned to the inline end |
| First column | Severity icon (16) + title. Truncate with a tooltip; never wrap beyond 2 lines. |
| Toolbar | 48 high. Search · filters · group-by · columns · export. Bulk actions replace the toolbar when rows are selected. |

## Spacing scale (reference)

| Token | px | Typical use |
|---|---|---|
| 1 | 4 | icon-to-text inside a badge |
| 2 | 8 | label → value, chip gap |
| 3 | 12 | cell padding, control padding |
| 4 | 16 | card padding, gutter (base) |
| 6 | 24 | section gap, gutter (xl) |
| 8 | 32 | page margin (xl) |
| 12 | 48 | empty-state block padding |

## Radius

| Token | px | Use |
|---|---|---|
| `rounded-sm` | 4 | badges, checkboxes, bar ends |
| `rounded-md` | 8 | buttons, inputs, menus |
| `rounded-lg` | 8 | popovers, tooltips |
| `rounded-xl` | 12 | cards, dialogs, panels |
| `rounded-full` | — | avatars, status dots |

## Type scale

| Token | Size / line-height | Use |
|---|---|---|
| `text-xs` | 12 / 16 | table headers, captions, axis labels |
| `text-sm` | 14 / 20 | **default** UI and table body |
| `text-base` | 16 / 24 | reading text (AI answers, docs) |
| `text-lg` | 18 / 28 | card titles (sparingly) |
| `text-xl` | 20 / 28 | page title (H1) |
| `text-2xl` | 24 / 32 | KPI values |
| `text-3xl` | 32 / 40 | hero number (max 1 per page) |

Weights: 400 body, 500 labels and headers, 600 titles and KPI values. No 700+ in the UI.
Arabic and Japanese use taller line-heights (`text-sm` 14/24, `text-base` 16/28), applied automatically via `:lang()` in `tokens/theme.css` (see 07).

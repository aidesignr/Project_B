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

Approved layout **A2** (D-053 to D-060). Design source: the "AccuKnox app shell" canvas, page "A2 · Approved" (annotated spec and responsive notes there). Code: `src/components/shell/`.

```
┌──────────┬───────────────────────────────────────────────────────────┐
│ Sidebar  │ Header 48 — pin · Module › Page (H1) · search · tenant ·  │
│ 56 rail  │             Help · AskAI · notifications                  │
│ (240 on  ├───────────────────────────────────────────────────────────┤
│ hover,   │ Toolbar — filters and tabs · freshness · one action       │
│ overlay; │ Module slot (12-col grid)               │ AskAI 480/560   │
│ pinned   │                                          │ (overlay)       │
│ pushes)  │                                          │                 │
└──────────┴───────────────────────────────────────────────────────────┘
```

| Region | Spec |
|---|---|
| Sidebar | 56 rail / 240 expanded. Unpinned: expands over content on hover intent (120 / 160 ms) or focus. Pinned: 240, content pushed. Logo row 48. Level 1 rows 32, level 2 rows 28, gap 4, icon 20 in a 24 box. Level 2 groups collapsed by default (D-056). |
| Header | 48 high (`--layout-header`), padding-inline 16. Fix-sidebar button first; breadcrumb ending in the page H1 (14/20 semibold); search icon; tenant/group 36; Help, AskAI, notifications. Below the sidebar in z order. |
| Toolbar | First row of every page, 32 high: filters and tabs, then freshness ("Updated 4 min ago") and at most one primary action. Replaces the old title row (D-058). |
| Content | Padding 12 top, 24 sides and bottom; gap 12; gutter 16 at every width (D-055). Fills the window; only `main` scrolls. |
| Detail / AskAI panel | Opens on the inline-end side below the header. AskAI overlays; detail panels push at ≥1440 and overlay at 1280. Close with Esc; focus returns to the trigger. |
| Widths | Works down to 1024; below 1280 the sidebar is forced unpinned (D-054). |

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
| `text-form-msg` | 12 / 16 (ar, ja: 12 / 20) | field error messages and password rules (D-067) |
| `text-sm` | 14 / 20 | **default** UI and table body |
| `text-base` | 16 / 24 | reading text (AI answers, docs) |
| `text-lg` | 18 / 28 | card titles (sparingly) |
| `text-xl` | 20 / 28 | page title (H1) |
| `text-2xl` | 24 / 32 | KPI values |
| `text-3xl` | 32 / 40 | hero number (max 1 per page) |

Weights: 400 body, 500 labels and headers, 600 titles and KPI values. No 700+ in the UI.
Arabic and Japanese use taller line-heights (`text-sm` 14/24, `text-base` 16/28), applied automatically via `:lang()` in `tokens/theme.css` (see 07).

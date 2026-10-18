# 05 · Data visualization

Density target: **dense**. Many small, precise charts beat a few big decorative ones.

## The contract: every visualization

| # | Must | Test |
|---|---|---|
| 1 | Answers one user question | The title states the question or the answer ("Critical findings fell 18% this month") |
| 2 | Leads to an action | Clicking a mark filters or drills down. The card has a "View findings" link. |
| 3 | Shows scope and freshness | Subtitle: scope · time range · "Updated 4 min ago" |
| 4 | Has a non-visual alternative | "View as table" toggle + a one-sentence text summary (see 08) |
| 5 | Never relies on color alone | Legend + direct labels (≤4 series) or icons |
| 6 | Uses one y-axis | Never a dual axis. Two measures = two charts. |

## Core user questions → chart

| Question | Chart | Notes |
|---|---|---|
| "How bad is it right now?" | KPI tile (number + delta + sparkline) | No chart if a number answers it |
| "What is my riskiest thing?" | Ranked horizontal bar or ranked table | Sorted descending. Top 10 + "View all". |
| "Is it getting better?" | Line or area over time | Show the delta vs. the previous period. Mark events (deploys, policy changes). |
| "What makes up my risk?" | Stacked bar by severity | Stack order: Critical at the baseline, so the most important segment is anchored |
| "What do I fix first?" | Ranked table with risk-factor chips | Not a chart. Priority = severity × risk factors. |
| "Where is risk concentrated?" | Heatmap (accounts × categories) | Sequential ramp, one hue. Cells clickable. |
| "How could an attacker get in?" | Risk/attack-path graph | Opened from a finding, never as a landing view (P1, see 01) |
| "Are we compliant?" | Bullet or progress bar per framework + table | % passing controls, with a target marker |
| "Who is on track?" | SLA bar (Overdue / Due soon / Not due) | Tiles filter the table (P2) |

**Don't use:** pie or donut with >4 slices (use a bar). 3D. Gauges (use a KPI tile with a target). Radar charts. Dual axes. Word clouds.

## Color in charts

| Job | Tokens | Rule |
|---|---|---|
| Severity | `--severity-*` solids | **Only** for severity-encoded data. Never mixed with categorical colors in one chart. |
| Categorical (identity) | `--chart-1 … --chart-8` | Fixed order, never cycled. A 9th series folds into "Other". Color follows the entity, not its rank. |
| Sequential (magnitude) | `--chart-seq-1 … 6` | One hue (blue). In dark mode high values are brighter. |
| Diverging (better/worse) | `--chart-div-better` · `-mid` · `-worse` | Gray midpoint. Equal steps per side. |
| Status/health | `--status-*` / `--health-*` | Reserved meaning. Never "series 4". |

**Validated** (OKLab ΔE ×100, Machado 2009 CVD simulation):

| Palette | Mode / surface | Worst adjacent CVD ΔE | Worst normal-vision ΔE | Contrast |
|---|---|---|---|---|
| Categorical 1–8 | light / `#FFFFFF` | 9.1 ✅ (≥8) | 19.6 ✅ (≥15) | slots 3,4,5 < 3:1 → relief rule |
| Categorical 1–8 | dark / `#111827` | 8.4 ✅ | 19.3 ✅ | all ≥ 3:1 ✅ |
| Severity C→I | light / `#FFFFFF` | 15.4 ✅ | 16.6 ✅ | Medium, Info < 3:1 → relief rule |
| Severity C→I | dark / `#111827` | 12.4 ✅ | 15.7 ✅ | all ≥ 3:1 ✅ |

The severity scale is intentionally outside the categorical lightness/chroma band. It's an ordered scale with a neutral Info.
Scatter, bubble and small multiples (all pairs adjacent): **max 3 categorical series.**

**Relief rule:** a mark below 3:1 on its surface must ship with a visible direct label or the table view, plus 2px surface gaps between segments.

## Mark specs

| Element | Spec |
|---|---|
| Line | 2px, round joins. Points 8px only on hover or sparse data. |
| Bar | Max 24px thick (dense). 4px radius on the data end only. 2px gap between bars and stacked segments. |
| Grid | Horizontal hairlines `--chart-grid` only. No vertical grid. |
| Axis labels | `text-xs`, `--chart-label`. ≤6 ticks. Locale-formatted (see 07). |
| Text | Labels, values and legends use text tokens, **never** the series color. |
| Legend | Present for ≥2 series. Placed above the plot, start-aligned. Clicking toggles the series. |
| Direct labels | For ≤4 series, label line ends. Never a number on every point. |
| Sparkline | 24px high, no axes, last-value dot, used inside KPI tiles and table cells |

## Showing change over time

- Always pair a value with a **delta**: `▲ 12 (+8%) vs previous 30 days`. Arrow + sign + text, never color alone.
- Delta color reflects *good or bad*, not up or down. Fewer critical findings = good (`--health-healthy`).
- Default range **30 days**. Presets: 24h · 7d · 30d · 90d · 12m · custom.
- Annotate events (deploys, policy changes, integrations added) as vertical markers with a tooltip.
- Comparison periods are dashed, at 60% opacity in the same hue.

## Interaction

| Behavior | Spec |
|---|---|
| Tooltip | On hover **and** keyboard focus. Shows date, series name, formatted value and delta. Hit area ≥24×24px, larger than the mark. |
| Crosshair | Line/area charts: vertical crosshair snaps to the nearest x. Tooltip lists all series sorted by value. |
| Click | Filters the page or opens the detail panel. The cursor shows a pointer. A focus ring appears on the focused mark. |
| Drill-down | Breadcrumb inside the card ("All accounts › prod-eu › S3"). Esc or Back goes up one level. |
| Filters | One filter row above the charts, shared by every chart on the page. Active filters shown as removable chips. |
| Brushing | Drag on a time chart to zoom. A "Reset zoom" button appears. |

## States

| State | Spec |
|---|---|
| Loading | Skeleton in the chart's shape (bars or line), no spinner. `aria-busy="true"`. Static when reduced motion is on. |
| Empty, good news | State the fact calmly, with no emoji or celebration: "No critical findings in the last 30 days." + a checkmark icon + what's monitored ("Checking 3 accounts, 1,204 resources"). |
| Empty, no data yet | Say why ("No accounts connected yet") + a primary action ("Connect a cloud account"). |
| Partial data | Banner inside the card: "Data from 2 of 5 accounts. 3 accounts are still scanning." |
| Error | "We couldn't load this chart." + reason if known + "Try again". Keep the card size stable. |
| Stale | Freshness text switches to `--severity-medium-foreground` with a clock icon when data is >2× the expected refresh interval. |

## Risk / attack-path graph

| Element | Spec |
|---|---|
| Layout | Left-to-right flow (entry point → target). **Mirrored in RTL.** Max 7 hops visible; collapse the rest. |
| Node | `--graph-node` fill, 1px `--graph-node-border`, `rounded-md`, 16px type icon + name. Max 160 wide, truncate with a tooltip. |
| Node severity | 4px inline-start accent bar in the severity solid + severity icon. Never fill the whole node. |
| Edge | 1px `--graph-edge`, with a plain-language label ("can read", "can reach from internet"). |
| Attack path | 2px `--graph-edge-attack` plus a dashed pattern, so it's not color alone |
| Selection | 2px `--graph-node-selected` ring. The detail panel opens. |
| A11y | A list view of the same path ("Step 1 of 4: Internet → load balancer …") is always available |

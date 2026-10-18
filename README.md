# AccuKnox Design System

Design principles, tokens and checks for the AccuKnox AI-powered cloud security platform.
It helps security engineers, cloud/DevOps engineers and security leaders see risk quickly and fix it with confidence.

- **Platform:** desktop web (min 1280px), dark mode by default, light mode fully supported
- **Languages:** English, Arabic (full RTL) and Japanese at launch
- **Accessibility:** WCAG 2.2 AA in both themes
- **Base kit:** [Obra shadcn/ui kit 2.0 (Nova)](https://www.figma.com/design/CFxxYv6TbuUzDW910DNv6v/obra-ds), extended only where it has gaps
- **Stack:** React + TypeScript + Vite · Tailwind v4 · shadcn/ui · Recharts · React Flow · TanStack Table · react-intl

## Repository layout

| Path | Contents |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | The rules every design and code task must follow (priority order + rules). Start here. |
| [`docs/design/`](docs/design/) | Detailed guidelines (see below) |
| [`tokens/tokens.css`](tokens/tokens.css) | **Source of truth**: semantic color, elevation, layout, density and motion tokens (dark default + light) |
| [`tokens/theme.css`](tokens/theme.css) | Tailwind v4 `@theme`: spacing, breakpoints, type, radius, color → utility mapping, per-language type |
| [`tokens/tokens.json`](tokens/tokens.json) | W3C Design Tokens export for Figma sync. Generated: don't edit by hand. |
| [`scripts/`](scripts/) | Contrast check, spacing/RTL/color lint, JSON builder |
| [`public/brand/`](public/brand/) | AccuKnox logos for dark and light backgrounds |

## Design docs

| Doc | Covers |
|---|---|
| [01 · Competitor analysis](docs/design/01-competitor-analysis.md) | Wiz, Orca, Upwind, Datadog: Adopt / Adapt / Avoid, and how we're different |
| [02 · Design principles](docs/design/02-design-principles.md) | Personas, priority order, 7 principles, alert-fatigue rules, extension log |
| [03 · Layout and grid](docs/design/03-layout-and-grid.md) | 12-column grid, 4px base, breakpoints, app shell, tables, type scale |
| [04 · Color and severity](docs/design/04-color-and-severity.md) | Neutrals, severity / status / health tokens, fix times, measured contrast |
| [05 · Data visualization](docs/design/05-data-visualization.md) | Question → chart guide, CVD-validated palettes, states, risk graph |
| [06 · Content and tone](docs/design/06-content-and-tone.md) | Voice, banned words, copy patterns, AskAI, glossary |
| [07 · i18n and RTL](docs/design/07-i18n-and-rtl.md) | react-intl setup, numerals, RTL mirroring, per-language typography |
| [08 · Accessibility](docs/design/08-accessibility.md) | Contrast, keyboard, ARIA patterns, chart alternatives, motion, reflow |
| [Decision log](docs/design/decision-log.md) | Every decision with its reason, alternatives and date |
| [Review checklist](docs/design/review-checklist.md) | Pass/fail checks for any new screen or component |

## Using the tokens

In the app's entry CSS:

```css
@import "tailwindcss";
@import "../tokens/tokens.css";
@import "../tokens/theme.css";
```

Then use semantic utilities only: `bg-card`, `text-muted-foreground`, `bg-severity-critical-muted`, `text-severity-critical-foreground`, `fill-chart-1`, `shadow-2`.
Light mode: add `class="light"` (or `data-theme="light"`) to `<html>`. Dark is the default, with no class needed.

## Checks

Requires Node 18+. Run from the repository root.

Contrast for every foreground/background token pair, both themes (must exit 0):

```bash
node scripts/check-contrast.mjs
```

4px grid, logical (RTL-safe) properties and no raw colors in source (must exit 0):

```bash
node scripts/check-spacing.mjs src
```

Regenerate `tokens/tokens.json` after changing any token:

```bash
node scripts/build-tokens-json.mjs
```

## Contributing

1. Read [`CLAUDE.md`](CLAUDE.md). When rules conflict, the priority order there decides.
2. Change tokens only in `tokens/tokens.css` or `tokens/theme.css`, then run all three scripts.
3. Record any new decision or exception in the [decision log](docs/design/decision-log.md).
4. Complete the [review checklist](docs/design/review-checklist.md) in dark + light and en + ar + ja before merging.

# AccuKnox: design system rules

AI-powered cloud security platform. Desktop web (min 1280px). Dark mode is the default.
Users: security engineers, cloud/DevOps engineers, security leaders. They are time-pressed, wary of false alarms and accountable, so design for fast understanding and confident action.
Every screen answers at least one of: **What is my riskiest thing? · Is it getting better or worse? · What should I fix first, and how?**

Stack: React + TypeScript + Vite · Tailwind v4 · shadcn/ui (Obra kit 2.0, Nova) · Recharts · React Flow · TanStack Table · react-intl.

## Priority order (resolves every conflict)
1. Accessibility (WCAG 2.2 AA) and user safety
2. Clarity and trust (plain language, honest uncertainty)
3. Consistency with the Obra shadcn/ui kit
4. Data-visualization effectiveness
5. Competitor parity
6. Visual polish

On a conflict: flag it → state the trade-off → propose a fix → add an entry to `docs/design/decision-log.md`. Never resolve one silently.

## Rules for every task

### Components and tokens
- Use shadcn/ui components first (Obra kit in Figma: https://www.figma.com/design/CFxxYv6TbuUzDW910DNv6v/obra-ds). A new component needs a row in the extension log (`02-design-principles.md`).
- Colors come only from semantic tokens (`tokens/tokens.css` → utilities via `tokens/theme.css`). The Tailwind palette (`red-500`) is removed.
- No raw hex/rgb, no arbitrary colors (`bg-[#…]`), no `dark:`/`light:` color utilities in our components.
- Never hand-edit `tokens/tokens.json`. Regenerate it with `node scripts/build-tokens-json.mjs`.
- Icons: Lucide, 16px dense / 20px nav. Fonts: Archivo (+ Geist Mono for code, D-051) · IBM Plex Sans Arabic · Noto Sans JP.
- Logo: `public/brand/accuknox-logo-on-dark.svg` / `-on-light.svg` per theme. Logo colors are never UI colors.

### Grid and spacing
- 4px base. All spacing, sizes and radii are multiples of 4.
- Exceptions: 1/2px borders, 2px focus ring + offset, 2px chart gaps, font sizes 14/18.
- No `.5` spacing steps and no arbitrary px off the grid outside `components/ui`.
- 12-column grid. Breakpoints `lg` 1280 · `xl` 1440 · `2xl` 1920. Gutter 16/24, margin 24/32.
- Dense defaults: controls 32px, table rows 36px (compact 28), detail panel 480/560, sidebar 240/56.
- Radius: `rounded-sm` 4 (badges) · `rounded-md` 8 (controls) · `rounded-xl` 12 (cards, dialogs).

### Color, severity, status, health
- Severity: Critical (fix in 24h) · High (7d) · Medium (30d) · Low (90d) · Info (none). Score 0–100, integers, always with the name.
- Status: Open · In progress · Resolved · Ignored. Health: Healthy · At risk · Failing.
- Each value has 4 tokens: solid (marks, dots, ≤4px accents) · `-foreground` (text/icons) · `-muted` (tint) · `-border`.
- Never put text on a solid fill.
- Always icon + text label. Never color alone.
- Alert fatigue: strong color only on open, actionable items. Resolved/Ignored are muted.
- No row tints. No Critical/High fills larger than a 4px accent. A zero KPI is neutral. Max 1 page banner.
- `destructive` is for destructive buttons only, never severity.

### Data visualization
- Every chart answers a named user question and leads to an action (click → filter or drill-down).
- Show scope, time range and freshness ("Updated 4 min ago"). Default range: 30 days.
- Every chart has a text summary (`figcaption`) + a "View as table" toggle + keyboard-reachable marks.
- Design all states: loading (skeleton), empty, partial, error, stale.
- One y-axis only. No pie >4 slices, gauges, 3D or radar.
- Categorical `chart-1..8` in fixed order, never cycled. Max 3 series in scatter or small multiples.
- Severity colors only for severity data.
- Marks below 3:1 (light: severity medium/info, chart-3/4/5) need visible labels or the table view.
- Ranked list first; the attack-path graph opens from a finding and always has a list view.

### Copy
- Calm, plain, confident.
- Every alert, finding and error: what happened → why it matters → what to do next.
- Sentence case. Buttons: verb + object, ≤3 words. No "!". No words from the banned list (06).
- Use glossary plain terms (06). Tooltip any technical term that must stay.
- AI = **AskAI** (D-026): chat panel opened from the header (same place on every page) + "Ask about this" on findings/charts. Speaks as "I" only inside AskAI; all other product copy uses "We". Default `bot` icon. Name never translated.
- AskAI output:
  - "AI-generated" label · confidence High/Medium/Low + reason (no %) · 1–5 linked evidence items · stated limits.
  - Separate fact ("I found…") from inference ("This likely means…"). No feelings, jokes or apologies.
  - Never acts without user confirmation.
- "Why am I seeing this?" on every alert, finding, recommendation and AI answer.
- Destructive actions by tier:
  - Reversible → Undo toast.
  - Irreversible → AlertDialog with focus on Cancel.
  - Wide impact → also type the name to confirm.

### i18n (en, ar RTL, ja at launch)
- All strings through react-intl with semantic keys and ICU plurals. No literals in JSX, no concatenation, no text in images or charts.
- Logical properties only (`ms/me/ps/pe/start/end/text-start`). Never `ml/mr/pl/pr/left/right/text-left`.
- Mirror layout and directional icons (allow-list). Don't mirror time axes, numbers, IDs, code or logos.
- Format with `Intl` and the active locale. Arabic uses Western digits by default (`ar-u-nu-latn`, user-switchable). Technical values are always Western digits, wrapped in `<bdi>`.
- Arabic/Japanese: body line-height 24, never letter-spaced, no italics.

### Accessibility (WCAG 2.2 AA)
- Text ≥4.5:1. Large text, control boundaries, focus ring, `-border` and meaningful icons ≥3:1, in both themes.
- Full keyboard support. Visible 2px focus ring, never obscured. Overlays trap focus and return it.
- Targets ≥24×24. Every drag has an alternative. Tooltips open on focus too.
- Don't override Radix roles or keys. Tables use native `<table>`. Menus use Radix menus. The sidebar is `<nav>`, not `role="menu"`.
- Respect reduced motion (tokens go to 0ms). No pulsing or flashing.
- Reflow at 320px without 2-D scroll (except tables, charts, graphs). Pass the text-spacing override.

## Required checks before finishing UI work
```bash
node scripts/check-contrast.mjs
```
Must exit 0 after any token change.
```bash
node scripts/check-figma-drift.mjs
```
Must exit 0: the obra-ds Figma library matches tokens.json (sync steps in 04, D-048).
```bash
node scripts/check-spacing.mjs src
```
Checks the 4px grid, logical properties and colors.
Then complete `docs/design/review-checklist.md` in **dark + light**, **en + ar (RTL) + ja**, and the **en-XA pseudo-locale (+40%)**.

## Detailed docs (`docs/design/`)
| Doc | Covers |
|---|---|
| `01-competitor-analysis.md` | Wiz, Orca, Upwind, Datadog: Adopt/Adapt/Avoid; patterns P1–P7; how we're different |
| `02-design-principles.md` | Personas, priority order, 7 principles, alert-fatigue rules, visual language, extension log |
| `03-layout-and-grid.md` | Breakpoints, app shell, dashboards, tables, spacing, radius, type scale |
| `04-color-and-severity.md` | Token files, neutrals, severity/status/health tokens, definitions, measured contrast |
| `05-data-visualization.md` | Question → chart map, validated palettes, marks, interaction, states, risk graph |
| `06-content-and-tone.md` | Voice, banned list, patterns, destructive tiers, AI trust patterns, glossary |
| `07-i18n-and-rtl.md` | react-intl setup, numerals, RTL mirroring, per-language type, locale formatting |
| `08-accessibility.md` | Automated checks, contrast, keyboard, ARIA patterns, chart alternatives, motion, reflow |
| `decision-log.md` | Every decision: reason, alternatives, date, status |
| `review-checklist.md` | Pass/fail checks for any new screen or component |

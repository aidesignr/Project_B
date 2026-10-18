# 08 · Accessibility (WCAG 2.2 AA)

Target: **WCAG 2.2 AA** in both themes and all three locales. Accessibility is priority 1 (02) and wins every conflict.
shadcn/ui is built on Radix primitives, which provide most ARIA and keyboard behavior. **Never override their roles or key handling.**

## Automated checks

| Check | Command / tool | Pass |
|---|---|---|
| Token contrast, both themes, every foreground/background pair | `node scripts/check-contrast.mjs` | exit 0 (606 checks) |
| 4px grid, logical properties, no raw colors | `node scripts/check-spacing.mjs` | exit 0 |
| Rendered pages (contrast, names, roles) | axe-core (`@axe-core/playwright`) on every route, both themes, `en` + `ar` | 0 serious/critical violations |
| Lint | `eslint-plugin-jsx-a11y` (recommended) | 0 errors |

Automated checks catch about a third of issues. The manual checks below are still required.

## Contrast

| Element | Min |
|---|---|
| Body text, labels, links, severity/status/health `-foreground` | 4.5:1 |
| Large text (≥24px, or ≥18.66px bold) | 3:1 |
| Control boundaries (`input`), focus ring, `-border` tokens, meaningful icons | 3:1 |
| Chart marks | 3:1, **or** the relief rule (visible label or table view, see 05) |
| Decorative `border`, disabled controls | exempt (disabled must still be identifiable by its label) |

## Keyboard and focus

| Rule | Test |
|---|---|
| Every action works with the keyboard only | Complete each persona's top tasks (02) with no mouse |
| Visible focus: 2px `ring` outline + 2px offset, never removed | Every interactive element shows `:focus-visible` |
| Focus not obscured (2.4.11) | Sticky header, toolbar and detail panel never cover the focused element (`scroll-padding-block-start: 56px`) |
| Tab order = visual order, mirrored in RTL | Tab through in `en` and `ar` |
| First tab stop is "Skip to main content" | |
| Overlays trap focus; Esc closes; focus returns to the trigger | Dialog, Sheet, Popover, Menu |
| Single-key shortcuts can be turned off or remapped (2.1.4) | Setting exists |

## Target size and pointer

| Rule | Value |
|---|---|
| Minimum target (2.5.8) | 24×24px, or 24px spacing around a smaller target |
| Default controls | 32px high. Icon buttons 32×32 with a 16px icon. Compact table actions 28×28. |
| Dragging (2.5.7) | Graph pan, chart brushing and column resize all have a click or keyboard alternative |
| Hover-only content (1.4.13) | Tooltips also open on focus, can be dismissed with Esc, and stay open while hovered |

## ARIA patterns for complex components

| Component | Pattern | Key behavior |
|---|---|---|
| **Data table** | Native `<table>`, `<th scope>`, `<caption>` (visible or `sr-only`), `aria-sort` on sorted headers | Sort button inside `<th>`. Row checkbox labelled "Select [row title]". Filter result count announced via `role="status"` ("24 findings"). |
| **Grid (editable/spreadsheet-like)** | Only if cells are editable: `role="grid"` with roving tabindex | Arrows move between cells; Enter edits. Don't use for read-only tables. |
| **Menu / dropdown menu** | Radix `DropdownMenu`: trigger `aria-haspopup="menu"` + `aria-expanded`, `role="menu"`, `menuitem` / `menuitemcheckbox` / `menuitemradio` | Enter/Space/↓ opens. Arrows move (wrap). Typeahead. Esc closes and returns focus. Disabled items stay focusable with `aria-disabled`. |
| **Context menu** | Radix `ContextMenu` | Also reachable via Shift+F10 / Menu key and a visible "More actions" (`ellipsis`) button |
| **Menubar / nav** | Sidebar = `<nav aria-label>` with a list of links, **not** `role="menu"` | Current page has `aria-current="page"` |
| **Combobox / filter picker** | shadcn `Command` in a `Popover`: `role="combobox"` + `listbox` | Typing filters; ↑↓ move; Enter selects; selected filters announced |
| **Tabs** | Radix `Tabs` | ←→ move (mirrored in RTL), Home/End |
| **Dialog** | Radix `Dialog`, labelled by its title | Focus to the first field, or to Cancel for destructive dialogs |
| **Alert dialog (destructive)** | Radix `AlertDialog` | Focus starts on Cancel; Enter doesn't trigger the destructive action by default |
| **Detail panel** | Radix `Sheet`, `aria-labelledby` set to the finding title | Opening moves focus into the panel; closing returns it to the row |
| **Tooltip** | Radix `Tooltip` | Supplementary only: never the only place for essential info |
| **Toast** | `role="status"` (polite); errors `role="alert"` | Toasts with an action stay ≥10s and pause on hover/focus |
| **Severity / status badge** | Visible text; icon `aria-hidden` | Icon-only cell: `aria-label="Severity: Critical"` |
| **Chart** | `<figure>` + `<figcaption>` (title + summary); SVG `role="img"` + `aria-label` | Focusable marks (`aria-label="12 May: 42 critical findings"`); ←→ move; Enter drills down |
| **Risk graph** | Focusable nodes (React Flow) with `aria-label` (type, name, severity) + instructions text | **Equivalent list view** of the path ("Step 2 of 4: load balancer → web server, can reach from internet") |
| **AskAI chat panel** | Radix `Sheet` (non-modal) with `aria-label="AskAI"`; message list is `role="log"`; answers stream into `aria-live="polite"` and are announced once complete | Opens from the header AskAI button or "Ask about this"; Esc closes and returns focus. The "AI-generated" label and confidence are part of the accessible text. Input is a labelled `<textarea>`; Enter sends, Shift+Enter adds a line. |
| **Loading region** | `aria-busy="true"` + `sr-only` "Loading findings" | |

## Charts: accessible alternatives (required for every chart)

1. **Text summary**: one generated sentence in the `<figcaption>`. Example: "Critical findings fell from 52 to 42 over 30 days."
2. **Table view**: a "View as table" toggle rendering a real, sortable `<table>` with the same data.
3. **Keyboard**: marks reachable with arrow keys; Enter performs the mark's action.
4. **No color-only encoding**: legend + direct labels + icons. Dashed lines for attack paths and comparison periods. Texture fills under `forced-colors`.

## Motion

| Rule | Test |
|---|---|
| Respect `prefers-reduced-motion` | Duration tokens go to 0ms (`tokens.css`); skeletons are static; charts render without transitions |
| No flashing more than 3 times per second; no pulsing severity | |
| Motion ≤ 320ms and only for state change or spatial continuity | |
| Live-updating content can be paused (2.2.2) | "Pause live updates" control on live views |

## Zoom, reflow, text spacing

| Rule | Test |
|---|---|
| 200% zoom: no loss of content or function | Browser zoom at 1280px |
| Reflow at 320 CSS px (1.4.10) | No 2-D scrolling except data tables, charts and graphs, which scroll inside their own region |
| Text spacing override (1.4.12) | Apply line-height 1.5, paragraph spacing 2em, letter-spacing 0.12em, word-spacing 0.16em → nothing clipped |
| Type in `rem` at runtime | Respects the user's browser font size |
| `forced-colors: active` | Borders, focus ring and severity icons remain visible |

## Other WCAG 2.2 requirements

| Criterion | Rule |
|---|---|
| 3.1.1 / 3.1.2 Language | `lang` + `dir` on `<html>`; `lang` on inline foreign-language spans |
| 2.4.2 Page titled | "Page – Scope – AccuKnox" |
| 3.2.6 Consistent help | Help and AskAI entry points in the same place in the header on every page |
| 3.3.7 Redundant entry | Never ask for the same information twice in one flow |
| 3.3.8 Accessible authentication | No cognitive tests; paste and password managers allowed |
| 3.3.1 / 3.3.3 Errors | Errors named in text, linked to the field (`aria-describedby`), with a fix suggestion (06) |

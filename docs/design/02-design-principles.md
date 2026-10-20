# 02 · Design principles

## Product and users

AccuKnox is an AI-powered cloud security platform. It helps teams see their security posture, understand risk and fix problems quickly.
**Platform:** desktop web (min 1280px). Dark mode is the default. Mobile is out of scope for now.
**Brand feel:** trust · clarity · user-friendly.

| Persona | Top tasks | Default lens |
|---|---|---|
| Security engineer | Triage findings · investigate an attack path · verify a fix | Findings, evidence, attack path |
| Cloud / DevOps engineer | Find what's misconfigured · get a clear fix · confirm it worked | My resources, fix steps, code/PR |
| Security leader (CISO) | See posture and trend at a glance · report to executives · track compliance | Trends, posture, SLA, compliance |

**User state:** time-pressed, wary of false alarms, accountable for decisions. Design for **fast understanding and confident action**, not exploration.

**Every screen helps answer at least one of:**
1. What is my riskiest thing?
2. Is it getting better or worse?
3. What should I fix first, and how?

## Priority order (resolves every conflict)

| Rank | Priority | Wins over |
|---|---|---|
| 1 | Accessibility (WCAG 2.2 AA) and user safety | everything below |
| 2 | Clarity and trust (plain language, honest uncertainty) | 3–6 |
| 3 | Consistency with the Obra shadcn/ui kit | 4–6 |
| 4 | Data-visualization effectiveness | 5–6 |
| 5 | Competitor parity | 6 |
| 6 | Visual polish | — |

**Conflict procedure:** (1) flag it, (2) state the trade-off, (3) propose a fix, (4) record it in [decision-log.md](decision-log.md). Never resolve a conflict silently.

## The seven principles

| # | Principle | Rule (pass/fail) |
|---|---|---|
| 1 | **Answer, then act** | Each screen states which core question it answers. Each chart, tile and finding offers ≥1 action or drill-down. |
| 2 | **Calm confidence** | No pulsing or flashing. No "!" in UI copy. No ALL CAPS severity. No words from the banned list in 06. |
| 3 | **Explain everything** | Every score, severity and AI output has a "Why?" affordance (link, tooltip or panel section). |
| 4 | **Dense, not cluttered** | 4px grid · 36px table rows · ≤3 text colors per view · 1 primary button per region. |
| 5 | **Never color alone** | Every severity, status and health indicator has icon + text. A grayscale screenshot stays understandable. |
| 6 | **Strong color means "act"** | See the alert-fatigue rules below. |
| 7 | **Built for every locale** | Logical CSS properties only · no hardcoded strings · passes Arabic RTL and +40% pseudo-locale review. |

## Alert-fatigue rules

Color is used heavily but deliberately. The strongest colors (Critical, High) are reserved for items that need action.

| # | Rule | Pass/fail check |
|---|---|---|
| AF1 | Critical/High color appears only on **open, actionable** items | Resolved and Ignored items show severity as icon + label in `--muted-foreground`, with no severity color |
| AF2 | Table rows aren't tinted by severity | Only the severity cell carries color. Row tint is reserved for the selected row. |
| AF3 | Large color areas stay neutral | No full-card, full-row or banner fill in Critical/High. Accent is ≤4px wide (bar or border). |
| AF4 | Zero is calm | A KPI with value 0 renders in neutral text with a check icon, never in severity color |
| AF5 | One alarm per view | At most one page-level banner at a time. Further items go into a list or notification center. |
| AF6 | Aggregates beat repetition | >5 findings of the same rule on one resource type are grouped into one row with a count |
| AF7 | Severity color isn't decoration | Severity tokens are never used for branding, illustrations or non-severity charts |

## Visual language

| Rule | Detail |
|---|---|
| Base kit | Obra shadcn/ui kit 2.0, **Nova** style (compact), Figma: [obra-ds](https://www.figma.com/design/CFxxYv6TbuUzDW910DNv6v/obra-ds) (Button set: node `1953-30021`). Kit components first; a new component needs an entry in the extension log below. Neutrals, font and destructive follow the kit; deviations are logged (D-042 to D-046). |
| Stack | React + TypeScript + Vite · Tailwind v4 · shadcn/ui (Radix). See [decision-log.md](decision-log.md). |
| Icons | Lucide (shadcn default). 16px dense, 20px nav. Default stroke. No custom icon styles. |
| Type | Archivo (D-051; replaces the Obra kit's Geist, D-042); Geist Mono for code and IDs. Arabic: IBM Plex Sans Arabic. Japanese: Noto Sans JP. |
| Brand color | `--primary`: `#1565D8` light / `#1E6FE8` dark (D-012, D-043). Used for primary actions, selection and links. Never decoration. |
| Logo | Theme-specific SVGs in `/public/brand/`: white wordmark on dark, `#0000C8` wordmark on light. Logo colors are never UI colors. |
| Surfaces | Neutral grays. Elevation in dark = lighter surface + 1px border. In light = shadow + border. |

## Extension log: where we go beyond the Obra kit

| Extension | Why (kit gap) | Related kit component / token |
|---|---|---|
| Severity tokens: 5 levels × solid / foreground / muted / border | Kit has only `destructive` | `Badge`, `destructive` |
| Status tokens (Open, In progress, Resolved, Ignored) | No workflow-state semantics | `Badge` |
| Health tokens (Healthy, At risk, Failing) | No posture semantics | `Badge`, `Progress` |
| Chart palettes: categorical 8, sequential, diverging, severity ramp (CVD-validated) | Kit charts ship 5 unvalidated colors | `Chart` (`--chart-1..5`) |
| Risk-graph tokens: node, edge, attack-path edge, selection | No graph component in the kit | none; built on React Flow |
| Surface 0–3 + shadow 1–3 | Kit has card/popover only, so dark elevation is ambiguous | `Card`, `Popover`, `Dialog`, `Sheet` |
| Darker `--input` (both themes) and `--muted-foreground` (light) | Stock values fail 3:1 / 4.5:1 (priority 1 beats 3) | `Input`, `Checkbox`, `Select` |
| Density tokens: control and row heights | Dense-data requirement | `Button`, `Input`, `Table` |
| Radius re-based to 4 / 8 / 12 | Kit's 10px default breaks the 4px rule | `--radius` |
| Severity badge, risk-factor chip, KPI tile, freshness label | Recurring patterns with no kit equivalent | Composed from `Badge`, `Card`, `Tooltip` |
| AskAI chat panel + "Ask about this" shortcut | No chat/assistant component in the kit | Composed from `Sheet` (non-modal), `Textarea`, `Button`, `Badge` |
| App shell: hover-expand sidebar rail (56 → 240 overlay), pinned sidebar (push), level 2 disclosure groups, count badge (D-052, D-055) | Kit's `Sidebar` has no hover-overlay rail or pin mode | `Sidebar` patterns, `Tooltip`, `Separator` |
| Unified header breadcrumb with the page H1, page toolbar row (D-057) | Kit breadcrumb is standalone | `Breadcrumb` pattern |
| Tenant and group combobox (filter, recent, grouped options) | No searchable two-level picker | Composed from `Popover` + listbox (combobox pattern) |
| Notifications panel (unread/read, module link, empty state) | No notification centre | Composed from `Popover`, `Button` |
| Getting-started checklist (progress ring + steps) | No onboarding checklist | Composed from `Popover`, `Progress` |

## Open conflicts

All conflicts and their resolutions are recorded in [decision-log.md](decision-log.md). Items marked **Proposed** there wait for your sign-off at the next gate.

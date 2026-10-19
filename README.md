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
| [`.storybook/`](.storybook/) | Storybook config: providers, theme/language toolbar, accessibility and Figma add-ons |
| [`src/`](src/) | Login app: the validated login canvas as working React screens (see below) |
| [`design/login-flows/`](design/login-flows/) | Login canvas source boards (design reference) |

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

## Login app

The login and sign-up flows from the design canvas, built as a working React app. It runs on mock auth (no backend yet).

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:5173. The language (en, ar, ja) and the theme (Light / Dark / System) switch from the top toolbar on every screen.

| Route | Screen |
|---|---|
| `/sign-in` → `/sign-in/code` | Sign in, then the authenticator code |
| `/forgot-password` · `/reset-password` | Request a reset link; set a new password |
| `/invite/:token` → `/authenticator` → `/recovery-codes` | Invite setup in 3 steps |
| `/sso` | Sign in with SSO (OpenID) |
| `/sign-up` → `/verify-email` | Self sign-up |

**Demo inputs that trigger each error state** (rules in [`src/lib/auth.ts`](src/lib/auth.ts)):

| Screen | Input | Result |
|---|---|---|
| Sign in | email `locked@…` | Sign-in paused |
| Sign in | password `incorrect` | Wrong email or password |
| Sign in | Continue with Google | Google account not linked |
| Authenticator codes | `000000` | Code didn't work (any other 6 digits works) |
| Reset password | `/reset-password?token=expired` | Reset link expired |
| Invite | `/invite/expired` | Invite expired |
| SSO | email at `nosso.com` / `idp-error.com` | No SSO for domain / identity provider error |
| Sign up | email `taken@…` | Account already exists |

Copy comes from the canvas boards: `node scripts/extract-login-messages.mjs` regenerates `src/i18n/messages/*.json` and fails if a locale is missing a key. Strings the canvas built by joining fragments are whole ICU messages in [`src/i18n/extra.ts`](src/i18n/extra.ts).

## Storybook

Every UI primitive, auth building block and login screen (45 stories) with the app's tokens, fonts and providers.

```bash
npm run storybook
```

Opens http://localhost:6006. In Windows PowerShell, use `npm.cmd run storybook`.

- **Theme and Language** in the toolbar switch dark/light and en/ar (RTL)/ja in place.
- **Screens/J1–J5** match the Figma journeys. Error states are reached through the form by play functions (they double as interaction tests); see the **Interactions** panel.
- **Accessibility** panel: axe checks every story against WCAG 2.2 AA (D-041).
- **Design** panel: the matching frame in the Project_B Figma file.
- `npm run build-storybook` builds a static copy to `storybook-static/` (ignored by git).

### Storybook tests

Every story renders in headless Chromium (Vitest browser mode, `@storybook/addon-vitest`), its play function runs, and axe fails the test on any WCAG 2.2 AA violation (`parameters.a11y.test = "error"`). Each story runs twice: **dark + en** and **light + ar (RTL)** (the projects in [`vitest.config.ts`](vitest.config.ts)).

Once, to download the browser:

```bash
npx playwright install chromium
```

Then:

```bash
npm run test-storybook
```

In Windows PowerShell, use `npm.cmd run test-storybook`. To run one combination, add `-- --project=storybook:light-ar` (or `storybook:dark-en`). The **Testing** widget in the Storybook sidebar runs the same tests.

CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs on every pull request: `npm run build`, the contrast, Figma drift and spacing checks, then these tests.

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

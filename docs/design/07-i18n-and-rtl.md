# 07 · Internationalization and RTL

**Launch languages:** English (`en`), Arabic (`ar`, RTL, full parity from day one), Japanese (`ja`).
**Stack:** React + TypeScript + Vite · FormatJS `react-intl` with ICU messages (D-010).

## Setup

| Concern | Decision |
|---|---|
| Library | `react-intl` (`<IntlProvider>`, `useIntl`, `<FormattedMessage>`) |
| Message format | ICU MessageFormat: plurals, select, rich text tags |
| Message files | `src/locales/{en,ar,ja}.json`, flat keys. English is the source; `ar`/`ja` are translations. |
| Keys | Semantic and namespaced: `findings.detail.fixButton`. Never the English text as the key. |
| Descriptions | Every message has a `description` for translators (context, max length, placeholders) |
| Extraction / compile | `@formatjs/cli extract` and `compile` in CI; build fails on a missing key in any locale |
| Lazy loading | Vite dynamic `import()` per locale, so only the active locale is loaded |
| Types | Generated `MessageId` union, so `intl.formatMessage({ id })` is type-checked |
| Direction | `<html lang dir>` set from the locale. Radix `DirectionProvider` wraps the app. |
| Pseudo-locale | `en-XA` (accented, +40% length) and `ar` screenshots in CI |

```tsx
// ✅ full sentence, ICU plural, semantic key
intl.formatMessage(
  { id: "findings.summary.count", description: "Count above the findings table" },
  { count: 3 }
); // en.json: "{count, plural, one {# finding} other {# findings}}"

// ❌ concatenation, hardcoded text
`${count} finding${count > 1 ? "s" : ""}`
```

## Numerals (D-011)

| Context | ar default | Can the user change it? |
|---|---|---|
| Running text, counts, dates | Western digits (0–9) via `ar-u-nu-latn` | Yes: Settings → Language → "Arabic-Indic digits (٠١٢٣)" |
| Technical values: IDs, IPs, ports, versions, CVE IDs, scores, code | Always Western digits, wrapped in `<bdi dir="ltr">` | No |
| Charts and axes | Same as running text | Follows the setting |

Implementation: build the locale string once (`ar-u-nu-latn` or `ar-u-nu-arab`) and pass it to `IntlProvider` and every `Intl.*` call.

## Hard rules

| Rule | Test |
|---|---|
| No hardcoded user-facing strings | ESLint `formatjs/no-literal-string-in-jsx` passes |
| No string concatenation for sentences | Review + the ESLint rule above |
| No text in images, SVG illustrations or chart canvases | Chart text is SVG `<text>` or HTML from i18n keys |
| Logical properties only | `node scripts/check-spacing.mjs` passes (bans `ml- mr- pl- pr- left- right- text-left text-right border-l/r rounded-l/r`) |
| Layout survives +40% text | `en-XA` review: no clipping or overlap. Buttons and badges grow; tables truncate with a tooltip. |
| Layout survives −30% (Japanese is often shorter) | No awkward gaps; no fixed-width labels |
| Every locale has every key | `formatjs compile` fails on a missing key |

## RTL mirroring

| Mirror ✅ | Don't mirror ❌ |
|---|---|
| Page layout: sidebar on the right, detail panel opens on the left | Time-series x-axis: time still flows left → right |
| Breadcrumb order and separators | Numbers, IDs, IPs, code, file paths, CVE IDs |
| Directional icons: `chevron-*`, `arrow-*`, back/forward, `external-link`, progress direction | Logos, media controls, checkmarks, clocks, `bot` |
| Attack-path graph flow (entry → target reads right → left) | Numeric x-axes; the value axis of bar charts |
| Table column order (first column on the right) | Keyboard shortcut labels |
| Severity order in legends (Critical first, at the start edge) | Embedded LTR content: wrap in `<bdi>` |

Directional icons get `rtl:-scale-x-100` from an explicit allow-list (`src/lib/rtl-icons.ts`). Everything else stays unmirrored.

## Typography per language

Implemented in `tokens/theme.css` with `:lang()` (line-heights stay multiples of 4).

| Locale | Font stack | `text-sm` | `text-base` | Letter-spacing | Other rules |
|---|---|---|---|---|---|
| en | Archivo (D-051) | 14 / 20 | 16 / 24 | 0 (−0.01em only at ≥24px) | |
| ar | IBM Plex Sans Arabic → Noto Sans Arabic → Archivo | 14 / **24** | 16 / **28** | **0, never tracked** | No italics (use weight). Max weight 600. Never letter-space or justify with tatweel. |
| ja | Noto Sans JP → Hiragino Sans → Yu Gothic UI → Meiryo → Archivo | 14 / **24** | 16 / **28** | **0, never negative** | No italics. `word-break: auto-phrase`, `line-break: strict`. Don't break inside numbers or units. |

Field errors and password rules use `text-form-msg`: 12/16 in en, 12/20 in ar and ja (D-067).

Fonts are self-hosted (WOFF2, `font-display: swap`). Arabic and Japanese files load only for those locales.

## Locale formatting

Always use `Intl` (or `react-intl` helpers) with the active locale. Never hand-format.

| Data | API | en | ar (`nu-latn`) | ja |
|---|---|---|---|---|
| Date | `DateTimeFormat`, `dateStyle: "medium"` | Sep 12, 2026 | 12/09/2026 (with RTL marks) | 2026/09/12 |
| Number | `NumberFormat` | 1,240 | 1,240 | 1,240 |
| Compact | `notation: "compact"` | 1.2K | 1.2 ألف | 1240 |
| Percent | `style: "percent"` | 18% | 18% | 18% |
| Relative | `RelativeTimeFormat` | 2 hours ago | قبل ساعتين | 2 時間前 |
| List | `ListFormat` | A, B, and C | A وB وC | A、B、C |

Examples verified with Node 24 `Intl` (2026-10-18); output can vary slightly by browser. Arabic has 6 plural forms, so every count string needs ICU plurals.
Store timestamps in UTC; display them in the user's timezone, with the zone name on hover.

## Translation rules

- Glossary terms (06) have locked translations per locale.
- "AccuKnox", "AskAI", other product names, technical IDs and code are never translated.
- AskAI's first-person voice is kept in every locale (Arabic and Japanese translators adapt politeness level, but AskAI stays modest and neutral; see 06).
- Severity names are translated, but their **icons** never change across locales.

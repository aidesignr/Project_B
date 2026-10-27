# Filters: principles and behaviour

How filters work on data pages. The Findings page is the reference implementation; this file describes what its code does today, and the capability matrix (§5) follows the latest spreadsheet, noting where code hasn't caught up. Where something isn't settled, it says **[open: …]**.

Code: [data.ts](../../src/components/findings/data.ts) (filter definitions) · [FilterDropdown.tsx](../../src/components/findings/FilterDropdown.tsx) · [FilterBar.tsx](../../src/components/findings/FilterBar.tsx) · [FindingsPage.tsx](../../src/routes/FindingsPage.tsx) · [findings.ts](../../src/i18n/findings.ts) (copy) · [findings.stories.tsx](../../src/components/findings/findings.stories.tsx) (tested behaviour). Decisions: D-064, D-065.

## 1. Purpose and scope

Filters answer **"What is my riskiest thing?"** by narrowing a long list to the findings that matter to the person looking. They apply to any list or table page that needs more than a search box. Each filter's behaviour comes from one row of the product owner's dropdown spreadsheet, recorded as a `FilterDef` in `data.ts`.

## 2. Principles

| # | Principle | Because |
|---|---|---|
| 1 | A set filter always shows its label **and** its value (operator, first value, +N) | People must see what the list is hiding without opening anything |
| 2 | Only three filters live on the page by default (severity, Group by, Cloud provider); the rest are added on demand | A short bar stays scannable; rare filters don't crowd common ones |
| 3 | On-demand filters are visibly different (primary outline, blue text, remove button) | People can tell what they added and take it away |
| 4 | Behaviour comes from the filter's definition, not from one-off code | Every filter of the same kind acts the same way |
| 5 | Changing anything that affects the rows returns to page 1 | A filtered list never opens on an empty later page |
| 6 | Severity is shown with an icon and a letter, and its name is always announced and in a tooltip | Never colour alone; the letter keeps the bar compact (D-064) |
| 7 | An empty result says filters may be hiding findings and offers a way out | "No results" must not read as "you're safe" |

## 3. Filter types

| | Static | On-demand |
|---|---|---|
| Which | Severity toggles, Group by, Cloud provider | Every other filter in `ON_DEMAND_FILTERS` |
| Where | Always on the page, before the divider | After the divider, in the order they were added |
| How it gets there | Present by default | Added from **Add filter** |
| Outline | `border-control-border` | `border-primary` |
| Label, operator, value text | Label muted, value `foreground` semibold | All `text-link` |
| Clear (×), shown once a value is set | `text-foreground` (white in dark) | `text-link` (blue) |
| Remove (−) | None | `text-link`, divided from the trigger by a primary border |
| Reset | Back to its default value | Removed, except Finding status (see §6) |

## 4. Anatomy

```
Trigger (static)
┌──────────────────────────────────────────────┐
│ Cloud provider  =  ☁  Org-Production  +2  ▾  ×│
└──────────────────────────────────────────────┘
  label     operator icon  first value  +N chev clear

Trigger (on-demand)
┌───────────────────────────────────────────┬───┐
│ Finding status  =  Open  +1  ▾  ×          │ − │
└───────────────────────────────────────────┴───┘
                                       clear  remove

Popover (320px)
┌───────────────────────────────┐
│ [ Equals (=)            ▾ ]   │  operator select (ops filters)
│ ───────────────────────────── │
│ [  All 8  |  Selected 3  ]    │  tabs (tabs filters)
│ [ 🔍 Search                ]  │  search (search filters)
│ + Create “pci-scope”          │  create row (Tags, no exact match)
│ › ☑ ☁ AWS                ✓    │  tree parent: expand, checkbox, icon, tick
│     ☑ Org-Production     ✓    │  child
│ › ☐ ☁ GCP                     │
│ Select all                    │  footer link
└───────────────────────────────┘

Date popover: From | To fields · month header with previous/next · 7-column day grid · Clear dates
```

- The trigger is at most 360px wide; a long value truncates.
- The Cloud provider trigger shows a cloud icon before the value (a placeholder until provider logos ship, D-065).
- The popover is a Radix Popover aligned to the start of the trigger with 16px collision padding, so it flips and shifts to stay on screen when the filter row wraps.

## 5. Capability matrix

From the product owner's [filter capability spreadsheet](https://docs.google.com/spreadsheets/d/1pDIq7N9OqA8RL81V550nCrqpJunugJz2jQpLgKHD7m0/edit?usp=sharing) (updated October 2026), grouped as it groups them. ✓ = on, blank = off. Every filter in the spreadsheet requires a label, so that column is left out.

| Filter | Operator | Select | Tree | Parent icon | Child icon | Search | Tabs | Create | Select all | Unselect all | Single date | Date range |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Group by | | Single | | | | | | | | | | |
| Cloud provider | ✓ | Multi | ✓ | ✓ | | ✓ | ✓ | | ✓ | ✓ | | |
| **General multi-select** | | | | | | | | | | | | |
| Asset category | ✓ | Multi | | | | ✓ | ✓ | | ✓ | ✓ | | |
| Asset type | ✓ | Multi | | | | ✓ | ✓ | | ✓ | ✓ | | |
| Asset name | ✓ | Multi | | | | ✓ | ✓ | | ✓ | ✓ | | |
| Region | ✓ | Multi | | | | ✓ | ✓ | | ✓ | ✓ | | |
| Tags | ✓ | Multi | | | | ✓ | ✓ | ✓ | ✓ | ✓ | | |
| Label | ✓ | Single | | | | ✓ | ✓ | | | ✓ | | |
| Finding source | ✓ | Multi | | | | ✓ | ✓ | | ✓ | ✓ | | |
| Collector | ✓ | Multi | | | | ✓ | ✓ | | ✓ | ✓ | | |
| New finding | ✓ | Multi | | | | ✓ | ✓ | | ✓ | ✓ | | |
| Severity | ✓ | Multi | | | | ✓ | ✓ | | ✓ | ✓ | | |
| Origin risk factor | ✓ | Multi | | | | ✓ | ✓ | | ✓ | ✓ | | |
| SLA status | ✓ | Multi | | | | ✓ | ✓ | | ✓ | ✓ | | |
| Unique vulnerability name | ✓ | Multi | | | | ✓ | ✓ | | ✓ | ✓ | | |
| Finding name | ✓ | Multi | | | | ✓ | ✓ | | ✓ | ✓ | | |
| Data type | ✓ | Multi | | | | ✓ | ✓ | | ✓ | ✓ | | |
| Vulnerability name | ✓ | Multi | | | | ✓ | ✓ | | ✓ | ✓ | | |
| Tool output | ✓ | Multi | | | | ✓ | ✓ | | ✓ | ✓ | | |
| Finding status | ✓ | Multi | | | | ✓ | ✓ | | ✓ | ✓ | | |
| Compliance control | ✓ | Multi | | | | ✓ | ✓ | | ✓ | ✓ | | |
| Asset group | ✓ | Multi | | | | ✓ | ✓ | | ✓ | ✓ | | |
| Finding ID | ✓ | Multi | | | | ✓ | ✓ | | ✓ | ✓ | | |
| Classifier | ✓ | Multi | | ✓ | | ✓ | ✓ | | ✓ | ✓ | | |
| **Yes or no** | | | | | | | | | | | | |
| Ignored | ✓ | Single | | | | | | | | | | |
| Exploit available | ✓ | Single | | | | | | | | | | |
| Investigation status | ✓ | Single | | | | | | | | | | |
| Has tickets | ✓ | Single | | | | | | | | | | |
| **Date** | | | | | | | | | | | | |
| Present on | | | | | | | | | | | | ✓ |
| Date discovered | | | | | | | | | | | | ✓ |
| Last seen | | | | | | | | | | | | ✓ |
| Last fixed | | | | | | | | | | | | ✓ |

- Operators are **Equals (=)** and **Not equals (≠)**. [open: the spreadsheet marks which filters support an operator but not which operators; "Contains" was dropped when the spreadsheet arrived.]
- Ignored, Exploit available, Investigation status and Has tickets offer **Yes** and **No**. [open: Investigation status sits in the spreadsheet's yes-or-no group; confirm it shouldn't list real statuses.]
- The spreadsheet now gives **Severity** a full multi-select definition. On the page the severity toggles still stand in for it (D-064), so there is no Severity dropdown. [open: confirm whether Severity should also be an on-demand dropdown, for example on pages without toggles.]
- **Classifier** is new in the spreadsheet and isn't in `FILTERS` yet. It has a parent icon but no tree, so the icon sits on each value. [open: confirm which icon set it uses, and whether it should be a tree like Cloud provider.]
- **Child icon** and **Single date** are new spreadsheet columns. No filter uses either yet; they're kept so a future filter can turn them on. Every date filter uses a From/To range.

## 6. Interactions

| Interaction | Behaviour |
|---|---|
| Open | Click the trigger. The tab resets to All and the search clears each time it opens |
| Close | Click outside, press Esc, or (single select without tabs) pick a value |
| Single select | Group by and the yes-or-no filters close on pick. Label (single with tabs) stays open. Picking the selected value again clears it |
| Multi select | Each row toggles; the popover stays open |
| Tree parent | Checks or unchecks all its children. Shows a partly-checked box when only some are selected. The chevron button expands or collapses it |
| Search | Matches values at both tree levels (case-insensitive), opens the parents of matching children, and bolds the matched text. A parent that matches shows all its children |
| Tabs | **All** lists every value; **Selected** lists only selected ones and opens their parents |
| Footer link (All tab) | For the values in view (after search): **Unselect all** if they are all selected, otherwise **Select all**. Shown only if the filter allows that link |
| Footer link (Selected tab) | **Unselect all** while anything is selected |
| Footer link (single select) | **Unselect all** while a value is selected, only where the filter allows it (Label) |
| Create (Tags) | When the search text matches no value exactly, a **Create “…”** row appears. It adds the text as a value and selects it |
| Date range | First click sets From; the second sets To. A click before From moves From. Clicking after both are set starts again. Days after today are disabled, as is moving past the current month. **Clear dates** appears once From is set |
| Trigger summary for dates | Both dates: a short range ("Oct 6 – Oct 20"). From only: "From Oct 12" |
| Clear (×) | Empties the value (and dates) and keeps the filter. Values created from search stay in the list |
| Add filter | Lists every on-demand filter not on the page, in spreadsheet order, with a search. Adding one keeps the list open and removes it from the list |
| Remove (−) | Takes the filter off the page; it returns to the Add filter list |
| Reset | Restores the page defaults: C, H and M severity on, Group by Severity, Cloud provider set to the three AWS accounts, Finding status set to Open and In progress, search cleared. Any other on-demand filter is removed |
| Clear filters (no-results state) | Clears search, turns every severity toggle off, keeps Group by, clears Cloud provider and removes every on-demand filter |
| Page | Changing search, severity, sort, any filter value, adding or removing a filter, or the page size returns to page 1 |
| Row wraps | The search shrinks (minimum 240px) as filters widen; when it hits the minimum, filters wrap to the next line. Popovers reposition on their own |

[open: Reset brings back Finding status, an on-demand filter, because it's part of the default view. Confirm that's intended.]

## 7. Severity toggles

- Four toggles: **C**, **H**, **M**, **L**, each an icon + letter + count. There is no Info toggle.
- One click toggles each; several can be on. None on means every severity is shown, Info included.
- **On:** severity tint, border and foreground text (`SEVERITY_ON`). **Off:** neutral outline, muted text, icon still in its severity colour.
- The count is how many findings match the **other** filters, so the numbers agree with the table.
- `aria-pressed` carries the state. The accessible name is "{name}, {count} findings" and a tooltip shows the full name on hover and focus.
- Text never sits on a solid severity fill (CLAUDE.md).

## 8. States

| State | What shows |
|---|---|
| No value | Trigger shows the label only; no clear button |
| Value set | Label, operator symbol (operator filters), icon (Cloud provider), first value, +N, clear |
| Selected tab, nothing selected | "No values selected" |
| Search with no match | "No values match “{query}”" (or the Create row, for Tags) |
| Add filter, every filter added | "All filters are on the page" |
| Add filter, no match | "No filters match “{query}”" |
| Page has no results | "No findings match these filters", the explanation, and **Clear filters** |

## 9. Accessibility

| Part | Implementation |
|---|---|
| Filter bar | `role="search"`, labelled "Filter findings" |
| Trigger | A button with a full accessible name, for example "Cloud provider equals Org-Production, and 2 more", or "{label}: any value" |
| Clear and remove | Separate buttons named "Clear {label} value" and "Remove {label} filter" |
| Popover | Labelled "{label} filter"; Radix handles focus and Esc |
| Operator | Radix Select labelled "Operator" |
| Tabs | Radix ToggleGroup (single) labelled "Show values" |
| Value list | `role="group"` (multi) or `role="radiogroup"` (single), labelled "{label} values" |
| Multi rows | Radix Checkbox with a `<label>`; tree parents use the indeterminate state |
| Single rows | Buttons with `role="radio"` and `aria-checked` |
| Tree toggle | Button with `aria-expanded`, named "Expand {name}" or "Collapse {name}" |
| Search inputs | Labelled ("Search {label} values", "Search findings by name or asset", "Search filters") |
| Calendar days | Buttons named with the full date, `aria-pressed` on From and To; future days `disabled` |
| Severity toggles | `aria-pressed`, a tooltip that also opens on focus |
| Focus | 2px `ring` outline on every control |
| Targets | Controls are 32px high; inner icon buttons 24×24 |

## 10. Copy

All strings from [`src/i18n/findings.ts`](../../src/i18n/findings.ts) (English):

| Key | Text |
|---|---|
| `findings.filters.label` | Filter findings |
| `findings.filters.reset` | Reset |
| `findings.search.label` | Search findings by name or asset |
| `findings.search.clear` | Clear search |
| `findings.severity.group` | Filter by severity |
| `findings.severity.toggle` | {name}, {count, plural, one {# finding} other {# findings}} |
| `findings.severity.critical.short` … `low.short` | C · H · M · L |
| `findings.filter.aria` | {label} {op, select, eq {equals} neq {does not equal} other {is}} {value}{more, plural, =0 {} other {, and # more}} |
| `findings.filter.ariaEmpty` | {label}: any value |
| `findings.filter.more` | +{count, number} |
| `findings.filter.clear` | Clear {label} value |
| `findings.filter.remove` | Remove {label} filter |
| `findings.filter.dialog` | {label} filter |
| `findings.filter.show` | Show values |
| `findings.filter.tabAll` | All |
| `findings.filter.tabSelected` | Selected |
| `findings.filter.search` | Search {label} values |
| `findings.filter.searchPlaceholder` | Search |
| `findings.filter.searchOrCreate` | Search or create |
| `findings.filter.create` | Create “&lt;b&gt;{value}&lt;/b&gt;” |
| `findings.filter.values` | {label} values |
| `findings.filter.noneSelected` | No values selected |
| `findings.filter.noMatch` | No values match “{query}” |
| `findings.filter.selectAll` | Select all |
| `findings.filter.unselectAll` | Unselect all |
| `findings.filter.expand` / `collapse` | Expand {name} / Collapse {name} |
| `findings.op.label` | Operator |
| `findings.op.eq.option` / `neq.option` | Equals (=) / Not equals (≠) |
| `findings.op.eq.symbol` / `neq.symbol` | = / ≠ |
| `findings.date.from` / `to` | From / To |
| `findings.date.startPlaceholder` / `endPlaceholder` | Start date / End date |
| `findings.date.fromOnly` | From {date} |
| `findings.date.prevMonth` / `nextMonth` | Previous month / Next month |
| `findings.date.clear` | Clear dates |
| `findings.addFilter.label` | Add filter |
| `findings.addFilter.search` | Search filters |
| `findings.addFilter.available` | Available filters |
| `findings.addFilter.noMatch` | No filters match “{query}” |
| `findings.addFilter.allAdded` | All filters are on the page |
| `findings.state.emptyTitle` | No findings match these filters |
| `findings.state.emptyBody` | That doesn't mean you're clear: your filters may be hiding findings. Remove a filter or widen the date range. |
| `findings.state.clearFilters` | Clear filters |

Filter names are the `findings.filter.<id>` keys (for example "Cloud provider", "Finding status"). Value names come from `findings.value.*`, `findings.status.*` and `findings.groupBy.*` where they're labels, and stay as data where they come from scans.

## 11. i18n and RTL

- Every string above exists in en, ar and ja. Plurals use ICU, including Arabic's six forms.
- Layout uses logical properties only (`ps`/`pe`, `start`/`end`, `border-s`, `rounded-e`), so the bar and popovers mirror in Arabic.
- Directional chevrons (tree expand, previous and next month) mirror with `rtl:-scale-x-100`.
- Scan values (accounts, assets, CVEs, finding names) are data: shown untranslated, wrapped in `<bdi>` where they appear inline.
- Dates and numbers use `Intl` with the active locale; Arabic uses Western digits (`ar-u-nu-latn`, D-007).

## 12. Tokens

| Part | Tokens |
|---|---|
| Static trigger | `border-control-border`, `bg-background`, `text-muted-foreground` (label, chevron), `text-foreground` (value, clear) |
| On-demand trigger | `border-primary`, `text-link` (label, operator, value, chevron, clear, remove), `bg-info-muted` (+N and hover) |
| +N chip (static) | `bg-muted`, `text-foreground` |
| Add filter | `border-primary` dashed, `text-link`, `bg-info-muted` when open |
| Reset | `text-link` |
| Popover | `bg-popover`, `border-border`, `shadow-2`, `rounded-xl` |
| Selected row | `bg-info-muted`, tick in `text-link` |
| Checkbox, radio, calendar From/To | `primary`, `primary-foreground`, `input` |
| Severity toggle on | `severity-*-muted`, `severity-*-border`, `severity-*-foreground` |
| Focus | `ring` |

## 13. Known limits

- The table uses 400 seeded mock findings. Only **Cloud provider**, **Finding name**, **Finding status** and **Asset name** narrow the rows; the other filters change the bar, not the table, until the findings API is wired.
- The Classifier filter from the updated spreadsheet isn't built yet (§5).
- Provider and asset icons are muted Lucide placeholders until the logos are supplied (D-065).
- The calendar week starts on Sunday in every locale. [open: start the week by locale.]
- Saved filters, Save and Save as new view are menus without behaviour yet. [open: define how a saved view stores filters.]
- The date range selector in header row 1 and the date filters are independent. [open: how the header range and a "Last seen" filter combine.]

## 14. Related decisions

- **D-064:** severity toggles as C/H/M/L; static vs on-demand filters; clear and remove colours; Reset; behaviour from the dropdown spreadsheet.
- **D-065:** Findings page in code: icon placeholders, native table, Radix popovers with collision handling, mock data.

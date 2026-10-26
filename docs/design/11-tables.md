# Tables: principles and behaviour

How tables work across the platform. The Findings table is the reference implementation; this file describes what its code does today plus the product owner's rules for every table. Where code and rule differ it says **Mismatch**; where something isn't settled it says **[open: …]**.

Code: [FindingsTable.tsx](../../src/components/findings/FindingsTable.tsx) (table, row actions, columns menu, pagination, bulk bar) · [data.ts](../../src/components/findings/data.ts) (`COLUMNS`) · [parts.tsx](../../src/components/findings/parts.tsx) (icons and tones) · [FindingsPage.tsx](../../src/routes/FindingsPage.tsx) (table bar, sort, grouping, paging, states) · [findings.ts](../../src/i18n/findings.ts) (copy) · [findings.stories.tsx](../../src/components/findings/findings.stories.tsx), [findingDrawer.stories.tsx](../../src/components/findings/findingDrawer.stories.tsx) (tested behaviour). Sizes: [03](03-layout-and-grid.md). Filters above a table: [10](10-filters.md).

## 1. Purpose and scope

A table answers **"What should I fix first, and how?"**: it ranks many items by risk and lets people act on one or many. Use one when people compare items across several attributes or act on them in bulk.

| Use | When |
|---|---|
| Table | Many items, several attributes to compare, sorting or bulk actions needed |
| List | Few items, one main attribute, or the order is fixed (a timeline, steps) |
| Chart | The question is about a trend or a distribution, not individual items. A chart drills into a filtered table (CLAUDE.md) |

## 2. Principles

| # | Principle | Because |
|---|---|---|
| 1 | Table actions sit at the **top inline-end** of the table: Customize columns, Compact rows, Export. Every table has all three | People find the same tools in the same place on every page; inline-end mirrors in Arabic |
| 2 | Every column header can sort | People reorder by the attribute that matters to them now |
| 3 | A cell value works with or without a leading icon | Icons help scanning where they carry meaning (severity, status, provider) and are left out where they don't |
| 4 | Each row has its row-level actions in one ⋯ menu at the row's end | Rows stay calm and scannable; actions are always in the same place |
| 5 | Text that opens or navigates is a link in primary blue: `text-link`, underline on hover. Never `--primary` as text (fails 4.5:1, D-056) | People can tell what's clickable without hovering |
| 6 | Row selection and the bulk bar appear only on tables that have bulk actions | A checkbox column with nothing to do is noise |
| 7 | Severity and status show an icon and a name; Resolved and Ignored are muted; no row tints | Never colour alone; strong colour only on open, actionable items (CLAUDE.md) |
| 8 | Any change to what's shown (sort, filters, search, page size) returns to page 1 | A changed list never opens on an empty later page |

## 3. Anatomy

```
73 findings                                   [⫴ Columns] [≡] [⤓ Export]   ← count · table actions (top inline-end)
┌─────────────────────────────────────────────────────────────────────────┐
│ ☐  Severity ↓   Finding ⇅        Asset ⇅    Cloud account ⇅  Status ⇅ … │ ← header: select page, sortable headers, actions column
├─────────────────────────────────────────────────────────────────────────┤
│ Critical · 6 findings                                                   │ ← group header row (Group by)
│ ☐  ⊘ Critical   IAM role has …    ▣ eks-staging  ☁ Org-Production ◷ …  ⋯ │ ← row: checkbox, cells, row actions
├─────────────────────────────────────────────────────────────────────────┤
│ Rows per page [25 ▾]                         1–25 of 73   « ‹ 1 2 3 › » │ ← pagination
└─────────────────────────────────────────────────────────────────────────┘
                 [ 3 selected │ Assign owner  Create ticket  Change status  Ignore │ ✕ ]   ← floating bulk bar
```

## 4. Table actions

Placed in one row with the result count: the count at inline-start, the actions at inline-end, in this order.

| Action | Behaviour |
|---|---|
| **Columns** | Outline button that opens the "Customize columns" popover (aligned to the end). Each column has a drag handle (visual), a checkbox to show or hide it, and **Move up** / **Move down** buttons, which are the keyboard and pointer alternative to dragging (WCAG 2.5.7). The first and last rows disable Move up and Move down. **Finding** is locked: its checkbox is disabled and it shows "Always shown". **Reset columns** restores all columns, visible, in the default order |
| **Compact rows** | Icon button with `aria-pressed` and a "Compact rows" tooltip. Rows go from 36px to 28px; row action buttons shrink from 32px to 24px |
| **Export** | Outline button. [open: what Export exports (current page, all filtered rows, chosen columns) and in which formats] |

[open: drag-to-reorder in the columns list is visual only today; Move up and Move down do the reordering.]

## 5. Header and sorting

| Item | Behaviour |
|---|---|
| Which columns sort | Every visible data column (Severity, Finding, Asset, Cloud account, Status, Last seen, Ticket) |
| Click cycle | An unsorted or ascending column sorts descending; a descending column sorts ascending |
| Default | Severity, descending |
| What each column sorts by | Severity: risk score (descending = highest first). Finding, Asset, Cloud account: name, case-insensitive. Status: the order Open, In progress, Resolved, Ignored (ascending). Last seen: age (descending = oldest first). Ticket: ID, with rows that have no ticket last when ascending and first when descending |

[open: "Last seen" descending shows the oldest first, the opposite of what most people expect from a date column; decide whether to sort it by recency.]
| Icons | Unsorted: up-down arrows at 60% opacity. Ascending: up arrow. Descending: down arrow |
| Semantics | `aria-sort` on the `<th>`: `none`, `ascending` or `descending`; the sort control is a button inside it |
| Paging | Sorting returns to page 1 |

## 6. Rows and cells

### Cell types

| Cell | Icon | Content | Notes |
|---|---|---|---|
| Severity | Severity icon (`SEVERITY_ICON`) | Name ("Critical") | Severity `-foreground` tone; muted for Resolved and Ignored. The score sorts but isn't shown |
| Finding | None | Finding name | Opens the drawer (see §7) |
| Asset | Leading icon (`box`) | Asset name in `<bdi>` | Icon is a muted placeholder until real icons ship (D-065) |
| Cloud account | Leading icon (`cloud`) | Account name in `<bdi>` | As above |
| Status | Status icon (`STATUS_ICON`) | Name ("In progress") | Open and In progress use their status tones; Resolved and Ignored are muted |
| Last seen | None | Relative time ("3 hours ago") | Hours under a day, then days under a week, then weeks |
| Ticket | None | Ticket ID link in `<bdi>`, or an em dash | The dash is hidden from screen readers, which hear "No ticket" |

### Rules

| Rule | Implementation |
|---|---|
| Icons are optional per column | A cell with an icon puts it at inline-start, 16px, 4px gap; the name always follows |
| Muted when closed | Resolved and Ignored rows mute severity and status (alert fatigue) |
| No row tints | Rows use `border-b` only; hover and selected rows use `bg-accent` |
| Truncation | Every cell truncates to one line; the table uses fixed column widths |
| Technical values | Asset, account and ticket IDs are wrapped in `<bdi>` |
| Row height | 36px default, 28px compact (`03`) |

## 7. Links

| Control | Kind | Colour today | Rule |
|---|---|---|---|
| Ticket ID | Link | `text-link`, underline on hover | Matches rule 5 |
| Finding name | Button that opens the finding detail drawer (`aria-haspopup="dialog"`) | `text-foreground`, underline on hover | **Mismatch** with rule 5 |
| Pagination numbers | Buttons | Current page `text-link` on `bg-info-muted` | Not links; rule 5 doesn't apply |

**Mismatch: finding name colour.** Rule 5 says text that opens or navigates is primary blue. The finding name opens the drawer but is `text-foreground`.
- Trade-off: blue names make every row's first column blue, which adds colour to a dense table, but it makes the main action discoverable without hovering and matches the ticket link.
- Proposed fix: change the finding name to `text-link` with underline on hover in `FindingsTable.tsx`, keep it a `<button>` (it opens a dialog, it doesn't navigate), and add a decision-log entry recording rule 5. Code is not changed in this doc's PR.

## 8. Row-level actions

| Item | Behaviour |
|---|---|
| Control | A ghost icon button (⋯) in the last column, at the row's inline-end |
| Label | "More actions for {name}" |
| Size | 32×32 in default rows, 24×24 in compact rows (both meet the 24×24 minimum) |
| Menu | Radix DropdownMenu aligned to the end: **View details**, **Ask about this**, **Why am I seeing this?** |
| Rule | Row actions live only in this menu; no inline action buttons in rows (product owner, principle 4) |

[open: View details and the finding name both open the drawer, but the menu items have no behaviour wired yet.]

## 9. Selection and bulk actions

Only on tables with bulk actions (principle 6). The Findings table has them.

| Item | Behaviour |
|---|---|
| Row checkbox | First column; labelled "Select {name}"; the row gets `aria-selected` and `bg-accent` when selected |
| Header checkbox | "Select all findings on this page"; checked, unchecked or partly checked for the current page only |
| Bulk bar | Appears when one or more rows are selected. Floats 24px above the bottom of the page, centred, `role="toolbar"` labelled "Bulk actions" |
| Bulk bar content | "{count} selected" (a live status), then **Assign owner**, **Create ticket**, **Change status**, **Ignore**, then **Clear selection** (icon button) |
| Persistence | Selection survives paging and sorting; Clear selection empties it |

[open: the bulk actions have no behaviour wired yet. Ignore is reversible and should show an Undo toast (D-037), as the drawer does.]

## 10. Grouping and pagination

### Grouping

| Item | Behaviour |
|---|---|
| Source | The **Group by** filter (None, Severity, Status, Cloud account) |
| Structure | One `<tbody>` per group, headed by a row whose `<th scope="rowgroup">` spans every column: "{label} · {count} findings" |
| Order | Severity groups go Critical → Info; other groups in the order rows arrive |
| Scope | Groups apply to the current page |

[open: grouping is per page, so a group can split across pages; decide whether groups should page as units.]

### Pagination

| Item | Behaviour |
|---|---|
| Rows per page | Select with 25, 50, 100 (default 25), labelled "Rows per page" |
| Range | "{start}–{end} of {total}" |
| Buttons | First page, Previous page, numbered pages, Next page, Last page. Numbers show the first, the last and the current page ±1, with an ellipsis for gaps |
| Current page | `aria-current="page"`, `text-link` on `bg-info-muted` with a primary ring |
| Disabled | First and Previous on page 1; Next and Last on the last page |
| Reset | Changing the page size, sort, filters or search returns to page 1 |

## 11. States

| State | What shows |
|---|---|
| Loading | Skeleton rows in place of the table; a hidden status reads "Loading findings" |
| No results | "No findings match these filters", "That doesn't mean you're clear: your filters may be hiding findings. Remove a filter or widen the date range." and **Clear filters** |
| Error | "We couldn't load findings", "The findings service didn't respond, so this list may be missing new issues. Try again in a minute." and **Try again**, in a `role="alert"` region |

## 12. Accessibility

| Item | Implementation |
|---|---|
| Table | Native `<table>` with a hidden `<caption>` ("Findings"); header cells `scope="col"`; group headers `scope="rowgroup"` |
| Sorting | `aria-sort` on headers; a real button per header |
| Selection | Radix Checkboxes with labels; indeterminate header state; `aria-selected` on rows |
| Row actions | Labelled icon button opening a Radix menu (keyboard and roles from Radix) |
| Columns popover | Labelled "Customize columns"; Move up and Move down as the non-drag alternative; disabled at the ends |
| Pagination | `nav` labelled "Pagination"; labelled icon buttons; `aria-current` on the current page |
| Bulk bar | `role="toolbar"`; the count is a live status |
| Targets | Controls 32px; compact-row action buttons and checkbox targets 24×24 |
| Focus | 2px `ring` outline on every control |
| Keyboard order | Table actions, then header controls left to right (mirrored in RTL), then rows, then pagination, then the bulk bar |

## 13. i18n and RTL

- Logical properties only (`ps`/`pe`, `start`/`end`, `text-start`, `ms-auto`), so table actions sit at the left in Arabic.
- Pagination chevrons mirror (`rtl:-scale-x-100`).
- Counts, ranges and page numbers use `Intl` number formatting; Arabic uses Western digits (`ar-u-nu-latn`, D-007).
- "Last seen" uses `Intl.RelativeTimeFormat` with the active locale.
- Technical values (assets, accounts, tickets) are wrapped in `<bdi>` and never translated.

## 14. Tokens

| Part | Tokens |
|---|---|
| Table card | `border-border`, `bg-card`, `rounded-xl` |
| Header text | `text-muted-foreground` |
| Row border, hover, selected | `border-border`, `bg-accent` |
| Group header row | `bg-background`, `text-muted-foreground` |
| Severity cell | `severity-*-foreground` (muted rows: `muted-foreground`) |
| Status cell | `status-open-foreground`, `status-in-progress-foreground`; Resolved and Ignored `muted-foreground` |
| Icon placeholders | `muted-foreground` |
| Links | `text-link` |
| Current page | `text-link`, `bg-info-muted`, ring `primary` |
| Bulk bar | `bg-popover`, `border-border`, `shadow-3`, `rounded-xl` |
| Focus | `ring` |

## 15. Known limits

- Rows come from 400 seeded mock findings until the findings API is wired (D-065).
- The table has a minimum width of 1120px and scrolls horizontally inside its card when narrower.
- The header doesn't stick while scrolling. [open: sticky header.]
- Columns can't be resized. [open: column resize and minimum widths.]
- Column choices and density aren't saved between visits. [open: where to persist column layout and density.]
- Export, the row menu items and the bulk actions are UI only.

## 16. Related decisions

- **D-056:** `--link` is the text-safe primary blue; `--primary` as text fails contrast.
- **D-064:** Findings filter bar (filters above the table).
- **D-065:** Findings page in code: native table, icon placeholders, mock data.
- **D-066:** Finding detail drawer, opened from the finding name.
- [open: record principles 1, 4, 5 and 6 (product owner, this doc) as a decision-log entry.]

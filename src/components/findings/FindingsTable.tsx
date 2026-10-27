import { Fragment } from "react";
import { useIntl } from "react-intl";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  BotIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  CircleDotIcon,
  CircleHelpIcon,
  CloudIcon,
  Columns3Icon,
  EllipsisIcon,
  EyeOffIcon,
  GripVerticalIcon,
  PanelRightOpenIcon,
  TicketIcon,
  UserPlusIcon,
  XIcon,
} from "lucide-react";
import { useT } from "@/i18n/useT";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COLUMNS, type ColumnId, type Finding } from "./data";
import { IconPlaceholder, SEVERITY_ICON, SEVERITY_TEXT, STATUS_ICON, STATUS_TEXT } from "./parts";

export type Sort = { column: ColumnId; dir: "asc" | "desc" };
export type ColumnState = { id: ColumnId; visible: boolean };
export type RowGroup = { key: string; label: string; rows: Finding[] };

/** Relative "last seen" in the active locale: hours, then days, then weeks. */
function useLastSeen() {
  const intl = useIntl();
  return (h: number) =>
    h < 24 ? intl.formatRelativeTime(-h, "hour", { numeric: "auto" })
      : h < 168 ? intl.formatRelativeTime(-Math.floor(h / 24), "day", { numeric: "auto" })
        : intl.formatRelativeTime(-Math.floor(h / 168), "week", { numeric: "auto" });
}

/**
 * Findings table (native <table>, CLAUDE.md). Columns follow the customizer; headers sort; rows
 * select for bulk actions; Group by splits rows into one <tbody> per group. Resolved and ignored
 * rows are muted (alert fatigue); no row tints.
 */
export function FindingsTable({
  groups,
  columns,
  sort,
  onSort,
  selected,
  onSelected,
  compact,
  onOpen,
}: {
  groups: RowGroup[];
  columns: ColumnState[];
  sort: Sort;
  onSort: (s: Sort) => void;
  selected: string[];
  /** Takes an updater so quick consecutive clicks don't overwrite each other. */
  onSelected: (update: (prev: string[]) => string[]) => void;
  compact: boolean;
  /** Opens the finding detail drawer. */
  onOpen: (f: Finding, trigger: HTMLElement) => void;
}) {
  const t = useT();
  const lastSeen = useLastSeen();
  const visible = columns.filter((c) => c.visible).map((c) => COLUMNS.find((d) => d.id === c.id)!);
  const pageIds = groups.flatMap((g) => g.rows.map((r) => r.id));
  const nOn = pageIds.filter((id) => selected.includes(id)).length;
  const allState = nOn === 0 ? false : nOn === pageIds.length ? true : "indeterminate";
  const rowH = compact ? "h-7" : "h-9";

  const cell = (c: ColumnId, f: Finding) => {
    const quiet = f.status === "resolved" || f.status === "ignored";
    switch (c) {
      case "severity": {
        const Icon = SEVERITY_ICON[f.severity];
        return (
          <span className={cn("inline-flex items-center gap-1", quiet ? "text-muted-foreground" : SEVERITY_TEXT[f.severity])}>
            <Icon className="size-4 shrink-0" aria-hidden />{t(`findings.severity.${f.severity}`)}
          </span>
        );
      }
      case "name":
        return (
          <button
            type="button"
            data-slot="finding-open"
            aria-haspopup="dialog"
            onClick={(e) => onOpen(f, e.currentTarget)}
            className="max-w-full truncate rounded-sm text-start font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:outline-2 focus-visible:outline-ring"
          >
            {f.name}
          </button>
        );
      case "asset":
        return <span className="inline-flex min-w-0 max-w-full items-center gap-1"><IconPlaceholder /><bdi className="truncate">{f.asset}</bdi></span>;
      case "account":
        return <span className="inline-flex min-w-0 max-w-full items-center gap-1"><IconPlaceholder icon={CloudIcon} /><bdi className="truncate">{f.account}</bdi></span>;
      case "status": {
        const Icon = STATUS_ICON[f.status];
        return <span className={cn("inline-flex items-center gap-1", STATUS_TEXT[f.status])}><Icon className="size-4 shrink-0" aria-hidden />{t(`findings.status.${f.status}`)}</span>;
      }
      case "lastSeen":
        return <span className="text-muted-foreground">{lastSeen(f.ageHours)}</span>;
      case "ticket":
        return f.ticket
          ? <a href="#main-content" className="font-medium text-link no-underline hover:underline underline-offset-4"><bdi>{f.ticket}</bdi></a>
          : <><span aria-hidden className="text-muted-foreground">—</span><span className="sr-only">{t("findings.table.noTicket")}</span></>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table data-slot="findings-table" className="w-full min-w-280 table-fixed border-collapse text-sm">
        <caption className="sr-only">{t("findings.table.caption")}</caption>
        <thead>
          <tr className="h-9 border-b border-border text-xs font-medium text-muted-foreground">
            <th scope="col" className="w-10 ps-3 text-start">
              <Checkbox
                aria-label={t("findings.table.selectPage")}
                checked={allState}
                onCheckedChange={() => onSelected((prev) => (allState === true ? prev.filter((id) => !pageIds.includes(id)) : [...prev, ...pageIds.filter((id) => !prev.includes(id))]))}
              />
            </th>
            {visible.map((c) => {
              const sorted = sort.column === c.id;
              const SortIcon = !sorted ? ArrowUpDownIcon : sort.dir === "asc" ? ArrowUpIcon : ArrowDownIcon;
              return (
                <th key={c.id} scope="col" aria-sort={sorted ? (sort.dir === "asc" ? "ascending" : "descending") : "none"} className={cn("px-3 text-start font-medium", c.className)}>
                  <button
                    type="button"
                    onClick={() => onSort({ column: c.id, dir: sorted && sort.dir === "desc" ? "asc" : "desc" })}
                    className="-ms-1 inline-flex h-6 items-center gap-1 rounded-sm px-1 outline-none hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    {t(`findings.column.${c.id}`)}
                    <SortIcon className={cn("size-3", !sorted && "opacity-60")} aria-hidden />
                  </button>
                </th>
              );
            })}
            <th scope="col" className="w-12 pe-2"><span className="sr-only">{t("findings.table.actions")}</span></th>
          </tr>
        </thead>
        {groups.map((g) => (
          <tbody key={g.key}>
            {g.label && (
              <tr className="h-8 border-b border-border bg-background">
                <th scope="rowgroup" colSpan={visible.length + 2} className="px-3 text-start text-xs font-medium text-muted-foreground">
                  {t("findings.table.group", { label: g.label, count: g.rows.length })}
                </th>
              </tr>
            )}
            {g.rows.map((f) => {
              const on = selected.includes(f.id);
              return (
                <tr key={f.id} data-slot="finding-row" aria-selected={on} className={cn(rowH, "border-b border-border last:border-b-0 hover:bg-accent", on && "bg-accent")}>
                  <td className="ps-3">
                    <Checkbox aria-label={t("findings.table.selectRow", { name: f.name })} checked={on} onCheckedChange={() => onSelected((prev) => (prev.includes(f.id) ? prev.filter((x) => x !== f.id) : [...prev, f.id]))} />
                  </td>
                  {visible.map((c) => (
                    <td key={c.id} className="truncate px-3">{cell(c.id, f)}</td>
                  ))}
                  <td className="pe-2 text-end">
                    <RowActions name={f.name} compact={compact} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        ))}
      </table>
    </div>
  );
}

function RowActions({ name, compact }: { name: string; compact: boolean }) {
  const t = useT();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={compact ? "icon-sm" : "icon"} aria-label={t("findings.table.moreActions", { name })}>
          <EllipsisIcon aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem><PanelRightOpenIcon aria-hidden />{t("findings.row.details")}</DropdownMenuItem>
        <DropdownMenuItem><BotIcon aria-hidden />{t("findings.row.ask")}</DropdownMenuItem>
        <DropdownMenuItem><CircleHelpIcon aria-hidden />{t("findings.row.why")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Show, hide and reorder columns. Drag handles are visual; Move up/down is the keyboard and pointer alternative (WCAG 2.5.7). */
export function ColumnsMenu<C extends string = ColumnId>({
  columns,
  onChange,
  defaultOpen,
  defs = COLUMNS as unknown as { id: C; locked?: boolean }[],
  labelOf,
}: {
  columns: { id: C; visible: boolean }[];
  onChange: (c: { id: C; visible: boolean }[]) => void;
  defaultOpen?: boolean;
  /** Column definitions for another table; defaults to the Findings columns. */
  defs?: { id: C; locked?: boolean }[];
  labelOf?: (id: C) => string;
}) {
  const t = useT();
  const move = (i: number, d: number) => {
    const next = columns.slice();
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <Popover defaultOpen={defaultOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" data-slot="columns-trigger" className="data-[state=open]:bg-accent"><Columns3Icon className="text-muted-foreground" aria-hidden />{t("findings.columns.label")}</Button>
      </PopoverTrigger>
      <PopoverContent align="end" collisionPadding={16} className="flex w-72 flex-col gap-1 rounded-xl p-2" aria-label={t("findings.columns.dialog")}>
        <p className="px-1 pb-1 text-xs font-medium text-muted-foreground">{t("findings.columns.hint")}</p>
        <ul className="flex flex-col gap-1">
          {columns.map((c, i) => {
            const locked = !!defs.find((d) => d.id === c.id)?.locked;
            const name = labelOf ? labelOf(c.id) : t(`findings.column.${c.id}`);
            const id = `col-${c.id}`;
            return (
              <li key={c.id} className="flex h-8 items-center gap-1 rounded-sm ps-1 hover:bg-accent">
                <GripVerticalIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <Checkbox id={id} checked={c.visible} disabled={locked} onCheckedChange={() => onChange(columns.map((x) => (x.id === c.id ? { ...x, visible: !x.visible } : x)))} />
                <label htmlFor={id} className="min-w-0 flex-1 truncate ps-1">{name}</label>
                {locked && <span className="text-xs text-muted-foreground">{t("findings.columns.locked")}</span>}
                <Button variant="ghost" size="icon-sm" aria-label={t("findings.columns.up", { name })} disabled={i === 0} onClick={() => move(i, -1)}><ArrowUpIcon aria-hidden /></Button>
                <Button variant="ghost" size="icon-sm" aria-label={t("findings.columns.down", { name })} disabled={i === columns.length - 1} onClick={() => move(i, 1)}><ArrowDownIcon aria-hidden /></Button>
              </li>
            );
          })}
        </ul>
        <div className="my-1 h-px bg-border" />
        <Button variant="link" size="sm" className="self-start px-1" onClick={() => onChange(defs.map((c) => ({ id: c.id, visible: true })))}>{t("findings.columns.reset")}</Button>
      </PopoverContent>
    </Popover>
  );
}

export const PAGE_SIZES = [25, 50, 100];

/** Rows per page, range, and page buttons with gaps (first, last, current ±1). */
export function Pagination({ page, pageSize, total, onPage, onPageSize, className }: { page: number; pageSize: number; total: number; onPage: (p: number) => void; onPageSize: (n: number) => void; className?: string }) {
  const t = useT();
  const intl = useIntl();
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const nums: number[] = [];
  for (let p = 1; p <= pages; p++) if (p === 1 || p === pages || Math.abs(p - page) <= 1) nums.push(p);
  const start = total ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(page * pageSize, total);
  return (
    <div data-slot="pagination" className={cn("flex min-h-12 flex-wrap items-center gap-4 border-t border-border px-3 py-2", className)}>
      <div className="flex items-center gap-2">
        <span id="rows-per-page" className="text-muted-foreground">{t("findings.pagination.rowsPerPage")}</span>
        <Select value={String(pageSize)} onValueChange={(v) => onPageSize(Number(v))}>
          <SelectTrigger aria-labelledby="rows-per-page" className="w-20 font-normal tabular-nums"><SelectValue /></SelectTrigger>
          <SelectContent>{PAGE_SIZES.map((n) => <SelectItem key={n} value={String(n)}>{intl.formatNumber(n)}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <p className="ms-auto text-muted-foreground tabular-nums">{t("findings.pagination.range", { start, end, total })}</p>
      <nav aria-label={t("findings.pagination.label")} className="flex items-center gap-1">
        <Button variant="ghost" size="icon" aria-label={t("findings.pagination.first")} disabled={page === 1} onClick={() => onPage(1)}><ChevronsLeftIcon className="rtl:-scale-x-100" aria-hidden /></Button>
        <Button variant="ghost" size="icon" aria-label={t("findings.pagination.prev")} disabled={page === 1} onClick={() => onPage(page - 1)}><ChevronLeftIcon className="rtl:-scale-x-100" aria-hidden /></Button>
        {nums.map((p, i) => (
          <Fragment key={p}>
            {i > 0 && p - nums[i - 1] > 1 && <span aria-hidden className="w-6 text-center text-muted-foreground">…</span>}
            <Button
              variant="ghost"
              aria-label={t("findings.pagination.page", { page: p })}
              aria-current={p === page ? "page" : undefined}
              onClick={() => onPage(p)}
              className={cn("h-8 min-w-8 px-2 tabular-nums text-foreground", p === page && "bg-info-muted font-semibold text-link ring-1 ring-primary ring-inset hover:bg-info-muted")}
            >
              {intl.formatNumber(p)}
            </Button>
          </Fragment>
        ))}
        <Button variant="ghost" size="icon" aria-label={t("findings.pagination.next")} disabled={page === pages} onClick={() => onPage(page + 1)}><ChevronRightIcon className="rtl:-scale-x-100" aria-hidden /></Button>
        <Button variant="ghost" size="icon" aria-label={t("findings.pagination.last")} disabled={page === pages} onClick={() => onPage(pages)}><ChevronsRightIcon className="rtl:-scale-x-100" aria-hidden /></Button>
      </nav>
    </div>
  );
}

/** Floats above the bottom of the page while rows are selected. */
export function BulkBar({ count, onClear }: { count: number; onClear: () => void }) {
  const t = useT();
  return (
    <div data-slot="bulk-bar" role="toolbar" aria-label={t("findings.bulk.label")} className="sticky bottom-6 z-20 mx-auto flex h-12 w-fit items-center gap-2 rounded-xl border border-border bg-popover ps-4 pe-2 shadow-3">
      <span role="status" className="pe-1 font-semibold whitespace-nowrap">{t("findings.bulk.selected", { count })}</span>
      <div aria-hidden className="h-6 w-px bg-border" />
      <Button variant="outline"><UserPlusIcon className="text-muted-foreground" aria-hidden />{t("findings.bulk.assign")}</Button>
      <Button variant="outline"><TicketIcon className="text-muted-foreground" aria-hidden />{t("findings.bulk.ticket")}</Button>
      <Button variant="outline"><CircleDotIcon className="text-muted-foreground" aria-hidden />{t("findings.bulk.status")}</Button>
      <Button variant="outline"><EyeOffIcon className="text-muted-foreground" aria-hidden />{t("findings.bulk.ignore")}</Button>
      <div aria-hidden className="h-6 w-px bg-border" />
      <Button variant="ghost" size="icon" aria-label={t("findings.bulk.clear")} onClick={onClear}><XIcon aria-hidden /></Button>
    </div>
  );
}

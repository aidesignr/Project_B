import { useMemo, useState, type ReactNode } from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router-dom";
import {
  BookmarkIcon,
  CalendarIcon,
  ChevronDownIcon,
  CircleAlertIcon,
  CloudIcon,
  GitBranchIcon,
  NetworkIcon,
  PackageIcon,
  RefreshCwIcon,
  Rows3Icon,
  SearchIcon,
  DownloadIcon,
  type LucideIcon,
} from "lucide-react";
import { useT } from "@/i18n/useT";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PageContainer } from "@/components/shell/Page";
import {
  COLUMNS,
  FINDINGS,
  SEVERITIES,
  STATUSES,
  emptyFilter,
  type FilterId,
  type FilterState,
  type Finding,
  type Severity,
} from "@/components/findings/data";
import { FilterBar } from "@/components/findings/FilterBar";
import { BulkBar, ColumnsMenu, FindingsTable, Pagination, type ColumnState, type RowGroup, type Sort } from "@/components/findings/FindingsTable";
import { FindingDrawer, type DrawerState, type DrawerTab } from "@/components/findings/FindingDrawer";
import { SAMPLE_FINDING } from "@/components/findings/detail";

const SCANS: { id: string; icon: LucideIcon }[] = [
  { id: "cloud", icon: CloudIcon },
  { id: "kubernetes", icon: NetworkIcon },
  { id: "images", icon: PackageIcon },
  { id: "code", icon: GitBranchIcon },
];
const RANGES = ["24h", "7d", "30d", "90d"] as const;
const SEVERITY_RANK: Record<Severity, number> = { critical: 5, high: 4, medium: 3, low: 2, info: 1 };

/** What the page opens with, and what Reset puts back. */
const DEFAULT_SEVERITIES: Severity[] = ["critical", "high", "medium"];
const DEFAULT_ORDER: FilterId[] = ["groupBy", "provider", "findingStatus"];
const defaultFilters = (): Partial<Record<FilterId, FilterState>> => ({
  groupBy: emptyFilter({ selected: ["severity"] }),
  provider: emptyFilter({ selected: ["Org-Production", "Org-Customer Demo", "Org-Product Development"] }),
  findingStatus: emptyFilter({ selected: ["open", "inProgress"] }),
});

export type FindingsPreset = {
  /** Opens the detail drawer for the sample finding with these defaults. */
  drawer?: { tab?: DrawerTab; graphView?: "graph" | "list"; raw?: "finding" | "asset"; state?: DrawerState; toast?: "ignored" | "link" };
  open?: FilterId;
  addOpen?: boolean;
  columnsOpen?: boolean;
  selected?: string[];
  extraFilters?: FilterId[];
  query?: string;
};

/**
 * Findings › All findings (canvas "Findings page"). Row 1: scan type, Create rule, Save, freshness,
 * Refresh, Saved filters, date range. Row 2: search, C/H/M/L, Group by, Cloud provider, on-demand
 * filters, Add filter. Then the count, table actions, the paged table and the bulk bar.
 * `?state=loading|error` previews those states.
 */
export function FindingsPage({ preset = {} }: { preset?: FindingsPreset }) {
  const t = useT();
  const intl = useIntl();
  const [params, setParams] = useSearchParams();
  const pageState = params.get("state");

  const [scan, setScan] = useState("cloud");
  const [range, setRange] = useState<(typeof RANGES)[number]>("30d");
  const [query, setQueryState] = useState(preset.query ?? "");
  const [severities, setSeveritiesState] = useState<Severity[]>(DEFAULT_SEVERITIES);
  const [order, setOrder] = useState<FilterId[]>([...DEFAULT_ORDER, ...(preset.extraFilters ?? [])]);
  const [filters, setFilters] = useState<Partial<Record<FilterId, FilterState>>>(() => {
    const f = defaultFilters();
    (preset.extraFilters ?? []).forEach((id) => { f[id] = emptyFilter(); });
    return f;
  });
  const [columns, setColumns] = useState<ColumnState[]>(COLUMNS.map((c) => ({ id: c.id, visible: true })));
  const [sort, setSortState] = useState<Sort>({ column: "severity", dir: "desc" });
  const [selected, setSelected] = useState<string[]>(preset.selected ?? []);
  const [compact, setCompact] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [detailOf, setDetailOf] = useState<Finding | null>(preset.drawer ? SAMPLE_FINDING : null);
  const [drawerOpen, setDrawerOpen] = useState(!!preset.drawer);
  const [drawerState, setDrawerState] = useState<DrawerState>(preset.drawer?.state ?? "ready");
  const [detailTrigger, setDetailTrigger] = useState<HTMLElement | null>(null);
  const openDetail = (f: Finding, trigger: HTMLElement) => { setDetailOf(f); setDetailTrigger(trigger); setDrawerState("ready"); setDrawerOpen(true); };

  // Any change to what's shown goes back to page 1.
  const setQuery = (q: string) => { setQueryState(q); setPage(1); };
  const setSeverities = (s: Severity[]) => { setSeveritiesState(s); setPage(1); };
  const setSort = (s: Sort) => { setSortState(s); setPage(1); };
  const setFilter = (id: FilterId, next: FilterState) => { setFilters((f) => ({ ...f, [id]: next })); setPage(1); };
  const addFilter = (id: FilterId) => { setOrder((o) => [...o, id]); setFilters((f) => ({ ...f, [id]: emptyFilter() })); setPage(1); };
  const removeFilter = (id: FilterId) => {
    setOrder((o) => o.filter((x) => x !== id));
    setFilters((f) => { const next = { ...f }; delete next[id]; return next; });
    setPage(1);
  };
  const resetFilters = () => {
    setQueryState("");
    setSeveritiesState(DEFAULT_SEVERITIES);
    setOrder(DEFAULT_ORDER);
    setFilters(defaultFilters());
    setPage(1);
  };
  const clearFilters = () => {
    setQueryState("");
    setSeveritiesState([]);
    setOrder(["groupBy", "provider"]);
    setFilters((f) => ({ groupBy: f.groupBy, provider: emptyFilter() }));
    setPage(1);
  };

  // Mock filtering until the findings API is wired: provider, finding name, status and asset name
  // narrow the rows; the other filters are UI only for now.
  const base = useMemo(() => {
    const match = (id: FilterId, v: string) => {
      const f = filters[id];
      if (!f || !f.selected.length) return true;
      const hit = f.selected.includes(v);
      return f.op === "neq" ? !hit : hit;
    };
    const q = query.trim().toLocaleLowerCase();
    return FINDINGS.filter((f) =>
      match("provider", f.account) && match("findingName", f.name) && match("findingStatus", f.status) && match("assetName", f.asset) &&
      (!q || `${f.name} ${f.asset}`.toLocaleLowerCase().includes(q)));
  }, [filters, query]);

  const severityCounts = useMemo(() => {
    const c = Object.fromEntries(SEVERITIES.map((s) => [s, 0])) as Record<Severity, number>;
    base.forEach((f) => { c[f.severity] += 1; });
    return c;
  }, [base]);

  const rows = useMemo(() => {
    const key: Record<string, (f: Finding) => string | number> = {
      severity: (f) => f.score, name: (f) => f.name.toLocaleLowerCase(), asset: (f) => f.asset.toLocaleLowerCase(),
      account: (f) => f.account.toLocaleLowerCase(), status: (f) => STATUSES.indexOf(f.status), lastSeen: (f) => f.ageHours, ticket: (f) => f.ticket ?? "~",
    };
    const k = key[sort.column];
    const dir = sort.dir === "asc" ? 1 : -1;
    return base
      .filter((f) => !severities.length || severities.includes(f.severity))
      .sort((a, b) => { const x = k(a), y = k(b); return x < y ? -dir : x > y ? dir : 0; });
  }, [base, severities, sort]);

  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, pages);
  const pageRows = rows.slice((current - 1) * pageSize, current * pageSize);

  const groupBy = filters.groupBy?.selected[0];
  const groups: RowGroup[] = useMemo(() => {
    const label: Record<string, (f: Finding) => [string, string]> = {
      severity: (f) => [f.severity, t(`findings.severity.${f.severity}`)],
      status: (f) => [f.status, t(`findings.status.${f.status}`)],
      account: (f) => [f.account, f.account],
    };
    const by = groupBy ? label[groupBy] : undefined;
    if (!by) return [{ key: "all", label: "", rows: pageRows }];
    const out: RowGroup[] = [];
    pageRows.forEach((f) => {
      const [k, l] = by(f);
      let g = out.find((x) => x.key === k);
      if (!g) { g = { key: k, label: l, rows: [] }; out.push(g); }
      g.rows.push(f);
    });
    if (groupBy === "severity") out.sort((a, b) => SEVERITY_RANK[b.key as Severity] - SEVERITY_RANK[a.key as Severity]);
    return out;
  }, [pageRows, groupBy, t]);

  const scanDef = SCANS.find((s) => s.id === scan)!;
  const ScanIcon = scanDef.icon;
  const freshness = t("shell.page.updated", { time: intl.formatRelativeTime(-4, "minute") });

  return (
    <PageContainer>
      {/* Header row 1 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" data-slot="scan-type" aria-label={t("findings.scan.trigger", { scan: t(`findings.scan.${scan}`) })} className="font-semibold data-[state=open]:bg-accent">
              <ScanIcon className="text-muted-foreground" aria-hidden />{t(`findings.scan.${scan}`)}<ChevronDownIcon className="text-muted-foreground" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>{t("findings.scan.label")}</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={scan} onValueChange={setScan}>
              {SCANS.map(({ id, icon: Icon }) => <DropdownMenuRadioItem key={id} value={id}><Icon aria-hidden />{t(`findings.scan.${id}`)}</DropdownMenuRadioItem>)}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex flex-wrap items-center gap-1">
          <Button variant="ghost" className="text-link hover:text-link">{t("findings.createRule")}</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-1 text-link hover:text-link data-[state=open]:bg-accent">{t("findings.save.label")}<ChevronDownIcon aria-hidden /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>{t("findings.save.save")}</DropdownMenuItem>
              <DropdownMenuItem>{t("findings.save.saveAs")}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div aria-hidden className="mx-1 h-6 w-px bg-border" />
          <span className="text-xs whitespace-nowrap text-muted-foreground">{freshness}</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t("findings.refresh")}><RefreshCwIcon aria-hidden /></Button>
            </TooltipTrigger>
            <TooltipContent>{t("findings.refresh")}</TooltipContent>
          </Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ms-1 data-[state=open]:bg-accent"><BookmarkIcon className="text-muted-foreground" aria-hidden />{t("findings.saved.label")}<ChevronDownIcon className="text-muted-foreground" aria-hidden /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>{t("findings.saved.yours")}</DropdownMenuLabel>
              <DropdownMenuItem>{t("findings.saved.criticalProd")}</DropdownMenuItem>
              <DropdownMenuItem>{t("findings.saved.publicStorage")}</DropdownMenuItem>
              <DropdownMenuItem>{t("findings.saved.assignedToMe")}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>{t("findings.saved.manage")}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ms-1 data-[state=open]:bg-accent" aria-label={t("findings.range.trigger", { range: t(`findings.range.${range}`) })}>
                <CalendarIcon className="text-muted-foreground" aria-hidden />{t(`findings.range.${range}`)}<ChevronDownIcon className="text-muted-foreground" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup value={range} onValueChange={(v) => setRange(v as (typeof RANGES)[number])}>
                {RANGES.map((r) => <DropdownMenuRadioItem key={r} value={r}>{t(`findings.range.${r}`)}</DropdownMenuRadioItem>)}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>{t("findings.range.custom")}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Header row 2 */}
      <FilterBar
        query={query}
        onQuery={setQuery}
        severities={severities}
        severityCounts={severityCounts}
        onSeverities={setSeverities}
        order={order}
        filters={filters}
        onFilter={setFilter}
        onAdd={addFilter}
        onRemove={removeFilter}
        onReset={resetFilters}
        openFilter={preset.open}
        addOpen={preset.addOpen}
      />

      {/* Count + table actions */}
      <div className="flex min-h-8 items-center justify-between gap-3">
        <p role="status" className="font-semibold">{t("findings.count", { count: rows.length })}</p>
        <div className="flex items-center gap-2">
          <ColumnsMenu columns={columns} onChange={setColumns} defaultOpen={preset.columnsOpen} />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t("findings.compact")} aria-pressed={compact} onClick={() => setCompact((c) => !c)} className={cn(compact && "bg-accent text-foreground")}>
                <Rows3Icon aria-hidden />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("findings.compact")}</TooltipContent>
          </Tooltip>
          <Button variant="outline"><DownloadIcon className="text-muted-foreground" aria-hidden />{t("shell.page.export")}</Button>
        </div>
      </div>

      <section aria-label={t("findings.table.caption")} className="overflow-hidden rounded-xl border border-border bg-card">
        {pageState === "loading" ? (
          <div>
            <p role="status" className="sr-only">{t("findings.state.loading")}</p>
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} aria-hidden className="flex h-9 items-center gap-6 border-b border-border px-4 last:border-b-0">
                <Skeleton className="size-4 rounded-sm" /><Skeleton className="h-3 w-24" /><Skeleton className="h-3 w-80" /><Skeleton className="h-3 w-36" /><Skeleton className="h-3 w-40" />
              </div>
            ))}
          </div>
        ) : pageState === "error" ? (
          <State
            alert
            icon={CircleAlertIcon}
            title={t("findings.state.errorTitle")}
            body={t("findings.state.errorBody")}
            action={<Button variant="outline" onClick={() => setParams({})}><RefreshCwIcon aria-hidden />{t("shell.slot.retry")}</Button>}
          />
        ) : rows.length === 0 ? (
          <State
            icon={SearchIcon}
            title={t("findings.state.emptyTitle")}
            body={t("findings.state.emptyBody")}
            action={<Button variant="outline" onClick={clearFilters}>{t("findings.state.clearFilters")}</Button>}
          />
        ) : (
          <>
            <FindingsTable groups={groups} columns={columns} sort={sort} onSort={setSort} selected={selected} onSelected={setSelected} compact={compact} onOpen={openDetail} />
            <Pagination page={current} pageSize={pageSize} total={rows.length} onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1); }} />
          </>
        )}
      </section>

      {selected.length > 0 && <BulkBar count={selected.length} onClear={() => setSelected([])} />}

      {detailOf && (
        <FindingDrawer
          key={detailOf.id}
          finding={detailOf}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          defaultTab={preset.drawer?.tab}
          defaultGraphView={preset.drawer?.graphView}
          defaultRaw={preset.drawer?.raw}
          defaultToast={preset.drawer?.toast}
          state={drawerState}
          onRetry={() => setDrawerState("ready")}
          returnFocusTo={detailTrigger}
        />
      )}
    </PageContainer>
  );
}

function State({ icon: Icon, title, body, action, alert }: { icon: LucideIcon; title: string; body: string; action: ReactNode; alert?: boolean }) {
  return (
    <div role={alert ? "alert" : undefined} className="flex min-h-100 flex-col items-center justify-center gap-2 p-8 text-center">
      <span className={cn("grid size-10 place-items-center rounded-md", alert ? "bg-error-muted text-error-foreground" : "bg-muted text-muted-foreground")}>
        <Icon className="size-5" aria-hidden />
      </span>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="max-w-110 text-muted-foreground">{body}</p>
      <div className="mt-2">{action}</div>
    </div>
  );
}

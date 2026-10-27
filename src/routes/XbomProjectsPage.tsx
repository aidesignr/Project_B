import { useMemo, useState, type ReactNode } from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router-dom";
import { CircleAlertIcon, DownloadIcon, PackageIcon, PlusIcon, RefreshCwIcon, Rows3Icon, SearchIcon, SearchXIcon, XIcon, type LucideIcon } from "lucide-react";
import { useT } from "@/i18n/useT";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PageContainer } from "@/components/shell/Page";
import { emptyFilter, type FilterState } from "@/components/findings/data";
import { FilterDropdown } from "@/components/findings/FilterDropdown";
import { ColumnsMenu, Pagination } from "@/components/findings/FindingsTable";
import { PROJECT_COLUMNS, PROJECT_FILTERS, PROJECTS, type Project, type ProjectColumnId } from "@/components/xbom/data";
import { ProjectsBulkBar, ProjectsTable, type ProjectColumnState, type ProjectSort } from "@/components/xbom/ProjectsTable";

type FilterKey = keyof typeof PROJECT_FILTERS;

/** What the page opens with (stories use it to show a state). */
export type ProjectsPreset = {
  query?: string;
  filters?: Partial<Record<FilterKey, Partial<FilterState>>>;
  open?: FilterKey;
  selected?: string[];
  columnsOpen?: boolean;
};

const PAGE_STATES = ["loading", "empty", "error"] as const;

/**
 * XBOM › Projects (canvas "XBOM · Projects", D-069): search, Classifier and Tags (static filters),
 * Reset and "Add project"; then the count, freshness, Refresh and the table actions; then the
 * table. Export covers every project until rows are selected, then only the selection.
 * `?state=loading|empty|error` previews those states. Rows are mock projects until the API is wired.
 */
export function XbomProjectsPage({ preset = {} }: { preset?: ProjectsPreset }) {
  const t = useT();
  const intl = useIntl();
  const [params, setParams] = useSearchParams();
  const pageState = PAGE_STATES.find((s) => s === params.get("state"));

  const [query, setQuery] = useState(preset.query ?? "");
  const [filters, setFilters] = useState<Record<FilterKey, FilterState>>({
    classifier: emptyFilter(preset.filters?.classifier),
    tags: emptyFilter(preset.filters?.tags),
  });
  const [sort, setSort] = useState<ProjectSort>({ column: "name", dir: "asc" });
  const [selected, setSelected] = useState<string[]>(preset.selected ?? []);
  const [columns, setColumns] = useState<ProjectColumnState[]>(PROJECT_COLUMNS.map((c) => ({ id: c.id, visible: true })));
  const [compact, setCompact] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const setFilter = (key: FilterKey, next: FilterState) => { setFilters((f) => ({ ...f, [key]: next })); setPage(1); };
  const reset = () => { setQuery(""); setFilters({ classifier: emptyFilter(), tags: emptyFilter() }); setPage(1); };
  const anyFilter = !!query || filters.classifier.selected.length > 0 || filters.tags.selected.length > 0;

  const rows = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    const pass = (f: FilterState, hit: boolean) => !f.selected.length || (f.op === "eq" ? hit : !hit);
    const out = PROJECTS.filter((p) =>
      (!q || `${p.name} ${p.owner} ${p.description}`.toLocaleLowerCase().includes(q)) &&
      pass(filters.classifier, filters.classifier.selected.includes(p.classifier)) &&
      pass(filters.tags, p.tags.some((tag) => filters.tags.selected.includes(tag))));
    const key: Record<ProjectColumnId, (p: Project) => string | number> = {
      name: (p) => p.name,
      classifier: (p) => t(`xbom.classifier.${p.classifier}`),
      tags: (p) => p.tags.join(" "),
      bomFiles: (p) => p.bomFiles,
      owner: (p) => p.owner,
      description: (p) => p.description,
    };
    const by = key[sort.column];
    const dir = sort.dir === "asc" ? 1 : -1;
    return out.sort((a, b) => {
      const x = by(a), y = by(b);
      return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), intl.locale, { sensitivity: "base" })) * dir;
    });
  }, [query, filters, sort, t, intl.locale]);

  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, pages);
  const pageRows = rows.slice((current - 1) * pageSize, current * pageSize);
  const freshness = t("shell.page.updated", { time: intl.formatRelativeTime(-4, "minute") });
  const empty = pageState === "empty";

  return (
    <PageContainer>
      {/* Toolbar: search and filters at the start, the page's primary action at the end */}
      <div className="flex min-h-8 flex-wrap items-center gap-2">
        {!empty && (
          <div role="search" aria-label={t("xbom.projects.filters.label")} className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <div className="relative w-80 min-w-60 shrink">
              <SearchIcon className="pointer-events-none absolute start-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                aria-label={t("xbom.projects.search.label")}
                placeholder={t("xbom.projects.search.placeholder")}
                className="h-8 w-full rounded-md border border-input bg-background ps-8 pe-8 text-sm outline-none placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button
                  type="button"
                  aria-label={t("xbom.projects.search.clear")}
                  onClick={() => { setQuery(""); setPage(1); }}
                  className="absolute end-1 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-sm text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <XIcon className="size-4" aria-hidden />
                </button>
              )}
            </div>
            <div aria-hidden className="h-6 w-px shrink-0 bg-border" />
            {(Object.keys(PROJECT_FILTERS) as FilterKey[]).map((key) => (
              <FilterDropdown
                key={key}
                def={PROJECT_FILTERS[key]}
                label={t(`xbom.projects.filter.${key}`)}
                value={filters[key]}
                onChange={(next) => setFilter(key, next)}
                defaultOpen={preset.open === key}
              />
            ))}
            {anyFilter && <Button variant="ghost" className="text-link hover:text-link" onClick={reset}>{t("xbom.projects.filters.reset")}</Button>}
          </div>
        )}
        <Button className="ms-auto"><PlusIcon aria-hidden />{t("xbom.projects.add")}</Button>
      </div>

      {/* Count + freshness + table actions */}
      {!empty && pageState !== "error" && (
        <div className="flex min-h-8 items-center justify-between gap-3">
          {pageState === "loading"
            ? <Skeleton className="h-4 w-24" />
            : <p role="status" className="font-semibold">{t("xbom.projects.count", { count: rows.length })}</p>}
          <div className="flex items-center gap-2">
            <span className="text-xs whitespace-nowrap text-muted-foreground">{freshness}</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t("xbom.projects.refresh")}><RefreshCwIcon aria-hidden /></Button>
              </TooltipTrigger>
              <TooltipContent>{t("xbom.projects.refresh")}</TooltipContent>
            </Tooltip>
            <div aria-hidden className="h-6 w-px bg-border" />
            <ColumnsMenu columns={columns} onChange={setColumns} defs={PROJECT_COLUMNS} labelOf={(id) => t(`xbom.projects.column.${id}`)} defaultOpen={preset.columnsOpen} />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t("findings.compact")} aria-pressed={compact} onClick={() => setCompact((c) => !c)} className={cn(compact && "bg-accent text-foreground")}>
                  <Rows3Icon aria-hidden />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("findings.compact")}</TooltipContent>
            </Tooltip>
            <Button variant="outline" data-slot="export" aria-label={t("xbom.projects.export.label", { count: selected.length })}>
              <DownloadIcon className="text-muted-foreground" aria-hidden />{t("xbom.projects.export", { count: selected.length })}
            </Button>
          </div>
        </div>
      )}

      <section aria-label={t("xbom.projects.caption")} className="overflow-hidden rounded-xl border border-border bg-card">
        {pageState === "loading" ? (
          <div>
            <p role="status" className="sr-only">{t("xbom.projects.state.loading")}</p>
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} aria-hidden className="flex h-9 items-center gap-6 border-b border-border px-4 last:border-b-0">
                <Skeleton className="size-4 rounded-sm" /><Skeleton className="h-3 w-40" /><Skeleton className="h-5 w-24" /><Skeleton className="h-3 w-32" /><Skeleton className="h-3 w-12" /><Skeleton className="h-3 w-36" /><Skeleton className="h-3 w-48" />
              </div>
            ))}
          </div>
        ) : pageState === "error" ? (
          <State
            alert
            icon={CircleAlertIcon}
            title={t("xbom.projects.state.errorTitle")}
            body={t("xbom.projects.state.errorBody")}
            action={<Button variant="outline" onClick={() => setParams({})}><RefreshCwIcon aria-hidden />{t("shell.slot.retry")}</Button>}
          />
        ) : empty ? (
          <State
            tall
            icon={PackageIcon}
            title={t("xbom.projects.state.emptyTitle")}
            body={t("xbom.projects.state.emptyBody")}
            action={<Button><PlusIcon aria-hidden />{t("xbom.projects.add")}</Button>}
          />
        ) : rows.length === 0 ? (
          <State
            icon={SearchXIcon}
            title={t("xbom.projects.state.noResultsTitle")}
            body={t("xbom.projects.state.noResultsBody")}
            action={<Button variant="outline" onClick={reset}>{t("xbom.projects.state.clearFilters")}</Button>}
          />
        ) : (
          <>
            <ProjectsTable rows={pageRows} columns={columns} sort={sort} onSort={(s) => { setSort(s); setPage(1); }} selected={selected} onSelected={setSelected} compact={compact} />
            <Pagination
              page={current}
              pageSize={pageSize}
              total={rows.length}
              onPage={setPage}
              onPageSize={(n) => { setPageSize(n); setPage(1); }}
              className="text-table [&_[data-slot=button]]:text-table [&_[data-slot=select-trigger]]:text-table"
            />
          </>
        )}
      </section>

      {selected.length > 0 && <ProjectsBulkBar count={selected.length} onClear={() => setSelected([])} />}
    </PageContainer>
  );
}

function State({ icon: Icon, title, body, action, alert, tall }: { icon: LucideIcon; title: string; body: string; action: ReactNode; alert?: boolean; tall?: boolean }) {
  return (
    <div role={alert ? "alert" : undefined} className={cn("flex flex-col items-center justify-center gap-2 p-8 text-center", tall ? "min-h-140" : "min-h-100")}>
      <span className={cn("grid size-10 place-items-center rounded-md", alert ? "bg-error-muted text-error-foreground" : "bg-muted text-muted-foreground")}>
        <Icon className="size-5" aria-hidden />
      </span>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="max-w-110 text-muted-foreground">{body}</p>
      <div className="mt-2">{action}</div>
    </div>
  );
}

import { useState } from "react";
import { useIntl } from "react-intl";
import { PlusIcon, SearchIcon, XIcon } from "lucide-react";
import { useT } from "@/i18n/useT";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FILTERS, SEVERITY_TOGGLES, STATIC_FILTERS, type FilterId, type FilterState, type Severity } from "./data";
import { FilterDropdown } from "./FilterDropdown";
import { SEVERITY_ICON, SEVERITY_ON, SEVERITY_TEXT } from "./parts";

/**
 * Header row 2 (canvas "Findings page"): search that takes the free width and shrinks as filters
 * grow (filters wrap when it reaches its minimum), C/H/M/L severity toggles, the static Group by
 * and Cloud provider filters, on-demand filters, and Add filter.
 */
export function FilterBar({
  query,
  onQuery,
  severities,
  severityCounts,
  onSeverities,
  order,
  filters,
  onFilter,
  onAdd,
  onRemove,
  onReset,
  openFilter,
  addOpen,
}: {
  query: string;
  onQuery: (q: string) => void;
  severities: Severity[];
  severityCounts: Record<Severity, number>;
  onSeverities: (s: Severity[]) => void;
  order: FilterId[];
  filters: Partial<Record<FilterId, FilterState>>;
  onFilter: (id: FilterId, next: FilterState) => void;
  onAdd: (id: FilterId) => void;
  onRemove: (id: FilterId) => void;
  /** Puts every filter back to the page's defaults. */
  onReset: () => void;
  /** Stories: open one filter's popover on first render. */
  openFilter?: FilterId;
  addOpen?: boolean;
}) {
  const t = useT();
  const statics = order.filter((id) => STATIC_FILTERS.includes(id));
  const dynamics = order.filter((id) => !STATIC_FILTERS.includes(id));

  return (
    <div role="search" aria-label={t("findings.filters.label")} className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-60 flex-1 basis-60">
        <SearchIcon className="pointer-events-none absolute start-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          type="text"
          data-slot="findings-search"
          aria-label={t("findings.search.label")}
          placeholder={t("findings.search.label")}
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          className="h-8 w-full rounded-md border border-input bg-background ps-8 pe-8 text-sm outline-none placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />
        {query && (
          <button
            type="button"
            aria-label={t("findings.search.clear")}
            onClick={() => onQuery("")}
            className="absolute end-1 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-sm text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            <XIcon className="size-4" aria-hidden />
          </button>
        )}
      </div>

      <SeverityToggles selected={severities} counts={severityCounts} onChange={onSeverities} />

      {statics.map((id) => (
        <FilterDropdown key={id} def={FILTERS[id]} value={filters[id]!} onChange={(v) => onFilter(id, v)} defaultOpen={openFilter === id} />
      ))}
      <div aria-hidden className="h-6 w-px shrink-0 bg-border" />
      {dynamics.map((id) => (
        <FilterDropdown key={id} def={FILTERS[id]} value={filters[id]!} onChange={(v) => onFilter(id, v)} onRemove={() => onRemove(id)} defaultOpen={openFilter === id} />
      ))}
      <AddFilter onScreen={order} onAdd={onAdd} defaultOpen={addOpen} />
      <Button variant="ghost" data-slot="reset-filters" className="text-link hover:text-link" onClick={onReset}>{t("findings.filters.reset")}</Button>
    </div>
  );
}

/** C/H/M/L toggles (D-064): one click each, several can be on. Off = outline, on = tint. Counts follow the other filters. */
export function SeverityToggles({ selected, counts, onChange }: { selected: Severity[]; counts: Record<Severity, number>; onChange: (s: Severity[]) => void }) {
  const t = useT();
  const intl = useIntl();
  return (
    <div role="group" aria-label={t("findings.severity.group")} className="flex shrink-0 items-center gap-1">
      {SEVERITY_TOGGLES.map((s) => {
        const on = selected.includes(s);
        const Icon = SEVERITY_ICON[s];
        const name = t(`findings.severity.${s}`);
        return (
          <Tooltip key={s}>
            <TooltipTrigger asChild>
              <button
                type="button"
                data-slot="severity-toggle"
                data-severity={s}
                aria-pressed={on}
                aria-label={t("findings.severity.toggle", { name, count: counts[s] })}
                onClick={() => onChange(on ? selected.filter((x) => x !== s) : [...selected, s])}
                className={cn(
                  "inline-flex h-8 items-center gap-1 rounded-md border px-2 text-sm whitespace-nowrap outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  on ? cn(SEVERITY_ON[s], "font-medium") : "border-control-border bg-background text-muted-foreground hover:bg-accent",
                )}
              >
                <Icon className={cn("size-4", SEVERITY_TEXT[s])} aria-hidden />
                <span className="font-semibold">{t(`findings.severity.${s}.short`)}</span>
                <span className="tabular-nums">{intl.formatNumber(counts[s])}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>{name}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

/** Lists every on-demand filter not yet on the page; adding one keeps the list open. */
export function AddFilter({ onScreen, onAdd, defaultOpen = false }: { onScreen: FilterId[]; onAdd: (id: FilterId) => void; defaultOpen?: boolean }) {
  const t = useT();
  const [open, setOpen] = useState(defaultOpen);
  const [query, setQuery] = useState("");
  const q = query.trim().toLocaleLowerCase();
  const available = (Object.keys(FILTERS) as FilterId[]).filter((id) => !STATIC_FILTERS.includes(id) && !onScreen.includes(id));
  const shown = available.filter((id) => !q || t(`findings.filter.${id}`).toLocaleLowerCase().includes(q));

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) setQuery(""); }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-slot="add-filter"
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md border border-dashed border-primary px-3 text-sm font-medium text-link outline-none hover:bg-info-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[state=open]:bg-info-muted"
        >
          <PlusIcon className="size-4" aria-hidden />
          {t("findings.addFilter.label")}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" collisionPadding={16} className="flex w-72 flex-col gap-2 rounded-xl p-2" aria-label={t("findings.addFilter.label")}>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute start-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            type="text"
            aria-label={t("findings.addFilter.search")}
            placeholder={t("findings.addFilter.search")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8 w-full rounded-md border border-input bg-background ps-8 pe-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
        </div>
        <ul aria-label={t("findings.addFilter.available")} className="flex max-h-90 flex-col overflow-y-auto">
          {shown.map((id) => (
            <li key={id}>
              <button
                type="button"
                data-slot="add-filter-option"
                onClick={() => onAdd(id)}
                className="flex h-8 w-full items-center gap-2 rounded-sm px-2 text-start outline-none hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
              >
                <PlusIcon className="size-4 text-muted-foreground" aria-hidden />
                {t(`findings.filter.${id}`)}
              </button>
            </li>
          ))}
        </ul>
        {shown.length === 0 && (
          <p role="status" className="px-2 py-6 text-center text-muted-foreground">
            {available.length ? t("findings.addFilter.noMatch", { query: query.trim() }) : t("findings.addFilter.allAdded")}
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}

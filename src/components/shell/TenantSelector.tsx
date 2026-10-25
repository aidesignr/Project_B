import { useId, useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import { Building2Icon, CheckIcon, ChevronDownIcon, ChevronRightIcon, SearchIcon } from "lucide-react";
import { useT } from "@/i18n/useT";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TENANTS, type Scope } from "./demo";

type Row =
  | { kind: "tenant"; ti: number; label: string; expanded: boolean }
  | { kind: "group"; ti: number; gi: number; label: string };

/** Marks the matched part of a name so search results show why they matched. */
function Highlight({ text, query }: { text: string; query: string }): ReactNode {
  const i = query ? text.toLocaleLowerCase().indexOf(query) : -1;
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-sm bg-info-muted text-info-foreground">{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  );
}

/**
 * Tenant and group selector (canvas "A2 · Components", 3a–3e): one search across tenants and
 * groups, a tree of tenants with their groups, single select. Combobox with a tree popup: the
 * search input keeps focus and the arrow keys move the active row (aria-activedescendant); Enter
 * selects a group or toggles a tenant; Right/Left (mirrored in RTL) expand and collapse.
 */
export function TenantSelector({ defaultOpen = false, defaultQuery = "" }: { defaultOpen?: boolean; defaultQuery?: string }) {
  const t = useT();
  const [open, setOpenState] = useState(defaultOpen);
  const [current, setCurrent] = useState<Scope>({ tenant: 0, group: 0 });
  const [expanded, setExpanded] = useState<Record<number, boolean>>({ 0: true });
  const [query, setQuery] = useState(defaultQuery);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const rowId = (i: number) => `${listId}-row-${i}`;

  const allGroups = t("shell.scope.group.all");
  const groupName = (s: Scope) => (s.group === 0 ? allGroups : TENANTS[s.tenant].groups[s.group - 1]);
  const q = query.trim().toLocaleLowerCase();

  const rows = useMemo<Row[]>(() => {
    const out: Row[] = [];
    TENANTS.forEach((tenant, ti) => {
      const tenantHit = !!q && tenant.name.toLocaleLowerCase().includes(q);
      const groupHits = tenant.groups.map((label, i) => ({ label, gi: i + 1 })).filter((g) => q && g.label.toLocaleLowerCase().includes(q));
      if (q && !tenantHit && !groupHits.length) return;
      const isOpen = q ? true : !!expanded[ti];
      out.push({ kind: "tenant", ti, label: tenant.name, expanded: isOpen });
      if (!isOpen) return;
      const groups = q && !tenantHit ? groupHits : [{ label: allGroups, gi: 0 }, ...tenant.groups.map((label, i) => ({ label, gi: i + 1 }))];
      groups.forEach(({ label, gi }) => out.push({ kind: "group", ti, gi, label }));
    });
    return out;
  }, [q, expanded, allGroups]);

  const setOpen = (next: boolean) => {
    setOpenState(next);
    if (next) {
      setQuery("");
      setActive(-1);
      setExpanded((e) => ({ ...e, [current.tenant]: true }));
    }
  };

  const toggle = (ti: number, to?: boolean) => setExpanded((e) => ({ ...e, [ti]: to ?? !e[ti] }));
  const select = (scope: Scope) => {
    setCurrent(scope);
    setOpenState(false);
  };
  const act = (row: Row) => (row.kind === "tenant" ? toggle(row.ti) : select({ tenant: row.ti, group: row.gi }));

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!rows.length) return;
    const row = rows[active];
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % rows.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a <= 0 ? rows.length - 1 : a - 1)); }
    else if (e.key === "Home") { e.preventDefault(); setActive(0); }
    else if (e.key === "End") { e.preventDefault(); setActive(rows.length - 1); }
    else if (e.key === "Enter" && row) { e.preventDefault(); act(row); }
    else if (row?.kind === "tenant" && !q && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
      // Logical keys: in RTL the "open" direction is ArrowLeft.
      const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
      const opening = (e.key === "ArrowRight") !== rtl;
      e.preventDefault();
      toggle(row.ti, opening);
    }
  };

  // Rows rendered per tenant: a tenant treeitem owns a group of group treeitems.
  const blocks: { ti: number; header: number; items: number[] }[] = [];
  rows.forEach((r, i) => {
    if (r.kind === "tenant") blocks.push({ ti: r.ti, header: i, items: [] });
    else blocks[blocks.length - 1].items.push(i);
  });

  const rowClass = (i: number) =>
    cn("flex h-8 w-full cursor-default items-center gap-2 rounded-sm px-2 text-start text-xs outline-none hover:bg-accent", i === active && "bg-accent");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          data-slot="tenant-trigger"
          type="button"
          aria-label={t("shell.scope.trigger", { tenant: TENANTS[current.tenant].name, group: groupName(current) })}
          className="flex h-8 min-w-0 max-w-70 items-center gap-2 rounded-md border border-control-border bg-background ps-3 pe-2 text-xs outline-none transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[state=open]:bg-accent"
        >
          <Building2Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="min-w-0 truncate @max-3xl:sr-only">
            <span className="font-medium">{TENANTS[current.tenant].name}</span>
            <span className="text-muted-foreground">{t("shell.scope.separator")}{groupName(current)}</span>
          </span>
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0" aria-label={t("shell.scope.label")}>
        <div className="relative border-b border-border p-2">
          <SearchIcon className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            role="combobox"
            aria-label={t("shell.scope.filter")}
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-haspopup="tree"
            aria-activedescendant={active >= 0 && rows[active] ? rowId(active) : undefined}
            placeholder={t("shell.scope.filter")}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(-1); }}
            onKeyDown={onKeyDown}
            className="h-8 w-full rounded-md border border-input bg-background ps-8 pe-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
        </div>
        <div role="status" className={cn("flex flex-col items-center gap-1 px-4 py-6 text-center text-xs", rows.length > 0 && "sr-only")}>
          {rows.length === 0 && (
            <>
              <span className="font-medium">{t("shell.scope.none", { query: query.trim() })}</span>
              <span className="text-muted-foreground">{t("shell.scope.noneHint")}</span>
            </>
          )}
        </div>
        <div id={listId} role="tree" aria-label={t("shell.scope.tree")} className={cn("max-h-80 overflow-y-auto p-1", rows.length === 0 && "hidden")}>
          {blocks.map(({ ti, header, items }) => {
            const row = rows[header] as Extract<Row, { kind: "tenant" }>;
            const isActiveTenant = current.tenant === ti;
            const Chevron = row.expanded ? ChevronDownIcon : ChevronRightIcon;
            return (
              <div key={ti} id={rowId(header)} role="treeitem" aria-level={1} aria-expanded={row.expanded} aria-labelledby={`${rowId(header)}-name`}>
                <div data-slot="tenant-row" onMouseMove={() => setActive(header)} onClick={() => toggle(ti)} className={rowClass(header)}>
                  <Chevron className="size-4 shrink-0 text-muted-foreground rtl:-scale-x-100" aria-hidden />
                  <span id={`${rowId(header)}-name`} className="truncate font-medium"><Highlight text={row.label} query={q} /></span>
                  {isActiveTenant && (
                    <span className="inline-flex h-5 shrink-0 items-center rounded-sm bg-success-muted px-2 font-medium text-success-foreground">
                      {t("shell.scope.active")}
                    </span>
                  )}
                </div>
                {items.length > 0 && (
                  <div role="group">
                    {items.map((i) => {
                      const g = rows[i] as Extract<Row, { kind: "group" }>;
                      const selected = current.tenant === g.ti && current.group === g.gi;
                      return (
                        <div
                          key={g.gi}
                          id={rowId(i)}
                          role="treeitem"
                          aria-level={2}
                          aria-selected={selected}
                          data-slot="scope-option"
                          onMouseMove={() => setActive(i)}
                          onClick={() => select({ tenant: g.ti, group: g.gi })}
                          className={cn(rowClass(i), "ps-8", selected && "bg-accent font-medium")}
                        >
                          <span className="min-w-0 flex-1 truncate"><Highlight text={g.label} query={q} /></span>
                          {selected && <CheckIcon className="size-4 shrink-0 text-link" aria-hidden />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

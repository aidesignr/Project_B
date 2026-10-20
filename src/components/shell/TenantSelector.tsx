import { useId, useMemo, useState, type KeyboardEvent } from "react";
import { Building2Icon, CheckIcon, ChevronDownIcon, HistoryIcon, SearchIcon } from "lucide-react";
import { useT } from "@/i18n/useT";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SCOPES, scopeId, type Scope } from "./demo";

const RECENT_KEY = "ak.recentScopes";
const read = () => { try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") as string[]; } catch { return []; } };
const write = (ids: string[]) => { try { localStorage.setItem(RECENT_KEY, JSON.stringify(ids)); } catch { /* private mode */ } };

type Option = { id: string; scope: Scope; section: "recent" | "all" };

/**
 * Searchable tenant + group picker (combobox pattern: the filter input owns focus and moves an
 * active option with the arrow keys; Enter selects). Recent selections show while the filter is empty.
 */
export function TenantSelector({ defaultOpen = false, defaultQuery = "" }: { defaultOpen?: boolean; defaultQuery?: string }) {
  const t = useT();
  const [open, setOpenState] = useState(defaultOpen);
  const [current, setCurrent] = useState<Scope>(SCOPES[0]);
  const [recent, setRecent] = useState<string[]>(() => {
    const saved = read().filter((id) => SCOPES.some((s) => scopeId(s) === id));
    return saved.length ? saved : [scopeId(SCOPES[0]), scopeId(SCOPES[3])];
  });
  const [query, setQuery] = useState(defaultQuery);
  const [active, setActive] = useState(0);
  const listId = useId();
  const optionId = (i: number) => `${listId}-opt-${i}`;

  const groupName = (s: Scope) => t(s.groupKey);
  const q = query.trim().toLocaleLowerCase();

  const options = useMemo<Option[]>(() => {
    if (q) {
      return SCOPES.filter((s) => `${s.tenant} ${groupName(s)}`.toLocaleLowerCase().includes(q)).map((scope) => ({ id: scopeId(scope), scope, section: "all" }));
    }
    const recentOpts: Option[] = recent
      .map((id) => SCOPES.find((s) => scopeId(s) === id))
      .filter((s): s is Scope => !!s)
      .map((scope) => ({ id: scopeId(scope), scope, section: "recent" }));
    return [...recentOpts, ...SCOPES.map((scope) => ({ id: scopeId(scope), scope, section: "all" as const }))];
  }, [q, recent, t]);

  const setOpen = (next: boolean) => {
    setOpenState(next);
    if (next) {
      setQuery("");
      setActive(0);
    }
  };

  const select = (scope: Scope) => {
    setCurrent(scope);
    const next = [scopeId(scope), ...recent.filter((id) => id !== scopeId(scope))].slice(0, 3);
    setRecent(next);
    write(next);
    setOpenState(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!options.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % options.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a - 1 + options.length) % options.length); }
    else if (e.key === "Home") { e.preventDefault(); setActive(0); }
    else if (e.key === "End") { e.preventDefault(); setActive(options.length - 1); }
    else if (e.key === "Enter") { e.preventDefault(); select(options[active].scope); }
  };

  const currentId = scopeId(current);
  const sections: { key: "recent" | "all"; title: string; icon?: typeof HistoryIcon }[] = [
    { key: "recent", title: t("shell.scope.recent"), icon: HistoryIcon },
    { key: "all", title: t("shell.scope.all") },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          data-slot="tenant-trigger"
          type="button"
          aria-label={t("shell.scope.trigger", { tenant: current.tenant, group: groupName(current) })}
          className="flex h-9 min-w-0 max-w-65 items-center gap-2 rounded-md border border-control-border bg-background ps-3 pe-2 text-start outline-none transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[state=open]:bg-accent @3xl:min-w-45"
        >
          <Building2Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="flex min-w-0 flex-1 flex-col text-xs @max-3xl:sr-only">
            <span className="truncate font-medium">{current.tenant}</span>
            <span className="truncate text-muted-foreground">{groupName(current)}</span>
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
            aria-activedescendant={options.length ? optionId(active) : undefined}
            placeholder={t("shell.scope.filter")}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            onKeyDown={onKeyDown}
            className="h-8 w-full rounded-md border border-input bg-background ps-8 pe-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
        </div>
        <p role="status" className={cn("px-4 py-4 text-center text-sm text-muted-foreground", options.length > 0 && "sr-only")}>
          {options.length === 0 ? t("shell.scope.none", { query: query.trim() }) : null}
        </p>
        <div id={listId} role="listbox" aria-label={t("shell.scope.label")} className={cn("max-h-80 overflow-y-auto p-1", options.length === 0 && "hidden")}>
          {sections.map(({ key, title, icon: Icon }) => {
            const items = options.map((o, i) => ({ o, i })).filter(({ o }) => o.section === key);
            if (!items.length) return null;
            const headingId = `${listId}-${key}`;
            return (
              <div key={key} role="group" aria-labelledby={headingId}>
                <div id={headingId} className="flex h-8 items-center gap-1 px-2 text-xs font-medium text-muted-foreground">
                  {Icon && <Icon className="size-3" aria-hidden />}
                  {title}
                </div>
                {items.map(({ o, i }) => {
                  const selected = o.id === currentId;
                  return (
                    <div
                      key={`${key}-${o.id}`}
                      id={optionId(i)}
                      role="option"
                      aria-selected={selected}
                      data-active={i === active || undefined}
                      onMouseMove={() => setActive(i)}
                      onClick={() => select(o.scope)}
                      className={cn(
                        "flex min-h-10 cursor-default items-center gap-2 rounded-sm px-2 py-1 text-sm",
                        i === active && "bg-accent text-accent-foreground",
                      )}
                    >
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className={cn("truncate", selected && "font-medium")}>{o.scope.tenant}</span>
                        <span className="truncate text-xs text-muted-foreground">{groupName(o.scope)}</span>
                      </span>
                      <CheckIcon className={cn("size-4 shrink-0 text-primary", !selected && "invisible")} aria-hidden />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

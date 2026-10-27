import { useId, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { CheckIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, CloudIcon, MinusIcon, PlusIcon, SearchIcon, XIcon } from "lucide-react";
import { useT } from "@/i18n/useT";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { leaves, type FilterDef, type FilterState, type FilterValue, type Operator } from "./data";
import { Highlight, IconPlaceholder } from "./parts";

const OPERATORS: Operator[] = ["eq", "neq"];

type Row = { value: FilterValue; parent: boolean; child: boolean; state: "on" | "off" | "mixed"; open: boolean };

/**
 * Filter dropdown (canvas "Findings page", 5a/5b). One component for every filter; what it shows
 * comes from its spreadsheet row (`FilterDef`): operator, single/multi select, two-level tree with
 * parent icons, search across both levels, All/Selected tabs, "Create" from search, Select all /
 * Unselect all, or a From/To calendar. On-demand filters (`onRemove`) get the primary outline and
 * a remove button. Clear (×) is `--foreground` on static filters and `--link` on on-demand ones, like remove (D-064). The popover is a Radix Popover, so it
 * flips and shifts to stay on screen when the filter row wraps.
 */
export function FilterDropdown({
  def,
  value,
  onChange,
  onRemove,
  defaultOpen = false,
  field,
}: {
  def: FilterDef;
  value: FilterState;
  onChange: (next: FilterState) => void;
  onRemove?: () => void;
  defaultOpen?: boolean;
  /**
   * Form-field mode (report configuration, D-072): a full-width trigger under a visible label,
   * with a placeholder, `aria-invalid` and the field error linked by `aria-describedby`. No operator. A required
   * single select can't be cleared, so it always keeps a value once picked.
   */
  field?: { id: string; label: string; placeholder: string; required?: boolean; clearable?: boolean; invalid?: boolean; describedBy?: string };
}) {
  const t = useT();
  const intl = useIntl();
  const [open, setOpen] = useState(defaultOpen);
  const [tab, setTab] = useState<"all" | "selected">("all");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const listId = useId();

  const label = field?.label ?? t(`findings.filter.${def.id}`);
  const ariaName = field?.required ? t("forms.requiredLabel", { label }) : label;
  const nameOf = (v: FilterValue) => (v.labelKey ? t(v.labelKey) : (v.label ?? v.id));
  const all = useMemo(() => leaves(def, value.custom), [def, value.custom]);
  const selected = all.filter((l) => value.selected.includes(l.id));
  const dynamic = !!onRemove;

  // Trigger summary: label, operator, first value, +N.
  let first = "";
  if (def.kind === "date") first = rangeText(intl, value.from, value.to, t);
  else if (selected[0]) first = nameOf(selected[0]);
  const more = def.kind === "date" ? 0 : Math.max(0, selected.length - 1);
  const has = !!first;
  // Form fields have no operator (D-072): a report field always means "equals".
  const hasOps = !!def.ops && !field;
  const opSymbol = hasOps && has ? t(`findings.op.${value.op}.symbol`) : "";
  const triggerLabel = has
    ? field
      ? t("forms.ariaValue", { label: ariaName, value: first, more })
      : t("findings.filter.aria", { label: ariaName, op: def.ops ? value.op : "none", value: first, more })
    : field
      ? t("forms.ariaEmpty", { label: ariaName, placeholder: field.placeholder })
      : t("findings.filter.ariaEmpty", { label });
  const clearable = has && (field ? (field.clearable ?? !(field.required && !def.multi)) : true);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) { setTab("all"); setQuery(""); }
  };

  const q = query.trim().toLocaleLowerCase();
  const hit = (s: string) => !q || s.toLocaleLowerCase().includes(q);
  const selTab = !!def.tabs && tab === "selected";
  const values: FilterValue[] = [...(def.values ?? []), ...value.custom.map((c) => ({ id: c, label: c }))];

  const rows: Row[] = [];
  values.forEach((v) => {
    if (v.children) {
      const parentHit = !!q && hit(nameOf(v));
      let kids = v.children;
      if (selTab) kids = kids.filter((c) => value.selected.includes(c.id));
      if (q && !parentHit) kids = kids.filter((c) => hit(nameOf(c)));
      if ((selTab || (q && !parentHit)) && !kids.length) return;
      const n = v.children.filter((c) => value.selected.includes(c.id)).length;
      const state = n === 0 ? "off" : n === v.children.length ? "on" : "mixed";
      const isOpen = !!(expanded[v.id] || q || selTab);
      rows.push({ value: v, parent: true, child: false, state, open: isOpen });
      if (isOpen) kids.forEach((c) => rows.push({ value: c, parent: false, child: true, state: value.selected.includes(c.id) ? "on" : "off", open: false }));
    } else {
      if (selTab && !value.selected.includes(v.id)) return;
      if (!hit(nameOf(v))) return;
      rows.push({ value: v, parent: false, child: false, state: value.selected.includes(v.id) ? "on" : "off", open: false });
    }
  });

  const pick = (row: Row) => {
    const on = row.state === "on";
    if (!def.multi) {
      if (on && (field?.required || field?.clearable === false)) { setOpen(false); return; }
      onChange({ ...value, selected: on ? [] : [row.value.id] });
      if (!on && !def.tabs) setOpen(false);
      return;
    }
    if (row.parent) {
      const ids = row.value.children!.map((c) => c.id);
      onChange({ ...value, selected: on ? value.selected.filter((x) => !ids.includes(x)) : [...value.selected, ...ids.filter((x) => !value.selected.includes(x))] });
    } else {
      onChange({ ...value, selected: on ? value.selected.filter((x) => x !== row.value.id) : [...value.selected, row.value.id] });
    }
  };

  // Footer link: Select all / Unselect all for what's in view (spreadsheet decides which exist).
  let link: { label: string; act: () => void } | null = null;
  if (def.kind === "list") {
    if (def.multi && !selTab) {
      const target = all.filter((l) => hit(nameOf(l)) || (l.parent && hit(nameOf(l.parent)))).map((l) => l.id);
      if (target.length) {
        const allOn = target.every((x) => value.selected.includes(x));
        link = allOn
          ? { label: t("findings.filter.unselectAll"), act: () => onChange({ ...value, selected: value.selected.filter((x) => !target.includes(x)) }) }
          : { label: t("findings.filter.selectAll"), act: () => onChange({ ...value, selected: [...value.selected, ...target.filter((x) => !value.selected.includes(x))] }) };
      }
    } else if (selected.length) {
      link = { label: t("findings.filter.unselectAll"), act: () => onChange({ ...value, selected: [] }) };
    }
    if (link?.label === t("findings.filter.selectAll") && !def.selectAll) link = null;
    if (link?.label === t("findings.filter.unselectAll") && !def.unselectAll) link = null;
  }

  const showCreate = !!def.create && !!q && !all.some((l) => nameOf(l).toLocaleLowerCase() === q);
  const create = () => {
    const v = query.trim();
    onChange({ ...value, custom: [...value.custom, v], selected: def.multi ? [...value.selected, v] : [v] });
    setQuery("");
  };

  const textTone = dynamic ? "text-link" : "text-muted-foreground";

  const clearButton = clearable && (
    <button
      type="button"
      data-slot="filter-clear"
      aria-label={t("findings.filter.clear", { label })}
      onClick={() => onChange({ ...value, selected: [], from: undefined, to: undefined })}
      className={cn(
        "me-1 grid size-6 shrink-0 place-items-center rounded-sm outline-none",
        !field && "focus-visible:outline-2 focus-visible:outline-ring",
        dynamic ? "text-link hover:bg-info-muted" : "text-foreground hover:bg-accent",
      )}
    >
      <XIcon className="size-4" aria-hidden />
    </button>
  );

  const anchor = field ? (
    <div
      data-slot="filter-field"
      data-filter={def.id}
      className={cn(
        // One outer ring around the whole field, on focus and while open (D-073); inner buttons draw none.
        "flex h-8 w-full min-w-0 items-center rounded-md border bg-background focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring has-[[data-state=open]]:outline-2 has-[[data-state=open]]:outline-offset-2 has-[[data-state=open]]:outline-ring",
        field.invalid ? "border-error-border" : "border-input",
      )}
    >
      <PopoverTrigger asChild>
        <button
          id={field.id}
          type="button"
          aria-label={triggerLabel}
          aria-invalid={field.invalid || undefined}
          aria-describedby={field.describedBy}
          className="flex h-full min-w-0 flex-1 items-center gap-1 rounded-md ps-3 pe-2 text-start text-sm outline-none hover:bg-accent"
        >
          {opSymbol && <span className="shrink-0 font-medium text-muted-foreground">{opSymbol}</span>}
          {has && def.iconParent && <IconPlaceholder icon={CloudIcon} />}
          {has ? (
            <span className={cn("min-w-0 truncate", def.multi && "font-semibold")}>{first}</span>
          ) : (
            <span className="min-w-0 truncate text-muted-foreground">{field.placeholder}</span>
          )}
          {more > 0 && (
            <span className="inline-flex h-5 shrink-0 items-center rounded-sm bg-muted px-1 text-xs font-medium text-foreground">
              {t("findings.filter.more", { count: more })}
            </span>
          )}
          <ChevronDownIcon className={cn("ms-auto size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden />
        </button>
      </PopoverTrigger>
      {clearButton}
    </div>
  ) : null;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor asChild>
        {anchor ?? <div
          data-slot="filter"
          data-filter={def.id}
          className={cn("inline-flex h-8 min-w-0 max-w-90 items-center rounded-md border bg-background", dynamic ? "border-primary" : "border-control-border")}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={triggerLabel}
              className="flex h-full min-w-0 items-center gap-1 rounded-md ps-3 pe-2 text-sm outline-none hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
            >
              <span className={cn("shrink-0", textTone)}>{label}</span>
              {opSymbol && <span className={cn("shrink-0 font-medium", textTone)}>{opSymbol}</span>}
              {has && def.iconParent && <IconPlaceholder icon={CloudIcon} className={dynamic ? "text-link" : undefined} />}
              {has && <span className={cn("min-w-0 truncate font-semibold", dynamic && "text-link")}>{first}</span>}
              {more > 0 && (
                <span className={cn("inline-flex h-5 shrink-0 items-center rounded-sm px-1 text-xs font-medium", dynamic ? "bg-info-muted text-link" : "bg-muted text-foreground")}>
                  {t("findings.filter.more", { count: more })}
                </span>
              )}
              <ChevronDownIcon className={cn("size-4 shrink-0", textTone)} aria-hidden />
            </button>
          </PopoverTrigger>
          {clearButton}
          {onRemove && (
            <button
              type="button"
              data-slot="filter-remove"
              aria-label={t("findings.filter.remove", { label })}
              onClick={onRemove}
              className="grid h-full w-8 shrink-0 place-items-center rounded-e-md border-s border-primary text-link outline-none hover:bg-info-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
            >
              <MinusIcon className="size-4" aria-hidden />
            </button>
          )}
        </div>}
      </PopoverAnchor>
      <PopoverContent
        align="start"
        collisionPadding={16}
        className={cn("flex flex-col gap-2 rounded-xl p-2", field ? "w-(--radix-popover-trigger-width) min-w-80" : "w-80")}
        aria-label={field ? label : t("findings.filter.dialog", { label })}
      >
        {hasOps && (
          <>
            <Select value={value.op} onValueChange={(op) => onChange({ ...value, op: op as Operator })}>
              <SelectTrigger aria-label={t("findings.op.label")} className="w-full font-normal"><SelectValue /></SelectTrigger>
              <SelectContent>
                {OPERATORS.map((op) => <SelectItem key={op} value={op}>{t(`findings.op.${op}.option`)}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="h-px bg-border" />
          </>
        )}

        {def.kind === "date" ? (
          <DateRange from={value.from} to={value.to} onChange={(from, to) => onChange({ ...value, from, to })} />
        ) : (
          <>
            {def.tabs && (
              <ToggleGroup
                type="single"
                value={tab}
                onValueChange={(v) => v && setTab(v as "all" | "selected")}
                aria-label={t("findings.filter.show")}
                className="grid grid-cols-2 border-0 bg-muted"
              >
                <ToggleGroupItem value="all" className="h-7 w-auto gap-1 font-medium data-[state=on]:bg-background data-[state=on]:text-link">
                  {t("findings.filter.tabAll")}<span className="text-xs tabular-nums">{intl.formatNumber(all.length)}</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="selected" className="h-7 w-auto gap-1 font-medium data-[state=on]:bg-background data-[state=on]:text-link">
                  {t("findings.filter.tabSelected")}<span className="text-xs tabular-nums">{intl.formatNumber(selected.length)}</span>
                </ToggleGroupItem>
              </ToggleGroup>
            )}
            {def.search && (
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute start-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <input
                  type="text"
                  aria-label={t("findings.filter.search", { label })}
                  aria-controls={listId}
                  placeholder={t(def.create ? "findings.filter.searchOrCreate" : "findings.filter.searchPlaceholder")}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-8 w-full rounded-md border border-input bg-background ps-8 pe-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                />
              </div>
            )}
            {showCreate && (
              <button type="button" onClick={create} className="flex h-8 items-center gap-2 rounded-sm px-2 text-start outline-none hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
                <PlusIcon className="size-4 text-link" aria-hidden />
                <span className="min-w-0 truncate">
                  {intl.formatMessage({ id: "findings.filter.create" }, { value: query.trim(), b: (chunks) => <b className="font-semibold">{chunks}</b> })}
                </span>
              </button>
            )}
            <div id={listId} role={def.multi ? "group" : "radiogroup"} aria-label={t("findings.filter.values", { label })} className="flex max-h-62 flex-col gap-1 overflow-y-auto">
              {rows.map((row) => (
                <ValueRow
                  key={row.value.id}
                  row={row}
                  multi={!!def.multi}
                  icon={!!def.iconParent && row.parent}
                  name={nameOf(row.value)}
                  query={q}
                  tick={row.state === "on" && (!!def.multi || !!def.tabs)}
                  onPick={() => pick(row)}
                  onToggle={() => setExpanded((e) => ({ ...e, [row.value.id]: !e[row.value.id] }))}
                />
              ))}
            </div>
            {rows.length === 0 && !showCreate && (
              <p role="status" className="px-2 py-6 text-center text-muted-foreground">
                {selTab && !q ? t("findings.filter.noneSelected") : t("findings.filter.noMatch", { query: query.trim() })}
              </p>
            )}
            {link && <Button variant="link" size="sm" className="self-start px-1" onClick={link.act}>{link.label}</Button>}
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

function ValueRow({ row, multi, icon, name, query, tick, onPick, onToggle }: {
  row: Row; multi: boolean; icon: boolean; name: string; query: string; tick: boolean; onPick: () => void; onToggle: () => void;
}) {
  const t = useT();
  const on = row.state === "on";
  const id = useId();
  return (
    <div className={cn("flex items-center rounded-sm", row.child && "ps-6", on && "bg-info-muted")}>
      {row.parent && (
        <button
          type="button"
          aria-expanded={row.open}
          aria-label={t(row.open ? "findings.filter.collapse" : "findings.filter.expand", { name })}
          onClick={onToggle}
          className="grid size-6 shrink-0 place-items-center rounded-sm text-muted-foreground outline-none hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
        >
          <ChevronRightIcon className={cn("size-4 transition-transform rtl:-scale-x-100", row.open && "rotate-90 rtl:-rotate-90")} aria-hidden />
        </button>
      )}
      {multi ? (
        <div className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-sm px-2 hover:bg-accent">
          <Checkbox id={id} checked={row.state === "mixed" ? "indeterminate" : on} onCheckedChange={onPick} />
          {icon && <IconPlaceholder icon={CloudIcon} />}
          <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer truncate"><Highlight text={name} query={query} /></label>
          {tick && <CheckIcon className="size-4 shrink-0 text-link" aria-hidden />}
        </div>
      ) : (
        <button
          type="button"
          role="radio"
          aria-checked={on}
          onClick={onPick}
          className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-sm px-2 text-start outline-none hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
        >
          <span aria-hidden className={cn("grid size-4 shrink-0 place-items-center rounded-full border", on ? "border-primary" : "border-input")}>
            {on && <span className="size-2 rounded-full bg-primary" />}
          </span>
          <span className="min-w-0 flex-1 truncate"><Highlight text={name} query={query} /></span>
          {tick && <CheckIcon className="size-4 shrink-0 text-link" aria-hidden />}
        </button>
      )}
    </div>
  );
}

/* ---------- From/To calendar for date filters ---------- */

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (v: string) => { const [y, m, d] = v.split("-").map(Number); return new Date(y, m - 1, d); };

export function rangeText(intl: ReturnType<typeof useIntl>, from: string | undefined, to: string | undefined, t: ReturnType<typeof useT>) {
  if (!from) return "";
  const fmt = (v: string) => intl.formatDate(parse(v), { month: "short", day: "numeric" });
  return to ? intl.formatDateTimeRange(parse(from), parse(to), { month: "short", day: "numeric" }) : t("findings.date.fromOnly", { date: fmt(from) });
}

/** First click sets From, the second sets To; days after today are disabled. */
function DateRange({ from, to, onChange }: { from?: string; to?: string; onChange: (from?: string, to?: string) => void }) {
  const t = useT();
  const intl = useIntl();
  const today = iso(new Date());
  const [month, setMonth] = useState(() => { const d = from ? parse(from) : new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const lead = month.getDay();
  const atCurrent = iso(month) >= iso(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const weekdays = Array.from({ length: 7 }, (_, i) => intl.formatDate(new Date(2026, 1, 1 + i), { weekday: "narrow" }));
  const long = (v: string) => intl.formatDate(parse(v), { year: "numeric", month: "short", day: "numeric" });

  const pickDay = (v: string) => {
    if (!from || to) onChange(v, undefined);
    else if (v < from) onChange(v, undefined);
    else onChange(from, v);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        {([["from", from], ["to", to]] as const).map(([key, v]) => (
          <div key={key} className="flex min-w-0 flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">{t(`findings.date.${key}`)}</span>
            <span className={cn("flex h-8 items-center truncate rounded-md border border-input px-2", v ? "text-foreground" : "text-muted-foreground")}>
              {v ? long(v) : t(key === "from" ? "findings.date.startPlaceholder" : "findings.date.endPlaceholder")}
            </span>
          </div>
        ))}
      </div>
      <div className="h-px bg-border" />
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon-sm" aria-label={t("findings.date.prevMonth")} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
          <ChevronLeftIcon className="rtl:-scale-x-100" aria-hidden />
        </Button>
        <span className="font-semibold">{intl.formatDate(month, { month: "long", year: "numeric" })}</span>
        <Button variant="ghost" size="icon-sm" aria-label={t("findings.date.nextMonth")} disabled={atCurrent} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
          <ChevronRightIcon className="rtl:-scale-x-100" aria-hidden />
        </Button>
      </div>
      <div role="group" aria-label={intl.formatDate(month, { month: "long", year: "numeric" })} className="grid grid-cols-7 gap-y-1 text-center">
        {weekdays.map((w, i) => <span key={i} aria-hidden className="grid h-6 place-items-center text-xs text-muted-foreground">{w}</span>)}
        {Array.from({ length: lead }, (_, i) => <span key={`b${i}`} aria-hidden />)}
        {Array.from({ length: days }, (_, i) => {
          const v = iso(new Date(month.getFullYear(), month.getMonth(), i + 1));
          const edge = v === from || v === to;
          const inRange = !!(from && to && v > from && v < to);
          return (
            <button
              key={v}
              type="button"
              aria-label={intl.formatDate(parse(v), { dateStyle: "full" })}
              aria-pressed={edge}
              disabled={v > today}
              onClick={() => pickDay(v)}
              className={cn(
                "h-8 rounded-md tabular-nums outline-none hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50",
                inRange && "rounded-none bg-info-muted",
                v === today && !edge && "ring-1 ring-input ring-inset",
                edge && "bg-primary font-semibold text-primary-foreground hover:bg-primary",
              )}
            >
              {intl.formatNumber(i + 1)}
            </button>
          );
        })}
      </div>
      {from && <Button variant="link" size="sm" className="self-start px-1" onClick={() => onChange(undefined, undefined)}>{t("findings.date.clear")}</Button>}
    </div>
  );
}

import { useMemo, useRef, useState, type FormEvent } from "react";
import { useIntl } from "react-intl";
import { Link } from "react-router-dom";
import { ArrowLeftIcon, CalendarClockIcon, CircleCheckIcon, ExternalLinkIcon, InfoIcon, SendIcon } from "lucide-react";
import { useT } from "@/i18n/useT";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ErrorBanner } from "@/components/auth/parts";
import { FilterDropdown } from "@/components/findings/FilterDropdown";
import { FILTERS, emptyFilter, type FilterDef, type FilterState } from "@/components/findings/data";
import { EmailChipsInput, Field, StartDatePicker, isEmail, isoDate, parseIso } from "./parts";

export type ReportMode = "ondemand" | "scheduled";
type ScopeId = "accounts" | "findingsType" | "tags";
type SchedId = "freq" | "dow" | "dom" | "time" | "tz" | "ends";
export type ReportOpen = ScopeId | SchedId | "start";

export type ReportPreset = {
  mode?: ReportMode;
  /** "error": opens as if submitted with an empty name, a bad address and (scheduled) a past start date. */
  state?: "filled" | "error";
  open?: ReportOpen;
};

/** Report scope: the Findings page filters, as fixed form fields (D-068). Values are the Findings data. */
const SCOPE: { id: ScopeId; def: FilterDef; required: boolean }[] = [
  { id: "accounts", def: { ...FILTERS.provider, id: "accounts" }, required: true },
  { id: "findingsType", def: { ...FILTERS.findingSource, id: "findingsType" }, required: true },
  { id: "tags", def: { ...FILTERS.tags, id: "tags" }, required: false },
];

const TIMEZONES = [
  { id: "pt", offset: "UTC−08:00", abbr: "PT" }, { id: "et", offset: "UTC−05:00", abbr: "ET" },
  { id: "utc", offset: "UTC+00:00", abbr: "UTC" }, { id: "gmt", offset: "UTC+00:00", abbr: "GMT" },
  { id: "cet", offset: "UTC+01:00", abbr: "CET" }, { id: "gst", offset: "UTC+04:00", abbr: "GST" },
  { id: "ist", offset: "UTC+05:30", abbr: "IST" }, { id: "sgt", offset: "UTC+08:00", abbr: "SGT" },
  { id: "jst", offset: "UTC+09:00", abbr: "JST" }, { id: "aet", offset: "UTC+10:00", abbr: "AET" },
] as const;
const TIMES = Array.from({ length: 48 }, (_, i) => `${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`);
const ENDS = ["never", "3", "6", "12"];

const single = (id: string): FilterState => emptyFilter({ selected: [id] });
const firstOfNextMonth = () => { const d = new Date(); return isoDate(new Date(d.getFullYear(), d.getMonth() + 1, 1)); };
const DEFAULT_EMAILS = ["thomas.knoll@acme.com", "keith.mohammed@acme.com", "helina.jones@acme.com"];
const defaultScope = (): Record<ScopeId, FilterState> => ({
  accounts: emptyFilter({ selected: ["Org-Production", "Org-Product Development", "prod-analytics", "staging-core", "Contoso-Prod"] }),
  findingsType: emptyFilter({ selected: ["AccuKnox CSPM", "AWS Security Hub"] }),
  tags: emptyFilter({ selected: ["env:production"] }),
});
const defaultSched = (): Record<SchedId, FilterState> => ({
  freq: single("monthly"), dow: single("1"), dom: single("1"), time: single("09:00"), tz: single("ist"), ends: single("never"),
});
const emptyScope = (): Record<ScopeId, FilterState> => ({ accounts: emptyFilter(), findingsType: emptyFilter(), tags: emptyFilter() });
const emptySched = (): Record<SchedId, FilterState> => ({ freq: emptyFilter(), dow: emptyFilter(), dom: emptyFilter(), time: emptyFilter(), tz: emptyFilter(), ends: emptyFilter() });
type Snapshot = { name: string; desc: string; scope: Record<ScopeId, FilterState>; emails: string[]; sched: Record<SchedId, FilterState>; start: string };
const yesterday = () => { const d = new Date(); return isoDate(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1)); };

/**
 * Report configuration form (canvas "Report configuration"): report type, then one section of
 * fields, then the preview column. Validation runs on submit and then live, so each error clears
 * as soon as its field is fixed (login flow, D-067).
 */
export function ReportForm({ preset = {} }: { preset?: ReportPreset }) {
  const t = useT();
  const intl = useIntl();
  const error = preset.state === "error";

  const [mode, setMode] = useState<ReportMode>(preset.mode ?? "ondemand");
  const [submitted, setSubmitted] = useState(error);
  const [done, setDone] = useState(false);
  const [name, setName] = useState(error ? "" : "Cloud misconfiguration report");
  const [desc, setDesc] = useState("Open critical and high misconfigurations in production accounts.");
  const [scope, setScope] = useState(defaultScope);
  const [emails, setEmails] = useState(error ? DEFAULT_EMAILS.map((e) => e.replace("@acme.com", e.startsWith("keith") ? "@acme" : "@acme.com")) : DEFAULT_EMAILS);
  const [sched, setSched] = useState(defaultSched);
  const [start, setStart] = useState(error ? yesterday() : firstOfNextMonth());
  /** What Reset cleared, so the confirmation can offer Undo (reversible action, D-069). */
  const [cleared, setCleared] = useState<Snapshot | null>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  const touched = <T,>(fn: (v: T) => void) => (v: T) => { setDone(false); setCleared(null); fn(v); };
  const isOD = mode === "ondemand";
  const today = isoDate(new Date());
  const sel = (id: SchedId) => sched[id].selected[0];

  // Schedule dropdowns: single select, like the Findings single-select filters. Labels come from messages.
  const schedDefs = useMemo(() => {
    const def = (id: SchedId, values: { id: string; label: string }[], search = false): FilterDef =>
      ({ id, kind: "list", multi: false, search, values });
    return {
      freq: def("freq", ["daily", "weekly", "monthly"].map((v) => ({ id: v, label: t(`reports.freq.${v}`) }))),
      dow: def("dow", [1, 2, 3, 4, 5, 6, 0].map((d) => ({ id: String(d), label: intl.formatDate(new Date(2026, 1, 1 + d), { weekday: "long" }) }))),
      dom: def("dom", [...Array.from({ length: 28 }, (_, i) => ({ id: String(i + 1), label: t("reports.dom.day", { day: i + 1 }) })), { id: "last", label: t("reports.dom.last") }]),
      time: def("time", TIMES.map((v) => ({ id: v, label: v })), true),
      tz: def("tz", TIMEZONES.map((z) => ({ id: z.id, label: t("reports.tz.option", { name: t(`reports.tz.${z.id}`), offset: z.offset }) })), true),
      ends: def("ends", ENDS.map((v) => ({ id: v, label: v === "never" ? t("reports.ends.never") : t("reports.ends.after", { count: Number(v) }) }))),
    } satisfies Record<SchedId, FilterDef>;
  }, [t, intl]);

  // First send, the period it covers and the cadence sentence.
  const summary = useMemo(() => {
    const freq = sel("freq");
    const needsDay = freq === "weekly" ? "dow" : freq === "monthly" ? "dom" : null;
    if (!start || !freq || !sel("time") || !sel("tz") || (needsDay && !sel(needsDay))) return null;
    const s = parseIso(start);
    let first = new Date(s);
    let from: Date;
    let cadence: string;
    if (freq === "weekly") {
      const dow = Number(sel("dow"));
      while (first.getDay() !== dow) first.setDate(first.getDate() + 1);
      from = new Date(first); from.setDate(from.getDate() - 7);
      cadence = t("reports.summary.weekly", { weekday: intl.formatDate(first, { weekday: "long" }) });
    } else if (freq === "monthly") {
      const dom = sel("dom");
      const dayIn = (y: number, m: number) => (dom === "last" ? new Date(y, m + 1, 0).getDate() : Number(dom));
      first = new Date(s.getFullYear(), s.getMonth(), dayIn(s.getFullYear(), s.getMonth()));
      if (first < s) first = new Date(s.getFullYear(), s.getMonth() + 1, dayIn(s.getFullYear(), s.getMonth() + 1));
      // Covers the previous calendar month when sent on the 1st or the last day; otherwise the month up to the day before.
      from = dom === "last" ? new Date(first.getFullYear(), first.getMonth(), 1) : new Date(first.getFullYear(), first.getMonth() - 1, first.getDate());
      cadence = dom === "last" ? t("reports.summary.monthlyLast") : t("reports.summary.monthly", { day: t("reports.dom.day", { day: Number(dom) }) });
    } else {
      from = new Date(first); from.setDate(from.getDate() - 1);
      cadence = t("reports.summary.daily");
    }
    const to = new Date(first); to.setDate(to.getDate() - (sel("dom") === "last" && freq === "monthly" ? 0 : 1));
    const tz = TIMEZONES.find((z) => z.id === sel("tz"))?.abbr ?? "";
    const date = intl.formatDate(first, { weekday: "long", day: "numeric", month: "short", year: "numeric" });
    const range = freq === "daily"
      ? intl.formatDate(from, { day: "numeric", month: "short", year: "numeric" })
      : intl.formatDateTimeRange(from, to, { day: "numeric", month: "short", year: "numeric" });
    const ends = !sel("ends") || sel("ends") === "never" ? "" : ` ${t("reports.summary.ends", { count: Number(sel("ends")) })}`;
    return {
      title: t("reports.summary.title", { date, time: sel("time"), tz }),
      text: `${t("reports.summary.covers", { range })} ${cadence}${ends}`,
      date, tz,
    };
  }, [start, sched, t, intl]); // `sel` reads `sched`.

  // Validation: what is wrong right now, shown only after the first submit.
  const badEmail = emails.find((e) => !isEmail(e));
  const problems = {
    name: !name.trim(),
    accounts: scope.accounts.selected.length === 0,
    findingsType: scope.findingsType.selected.length === 0,
    recipients: emails.length === 0 || !!badEmail,
    freq: !isOD && !sel("freq"),
    day: !isOD && ((sel("freq") === "weekly" && !sel("dow")) || (sel("freq") === "monthly" && !sel("dom"))),
    start: !isOD && (!start || start < today),
    time: !isOD && !sel("time"),
    tz: !isOD && !sel("tz"),
  };
  const dayId = sel("freq") === "weekly" ? "f-dow" : "f-dom";
  const ids: Record<keyof typeof problems, string> = { name: "f-name", accounts: "f-accounts", findingsType: "f-findingsType", recipients: "f-email", freq: "f-freq", day: dayId, start: "f-start", time: "f-time", tz: "f-tz" };
  const show = (k: keyof typeof problems) => submitted && problems[k];
  const errorItems = ([
    ["name", "f-name", t("reports.errors.name")],
    ["accounts", "f-accounts", t("reports.errors.accounts")],
    ["findingsType", "f-findingsType", t("reports.errors.findingsType")],
    ["recipients", "f-email", t(emails.length === 0 ? "reports.errors.recipientsNone" : "reports.errors.recipientsInvalid")],
    ["freq", "f-freq", t("reports.errors.freq")],
    ["day", dayId, t("reports.errors.day")],
    ["start", "f-start", t(start ? "reports.errors.start" : "reports.errors.startEmpty")],
    ["time", "f-time", t("reports.errors.time")],
    ["tz", "f-tz", t("reports.errors.tz")],
  ] as const).filter(([k]) => show(k));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const failing = (Object.keys(problems) as (keyof typeof problems)[]).filter((k) => problems[k]);
    if (!failing.length) { setSubmitted(false); setDone(true); return; }
    setSubmitted(true);
    setDone(false);
    setCleared(null);
    // Several errors: focus the banner that lists them. One: focus that field.
    // After React renders the banner and messages (a timeout, not rAF: rAF pauses in background tabs).
    setTimeout(() => {
      if (failing.length > 1) bannerRef.current?.focus();
      else document.getElementById(ids[failing[0]])?.focus();
    }, 0);
  };

  const tzAbbr = summary?.tz ?? "";

  /** Empties every field (placeholders show) and clears errors; keeps the report type. Undo puts the values back. */
  const reset = () => {
    setCleared({ name, desc, scope, emails, sched, start });
    setSubmitted(false);
    setDone(false);
    setName("");
    setDesc("");
    setScope(emptyScope());
    setEmails([]);
    setSched(emptySched());
    setStart("");
  };
  const undoReset = () => {
    if (!cleared) return;
    setName(cleared.name);
    setDesc(cleared.desc);
    setScope(cleared.scope);
    setEmails(cleared.emails);
    setSched(cleared.sched);
    setStart(cleared.start);
    setCleared(null);
  };

  return (
    // Left 7 of 12: title + form, with the page padding. Right 5: a tinted panel that fills the column.
    <div className="grid flex-1 grid-cols-12">
      <div className="col-span-7 flex min-w-0 flex-col gap-4 px-6 pt-3 pb-6 max-lg:col-span-12">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon" aria-label={t("reports.back")}>
          <Link to="/reports"><ArrowLeftIcon className="size-5 rtl:-scale-x-100" aria-hidden /></Link>
        </Button>
        <h1 className="text-2xl font-semibold">{t("reports.template.cspm")}</h1>
      </div>

      <form noValidate onSubmit={onSubmit} aria-label={t("reports.template.cspm")} className="flex min-w-0 flex-col gap-4">
        {errorItems.length > 1 && (
          <div ref={bannerRef} tabIndex={-1} className="rounded-md outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
            <ErrorBanner title={t(isOD ? "reports.errors.titleSend" : "reports.errors.titleSave")}>
              {t("reports.errors.body", { count: errorItems.length })}
              <ul className="mt-1 list-disc ps-4">
                {errorItems.map(([k, id, text]) => (
                  <li key={k}>
                    {/* 24px tall so a long list of stacked links still meets the target size (WCAG 2.5.8). */}
                    <a href={`#${id}`} className="inline-flex min-h-6 items-center text-foreground underline underline-offset-4 hover:no-underline">{text}</a>
                  </li>
                ))}
              </ul>
            </ErrorBanner>
          </div>
        )}
        {done && (
          <Alert role="status">
            <CircleCheckIcon className="text-success-foreground" aria-hidden />
            <AlertDescription>
              {isOD
                ? t("reports.done.sent", { count: emails.length })
                : t("reports.done.saved", { date: summary?.date ?? "", time: sel("time"), tz: tzAbbr })}
            </AlertDescription>
          </Alert>
        )}
        {cleared && (
          <Alert role="status">
            <InfoIcon className="text-info-foreground" aria-hidden />
            <AlertDescription className="flex flex-wrap items-center gap-x-2">
              {t("reports.reset.done")}
              <Button type="button" variant="link" size="sm" className="h-auto" onClick={undoReset}>{t("reports.reset.undo")}</Button>
            </AlertDescription>
          </Alert>
        )}

        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(v) => v && touched(setMode)(v as ReportMode)}
          aria-label={t("reports.type.label")}
          className="w-fit gap-1 border-0 bg-muted"
        >
          {(["ondemand", "scheduled"] as const).map((m) => (
            <ToggleGroupItem key={m} value={m} className="h-6 w-auto px-3 text-xs font-medium data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-1">
              {t(`reports.type.${m}`)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        {/* Fields are 3 of the page's 12 columns; wide fields 6. Compact rows: 12px between fields (D-069). */}
        <div className="grid grid-cols-7 gap-x-6 gap-y-3 max-sm:grid-cols-1">
          <Field label={t("reports.name.label")} htmlFor="f-name" required error={show("name") && t("reports.name.error")} errorId="f-name-err" className="col-span-6 max-sm:col-span-1">
            <Input
              id="f-name"
              dir="auto"
              required
              aria-invalid={show("name") || undefined}
              aria-describedby={show("name") ? "f-name-err" : undefined}
              placeholder={t("reports.name.placeholder")}
              value={name}
              onChange={(e) => touched(setName)(e.target.value)}
            />
          </Field>
          <Field label={t("reports.desc.label")} htmlFor="f-desc" className="col-span-6 max-sm:col-span-1">
            <textarea
              id="f-desc"
              dir="auto"
              rows={2}
              placeholder={t("reports.desc.placeholder")}
              value={desc}
              onChange={(e) => touched(setDesc)(e.target.value)}
              className="min-h-16 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:outline-2 focus:outline-offset-2 focus:outline-ring"
            />
          </Field>

          {SCOPE.map(({ id, def, required }) => {
            const invalid = (id === "accounts" || id === "findingsType") && show(id);
            return (
              <Field key={id} label={t(`reports.${id}.label`)} htmlFor={`f-${id}`} required={required} error={invalid && t(`reports.${id}.error`)} errorId={`f-${id}-err`} className="col-span-3 max-sm:col-span-1">
                <FilterDropdown
                  def={def}
                  value={scope[id]}
                  onChange={(v) => touched(setScope)({ ...scope, [id]: v })}
                  defaultOpen={preset.open === id}
                  field={{ id: `f-${id}`, label: t(`reports.${id}.label`), placeholder: t(`reports.${id}.placeholder`), required, invalid, describedBy: invalid ? `f-${id}-err` : undefined }}
                />
              </Field>
            );
          })}

          <Field
            label={t("reports.recipients.label")}
            htmlFor="f-email"
            required
            error={show("recipients") && (emails.length === 0 ? t("reports.recipients.errorNone") : t("reports.recipients.errorInvalid", { email: badEmail! }))}
            errorId="f-email-err"
            help={t("reports.recipients.help")}
            helpId="f-email-help"
            className="col-span-6 max-sm:col-span-1"
          >
            <EmailChipsInput
              id="f-email"
              emails={emails}
              onChange={touched(setEmails)}
              showInvalid={submitted}
              invalid={show("recipients")}
              describedBy={show("recipients") ? "f-email-err f-email-help" : "f-email-help"}
            />
          </Field>

          {!isOD && (
            <>
              {(["freq", ...(sel("freq") === "weekly" ? ["dow"] : sel("freq") === "monthly" ? ["dom"] : [])] as SchedId[]).map((id) => (
                <SchedField key={id} id={id} def={schedDefs[id]} value={sched[id]} onChange={(v) => touched(setSched)({ ...sched, [id]: v })} open={preset.open === id} invalid={show(id === "freq" ? "freq" : "day")} />
              ))}
              <Field
                label={t("reports.start.label")}
                htmlFor="f-start"
                required
                error={show("start") && (start ? t("reports.start.error", { date: intl.formatDate(parseIso(start), { day: "numeric", month: "short", year: "numeric" }) }) : t("reports.start.errorEmpty"))}
                errorId="f-start-err"
                className="col-span-3 max-sm:col-span-1"
              >
                <StartDatePicker id="f-start" value={start} placeholder={t("reports.start.placeholder")} onChange={touched(setStart)} invalid={show("start")} describedBy={show("start") ? "f-start-err" : undefined} defaultOpen={preset.open === "start"} />
              </Field>
              {(["time", "tz", "ends"] as SchedId[]).map((id) => (
                <SchedField key={id} id={id} def={schedDefs[id]} value={sched[id]} onChange={(v) => touched(setSched)({ ...sched, [id]: v })} open={preset.open === id} required={id !== "ends"} invalid={id !== "ends" && show(id as "time" | "tz")} />
              ))}
              {summary && !show("start") && (
                <div role="status" className="col-span-6 flex gap-3 rounded-md bg-info-muted px-4 py-3 max-sm:col-span-1">
                  <span className="flex h-5 shrink-0 items-center"><CalendarClockIcon className="size-4 text-info-foreground" aria-hidden /></span>
                  <div className="flex flex-col gap-1">
                    <p className="font-medium">{summary.title}</p>
                    <p className="text-xs text-muted-foreground">{summary.text}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <Button type="submit">
            {isOD && <SendIcon aria-hidden />}
            {t(isOD ? "reports.submit.send" : "reports.submit.save")}
          </Button>
          <Button asChild variant="outline"><Link to="/reports">{t("reports.cancel")}</Link></Button>
          <Button type="button" variant="link" onClick={reset}>{t("reports.reset")}</Button>
          <span className="ms-auto text-xs text-muted-foreground">{t(isOD ? "reports.foot.ondemand" : "reports.foot.scheduled")}</span>
        </div>
      </form>
      </div>

      <ReportPreview />
    </div>
  );
}

function SchedField({ id, def, value, onChange, open, required = true, invalid = false }: { id: SchedId; def: FilterDef; value: FilterState; onChange: (v: FilterState) => void; open: boolean; required?: boolean; invalid?: boolean }) {
  const t = useT();
  const day = id === "dow" || id === "dom";
  const label = t(`reports.${id}.label`);
  const placeholder = t(day ? "reports.day.placeholder" : `reports.${id}.placeholder`);
  const errorId = `f-${id}-err`;
  return (
    <Field label={label} htmlFor={`f-${id}`} required={required} error={invalid && t(day ? "reports.day.error" : `reports.${id}.error`)} errorId={errorId} className="col-span-3 max-sm:col-span-1">
      {/* No × on schedule fields: once picked they keep a value; Reset is the way to empty them. */}
      <FilterDropdown def={def} value={value} onChange={onChange} defaultOpen={open} field={{ id: `f-${id}`, label, placeholder, required, clearable: false, invalid, describedBy: invalid ? errorId : undefined }} />
    </Field>
  );
}

/** Preview column: first page of the report (placeholder until the renderer exists) and a link to the full preview. */
function ReportPreview() {
  const t = useT();
  return (
    <aside aria-labelledby="rp-title" className="col-span-5 min-w-0 border-s border-border bg-muted p-6 max-lg:col-span-12 max-lg:border-s-0 max-lg:border-t">
      <section className="sticky top-6 mx-auto flex w-full max-w-100 flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 id="rp-title" className="text-base font-semibold">{t("reports.preview.title")}</h2>
            <p className="text-xs text-muted-foreground">{t("reports.preview.meta", { minutes: 4 })}</p>
          </div>
          <a href="#report-preview" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-sm font-medium text-link underline underline-offset-4 outline-none hover:no-underline focus-visible:outline-2 focus-visible:outline-ring">
            {t("reports.preview.open")}
            <span className="sr-only">{t("reports.preview.newTab")}</span>
            <ExternalLinkIcon className="size-4" aria-hidden />
          </a>
        </div>
        <a href="#report-preview" target="_blank" rel="noopener noreferrer" className="block rounded-md outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          <img src="/reports/cspm-preview.png" alt={t("reports.preview.alt")} className="block h-auto w-full rounded-md ring-1 ring-border" />
        </a>
      </section>
    </aside>
  );
}

import { useState, type KeyboardEvent, type ReactNode } from "react";
import { useIntl } from "react-intl";
import { CalendarIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";
import { useT } from "@/i18n/useT";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FieldError } from "@/components/auth/parts";

/** Red asterisk after a required label (D-067). Decorative: the control itself carries `required`. */
export function RequiredMark() {
  return <span aria-hidden className="ms-1 text-error-foreground">*</span>;
}

/**
 * Label, control, then the field error (login-flow `FieldError`) and optional help, stacked with
 * 4px gaps. The error id is passed to the control's `aria-describedby` by the caller.
 */
export function Field({ label, htmlFor, required, error, errorId, help, helpId, className, children }: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: ReactNode;
  errorId?: string;
  help?: ReactNode;
  helpId?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <Label htmlFor={htmlFor}>{label}{required && <RequiredMark />}</Label>
      {children}
      {error && errorId && <FieldError id={errorId}>{error}</FieldError>}
      {help && <p id={helpId} className="text-xs text-muted-foreground">{help}</p>}
    </div>
  );
}

export const isEmail = (v: string) => /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(v);
const MAX_RECIPIENTS = 20;

/**
 * Recipient chips + a free-text input. Enter, comma or leaving the field adds the typed address;
 * Backspace on an empty input removes the last chip. Invalid addresses are flagged only after
 * submit (`showInvalid`), like the login flow.
 */
export function EmailChipsInput({ id, emails, onChange, showInvalid, invalid, describedBy }: {
  id: string;
  emails: string[];
  onChange: (next: string[]) => void;
  showInvalid: boolean;
  invalid: boolean;
  describedBy?: string;
}) {
  const t = useT();
  const [draft, setDraft] = useState("");
  const add = (raw: string) => {
    const v = raw.trim().replace(/,$/, "").trim();
    if (v && !emails.includes(v) && emails.length < MAX_RECIPIENTS) onChange([...emails, v]);
    setDraft("");
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(draft); }
    else if (e.key === "Backspace" && !draft && emails.length) onChange(emails.slice(0, -1));
  };
  return (
    <div
      data-slot="email-chips"
      className={cn(
        "flex min-h-18 flex-wrap content-start items-center gap-1 rounded-md border bg-background p-1 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring",
        invalid ? "border-error-border" : "border-input",
      )}
    >
      <ul aria-label={t("reports.recipients.added")} className="contents">
        {emails.map((email) => {
          const bad = showInvalid && !isEmail(email);
          return (
            <li
              key={email}
              className={cn("inline-flex h-7 items-center gap-1 rounded-sm ps-2 pe-1 text-xs", bad ? "bg-error-muted text-error-foreground ring-1 ring-error-border ring-inset" : "bg-muted text-foreground")}
            >
              <bdi>{email}</bdi>
              <button
                type="button"
                aria-label={t("reports.recipients.remove", { email })}
                onClick={() => onChange(emails.filter((x) => x !== email))}
                className="grid size-6 place-items-center rounded-sm outline-none hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
              >
                <XIcon className="size-3" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
      <input
        id={id}
        type="email"
        inputMode="email"
        autoComplete="off"
        required={emails.length === 0}
        aria-required
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        placeholder={t("reports.recipients.placeholder")}
        value={draft}
        onChange={(e) => (e.target.value.endsWith(",") ? add(e.target.value) : setDraft(e.target.value))}
        onKeyDown={onKeyDown}
        onBlur={() => draft.trim() && add(draft)}
        className="h-7 min-w-30 flex-1 bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");
export const isoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseIso = (v: string) => { const [y, m, d] = v.split("-").map(Number); return new Date(y, m - 1, d); };

/** Single date picker for the schedule start: days before today are disabled. */
export function StartDatePicker({ id, value, placeholder, onChange, invalid, describedBy, defaultOpen = false }: {
  id: string;
  /** ISO date, or "" when empty (shows the placeholder). */
  value: string;
  placeholder: string;
  onChange: (iso: string) => void;
  invalid: boolean;
  describedBy?: string;
  defaultOpen?: boolean;
}) {
  const t = useT();
  const intl = useIntl();
  const [open, setOpen] = useState(defaultOpen);
  const today = isoDate(new Date());
  const monthOf = (v: string) => { const d = v ? parseIso(v) : new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); };
  const [month, setMonth] = useState(() => monthOf(value));
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const lead = month.getDay();
  const atCurrent = isoDate(month) <= isoDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const weekdays = Array.from({ length: 7 }, (_, i) => intl.formatDate(new Date(2026, 1, 1 + i), { weekday: "narrow" }));
  const monthLabel = intl.formatDate(month, { month: "long", year: "numeric" });

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setMonth(monthOf(value));
      }}
    >
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={cn(
            // Same outer ring as every field: on focus and while the calendar is open (D-069).
            "flex h-8 w-full min-w-0 items-center gap-2 rounded-md border bg-background ps-3 pe-2 text-start text-sm outline-none hover:bg-accent focus:outline-2 focus:outline-offset-2 focus:outline-ring data-[state=open]:outline-2 data-[state=open]:outline-offset-2 data-[state=open]:outline-ring",
            invalid ? "border-error-border" : "border-input",
          )}
        >
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          {value
            ? <span className="min-w-0 flex-1 truncate">{intl.formatDate(parseIso(value), { year: "numeric", month: "short", day: "numeric" })}</span>
            : <span className="min-w-0 flex-1 truncate text-muted-foreground">{placeholder}</span>}
          <ChevronDownIcon className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" collisionPadding={16} aria-label={t("reports.start.dialog")} className="flex w-74 flex-col gap-2 rounded-xl p-3">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon-sm" aria-label={t("reports.start.prev")} disabled={atCurrent} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
            <ChevronLeftIcon className="rtl:-scale-x-100" aria-hidden />
          </Button>
          <span aria-live="polite" className="font-semibold">{monthLabel}</span>
          <Button variant="ghost" size="icon-sm" aria-label={t("reports.start.next")} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
            <ChevronRightIcon className="rtl:-scale-x-100" aria-hidden />
          </Button>
        </div>
        <div role="group" aria-label={monthLabel} className="grid grid-cols-7 gap-1 text-center">
          {weekdays.map((w, i) => <span key={i} aria-hidden className="grid h-6 place-items-center text-xs text-muted-foreground">{w}</span>)}
          {Array.from({ length: lead }, (_, i) => <span key={`b${i}`} aria-hidden />)}
          {Array.from({ length: days }, (_, i) => {
            const v = isoDate(new Date(month.getFullYear(), month.getMonth(), i + 1));
            const sel = v === value;
            return (
              <button
                key={v}
                type="button"
                aria-label={intl.formatDate(parseIso(v), { dateStyle: "full" })}
                aria-pressed={sel}
                disabled={v < today}
                onClick={() => { onChange(v); setOpen(false); }}
                className={cn(
                  "h-8 rounded-md tabular-nums outline-none hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50",
                  v === today && !sel && "font-medium ring-1 ring-input ring-inset",
                  sel && "bg-primary font-semibold text-primary-foreground hover:bg-primary",
                )}
              >
                {intl.formatNumber(i + 1)}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

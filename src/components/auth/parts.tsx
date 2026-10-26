import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon, CheckCircle2Icon, CircleAlertIcon, CircleIcon, EyeIcon, EyeOffIcon, Loader2Icon, XCircleIcon, type LucideIcon } from "lucide-react";
import { useT } from "@/i18n/useT";
import { isBreachedPassword } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/** Page title + supporting text. One h1 per screen. */
export function Heading({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      {children && <p className="text-sm text-muted-foreground">{children}</p>}
    </div>
  );
}

/** 40px tinted icon above a heading. */
export function IconChip({ icon: Icon, tone = "info" }: { icon: LucideIcon; tone?: "info" | "success" }) {
  return (
    <div className={cn("flex size-10 items-center justify-center rounded-md", tone === "success" ? "bg-success-muted text-success-foreground" : "bg-info-muted text-info-foreground")}>
      <Icon className="size-5" aria-hidden />
    </div>
  );
}

/** Inline text link: always underlined (color alone isn't enough, WCAG 1.4.1). */
export function TextLink({ className, ...props }: ComponentProps<typeof Link>) {
  return <Link className={cn("font-medium text-link underline underline-offset-4 hover:no-underline", className)} {...props} />;
}

export function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1 self-start text-sm font-medium text-link underline-offset-4 hover:underline">
      <ArrowLeftIcon className="size-4 rtl:-scale-x-100" aria-hidden />
      {children}
    </Link>
  );
}

/** Field-level error: icon + text, linked to the input with aria-describedby. */
export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="flex items-start gap-1 text-form-msg text-error-foreground">
      <CircleAlertIcon className="size-4 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

/**
 * Moves focus to the first invalid field after a failed submit, so its error is read out
 * through aria-describedby (WCAG 3.3.1). Put formRef on the <form>; call focusFirstError()
 * whenever a submit (or the server) leaves a field invalid.
 */
export function useFocusFirstError() {
  const formRef = useRef<HTMLFormElement>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (attempt) formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [attempt]);
  return { formRef, focusFirstError: () => setAttempt((n) => n + 1) };
}

/** Form submit button: disabled with a spinner and aria-busy while the request runs. */
export function SubmitButton({ busy = false, busyLabel, children, disabled, ...props }: ComponentProps<typeof Button> & { busy?: boolean; busyLabel?: ReactNode }) {
  return (
    <Button type="submit" disabled={busy || disabled} aria-busy={busy} {...props}>
      {busy && <Loader2Icon className="animate-spin motion-reduce:animate-none" aria-hidden />}
      {busy && busyLabel ? busyLabel : children}
    </Button>
  );
}

/** Page-level error banner: what happened → why → what to do (one per page). */
export function ErrorBanner({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <Alert variant="error">
      <CircleAlertIcon aria-hidden />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex flex-col items-start gap-2">
        <span>{children}</span>
        {action}
      </AlertDescription>
    </Alert>
  );
}

/** Password input with a show/hide toggle (tooltip opens on hover and focus). */
export function PasswordInput({ ns, className, ...props }: ComponentProps<typeof Input> & { ns: string }) {
  const t = useT();
  const [shown, setShown] = useState(false);
  const label = t(`${ns}.${shown ? "hide" : "show"}`);
  return (
    <div className="relative">
      <Input {...props} type={shown ? "text" : "password"} className={cn("pe-9", className)} />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            aria-pressed={shown}
            onClick={() => setShown((s) => !s)}
            className="absolute end-1 top-1"
          >
            {shown ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </div>
  );
}

export const PASSWORD_RULES = [
  { key: "rLower", test: (p: string) => /[a-z]/.test(p) },
  { key: "rUpper", test: (p: string) => /[A-Z]/.test(p) },
  { key: "rNumber", test: (p: string) => /\d/.test(p) },
  { key: "rLength", test: (p: string) => p.length >= 8 && p.length <= 64 },
  { key: "rSpecial", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
] as const;

export const passwordMeetsRules = (p: string) => PASSWORD_RULES.every((r) => r.test(p));

/** Why a new password can't be used: rules not met, or found in a known breach (D-052). null = usable. */
export const passwordProblem = (p: string): "weak" | "breached" | null =>
  !passwordMeetsRules(p) ? "weak" : isBreachedPassword(p) ? "breached" : null;

/** Field error message for each passwordProblem result. */
export const PASSWORD_ERROR = { weak: "common.weakErr", breached: "common.breachedErr" } as const;

/** Live checklist, 2 columns, one line per rule, at field-error size. Unmet rules turn red only after submit. */
export function PasswordRules({ ns, password, submitted, id }: { ns: string; password: string; submitted: boolean; id: string }) {
  const t = useT();
  return (
    <ul id={id} className="m-0 grid list-none grid-cols-2 gap-x-4 gap-y-2 p-0 text-form-msg">
      {PASSWORD_RULES.map(({ key, test }) => {
        const met = test(password);
        const failed = !met && submitted;
        const Icon = met ? CheckCircle2Icon : failed ? XCircleIcon : CircleIcon;
        return (
          <li key={key} className={cn("flex min-w-0 items-center gap-2 whitespace-nowrap", met ? "text-success-foreground" : failed ? "text-error-foreground" : "text-muted-foreground")}>
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className="truncate">
              {t(`${ns}.${key}`)}
              <span className="sr-only"> {t(`${ns}.${met ? "met" : "notMet"}`)}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** Invite setup progress (3 steps). */
export function StepProgress({ step, label }: { step: 1 | 2 | 3; label: string }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div aria-hidden className="grid grid-cols-3 gap-1">
        {[1, 2, 3].map((n) => (
          <div key={n} className={cn("h-1 rounded-full", n <= step ? "bg-primary" : "bg-track")} />
        ))}
      </div>
    </div>
  );
}

/** 6-digit code field (single input, mono, as on the canvas). */
export function CodeInput(props: ComponentProps<typeof Input>) {
  return (
    <Input
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={6}
      placeholder="000000"
      dir="ltr"
      {...props}
      className="h-10 text-center font-mono text-xl font-medium tracking-[0.4em]"
    />
  );
}

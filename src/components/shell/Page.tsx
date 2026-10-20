import type { ReactNode } from "react";
import { CircleAlertIcon, InboxIcon, LayoutGridIcon, RefreshCwIcon } from "lucide-react";
import { useT } from "@/i18n/useT";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/** Page container: 12 top, 24 sides/bottom, 12 between sections, max 1920 (A2, D-054). */
export function PageContainer({ width = "default", children }: { width?: "default" | "reading"; children: ReactNode }) {
  return (
    <div className={cn("mx-auto flex w-full flex-col gap-3 px-6 pt-3 pb-6", width === "reading" ? "max-w-(--layout-reading-width)" : "max-w-(--layout-max-width)")}>
      {children}
    </div>
  );
}

export function PageGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-12 gap-4">{children}</div>;
}

/**
 * First row of every page (A2): filters and tabs take the free width; freshness and at most one
 * primary action sit at the end. The page title lives in the header breadcrumb, not here.
 */
export function PageToolbar({ children, freshness, actions }: { children?: ReactNode; freshness?: string; actions?: ReactNode }) {
  return (
    <div className="flex min-h-8 flex-wrap items-center gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-2">{children}</div>
      {freshness && <span className="shrink-0 text-xs text-muted-foreground">{freshness}</span>}
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Stand-in for a module's filters and tabs until the module is built. */
export function ToolbarPlaceholder() {
  const t = useT();
  return (
    <div className="flex h-8 flex-1 items-center rounded-md border border-dashed border-control-border px-3 text-xs text-muted-foreground">
      {t("shell.toolbar.placeholder")}
    </div>
  );
}

export type SlotState = "placeholder" | "loading" | "empty" | "error";

/** Where a module's screen renders. Until a module is built it shows a neutral placeholder. */
export function ModuleSlot({ name, state = "placeholder", onRetry, emptyAction }: { name: string; state?: SlotState; onRetry?: () => void; emptyAction?: ReactNode }) {
  const t = useT();
  if (state === "loading") {
    return (
      <PageGrid>
        <p role="status" className="sr-only">{t("shell.slot.loading", { module: name })}</p>
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="col-span-3 h-22" />)}
        <Skeleton className="col-span-8 h-80" />
        <Skeleton className="col-span-4 h-80" />
        <div className="col-span-12 flex flex-col gap-2">
          <Skeleton className="h-8" />
          <Skeleton className="h-8 w-11/12" />
          <Skeleton className="h-8 w-5/6" />
        </div>
      </PageGrid>
    );
  }
  if (state === "empty" || state === "error") {
    const error = state === "error";
    return (
      <PageGrid>
        <section
          role={error ? "alert" : undefined}
          aria-label={name}
          className="col-span-12 flex min-h-160 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-6 text-center"
        >
          <span className={cn("grid size-10 place-items-center rounded-md", error ? "bg-error-muted text-error-foreground" : "bg-muted text-muted-foreground")}>
            {error ? <CircleAlertIcon className="size-5" aria-hidden /> : <InboxIcon className="size-5" aria-hidden />}
          </span>
          <h2 className="text-base font-semibold">{t(error ? "shell.slot.errorTitle" : "shell.slot.emptyTitle", { module: name })}</h2>
          <p className="max-w-110 text-muted-foreground">{t(error ? "shell.slot.errorBody" : "shell.slot.emptyBody")}</p>
          <div className="mt-2">
            {error ? (
              <Button variant="outline" onClick={onRetry}><RefreshCwIcon aria-hidden />{t("shell.slot.retry")}</Button>
            ) : emptyAction}
          </div>
        </section>
      </PageGrid>
    );
  }
  return (
    <PageGrid>
      <section aria-label={name} className="col-span-12 flex min-h-160 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-control-border text-muted-foreground">
        <LayoutGridIcon className="size-6" aria-hidden />
        <p className="text-base font-medium text-foreground">{t("shell.slot.placeholder", { module: name })}</p>
      </section>
    </PageGrid>
  );
}

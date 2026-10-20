import { useState } from "react";
import { Link } from "react-router-dom";
import { useIntl } from "react-intl";
import { BellIcon, CheckCheckIcon, ClipboardCheckIcon, FileLockIcon, FileTextIcon, ShieldAlertIcon, type LucideIcon } from "lucide-react";
import { useT } from "@/i18n/useT";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { NOTIFICATIONS, type AppNotification, type NotificationKind } from "./demo";
import { moduleById, moduleHref } from "./nav";

const KIND: Record<NotificationKind, { icon: LucideIcon; chip: string }> = {
  report: { icon: FileTextIcon, chip: "bg-muted text-muted-foreground" },
  // Open critical finding: actionable, so it keeps severity color (alert-fatigue rule AF1).
  finding: { icon: ShieldAlertIcon, chip: "bg-severity-critical-muted text-severity-critical-foreground" },
  compliance: { icon: ClipboardCheckIcon, chip: "bg-muted text-muted-foreground" },
  policy: { icon: FileLockIcon, chip: "bg-muted text-muted-foreground" },
};

/** Relative time under 7 days (06-content-and-tone). */
function useRelative() {
  const intl = useIntl();
  return (minutesAgo: number) => {
    if (minutesAgo < 60) return intl.formatRelativeTime(-minutesAgo, "minute", { numeric: "auto" });
    if (minutesAgo < 1440) return intl.formatRelativeTime(-Math.round(minutesAgo / 60), "hour", { numeric: "auto" });
    return intl.formatRelativeTime(-Math.round(minutesAgo / 1440), "day", { numeric: "auto" });
  };
}

export function NotificationsMenu({ defaultOpen = false, items: initial = NOTIFICATIONS }: { defaultOpen?: boolean; items?: AppNotification[] }) {
  const t = useT();
  const relative = useRelative();
  const [open, setOpen] = useState(defaultOpen);
  const [items, setItems] = useState(initial);
  const unread = items.filter((n) => !n.read).length;
  const label = t("shell.notifications.label", { count: unread });
  const markRead = (id: string) => setItems((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button data-slot="notifications-trigger" variant="ghost" size="icon" aria-label={label} className="relative data-[state=open]:bg-accent data-[state=open]:text-foreground">
              <BellIcon aria-hidden />
              {unread > 0 && (
                <span aria-hidden className="absolute -top-1 -end-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-xs font-medium leading-none tabular-nums text-primary-foreground ring-2 ring-background">
                  {unread}
                </span>
              )}
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">{t("shell.notifications.title")}</TooltipContent>
      </Tooltip>
      <PopoverContent align="end" className="w-96 p-0" aria-labelledby="notifications-title">
        <div className="flex h-11 items-center justify-between gap-2 border-b border-border px-4">
          <h2 id="notifications-title" className="text-sm font-semibold">{t("shell.notifications.title")}</h2>
          {unread > 0 && (
            <Button data-slot="mark-all-read" variant="ghost" size="sm" className="text-link hover:text-link" onClick={() => setItems((list) => list.map((n) => ({ ...n, read: true })))}>
              {t("shell.notifications.markAll")}
            </Button>
          )}
        </div>
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
            <span className="grid size-10 place-items-center rounded-md bg-success-muted text-success-foreground">
              <CheckCheckIcon className="size-5" aria-hidden />
            </span>
            <p className="text-sm font-medium">{t("shell.notifications.emptyTitle")}</p>
            <p className="text-sm text-muted-foreground">{t("shell.notifications.emptyBody")}</p>
          </div>
        ) : (
          <ul className="max-h-120 overflow-y-auto">
            {items.map((n) => {
              const { icon: Icon, chip } = KIND[n.kind];
              const module = moduleById(n.module);
              return (
                <li key={n.id} className={cn("relative flex gap-3 border-b border-border px-4 py-3 last:border-b-0", !n.read && "bg-info-muted")}>
                  <span className={cn("grid size-8 shrink-0 place-items-center rounded-md", chip)}>
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className={cn("text-sm", !n.read && "font-medium")}>
                      {!n.read && <span className="sr-only">{t("shell.notifications.unread")}{" "}</span>}
                      {t(`shell.notifications.${n.kind}.title`)}
                    </p>
                    <p className="text-sm text-muted-foreground">{t(`shell.notifications.${n.kind}.status`)}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <time dateTime={new Date(Date.now() - n.minutesAgo * 60_000).toISOString()}>{relative(n.minutesAgo)}</time>
                      <PopoverClose asChild>
                        <Link
                          to={moduleHref(module)}
                          onClick={() => markRead(n.id)}
                          className="rounded-sm font-medium text-link underline underline-offset-4 outline-none hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        >
                          {t("shell.notifications.viewIn", { module: t(`shell.module.${n.module}`) })}
                        </Link>
                      </PopoverClose>
                    </div>
                  </div>
                  {!n.read && <span aria-hidden className="mt-2 size-2 shrink-0 rounded-full bg-primary" />}
                </li>
              );
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}

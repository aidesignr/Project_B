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

const KIND: Record<NotificationKind, { icon: LucideIcon; tone: string }> = {
  report: { icon: FileTextIcon, tone: "text-muted-foreground" },
  // Open critical alert: actionable, so it keeps severity color (alert-fatigue rule AF1).
  alert: { icon: ShieldAlertIcon, tone: "text-severity-critical-foreground" },
  compliance: { icon: ClipboardCheckIcon, tone: "text-muted-foreground" },
  policy: { icon: FileLockIcon, tone: "text-muted-foreground" },
};

const headerAction =
  "h-7 rounded-md px-2 text-xs font-medium text-link outline-none transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/** Relative time under 7 days (06-content-and-tone). */
function useRelative() {
  const intl = useIntl();
  return (minutesAgo: number) => {
    if (minutesAgo < 60) return intl.formatRelativeTime(-minutesAgo, "minute", { numeric: "auto" });
    if (minutesAgo < 1440) return intl.formatRelativeTime(-Math.round(minutesAgo / 60), "hour", { numeric: "auto" });
    return intl.formatRelativeTime(-Math.round(minutesAgo / 1440), "day", { numeric: "auto" });
  };
}

/**
 * Notification panel (canvas "A2 · Components", 1a–1c): compact cards, 5 visible before the list
 * scrolls. A card opens its module and marks itself read. "Clear all" is reversible with Undo (D-037).
 */
export function NotificationsMenu({ defaultOpen = false, items: initial = NOTIFICATIONS }: { defaultOpen?: boolean; items?: AppNotification[] }) {
  const t = useT();
  const relative = useRelative();
  const [open, setOpen] = useState(defaultOpen);
  const [items, setItems] = useState(initial);
  const [cleared, setCleared] = useState<AppNotification[] | null>(null);
  const unread = items.filter((n) => !n.read).length;
  const label = t("shell.notifications.label", { count: unread });
  const markRead = (id: string) => setItems((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const clearAll = () => { setCleared(items); setItems([]); };
  const undo = () => { if (cleared) setItems(cleared); setCleared(null); };

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
      <span className="sr-only" aria-live="polite">{t("shell.notifications.live", { count: unread })}</span>
      <PopoverContent align="end" className="w-88 p-0" aria-labelledby="notifications-title">
        <div className="flex h-10 items-center justify-between gap-2 border-b border-border ps-4 pe-2">
          <h2 id="notifications-title" className="text-sm font-semibold">{t("shell.notifications.title")}</h2>
          <div className="flex items-center gap-1">
            {unread > 0 && (
              <button type="button" data-slot="mark-all-read" className={headerAction} onClick={() => setItems((list) => list.map((n) => ({ ...n, read: true })))}>
                {t("shell.notifications.markAll")}
              </button>
            )}
            {items.length > 0 && (
              <button type="button" data-slot="clear-all" className={headerAction} onClick={clearAll}>
                {t("shell.notifications.clearAll")}
              </button>
            )}
          </div>
        </div>
        {items.length === 0 ? (
          <div className="flex h-50 flex-col items-center justify-center gap-2 px-6 text-center text-xs">
            <span className="grid size-8 place-items-center rounded-md bg-success-muted text-success-foreground">
              <CheckCheckIcon className="size-4" aria-hidden />
            </span>
            <p role="status" className="font-medium">{t(cleared ? "shell.notifications.cleared" : "shell.notifications.emptyTitle")}</p>
            {cleared && (
              <button type="button" data-slot="undo-clear" className={headerAction} onClick={undo}>
                {t("shell.notifications.undo")}
              </button>
            )}
          </div>
        ) : (
          <ul className="flex max-h-92 flex-col gap-1 overflow-y-auto p-2" aria-label={t("shell.notifications.title")}>
            {items.map((n) => {
              const { icon: Icon, tone } = KIND[n.kind];
              return (
                <li key={n.id}>
                  <PopoverClose asChild>
                    <Link
                      data-slot="notification"
                      to={moduleHref(moduleById(n.module))}
                      onClick={() => markRead(n.id)}
                      className={cn(
                        "relative flex w-full items-start gap-2 rounded-md border py-2 ps-2 pe-7 text-start text-2xs text-foreground outline-none transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                        n.read ? "border-border" : "border-transparent bg-info-muted",
                      )}
                    >
                      <Icon className={cn("size-4 shrink-0", tone)} aria-hidden />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="font-medium">
                          {!n.read && <span className="sr-only">{t("shell.notifications.unread")}{" "}</span>}
                          {t(`shell.notifications.item.${n.id}.title`)}
                        </span>
                        <span className="truncate text-muted-foreground">{t(`shell.notifications.item.${n.id}.desc`)}</span>
                        <time className="mt-1 text-3xs text-muted-foreground" dateTime={new Date(Date.now() - n.minutesAgo * 60_000).toISOString()}>
                          {relative(n.minutesAgo)}
                        </time>
                      </span>
                      {!n.read && <span aria-hidden className="absolute top-3 end-3 size-2 rounded-full bg-primary" />}
                    </Link>
                  </PopoverClose>
                </li>
              );
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}

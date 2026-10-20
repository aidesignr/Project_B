import { useLocation } from "react-router-dom";
import { BookOpenIcon, ChevronRightIcon, CircleHelpIcon, ExternalLinkIcon, InfoIcon, LifeBuoyIcon, PanelLeftCloseIcon, PanelLeftOpenIcon, SearchIcon } from "lucide-react";
import { useT } from "@/i18n/useT";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { APP_VERSION, HELP_LINKS } from "./demo";
import { AskAIButton } from "./AskAI";
import { NotificationsMenu } from "./Notifications";
import { TenantSelector } from "./TenantSelector";
import { MODULES } from "./nav";
import { useShell } from "./shell-context";

/**
 * Fix-sidebar button, first in the header (D-057): pins the sidebar open (content pushed) or
 * unpins it back to the hover rail. Below 1280px it is aria-disabled and explains why.
 */
export function PinButton() {
  const t = useT();
  const { pinned, canPin, togglePinned } = useShell();
  const active = pinned && canPin;
  const label = t(active ? "shell.pin.unpin" : "shell.pin.pin");
  const Icon = active ? PanelLeftCloseIcon : PanelLeftOpenIcon;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          data-slot="pin-button"
          variant="ghost"
          size="icon"
          aria-label={label}
          aria-disabled={!canPin || undefined}
          data-state={active ? "on" : "off"}
          onClick={() => canPin && togglePinned()}
          className={cn(
            active && "bg-accent text-primary hover:text-primary",
            !canPin && "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-muted-foreground",
          )}
        >
          <Icon className="rtl:-scale-x-100" aria-hidden />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="start">{canPin ? label : t("shell.pin.unavailable")}</TooltipContent>
    </Tooltip>
  );
}

/**
 * Search, icon only (A2). It will open a search popup (designed on the canvas); until that ships
 * the button is aria-disabled and says so, rather than doing nothing silently.
 */
export function SearchButton() {
  const t = useT();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          data-slot="search-button"
          variant="ghost"
          size="icon"
          aria-label={t("shell.search.label")}
          aria-disabled="true"
          className="cursor-not-allowed"
        >
          <SearchIcon aria-hidden />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{t("shell.search.soon")}</TooltipContent>
    </Tooltip>
  );
}

/**
 * Breadcrumb unified into the header (A2). No "Home" (Dashboard is home); it starts at the
 * module. A module with level 2 pages is plain text (path only, no link); the last crumb is the
 * page's single H1. When space runs out the module crumb hides first, then the title truncates.
 */
export function HeaderBreadcrumb() {
  const t = useT();
  const { pathname } = useLocation();
  const [, moduleId, subId] = pathname.split("/");
  const module = MODULES.find((m) => m.id === moduleId);
  if (!module) return <div className="min-w-0 flex-1" />;
  const sub = module.subs.find((x) => x.id === subId) ?? module.subs[0];
  const moduleName = t(`shell.module.${module.id}`);
  const title = sub ? t(`shell.sub.${module.id}.${sub.id}`) : moduleName;
  return (
    <nav aria-label={t("shell.page.breadcrumb")} className="min-w-0 flex-1">
      <ol className="flex min-w-0 items-center gap-1 text-xs whitespace-nowrap text-muted-foreground">
        {sub && (
          <>
            <li className="@max-4xl:hidden">{moduleName}</li>
            <li aria-hidden className="flex @max-4xl:hidden"><ChevronRightIcon className="size-3 rtl:-scale-x-100" /></li>
          </>
        )}
        <li aria-current="page" className="min-w-0 truncate">
          <h1 className="inline text-sm font-semibold text-foreground" title={title}>{title}</h1>
        </li>
      </ol>
    </nav>
  );
}

/** Help menu: exactly three items (brief). Version is information, not an action. */
export function HelpMenu({ defaultOpen }: { defaultOpen?: boolean }) {
  const t = useT();
  return (
    // Non-modal: a modal menu aria-hides the page while its controls stay focusable (axe aria-hidden-focus).
    <DropdownMenu defaultOpen={defaultOpen} modal={false}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button data-slot="help-trigger" variant="ghost" size="icon" aria-label={t("shell.help.label")} className="data-[state=open]:bg-accent data-[state=open]:text-foreground">
              <CircleHelpIcon aria-hidden />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">{t("shell.help.label")}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <a href={HELP_LINKS.helpCenter} target="_blank" rel="noreferrer">
            <BookOpenIcon aria-hidden />
            <span className="flex-1">{t("shell.help.center")}</span>
            <ExternalLinkIcon className="size-3" aria-hidden />
            <span className="sr-only">{t("shell.help.newTab")}</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={HELP_LINKS.support}>
            <LifeBuoyIcon aria-hidden />
            {t("shell.help.support")}
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="flex h-8 items-center gap-2 py-0 text-sm font-normal">
          <InfoIcon className="size-4" aria-hidden />
          {t("shell.help.version", { version: APP_VERSION })}
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Top of the content column, 48 high (D-055), A2 layout: fix-sidebar button · breadcrumb + H1 ·
 * search icon · tenant and group · Help · AskAI · notifications. Stacked below the sidebar (z 20
 * vs 30) so the floating sidebar's logo row is never covered (D-057). Narrow containers
 * (zoom/reflow) turn the tenant and AskAI labels into icons; names stay in aria-label.
 */
export function Header() {
  return (
    <header className="@container relative z-20 flex h-(--layout-header) shrink-0 items-center gap-3 border-b border-border bg-background px-4">
      <PinButton />
      <HeaderBreadcrumb />
      <div className="flex shrink-0 items-center gap-2">
        <SearchButton />
        <TenantSelector />
        <div aria-hidden className="h-6 w-px bg-border" />
        <HelpMenu />
        <AskAIButton />
        <NotificationsMenu />
      </div>
    </header>
  );
}

import { useCallback, useEffect, useMemo, useRef, useState, type FocusEvent, type KeyboardEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronsUpDownIcon, CircleCheckIcon, CircleIcon, LogOutIcon, SlidersHorizontalIcon, SunMoonIcon, UserRoundIcon } from "lucide-react";
import { useT } from "@/i18n/useT";
import { usePreferences, type ThemePref } from "@/app/preferences";
import { isRtl } from "@/i18n/locales";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CURRENT_USER, GETTING_STARTED, OPEN_CRITICAL_FINDINGS } from "./demo";
import { MODULES, type ModuleDef } from "./nav";
import { NavGroupItem, NavItem, NavLabel } from "./NavItem";
import { SidebarContext, msToken, useHoldSidebarOpen, useShell, useSidebar } from "./shell-context";

/**
 * Full-height sidebar. Unpinned (default): a 56px rail that expands to 240px over the content
 * on hover intent or keyboard focus. Pinned: always 240px and the content sits beside it.
 * The panel always lays out at 240px and the rail clips it, so nothing reflows while it animates.
 */
export function Sidebar({ forceExpanded = false, children }: { forceExpanded?: boolean; children?: ReactNode }) {
  const t = useT();
  const { isPinned } = useShell();
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const [hover, setHover] = useState(false);
  const [focusIn, setFocusIn] = useState(false);
  const [holds, setHolds] = useState(0);

  const expanded = isPinned || forceExpanded || hover || focusIn || holds > 0;
  const overlay = expanded && !isPinned;

  const hold = useCallback((delta: 1 | -1) => setHolds((h) => Math.max(0, h + delta)), []);

  // When the last menu closes, re-sync hover with where the cursor actually is.
  useEffect(() => {
    if (holds === 0) setHover(!!ref.current?.matches(":hover"));
  }, [holds]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const schedule = (next: boolean) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setHover(next), msToken(next ? "--delay-sidebar-open" : "--delay-sidebar-close"));
  };

  const onFocus = (e: FocusEvent) => {
    // Keyboard focus expands the rail; a mouse click that focuses a link doesn't lock it open.
    if ((e.target as HTMLElement).matches(":focus-visible")) setFocusIn(true);
  };
  const onBlur = (e: FocusEvent) => {
    if (!ref.current?.contains(e.relatedTarget as Node | null)) setFocusIn(false);
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && overlay && holds === 0) {
      window.clearTimeout(timer.current);
      setHover(false);
      setFocusIn(false);
    }
  };

  const ctx = useMemo(() => ({ expanded, overlay, hold }), [expanded, overlay, hold]);
  const main = MODULES.filter((m) => m.group === "main");
  const admin = MODULES.filter((m) => m.group === "admin");

  return (
    <SidebarContext.Provider value={ctx}>
      <div
        ref={ref}
        data-slot="sidebar"
        data-state={expanded ? "expanded" : "collapsed"}
        data-mode={isPinned ? "pinned" : "unpinned"}
        aria-label={t("shell.sidebar.label")}
        role="region"
        onMouseEnter={() => !isPinned && schedule(true)}
        onMouseLeave={() => !isPinned && schedule(false)}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        className={cn(
          "absolute inset-y-0 start-0 z-30 overflow-hidden border-e border-sidebar-border bg-sidebar text-sidebar-foreground",
          "transition-[width,box-shadow] duration-(--duration-base) ease-standard",
          expanded ? "w-(--layout-sidebar)" : "w-(--layout-sidebar-collapsed)",
          overlay && "shadow-sidebar",
        )}
      >
        <div className="flex h-full w-(--layout-sidebar) flex-col">
          <SidebarHeader />
          <nav aria-label={t("shell.nav.label")} className="flex-1 overflow-y-auto overflow-x-hidden p-2">
            {children ?? (
              <>
                <ul className="flex flex-col gap-1">
                  {main.map((m) => <ModuleNavItem key={m.id} module={m} />)}
                </ul>
                <Separator className="my-2 bg-sidebar-border" />
                <NavSection title={t("shell.nav.admin")}>
                  {admin.map((m) => <ModuleNavItem key={m.id} module={m} />)}
                </NavSection>
              </>
            )}
          </nav>
          <div className="flex flex-col gap-1 border-t border-sidebar-border p-2">
            <GettingStarted />
            <ProfileMenu />
          </div>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}

function ModuleNavItem({ module }: { module: ModuleDef }) {
  const t = useT();
  const label = t(`shell.module.${module.id}`);
  const badge = module.id === "findings" ? OPEN_CRITICAL_FINDINGS : undefined;
  if (module.subs.length === 0) return <NavItem to={module.path} icon={module.icon} label={label} badge={badge} />;
  return (
    <NavGroupItem
      icon={module.icon}
      label={label}
      basePath={module.path}
      badge={badge}
      items={module.subs.map((s) => ({ to: s.path, label: t(`shell.sub.${module.id}.${s.id}`) }))}
    />
  );
}

/** A labelled group of nav items (e.g. "Admin"). The heading fades with the labels. */
export function NavSection({ title, children }: { title: string; children: ReactNode }) {
  const { expanded } = useSidebar();
  return (
    <section aria-label={title}>
      <h2 className={cn("flex h-6 items-center px-2 text-xs font-medium text-muted-foreground transition-opacity duration-(--duration-base)", !expanded && "opacity-0")}>
        {title}
      </h2>
      <ul className="flex flex-col gap-1">{children}</ul>
    </section>
  );
}

function SidebarHeader() {
  const t = useT();
  const { expanded } = useSidebar();
  const { theme } = usePreferences();
  return (
    <div className="flex h-12 shrink-0 items-center border-b border-sidebar-border px-2">
      {/* Mark or full logo, never both; the full logo sits in a fixed 120×28 box so it can't push or overlap anything. */}
      <Link
        to="/dashboard"
        aria-label={t("shell.logo.home")}
        className="flex h-10 w-56 items-center overflow-hidden rounded-md px-1 outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sidebar-ring"
      >
        {expanded ? (
          <img src={`/brand/accuknox-logo-on-${theme}.svg`} alt="" className="h-7 w-30 object-contain object-left" />
        ) : (
          <img src="/brand/accuknox-mark.svg" alt="" className="size-8" />
        )}
      </Link>
    </div>
  );
}

function ProgressRing({ done, total }: { done: number; total: number }) {
  // r = 10 on a 24 box; the circumference is ~62.8.
  const c = 2 * Math.PI * 10;
  return (
    <svg viewBox="0 0 24 24" className="size-6 -rotate-90" aria-hidden>
      <circle cx="12" cy="12" r="10" fill="none" strokeWidth="3" className="stroke-track" />
      <circle cx="12" cy="12" r="10" fill="none" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(done / total) * c} ${c}`} className="stroke-sidebar-primary" />
    </svg>
  );
}

/** Onboarding checklist entry: progress ring + "2 of 5 done"; opens the checklist. */
export function GettingStarted() {
  const t = useT();
  const { locale } = usePreferences();
  const { gettingStartedOpen: open, setGettingStartedOpen: setOpen } = useShell();
  useHoldSidebarOpen(open);
  const done = GETTING_STARTED.filter((s) => s.done).length;
  const total = GETTING_STARTED.length;
  const progress = t("shell.gettingStarted.progress", { done, total });
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          data-slot="getting-started-trigger"
          type="button"
          className="flex h-10 w-full items-center gap-3 rounded-md px-2 text-start outline-none transition-colors hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sidebar-ring data-[state=open]:bg-sidebar-accent"
        >
          <span className="grid size-6 shrink-0 place-items-center"><ProgressRing done={done} total={total} /></span>
          <NavLabel className="flex flex-col">
            <span className="truncate text-xs font-medium text-sidebar-foreground">{t("shell.gettingStarted.title")}</span>
            <span className="truncate text-xs text-muted-foreground">{progress}</span>
          </NavLabel>
        </button>
      </PopoverTrigger>
      <PopoverContent side={isRtl(locale) ? "left" : "right"} align="end" sideOffset={8} className="w-80 p-4">
        <h2 className="text-sm font-semibold">{t("shell.gettingStarted.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("shell.gettingStarted.body")}</p>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-track" aria-hidden>
            <div className="h-full rounded-full bg-primary" style={{ width: `${(done / total) * 100}%` }} />
          </div>
          <span className="text-xs text-muted-foreground">{progress}</span>
        </div>
        <ol className="mt-3 flex flex-col gap-2">
          {GETTING_STARTED.map((step) => (
            <li key={step.key} className="flex items-center gap-2 text-sm">
              {step.done ? (
                <CircleCheckIcon className="size-4 shrink-0 text-success-foreground" aria-hidden />
              ) : (
                <CircleIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              )}
              <span className={cn(step.done && "text-muted-foreground")}>{t(step.key)}</span>
              <span className="sr-only">{t(step.done ? "shell.gettingStarted.done" : "shell.gettingStarted.todo")}</span>
            </li>
          ))}
        </ol>
      </PopoverContent>
    </Popover>
  );
}

const THEMES: { value: ThemePref; key: string }[] = [
  { value: "light", key: "common.light" },
  { value: "dark", key: "common.dark" },
  { value: "system", key: "common.system" },
];

/** Avatar + name + role; opens the account menu. Avatar only when the rail is collapsed. */
export function ProfileMenu({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const t = useT();
  const navigate = useNavigate();
  const { locale, themePref, setThemePref } = usePreferences();
  const [open, setOpen] = useState(defaultOpen);
  useHoldSidebarOpen(open);
  const role = t(CURRENT_USER.roleKey);
  return (
    // Non-modal: a modal menu aria-hides the page while its controls stay focusable (axe aria-hidden-focus).
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-slot="profile-trigger"
          aria-label={t("shell.profile.menu", { name: CURRENT_USER.name })}
          className="flex h-10 w-full items-center gap-3 rounded-md px-1 text-start outline-none transition-colors hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sidebar-ring data-[state=open]:bg-sidebar-accent"
        >
          <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full border border-control-border bg-muted text-xs font-medium text-foreground">
            {CURRENT_USER.initials}
          </span>
          <NavLabel className="flex flex-col">
            <span className="truncate text-xs font-medium text-sidebar-foreground">{CURRENT_USER.name}</span>
            <span className="truncate text-xs text-muted-foreground">{role}</span>
          </NavLabel>
          <NavLabel className="flex-none">
            <ChevronsUpDownIcon className="size-4 text-muted-foreground" aria-hidden />
          </NavLabel>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side={isRtl(locale) ? "left" : "right"} align="end" sideOffset={8} className="w-60">
        <DropdownMenuLabel className="flex flex-col py-2">
          <span className="text-sm font-medium text-popover-foreground">{CURRENT_USER.name}</span>
          <span className="truncate font-normal"><bdi>{CURRENT_USER.email}</bdi></span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate("/settings")}>
          <UserRoundIcon aria-hidden />{t("shell.profile.account")}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate("/settings")}>
          <SlidersHorizontalIcon aria-hidden />{t("shell.profile.preferences")}
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <SunMoonIcon aria-hidden />{t("shell.profile.theme")}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={themePref} onValueChange={(v) => setThemePref(v as ThemePref)}>
              {THEMES.map(({ value, key }) => (
                <DropdownMenuRadioItem key={value} value={value}>{t(key)}</DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate("/sign-in")}>
          <LogOutIcon className="rtl:-scale-x-100" aria-hidden />{t("shell.profile.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

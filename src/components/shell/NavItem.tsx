import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { NavLink, useLocation, useMatch } from "react-router-dom";
import { ChevronDownIcon, OctagonAlertIcon, type LucideIcon } from "lucide-react";
import { useT } from "@/i18n/useT";
import { usePreferences } from "@/app/preferences";
import { isRtl } from "@/i18n/locales";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsPinned, useSidebar } from "./shell-context";

/** Forces a visual state in the component-states sheet (Storybook); never set in the app. */
export type PreviewState = "hover" | "focus";

// Level 1 row: 32 high, 24 icon box holding a 20 px icon, 12 gap (compact, D-055).
const rowBase =
  "relative flex h-8 w-full items-center gap-3 rounded-md px-2 text-start text-sm text-muted-foreground outline-none transition-colors duration-(--duration-fast) hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sidebar-ring";
const rowHover = "bg-sidebar-accent text-sidebar-accent-foreground";
const rowFocus = "outline-2 -outline-offset-2 outline-sidebar-ring";
// Active: tinted row + 4px accent bar at the inline-start edge + accent icon + medium weight.
const rowActive =
  "bg-sidebar-accent font-medium text-sidebar-accent-foreground before:absolute before:inset-y-2 before:start-0 before:w-1 before:rounded-full before:bg-sidebar-primary [&_[data-slot=nav-icon]]:text-sidebar-primary";
const rowDisabled = "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-muted-foreground";
// Level 2 row: 28 high, label inset 44 so it lines up with level 1 labels.
const subBase = "h-7 ps-11";
// Current level 2 page: colour only (link blue, which passes 4.5:1 as text) — no bar, no tint.
const subActive = "font-medium text-link hover:text-link";

/** Label text that fades out when the rail collapses (it stays in the accessible name). */
export function NavLabel({ children, className }: { children: ReactNode; className?: string }) {
  const { expanded } = useSidebar();
  return (
    <span className={cn("min-w-0 flex-1 truncate text-start transition-opacity duration-(--duration-base)", !expanded && "opacity-0", className)}>
      {children}
    </span>
  );
}

function NavIcon({ icon: Icon, dot }: { icon: LucideIcon; dot?: boolean }) {
  const { expanded } = useSidebar();
  return (
    <span data-slot="nav-icon" className="relative grid size-6 shrink-0 place-items-center">
      <Icon className="size-5" aria-hidden />
      {dot && !expanded && <span aria-hidden className="absolute top-0 end-0 size-2 rounded-full bg-severity-critical ring-2 ring-sidebar" />}
    </span>
  );
}

/** Open-critical count. Icon + number + tint; the full sentence is in the row's accessible name. */
function CountBadge({ count }: { count: number }) {
  const { expanded } = useSidebar();
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex h-5 shrink-0 items-center gap-1 rounded-sm border border-severity-critical-border bg-severity-critical-muted px-1 text-xs font-medium tabular-nums text-severity-critical-foreground transition-opacity duration-(--duration-base)",
        !expanded && "opacity-0",
      )}
    >
      <OctagonAlertIcon className="size-3" />
      {count}
    </span>
  );
}

/** Label shown in a tooltip only while the rail is collapsed (suppressed when labels are visible). */
function RailTooltip({ label, children }: { label: string; children: ReactNode }) {
  const { expanded } = useSidebar();
  const { locale } = usePreferences();
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      {!expanded && <TooltipContent side={isRtl(locale) ? "left" : "right"}>{label}</TooltipContent>}
    </Tooltip>
  );
}

function useBadgeName(label: string, badge?: number) {
  const t = useT();
  return badge ? t("shell.nav.withBadge", { label, badge: t("shell.findings.badge", { count: badge }) }) : undefined;
}

type NavItemProps = {
  to: string;
  icon: LucideIcon;
  label: string;
  /** Open critical findings (Findings only). */
  badge?: number;
  disabled?: boolean;
  previewState?: PreviewState;
};

/** A level 1 module without level 2 pages (Dashboard): a plain link. */
export function NavItem({ to, icon, label, badge, disabled, previewState }: NavItemProps) {
  const name = useBadgeName(label, badge);
  // A string className (not NavLink's function form): the tooltip trigger's Slot merges it.
  const isActive = !!useMatch({ path: to, end: false });
  const content = (
    <>
      <NavIcon icon={icon} dot={!!badge} />
      <NavLabel>{label}</NavLabel>
      {badge ? <CountBadge count={badge} /> : null}
    </>
  );

  if (disabled) {
    return (
      <li>
        <a role="link" aria-disabled="true" aria-label={name} className={cn(rowBase, rowDisabled)}>{content}</a>
      </li>
    );
  }

  return (
    <li>
      <RailTooltip label={name ?? label}>
        <NavLink
          to={to}
          aria-label={name}
          className={cn(rowBase, previewState === "hover" && rowHover, previewState === "focus" && rowFocus, isActive && rowActive)}
        >
          {content}
        </NavLink>
      </RailTooltip>
    </li>
  );
}

type SubItem = { to: string; label: string };

/**
 * A module with level 2 pages: the row is a disclosure button (aria-expanded) and the level 2
 * pages are links. Groups start collapsed and collapse again whenever the sidebar expands,
 * collapses or is pinned/unpinned (A2). The current module's row always keeps the accent bar.
 */
export function NavGroupItem({
  icon,
  label,
  basePath,
  items,
  defaultOpen,
  badge,
  previewState,
}: {
  icon: LucideIcon;
  label: string;
  /** Module path; the group counts as current for any URL under it. */
  basePath: string;
  items: SubItem[];
  defaultOpen?: boolean;
  badge?: number;
  previewState?: PreviewState;
}) {
  const { pathname } = useLocation();
  const inGroup = pathname === basePath || pathname.startsWith(`${basePath}/`);
  const [open, setOpen] = useState(defaultOpen ?? false);
  const { expanded } = useSidebar();
  const isPinned = useIsPinned();
  const listId = useId();
  const name = useBadgeName(label, badge);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setOpen(false);
  }, [expanded, isPinned]);

  return (
    <li>
      <RailTooltip label={name ?? label}>
        <button
          data-slot="nav-group"
          type="button"
          aria-label={name}
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((o) => !o)}
          className={cn(rowBase, previewState === "hover" && rowHover, previewState === "focus" && rowFocus, inGroup && rowActive)}
        >
          <NavIcon icon={icon} dot={!!badge} />
          <NavLabel>{label}</NavLabel>
          {badge ? <CountBadge count={badge} /> : null}
          <ChevronDownIcon
            aria-hidden
            className={cn("size-4 shrink-0 transition duration-(--duration-base)", open && "rotate-180", !expanded && "opacity-0")}
          />
        </button>
      </RailTooltip>
      <ul id={listId} hidden={!open || !expanded} className="mt-1 flex flex-col gap-1">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} className={({ isActive }) => cn(rowBase, subBase, isActive && subActive)}>
              <NavLabel>{item.label}</NavLabel>
            </NavLink>
          </li>
        ))}
      </ul>
    </li>
  );
}

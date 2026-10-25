import type { ReactNode } from "react";
import {
  BoxIcon,
  CircleAlertIcon,
  CircleArrowDownIcon,
  CircleCheckIcon,
  CircleDotIcon,
  ClockIcon,
  EyeOffIcon,
  InfoIcon,
  OctagonAlertIcon,
  TriangleAlertIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Severity, Status } from "./data";

export const SEVERITY_ICON: Record<Severity, LucideIcon> = {
  critical: OctagonAlertIcon,
  high: TriangleAlertIcon,
  medium: CircleAlertIcon,
  low: CircleArrowDownIcon,
  info: InfoIcon,
};

/** Text/icon color per severity (`-foreground` tokens; never a solid fill behind text). */
export const SEVERITY_TEXT: Record<Severity, string> = {
  critical: "text-severity-critical-foreground",
  high: "text-severity-high-foreground",
  medium: "text-severity-medium-foreground",
  low: "text-severity-low-foreground",
  info: "text-severity-info-foreground",
};

/** Selected toggle: tint + border + foreground (D-064). */
export const SEVERITY_ON: Record<Severity, string> = {
  critical: "border-severity-critical-border bg-severity-critical-muted text-severity-critical-foreground",
  high: "border-severity-high-border bg-severity-high-muted text-severity-high-foreground",
  medium: "border-severity-medium-border bg-severity-medium-muted text-severity-medium-foreground",
  low: "border-severity-low-border bg-severity-low-muted text-severity-low-foreground",
  info: "border-severity-info-border bg-severity-info-muted text-foreground",
};

export const STATUS_ICON: Record<Status, LucideIcon> = {
  open: CircleDotIcon,
  inProgress: ClockIcon,
  resolved: CircleCheckIcon,
  ignored: EyeOffIcon,
};

export const STATUS_TEXT: Record<Status, string> = {
  open: "text-status-open-foreground",
  inProgress: "text-status-in-progress-foreground",
  // Alert fatigue: closed work is muted.
  resolved: "text-muted-foreground",
  ignored: "text-muted-foreground",
};

/**
 * Stand-in for a provider or asset logo until the SVGs are supplied: a muted generic icon (a dashed
 * square read as a second checkbox next to the real ones). Decorative: the name sits beside it.
 */
export function IconPlaceholder({ icon: Icon = BoxIcon, className }: { icon?: LucideIcon; className?: string }) {
  return <Icon aria-hidden className={cn("size-4 shrink-0 text-muted-foreground", className)} />;
}

/** Bolds the part of a value that matched the search, so results show why they matched. */
export function Highlight({ text, query }: { text: string; query: string }): ReactNode {
  const i = query ? text.toLocaleLowerCase().indexOf(query) : -1;
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <b className="font-semibold">{text.slice(i, i + query.length)}</b>
      {text.slice(i + query.length)}
    </>
  );
}

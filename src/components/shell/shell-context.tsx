import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const PIN_KEY = "ak.sidebarPinned";
/** Matches --layout-pin-min-width: below this the sidebar is forced unpinned (D-054). */
export const PIN_MIN_WIDTH = 1280;

const read = (key: string) => { try { return localStorage.getItem(key); } catch { return null; } };
const write = (key: string, value: string) => { try { localStorage.setItem(key, value); } catch { /* private mode */ } };

export function useMediaQuery(query: string) {
  const get = () => typeof window !== "undefined" && !!window.matchMedia?.(query).matches;
  const [matches, setMatches] = useState(get);
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return;
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

/** A breadcrumb step set by a page deeper than level 2. `to` makes it a link; the last one is the current page. */
export type Crumb = { label: string; to?: string };

type ShellState = {
  /** The saved preference (persists across sessions). */
  pinned: boolean;
  /** False below 1280px, where the sidebar is always unpinned. */
  canPin: boolean;
  /** Effective mode: pinned and the window is wide enough. */
  isPinned: boolean;
  togglePinned: () => void;
  askAIOpen: boolean;
  setAskAIOpen: (open: boolean) => void;
  /** The getting-started checklist (opened from the sidebar or an empty module). */
  gettingStartedOpen: boolean;
  setGettingStartedOpen: (open: boolean) => void;
  /** Set by a page that owns its H1 (e.g. report configuration); replaces the module/sub breadcrumb. */
  crumbs: Crumb[] | null;
  setCrumbs: (crumbs: Crumb[] | null) => void;
};

const ShellContext = createContext<ShellState | null>(null);

export type ShellOptions = {
  /** Start pinned or unpinned instead of reading the saved preference (stories). */
  defaultPinned?: boolean;
  /** Override the 1280px media query (stories render in narrow frames). */
  pinnable?: boolean;
  defaultAskAIOpen?: boolean;
  defaultGettingStartedOpen?: boolean;
};

export function ShellProvider({ children, defaultPinned, pinnable, defaultAskAIOpen = false, defaultGettingStartedOpen = false }: ShellOptions & { children: ReactNode }) {
  const [pinned, setPinned] = useState(() => defaultPinned ?? read(PIN_KEY) === "true");
  const wide = useMediaQuery(`(min-width: ${PIN_MIN_WIDTH}px)`);
  const canPin = pinnable ?? wide;
  const [askAIOpen, setAskAIOpen] = useState(defaultAskAIOpen);
  const [gettingStartedOpen, setGettingStartedOpen] = useState(defaultGettingStartedOpen);
  const [crumbs, setCrumbs] = useState<Crumb[] | null>(null);

  const togglePinned = useCallback(() => {
    setPinned((p) => {
      write(PIN_KEY, String(!p));
      return !p;
    });
  }, []);

  const value = useMemo<ShellState>(
    () => ({ pinned, canPin, isPinned: pinned && canPin, togglePinned, askAIOpen, setAskAIOpen, gettingStartedOpen, setGettingStartedOpen, crumbs, setCrumbs }),
    [pinned, canPin, togglePinned, askAIOpen, gettingStartedOpen, crumbs],
  );
  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

/** Pinned state without requiring the provider (nav pieces render alone in Storybook). */
export function useIsPinned() {
  return useContext(ShellContext)?.isPinned ?? false;
}

/** Crumbs set by the current page, if any (works without the provider). */
export function usePageCrumbs() {
  return useContext(ShellContext)?.crumbs ?? null;
}

/** A page deeper than level 2 sets its breadcrumb while it is mounted. Pass a stable key to avoid resets. */
export function useSetCrumbs(crumbs: Crumb[], key: string) {
  const set = useContext(ShellContext)?.setCrumbs;
  useEffect(() => {
    set?.(crumbs);
    return () => set?.(null);
  }, [set, key]); // `crumbs` is rebuilt every render; `key` says when it really changed.
}

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used inside ShellProvider");
  return ctx;
}

/* ---------- Sidebar expansion (hover intent, focus, open menus) ---------- */

type SidebarState = { expanded: boolean; overlay: boolean; hold: (delta: 1 | -1) => void };
export const SidebarContext = createContext<SidebarState>({ expanded: true, overlay: false, hold: () => {} });
export const useSidebar = () => useContext(SidebarContext);

/** Keeps the unpinned sidebar expanded while a menu or popover opened from it is open. */
export function useHoldSidebarOpen(open: boolean) {
  const { hold } = useSidebar();
  useEffect(() => {
    if (!open) return;
    hold(1);
    return () => hold(-1);
  }, [open, hold]);
}

/** Reads a millisecond token (e.g. --delay-sidebar-close) so timing lives in tokens.css. */
export function msToken(name: string) {
  if (typeof window === "undefined") return 0;
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || 0;
}

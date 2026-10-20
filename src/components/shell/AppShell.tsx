import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { useT } from "@/i18n/useT";
import { cn } from "@/lib/utils";
import { AskAIPanel } from "./AskAI";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { ShellProvider, useShell, type ShellOptions } from "./shell-context";

/**
 * Master layout for every module (D-052): full-height sidebar on the inline-start side, a
 * 48px header and an independently scrolling main region beside it. The spacer reserves 56
 * (unpinned rail; the expanded sidebar floats over content) or 240 (pinned; content pushed).
 */
export function AppShell({ children, forceExpanded, ...options }: ShellOptions & { children?: ReactNode; forceExpanded?: boolean }) {
  return (
    <ShellProvider {...options}>
      <ShellLayout forceExpanded={forceExpanded}>{children ?? <Outlet />}</ShellLayout>
    </ShellProvider>
  );
}

function ShellLayout({ children, forceExpanded }: { children: ReactNode; forceExpanded?: boolean }) {
  const t = useT();
  const { isPinned } = useShell();
  return (
    <div className="relative flex h-dvh overflow-hidden bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:start-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium"
      >
        {t("shell.skip")}
      </a>
      <div
        aria-hidden
        className={cn(
          "shrink-0 transition-[width] duration-(--duration-base) ease-standard",
          isPinned ? "w-(--layout-sidebar)" : "w-(--layout-sidebar-collapsed)",
        )}
      />
      <Sidebar forceExpanded={forceExpanded} />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <Header />
        <main id="main-content" tabIndex={-1} className="min-h-0 flex-1 overflow-y-auto outline-none">
          {children}
        </main>
        <AskAIPanel />
      </div>
    </div>
  );
}

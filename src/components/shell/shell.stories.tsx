import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { createIntl } from "react-intl";
import { INTL_LOCALE, messagesFor, type Locale } from "@/i18n/locales";
import { useT } from "@/i18n/useT";
import { Button } from "@/components/ui/button";
import { AppShell } from "./AppShell";
import { Header } from "./Header";
import { NavGroupItem, NavItem } from "./NavItem";
import { ModuleSlot, PageContainer, PageToolbar, ToolbarPlaceholder, type SlotState } from "./Page";
import { moduleById, type ModuleId } from "./nav";
import { SidebarContext, ShellProvider } from "./shell-context";
import { OPEN_CRITICAL_FINDINGS } from "./demo";

/**
 * App shell, approved layout A2 (canvas "AccuKnox app shell", page "A2 · Approved"; D-053–D-059).
 * Every module screen renders inside it.
 * Stories pass `pinnable` so pinning works in narrow Storybook frames.
 */
const meta: Meta = {
  title: "Shell/App shell",
  parameters: { layout: "fullscreen", route: "/dashboard" },
};
export default meta;
type Story = StoryObj;

const body = () => within(document.body);
/** Message in the story's active locale (the light-ar project runs every story in Arabic). */
const msg = (id: string, values?: Record<string, string | number>) => {
  const locale = document.documentElement.lang as Locale;
  return createIntl({ locale: INTL_LOCALE[locale], messages: messagesFor(locale) }).formatMessage({ id }, values) as string;
};
const q = (root: HTMLElement, slot: string) => {
  const el = root.querySelector<HTMLElement>(`[data-slot="${slot}"]`);
  if (!el) throw new Error(`No [data-slot="${slot}"]`);
  return el;
};

/** Stand-in for a module screen: toolbar (filters and tabs) + module slot. The title is in the header. */
function DemoPage({ module = "dashboard", sub, state = "placeholder" }: { module?: ModuleId; sub?: string; state?: SlotState }) {
  const t = useT();
  const moduleName = t(`shell.module.${module}`);
  const title = sub ? t(`shell.sub.${module}.${sub}`) : moduleName;
  return (
    <PageContainer>
      <PageToolbar freshness={t("shell.page.updated", { time: "4 min ago" })} actions={<Button variant="outline">{t("shell.page.export")}</Button>}>
        <ToolbarPlaceholder />
      </PageToolbar>
      <ModuleSlot name={title} state={state} emptyAction={<Button variant="outline">{t("shell.slot.emptyAction")}</Button>} />
    </PageContainer>
  );
}

/* ---------- 1–3 · Sidebar modes ---------- */

export const UnpinnedAtRest: Story = {
  render: () => <AppShell defaultPinned={false} pinnable><DemoPage /></AppShell>,
  play: async ({ canvasElement }) => {
    const sidebar = q(canvasElement, "sidebar");
    await expect(sidebar).toHaveAttribute("data-state", "collapsed");
    await expect(sidebar).toHaveAttribute("data-mode", "unpinned");
  },
};

export const UnpinnedHoverExpanded: Story = {
  render: () => <AppShell defaultPinned={false} pinnable forceExpanded><DemoPage /></AppShell>,
  play: async ({ canvasElement }) => {
    await expect(q(canvasElement, "sidebar")).toHaveAttribute("data-state", "expanded");
  },
};

export const Pinned: Story = {
  render: () => <AppShell defaultPinned pinnable><DemoPage /></AppShell>,
  play: async ({ canvasElement }) => {
    const sidebar = q(canvasElement, "sidebar");
    await expect(sidebar).toHaveAttribute("data-mode", "pinned");
    // Unpin from the header button, then pin again.
    await userEvent.click(q(canvasElement, "pin-button"));
    await waitFor(() => expect(sidebar).toHaveAttribute("data-mode", "unpinned"));
    await userEvent.click(q(canvasElement, "pin-button"));
    await waitFor(() => expect(sidebar).toHaveAttribute("data-mode", "pinned"));
  },
};

export const PinUnavailableBelow1280: Story = {
  render: () => <AppShell defaultPinned pinnable={false}><DemoPage /></AppShell>,
  play: async ({ canvasElement }) => {
    await expect(q(canvasElement, "sidebar")).toHaveAttribute("data-mode", "unpinned");
    await expect(q(canvasElement, "pin-button")).toHaveAttribute("aria-disabled", "true");
  },
};

export const Level2PageActive: Story = {
  parameters: { route: "/assets/cloud" },
  render: () => <AppShell defaultPinned pinnable><DemoPage module="assets" sub="cloud" /></AppShell>,
  play: async ({ canvasElement }) => {
    const groups = canvasElement.querySelectorAll<HTMLElement>('[data-slot="nav-group"]');
    const findings = groups[0]; // Assets: first module with level 2 pages
    // A2: level 2 menus start collapsed; the current module's row still carries the accent bar.
    await expect(findings).toHaveAttribute("aria-expanded", "false");
    await expect(findings.className).toContain("before:bg-sidebar-primary");
    await userEvent.click(findings);
    await expect(findings).toHaveAttribute("aria-expanded", "true");
    const current = canvasElement.querySelector<HTMLElement>('a[aria-current="page"][href="/assets/cloud"]');
    await expect(current).not.toBeNull();
    // Level 2 current page: colour only, no bar.
    await expect(current!.className).toContain("text-link");
    await expect(current!.className).not.toContain("before:");
    // Breadcrumb in the header: module is plain text, the page is the H1.
    const crumbs = within(q(canvasElement, "sidebar").ownerDocument.querySelector("header")!);
    await expect(crumbs.getByRole("heading", { level: 1 })).toBeInTheDocument();
    await expect(canvasElement.querySelector('header nav li a')).toBeNull();
  },
};

/* ---------- 4 · Menus and panels open ---------- */

/* Tenant and group selector (canvas "A2 · Components", 3a–3e) */

export const TenantSelectorOpen: Story = {
  render: () => <AppShell defaultPinned pinnable><DemoPage /></AppShell>,
  play: async ({ canvasElement }) => {
    await userEvent.click(q(canvasElement, "tenant-trigger"));
    await body().findByRole("combobox");
    // The active tenant starts expanded: All groups + its 4 groups.
    await waitFor(() => expect(document.querySelectorAll('[data-slot="scope-option"]')).toHaveLength(5));
    await expect(body().getByRole("treeitem", { selected: true })).toHaveTextContent(msg("shell.scope.group.all"));
  },
};

export const TenantSelectorSelectGroup: Story = {
  render: () => <AppShell defaultPinned pinnable><DemoPage /></AppShell>,
  play: async ({ canvasElement }) => {
    const trigger = q(canvasElement, "tenant-trigger");
    await userEvent.click(trigger);
    await userEvent.click(await body().findByRole("treeitem", { name: "Staging" }));
    await waitFor(() => expect(trigger).toHaveAccessibleName(msg("shell.scope.trigger", { tenant: "Acme Corp", group: "Staging" })));
  },
};

export const TenantSelectorSearch: Story = {
  render: () => <AppShell defaultPinned pinnable><DemoPage /></AppShell>,
  play: async ({ canvasElement }) => {
    await userEvent.click(q(canvasElement, "tenant-trigger"));
    await userEvent.type(await body().findByRole("combobox"), "prod");
    // "Production" under Acme Corp and Umbrella Labs; matches are highlighted.
    await waitFor(() => expect(document.querySelectorAll('[data-slot="scope-option"]')).toHaveLength(2));
    await expect(document.querySelectorAll("[role=tree] mark").length).toBe(2);
  },
};

export const TenantSelectorKeyboard: Story = {
  render: () => <AppShell defaultPinned pinnable><DemoPage /></AppShell>,
  play: async ({ canvasElement }) => {
    const trigger = q(canvasElement, "tenant-trigger");
    await userEvent.click(trigger);
    const combobox = await body().findByRole("combobox");
    await userEvent.type(combobox, "globex");
    // Row 0 is the Globex tenant, row 1 "All groups", row 2 "EU workloads".
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}{Enter}");
    await waitFor(() => expect(trigger).toHaveAccessibleName(msg("shell.scope.trigger", { tenant: "Globex", group: "EU workloads" })));
  },
};

export const TenantSelectorNoResults: Story = {
  render: () => <AppShell defaultPinned pinnable><DemoPage /></AppShell>,
  play: async ({ canvasElement }) => {
    await userEvent.click(q(canvasElement, "tenant-trigger"));
    await userEvent.type(await body().findByRole("combobox"), "zebra");
    await waitFor(() => expect(body().getByRole("status")).toHaveTextContent(msg("shell.scope.none", { query: "zebra" })));
  },
};

export const HelpMenuOpen: Story = {
  render: () => <AppShell defaultPinned pinnable><DemoPage /></AppShell>,
  play: async ({ canvasElement }) => {
    await userEvent.click(q(canvasElement, "help-trigger"));
    await waitFor(() => expect(body().getAllByRole("menuitem")).toHaveLength(2));
  },
};

/* Notifications (canvas "A2 · Components", 1a–1c) */

export const NotificationsOpen: Story = {
  render: () => <AppShell defaultPinned pinnable><DemoPage /></AppShell>,
  play: async ({ canvasElement }) => {
    await userEvent.click(q(canvasElement, "notifications-trigger"));
    await waitFor(() => expect(document.querySelectorAll('[data-slot="notification"]')).toHaveLength(7));
    await expect(document.querySelector('[data-slot="mark-all-read"]')).not.toBeNull();
    await expect(document.querySelector('[data-slot="clear-all"]')).not.toBeNull();
  },
};

export const NotificationsMarkAllRead: Story = {
  render: () => <AppShell defaultPinned pinnable><DemoPage /></AppShell>,
  play: async ({ canvasElement }) => {
    const trigger = q(canvasElement, "notifications-trigger");
    await expect(trigger).toHaveAccessibleName(msg("shell.notifications.label", { count: 3 }));
    await userEvent.click(trigger);
    await userEvent.click(await waitFor(() => q(document.body, "mark-all-read")));
    await waitFor(() => expect(trigger).toHaveAccessibleName(msg("shell.notifications.label", { count: 0 })));
    await expect(document.querySelector('[data-slot="mark-all-read"]')).toBeNull();
  },
};

export const NotificationsClearAllUndo: Story = {
  render: () => <AppShell defaultPinned pinnable><DemoPage /></AppShell>,
  play: async ({ canvasElement }) => {
    await userEvent.click(q(canvasElement, "notifications-trigger"));
    await userEvent.click(await waitFor(() => q(document.body, "clear-all")));
    await waitFor(() => expect(body().getByText(msg("shell.notifications.cleared"))).toBeInTheDocument());
    await userEvent.click(q(document.body, "undo-clear"));
    await waitFor(() => expect(document.querySelectorAll('[data-slot="notification"]')).toHaveLength(7));
  },
};

/* AskAI (canvas "A2 · Components", 2a–2d) */

export const AskAIOpen: Story = {
  parameters: { route: "/findings" },
  render: () => <AppShell defaultPinned pinnable defaultAskAIOpen><DemoPage module="findings" /></AppShell>,
  play: async ({ canvasElement }) => {
    await expect(q(canvasElement, "askai-trigger")).toHaveAttribute("aria-expanded", "true");
    await expect(q(canvasElement, "askai-dock")).toHaveAttribute("data-state", "open");
    await expect(within(canvasElement).getByRole("complementary", { name: msg("shell.askai.label") })).toBeVisible();
  },
};

export const AskAIClose: Story = {
  render: () => <AppShell pinnable defaultAskAIOpen><DemoPage /></AppShell>,
  play: async ({ canvasElement }) => {
    await userEvent.click(q(canvasElement, "askai-close"));
    const trigger = q(canvasElement, "askai-trigger");
    await waitFor(() => expect(q(canvasElement, "askai-dock")).toHaveAttribute("data-state", "closed"));
    await expect(trigger).toHaveFocus();
  },
};

export const ProfileMenuOpen: Story = {
  render: () => <AppShell defaultPinned pinnable><DemoPage /></AppShell>,
  play: async ({ canvasElement }) => {
    await userEvent.click(q(canvasElement, "profile-trigger"));
    await waitFor(() => expect(body().getAllByRole("menuitem").length).toBeGreaterThanOrEqual(4));
  },
};

export const GettingStartedOpen: Story = {
  render: () => <AppShell defaultPinned pinnable defaultGettingStartedOpen><DemoPage /></AppShell>,
};

/* ---------- 5 · Header at rest ---------- */

export const HeaderAtRest: Story = {
  parameters: { route: "/findings" },
  render: () => (
    <ShellProvider defaultPinned={false} pinnable>
      <Header />
    </ShellProvider>
  ),
};

/** Dashboard is home: the breadcrumb is a single crumb, the page title. */
export const HeaderOnDashboard: Story = {
  parameters: { route: "/dashboard" },
  render: () => (
    <ShellProvider defaultPinned={false} pinnable>
      <Header />
    </ShellProvider>
  ),
  play: async ({ canvasElement }) => {
    const ol = canvasElement.querySelector("header nav ol")!;
    await expect(ol.querySelectorAll("li")).toHaveLength(1);
    await expect(q(canvasElement, "search-button")).toHaveAttribute("aria-disabled", "true");
  },
};

/* ---------- Module slot states ---------- */

export const SlotLoading: Story = {
  parameters: { route: "/assets/cloud" },
  render: () => <AppShell defaultPinned pinnable><DemoPage module="assets" sub="cloud" state="loading" /></AppShell>,
};
export const SlotEmpty: Story = {
  parameters: { route: "/assets/cloud" },
  render: () => <AppShell defaultPinned pinnable><DemoPage module="assets" sub="cloud" state="empty" /></AppShell>,
};
export const SlotError: Story = {
  parameters: { route: "/assets/cloud" },
  render: () => <AppShell defaultPinned pinnable><DemoPage module="assets" sub="cloud" state="error" /></AppShell>,
};

/* ---------- Component states sheet ---------- */

function Strip({ caption, children, rail }: { caption: string; children: ReactNode; rail?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-muted-foreground">{caption}</span>
      <SidebarContext.Provider value={{ expanded: !rail, overlay: false, hold: () => {} }}>
        <ul className={rail ? "w-14 rounded-md border border-sidebar-border bg-sidebar p-2" : "w-60 rounded-md border border-sidebar-border bg-sidebar p-2"}>
          {children}
        </ul>
      </SidebarContext.Provider>
    </div>
  );
}

/** Findings nav item in every state, plus its level 2 menu (captions are sheet labels, not product copy). */
export const NavItemStates: Story = {
  parameters: { layout: "padded", route: "/assets/cloud" },
  render: () => {
    const t = useT();
    const f = moduleById("findings");
    const label = t("shell.module.findings");
    const a = moduleById("assets");
    const items = a.subs.map((s) => ({ to: s.path, label: t(`shell.sub.assets.${s.id}`) }));
    return (
      <div className="flex flex-wrap gap-6">
        <Strip caption="Default"><NavItem to="/x" icon={f.icon} label={label} /></Strip>
        <Strip caption="Hover"><NavItem to="/x" icon={f.icon} label={label} previewState="hover" /></Strip>
        <Strip caption="Focus"><NavItem to="/x" icon={f.icon} label={label} previewState="focus" /></Strip>
        <Strip caption="Active"><NavItem to="/assets/cloud" icon={f.icon} label={label} /></Strip>
        <Strip caption="Disabled"><NavItem to="/x" icon={f.icon} label={label} disabled /></Strip>
        <Strip caption="Count badge"><NavItem to="/x" icon={f.icon} label={label} badge={OPEN_CRITICAL_FINDINGS} /></Strip>
        <Strip caption="Count badge · rail" rail><NavItem to="/x" icon={f.icon} label={label} badge={OPEN_CRITICAL_FINDINGS} /></Strip>
        <Strip caption="Level 2 · open, item active"><NavGroupItem icon={a.icon} label={t("shell.module.assets")} basePath={a.path} items={items} defaultOpen /></Strip>
        <Strip caption="Level 2 · closed (default)"><NavGroupItem icon={a.icon} label={t("shell.module.assets")} basePath={a.path} items={items} /></Strip>
      </div>
    );
  },
};

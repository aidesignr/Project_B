// Placeholder data the shell renders until the real APIs are wired. Display names are data;
// every label around them comes from react-intl.
import pkg from "../../../package.json";
import type { ModuleId } from "./nav";

export const APP_VERSION: string = pkg.version;

export const HELP_LINKS = {
  helpCenter: "https://help.accuknox.com/",
  support: "mailto:support@accuknox.com",
};

export const CURRENT_USER = { name: "Alex Morgan", initials: "AM", email: "alex.morgan@example.com", roleKey: "shell.profile.role.securityAdmin" };

/** Open critical findings, shown as the count badge on the Findings nav item. */
export const OPEN_CRITICAL_FINDINGS = 12;

export type Scope = { tenant: string; groupKey: string };
export const scopeId = (s: Scope) => `${s.tenant}::${s.groupKey}`;

export const SCOPES: Scope[] = [
  { tenant: "Solution Engineering", groupKey: "shell.scope.group.all" },
  { tenant: "Solution Engineering", groupKey: "shell.scope.group.production" },
  { tenant: "Solution Engineering", groupKey: "shell.scope.group.staging" },
  { tenant: "Platform Security", groupKey: "shell.scope.group.all" },
  { tenant: "Platform Security", groupKey: "shell.scope.group.euWorkloads" },
  { tenant: "Customer Demo", groupKey: "shell.scope.group.all" },
];

export type NotificationKind = "report" | "finding" | "compliance" | "policy";
export type AppNotification = { id: string; kind: NotificationKind; module: ModuleId; minutesAgo: number; read: boolean };

export const NOTIFICATIONS: AppNotification[] = [
  { id: "n1", kind: "report", module: "reports", minutesAgo: 5, read: false },
  { id: "n2", kind: "finding", module: "findings", minutesAgo: 60, read: false },
  { id: "n3", kind: "compliance", module: "compliance", minutesAgo: 180, read: true },
  { id: "n4", kind: "policy", module: "policies", minutesAgo: 1440, read: true },
];

export const GETTING_STARTED = [
  { key: "shell.gettingStarted.step.connectCloud", done: true },
  { key: "shell.gettingStarted.step.addCluster", done: true },
  { key: "shell.gettingStarted.step.scanRepo", done: false },
  { key: "shell.gettingStarted.step.inviteTeam", done: false },
  { key: "shell.gettingStarted.step.setAlerts", done: false },
];

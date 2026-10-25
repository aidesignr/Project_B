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

/** Tenants and their groups. Display names are data; "All groups" is a label (shell.scope.allGroups). */
export type Tenant = { name: string; groups: string[] };
export const TENANTS: Tenant[] = [
  { name: "Acme Corp", groups: ["Production", "Staging", "Development", "Shared services"] },
  { name: "Globex", groups: ["EU workloads", "US workloads"] },
  { name: "Initech", groups: ["Payments", "Analytics", "Data platform"] },
  { name: "Umbrella Labs", groups: ["Research", "Production"] },
  { name: "Stark Industries", groups: ["Manufacturing", "R&D"] },
];
/** Selected scope: tenant index, and group index where 0 is "All groups". */
export type Scope = { tenant: number; group: number };

export type NotificationKind = "report" | "alert" | "compliance" | "policy";
/** Copy comes from shell.notifications.item.<id>.title / .desc. */
export type AppNotification = { id: string; kind: NotificationKind; module: ModuleId; minutesAgo: number; read: boolean };

export const NOTIFICATIONS: AppNotification[] = [
  { id: "n1", kind: "report", module: "reports", minutesAgo: 5, read: false },
  { id: "n2", kind: "alert", module: "findings", minutesAgo: 60, read: false },
  { id: "n3", kind: "compliance", module: "compliance", minutesAgo: 180, read: false },
  { id: "n4", kind: "policy", module: "policies", minutesAgo: 1440, read: true },
  { id: "n5", kind: "alert", module: "kspm", minutesAgo: 1500, read: true },
  { id: "n6", kind: "report", module: "reports", minutesAgo: 2880, read: true },
  { id: "n7", kind: "compliance", module: "compliance", minutesAgo: 4320, read: true },
];

export const GETTING_STARTED = [
  { key: "shell.gettingStarted.step.connectCloud", done: true },
  { key: "shell.gettingStarted.step.addCluster", done: true },
  { key: "shell.gettingStarted.step.scanRepo", done: false },
  { key: "shell.gettingStarted.step.inviteTeam", done: false },
  { key: "shell.gettingStarted.step.setAlerts", done: false },
];

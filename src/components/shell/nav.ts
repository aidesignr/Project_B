import {
  BoxesIcon,
  BrainCircuitIcon,
  FileChartColumnIcon,
  FileLockIcon,
  FingerprintIcon,
  LayersIcon,
  LayoutGridIcon,
  ServerIcon,
  SettingsIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  ShipWheelIcon,
  type LucideIcon,
} from "lucide-react";

export type ModuleId =
  | "dashboard"
  | "assets"
  | "findings"
  | "identities"
  | "kspm"
  | "compliance"
  | "policies"
  | "workloads"
  | "xbom"
  | "aiml"
  | "reports"
  | "settings";

/** A level 2 page. Its label is `shell.sub.<module>.<id>`; its path is `/<module>/<id>`. */
export type SubDef = { id: string; path: string };

export type ModuleDef = { id: ModuleId; path: string; icon: LucideIcon; group: "main" | "admin"; subs: SubDef[] };

const subs = (module: ModuleId, ids: string[]): SubDef[] => ids.map((id) => ({ id, path: `/${module}/${id}` }));

/**
 * Product IA (supplied by the product owner on 2026-10-20, D-059; replaces the brief's nine
 * modules). A module with level 2 pages has no page of its own: its row only groups them, and a
 * link to it lands on its first level 2 page.
 */
export const MODULES: readonly ModuleDef[] = [
  { id: "dashboard", path: "/dashboard", icon: LayoutGridIcon, group: "main", subs: [] },
  { id: "assets", path: "/assets", icon: ServerIcon, group: "main", subs: subs("assets", ["cloud", "code", "clusters"]) },
  { id: "findings", path: "/findings", icon: ShieldAlertIcon, group: "main", subs: [] },
  { id: "identities", path: "/identities", icon: FingerprintIcon, group: "main", subs: subs("identities", ["ciem", "kiem"]) },
  { id: "kspm", path: "/kspm", icon: ShipWheelIcon, group: "main", subs: [] },
  { id: "compliance", path: "/compliance", icon: ShieldCheckIcon, group: "main", subs: [] },
  { id: "policies", path: "/policies", icon: FileLockIcon, group: "main", subs: [] },
  { id: "workloads", path: "/workloads", icon: BoxesIcon, group: "main", subs: subs("workloads", ["graph", "policies"]) },
  { id: "xbom", path: "/xbom", icon: LayersIcon, group: "main", subs: subs("xbom", ["dashboard", "findings"]) },
  { id: "aiml", path: "/aiml", icon: BrainCircuitIcon, group: "main", subs: subs("aiml", ["dashboard", "assets", "rt-policies", "prompt-firewall"]) },
  { id: "reports", path: "/reports", icon: FileChartColumnIcon, group: "main", subs: [] },
  { id: "settings", path: "/settings", icon: SettingsIcon, group: "admin", subs: [] },
];

export const moduleById = (id: ModuleId) => MODULES.find((m) => m.id === id)!;

/** Where a link to a module lands: its first level 2 page, or the module itself. */
export const moduleHref = (m: ModuleDef) => m.subs[0]?.path ?? m.path;

export const DEFAULT_MODULE_PATH = MODULES[0].path;

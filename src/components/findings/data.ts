// Findings page model: filter definitions (from the product owner's dropdown spreadsheet, D-064)
// and seeded mock findings until the findings API is wired. Value names that come from scans
// (assets, accounts, CVEs) are data; every label around them comes from react-intl.

export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type Status = "open" | "inProgress" | "resolved" | "ignored";

export const SEVERITIES: Severity[] = ["critical", "high", "medium", "low", "info"];
/** Severities with an on-page toggle (C/H/M/L, D-064). */
export const SEVERITY_TOGGLES: Severity[] = ["critical", "high", "medium", "low"];
export const STATUSES: Status[] = ["open", "inProgress", "resolved", "ignored"];

export type Finding = {
  id: string;
  severity: Severity;
  /** Risk score 0–100, inside the D-034 band for its severity. Sorts the Severity column. */
  score: number;
  name: string;
  asset: string;
  provider: string;
  account: string;
  status: Status;
  ageHours: number;
  ticket?: string;
};

/** A selectable value. `labelKey` is a message id; otherwise `label` is data shown as-is. */
export type FilterValue = { id: string; label?: string; labelKey?: string; children?: FilterValue[] };

export type FilterId =
  | "groupBy" | "provider"
  | "assetCategory" | "assetType" | "assetName" | "region" | "tags" | "label" | "findingSource" | "collector"
  | "newFinding" | "originRisk" | "sla" | "uniqueVuln" | "findingName" | "dataType" | "vulnName" | "toolOutput"
  | "findingStatus" | "complianceControl" | "assetGroup" | "findingId"
  | "ignored" | "exploit" | "investigation" | "tickets"
  | "presentOn" | "dateDiscovered" | "lastSeen" | "lastFixed";

/** One row of the dropdown spreadsheet. */
export type FilterDef = {
  /** Findings filters use a `FilterId`; other pages pass their own id and a `label` to the dropdown. */
  id: FilterId | (string & {});
  kind: "list" | "date";
  multi?: boolean;
  ops?: boolean;
  search?: boolean;
  tabs?: boolean;
  selectAll?: boolean;
  unselectAll?: boolean;
  create?: boolean;
  /** Placeholder icon on tree parents (provider logos ship later). */
  iconParent?: boolean;
  values?: FilterValue[];
};

export type Operator = "eq" | "neq";
export type FilterState = { op: Operator; selected: string[]; custom: string[]; from?: string; to?: string };
export const emptyFilter = (p?: Partial<FilterState>): FilterState => ({ op: "eq", selected: [], custom: [], ...p });

const data = (ids: string[]): FilterValue[] => ids.map((id) => ({ id, label: id }));
const keyed = (prefix: string, ids: string[]): FilterValue[] => ids.map((id) => ({ id, labelKey: `${prefix}.${id}` }));
const yesNo = keyed("findings.value", ["yes", "no"]);

const general = (id: FilterId, values: FilterValue[], extra?: Partial<FilterDef>): FilterDef => ({
  id, kind: "list", multi: true, ops: true, search: true, tabs: true, selectAll: true, unselectAll: true, values, ...extra,
});
const yesOrNo = (id: FilterId): FilterDef => ({ id, kind: "list", ops: true, values: yesNo });
const dateRange = (id: FilterId): FilterDef => ({ id, kind: "date" });

export const PROVIDERS: FilterValue[] = [
  { id: "aws", label: "AWS", children: data(["Org-Production", "Org-Customer Demo", "Org-Product Development"]) },
  { id: "gcp", label: "GCP", children: data(["prod-analytics", "staging-core"]) },
  { id: "azure", label: "Azure", children: data(["Contoso-Prod", "Contoso-Dev"]) },
  { id: "oracle", label: "Oracle", children: data(["oci-finance"]) },
];

export const FILTERS: Record<FilterId, FilterDef> = {
  groupBy: { id: "groupBy", kind: "list", values: keyed("findings.groupBy", ["none", "severity", "status", "account"]) },
  provider: { id: "provider", kind: "list", multi: true, ops: true, iconParent: true, search: true, tabs: true, selectAll: true, unselectAll: true, values: PROVIDERS },
  assetCategory: general("assetCategory", data(["Compute", "Storage", "Database", "Identity", "Network", "Container"])),
  assetType: general("assetType", data(["S3 bucket", "EC2 instance", "IAM role", "Security group", "Cloud SQL instance", "Storage account"])),
  assetName: general("assetName", data(["prod-customer-uploads", "ci-deploy-role", "gke-prod-eu", "contosoprodlogs", "bastion-sg", "payments-api:2.14.0"])),
  region: general("region", data(["us-east-1", "us-west-2", "eu-west-1", "eu-central-1", "ap-south-1"])),
  tags: general("tags", data(["env:production", "env:staging", "team:payments", "owner:platform"]), { create: true }),
  label: general("label", data(["Crown jewel", "Internet facing", "Customer data", "Internal only"]), { multi: false, selectAll: false }),
  findingSource: general("findingSource", data(["AccuKnox CSPM", "AccuKnox CWPP", "AWS Security Hub", "Microsoft Defender for Cloud", "Third-party import"])),
  collector: general("collector", data(["Agentless scanner", "Runtime agent", "Cloud API", "Registry scanner"])),
  newFinding: general("newFinding", keyed("findings.value", ["newInPeriod", "seenBefore"])),
  originRisk: general("originRisk", data(["Internet exposed", "Sensitive data", "Privileged access", "Known exploit"])),
  sla: general("sla", keyed("findings.value", ["withinSla", "dueSoon", "overdue"])),
  uniqueVuln: general("uniqueVuln", data(["CVE-2024-3094", "CVE-2023-44487", "CVE-2024-6387", "CVE-2023-4863"])),
  findingName: general("findingName", data(["Access Analyzer is not enabled", "Access approval is not configured", "Access to other Azure tenants is allowed", "Account does not require MFA", "Account uses the default password policy", "S3 bucket allows public read access", "Security group allows SSH from anywhere"])),
  dataType: general("dataType", data(["PII", "Payment card data", "Credentials", "Health data"])),
  vulnName: general("vulnName", data(["XZ Utils backdoor", "HTTP/2 Rapid Reset", "regreSSHion", "libwebp heap overflow"])),
  toolOutput: general("toolOutput", data(["Prowler", "Trivy", "Checkov", "Kubescape", "Cloud Custodian"])),
  findingStatus: general("findingStatus", keyed("findings.status", STATUSES)),
  complianceControl: general("complianceControl", data(["CIS AWS 1.4", "CIS AWS 2.1.1", "NIST AC-2", "PCI DSS 8.3.1", "SOC 2 CC6.1"])),
  assetGroup: general("assetGroup", data(["Production", "Staging", "Payments platform", "Data lake"])),
  findingId: general("findingId", data(["FND-10231", "FND-10244", "FND-10302", "FND-10318"])),
  ignored: yesOrNo("ignored"),
  exploit: yesOrNo("exploit"),
  investigation: yesOrNo("investigation"),
  tickets: yesOrNo("tickets"),
  presentOn: dateRange("presentOn"),
  dateDiscovered: dateRange("dateDiscovered"),
  lastSeen: dateRange("lastSeen"),
  lastFixed: dateRange("lastFixed"),
};

/** Always on the page (with the severity toggles); everything else comes from Add filter. */
export const STATIC_FILTERS: FilterId[] = ["groupBy", "provider"];
/** Add filter order follows the spreadsheet. Severity has on-page toggles instead. */
export const ON_DEMAND_FILTERS: FilterId[] = [
  "assetCategory", "assetType", "assetName", "region", "tags", "label", "findingSource", "collector", "newFinding", "originRisk",
  "sla", "uniqueVuln", "findingName", "dataType", "vulnName", "toolOutput", "findingStatus", "complianceControl", "assetGroup",
  "findingId", "ignored", "exploit", "investigation", "tickets", "presentOn", "dateDiscovered", "lastSeen", "lastFixed",
];

/** Leaf values of a filter (tree children, or the flat list), plus values created from search. */
export function leaves(def: FilterDef, custom: string[] = []): (FilterValue & { parent?: FilterValue })[] {
  const out: (FilterValue & { parent?: FilterValue })[] = [];
  (def.values ?? []).forEach((v) => (v.children ? v.children.forEach((c) => out.push({ ...c, parent: v })) : out.push(v)));
  custom.forEach((c) => out.push({ id: c, label: c }));
  return out;
}

export type ColumnId = "severity" | "name" | "asset" | "account" | "status" | "lastSeen" | "ticket";
export type ColumnDef = { id: ColumnId; locked?: boolean; className: string };
export const COLUMNS: ColumnDef[] = [
  { id: "severity", className: "w-32" },
  { id: "name", locked: true, className: "" },
  { id: "asset", className: "w-44" },
  { id: "account", className: "w-44" },
  { id: "status", className: "w-32" },
  { id: "lastSeen", className: "w-30" },
  { id: "ticket", className: "w-24" },
];

const BAND: Record<Severity, [number, number]> = { critical: [90, 100], high: [70, 89], medium: [40, 69], low: [10, 39], info: [0, 9] };
const COUNTS: Record<Severity, number> = { critical: 10, high: 40, medium: 100, low: 150, info: 100 };
const NAMES: Record<Severity, string[]> = {
  critical: ["S3 bucket allows public read access", "IAM role has admin access without MFA", "Kubernetes API server is open to the internet", "Root account has active access keys", "Database snapshot is shared publicly", "Secret key committed to a public repository"],
  high: ["Storage account allows shared key access", "Security group allows SSH from anywhere", "Container image runs as root", "RDP port is open to the internet", "IAM user has unused admin permissions", "Load balancer accepts TLS 1.0"],
  medium: ["CloudTrail log file validation is off", "Cloud SQL instance has no automated backups", "Access Analyzer is not enabled", "KMS key rotation is off", "Pod has no memory limit", "VPC flow logs are off"],
  low: ["VM disk uses a platform-managed key", "Object versioning is off", "Resource has no owner tag", "Log retention is under 90 days", "Bucket has no lifecycle policy"],
  info: ["Default VPC is in use", "Security group is not attached to anything", "Instance uses a previous-generation type", "Region has no active resources"],
};
const ASSETS = ["prod-customer-uploads", "ci-deploy-role", "gke-prod-eu", "contosoprodlogs", "bastion-sg", "payments-api:2.14.0", "org-trail", "analytics-sql", "build-agent-03", "oci-finance-archive", "web-frontend-asg", "billing-db-primary", "auth-service:1.9.3", "data-lake-raw", "vpn-gateway-01", "reports-bucket", "eks-staging", "redis-cache-02"];
const ACCOUNTS: [string, string, number][] = [
  ["aws", "Org-Production", 30], ["aws", "Org-Customer Demo", 15], ["aws", "Org-Product Development", 15], ["gcp", "prod-analytics", 10],
  ["gcp", "staging-core", 8], ["azure", "Contoso-Prod", 10], ["azure", "Contoso-Dev", 7], ["oracle", "oci-finance", 5],
];

/** 400 seeded mock findings, so every render (and every story) shows the same rows. */
function mockFindings(): Finding[] {
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)];
  const weighted = <T,>(pairs: [T, number][]) => {
    let x = rnd() * pairs.reduce((t, p) => t + p[1], 0);
    for (const [v, w] of pairs) { x -= w; if (x < 0) return v; }
    return pairs[0][0];
  };
  const out: Finding[] = [];
  SEVERITIES.forEach((severity) => {
    const [lo, hi] = BAND[severity];
    for (let i = 0; i < COUNTS[severity]; i++) {
      const [provider, account] = weighted(ACCOUNTS.map(([p, a, w]) => [[p, a] as const, w]));
      out.push({
        id: `FND-${10000 + out.length + 1}`,
        severity,
        score: lo + Math.floor(rnd() * (hi - lo + 1)),
        name: pick(NAMES[severity]),
        asset: pick(ASSETS),
        provider,
        account,
        status: weighted<Status>([["open", 60], ["inProgress", 15], ["resolved", 15], ["ignored", 10]]),
        ageHours: 1 + Math.floor(rnd() * 719),
        ticket: rnd() < 0.3 ? `SEC-${1000 + out.length}` : undefined,
      });
    }
  });
  return out;
}

export const FINDINGS: Finding[] = mockFindings();

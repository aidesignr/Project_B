// Finding detail drawer content (canvas "Findings page", page "Finding detail"). Everything here is
// scan data from the finding and asset records (D-066), so it stays untranslated; labels around it
// come from react-intl. One sample record stands in until the finding detail API is wired.
import type { Finding } from "./data";

export type PathNode = { type: string; name: string; detail: string; edge?: string; current?: boolean };
export type Remediation = { title: string; lines: string[] };
export type LogEntry = { kind: "failed" | "slaBreached" | "discovered"; at: string; text: string };

export type FindingDetail = {
  id: string;
  issue: string;
  description: string;
  solution: string;
  docsUrl: string;
  sla: { dueOn: string; overdueDays: number; windowDays: number };
  exploitAvailable: boolean;
  openDays: number;
  tickets: number;
  discoveredOn: string;
  lastSeenOn: string;
  lastFixedOn?: string;
  frameworks: string[];
  controls: { id: string; name: string }[];
  controlCount: number;
  asset: { resourceId: string; type: string; category: string; cloud: string; accountId: string; region: string; label: string };
  tags: string[];
  path: PathNode[];
  /** Text summary of the attack path (the graph's figcaption). */
  pathSummary: string;
  remediation: Remediation[];
  log: LogEntry[];
  raw: { finding: string[]; findingTotal: number; asset: string[]; assetTotal: number };
};

/** The finding the canvas was designed around (IAM User Admins: global). */
export const SAMPLE_FINDING: Finding = {
  id: "FND-2663e59a",
  severity: "high",
  score: 78,
  name: "IAM User Admins: global",
  asset: "salman.pj@accuknox.com",
  provider: "aws",
  account: "AccuKnox",
  status: "open",
  ageHours: 122 * 24,
};

export const SAMPLE_DETAIL: FindingDetail = {
  id: "2663e59a-f0f2-40f6-bfa8-d005bcbc7c63",
  issue: "salman.pj@accuknox.com is one of 15 IAM user admins; the expected maximum is 2.",
  description: "Ensures the number of IAM admins in the account is minimized. At least two IAM admin users should exist, but the total should be kept to a minimum.",
  solution: "Keep two users with admin permissions and give other IAM users more limited permissions.",
  docsUrl: "https://docs.aws.amazon.com/IAM/latest/UserGuide/getting-started_create-admin-group.html",
  sla: { dueOn: "2026-07-13", overdueDays: 92, windowDays: 30 },
  exploitAvailable: false,
  openDays: 122,
  tickets: 0,
  discoveredOn: "2026-06-13",
  lastSeenOn: "2026-10-13",
  frameworks: [
    "APRA 234 STANDARD", "AWS Architecture Guardrails - Security", "BAIT", "CMMC - Cybersecurity Maturity Model Certification", "CSCRF SEBI",
    "Digital Personal Data Protection (DPDP) Act India", "ISMS-P for AWS", "ISO 27001 - 2013", "ISO 27001 - 2022", "Korean Financial Security Agency Guidelines",
    "MITRE AWS Attack Framework", "NIST 800-171", "NIST CSF", "PCI", "RBI CSF (Cyber Security Framework) for UCBs", "RBI IT Framework Master Direction",
    "SAMA Cyber Security Framework", "SOC 2 Type II", "SOC 3", "VAIT",
  ],
  controls: [
    { id: "1.2", name: "GV.RR: Roles, responsibilities, and authorities" },
    { id: "10.2.1", name: "User registration and provisioning" },
    { id: "10.2.2", name: "Control of admin and special permissions" },
    { id: "2.5.1", name: "Management of user accounts" },
    { id: "3.1", name: "PR.AA: Identity management, authentication, and access control" },
    { id: "3.1(c)", name: "Role-based access control" },
  ],
  controlCount: 30,
  asset: {
    resourceId: "arn:aws:iam::143825259535:user/salman.pj@accuknox.com",
    type: "aws_iam_user",
    category: "IAM",
    cloud: "AWS · AccuKnox",
    accountId: "143825259535",
    region: "global",
    label: "onpremimage",
  },
  tags: [],
  path: [
    { type: "Exposure", name: "AWS Management Console", detail: "Console sign-in enabled" },
    { type: "IAM user", name: "salman.pj@accuknox.com", detail: "1 of 15 admins", edge: "signs in as", current: true },
    { type: "IAM policy", name: "AdministratorAccess", detail: "Allows *:* on *", edge: "has policy" },
    { type: "AWS account", name: "143825259535", detail: "AccuKnox", edge: "controls" },
  ],
  pathSummary: "If this user's console password leaks, an attacker can sign in to the AWS Management Console as salman.pj@accuknox.com and, through the attached AdministratorAccess policy, control every resource in account 143825259535.",
  remediation: [
    { title: "Review current IAM admins", lines: ["Sign in to the AWS Management Console.", "Go to the IAM section.", "Find every user with the AdministratorAccess policy or similar permissions."] },
    { title: "Limit admin user accounts", lines: ["Keep at least two IAM admin users for redundancy.", "Check whether each admin's permissions are needed. If several admins share duties, consider consolidating roles."] },
    { title: "Use IAM roles", lines: ["Replace static IAM admin users with IAM roles where possible.", "Use AWS IAM Identity Center (formerly AWS Single Sign-On) for temporary administrator access."] },
    { title: "Turn on multi-factor authentication (MFA)", lines: ["Require MFA for every IAM user with admin privileges."] },
    { title: "Apply least privilege", lines: ["Audit and tailor the permissions for each role."] },
  ],
  log: [
    { kind: "failed", at: "2026-10-13T02:45:00Z", text: "Issue still present on salman.pj@accuknox.com." },
    { kind: "slaBreached", at: "2026-07-13T05:22:00Z", text: "The 30-day remediation window ended." },
    { kind: "discovered", at: "2026-06-13T05:22:00Z", text: "Detected on salman.pj@accuknox.com in AWS cloud account 143825259535." },
  ],
  raw: {
    findingTotal: 96,
    finding: [
      "{",
      '  "id": "2663e59a-f0f2-40f6-bfa8-d005bcbc7c63",',
      '  "date_discovered": "2026-06-13T05:22:22.851256Z",',
      '  "last_seen": "2026-10-13T02:45:12.515649Z",',
      '  "vulnerability": {',
      '    "id": "da2f5daf-d2b2-4750-8954-f4ca5e74f1bf",',
      '    "name": "IAM User Admins: global",',
      '    "risk_factor": "High",',
      '    "origin_risk_factor": "High",',
      '    "description": "Ensures the number of IAM admins in the account are minimized",',
      '    "solution": "Keep two users with admin permissions but ensure other IAM users have more limited permissions., http://docs.aws.amazon.com/IAM/latest/UserGuide/getting-started_create-admin-group.html",',
      '    "identification_numbers": [],',
      '    "references": [],',
      '    "cvss_score": null,',
      '    "exploit_available": false,',
      '    "tags": [],',
      '    "misc": {',
      '      "compliance": [',
      '        "APRA 234 STANDARD",',
      '        "AWS Architecture Guardrails - Security",',
      '        "BAIT",',
      '        "CMMC - Cybersecurity Maturity Model Certification",',
      '        "CSCRF SEBI",',
      '        "Digital Personal Data Protection (DPDP) Act India",',
      '        "ISMS-P for AWS",',
      '        "ISO 27001 - 2013",',
      '        "ISO 27001 - 2022",',
      '        "Korean Financial Security Agency Guidelines",',
      '        "MITRE AWS Attack Framework",',
      '        "NIST 800-171",',
    ],
    assetTotal: 34,
    asset: [
      "{",
      '  "id": "0b1e03e0-e920-4c59-8f3f-acb1b3eca98b",',
      '  "name": "salman.pj@accuknox.com",',
      '  "type": {',
      '    "id": "405d127c-91ff-4811-b80f-39effd66bef9",',
      '    "name": "aws_iam_user",',
      '    "category": "IAM",',
      '    "alias": [',
      '      "aws_iam_user",',
      '      "aws_iam_access_key",',
      '      "aws_iam_policy",',
      '      "aws_iam_role",',
      '      "aws_iam_group"',
      "    ]",
      "  },",
      '  "label": "onpremimage",',
      '  "namespace": null,',
      '  "cluster": null,',
      '  "host_ip": null,',
      '  "host_name": null,',
      '  "collector_name": null,',
      '  "manifest": "{}",',
      '  "resource_id": "arn:aws:iam::143825259535:user/salman.pj@accuknox.com",',
      '  "region": {',
      '    "name": "us-east-1",',
      '    "display_name": "US East (N. Virginia)"',
      "  },",
      '  "cloud_account": {',
      '    "id": "143825259535",',
      '    "name": "AccuKnox",',
      '    "provider": "aws"',
      "  },",
      '  "tags": []',
      "}",
    ],
  },
};

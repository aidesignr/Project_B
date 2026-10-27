// XBOM › Projects model (canvas "XBOM · Projects", D-069): filter definitions and seeded mock
// projects until the XBOM API is wired. Project names, tags and owners are data; classifier
// names are labels (`xbom.classifier.*`).
import type { FilterDef } from "@/components/findings/data";

/** CycloneDX component types, in the spec's order. */
export const CLASSIFIERS = [
  "application", "framework", "library", "container", "platform", "operatingSystem",
  "device", "firmware", "file", "mlModel", "data",
] as const;
export type Classifier = (typeof CLASSIFIERS)[number];

export type Project = {
  id: string;
  name: string;
  classifier: Classifier;
  tags: string[];
  bomFiles: number;
  owner: string;
  description: string;
};

export const PROJECTS: Project[] = [
  { id: "p1", name: "payments-api", classifier: "application", tags: ["production", "pci", "payments"], bomFiles: 12, owner: "Priya Raman", description: "Card payment and refund service behind checkout" },
  { id: "p2", name: "web-storefront", classifier: "application", tags: ["production", "frontend"], bomFiles: 8, owner: "Daniel Okafor", description: "Customer-facing web store and account pages" },
  { id: "p3", name: "auth-service", classifier: "application", tags: ["production", "identity"], bomFiles: 6, owner: "Mei Tanaka", description: "Sign-in, sessions and token issuing for every app" },
  { id: "p4", name: "base-images", classifier: "container", tags: ["production", "platform", "golden-image"], bomFiles: 24, owner: "Lucas Moreau", description: "Hardened base images that every service builds on" },
  { id: "p5", name: "fraud-scoring-model", classifier: "mlModel", tags: ["ai", "risk"], bomFiles: 3, owner: "Aisha Khan", description: "Model that scores card transactions for fraud risk" },
  { id: "p6", name: "shared-ui-kit", classifier: "library", tags: ["frontend", "design-system"], bomFiles: 4, owner: "Daniel Okafor", description: "React components shared by the web apps" },
  { id: "p7", name: "k8s-platform", classifier: "platform", tags: ["platform", "kubernetes", "eu-west-1"], bomFiles: 15, owner: "Lucas Moreau", description: "EKS clusters, add-ons and admission controllers" },
  { id: "p8", name: "edge-gateway", classifier: "firmware", tags: ["iot", "edge"], bomFiles: 2, owner: "Sven Larsen", description: "Firmware for the in-store payment gateway devices" },
  { id: "p9", name: "data-pipeline", classifier: "application", tags: ["staging", "data"], bomFiles: 9, owner: "Priya Raman", description: "Nightly ETL jobs that feed the analytics warehouse" },
  { id: "p10", name: "telemetry-agent", classifier: "library", tags: ["observability"], bomFiles: 1, owner: "Mei Tanaka", description: "Agent that ships logs and metrics from every node" },
];

const ALL_TAGS = [...new Set(PROJECTS.flatMap((p) => p.tags))].sort();

const list = { kind: "list", multi: true, ops: true, search: true, tabs: true, selectAll: true, unselectAll: true } as const;

/** Both filters are static (always on the page); Tags can create values from search (10-filters). */
export const PROJECT_FILTERS = {
  classifier: { id: "classifier", ...list, values: CLASSIFIERS.map((id) => ({ id, labelKey: `xbom.classifier.${id}` })) },
  tags: { id: "tags", ...list, create: true, values: ALL_TAGS.map((id) => ({ id, label: id })) },
} satisfies Record<string, FilterDef>;

export type ProjectColumnId = "name" | "classifier" | "tags" | "bomFiles" | "owner" | "description";
export const PROJECT_COLUMNS: { id: ProjectColumnId; locked?: boolean; className: string }[] = [
  { id: "name", locked: true, className: "w-50" },
  { id: "classifier", className: "w-42" },
  { id: "tags", className: "w-50" },
  { id: "bomFiles", className: "w-28" },
  { id: "owner", className: "w-42" },
  { id: "description", className: "" },
];

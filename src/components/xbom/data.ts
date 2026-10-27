// XBOM › Projects model (canvas "XBOM · Projects", D-069): filter definitions and 36 fixed mock
// projects (every classifier, 12 owners; D-070 asks for ≥30 rows) until the XBOM API is wired.
// Project names, tags and owners are data; classifier names are labels (`xbom.classifier.*`).
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
  { id: "p11", name: "checkout-ui", classifier: "application", tags: ["production", "frontend", "pci"], bomFiles: 7, owner: "Sofia Rossi", description: "Checkout pages and payment form for web and mobile" },
  { id: "p12", name: "order-service", classifier: "application", tags: ["production", "orders"], bomFiles: 10, owner: "Omar Haddad", description: "Order creation, status updates and refunds" },
  { id: "p13", name: "inventory-sync", classifier: "application", tags: ["staging", "orders"], bomFiles: 5, owner: "Kenji Watanabe", description: "Keeps store stock levels in sync with the warehouse" },
  { id: "p14", name: "spring-commons", classifier: "framework", tags: ["backend", "java"], bomFiles: 6, owner: "Elena Petrova", description: "Shared Spring Boot setup used by Java services" },
  { id: "p15", name: "react-app-shell", classifier: "framework", tags: ["frontend"], bomFiles: 3, owner: "Daniel Okafor", description: "App frame, routing and auth used by the web apps" },
  { id: "p16", name: "crypto-utils", classifier: "library", tags: ["security", "pci"], bomFiles: 2, owner: "Fatima Zahra", description: "Encryption and signing helpers for card data" },
  { id: "p17", name: "api-client-sdk", classifier: "library", tags: ["sdk", "partners"], bomFiles: 4, owner: "Noah Williams", description: "Typed client library shipped to partner developers" },
  { id: "p18", name: "node-runtime-image", classifier: "container", tags: ["platform", "golden-image"], bomFiles: 11, owner: "Lucas Moreau", description: "Node.js runtime image for every JavaScript service" },
  { id: "p19", name: "nginx-ingress", classifier: "container", tags: ["production", "kubernetes", "edge"], bomFiles: 8, owner: "Elena Petrova", description: "Ingress controller image for the production clusters" },
  { id: "p20", name: "python-ml-base", classifier: "container", tags: ["ai", "golden-image"], bomFiles: 9, owner: "Aisha Khan", description: "Python and CUDA base image for training jobs" },
  { id: "p21", name: "gke-analytics", classifier: "platform", tags: ["gcp", "kubernetes", "data"], bomFiles: 13, owner: "Kenji Watanabe", description: "GKE clusters that run the analytics workloads" },
  { id: "p22", name: "service-mesh", classifier: "platform", tags: ["production", "kubernetes"], bomFiles: 7, owner: "Omar Haddad", description: "Istio control plane and sidecar configuration" },
  { id: "p23", name: "hardened-ubuntu", classifier: "operatingSystem", tags: ["golden-image", "cis"], bomFiles: 5, owner: "Lucas Moreau", description: "CIS-hardened Ubuntu image for VMs and nodes" },
  { id: "p24", name: "bottlerocket-nodes", classifier: "operatingSystem", tags: ["kubernetes", "eu-west-1"], bomFiles: 3, owner: "Sven Larsen", description: "Container-optimised OS for the EKS worker nodes" },
  { id: "p25", name: "pos-terminal", classifier: "device", tags: ["iot", "retail"], bomFiles: 4, owner: "Sven Larsen", description: "Point-of-sale terminals in every store" },
  { id: "p26", name: "warehouse-scanner", classifier: "device", tags: ["iot", "orders"], bomFiles: 2, owner: "Noah Williams", description: "Handheld scanners used for picking and packing" },
  { id: "p27", name: "camera-firmware", classifier: "firmware", tags: ["iot", "edge"], bomFiles: 3, owner: "Fatima Zahra", description: "Firmware for the in-store security cameras" },
  { id: "p28", name: "terraform-modules", classifier: "file", tags: ["infrastructure", "platform"], bomFiles: 6, owner: "Elena Petrova", description: "Terraform modules that build every cloud account" },
  { id: "p29", name: "helm-charts", classifier: "file", tags: ["kubernetes", "platform"], bomFiles: 8, owner: "Omar Haddad", description: "Helm charts used to deploy services to the clusters" },
  { id: "p30", name: "recommendation-model", classifier: "mlModel", tags: ["ai", "production"], bomFiles: 4, owner: "Aisha Khan", description: "Model that suggests products on the storefront" },
  { id: "p31", name: "support-chatbot-llm", classifier: "mlModel", tags: ["ai", "customer-facing"], bomFiles: 5, owner: "Sofia Rossi", description: "Language model behind the customer support chat" },
  { id: "p32", name: "customer-360-dataset", classifier: "data", tags: ["data", "pii"], bomFiles: 2, owner: "Kenji Watanabe", description: "Joined customer profile data for analytics" },
  { id: "p33", name: "fraud-training-data", classifier: "data", tags: ["ai", "risk", "pii"], bomFiles: 3, owner: "Aisha Khan", description: "Labelled transactions used to train the fraud model" },
  { id: "p34", name: "notification-service", classifier: "application", tags: ["production", "messaging"], bomFiles: 6, owner: "Noah Williams", description: "Sends email, SMS and push notifications" },
  { id: "p35", name: "search-indexer", classifier: "application", tags: ["staging", "search"], bomFiles: 5, owner: "Sofia Rossi", description: "Builds the product search index every hour" },
  { id: "p36", name: "audit-log-library", classifier: "library", tags: ["security", "observability"], bomFiles: 1, owner: "Fatima Zahra", description: "Writes tamper-evident audit events from any service" },
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
  { id: "classifier", className: "w-52" },
  { id: "tags", className: "w-50" },
  { id: "bomFiles", className: "w-28" },
  { id: "owner", className: "w-42" },
  { id: "description", className: "" },
];

import { useState, type ReactNode } from "react";
import { useIntl } from "react-intl";
import {
  BotIcon,
  BoxIcon,
  Building2Icon,
  ChevronRightIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  CircleHelpIcon,
  CircleUserRoundIcon,
  CircleXIcon,
  ClockIcon,
  CloudIcon,
  CopyIcon,
  ExternalLinkIcon,
  EyeOffIcon,
  FilePlusIcon,
  FileTextIcon,
  FolderIcon,
  GlobeIcon,
  HashIcon,
  LinkIcon,
  RefreshCwIcon,
  SearchIcon,
  ShieldCheckIcon,
  TagIcon,
  TicketIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react";
import { useT } from "@/i18n/useT";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Finding } from "./data";
import { SAMPLE_DETAIL, type FindingDetail } from "./detail";
import { SEVERITY_ICON, SEVERITY_ON, SEVERITY_TEXT, STATUS_ICON, STATUS_TEXT } from "./parts";

export type DrawerTab = "overview" | "graph" | "remediation" | "log" | "raw";
export type DrawerState = "ready" | "loading" | "error";
type Toast = "ignored" | "link" | "id" | "json";

const TABS: DrawerTab[] = ["overview", "graph", "remediation", "log", "raw"];
const parseDay = (v: string) => { const [y, m, d] = v.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };

/** Best-effort clipboard write; the toast confirms either way, as the value is also on screen. */
const copy = (text: string) => { try { void navigator.clipboard?.writeText(text); } catch { /* clipboard blocked */ } };

/**
 * Finding detail drawer (canvas "Findings page", page "Finding detail"; D-066). Opens over the list
 * from a finding name: 960px modal sheet from the inline-end side, focus trapped and returned on
 * close. Header: type and asset caption, the finding name as the title, actions. Tabs: Overview,
 * Security graph (attack path with a list view), Remediation, Status log, Raw data. Every value
 * comes from the finding and asset records; nothing here is AI-generated.
 */
export function FindingDrawer({
  finding,
  detail = SAMPLE_DETAIL,
  open,
  onOpenChange,
  defaultTab = "overview",
  defaultGraphView = "graph",
  defaultRaw = "finding",
  state = "ready",
  defaultToast,
  onRetry,
  returnFocusTo,
}: {
  finding: Finding;
  /** The control that opened the drawer; focus goes back to it on close (it isn't a Radix trigger). */
  returnFocusTo?: HTMLElement | null;
  detail?: FindingDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: DrawerTab;
  defaultGraphView?: "graph" | "list";
  defaultRaw?: "finding" | "asset";
  state?: DrawerState;
  defaultToast?: Toast;
  onRetry?: () => void;
}) {
  const t = useT();
  const [tab, setTab] = useState<DrawerTab>(defaultTab);
  const [ignored, setIgnored] = useState(defaultToast === "ignored");
  const [toast, setToast] = useState<Toast | undefined>(defaultToast);
  const SevIcon = SEVERITY_ICON[finding.severity];

  const ignore = () => { setIgnored(true); setToast("ignored"); };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        data-slot="finding-drawer"
        className="w-240"
        onCloseAutoFocus={(e) => { if (returnFocusTo?.isConnected) { e.preventDefault(); returnFocusTo.focus(); } }}
      >
        {/* Header */}
        <div className="relative shrink-0 px-6 pt-5">
          <SheetClose asChild>
            <Button variant="ghost" size="icon" aria-label={t("findingDetail.close")} className="absolute end-4 top-4"><XIcon aria-hidden /></Button>
          </SheetClose>
          <div className="flex items-center gap-2 pe-12 text-xs">
            <span className="inline-flex h-6 items-center gap-1 rounded-sm bg-muted px-2 font-medium"><CloudIcon className="size-3" aria-hidden />{t("findings.scan.cloud")}</span>
            <span className="inline-flex min-w-0 items-center gap-1 text-muted-foreground">
              <CloudIcon className="size-4 shrink-0" aria-hidden />
              <span className="sr-only">{t("findingDetail.assetPrefix")}</span>
              <bdi className="truncate text-foreground">{finding.asset}</bdi>
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <SheetTitle className="text-2xl font-semibold">{finding.name}</SheetTitle>
            <span className={cn("inline-flex h-6 items-center gap-1 rounded-sm border px-2 text-xs font-medium", SEVERITY_ON[finding.severity])}>
              <SevIcon className={cn("size-3", SEVERITY_TEXT[finding.severity])} aria-hidden />
              <span className="sr-only">{t("findingDetail.severityPrefix")}</span>{t(`findings.severity.${finding.severity}`)}
            </span>
          </div>
          <SheetDescription className="sr-only">{t("findingDetail.description")}</SheetDescription>
          <div role="toolbar" aria-label={t("findingDetail.actions")} className="mt-4 flex flex-wrap items-center gap-2">
            <Button className="bg-info-muted text-info-foreground hover:bg-info-muted/80"><BotIcon aria-hidden />{t("shell.askai.label")}</Button>
            <Button variant="outline"><TicketIcon className="text-muted-foreground" aria-hidden />{t("findings.bulk.ticket")}</Button>
            <Button variant="outline" data-slot="drawer-ignore" aria-pressed={ignored} onClick={ignore}><EyeOffIcon className="text-muted-foreground" aria-hidden />{t("findings.bulk.ignore")}</Button>
            <Button variant="outline"><FilePlusIcon className="text-muted-foreground" aria-hidden />{t("findings.createRule")}</Button>
            <div aria-hidden className="mx-1 h-6 w-px bg-border" />
            <IconAction icon={LinkIcon} label={t("findingDetail.copyLink")} slot="copy-link" onClick={() => { copy(window.location.href); setToast("link"); }} />
            <IconAction icon={CopyIcon} label={t("findingDetail.copyId")} slot="copy-id" onClick={() => { copy(detail.id); setToast("id"); }} />
            <Button variant="link" size="sm" className="ms-auto gap-1 text-xs"><CircleHelpIcon aria-hidden />{t("findings.row.why")}</Button>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as DrawerTab)} className="mt-4 flex min-h-0 flex-1 flex-col">
          <TabsList aria-label={t("findingDetail.tabs")} className="shrink-0 px-3">
            {TABS.map((id) => <TabsTrigger key={id} value={id}>{t(`findingDetail.tab.${id}`)}</TabsTrigger>)}
          </TabsList>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {/* Every tab keeps its panel (each tab's aria-controls must resolve); loading and error render inside it. */}
            {TABS.map((id) => (
              <TabsContent key={id} value={id} className={cn(id === "raw" && state === "ready" && "h-full")}>
                {state === "loading" ? <Loading /> : state === "error" ? <LoadError onRetry={onRetry} /> : (
                  {
                    overview: <Overview finding={finding} detail={detail} ignored={ignored} onRemediation={() => setTab("remediation")} onRaw={() => setTab("raw")} />,
                    graph: <SecurityGraph detail={detail} defaultView={defaultGraphView} />,
                    remediation: <RemediationTab detail={detail} />,
                    log: <StatusLog detail={detail} />,
                    raw: <RawData detail={detail} defaultRaw={defaultRaw} onCopied={() => setToast("json")} />,
                  }[id]
                )}
              </TabsContent>
            ))}
          </div>
        </Tabs>

        {toast && (
          <div data-slot="drawer-toast" role="status" className="absolute inset-x-0 bottom-6 z-10 mx-auto flex min-h-12 w-fit items-center gap-3 rounded-xl border border-border bg-popover py-2 ps-4 pe-2 whitespace-nowrap shadow-3">
            <CircleCheckIcon className="size-4 text-success-foreground" aria-hidden />
            <span>{t(`findingDetail.toast.${toast}`)}</span>
            {toast === "ignored" && <Button variant="outline" onClick={() => { setIgnored(false); setToast(undefined); }}>{t("shell.notifications.undo")}</Button>}
            <Button variant="ghost" size="icon" aria-label={t("findingDetail.toast.dismiss")} onClick={() => setToast(undefined)}><XIcon aria-hidden /></Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function IconAction({ icon: Icon, label, slot, onClick }: { icon: LucideIcon; label: string; slot: string; onClick: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon" data-slot={slot} aria-label={label} onClick={onClick}><Icon className="text-muted-foreground" aria-hidden /></Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

const H3 = ({ id, children }: { id?: string; children: ReactNode }) => <h3 id={id} className="text-base font-semibold">{children}</h3>;

/* ---------- Overview ---------- */

function Overview({ finding, detail, ignored, onRemediation, onRaw }: { finding: Finding; detail: FindingDetail; ignored: boolean; onRemediation: () => void; onRaw: () => void }) {
  const t = useT();
  const intl = useIntl();
  const day = (v: string) => intl.formatDate(parseDay(v), { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
  const status = ignored ? "ignored" : finding.status;
  const StatusIcon = STATUS_ICON[status];
  const SevIcon = SEVERITY_ICON[finding.severity];
  const assetRows: [LucideIcon, string, ReactNode, boolean?][] = [
    [CircleUserRoundIcon, t("findingDetail.asset.name"), finding.asset],
    [BoxIcon, t("findingDetail.asset.type"), detail.asset.type, true],
    [HashIcon, t("findingDetail.asset.resourceId"), detail.asset.resourceId, true],
    [FolderIcon, t("findingDetail.asset.category"), detail.asset.category],
    [CloudIcon, t("findingDetail.asset.cloud"), detail.asset.cloud],
    [Building2Icon, t("findingDetail.asset.accountId"), detail.asset.accountId, true],
    [GlobeIcon, t("findingDetail.asset.region"), detail.asset.region],
    [TagIcon, t("findingDetail.asset.label"), detail.asset.label],
  ];
  const details: [string, ReactNode][] = [
    [t("findingDetail.details.status"), <span className={cn("inline-flex items-center gap-1", STATUS_TEXT[status])}><StatusIcon className="size-4" aria-hidden />{t(`findings.status.${status}`)}</span>],
    [t("findingDetail.details.severity"), <span className={cn("inline-flex items-center gap-1", SEVERITY_TEXT[finding.severity])}><SevIcon className="size-4" aria-hidden />{t(`findings.severity.${finding.severity}`)}</span>],
    [t("findingDetail.details.discovered"), day(detail.discoveredOn)],
    [t("findingDetail.details.lastSeen"), day(detail.lastSeenOn)],
    [t("findingDetail.details.lastFixed"), detail.lastFixedOn ? day(detail.lastFixedOn) : <><span aria-hidden>—</span><span className="sr-only">{t("findingDetail.never")}</span></>],
    [t("findingDetail.details.age"), t("findingDetail.days", { count: detail.openDays })],
    [t("findingDetail.details.slaDue"), <>{day(detail.sla.dueOn)}{detail.sla.overdueDays > 0 && <> · <span className="font-medium text-error-foreground">{t("findingDetail.overdue")}</span></>}</>],
    [t("findingDetail.details.tickets"), intl.formatNumber(detail.tickets)],
    [t("findingDetail.details.ignored"), t(ignored ? "findings.value.yes" : "findings.value.no")],
  ];

  return (
    <div className="flex min-h-full">
      <div className="flex min-w-0 flex-1 flex-col gap-8 p-6">
        <section aria-labelledby="fd-story" className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2"><FileTextIcon className="size-5 text-muted-foreground" aria-hidden /><H3 id="fd-story">{t("findingDetail.story.title")}</H3></div>
          <dl className="grid grid-cols-[120px_minmax(0,1fr)] gap-x-4 gap-y-2">
            <dt className="text-muted-foreground">{t("findingDetail.story.issue")}</dt>
            <dd>
              {detail.issue}{" "}
              <span className="inline-flex h-5 items-center gap-1 rounded-sm border border-error-border bg-error-muted px-1 align-middle text-xs font-medium text-error-foreground">
                <CircleXIcon className="size-3" aria-hidden />{t("findingDetail.story.failed")}
              </span>
            </dd>
            <dt className="text-muted-foreground">{t("findingDetail.story.description")}</dt>
            <dd>{detail.description}</dd>
            <dt className="text-muted-foreground">{t("findingDetail.story.solution")}</dt>
            <dd>{detail.solution}</dd>
            <dt className="text-muted-foreground">{t("findingDetail.story.fix")}</dt>
            <dd><Button variant="link" className="gap-1" onClick={onRemediation}>{t("findingDetail.story.goRemediation")}<ChevronRightIcon className="rtl:-scale-x-100" aria-hidden /></Button></dd>
          </dl>
          <p className="border-t border-border pt-3 text-xs text-muted-foreground">
            {t("findingDetail.story.source")}{" "}
            <Button variant="link" size="sm" className="text-xs" onClick={onRaw}>{t("findingDetail.story.viewRaw")}</Button>
          </p>
        </section>

        <section aria-labelledby="fd-intel" className="flex flex-col gap-3">
          <H3 id="fd-intel">{t("findingDetail.intel.title")}</H3>
          <div className="grid grid-cols-3 gap-3">
            <Tile label={t("findingDetail.intel.sla")} sub={t("findingDetail.intel.slaSub", { date: day(detail.sla.dueOn), days: detail.sla.windowDays })}>
              <span className="inline-flex items-center gap-1 text-error-foreground"><ClockIcon className="size-4" aria-hidden />{t("findingDetail.intel.overdueBy", { count: detail.sla.overdueDays })}</span>
            </Tile>
            <Tile label={t("findingDetail.intel.exploit")} sub={t("findingDetail.intel.cvssNa")}>
              <span className="inline-flex items-center gap-1">
                {detail.exploitAvailable ? <CircleAlertIcon className="size-4 text-error-foreground" aria-hidden /> : <ShieldCheckIcon className="size-4 text-success-foreground" aria-hidden />}
                {t(detail.exploitAvailable ? "findings.value.yes" : "findings.value.no")}
              </span>
            </Tile>
            <Tile label={t("findingDetail.intel.persistence")} sub={t("findingDetail.intel.persistenceSub", { count: detail.tickets })}>
              {t("findingDetail.intel.openDays", { count: detail.openDays })}
            </Tile>
          </div>
        </section>

        <section aria-labelledby="fd-comp" className="flex flex-col gap-3">
          <div className="flex items-baseline gap-2">
            <H3 id="fd-comp">{t("findingDetail.compliance.title")}</H3>
            <span className="text-xs text-muted-foreground">{t("findingDetail.compliance.count", { frameworks: detail.frameworks.length, controls: detail.controlCount })}</span>
          </div>
          <ul aria-label={t("findingDetail.compliance.frameworks")} className="flex flex-wrap gap-2">
            {detail.frameworks.map((f) => <li key={f} className="inline-flex h-7 items-center rounded-sm border border-control-border px-2 text-xs">{f}</li>)}
          </ul>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full border-collapse">
              <caption className="sr-only">{t("findingDetail.compliance.caption", { shown: detail.controls.length, total: detail.controlCount })}</caption>
              <thead className="sr-only"><tr><th scope="col">{t("findingDetail.compliance.controlId")}</th><th scope="col">{t("findingDetail.compliance.control")}</th></tr></thead>
              <tbody>
                {detail.controls.map((c) => (
                  <tr key={c.id} className="h-9 border-b border-border">
                    <td className="w-26 px-4 font-mono text-xs text-muted-foreground"><bdi>{c.id}</bdi></td>
                    <td className="px-4">{c.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3"><Button variant="link">{t("findingDetail.compliance.showAll", { count: detail.controlCount })}</Button></div>
          </div>
        </section>

        <section aria-labelledby="fd-asset" className="flex flex-col gap-3">
          <H3 id="fd-asset">{t("findingDetail.asset.title")}</H3>
          <dl className="grid grid-cols-[136px_minmax(0,1fr)_136px_minmax(0,1fr)] gap-x-4 gap-y-3">
            {assetRows.map(([Icon, label, value, mono]) => (
              <div key={label} className="contents">
                <dt className="flex h-5 items-center gap-2 text-muted-foreground"><Icon className="size-4" aria-hidden />{label}</dt>
                <dd className={cn("min-w-0 break-all", mono && "font-mono text-xs leading-5")}><bdi>{value}</bdi></dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="fd-tags" className="flex flex-col gap-2">
          <H3 id="fd-tags">{t("findingDetail.tags.title")}</H3>
          {detail.tags.length ? (
            <ul className="flex flex-wrap gap-2">{detail.tags.map((g) => <li key={g} className="inline-flex h-7 items-center rounded-sm border border-control-border px-2 text-xs"><bdi>{g}</bdi></li>)}</ul>
          ) : <p className="text-muted-foreground">{t("findingDetail.tags.none")}</p>}
        </section>
      </div>

      <aside aria-label={t("findingDetail.side")} className="flex w-70 shrink-0 flex-col gap-8 border-s border-border p-6">
        <section aria-labelledby="fd-details" className="flex flex-col gap-3">
          <H3 id="fd-details">{t("findingDetail.details.title")}</H3>
          <dl className="grid grid-cols-[96px_minmax(0,1fr)] gap-x-2 gap-y-3">
            {details.map(([label, value]) => (
              <div key={label} className="contents"><dt className="text-muted-foreground">{label}</dt><dd>{value}</dd></div>
            ))}
          </dl>
        </section>
        <Comments />
      </aside>
    </div>
  );
}

function Tile({ label, sub, children }: { label: string; sub: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-card px-4 py-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-base font-semibold">{children}</span>
      <span className="text-xs text-muted-foreground">{sub}</span>
    </div>
  );
}

function Comments() {
  const t = useT();
  const [text, setText] = useState("");
  return (
    <section aria-labelledby="fd-comments" className="flex flex-col gap-3">
      <H3 id="fd-comments">{t("findingDetail.comments.title")}</H3>
      <label htmlFor="fd-comment" className="sr-only">{t("findingDetail.comments.add")}</label>
      <textarea
        id="fd-comment"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("findingDetail.comments.add")}
        className="min-h-22 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      />
      <Button className="self-start" disabled={!text.trim()}>{t("findingDetail.comments.post")}</Button>
      <p className="text-xs text-muted-foreground">{t("findingDetail.comments.none")}</p>
    </section>
  );
}

/* ---------- Security graph ---------- */

function SecurityGraph({ detail, defaultView }: { detail: FindingDetail; defaultView: "graph" | "list" }) {
  const t = useT();
  const [view, setView] = useState(defaultView);
  const steps = detail.path.length;
  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center gap-3">
        <H3>{t("findingDetail.graph.title")}</H3>
        <span className="text-xs text-muted-foreground">{t("findingDetail.graph.steps", { count: steps })}</span>
        <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v as "graph" | "list")} aria-label={t("findingDetail.graph.view")} className="ms-auto border-0 bg-muted">
          <ToggleGroupItem value="graph" className="h-6 w-auto px-3 font-medium data-[state=on]:bg-background">{t("findingDetail.graph.graph")}</ToggleGroupItem>
          <ToggleGroupItem value="list" className="h-6 w-auto px-3 font-medium data-[state=on]:bg-background">{t("findingDetail.graph.list")}</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <figure data-slot="attack-path" data-view={view} className="m-0 flex flex-col gap-3">
        {view === "graph" ? (
          <>
            <div aria-hidden className="flex items-center rounded-xl border border-border bg-graph-canvas px-6 py-12">
              {detail.path.map((n, i) => (
                <div key={n.name} className={cn("flex items-center", i > 0 && "min-w-0 flex-1")}>
                  {i > 0 && (
                    <div className="flex min-w-10 flex-1 flex-col items-center gap-1 px-1">
                      <span className="text-xs text-muted-foreground">{n.edge}</span>
                      <span className="flex w-full items-center"><span className="flex-1 border-t-2 border-graph-edge-attack" /><ChevronRightIcon className="-ms-2 size-4 text-graph-edge-attack rtl:-scale-x-100" /></span>
                    </div>
                  )}
                  <div className={cn("flex w-44 shrink-0 flex-col gap-1 rounded-xl border bg-graph-node p-3 text-graph-node-foreground", n.current ? "border-2 border-graph-node-selected" : "border-graph-node-border")}>
                    <span className="text-xs text-muted-foreground">{n.type}</span>
                    <bdi className="font-semibold break-all">{n.name}</bdi>
                    <span className="text-xs text-muted-foreground">{n.detail}</span>
                    {n.current && <span className="mt-1 inline-flex h-5 self-start items-center rounded-sm bg-info-muted px-1 text-xs font-medium text-link">{t("findingDetail.graph.thisFinding")}</span>}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><span aria-hidden className="w-6 border-t-2 border-graph-edge-attack" />{t("findingDetail.graph.legend")}</div>
          </>
        ) : (
          <ol aria-label={t("findingDetail.graph.listLabel")} className="flex flex-col gap-2">
            {detail.path.map((n, i) => {
              const next = detail.path[i + 1];
              return (
                <li key={n.name} className="grid grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-border bg-card px-4 py-3">
                  <span className="grid size-6 place-items-center rounded-full bg-info-muted text-xs font-semibold text-link">{i + 1}</span>
                  <span className="flex min-w-0 flex-col"><span className="text-xs text-muted-foreground">{n.type}</span><bdi className="font-semibold">{n.name}</bdi><span className="text-xs text-muted-foreground">{n.detail}</span></span>
                  {next && <span className="text-xs text-muted-foreground">{t("findingDetail.graph.then", { edge: next.edge ?? "", name: next.name })}</span>}
                </li>
              );
            })}
          </ol>
        )}
        <figcaption className="text-muted-foreground">{detail.pathSummary}</figcaption>
      </figure>
    </div>
  );
}

/* ---------- Remediation ---------- */

function RemediationTab({ detail }: { detail: FindingDetail }) {
  const t = useT();
  return (
    <div className="flex max-w-190 flex-col gap-4 p-6">
      <section className="flex flex-col gap-2">
        <H3>{t("findingDetail.remediation.solution")}</H3>
        <p>
          {detail.solution}{" "}
          <a href={detail.docsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-link underline underline-offset-4 hover:no-underline">
            {t("findingDetail.remediation.docs")}<ExternalLinkIcon className="size-3" aria-hidden /><span className="sr-only">{t("shell.help.newTab")}</span>
          </a>
        </p>
      </section>
      <ol aria-label={t("findingDetail.remediation.steps")}>
        {detail.remediation.map((s, i) => (
          <li key={s.title} className="grid grid-cols-[24px_minmax(0,1fr)] gap-4 border-t border-border py-4">
            <span aria-hidden className="grid size-6 place-items-center rounded-full bg-info-muted text-xs font-semibold text-link">{i + 1}</span>
            <div className="flex flex-col gap-1">
              <h4 className="font-semibold">{s.title}</h4>
              {s.lines.map((l) => <p key={l} className="text-muted-foreground">{l}</p>)}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---------- Status log ---------- */

const LOG_ICON: Record<"failed" | "slaBreached" | "discovered", [LucideIcon, string]> = {
  failed: [CircleXIcon, "text-error-foreground"],
  slaBreached: [ClockIcon, "text-error-foreground"],
  discovered: [SearchIcon, "text-info-foreground"],
};

function StatusLog({ detail }: { detail: FindingDetail }) {
  const t = useT();
  const intl = useIntl();
  return (
    <div className="p-6">
      <ol aria-label={t("findingDetail.log.label")}>
        {detail.log.map((e, i) => {
          const [Icon, tone] = LOG_ICON[e.kind];
          const at = new Date(e.at);
          return (
            <li key={e.at} className="relative pb-6 ps-10">
              {i < detail.log.length - 1 && <span aria-hidden className="absolute start-3 top-7 bottom-0 w-px bg-border" />}
              <span className={cn("absolute start-0 top-0 grid size-6 place-items-center rounded-full border border-border bg-background", tone)}><Icon className="size-4" aria-hidden /></span>
              <p className="font-semibold">{t(`findingDetail.log.${e.kind}`)}</p>
              <p className="text-xs text-muted-foreground">
                <time dateTime={e.at}>{t("findingDetail.log.at", {
                  date: intl.formatDate(at, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }),
                  time: intl.formatTime(at, { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "UTC" }),
                })}</time>
              </p>
              <p className="mt-1">{e.text}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ---------- Raw data ---------- */

/** Splits a JSON line into indent, key, value and trailing comma so keys and values can take token colours. */
function tokenize(line: string) {
  const m = line.match(/^(\s*)(?:"([^"]+)":\s)?(.*?)(,?)$/)!;
  const v = m[3];
  const tone = /^"/.test(v) ? "text-link" : /^(null|true|false|-?\d)/.test(v) ? "text-muted-foreground" : "text-foreground";
  return { indent: m[1], key: m[2], value: v, tone, tail: m[4] };
}

function RawData({ detail, defaultRaw, onCopied }: { detail: FindingDetail; defaultRaw: "finding" | "asset"; onCopied: () => void }) {
  const t = useT();
  const [which, setWhich] = useState(defaultRaw);
  const lines = which === "asset" ? detail.raw.asset : detail.raw.finding;
  const total = which === "asset" ? detail.raw.assetTotal : detail.raw.findingTotal;
  return (
    <div className="flex h-full flex-col gap-3 p-6">
      <div className="flex items-center gap-3">
        <ToggleGroup type="single" value={which} onValueChange={(v) => v && setWhich(v as "finding" | "asset")} aria-label={t("findingDetail.raw.record")} className="border-0 bg-muted">
          <ToggleGroupItem value="finding" className="h-6 w-auto px-3 font-medium data-[state=on]:bg-background">{t("findingDetail.raw.finding")}</ToggleGroupItem>
          <ToggleGroupItem value="asset" className="h-6 w-auto px-3 font-medium data-[state=on]:bg-background">{t("findingDetail.raw.asset")}</ToggleGroupItem>
        </ToggleGroup>
        <span className="text-xs text-muted-foreground">{t("findingDetail.raw.lines", { count: total })}</span>
        <Button variant="outline" className="ms-auto" onClick={() => { copy(lines.join("\n")); onCopied(); }}><CopyIcon className="text-muted-foreground" aria-hidden />{t("findingDetail.raw.copy")}</Button>
      </div>
      <div
        data-slot="raw-json"
        role="region"
        aria-label={t(which === "asset" ? "findingDetail.raw.assetJson" : "findingDetail.raw.findingJson")}
        tabIndex={0}
        dir="ltr"
        className="min-h-0 flex-1 overflow-auto rounded-xl border border-border bg-card py-3 font-mono text-xs leading-5 outline-none focus-visible:outline-2 focus-visible:outline-ring"
      >
        {lines.map((line, i) => {
          const tk = tokenize(line);
          return (
            <div key={i} className="flex gap-4 pe-4">
              <span aria-hidden className="w-10 shrink-0 text-end text-muted-foreground select-none">{i + 1}</span>
              <code className="break-all whitespace-pre-wrap">{tk.indent}{tk.key !== undefined && <>"{tk.key}": </>}<span className={tk.tone}>{tk.value}</span>{tk.tail}</code>
            </div>
          );
        })}
        {lines.length < total && (
          <div className="flex gap-4 pe-4"><span aria-hidden className="w-10 shrink-0" /><code className="text-muted-foreground">{t("findingDetail.raw.more", { count: total - lines.length })}</code></div>
        )}
      </div>
    </div>
  );
}

/* ---------- States ---------- */

function Loading() {
  const t = useT();
  return (
    <div className="flex gap-6 p-6">
      <p role="status" className="sr-only">{t("findingDetail.state.loading")}</p>
      <div aria-hidden className="flex flex-1 flex-col gap-4">
        <Skeleton className="h-50" />
        <div className="grid grid-cols-3 gap-3"><Skeleton className="h-22" /><Skeleton className="h-22" /><Skeleton className="h-22" /></div>
        <Skeleton className="h-6 w-2/5" />
        <Skeleton className="h-30" />
      </div>
      <div aria-hidden className="flex w-58 shrink-0 flex-col gap-3">
        <Skeleton className="h-6 w-1/2" />
        {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-4" />)}
      </div>
    </div>
  );
}

function LoadError({ onRetry }: { onRetry?: () => void }) {
  const t = useT();
  return (
    <div role="alert" className="flex min-h-120 flex-col items-center justify-center gap-2 p-8 text-center">
      <span className="grid size-10 place-items-center rounded-md bg-error-muted text-error-foreground"><CircleAlertIcon className="size-5" aria-hidden /></span>
      <h3 className="text-base font-semibold">{t("findingDetail.state.errorTitle")}</h3>
      <p className="max-w-110 text-muted-foreground">{t("findingDetail.state.errorBody")}</p>
      <Button variant="outline" className="mt-2" onClick={onRetry}><RefreshCwIcon aria-hidden />{t("shell.slot.retry")}</Button>
    </div>
  );
}

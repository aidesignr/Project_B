import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { useIntl } from "react-intl";
import { useT } from "@/i18n/useT";
import { Button } from "@/components/ui/button";
import { ModuleSlot, PageContainer, PageToolbar, ToolbarPlaceholder, type SlotState } from "@/components/shell/Page";
import { MODULES, moduleHref, type ModuleId } from "@/components/shell/nav";
import { useShell } from "@/components/shell/shell-context";

const SLOT_STATES: SlotState[] = ["placeholder", "loading", "empty", "error"];

/**
 * Stand-in screen for any module until it is built: toolbar (filters and tabs) + module slot.
 * The page title and breadcrumb live in the header (A2).
 * `?state=loading|empty|error` previews the slot states.
 */
export function ModulePage() {
  const t = useT();
  const intl = useIntl();
  const { module: moduleId, sub: subId } = useParams();
  const [params, setParams] = useSearchParams();
  const { setGettingStartedOpen } = useShell();
  const module = MODULES.find((m) => m.id === moduleId);
  if (!module) return <Navigate to="/dashboard" replace />;

  // A module with level 2 pages lands on its first one.
  const sub = module.subs.find((s) => s.id === subId);
  if (module.subs.length && !sub) return <Navigate to={moduleHref(module)} replace />;

  const moduleName = t(`shell.module.${module.id as ModuleId}`);
  const title = sub ? t(`shell.sub.${module.id}.${sub.id}`) : moduleName;

  const state = SLOT_STATES.find((s) => s === params.get("state")) ?? "placeholder";

  return (
    <PageContainer>
      <PageToolbar
        freshness={t("shell.page.updated", { time: intl.formatRelativeTime(-4, "minute") })}
        actions={<Button variant="outline">{t("shell.page.export")}</Button>}
      >
        <ToolbarPlaceholder />
      </PageToolbar>
      <ModuleSlot
        name={title}
        state={state}
        onRetry={() => setParams({})}
        emptyAction={<Button variant="outline" onClick={() => setGettingStartedOpen(true)}>{t("shell.slot.emptyAction")}</Button>}
      />
    </PageContainer>
  );
}

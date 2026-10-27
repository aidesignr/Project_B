import { useT } from "@/i18n/useT";
import { useSetCrumbs } from "@/components/shell/shell-context";
import { ReportForm, type ReportPreset } from "@/components/reports/ReportForm";

/**
 * Reports › Templates › <template> (canvas "Report configuration", D-068). The page owns its
 * larger H1, so the header shows a plain breadcrumb. The preview column is a full-height tinted
 * panel. One template is mocked until the reports API exists; `:templateId` is not read yet.
 */
export function ReportConfigPage({ preset }: { preset?: ReportPreset }) {
  const t = useT();
  useSetCrumbs(
    [{ label: t("shell.module.reports"), to: "/reports" }, { label: t("reports.crumb.templates"), to: "/reports" }, { label: t("reports.template.cspm") }],
    t("reports.template.cspm"),
  );
  return (
    // No page container: the preview panel runs edge to edge, top to bottom.
    <div className="flex min-h-full flex-col">
      <ReportForm preset={preset} />
    </div>
  );
}

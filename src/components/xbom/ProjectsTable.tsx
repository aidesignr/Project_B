import type { Dispatch, SetStateAction } from "react";
import { useIntl } from "react-intl";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  DownloadIcon,
  EllipsisIcon,
  EyeIcon,
  PencilIcon,
  TagIcon,
  Trash2Icon,
  UploadIcon,
  UserPlusIcon,
  XIcon,
} from "lucide-react";
import { useT } from "@/i18n/useT";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PROJECT_COLUMNS, type Project, type ProjectColumnId } from "./data";

export type ProjectSort = { column: ProjectColumnId; dir: "asc" | "desc" };
export type ProjectColumnState = { id: ProjectColumnId; visible: boolean };

/**
 * XBOM projects table (canvas "XBOM · Projects", 11-tables): native table, every column sorts,
 * select per row and per page, one ⋯ menu per row. Project names link to the project.
 */
export function ProjectsTable({
  rows,
  columns,
  sort,
  onSort,
  selected,
  onSelected,
  compact,
}: {
  rows: Project[];
  columns: ProjectColumnState[];
  sort: ProjectSort;
  onSort: (s: ProjectSort) => void;
  selected: string[];
  onSelected: Dispatch<SetStateAction<string[]>>;
  compact: boolean;
}) {
  const t = useT();
  const intl = useIntl();
  const visible = columns.filter((c) => c.visible).map((c) => PROJECT_COLUMNS.find((d) => d.id === c.id)!);
  const ids = rows.map((r) => r.id);
  const onPage = ids.filter((id) => selected.includes(id)).length;
  const pageState = onPage === 0 ? false : onPage === ids.length ? true : "indeterminate";
  const rowH = compact ? "h-7" : "h-9";

  const cell = (id: ProjectColumnId, p: Project) => {
    switch (id) {
      case "name":
        return <a href="#main-content" className="block truncate rounded-sm font-medium text-link no-underline underline-offset-4 outline-none hover:underline focus-visible:outline-2 focus-visible:outline-ring"><bdi>{p.name}</bdi></a>;
      case "classifier":
        return <span className="inline-block h-5 max-w-full truncate rounded-sm bg-muted px-1 align-middle text-xs leading-5 font-medium text-foreground">{t(`xbom.classifier.${p.classifier}`)}</span>;
      case "tags": {
        const rest = p.tags.slice(2);
        return (
          <span className="flex min-w-0 items-center gap-1">
            {p.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="inline-flex h-5 min-w-0 items-center rounded-sm border border-control-border px-1 text-xs text-foreground"><bdi className="truncate">{tag}</bdi></span>
            ))}
            {rest.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={t("xbom.projects.tags.moreLabel", { count: rest.length, tags: intl.formatList(rest) })}
                    className="h-6 shrink-0 rounded-sm border border-control-border px-1 text-xs font-medium text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    {t("xbom.projects.tags.more", { count: rest.length })}
                  </button>
                </TooltipTrigger>
                <TooltipContent><bdi>{intl.formatList(rest)}</bdi></TooltipContent>
              </Tooltip>
            )}
          </span>
        );
      }
      case "bomFiles":
        return (
          <a href="#main-content" aria-label={t("xbom.projects.bomFiles.label", { count: p.bomFiles, name: p.name })} className="rounded-sm font-medium text-link no-underline underline-offset-4 outline-none hover:underline focus-visible:outline-2 focus-visible:outline-ring">
            <bdi>{t("xbom.projects.bomFiles", { count: p.bomFiles })}</bdi>
          </a>
        );
      case "owner":
        return (
          <span className="flex min-w-0 items-center gap-2">
            <span aria-hidden className="grid size-6 shrink-0 place-items-center rounded-full border border-control-border bg-muted text-xs font-medium">{initials(p.owner)}</span>
            <span className="truncate">{p.owner}</span>
          </span>
        );
      case "description":
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0} className="block truncate rounded-sm text-muted-foreground outline-none focus-visible:outline-2 focus-visible:outline-ring">{p.description}</span>
            </TooltipTrigger>
            <TooltipContent className="max-w-80">{p.description}</TooltipContent>
          </Tooltip>
        );
    }
  };

  return (
    <div className="overflow-x-auto">
      <table data-slot="projects-table" className="w-full min-w-240 table-fixed border-collapse text-sm">
        <caption className="sr-only">{t("xbom.projects.caption")}</caption>
        <thead>
          <tr className="h-9 border-b border-border text-xs font-medium text-muted-foreground">
            <th scope="col" className="w-10 ps-3 text-start">
              <Checkbox
                aria-label={t("xbom.projects.selectPage")}
                checked={pageState}
                onCheckedChange={() => onSelected((prev) => (pageState === true ? prev.filter((x) => !ids.includes(x)) : [...prev, ...ids.filter((x) => !prev.includes(x))]))}
              />
            </th>
            {visible.map((c) => {
              const sorted = sort.column === c.id;
              const SortIcon = !sorted ? ArrowUpDownIcon : sort.dir === "asc" ? ArrowUpIcon : ArrowDownIcon;
              return (
                <th key={c.id} scope="col" aria-sort={sorted ? (sort.dir === "asc" ? "ascending" : "descending") : "none"} className={cn("px-3 text-start font-medium", c.className)}>
                  <button
                    type="button"
                    onClick={() => onSort({ column: c.id, dir: sorted && sort.dir === "asc" ? "desc" : "asc" })}
                    className={cn("-ms-1 inline-flex h-6 items-center gap-1 rounded-sm px-1 outline-none hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring", sorted && "text-foreground")}
                  >
                    {t(`xbom.projects.column.${c.id}`)}
                    <SortIcon className={cn("size-3", !sorted && "opacity-60")} aria-hidden />
                  </button>
                </th>
              );
            })}
            <th scope="col" className="w-12 pe-2"><span className="sr-only">{t("xbom.projects.actions")}</span></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => {
            const on = selected.includes(p.id);
            return (
              <tr key={p.id} data-slot="project-row" aria-selected={on} className={cn(rowH, "border-b border-border last:border-b-0 hover:bg-accent", on && "bg-accent")}>
                <td className="ps-3">
                  <Checkbox aria-label={t("xbom.projects.selectRow", { name: p.name })} checked={on} onCheckedChange={() => onSelected((prev) => (prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id]))} />
                </td>
                {visible.map((c) => <td key={c.id} className="truncate px-3">{cell(c.id, p)}</td>)}
                <td className="pe-2 text-end"><RowActions name={p.name} compact={compact} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const initials = (name: string) => name.split(" ").map((w) => w[0]).join("").slice(0, 2);

function RowActions({ name, compact }: { name: string; compact: boolean }) {
  const t = useT();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={compact ? "icon-sm" : "icon"} aria-label={t("xbom.projects.moreActions", { name })}>
          <EllipsisIcon aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem><EyeIcon aria-hidden />{t("xbom.projects.row.view")}</DropdownMenuItem>
        <DropdownMenuItem><PencilIcon aria-hidden />{t("xbom.projects.row.edit")}</DropdownMenuItem>
        <DropdownMenuItem><UploadIcon aria-hidden />{t("xbom.projects.row.upload")}</DropdownMenuItem>
        <DropdownMenuItem><TagIcon aria-hidden />{t("xbom.projects.row.tags")}</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem><Trash2Icon aria-hidden />{t("xbom.projects.row.delete")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Floats above the bottom of the page while rows are selected. */
export function ProjectsBulkBar({ count, onClear }: { count: number; onClear: () => void }) {
  const t = useT();
  return (
    <div data-slot="bulk-bar" role="toolbar" aria-label={t("xbom.projects.bulk.label")} className="sticky bottom-6 z-20 mx-auto flex h-12 w-fit items-center gap-2 rounded-xl border border-border bg-popover ps-4 pe-2 shadow-3">
      <span role="status" className="pe-1 font-semibold whitespace-nowrap">{t("xbom.projects.bulk.selected", { count })}</span>
      <div aria-hidden className="h-6 w-px bg-border" />
      <Button variant="outline"><TagIcon className="text-muted-foreground" aria-hidden />{t("xbom.projects.bulk.tags")}</Button>
      <Button variant="outline"><UserPlusIcon className="text-muted-foreground" aria-hidden />{t("xbom.projects.bulk.owner")}</Button>
      <Button variant="outline"><DownloadIcon className="text-muted-foreground" aria-hidden />{t("xbom.projects.bulk.export")}</Button>
      <Button variant="outline"><Trash2Icon className="text-muted-foreground" aria-hidden />{t("xbom.projects.bulk.delete")}</Button>
      <div aria-hidden className="h-6 w-px bg-border" />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={t("xbom.projects.bulk.clear")} onClick={onClear}><XIcon aria-hidden /></Button>
        </TooltipTrigger>
        <TooltipContent>{t("xbom.projects.bulk.clear")}</TooltipContent>
      </Tooltip>
    </div>
  );
}

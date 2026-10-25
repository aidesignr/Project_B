import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { createIntl } from "react-intl";
import { INTL_LOCALE, messagesFor, type Locale } from "@/i18n/locales";
import { AppShell } from "@/components/shell/AppShell";
import { FindingsPage, type FindingsPreset } from "@/routes/FindingsPage";
import { FILTERS, emptyFilter, type FilterId, type FilterState, type Severity } from "./data";
import { FilterDropdown } from "./FilterDropdown";
import { SeverityToggles } from "./FilterBar";

/**
 * Findings › All findings (canvas "Findings page"; D-064). Filters follow the dropdown
 * spreadsheet; the table pages over 400 seeded mock findings until the API is wired.
 */
const meta: Meta = {
  title: "Screens/Findings",
  parameters: { layout: "fullscreen", route: "/findings", path: "/findings" },
};
export default meta;
type Story = StoryObj;

const body = () => within(document.body);
/** Message in the story's active locale (the light-ar project runs every story in Arabic). */
const msg = (id: string, values?: Record<string, string | number>) => {
  const locale = document.documentElement.lang as Locale;
  return createIntl({ locale: INTL_LOCALE[locale], messages: messagesFor(locale) }).formatMessage({ id }, values) as string;
};

const Page = ({ preset }: { preset?: FindingsPreset }) => (
  <AppShell defaultPinned={false} pinnable>
    <FindingsPage preset={preset} />
  </AppShell>
);

/* ---------- Page ---------- */

export const Default: Story = {
  render: () => <Page />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("table")).toBeInTheDocument();
    // Severity toggles are pressed buttons with the full name in their label.
    const critical = canvasElement.querySelector<HTMLElement>('[data-slot="severity-toggle"][data-severity="critical"]')!;
    await expect(critical).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(critical);
    await expect(critical).toHaveAttribute("aria-pressed", "false");
    // Pagination moves to the next page.
    await userEvent.click(c.getByRole("button", { name: msg("findings.pagination.next") }));
    await expect(c.getByRole("button", { name: msg("findings.pagination.page", { page: 2 }) })).toHaveAttribute("aria-current", "page");
  },
};

export const CloudProviderOpen: Story = {
  render: () => <Page preset={{ open: "provider" }} />,
  play: async () => {
    const dialog = await body().findByRole("dialog", { name: msg("findings.filter.dialog", { label: msg("findings.filter.provider") }) });
    // Search reaches tree children and opens their parent.
    await userEvent.type(within(dialog).getByRole("textbox"), "staging");
    await waitFor(() => expect(within(dialog).getByText("staging", { exact: false })).toBeInTheDocument());
  },
};

export const AddFilterOpen: Story = {
  render: () => <Page preset={{ addOpen: true, extraFilters: ["findingName"] }} />,
  play: async ({ canvasElement }) => {
    const label = msg("findings.filter.exploit");
    const option = await body().findByRole("button", { name: label });
    await userEvent.click(option);
    // The filter is added, leaves the list, and the list stays open.
    await waitFor(() => expect(canvasElement.querySelector('[data-filter="exploit"]')).not.toBeNull());
    await expect(body().getByRole("dialog", { name: msg("findings.addFilter.label") })).toBeInTheDocument();
    await expect(body().queryByRole("button", { name: label })).toBeNull();
    // Remove puts it back.
    await userEvent.click(within(canvasElement.querySelector<HTMLElement>('[data-filter="exploit"]')!).getByRole("button", { name: msg("findings.filter.remove", { label }) }));
    await waitFor(() => expect(canvasElement.querySelector('[data-filter="exploit"]')).toBeNull());
  },
};

export const BulkActionsAndColumns: Story = {
  render: () => <Page preset={{ columnsOpen: true }} />,
  play: async ({ canvasElement }) => {
    const rows = canvasElement.querySelectorAll<HTMLElement>('[data-slot="finding-row"] button[role="checkbox"]');
    await userEvent.click(rows[0]);
    await userEvent.click(rows[1]);
    await userEvent.click(rows[2]);
    await expect(within(canvasElement.querySelector<HTMLElement>('[data-slot="bulk-bar"]')!).getByRole("status")).toHaveTextContent(msg("findings.bulk.selected", { count: 3 }));
  },
};

export const Loading: Story = { parameters: { route: "/findings?state=loading" }, render: () => <Page /> };
export const LoadError: Story = { parameters: { route: "/findings?state=error" }, render: () => <Page /> };
export const NoResults: Story = {
  render: () => <Page preset={{ query: "Kubelet anonymous auth" }} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(msg("findings.state.emptyTitle"))).toBeInTheDocument();
  },
};

/* ---------- Filter dropdown variants (spreadsheet rows) ---------- */

function Filter({ id, initial, dynamic = true, open = true }: { id: FilterId; initial?: Partial<FilterState>; dynamic?: boolean; open?: boolean }) {
  const [value, setValue] = useState(emptyFilter(initial));
  return (
    <div className="flex h-120 w-120 items-start p-4">
      <FilterDropdown def={FILTERS[id]} value={value} onChange={setValue} onRemove={dynamic ? () => {} : undefined} defaultOpen={open} />
    </div>
  );
}

const variant = (id: FilterId, initial?: Partial<FilterState>, dynamic = true): Story => ({
  parameters: { layout: "centered" },
  render: () => <Filter id={id} initial={initial} dynamic={dynamic} />,
});

export const GroupBySingle = variant("groupBy", { selected: ["severity"] }, false);
export const MultiSelectSelectedTab: Story = {
  ...variant("findingName", { selected: ["Access Analyzer is not enabled", "Access approval is not configured"] }),
  play: async () => {
    const dialog = await body().findByRole("dialog");
    await userEvent.click(within(dialog).getByRole("radio", { name: new RegExp(msg("findings.filter.tabSelected")) }));
    await expect(within(dialog).getAllByRole("checkbox")).toHaveLength(2);
  },
};
export const TagsCreate: Story = {
  ...variant("tags"),
  play: async () => {
    const dialog = await body().findByRole("dialog");
    await userEvent.type(within(dialog).getByRole("textbox"), "pci-scope");
    await userEvent.click(within(dialog).getByRole("button", { name: /pci-scope/ }));
    await expect(within(dialog).getByRole("checkbox", { name: "pci-scope" })).toBeChecked();
  },
};
export const LabelSingleWithTabs = variant("label", { selected: ["Crown jewel"] });
export const YesOrNo = variant("exploit", { selected: ["yes"] });
export const DateRange = variant("lastSeen");

export const ClearAndRemoveAreBlue: Story = {
  parameters: { layout: "centered" },
  render: () => <Filter id="findingStatus" initial={{ selected: ["open"] }} open={false} />,
  play: async ({ canvasElement }) => {
    const clear = canvasElement.querySelector<HTMLElement>('[data-slot="filter-clear"]')!;
    const remove = canvasElement.querySelector<HTMLElement>('[data-slot="filter-remove"]')!;
    await expect(clear.className).toContain("text-link");
    await expect(remove.className).toContain("text-link");
  },
};

export const StaticClearIsForeground: Story = {
  parameters: { layout: "centered" },
  render: () => <Filter id="groupBy" initial={{ selected: ["severity"] }} dynamic={false} open={false} />,
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector<HTMLElement>('[data-slot="filter-clear"]')!.className).toContain("text-foreground");
    await expect(canvasElement.querySelector('[data-slot="filter-remove"]')).toBeNull();
  },
};

export const ResetRestoresDefaults: Story = {
  render: () => <Page preset={{ extraFilters: ["exploit"] }} />,
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-filter="exploit"]')).not.toBeNull();
    await userEvent.click(within(canvasElement).getByRole("button", { name: msg("findings.filters.reset") }));
    await waitFor(() => expect(canvasElement.querySelector('[data-filter="exploit"]')).toBeNull());
    await expect(canvasElement.querySelector('[data-filter="findingStatus"]')).not.toBeNull();
  },
};

export const SeverityBadges: Story = {
  parameters: { layout: "centered" },
  render: function Render() {
    const [s, setS] = useState<Severity[]>(["critical"]);
    return <SeverityToggles selected={s} counts={{ critical: 6, high: 16, medium: 51, low: 62, info: 40 }} onChange={setS} />;
  },
};

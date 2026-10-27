import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { createIntl } from "react-intl";
import { INTL_LOCALE, messagesFor, type Locale } from "@/i18n/locales";
import { AppShell } from "@/components/shell/AppShell";
import { XbomProjectsPage, type ProjectsPreset } from "@/routes/XbomProjectsPage";

/**
 * XBOM › Projects (canvas "XBOM · Projects"; D-069). Classifier and Tags are static filters; the
 * table runs on 10 mock projects until the XBOM API is wired.
 */
const meta: Meta = {
  title: "Screens/XBOM projects",
  parameters: { layout: "fullscreen", route: "/xbom/projects", path: "/xbom/projects" },
};
export default meta;
type Story = StoryObj;

const body = () => within(document.body);
/** Message in the story's active locale (the light-ar project runs every story in Arabic). */
const msg = (id: string, values?: Record<string, string | number>) => {
  const locale = document.documentElement.lang as Locale;
  return createIntl({ locale: INTL_LOCALE[locale], messages: messagesFor(locale) }).formatMessage({ id }, values) as string;
};

const Page = ({ preset }: { preset?: ProjectsPreset }) => (
  <AppShell defaultPinned pinnable>
    <XbomProjectsPage preset={preset} />
  </AppShell>
);

export const Default: Story = {
  render: () => <Page />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("table")).toBeInTheDocument();
    await expect(c.getAllByRole("row")).toHaveLength(11);
    await expect(c.getByRole("button", { name: msg("xbom.projects.add") })).toBeInTheDocument();
    // Project name sorts ascending by default; a click reverses it.
    const nameHeader = c.getByRole("columnheader", { name: msg("xbom.projects.column.name") });
    await expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
    await userEvent.click(within(nameHeader).getByRole("button"));
    await expect(nameHeader).toHaveAttribute("aria-sort", "descending");
  },
};

export const RowsSelected: Story = {
  render: () => <Page preset={{ selected: ["p1", "p3", "p4"] }} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("checkbox", { name: msg("xbom.projects.selectPage") })).toHaveAttribute("data-state", "indeterminate");
    await expect(c.getByRole("toolbar", { name: msg("xbom.projects.bulk.label") })).toBeInTheDocument();
    // Export switches to the selection, and back to everything when it's cleared.
    const exportBtn = canvasElement.querySelector<HTMLElement>('[data-slot="export"]')!;
    await expect(exportBtn).toHaveAccessibleName(msg("xbom.projects.export.label", { count: 3 }));
    await userEvent.click(c.getByRole("button", { name: msg("xbom.projects.bulk.clear") }));
    await expect(exportBtn).toHaveAccessibleName(msg("xbom.projects.export.label", { count: 0 }));
  },
};

export const FiltersApplied: Story = {
  render: () => <Page preset={{ filters: { classifier: { selected: ["application", "container"] }, tags: { selected: ["production"] } }, open: "classifier" }} />,
  play: async ({ canvasElement }) => {
    await body().findByRole("dialog", { name: msg("findings.filter.dialog", { label: msg("xbom.projects.filter.classifier") }) });
    await expect(within(canvasElement).getAllByRole("row")).toHaveLength(5);
  },
};

export const TagsCreate: Story = {
  render: () => <Page preset={{ open: "tags" }} />,
  play: async () => {
    const dialog = await body().findByRole("dialog");
    await userEvent.type(within(dialog).getByRole("textbox"), "pci-scope");
    await userEvent.click(within(dialog).getByRole("button", { name: /pci-scope/ }));
    await expect(within(dialog).getByRole("checkbox", { name: "pci-scope" })).toBeChecked();
  },
};

export const NoResults: Story = {
  render: () => <Page preset={{ query: "payments-gateway" }} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText(msg("xbom.projects.state.noResultsTitle"))).toBeInTheDocument();
    await userEvent.click(c.getByRole("button", { name: msg("xbom.projects.state.clearFilters") }));
    await expect(c.getByRole("table")).toBeInTheDocument();
  },
};

export const Loading: Story = { parameters: { route: "/xbom/projects?state=loading" }, render: () => <Page /> };
export const Empty: Story = { parameters: { route: "/xbom/projects?state=empty" }, render: () => <Page /> };
export const LoadError: Story = { parameters: { route: "/xbom/projects?state=error" }, render: () => <Page /> };

import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { createIntl } from "react-intl";
import { INTL_LOCALE, messagesFor, type Locale } from "@/i18n/locales";
import { AppShell } from "@/components/shell/AppShell";
import { FindingsPage, type FindingsPreset } from "@/routes/FindingsPage";
import { SAMPLE_FINDING } from "./detail";

/**
 * Finding detail drawer (canvas "Findings page", page "Finding detail"; D-066). Opens over the
 * Findings list from a finding name. One story per tab and state, each with a play test.
 */
const meta: Meta = {
  title: "Screens/Findings/Finding detail",
  parameters: { layout: "fullscreen", route: "/findings", path: "/findings" },
};
export default meta;
type Story = StoryObj;

const body = () => within(document.body);
const msg = (id: string, values?: Record<string, string | number>) => {
  const locale = document.documentElement.lang as Locale;
  return createIntl({ locale: INTL_LOCALE[locale], messages: messagesFor(locale) }).formatMessage({ id }, values) as string;
};
const drawer = () => body().findByRole("dialog", { name: SAMPLE_FINDING.name });

const Page = ({ preset }: { preset?: FindingsPreset }) => (
  <AppShell defaultPinned={false} pinnable>
    <FindingsPage preset={preset} />
  </AppShell>
);
const screen = (d: NonNullable<FindingsPreset["drawer"]>, play?: Story["play"]): Story => ({ render: () => <Page preset={{ drawer: d }} />, play });

/** Clicking a finding name opens its drawer; Esc closes it and focus goes back to the name. */
export const OpenFromList: Story = {
  render: () => <Page />,
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLButtonElement>('[data-slot="finding-open"]')!;
    const name = trigger.textContent!;
    await userEvent.click(trigger);
    const dialog = await body().findByRole("dialog", { name });
    await expect(within(dialog).getByRole("tab", { name: msg("findingDetail.tab.overview") })).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body().queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const Overview = screen({ tab: "overview" }, async () => {
  const d = await drawer();
  await expect(within(d).getByRole("heading", { name: msg("findingDetail.story.title") })).toBeInTheDocument();
  await expect(within(d).getByRole("heading", { name: msg("findingDetail.asset.title") })).toBeInTheDocument();
  // "Go to remediation" switches tabs.
  await userEvent.click(within(d).getByRole("button", { name: msg("findingDetail.story.goRemediation") }));
  await expect(within(d).getByRole("tab", { name: msg("findingDetail.tab.remediation") })).toHaveAttribute("aria-selected", "true");
});

export const SecurityGraph = screen({ tab: "graph" }, async () => {
  const d = await drawer();
  const figure = d.querySelector<HTMLElement>('[data-slot="attack-path"]')!;
  await expect(figure).toHaveAttribute("data-view", "graph");
  await userEvent.click(within(d).getByRole("radio", { name: msg("findingDetail.graph.list") }));
  await expect(within(d).getByRole("list", { name: msg("findingDetail.graph.listLabel") })).toBeInTheDocument();
});

export const SecurityGraphAsList = screen({ tab: "graph", graphView: "list" }, async () => {
  const d = await drawer();
  await expect(within(d).getByRole("list", { name: msg("findingDetail.graph.listLabel") }).querySelectorAll("li")).toHaveLength(4);
});

export const Remediation = screen({ tab: "remediation" }, async () => {
  const d = await drawer();
  await expect(within(d).getByRole("list", { name: msg("findingDetail.remediation.steps") }).querySelectorAll("li")).toHaveLength(5);
});

export const StatusLog = screen({ tab: "log" }, async () => {
  const d = await drawer();
  await expect(within(d).getByRole("list", { name: msg("findingDetail.log.label") }).querySelectorAll("li")).toHaveLength(3);
});

export const RawDataFinding = screen({ tab: "raw", raw: "finding" }, async () => {
  const d = await drawer();
  await expect(within(d).getByRole("region", { name: msg("findingDetail.raw.findingJson") })).toBeInTheDocument();
  await userEvent.click(within(d).getByRole("radio", { name: msg("findingDetail.raw.asset") }));
  await expect(within(d).getByRole("region", { name: msg("findingDetail.raw.assetJson") })).toBeInTheDocument();
});

export const RawDataAsset = screen({ tab: "raw", raw: "asset" }, async () => {
  const d = await drawer();
  await userEvent.click(within(d).getByRole("button", { name: msg("findingDetail.raw.copy") }));
  await expect(within(d).getByRole("status")).toHaveTextContent(msg("findingDetail.toast.json"));
});

export const Loading = screen({ state: "loading" }, async () => {
  const d = await drawer();
  await expect(within(d).getByRole("status")).toHaveTextContent(msg("findingDetail.state.loading"));
});

export const LoadError = screen({ state: "error" }, async () => {
  const d = await drawer();
  await expect(within(d).getByRole("alert")).toBeInTheDocument();
  await userEvent.click(within(d).getByRole("button", { name: msg("shell.slot.retry") }));
  await waitFor(() => expect(within(d).getByRole("heading", { name: msg("findingDetail.story.title") })).toBeInTheDocument());
});

/** Ignore is reversible, so it shows an Undo toast (D-037), not a dialog. */
export const IgnoredWithUndo = screen({ toast: "ignored" }, async () => {
  const d = await drawer();
  await expect(within(d).getByRole("status")).toHaveTextContent(msg("findingDetail.toast.ignored"));
  await userEvent.click(within(d).getByRole("button", { name: msg("shell.notifications.undo") }));
  await waitFor(() => expect(d.querySelector('[data-slot="drawer-toast"]')).toBeNull());
  await expect(d.querySelector('[data-slot="drawer-ignore"]')).toHaveAttribute("aria-pressed", "false");
});

export const LinkCopied = screen({ toast: "link" }, async () => {
  const d = await drawer();
  await expect(within(d).getByRole("status")).toHaveTextContent(msg("findingDetail.toast.link"));
});

export const IgnoreFromHeader = screen({ tab: "overview" }, async () => {
  const d = await drawer();
  await userEvent.click(d.querySelector<HTMLElement>('[data-slot="drawer-ignore"]')!);
  await expect(within(d).getByRole("status")).toHaveTextContent(msg("findingDetail.toast.ignored"));
});

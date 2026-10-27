import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { createIntl } from "react-intl";
import { INTL_LOCALE, messagesFor, type Locale } from "@/i18n/locales";
import { AppShell } from "@/components/shell/AppShell";
import { ReportConfigPage } from "@/routes/ReportConfigPage";
import type { ReportPreset } from "./ReportForm";

/**
 * Reports › Templates › CSPM cloud misconfiguration (canvas "Report configuration"; D-067, D-068).
 * Scope fields reuse the Findings filter dropdown; validation follows the login flow.
 */
const meta: Meta = {
  title: "Screens/Report configuration",
  parameters: { layout: "fullscreen", route: "/reports/templates/cspm-misconfiguration", path: "/reports/templates/:templateId" },
};
export default meta;
type Story = StoryObj;

const body = () => within(document.body);
/** Message in the story's active locale (the light-ar project runs every story in Arabic). */
const msg = (id: string, values?: Record<string, string | number>) => {
  const locale = document.documentElement.lang as Locale;
  return createIntl({ locale: INTL_LOCALE[locale], messages: messagesFor(locale) }).formatMessage({ id }, values) as string;
};

const Page = ({ preset }: { preset?: ReportPreset }) => (
  <AppShell defaultPinned pinnable>
    <ReportConfigPage preset={preset} />
  </AppShell>
);

export const OnDemand: Story = {
  render: () => <Page />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    // One H1 (the page title); the header breadcrumb has none.
    await expect(c.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    await expect(c.getByRole("radio", { name: msg("reports.type.ondemand") })).toHaveAttribute("aria-checked", "true");
    // Placeholders on inputs.
    await expect(c.getByLabelText(msg("reports.name.label"), { exact: false })).toHaveAttribute("placeholder", msg("reports.name.placeholder"));
    await expect(canvasElement.querySelector("#f-email")).toHaveAttribute("placeholder", msg("reports.recipients.placeholder"));
  },
};

export const ValidationOnSubmit: Story = {
  render: () => <Page />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const name = canvasElement.querySelector<HTMLInputElement>("#f-name")!;
    await userEvent.clear(name);
    // No error before submit.
    await expect(name).not.toHaveAttribute("aria-invalid");
    await userEvent.click(c.getByRole("button", { name: msg("reports.submit.send") }));
    // One error: no banner, message under the field, focus on the field.
    await waitFor(() => expect(name).toHaveFocus());
    await expect(name).toHaveAttribute("aria-invalid", "true");
    await expect(name).toHaveAttribute("aria-describedby", "f-name-err");
    await expect(canvasElement.querySelector("#f-name-err")).toHaveTextContent(msg("reports.name.error"));
    await expect(c.queryByRole("alert")).toBeNull();
    // Fixing the field clears its error at once.
    await userEvent.type(name, "Weekly posture");
    await expect(canvasElement.querySelector("#f-name-err")).toBeNull();
    await userEvent.click(c.getByRole("button", { name: msg("reports.submit.send") }));
    await expect(await c.findByRole("status")).toHaveTextContent(msg("reports.done.sent", { count: 3 }));
  },
};

export const ScheduledWeekly: Story = {
  render: () => <Page preset={{ mode: "scheduled" }} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("radio", { name: msg("reports.type.scheduled") })).toHaveAttribute("aria-checked", "true");
    // Frequency is a required single select; Weekly swaps the day field.
    await userEvent.click(canvasElement.querySelector<HTMLElement>("#f-freq")!);
    await userEvent.click(await body().findByRole("radio", { name: msg("reports.freq.weekly") }));
    await waitFor(() => expect(canvasElement.querySelector("#f-dow")).not.toBeNull());
    await expect(canvasElement.querySelector("#f-dom")).toBeNull();
  },
};

export const ScheduledErrors: Story = {
  render: () => <Page preset={{ mode: "scheduled", state: "error" }} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    // Several errors: one banner listing each, linked to its field.
    const banner = c.getByRole("alert");
    await expect(banner).toHaveTextContent(msg("reports.errors.titleSave"));
    await expect(within(banner).getAllByRole("link")).toHaveLength(3);
    await expect(canvasElement.querySelector("#f-email")).toHaveAttribute("aria-invalid", "true");
    await expect(canvasElement.querySelector("#f-start")).toHaveAttribute("aria-invalid", "true");
  },
};

export const ResetClearsErrors: Story = {
  render: () => <Page preset={{ mode: "scheduled", state: "error" }} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: msg("reports.reset") }));
    // Every field is empty (placeholders show), errors are gone, the report type stays.
    await expect(c.queryByRole("alert")).toBeNull();
    await expect(canvasElement.querySelector("#f-name")).toHaveValue("");
    await expect(canvasElement.querySelectorAll("[data-slot=email-chips] li")).toHaveLength(0);
    await expect(canvasElement.querySelectorAll('[aria-invalid="true"]')).toHaveLength(0);
    await expect(c.getByRole("radio", { name: msg("reports.type.scheduled") })).toHaveAttribute("aria-checked", "true");
    await expect(c.getByRole("status")).toHaveTextContent(msg("reports.reset.done"));
    // Submitting the empty schedule flags every required field, schedule fields included.
    await userEvent.click(c.getByRole("button", { name: msg("reports.submit.save") }));
    const banner = await c.findByRole("alert");
    await expect(within(banner).getAllByRole("link")).toHaveLength(8);
    await expect(canvasElement.querySelector("#f-freq")).toHaveAttribute("aria-invalid", "true");
    await expect(canvasElement.querySelector("#f-start-err")).toHaveTextContent(msg("reports.start.errorEmpty"));
  },
};

export const ResetUndo: Story = {
  render: () => <Page />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: msg("reports.reset") }));
    await expect(canvasElement.querySelector("#f-name")).toHaveValue("");
    await userEvent.click(c.getByRole("button", { name: msg("reports.reset.undo") }));
    await expect(canvasElement.querySelector("#f-name")).toHaveValue("Cloud misconfiguration report");
    await expect(canvasElement.querySelectorAll("[data-slot=email-chips] li")).toHaveLength(3);
  },
};

export const CloudAccountOpen: Story = {
  render: () => <Page preset={{ open: "accounts" }} />,
  play: async () => {
    const dialog = await body().findByRole("dialog", { name: msg("reports.accounts.label") });
    // Same dropdown as the Findings Cloud provider filter: operator, tabs, search across both levels.
    await userEvent.type(within(dialog).getByRole("textbox"), "staging");
    await waitFor(() => expect(within(dialog).getByText("staging", { exact: false })).toBeInTheDocument());
  },
};

export const TagsOpen: Story = { render: () => <Page preset={{ open: "tags" }} /> };
export const StartDateOpen: Story = { render: () => <Page preset={{ mode: "scheduled", open: "start" }} /> };
export const TimeZoneOpen: Story = { render: () => <Page preset={{ mode: "scheduled", open: "tz" }} /> };

import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { figma, fill, submit, waitFor } from "@/stories/helpers";
import { InvitePassword } from "./InvitePassword";
import { InviteAuthenticator } from "./InviteAuthenticator";
import { RecoveryCodes } from "./RecoveryCodes";

/** Journey 3 · New user: email invite → password → authenticator → recovery codes. */
const meta: Meta = { title: "Screens/J3 Invite", parameters: { layout: "fullscreen" } };
export default meta;
type Story = StoryObj;

const invite = (route: string, suffix = "") => ({ route, path: `/invite/:token${suffix}` });

export const SetPassword: Story = { name: "Step 1: set password", render: () => <InvitePassword />, parameters: { ...invite("/invite/demo"), ...figma("11-1343") } };

export const WeakPassword: Story = {
  name: "Error: password doesn't meet the rules",
  render: () => <InvitePassword />,
  parameters: { ...invite("/invite/demo"), ...figma("11-1699") },
  play: async ({ canvasElement }) => {
    await fill(canvasElement, "new-password", "weakpass1");
    await fill(canvasElement, "confirm-password", "weakpass1");
    await submit(canvasElement);
    await expect(await waitFor(canvasElement, "#pw-error")).toBeVisible();
  },
};

export const Expired: Story = { name: "Error: invite expired", render: () => <InvitePassword />, parameters: { ...invite("/invite/expired"), ...figma("11-1869") } };

export const SetUpAuthenticator: Story = { name: "Step 2: set up authenticator", render: () => <InviteAuthenticator />, parameters: { ...invite("/invite/demo/authenticator", "/authenticator"), ...figma("11-1498") } };

export const WrongCode: Story = {
  name: "Error: authenticator code didn't work",
  render: () => <InviteAuthenticator />,
  parameters: { ...invite("/invite/demo/authenticator", "/authenticator"), ...figma("11-1961") },
  play: async ({ canvasElement }) => {
    await fill(canvasElement, "setup-otp", "000000");
    await submit(canvasElement);
    await expect(await waitFor(canvasElement, "#otp-error")).toBeVisible();
  },
};

export const SaveRecoveryCodes: Story = { name: "Step 3: save recovery codes", render: () => <RecoveryCodes />, parameters: { ...invite("/invite/demo/recovery-codes", "/recovery-codes"), ...figma("11-1599") } };

export const CodesNotSaved: Story = {
  name: "Error: recovery codes not confirmed",
  render: () => <RecoveryCodes />,
  parameters: { ...invite("/invite/demo/recovery-codes", "/recovery-codes"), ...figma("11-2071") },
  play: async ({ canvasElement }) => {
    await submit(canvasElement);
    await expect(await waitFor(canvasElement, "#saved-error")).toBeVisible();
  },
};

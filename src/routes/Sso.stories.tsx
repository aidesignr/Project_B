import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { figma, fill, submit, waitFor } from "@/stories/helpers";
import { Sso } from "./Sso";

/** Journey 4 · SSO (OpenID). The Google error lives with Sign in. */
const meta: Meta = { title: "Screens/J4 SSO", parameters: { layout: "fullscreen", route: "/sso" } };
export default meta;
type Story = StoryObj;

export const SsoDefault: Story = { name: "Sign in with SSO (OpenID)", render: () => <Sso />, parameters: figma("10-1196") };

export const NoSso: Story = {
  name: "Error: no SSO for this domain",
  render: () => <Sso />,
  parameters: figma("10-1290"),
  play: async ({ canvasElement }) => {
    await fill(canvasElement, "email", "maya.chen@nosso.com");
    await submit(canvasElement);
    await expect(await waitFor(canvasElement, "[role=alert]")).toBeVisible();
  },
};

export const ProviderError: Story = {
  name: "Error: identity provider error",
  render: () => <Sso />,
  parameters: figma("10-1401"),
  play: async ({ canvasElement }) => {
    await fill(canvasElement, "email", "maya.chen@idp-error.com");
    await submit(canvasElement);
    await expect(await waitFor(canvasElement, "[role=alert]")).toBeVisible();
  },
};

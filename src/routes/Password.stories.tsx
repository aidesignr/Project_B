import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { figma, fill, submit, waitFor, waitForFocus, STRONG_PASSWORD } from "@/stories/helpers";
import { ForgotPassword } from "./ForgotPassword";
import { ResetPassword } from "./ResetPassword";

/** Journey 2 · Forgot password. */
const meta: Meta = { title: "Screens/J2 Forgot password", parameters: { layout: "fullscreen" } };
export default meta;
type Story = StoryObj;

export const Forgot: Story = { name: "Forgot password", render: () => <ForgotPassword />, parameters: { route: "/forgot-password", ...figma("10-559") } };

export const Sent: Story = {
  name: "Check your email",
  render: () => <ForgotPassword />,
  parameters: { route: "/forgot-password", ...figma("10-655") },
  play: async ({ canvasElement }) => {
    await fill(canvasElement, "email", "maya.chen@company.com");
    await submit(canvasElement);
    await expect(await waitFor(canvasElement, "[role=status]")).toBeVisible();
  },
};

export const LinkExpired: Story = { name: "Error: reset link expired", render: () => <ForgotPassword />, parameters: { route: "/forgot-password?expired=1", ...figma("10-934") } };

export const Reset: Story = { name: "Set a new password", render: () => <ResetPassword />, parameters: { route: "/reset-password?token=demo", ...figma("10-730") } };

export const Mismatch: Story = {
  name: "Error: passwords don't match",
  render: () => <ResetPassword />,
  parameters: { route: "/reset-password?token=demo", ...figma("10-1050") },
  play: async ({ canvasElement }) => {
    await fill(canvasElement, "new-password", STRONG_PASSWORD);
    await fill(canvasElement, "confirm-password", STRONG_PASSWORD + "x");
    await submit(canvasElement);
    await expect(await waitFor(canvasElement, "#confirm-error")).toBeVisible();
  },
};

/** 09 · Forms: a weak password gets a field error plus the red checklist; focus moves to it. */
export const WeakPassword: Story = {
  name: "Error: password doesn't meet the rules",
  render: () => <ResetPassword />,
  parameters: { route: "/reset-password?token=demo" },
  play: async ({ canvasElement }) => {
    await fill(canvasElement, "new-password", "weakpass1");
    await submit(canvasElement);
    await expect(await waitFor(canvasElement, "#pw-error")).toBeVisible();
    await waitForFocus(canvasElement, "new-password");
  },
};

export const Updated: Story = {
  name: "Password updated",
  render: () => <ResetPassword />,
  parameters: { route: "/reset-password?token=demo", ...figma("10-867") },
  play: async ({ canvasElement }) => {
    await fill(canvasElement, "new-password", STRONG_PASSWORD);
    await fill(canvasElement, "confirm-password", STRONG_PASSWORD);
    await submit(canvasElement);
    await expect(await waitFor(canvasElement, "[role=status]")).toBeVisible();
  },
};

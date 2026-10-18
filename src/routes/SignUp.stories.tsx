import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent } from "storybook/test";
import { figma, fill, submit, waitFor, STRONG_PASSWORD } from "@/stories/helpers";
import { SignUp } from "./SignUp";
import { VerifyEmail } from "./VerifyEmail";
import { Welcome } from "./Welcome";

/** Journey 5 · New user: self sign-up. */
const meta: Meta = { title: "Screens/J5 Sign up", parameters: { layout: "fullscreen", route: "/sign-up" } };
export default meta;
type Story = StoryObj;

async function fillForm(root: HTMLElement, email: string, agree: boolean) {
  await fill(root, "first", "Maya");
  await fill(root, "last", "Chen");
  await fill(root, "email", email);
  await fill(root, "org", "Company Inc.");
  await fill(root, "new-password", STRONG_PASSWORD);
  await fill(root, "confirm-password", STRONG_PASSWORD);
  if (agree) await userEvent.click(root.querySelector("#terms")!);
}

export const SignUpDefault: Story = { name: "Sign up", render: () => <SignUp />, parameters: figma("11-2176") };

export const Creating: Story = {
  name: "Creating account (loading)",
  render: () => <SignUp />,
  parameters: figma("11-2373"),
  play: async ({ canvasElement }) => {
    await fillForm(canvasElement, "maya.chen@company.com", true);
    await submit(canvasElement);
    await expect(await waitFor(canvasElement, "button[aria-busy=true]")).toBeVisible();
  },
};

export const EmailTaken: Story = {
  name: "Error: email already registered",
  render: () => <SignUp />,
  parameters: figma("11-2662"),
  play: async ({ canvasElement }) => {
    await fillForm(canvasElement, "taken@company.com", true);
    await submit(canvasElement);
    await expect(await waitFor(canvasElement, "[role=alert]")).toBeVisible();
  },
};

export const TermsNotAccepted: Story = {
  name: "Error: terms not accepted",
  render: () => <SignUp />,
  parameters: figma("11-2890"),
  play: async ({ canvasElement }) => {
    await fillForm(canvasElement, "maya.chen@company.com", false);
    await submit(canvasElement);
    await expect(await waitFor(canvasElement, "#terms-error")).toBeVisible();
  },
};

export const Verify: Story = { name: "Verify your email", render: () => <VerifyEmail />, parameters: { route: "/verify-email", ...figma("11-2587") } };

export const SignedIn: Story = { name: "Signed in (placeholder)", render: () => <Welcome />, parameters: { route: "/welcome" } };

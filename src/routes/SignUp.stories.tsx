import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent } from "storybook/test";
import { figma, fill, submit, waitFor, waitForFocus, STRONG_PASSWORD } from "@/stories/helpers";
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

/** 09 · Forms: an empty submit marks every required field; the summary banner lists them and takes focus (D-075). */
export const RequiredFields: Story = {
  name: "Error: required fields empty",
  render: () => <SignUp />,
  play: async ({ canvasElement }) => {
    await submit(canvasElement);
    for (const id of ["#first-error", "#last-error", "#email-error", "#org-error", "#pw-error", "#terms-error"]) {
      await expect(await waitFor(canvasElement, id)).toBeVisible();
    }
    await waitForFocus(canvasElement, "error-summary");
    const links = canvasElement.querySelectorAll<HTMLAnchorElement>("#error-summary a");
    await expect(links).toHaveLength(6); // first, last, email, org, password, terms (confirm waits for a valid password)
    // Each link moves focus to its field.
    await userEvent.click(links[0]);
    await waitForFocus(canvasElement, "first");
  },
};

/** D-052: a password found in a known breach is rejected with a field error (demo list in lib/auth). */
export const BreachedPassword: Story = {
  name: "Error: password found in a data breach",
  render: () => <SignUp />,
  play: async ({ canvasElement }) => {
    await fill(canvasElement, "first", "Maya");
    await fill(canvasElement, "last", "Chen");
    await fill(canvasElement, "email", "maya.chen@company.com");
    await fill(canvasElement, "org", "Company Inc.");
    await fill(canvasElement, "new-password", "Password123!");
    await fill(canvasElement, "confirm-password", "Password123!");
    await userEvent.click(canvasElement.querySelector("#terms")!);
    await submit(canvasElement);
    await expect(await waitFor(canvasElement, "#pw-error")).toBeVisible();
    await waitForFocus(canvasElement, "new-password");
  },
};

export const Verify: Story = { name: "Verify your email", render: () => <VerifyEmail />, parameters: { route: "/verify-email", ...figma("11-2587") } };

export const SignedIn: Story = { name: "Signed in (placeholder)", render: () => <Welcome />, parameters: { route: "/welcome" } };

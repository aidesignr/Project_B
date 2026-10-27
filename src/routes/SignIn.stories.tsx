import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent } from "storybook/test";
import { figma, fill, submit, waitFor, waitForFocus } from "@/stories/helpers";
import { SignIn } from "./SignIn";
import { Authenticator } from "./Authenticator";

/** Journey 1 · Existing user: email, password, authenticator. Error states are reached through the form (mock auth). */
const meta: Meta = { title: "Screens/J1 Sign in", parameters: { layout: "fullscreen", route: "/sign-in" } };
export default meta;
type Story = StoryObj;

export const SignInDefault: Story = { name: "Sign in", render: () => <SignIn />, parameters: figma("8-2037") };

export const InvalidEmail: Story = {
  name: "Error: invalid email",
  render: () => <SignIn />,
  parameters: figma("8-2285"),
  play: async ({ canvasElement }) => {
    await fill(canvasElement, "email", "maya.chen@company");
    await fill(canvasElement, "password", "anything");
    await submit(canvasElement);
    await expect(await waitFor(canvasElement, "#email-error")).toBeVisible();
    // One error: no summary banner; focus goes to the field (D-075).
    await expect(canvasElement.querySelector("#error-summary")).toBeNull();
    await waitForFocus(canvasElement, "email");
  },
};

/** 09 · Forms: empty password is caught before sending; the error clears once the field is filled. */
export const PasswordMissing: Story = {
  name: "Error: password missing",
  render: () => <SignIn />,
  play: async ({ canvasElement }) => {
    await fill(canvasElement, "email", "maya.chen@company.com");
    await submit(canvasElement);
    await expect(await waitFor(canvasElement, "#password-error")).toBeVisible();
    await waitForFocus(canvasElement, "password");
    await fill(canvasElement, "password", "anything");
    await expect(canvasElement.querySelector("#password-error")).toBeNull();
    await fill(canvasElement, "password", "");
  },
};

export const WrongCredentials: Story = {
  name: "Error: wrong email or password",
  render: () => <SignIn />,
  parameters: figma("8-2422"),
  play: async ({ canvasElement }) => {
    await fill(canvasElement, "email", "maya.chen@company.com");
    await fill(canvasElement, "password", "incorrect");
    await submit(canvasElement);
    await expect(await waitFor(canvasElement, "[role=alert]")).toBeVisible();
  },
};

export const Locked: Story = {
  name: "Error: too many attempts",
  render: () => <SignIn />,
  parameters: figma("8-2583"),
  play: async ({ canvasElement }) => {
    await fill(canvasElement, "email", "locked@company.com");
    await fill(canvasElement, "password", "anything");
    await submit(canvasElement);
    await waitFor(canvasElement, "[role=alert]");
    await expect(canvasElement.querySelector("form button[type=submit]")).toBeDisabled();
  },
};

export const GoogleNotLinked: Story = {
  name: "Error: Google account not linked",
  render: () => <SignIn />,
  parameters: figma("10-1512"),
  play: async ({ canvasElement }) => {
    await userEvent.click(canvasElement.querySelector("#google-sign-in")!);
    await expect(await waitFor(canvasElement, "[role=alert]")).toBeVisible();
  },
};

export const AuthenticatorDefault: Story = { name: "Authenticator code", render: () => <Authenticator />, parameters: { route: "/sign-in/code", ...figma("8-2192") } };

export const WrongCode: Story = {
  name: "Error: wrong authenticator code",
  render: () => <Authenticator />,
  parameters: { route: "/sign-in/code", ...figma("8-2729") },
  play: async ({ canvasElement }) => {
    await fill(canvasElement, "otp", "000000");
    await submit(canvasElement);
    await expect(await waitFor(canvasElement, "#otp-error")).toBeVisible();
    await waitForFocus(canvasElement, "otp");
  },
};

/** 09 · Forms: fewer than 6 digits is caught before sending. */
export const CodeTooShort: Story = {
  name: "Error: code too short",
  render: () => <Authenticator />,
  parameters: { route: "/sign-in/code" },
  play: async ({ canvasElement }) => {
    await fill(canvasElement, "otp", "123");
    await submit(canvasElement);
    await expect(await waitFor(canvasElement, "#otp-error")).toBeVisible();
    await expect(canvasElement.querySelector("#otp")).toHaveAttribute("aria-invalid", "true");
    await waitForFocus(canvasElement, "otp");
  },
};

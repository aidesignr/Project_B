import type { Meta, StoryObj } from "@storybook/react-vite";
import { Building2Icon, MailIcon } from "lucide-react";
import { useT } from "@/i18n/useT";
import { figma } from "@/stories/helpers";
import { FeatureCarousel } from "./FeatureCarousel";
import { Toolbar } from "./Toolbar";
import { CodeInput, ErrorBanner, FieldError, IconChip, PasswordInput, PasswordRules, StepProgress } from "./parts";

/** Building blocks shared by the auth screens (login canvas, D-049/D-050). */
const meta: Meta = { title: "Auth/Parts" };
export default meta;
type Story = StoryObj;

export const FeaturePane: Story = {
  parameters: { layout: "fullscreen", ...figma("5-437") },
  render: () => <div className="h-200 w-160"><FeatureCarousel /></div>,
};

export const LanguageAndTheme: Story = {
  parameters: figma("6-1111"),
  render: () => <Toolbar />,
};

type RulesArgs = { password: string; submitted: boolean };
export const PasswordRuleChecklist: StoryObj<RulesArgs> = {
  args: { password: "weakpass1", submitted: true },
  argTypes: { password: { control: "text" }, submitted: { control: "boolean" } },
  parameters: figma("6-1125"),
  render: ({ password, submitted }) => <div className="w-100"><PasswordRules ns="signUp" id="rules" password={password} submitted={submitted} /></div>,
};

export const Password: Story = {
  render: () => {
    const t = useT();
    return <div className="w-100"><PasswordInput ns="signIn" id="pw" defaultValue="Strong#Pass1" aria-label={t("signIn.password")} /></div>;
  },
};

export const CodeField: Story = {
  render: () => {
    const t = useT();
    return <div className="w-100"><CodeInput aria-label={t("authenticator.codeLabel")} defaultValue="482913" /></div>;
  },
};

export const FieldErrorMessage: Story = {
  render: () => {
    const t = useT();
    return <div className="w-100"><FieldError id="e">{t("authenticator.codeErr")}</FieldError></div>;
  },
};

export const PageErrorBanner: Story = {
  render: () => {
    const t = useT();
    return <div className="w-100"><ErrorBanner title={t("signIn.lockedTitle")}>{t("signIn.lockedBody")}</ErrorBanner></div>;
  },
};

export const InviteSteps: StoryObj<{ step: 1 | 2 | 3 }> = {
  args: { step: 2 },
  argTypes: { step: { control: { type: "inline-radio" }, options: [1, 2, 3] } },
  parameters: figma("6-1164"),
  render: ({ step }) => {
    const t = useT();
    const label = t(step === 1 ? "invitePassword.step" : step === 2 ? "inviteAuthenticator.step" : "recoveryCodes.step");
    return <div className="w-100"><StepProgress step={step} label={label} /></div>;
  },
};

export const IconChips: Story = {
  parameters: figma("25-5041"),
  render: () => (
    <div className="flex gap-4">
      <IconChip icon={Building2Icon} />
      <IconChip icon={MailIcon} tone="success" />
    </div>
  ),
};

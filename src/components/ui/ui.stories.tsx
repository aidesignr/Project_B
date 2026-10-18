import type { Meta, StoryObj } from "@storybook/react-vite";
import { CopyIcon, MoonIcon, SunIcon, MonitorIcon, CircleAlertIcon, DownloadIcon } from "lucide-react";
import { useT } from "@/i18n/useT";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { Input } from "./input";
import { Label } from "./label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Separator } from "./separator";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

/** shadcn/ui primitives, sized compact (32px controls, 24px icon buttons) and themed by the repo tokens. */
const meta: Meta = { title: "UI/Primitives" };
export default meta;
type Story = StoryObj;

export const Buttons: Story = {
  render: () => {
    const t = useT();
    return (
      <div className="flex flex-col items-start gap-3">
        <Button>{t("signIn.signIn")}</Button>
        <Button variant="outline"><DownloadIcon aria-hidden />{t("recoveryCodes.download")}</Button>
        <Button variant="ghost">{t("authenticator.back")}</Button>
        <Button variant="link">{t("signIn.forgot")}</Button>
        <Button disabled>{t("signUp.creating")}</Button>
        <Button variant="ghost" size="icon-sm" aria-label={t("inviteAuthenticator.copy")}><CopyIcon aria-hidden /></Button>
      </div>
    );
  },
};

export const InputField: Story = {
  render: () => {
    const t = useT();
    return (
      <div className="flex w-100 flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="s-email">{t("signIn.email")}</Label>
          <Input id="s-email" placeholder="name@company.com" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="s-invalid">{t("signIn.email")}</Label>
          <Input id="s-invalid" defaultValue="maya.chen@company" aria-invalid aria-describedby="s-invalid-error" />
          <p id="s-invalid-error" className="flex items-start gap-1 text-sm text-error-foreground">
            <CircleAlertIcon className="mt-[2px] size-4 shrink-0" aria-hidden />{t("signIn.emailErr")}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="s-disabled">{t("invitePassword.email")}</Label>
          <Input id="s-disabled" value="maya.chen@company.com" disabled readOnly />
        </div>
      </div>
    );
  },
};

export const CheckboxField: Story = {
  render: () => {
    const t = useT();
    return (
      <div className="flex items-center gap-2">
        <Checkbox id="s-trust" />
        <Label htmlFor="s-trust" className="font-normal">{t("authenticator.trust")}</Label>
      </div>
    );
  },
};

export const SelectField: Story = {
  render: () => {
    const t = useT();
    return (
      <Select defaultValue="en">
        <SelectTrigger className="w-32" aria-label={t("common.language")}><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="ar" lang="ar">العربية</SelectItem>
          <SelectItem value="ja" lang="ja">日本語</SelectItem>
        </SelectContent>
      </Select>
    );
  },
};

export const ErrorAlert: Story = {
  render: () => {
    const t = useT();
    return (
      <Alert variant="error" className="w-100">
        <CircleAlertIcon aria-hidden />
        <AlertTitle>{t("signIn.wrongTitle")}</AlertTitle>
        <AlertDescription>{t("signIn.wrongBody")}</AlertDescription>
      </Alert>
    );
  },
};

export const ToggleGroupWithTooltips: Story = {
  render: () => {
    const t = useT();
    const items = [["light", SunIcon, "common.light"], ["dark", MoonIcon, "common.dark"], ["system", MonitorIcon, "common.system"]] as const;
    return (
      <ToggleGroup type="single" defaultValue="dark" aria-label={t("common.theme")}>
        {items.map(([value, Icon, label]) => (
          <Tooltip key={value}>
            <TooltipTrigger asChild>
              <ToggleGroupItem value={value} aria-label={t(label)}><Icon aria-hidden /></ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent side="bottom">{t(label)}</TooltipContent>
          </Tooltip>
        ))}
      </ToggleGroup>
    );
  },
};

export const Divider: Story = {
  render: () => {
    const t = useT();
    return (
      <div className="flex w-100 items-center gap-3 text-sm text-muted-foreground">
        <Separator className="flex-1" />
        <span>{t("signIn.divider")}</span>
        <Separator className="flex-1" />
      </div>
    );
  },
};

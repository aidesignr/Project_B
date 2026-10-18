import { MailIcon } from "lucide-react";
import { useT } from "@/i18n/useT";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Heading, IconChip, TextLink } from "@/components/auth/parts";
import { Button } from "@/components/ui/button";

export function VerifyEmail() {
  const t = useT();
  return (
    <AuthLayout>
      <div role="status" className="flex flex-col gap-4">
        <IconChip icon={MailIcon} tone="success" />
        <Heading title={t("verifyEmail.title")}>{t("verifyEmail.body")}</Heading>
        <p className="text-sm text-muted-foreground">{t("verifyEmail.spam")}</p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="outline">{t("verifyEmail.resend")}</Button>
        <TextLink to="/sign-up" className="text-sm">{t("verifyEmail.diff")}</TextLink>
      </div>
      <p className="text-sm text-muted-foreground">{t("verifyEmail.verified")} <TextLink to="/sign-in">{t("verifyEmail.signIn")}</TextLink></p>
    </AuthLayout>
  );
}

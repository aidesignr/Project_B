import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { KeyRoundIcon, MailIcon } from "lucide-react";
import { useT } from "@/i18n/useT";
import { EMAIL_RE, requestPasswordReset } from "@/lib/auth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { BackLink, ErrorBanner, FieldError, Heading, IconChip, SubmitButton, useFocusFirstError } from "@/components/auth/parts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPassword() {
  const t = useT();
  const [params] = useSearchParams();
  const expired = params.get("expired") === "1";
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const { formRef, focusFirstError } = useFocusFirstError();
  const emailError = submitted && !EMAIL_RE.test(email);

  async function send(e?: FormEvent) {
    e?.preventDefault();
    setSubmitted(true);
    if (!EMAIL_RE.test(email)) return focusFirstError();
    setBusy(true);
    await requestPasswordReset(email);
    setBusy(false);
    setSent(true);
  }

  if (sent) {
    return (
      <AuthLayout>
        <div role="status" className="flex flex-col gap-3">
          <IconChip icon={MailIcon} tone="success" />
          <Heading title={t("forgotPassword.sentTitle")}>{t("forgotPassword.sentBody")}</Heading>
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">{t("forgotPassword.noEmail")}</p>
          <Button variant="outline" className="self-start" disabled={busy} onClick={() => send()}>{t("forgotPassword.again")}</Button>
        </div>
        <BackLink to="/sign-in">{t("forgotPassword.back")}</BackLink>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <BackLink to="/sign-in">{t("forgotPassword.back")}</BackLink>
      <div className="flex flex-col gap-3">
        <IconChip icon={KeyRoundIcon} />
        <Heading title={t("forgotPassword.title")}>{t("forgotPassword.body")}</Heading>
      </div>
      {expired && <ErrorBanner title={t("forgotPassword.expTitle")}>{t("forgotPassword.expBody")}</ErrorBanner>}
      <form ref={formRef} noValidate onSubmit={send} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">{t("forgotPassword.email")}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="name@company.com"
            aria-required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={emailError}
            aria-describedby={emailError ? "email-error" : undefined}
          />
          {emailError && <FieldError id="email-error">{t("common.emailErr")}</FieldError>}
        </div>
        <SubmitButton busy={busy}>{t("forgotPassword.send")}</SubmitButton>
      </form>
      <p className="text-sm text-muted-foreground">{t("forgotPassword.sso")}</p>
    </AuthLayout>
  );
}

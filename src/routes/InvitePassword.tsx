import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useT } from "@/i18n/useT";
import { isExpiredToken } from "@/lib/auth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ErrorBanner, FieldError, Heading, PasswordInput, PasswordRules, StepProgress, SubmitButton, TextLink, passwordMeetsRules, useFocusFirstError } from "@/components/auth/parts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InvitePassword() {
  const t = useT();
  const navigate = useNavigate();
  const { token = "demo" } = useParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { formRef, focusFirstError } = useFocusFirstError();

  if (isExpiredToken(token)) {
    return (
      <AuthLayout>
        <StepProgress step={1} label={t("invitePassword.step")} />
        <Heading title={t("invitePassword.title")}>{t("invitePassword.body")}</Heading>
        <ErrorBanner title={t("invitePassword.expTitle")}>{t("invitePassword.expBody")}</ErrorBanner>
        <Button variant="outline" asChild><Link to="/sign-in">{t("invitePassword.goSignIn")}</Link></Button>
      </AuthLayout>
    );
  }

  const weak = submitted && !passwordMeetsRules(password);
  const mismatch = submitted && !weak && password !== confirm;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (passwordMeetsRules(password) && password === confirm) navigate(`/invite/${token}/authenticator`);
    else focusFirstError();
  }

  return (
    <AuthLayout>
      <StepProgress step={1} label={t("invitePassword.step")} />
      <Heading title={t("invitePassword.title")}>{t("invitePassword.body")}</Heading>
      <form ref={formRef} noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">{t("invitePassword.email")}</Label>
          <Input id="email" value="maya.chen@company.com" readOnly disabled dir="ltr" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="new-password">{t("invitePassword.pw")}</Label>
          <PasswordInput
            ns="invitePassword"
            id="new-password"
            placeholder={t("placeholder.newPassword")}
            autoComplete="new-password"
            aria-required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={weak}
            aria-describedby={weak ? "pw-error pw-rules pw-breach" : "pw-rules pw-breach"}
          />
          {weak && <FieldError id="pw-error">{t("common.weakErr")}</FieldError>}
          <PasswordRules ns="invitePassword" id="pw-rules" password={password} submitted={submitted} />
          <p id="pw-breach" className="text-sm text-muted-foreground">{t("invitePassword.breach")}</p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirm-password">{t("invitePassword.confirm")}</Label>
          <PasswordInput
            ns="invitePassword"
            id="confirm-password"
            placeholder={t("placeholder.confirmPassword")}
            autoComplete="new-password"
            aria-required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            aria-invalid={mismatch}
            aria-describedby={mismatch ? "confirm-error" : undefined}
          />
          {mismatch && <FieldError id="confirm-error">{t("common.mismatch")}</FieldError>}
        </div>
        <SubmitButton>{t("invitePassword.cont")}</SubmitButton>
      </form>
      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
        <p>{t("invitePassword.expires")}</p>
        <p>{t("invitePassword.notExpecting")} <TextLink to="/sign-in">{t("invitePassword.letUs")}</TextLink></p>
      </div>
    </AuthLayout>
  );
}

import { useState, type FormEvent } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { CheckCircle2Icon } from "lucide-react";
import { useT } from "@/i18n/useT";
import { isExpiredToken, resetPassword } from "@/lib/auth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FieldError, Heading, IconChip, PasswordInput, PasswordRules, SubmitButton, passwordMeetsRules, useFocusFirstError } from "@/components/auth/parts";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function ResetPassword() {
  const t = useT();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "demo";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const { formRef, focusFirstError } = useFocusFirstError();

  if (isExpiredToken(token)) return <Navigate to="/forgot-password?expired=1" replace />;

  const weak = submitted && !passwordMeetsRules(password);
  const mismatch = submitted && !weak && password !== confirm;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!passwordMeetsRules(password) || password !== confirm) return focusFirstError();
    setBusy(true);
    await resetPassword(token, password);
    setBusy(false);
    setDone(true);
  }

  if (done) {
    return (
      <AuthLayout>
        <div role="status" className="flex flex-col gap-3">
          <IconChip icon={CheckCircle2Icon} tone="success" />
          <Heading title={t("resetPassword.successTitle")}>{t("resetPassword.successBody")}</Heading>
        </div>
        <Button asChild><Link to="/sign-in">{t("resetPassword.goSignIn")}</Link></Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Heading title={t("resetPassword.title")}>{t("resetPassword.body")}</Heading>
      <form ref={formRef} noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="new-password">{t("resetPassword.pw")}</Label>
          <PasswordInput
            ns="resetPassword"
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
          <PasswordRules ns="resetPassword" id="pw-rules" password={password} submitted={submitted} />
          <p id="pw-breach" className="text-sm text-muted-foreground">{t("resetPassword.breach")}</p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirm-password">{t("resetPassword.confirm")}</Label>
          <PasswordInput
            ns="resetPassword"
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
        <SubmitButton busy={busy}>{t("resetPassword.save")}</SubmitButton>
      </form>
    </AuthLayout>
  );
}

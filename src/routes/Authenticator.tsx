import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { SmartphoneIcon } from "lucide-react";
import { useT } from "@/i18n/useT";
import { verifyCode } from "@/lib/auth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { BackLink, CodeInput, FieldError, Heading, IconChip, SubmitButton, TextLink, useFocusFirstError } from "@/components/auth/parts";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function Authenticator() {
  const t = useT();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [busy, setBusy] = useState(false);
  const { formRef, focusFirstError } = useFocusFirstError();

  // A short code is caught before sending; a wrong code clears as soon as it's edited.
  const error = submitted && code.length !== 6 ? t("common.codeLength") : wrong ? t("authenticator.codeErr") : null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (code.length !== 6) return focusFirstError();
    setBusy(true);
    const ok = await verifyCode(code);
    setBusy(false);
    setWrong(!ok);
    if (ok) navigate("/welcome");
    else focusFirstError();
  }

  return (
    <AuthLayout>
      <BackLink to="/sign-in">{t("authenticator.back")}</BackLink>
      <div className="flex flex-col gap-3">
        <IconChip icon={SmartphoneIcon} />
        <Heading title={t("authenticator.title")}>{t("authenticator.body")}</Heading>
      </div>
      <form ref={formRef} noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="otp">{t("authenticator.codeLabel")}</Label>
          <CodeInput
            id="otp"
            autoFocus
            aria-required
            value={code}
            onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")); setWrong(false); }}
            aria-invalid={!!error}
            aria-describedby={error ? "otp-error" : undefined}
          />
          {error && <FieldError id="otp-error">{error}</FieldError>}
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="trust" />
          <Label htmlFor="trust" className="font-normal">{t("authenticator.trust")}</Label>
        </div>
        <SubmitButton busy={busy}>{t("authenticator.verify")}</SubmitButton>
      </form>
      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
        <TextLink to="/sign-in/code" className="self-start">{t("authenticator.recovery")}</TextLink>
        <p>{t("authenticator.lost")} <TextLink to="/sign-in">{t("authenticator.contact")}</TextLink></p>
      </div>
    </AuthLayout>
  );
}

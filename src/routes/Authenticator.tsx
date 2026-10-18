import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { SmartphoneIcon } from "lucide-react";
import { useT } from "@/i18n/useT";
import { verifyCode } from "@/lib/auth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { BackLink, CodeInput, FieldError, Heading, IconChip, TextLink } from "@/components/auth/parts";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function Authenticator() {
  const t = useT();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const ok = await verifyCode(code);
    setBusy(false);
    setError(!ok);
    if (ok) navigate("/welcome");
  }

  return (
    <AuthLayout>
      <BackLink to="/sign-in">{t("authenticator.back")}</BackLink>
      <div className="flex flex-col gap-3">
        <IconChip icon={SmartphoneIcon} />
        <Heading title={t("authenticator.title")}>{t("authenticator.body")}</Heading>
      </div>
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="otp">{t("authenticator.codeLabel")}</Label>
          <CodeInput
            id="otp"
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            aria-invalid={error}
            aria-describedby={error ? "otp-error" : undefined}
          />
          {error && <FieldError id="otp-error">{t("authenticator.codeErr")}</FieldError>}
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="trust" />
          <Label htmlFor="trust" className="font-normal">{t("authenticator.trust")}</Label>
        </div>
        <Button type="submit" disabled={busy}>{t("authenticator.verify")}</Button>
      </form>
      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
        <TextLink to="/sign-in/code" className="self-start">{t("authenticator.recovery")}</TextLink>
        <p>{t("authenticator.lost")} <TextLink to="/sign-in">{t("authenticator.contact")}</TextLink></p>
      </div>
    </AuthLayout>
  );
}

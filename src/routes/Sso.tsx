import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2Icon } from "lucide-react";
import { useT } from "@/i18n/useT";
import { EMAIL_RE, startSso, type SsoResult } from "@/lib/auth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { BackLink, ErrorBanner, FieldError, Heading, IconChip, TextLink } from "@/components/auth/parts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SsoError = Extract<SsoResult, { ok: false }>["error"];

export function Sso() {
  const t = useT();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [error, setError] = useState<SsoError | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const bad = !EMAIL_RE.test(email);
    setEmailError(bad);
    if (bad) return;
    setBusy(true);
    const res = await startSso(email);
    setBusy(false);
    if (res.ok) navigate("/welcome");
    else setError(res.error);
  }

  return (
    <AuthLayout>
      <BackLink to="/sign-in">{t("sso.back")}</BackLink>
      <div className="flex flex-col gap-3">
        <IconChip icon={Building2Icon} />
        <Heading title={t("sso.title")}>{t("sso.body")}</Heading>
      </div>
      {error === "noSso" && (
        <ErrorBanner
          title={t("sso.noSsoTitle")}
          action={<Button asChild variant="outline" size="sm"><Link to="/sign-in">{t("sso.noSsoLink")}</Link></Button>}
        >
          {t("sso.noSsoBody")}
        </ErrorBanner>
      )}
      {error === "idpError" && <ErrorBanner title={t("sso.idpTitle")}>{t("sso.idpBody")}</ErrorBanner>}
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">{t("sso.email")}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={emailError}
            aria-describedby={emailError ? "email-error" : undefined}
          />
          {emailError && <FieldError id="email-error">{t("signIn.emailErr")}</FieldError>}
        </div>
        <Button type="submit" disabled={busy}>{t("sso.cont")}</Button>
      </form>
      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
        <p>{t("sso.orgQ")} <TextLink to="/sso">{t("sso.orgLink")}</TextLink></p>
        <p>{t("sso.adminQ")} <TextLink to="/sso">{t("sso.learn")}</TextLink></p>
      </div>
    </AuthLayout>
  );
}

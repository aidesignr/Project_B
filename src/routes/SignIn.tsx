import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2Icon } from "lucide-react";
import { useT } from "@/i18n/useT";
import { EMAIL_RE, signIn, signInWithGoogle } from "@/lib/auth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ErrorBanner, errorItems, FieldError, FieldErrorSummary, Heading, PasswordInput, RequiredMark, SubmitButton, TextLink, useFocusFirstError } from "@/components/auth/parts";
import { GoogleMark } from "@/components/auth/GoogleMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type Banner = "wrongCredentials" | "locked" | "googleNotLinked" | null;

export function SignIn() {
  const t = useT();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);
  const [busy, setBusy] = useState(false);
  const { formRef, focusFirstError } = useFocusFirstError();

  // Errors appear on submit, then follow the input as it's corrected.
  const emailError = submitted && !EMAIL_RE.test(email);
  const passwordMissing = submitted && !password;
  const fieldErrors = errorItems(emailError && { id: "email", label: t("signIn.email") }, passwordMissing && { id: "password", label: t("signIn.password") });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!EMAIL_RE.test(email) || !password) {
      setBanner(null); // one banner at a time: the field summary replaces an earlier sign-in error
      return focusFirstError();
    }
    setBusy(true);
    const res = await signIn(email, password);
    setBusy(false);
    if (res.ok) navigate("/sign-in/code");
    else setBanner(res.error);
  }

  async function onGoogle() {
    const res = await signInWithGoogle();
    setBanner(res.error);
  }

  return (
    <AuthLayout>
      <Heading title={t("signIn.title")}>{t("signIn.subtitle")}</Heading>

      {banner === "wrongCredentials" && <ErrorBanner title={t("signIn.wrongTitle")}>{t("signIn.wrongBody")}</ErrorBanner>}
      {banner === "locked" && (
        <ErrorBanner
          title={t("signIn.lockedTitle")}
          action={<Button asChild variant="outline" size="sm"><Link to="/forgot-password">{t("signIn.lockedLink")}</Link></Button>}
        >
          {t("signIn.lockedBody")}
        </ErrorBanner>
      )}
      {banner === "googleNotLinked" && <ErrorBanner title={t("signIn.googleTitle")}>{t("signIn.googleBody")}</ErrorBanner>}

      <div className="flex flex-col gap-3">
        <Button id="google-sign-in" variant="outline" onClick={onGoogle}><GoogleMark />{t("signIn.google")}</Button>
        <Button variant="outline" asChild><Link to="/sso"><Building2Icon aria-hidden />{t("signIn.sso")}</Link></Button>
      </div>

      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Separator className="flex-1" />
        <span>{t("signIn.divider")}</span>
        <Separator className="flex-1" />
      </div>

      <form ref={formRef} noValidate onSubmit={onSubmit} className="flex flex-col gap-3">
        <FieldErrorSummary title={t("signIn.errorsTitle")} items={fieldErrors} />
        <div className="flex flex-col gap-1">
          <Label htmlFor="email">{t("signIn.email")}<RequiredMark /></Label>
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
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t("signIn.password")}<RequiredMark /></Label>
            <TextLink to="/forgot-password" className="text-sm">{t("signIn.forgot")}</TextLink>
          </div>
          <PasswordInput
            ns="signIn"
            id="password"
            placeholder={t("placeholder.password")}
            autoComplete="current-password"
            aria-required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={passwordMissing}
            aria-describedby={passwordMissing ? "password-error" : undefined}
          />
          {passwordMissing && <FieldError id="password-error">{t("common.passwordRequired")}</FieldError>}
        </div>
        <SubmitButton className="mt-1" busy={busy} disabled={banner === "locked"}>{t("signIn.signIn")}</SubmitButton>
      </form>

      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
        <p>{t("signIn.newHere")} <TextLink to="/sign-up">{t("signIn.createAccount")}</TextLink></p>
        <p>{t("signIn.invited")} <TextLink to="/invite/demo">{t("signIn.openInvite")}</TextLink></p>
      </div>
    </AuthLayout>
  );
}

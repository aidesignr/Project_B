import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import { usePreferences } from "@/app/preferences";
import { useT } from "@/i18n/useT";
import { EMAIL_RE, signUp } from "@/lib/auth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ErrorBanner, FieldError, Heading, PasswordInput, PasswordRules, SubmitButton, TextLink, passwordMeetsRules, useFocusFirstError } from "@/components/auth/parts";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Fields = { first: string; last: string; email: string; org: string; pw: string; confirm: string };

export function SignUp() {
  const t = useT();
  const navigate = useNavigate();
  const { locale } = usePreferences();
  const [f, setF] = useState<Fields>({ first: "", last: "", email: "", org: "", pw: "", confirm: "" });
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [taken, setTaken] = useState(false);
  const [busy, setBusy] = useState(false);
  const { formRef, focusFirstError } = useFocusFirstError();
  // Read the value now: a lazy read inside the updater can see the controlled input already reset.
  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setF((s) => ({ ...s, [k]: value }));
  };

  const emailBad = submitted && !EMAIL_RE.test(f.email);
  const pwWeak = submitted && !passwordMeetsRules(f.pw);
  const mismatch = submitted && !pwWeak && f.pw !== f.confirm;
  const termsErr = submitted && !agreed;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const filled = f.first.trim() && f.last.trim() && f.org.trim();
    if (!filled || !EMAIL_RE.test(f.email) || !passwordMeetsRules(f.pw) || f.pw !== f.confirm || !agreed) return focusFirstError();
    setBusy(true);
    const res = await signUp(f.email);
    setBusy(false);
    if (res.ok) navigate("/verify-email");
    else setTaken(true);
  }

  const missing = (k: "first" | "last" | "org") => submitted && !f[k].trim();
  const requiredError = (k: "first" | "last" | "org") => missing(k) && <FieldError id={`${k}-error`}>{t("signUp.requiredErr")}</FieldError>;
  const nameField = (k: "first" | "last", auto: string) => (
    <div key={k} className="flex min-w-0 flex-col gap-2">
      <Label htmlFor={k}>{t(`signUp.${k}`)}</Label>
      <Input id={k} autoComplete={auto} placeholder={t(`placeholder.${k}`)} required aria-required value={f[k]} onChange={set(k)} aria-invalid={missing(k)} aria-describedby={missing(k) ? `${k}-error` : undefined} />
      {requiredError(k)}
    </div>
  );
  // Japanese puts the family name first.
  const names = locale === "ja" ? [nameField("last", "family-name"), nameField("first", "given-name")] : [nameField("first", "given-name"), nameField("last", "family-name")];
  const docLink = (key: string) => (chunks: ReactNode[]) => <TextLink key={key} to="/sign-up">{chunks}</TextLink>;

  return (
    <AuthLayout>
      <div className="flex flex-col gap-1">
        <Heading title={t("signUp.title")} />
        <p className="text-sm text-muted-foreground">{t("signUp.have")} <TextLink to="/sign-in">{t("signUp.signIn")}</TextLink></p>
      </div>
      {taken && (
        <ErrorBanner
          title={t("signUp.takenTitle")}
          action={<Button asChild variant="outline" size="sm"><Link to="/sign-in">{t("signUp.signIn")}</Link></Button>}
        >
          {t("signUp.takenBody")}
        </ErrorBanner>
      )}
      <form ref={formRef} noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">{t("signUp.reqNote")}</p>
        <div className="grid grid-cols-2 gap-4">{names}</div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">{t("signUp.email")}</Label>
          <Input id="email" type="email" autoComplete="email" required aria-required placeholder="name@company.com" value={f.email} onChange={set("email")} aria-invalid={emailBad} aria-describedby={emailBad ? "email-error" : undefined} />
          {emailBad && <FieldError id="email-error">{t("common.emailErr")}</FieldError>}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="org">{t("signUp.org")}</Label>
          <Input id="org" autoComplete="organization" placeholder={t("placeholder.org")} required aria-required value={f.org} onChange={set("org")} aria-invalid={missing("org")} aria-describedby={missing("org") ? "org-error" : undefined} />
          {requiredError("org")}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="new-password">{t("signUp.pw")}</Label>
          <PasswordInput ns="signUp" id="new-password" placeholder={t("placeholder.newPassword")} autoComplete="new-password" required aria-required value={f.pw} onChange={set("pw")} aria-invalid={pwWeak} aria-describedby={pwWeak ? "pw-error pw-rules" : "pw-rules"} />
          {pwWeak && <FieldError id="pw-error">{t("common.weakErr")}</FieldError>}
          <PasswordRules ns="signUp" id="pw-rules" password={f.pw} submitted={submitted} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirm-password">{t("signUp.confirm")}</Label>
          <PasswordInput ns="signUp" id="confirm-password" placeholder={t("placeholder.confirmPassword")} autoComplete="new-password" required aria-required value={f.confirm} onChange={set("confirm")} aria-invalid={mismatch} aria-describedby={mismatch ? "confirm-error" : undefined} />
          {mismatch && <FieldError id="confirm-error">{t("common.mismatch")}</FieldError>}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <Checkbox id="terms" className="mt-[2px]" checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} aria-invalid={termsErr} aria-describedby={termsErr ? "terms-error" : undefined} />
            <Label htmlFor="terms" className="font-normal">
              <FormattedMessage id="signUp.agree" values={{ terms: docLink("terms"), eval: docLink("eval") }} />
            </Label>
          </div>
          {termsErr && <FieldError id="terms-error">{t("signUp.termsErr")}</FieldError>}
        </div>
        <SubmitButton busy={busy} busyLabel={t("signUp.creating")}>{t("signUp.create")}</SubmitButton>
      </form>
    </AuthLayout>
  );
}

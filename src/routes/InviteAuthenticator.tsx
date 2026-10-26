import { useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CopyIcon } from "lucide-react";
import { useT } from "@/i18n/useT";
import { verifyCode } from "@/lib/auth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { BackLink, CodeInput, FieldError, Heading, StepProgress, SubmitButton, useFocusFirstError } from "@/components/auth/parts";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import qrCode from "@/assets/qr-code.png";

// Demo key (mock auth). Shown in groups of 4 for reading; copied without spaces.
const SETUP_KEY = "JBSWY3DPEHPK3PXPMFRGGZDF";
const SETUP_KEY_GROUPS = SETUP_KEY.match(/.{1,4}/g)!.join(" ");

export function InviteAuthenticator() {
  const t = useT();
  const navigate = useNavigate();
  const { token = "demo" } = useParams();
  const [code, setCode] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const { formRef, focusFirstError } = useFocusFirstError();

  // A short code is caught before sending; a wrong code clears as soon as it's edited.
  const error = submitted && code.length !== 6 ? t("common.codeLength") : wrong ? t("inviteAuthenticator.codeErr") : null;

  async function copyKey() {
    try { await navigator.clipboard.writeText(SETUP_KEY); } catch { /* clipboard blocked; tooltip still confirms intent */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (code.length !== 6) return focusFirstError();
    setBusy(true);
    const ok = await verifyCode(code);
    setBusy(false);
    setWrong(!ok);
    if (ok) navigate(`/invite/${token}/recovery-codes`);
    else focusFirstError();
  }

  const copyLabel = copied ? t("common.copied") : t("inviteAuthenticator.copy");

  return (
    <AuthLayout>
      <StepProgress step={2} label={t("inviteAuthenticator.step")} />
      <Heading title={t("inviteAuthenticator.title")}>{t("inviteAuthenticator.body")}</Heading>
      <div className="flex items-start gap-6">
        <img src={qrCode} alt={t("inviteAuthenticator.qr")} className="size-32 shrink-0 rounded-md border border-control-border" />
        <ol className="m-0 flex list-decimal flex-col gap-2 ps-5 text-sm marker:text-muted-foreground">
          <li>{t("inviteAuthenticator.s1")}</li>
          <li>{t("inviteAuthenticator.s2")}</li>
          <li>{t("inviteAuthenticator.s3")}</li>
        </ol>
      </div>
      <div className="flex flex-col gap-2">
        <span id="key-label" className="text-sm font-medium">{t("inviteAuthenticator.keyLabel")}</span>
        <div dir="ltr" className="flex h-8 items-center gap-2 rounded-md border border-control-border bg-surface-0 ps-3 pe-1">
          <code aria-labelledby="key-label" className="grow font-mono text-sm font-medium tracking-[0.08em]">{SETUP_KEY_GROUPS}</code>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="icon-sm" aria-label={copyLabel} onClick={copyKey}>
                <CopyIcon aria-hidden />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{copyLabel}</TooltipContent>
          </Tooltip>
        </div>
        <span role="status" className="sr-only">{copied ? t("common.copied") : ""}</span>
      </div>
      <form ref={formRef} noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="setup-otp">{t("inviteAuthenticator.code")}</Label>
          <CodeInput
            id="setup-otp"
            aria-required
            value={code}
            onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")); setWrong(false); }}
            aria-invalid={!!error}
            aria-describedby={error ? "otp-error" : undefined}
          />
          {error && <FieldError id="otp-error">{error}</FieldError>}
        </div>
        <div className="flex items-center justify-between gap-4">
          <BackLink to={`/invite/${token}`}>{t("inviteAuthenticator.back")}</BackLink>
          <SubmitButton busy={busy}>{t("inviteAuthenticator.verify")}</SubmitButton>
        </div>
      </form>
    </AuthLayout>
  );
}

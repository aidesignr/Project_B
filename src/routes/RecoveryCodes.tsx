import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { CopyIcon, DownloadIcon } from "lucide-react";
import { useT } from "@/i18n/useT";
import { RECOVERY_CODES } from "@/lib/auth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FieldError, Heading, RequiredMark, StepProgress, SubmitButton, useFocusFirstError } from "@/components/auth/parts";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function RecoveryCodes() {
  const t = useT();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const { formRef, focusFirstError } = useFocusFirstError();

  function download() {
    const url = URL.createObjectURL(new Blob([RECOVERY_CODES.join("\n") + "\n"], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url; a.download = "accuknox-recovery-codes.txt"; a.click();
    URL.revokeObjectURL(url);
  }

  async function copy() {
    try { await navigator.clipboard.writeText(RECOVERY_CODES.join("\n")); } catch { /* clipboard blocked */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(!saved);
    if (saved) navigate("/sign-in");
    else focusFirstError();
  }

  return (
    <AuthLayout>
      <StepProgress step={3} label={t("recoveryCodes.step")} />
      <Heading title={t("recoveryCodes.title")}>{t("recoveryCodes.body")}</Heading>
      <ul aria-label={t("recoveryCodes.list")} dir="ltr" className="m-0 grid list-none grid-cols-2 gap-x-6 gap-y-2 rounded-md border border-control-border bg-surface-0 p-4 font-mono text-sm font-medium tracking-[0.04em]">
        {RECOVERY_CODES.map((c) => <li key={c}>{c}</li>)}
      </ul>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={download}><DownloadIcon aria-hidden />{t("recoveryCodes.download")}</Button>
        <Button variant="outline" onClick={copy}><CopyIcon aria-hidden />{copied ? t("common.copied") : t("recoveryCodes.copy")}</Button>
      </div>
      <form ref={formRef} noValidate onSubmit={onSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Checkbox
              id="saved"
              aria-required
              checked={saved}
              onCheckedChange={(v) => { setSaved(v === true); if (v) setError(false); }}
              aria-invalid={error}
              aria-describedby={error ? "saved-error" : undefined}
            />
            <Label htmlFor="saved" className="font-normal">{t("recoveryCodes.saved")}<RequiredMark /></Label>
          </div>
          {error && <FieldError id="saved-error">{t("recoveryCodes.savedErr")}</FieldError>}
        </div>
        <SubmitButton>{t("recoveryCodes.finish")}</SubmitButton>
      </form>
    </AuthLayout>
  );
}

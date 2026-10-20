import { useEffect, useRef, useState, type FormEvent } from "react";
import { BotIcon, SendHorizontalIcon, SparklesIcon, XIcon } from "lucide-react";
import { useT } from "@/i18n/useT";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useShell } from "./shell-context";

export const ASKAI_PANEL_ID = "askai-panel";
const TRIGGER_ID = "askai-trigger";

/** Header entry point for AskAI (D-026): same place on every page, accent-styled. */
export function AskAIButton() {
  const t = useT();
  const { askAIOpen, setAskAIOpen } = useShell();
  return (
    <button
      id={TRIGGER_ID}
      data-slot="askai-trigger"
      type="button"
      aria-expanded={askAIOpen}
      aria-controls={ASKAI_PANEL_ID}
      onClick={() => setAskAIOpen(!askAIOpen)}
      className={cn(
        "flex h-8 shrink-0 items-center gap-2 rounded-md border border-info-foreground/40 bg-info-muted px-3 text-sm font-medium text-info-foreground outline-none transition-colors hover:border-info-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        askAIOpen && "border-info-foreground",
      )}
    >
      <BotIcon className="size-4" aria-hidden />
      <span className="@max-3xl:sr-only">{t("shell.askai.label")}</span>
    </button>
  );
}

const SUGGESTIONS = ["shell.askai.suggestion.fixFirst", "shell.askai.suggestion.compliance", "shell.askai.suggestion.critical"];

/**
 * Non-modal assistant panel on the inline-end side (02 extension log: composed from Sheet,
 * non-modal). It sits below the header so the header stays usable; Esc or Close returns focus
 * to the AskAI button.
 */
export function AskAIPanel() {
  const t = useT();
  const { askAIOpen, setAskAIOpen } = useShell();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft] = useState("");
  const [asked, setAsked] = useState<string[]>([]);

  useEffect(() => {
    if (askAIOpen) inputRef.current?.focus();
  }, [askAIOpen]);

  if (!askAIOpen) return null;

  const close = () => {
    setAskAIOpen(false);
    document.getElementById(TRIGGER_ID)?.focus();
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = draft.trim();
    if (!q) return;
    setAsked((a) => [...a, q]);
    setDraft("");
  };

  return (
    <aside
      id={ASKAI_PANEL_ID}
      aria-labelledby="askai-title"
      onKeyDown={(e) => e.key === "Escape" && close()}
      className="absolute top-(--layout-header) bottom-0 end-0 z-40 flex w-(--layout-detail-panel) max-w-full flex-col border-s border-border bg-surface-2 shadow-3"
    >
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-border ps-4 pe-2">
        <BotIcon className="size-5 text-info-foreground" aria-hidden />
        <h2 id="askai-title" className="text-sm font-semibold">{t("shell.askai.label")}</h2>
        <span className="inline-flex h-5 items-center gap-1 rounded-sm border border-control-border px-1 text-xs text-muted-foreground">
          <SparklesIcon className="size-3" aria-hidden />
          {t("shell.askai.aiLabel")}
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="ms-auto" aria-label={t("shell.askai.close")} onClick={close}>
              <XIcon aria-hidden />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{t("shell.askai.close")}</TooltipContent>
        </Tooltip>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4" aria-live="polite">
        <p className="text-sm">{t("shell.askai.intro")}</p>
        {asked.length === 0 ? (
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-medium text-muted-foreground">{t("shell.askai.suggestions")}</h3>
            <ul className="flex flex-col gap-2">
              {SUGGESTIONS.map((key) => (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => { setDraft(t(key)); inputRef.current?.focus(); }}
                    className="w-full rounded-md border border-control-border px-3 py-2 text-start text-sm outline-none transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {t(key)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          asked.map((q, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="self-end rounded-md bg-muted px-3 py-2 text-sm">
                <span className="sr-only">{t("shell.askai.you")}{" "}</span>
                {q}
              </div>
              <div className="rounded-md border border-dashed border-control-border px-3 py-2 text-sm text-muted-foreground">
                {t("shell.askai.pending")}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={submit} className="flex flex-col gap-2 border-t border-border px-4 pt-3 pb-4">
        <label htmlFor="askai-input" className="sr-only">{t("shell.askai.input")}</label>
        <div className="flex items-end gap-2">
          <textarea
            id="askai-input"
            ref={inputRef}
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) submit(e); }}
            placeholder={t("shell.askai.placeholder")}
            className="min-h-14 flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
          <Button type="submit" size="icon" aria-label={t("shell.askai.send")} disabled={!draft.trim()}>
            <SendHorizontalIcon className="rtl:-scale-x-100" aria-hidden />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{t("shell.askai.disclaimer")}</p>
      </form>
    </aside>
  );
}

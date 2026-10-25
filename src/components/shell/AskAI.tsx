import { useEffect, useRef, useState, type FormEvent } from "react";
import { BotIcon, SendHorizontalIcon, SquarePenIcon, XIcon } from "lucide-react";
import { useT } from "@/i18n/useT";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useShell } from "./shell-context";

export const ASKAI_PANEL_ID = "askai-panel";
const TRIGGER_ID = "askai-trigger";

/** Header entry point for AskAI (D-026): same place on every page; filled primary while open. */
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
        "flex h-8 shrink-0 items-center gap-2 rounded-md border px-3 text-sm font-medium outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        askAIOpen
          ? "border-primary bg-primary text-primary-foreground"
          : "border-transparent bg-info-muted text-info-foreground hover:border-info-foreground",
      )}
    >
      <BotIcon className="size-4" aria-hidden />
      <span className="@max-3xl:sr-only">{t("shell.askai.label")}</span>
    </button>
  );
}

const SUGGESTIONS = ["shell.askai.suggestion.fixFirst", "shell.askai.suggestion.compliance", "shell.askai.suggestion.critical"];

/**
 * AskAI widget (canvas "A2 · Components", 2a–2d): docked on the inline-end side at full viewport
 * height. At 1280px and wider the app resizes to make room; below that it overlays the app with a
 * scrim. Non-modal: Esc, Close or the scrim returns focus to the AskAI button.
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

  const close = () => {
    setAskAIOpen(false);
    document.getElementById(TRIGGER_ID)?.focus();
  };
  const newChat = () => {
    setAsked([]);
    setDraft("");
    inputRef.current?.focus();
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = draft.trim();
    if (!q) return;
    setAsked((a) => [...a, q]);
    setDraft("");
  };

  return (
    <>
      {askAIOpen && <div aria-hidden data-slot="askai-scrim" onClick={close} className="absolute inset-0 z-40 bg-black/60 lg:hidden" />}
      <div
        data-slot="askai-dock"
        data-state={askAIOpen ? "open" : "closed"}
        className={cn(
          "relative shrink-0 overflow-hidden transition-[width] duration-(--duration-base) ease-standard",
          "max-lg:absolute max-lg:inset-y-0 max-lg:end-0 max-lg:z-50 max-lg:transition-none",
          askAIOpen ? "w-100 border-s border-border max-lg:shadow-3" : "w-0",
        )}
      >
        {askAIOpen && (
          <aside
            id={ASKAI_PANEL_ID}
            aria-labelledby="askai-title"
            onKeyDown={(e) => e.key === "Escape" && close()}
            className="flex h-full w-100 flex-col bg-surface-2"
          >
            <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border ps-4 pe-2">
              <BotIcon className="size-4 text-info-foreground" aria-hidden />
              <h2 id="askai-title" className="text-sm font-semibold">{t("shell.askai.label")}</h2>
              <span className="inline-flex h-5 items-center rounded-sm border border-control-border px-1 text-xs text-muted-foreground">
                {t("shell.askai.aiLabel")}
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button data-slot="askai-new-chat" variant="ghost" size="icon" className="ms-auto" aria-label={t("shell.askai.newChat")} onClick={newChat}>
                    <SquarePenIcon aria-hidden />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="end">{t("shell.askai.newChat")}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button data-slot="askai-close" variant="ghost" size="icon" aria-label={t("shell.askai.close")} onClick={close}>
                    <XIcon aria-hidden />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="end">{t("shell.askai.close")}</TooltipContent>
              </Tooltip>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 text-xs" aria-live="polite">
              <p className="text-sm">{t("shell.askai.intro")}</p>
              {asked.length === 0 ? (
                <div className="flex flex-col gap-2">
                  <h3 className="font-medium text-muted-foreground">{t("shell.askai.suggestions")}</h3>
                  <ul className="flex flex-col gap-2">
                    {SUGGESTIONS.map((key) => (
                      <li key={key}>
                        <button
                          type="button"
                          onClick={() => { setDraft(t(key)); inputRef.current?.focus(); }}
                          className="w-full rounded-md border border-control-border bg-background px-3 py-2 text-start outline-none transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
                    <div className="self-end rounded-md bg-muted px-3 py-2">
                      <span className="sr-only">{t("shell.askai.you")}{" "}</span>
                      {q}
                    </div>
                    <div className="rounded-md border border-dashed border-control-border px-3 py-2 text-muted-foreground">
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
                  className="min-h-14 flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-xs outline-none placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                />
                <Button type="submit" size="icon" aria-label={t("shell.askai.send")} disabled={!draft.trim()}>
                  <SendHorizontalIcon className="rtl:-scale-x-100" aria-hidden />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{t("shell.askai.disclaimer")}</p>
            </form>
          </aside>
        )}
      </div>
    </>
  );
}

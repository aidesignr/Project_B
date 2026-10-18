import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { usePreferences } from "@/app/preferences";
import { useT } from "@/i18n/useT";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import logoOnDark from "@/assets/accuknox-logo-on-dark.png";
import logoOnLight from "@/assets/accuknox-logo-on-light.png";
import shotData from "@/assets/shot-data-security.png";
import shotAgents from "@/assets/shot-ai-agent-graph.png";
import shotFirewall from "@/assets/shot-prompt-firewall.png";
import shotCost from "@/assets/shot-k8s-cost.png";

const SHOTS = [shotData, shotAgents, shotFirewall, shotCost];

/**
 * Start-side feature pane on every auth screen (approved "browser frame" layout).
 * Cycles 4 product screenshots; always opens on the first one.
 */
export function FeatureCarousel() {
  const t = useT();
  const { theme } = usePreferences();
  const [index, setIndex] = useState(0);
  const total = SHOTS.length;
  const go = (i: number) => setIndex((i + total) % total);
  const title = (i: number) => t(`features.cards.${i + 1}.title`);
  const position = t("features.position", { current: index + 1, total });

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t("features.region")}
      className="flex min-h-full flex-col gap-8 bg-pane p-12"
    >
      <img src={theme === "light" ? logoOnLight : logoOnDark} alt="AccuKnox" className="-my-2 -ms-2 h-11 w-auto self-start" />

      <div className="flex grow flex-col items-center justify-center gap-6">
        <p className="w-full max-w-136 text-2xl font-semibold text-foreground">{t("features.headline")}</p>
        <figure role="group" aria-roledescription="slide" aria-label={position} className="m-0 flex w-full max-w-136 flex-col gap-4">
          <div className="overflow-hidden rounded-xl border border-border bg-popover shadow-3">
            <div aria-hidden className="flex h-7 items-center gap-2 border-b border-border px-3">
              <span className="size-2 rounded-full bg-dot" />
              <span className="size-2 rounded-full bg-dot" />
              <span className="size-2 rounded-full bg-dot" />
            </div>
            <div className="aspect-video">
              <img src={SHOTS[index]} alt={t("features.shotAlt", { title: title(index) })} className="size-full object-cover object-left-top" />
            </div>
          </div>
          <figcaption className="flex flex-col gap-1">
            <span className="text-lg font-semibold text-foreground">{title(index)}</span>
            <span className="text-sm text-muted-foreground">{t(`features.cards.${index + 1}.caption`)}</span>
          </figcaption>
        </figure>
      </div>

      <div className="flex items-center justify-center gap-4">
        <CarouselButton label={t("features.prev")} onClick={() => go(index - 1)}>
          <ChevronLeftIcon className="rtl:-scale-x-100" aria-hidden />
        </CarouselButton>
        <div className="flex items-center">
          {SHOTS.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={t("features.showSlide", { n: i + 1, title: title(i) })}
              aria-current={i === index}
              onClick={() => go(i)}
              className="group flex size-6 items-center justify-center rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-ring"
            >
              <span className={cn("h-2 rounded-full transition-all motion-reduce:transition-none", i === index ? "w-6 bg-ring" : "w-2 bg-dot group-hover:bg-muted-foreground")} />
            </button>
          ))}
        </div>
        <CarouselButton label={t("features.next")} onClick={() => go(index + 1)}>
          <ChevronRightIcon className="rtl:-scale-x-100" aria-hidden />
        </CarouselButton>
        <span aria-live="polite" className="text-sm text-muted-foreground">{position}</span>
      </div>
    </section>
  );
}

function CarouselButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          onClick={onClick}
          className="flex size-10 items-center justify-center rounded-full border border-control-border text-foreground outline-none hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&_svg]:size-4"
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

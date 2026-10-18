import { GlobeIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { usePreferences, type ThemePref } from "@/app/preferences";
import { LOCALES, LOCALE_NAMES, type Locale } from "@/i18n/locales";
import { useT } from "@/i18n/useT";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const THEMES: { value: ThemePref; icon: typeof SunIcon; label: string }[] = [
  { value: "light", icon: SunIcon, label: "common.light" },
  { value: "dark", icon: MoonIcon, label: "common.dark" },
  { value: "system", icon: MonitorIcon, label: "common.system" },
];

/** Language and theme switch shown at the top-end of every auth screen. */
export function Toolbar() {
  const t = useT();
  const { locale, setLocale, themePref, setThemePref } = usePreferences();
  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <div className="flex items-center gap-2">
        <GlobeIcon className="size-4 text-muted-foreground" aria-hidden />
        <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
          <SelectTrigger className="w-32" aria-label={t("common.language")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LOCALES.map((l) => (
              <SelectItem key={l} value={l} lang={l}>{LOCALE_NAMES[l]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ToggleGroup
        type="single"
        value={themePref}
        onValueChange={(v) => v && setThemePref(v as ThemePref)}
        aria-label={t("common.theme")}
      >
        {THEMES.map(({ value, icon: Icon, label }) => (
          <Tooltip key={value}>
            <TooltipTrigger asChild>
              <ToggleGroupItem value={value} aria-label={t(label)}>
                <Icon aria-hidden />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent side="bottom">{t(label)}</TooltipContent>
          </Tooltip>
        ))}
      </ToggleGroup>
    </div>
  );
}

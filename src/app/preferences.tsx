import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { LOCALES, isRtl, type Locale } from "@/i18n/locales";

export type ThemePref = "light" | "dark" | "system";

type Preferences = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  themePref: ThemePref;
  setThemePref: (t: ThemePref) => void;
  theme: "light" | "dark";
};

const PreferencesContext = createContext<Preferences | null>(null);

const read = (key: string) => { try { return localStorage.getItem(key); } catch { return null; } };
const write = (key: string, value: string) => { try { localStorage.setItem(key, value); } catch { /* private mode */ } };

function initialLocale(): Locale {
  const saved = read("ak.locale");
  if (saved && (LOCALES as readonly string[]).includes(saved)) return saved as Locale;
  const nav = typeof navigator !== "undefined" ? navigator.language.slice(0, 2) : "en";
  return (LOCALES as readonly string[]).includes(nav) ? (nav as Locale) : "en";
}

function initialTheme(): ThemePref {
  const saved = read("ak.theme");
  return saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
}

const prefersDark = () => typeof window === "undefined" || !window.matchMedia || window.matchMedia("(prefers-color-scheme: dark)").matches;

/**
 * `locale` / `themePref` props drive the preferences from outside (Storybook toolbar) and are
 * followed when they change, without remounting children; otherwise values come from storage.
 */
export function PreferencesProvider({ children, locale: fixedLocale, themePref: fixedTheme }: { children: ReactNode; locale?: Locale; themePref?: ThemePref }) {
  const [locale, setLocaleState] = useState<Locale>(() => fixedLocale ?? initialLocale());
  const [themePref, setThemePrefState] = useState<ThemePref>(() => fixedTheme ?? initialTheme());
  const [osDark, setOsDark] = useState(prefersDark);

  useEffect(() => { if (fixedLocale) setLocaleState(fixedLocale); }, [fixedLocale]);
  useEffect(() => { if (fixedTheme) setThemePrefState(fixedTheme); }, [fixedTheme]);


  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return;
    const onChange = () => setOsDark(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const theme = themePref === "system" ? (osDark ? "dark" : "light") : themePref;

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.lang = locale;
    root.dir = isRtl(locale) ? "rtl" : "ltr";
  }, [theme, locale]);

  const value = useMemo<Preferences>(() => ({
    locale,
    setLocale: (l) => { setLocaleState(l); write("ak.locale", l); },
    themePref,
    setThemePref: (t) => { setThemePrefState(t); write("ak.theme", t); },
    theme,
  }), [locale, themePref, theme]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used inside PreferencesProvider");
  return ctx;
}

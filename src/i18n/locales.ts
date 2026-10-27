import en from "./messages/en.json";
import ar from "./messages/ar.json";
import ja from "./messages/ja.json";
import { extraMessages } from "./extra";
import { shellMessages } from "./shell";
import { findingsMessages } from "./findings";
import { findingDetailMessages } from "./findingDetail";
import { reportsMessages } from "./reports";

export const LOCALES = ["en", "ar", "ja"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_NAMES: Record<Locale, string> = { en: "English", ar: "العربية", ja: "日本語" };

// Arabic uses Western digits by default (D-007); technical values stay Western everywhere.
export const INTL_LOCALE: Record<Locale, string> = { en: "en", ar: "ar-u-nu-latn", ja: "ja" };

export const isRtl = (locale: Locale) => locale === "ar";

export function messagesFor(locale: Locale): Record<string, string> {
  const base = { en, ar, ja }[locale] as Record<string, string>;
  return { ...base, ...extraMessages[locale], ...shellMessages[locale], ...findingsMessages[locale], ...findingDetailMessages[locale], ...reportsMessages[locale] };
}

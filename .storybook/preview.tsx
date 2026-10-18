import type { Decorator, Preview } from "@storybook/react-vite";
import { IntlProvider } from "react-intl";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PreferencesProvider, type ThemePref } from "@/app/preferences";
import { INTL_LOCALE, isRtl, messagesFor, type Locale } from "@/i18n/locales";
import { TooltipProvider } from "@/components/ui/tooltip";
import "@/index.css";

/**
 * Every story gets the app's providers. The toolbar's Theme and Language switches update
 * those preferences in place (data-theme, lang and dir on <html>) without remounting the
 * story, so play functions keep their filled-in state.
 * Screens can set `parameters.route` (URL) and `parameters.path` (route pattern).
 */
const withApp: Decorator = (Story, context) => {
  const locale = context.globals.locale as Locale;
  const themePref = context.globals.theme as ThemePref;
  const route = (context.parameters.route as string | undefined) ?? "/";
  const path = (context.parameters.path as string | undefined) ?? "*";
  const root = document.documentElement;
  root.dataset.theme = themePref === "light" ? "light" : "dark";
  root.lang = locale;
  root.dir = isRtl(locale) ? "rtl" : "ltr";
  return (
    <PreferencesProvider locale={locale} themePref={themePref}>
      <IntlProvider locale={INTL_LOCALE[locale]} messages={messagesFor(locale)} defaultLocale="en">
        <TooltipProvider>
          <MemoryRouter initialEntries={[route]}>
            <Routes>
              <Route path={path} element={<Story />} />
              <Route path="*" element={<Story />} />
            </Routes>
          </MemoryRouter>
        </TooltipProvider>
      </IntlProvider>
    </PreferencesProvider>
  );
};

const preview: Preview = {
  decorators: [withApp],
  globalTypes: {
    theme: {
      description: "Color theme",
      toolbar: { title: "Theme", icon: "mirror", items: [{ value: "dark", title: "Dark" }, { value: "light", title: "Light" }], dynamicTitle: true },
    },
    locale: {
      description: "Language",
      toolbar: { title: "Language", icon: "globe", items: [{ value: "en", title: "English" }, { value: "ar", title: "العربية (RTL)" }, { value: "ja", title: "日本語" }], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: "dark", locale: "en" },
  parameters: {
    layout: "centered",
    backgrounds: { disable: true },
    controls: { expanded: true },
    // WCAG 2.2 AA (D-041). Violations show in the Accessibility panel.
    a11y: { config: { rules: [] }, options: { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] } },
  },
};

export default preview;

import { IntlProvider } from "react-intl";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { INTL_LOCALE, messagesFor } from "@/i18n/locales";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PreferencesProvider, usePreferences } from "./preferences";
import { SignIn } from "@/routes/SignIn";
import { Authenticator } from "@/routes/Authenticator";
import { ForgotPassword } from "@/routes/ForgotPassword";
import { ResetPassword } from "@/routes/ResetPassword";
import { InvitePassword } from "@/routes/InvitePassword";
import { InviteAuthenticator } from "@/routes/InviteAuthenticator";
import { RecoveryCodes } from "@/routes/RecoveryCodes";
import { Sso } from "@/routes/Sso";
import { SignUp } from "@/routes/SignUp";
import { VerifyEmail } from "@/routes/VerifyEmail";
import { Welcome } from "@/routes/Welcome";
import { ModulePage } from "@/routes/ModulePage";
import { FindingsPage } from "@/routes/FindingsPage";
import { XbomProjectsPage } from "@/routes/XbomProjectsPage";
import { ReportConfigPage } from "@/routes/ReportConfigPage";
import { AppShell } from "@/components/shell/AppShell";

function LocalizedApp() {
  const { locale } = usePreferences();
  return (
    <IntlProvider locale={INTL_LOCALE[locale]} messages={messagesFor(locale)} defaultLocale="en">
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/sign-in" replace />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-in/code" element={<Authenticator />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/invite/:token" element={<InvitePassword />} />
            <Route path="/invite/:token/authenticator" element={<InviteAuthenticator />} />
            <Route path="/invite/:token/recovery-codes" element={<RecoveryCodes />} />
            <Route path="/sso" element={<Sso />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route element={<AppShell />}>
              <Route path="/findings" element={<FindingsPage />} />
              <Route path="/xbom/projects" element={<XbomProjectsPage />} />
              <Route path="/reports/templates/:templateId" element={<ReportConfigPage />} />
              <Route path="/:module" element={<ModulePage />} />
              <Route path="/:module/:sub" element={<ModulePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/sign-in" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </IntlProvider>
  );
}

export function App() {
  return (
    <PreferencesProvider>
      <LocalizedApp />
    </PreferencesProvider>
  );
}

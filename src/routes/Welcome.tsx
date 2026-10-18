import { Link } from "react-router-dom";
import { ShieldCheckIcon } from "lucide-react";
import { useT } from "@/i18n/useT";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Heading, IconChip } from "@/components/auth/parts";
import { Button } from "@/components/ui/button";

/** Stand-in for the console after a successful sign-in. */
export function Welcome() {
  const t = useT();
  return (
    <AuthLayout>
      <div role="status" className="flex flex-col gap-3">
        <IconChip icon={ShieldCheckIcon} tone="success" />
        <Heading title={t("welcome.title")}>{t("welcome.body")}</Heading>
      </div>
      <Button variant="outline" asChild className="self-start"><Link to="/sign-in">{t("welcome.signOut")}</Link></Button>
    </AuthLayout>
  );
}

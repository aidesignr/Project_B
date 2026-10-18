import { useIntl } from "react-intl";
import type { PrimitiveType } from "intl-messageformat";

/** Short translator: t("signIn.title"), t("features.position", { current: 1, total: 4 }). */
export function useT() {
  const intl = useIntl();
  return (id: string, values?: Record<string, PrimitiveType>) => intl.formatMessage({ id }, values);
}

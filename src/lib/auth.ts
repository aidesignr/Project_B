// Mock auth service. There is no backend yet; these rules make every error state
// reachable in the browser (listed in README → "Login app"). Replace with real API calls.
const wait = (ms = 600) => new Promise((r) => setTimeout(r, ms));

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const domain = (email: string) => email.split("@")[1]?.toLowerCase() ?? "";

export type SignInResult = { ok: true } | { ok: false; error: "wrongCredentials" | "locked" };

export async function signIn(email: string, password: string): Promise<SignInResult> {
  await wait();
  if (email.toLowerCase().startsWith("locked@")) return { ok: false, error: "locked" };
  if (password === "incorrect") return { ok: false, error: "wrongCredentials" };
  return { ok: true };
}

/** The demo Google account is never linked to an AccuKnox organization. */
export async function signInWithGoogle(): Promise<{ ok: false; error: "googleNotLinked" }> {
  await wait(300);
  return { ok: false, error: "googleNotLinked" };
}

/** Any 6-digit code works except 000000. */
export async function verifyCode(code: string): Promise<boolean> {
  await wait();
  return /^\d{6}$/.test(code) && code !== "000000";
}

export async function requestPasswordReset(_email: string): Promise<void> {
  await wait();
}

export async function resetPassword(_token: string, _password: string): Promise<void> {
  await wait();
}

export type SsoResult = { ok: true } | { ok: false; error: "noSso" | "idpError" };

export async function startSso(email: string): Promise<SsoResult> {
  await wait();
  if (domain(email) === "nosso.com") return { ok: false, error: "noSso" };
  if (domain(email) === "idp-error.com") return { ok: false, error: "idpError" };
  return { ok: true };
}

export type SignUpResult = { ok: true } | { ok: false; error: "emailTaken" };

export async function signUp(email: string): Promise<SignUpResult> {
  await wait(1200);
  if (email.toLowerCase().startsWith("taken@")) return { ok: false, error: "emailTaken" };
  return { ok: true };
}

export const isExpiredToken = (token: string | null | undefined) => token === "expired";

/** Demo recovery codes (placeholders, like the canvas). */
export const RECOVERY_CODES = Array.from({ length: 10 }, (_, i) => `[code ${i + 1}]`);

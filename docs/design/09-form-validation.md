# 09 · Forms and validation

How form fields look, when we check them, and how we tell people what to fix.
This covers the login app's forms today (`src/routes/`) and is the default for product forms (settings, integrations, policies) later.
Every rule cites its source: a file, a decision (`decision-log.md`) or a WCAG 2.2 criterion. Gaps between these rules and the code are listed under [Open issues](#open-issues).

## Principles

| # | Rule | Why (priority, 02) | Source |
|---|---|---|---|
| 1 | Every field has a visible label. Its placeholder shows an example or the expected entry, never the label. | 1 · Accessibility: placeholders disappear on input and aren't read reliably | WCAG 1.3.1, 3.3.2 · `Label` + `placeholder` in every route |
| 2 | Check on submit, not while people type. The password checklist is the one live aid, and it stays neutral until submit. | 2 · Clarity: red text mid-typing reads as an alarm for work in progress | `noValidate` + `submitted` state in `SignUp.tsx`, `ResetPassword.tsx`, `InvitePassword.tsx` · `PasswordRules` |
| 3 | Put the error next to the field it's about and say how to fix it. | 1 · Accessibility, 2 · Clarity | WCAG 3.3.1, 3.3.3 · `FieldError` · 06 errors pattern |
| 4 | Never use color alone: icon + text, plus an error border on the input. | 1 · Accessibility | WCAG 1.4.1 · `FieldError`, `aria-invalid:border-error-border` in `components/ui/input.tsx` |
| 5 | Field problems go at the field; problems with the account or request go in one banner at the top. | 2 · Clarity, alert fatigue (02) | CLAUDE.md "Max 1 page banner" · `ErrorBanner` |
| 6 | Keep what people typed. An error never clears a field. | 1 · Accessibility, 2 · Clarity | WCAG 3.3.7 · controlled inputs keep state in every route |
| 7 | Let password managers and paste work: correct `autocomplete`, no paste blocking, show/hide on passwords. | 1 · Accessibility, user safety | WCAG 1.3.5, 3.3.8 · `PasswordInput`, `CodeInput` |

## Anatomy of a field

```
Label                              (optional inline link, e.g. "Forgot password?")
[ Placeholder text            👁 ]  ← input, 32px
○ Rule or helper text               ← 12/16, muted until submit
⊘ Error message                     ← 12/16, error-foreground, after submit only
```

| Part | Spec | Source |
|---|---|---|
| Label | `text-sm` 14/20, weight 500, always visible, linked with `htmlFor` | `components/ui/label.tsx` |
| Placeholder | `text-muted-foreground`; an example (`name@company.com`, `000000`) or a short instruction ("Enter your first name", "Create a password", "Re-enter your password"). Translated (en/ar/ja). | `src/i18n/extra.ts` `placeholder.*` |
| Input | 32px high (`h-8`), `rounded-md`, `border-input`; error border `error-border` when `aria-invalid` | `components/ui/input.tsx` · 03 dense defaults |
| Code input | 40px high, Geist Mono 20px, centered, 6 digits, numeric keyboard | `CodeInput` in `parts.tsx` |
| Helper / rules text | `text-xs` 12/16 | `PasswordRules` in `parts.tsx` |
| Error | `text-xs` 12/16, `error-foreground`, 16px `CircleAlert` icon + text | `FieldError` in `parts.tsx` · 03 type scale |
| Required note | One line above the fields, "All fields are required.", plus `aria-required` on each field. No asterisks in code. | `SignUp.tsx` `signUp.reqNote` |
| Spacing | `gap-2` (8px) inside a field · `gap-4` (16px) between fields and between a field and the submit button · 2-column rows use `gap-4` | `SignUp.tsx`, `SignIn.tsx` |

## When to validate

| Moment | What happens | Where in code |
|---|---|---|
| Typing, before the first submit | Nothing turns red. The password checklist ticks rules green as they're met (unmet rules stay neutral). | `PasswordRules` (`submitted=false`) |
| Submit | Client checks run: required fields, email format (`EMAIL_RE`), password rules, matching passwords, terms checkbox. Every failing field shows its error at once (sign-in checks only the email). | `onSubmit` in each route |
| After a failed submit | Sign-up, reset and invite re-check as people type, so an error clears as soon as the field is fixed. Sign-in and code fields keep their error until the next submit (see Open issues). | `submitted` state vs `emailError` / `error` state |
| Confirm password | "Passwords don't match" shows only once the first password meets the rules, so people fix one thing at a time. | `mismatch` in `SignUp.tsx`, `ResetPassword.tsx`, `InvitePassword.tsx` |
| Server response | Account-level results (wrong email or password, locked, email already registered, Google account not linked, expired link) show as one `ErrorBanner`. A wrong code shows as a field error on the code input. | `SignIn.tsx`, `SignUp.tsx`, `Authenticator.tsx`, `InviteAuthenticator.tsx` |
| Waiting | The submit button is disabled while the request runs; sign-up also shows a spinner and "Creating account…" with `aria-busy`. | `busy` state |

## Writing error messages

Field errors follow the 06 error pattern, minus the title: **[what's wrong]. [how to fix it].**
- At most 2 short sentences, sentence case, no "!".
- The subject is the entry, not the person ("That code didn't work", not "You entered a wrong code").
- No banned words (06): never "invalid", "illegal", "please", "oops".
- Give the format or an example when the fix isn't obvious.
- Page banners use the full three-part rule (06): a title naming what happened, then why and what to do, plus at most one action.

| Don't | Do (real copy, `src/i18n/messages/en.json`) |
|---|---|
| "Invalid email" | "Enter an email address like name@company.com." |
| "Passwords do not match!" | "Passwords don't match. Enter the same password in both fields." |
| "Invalid code. Try again." | "That code didn't work. Codes change every 30 seconds, so enter the newest one." |
| "You must accept the terms." | "Accept the Terms and the Evaluation Agreement to continue." |
| "Login failed" (banner) | **Email or password is incorrect.** Check both and try again. After 5 failed attempts, sign-in is paused for 15 minutes. |

## Field-level or page-level?

| The problem is… | Show it as | Example |
|---|---|---|
| About one field's value (format, missing, too weak, mismatch) | `FieldError` under that field | Email format, required field, confirm password, wrong code, terms not accepted |
| About the account or the request as a whole, found by the server | One `ErrorBanner` above the form | Wrong email or password (we never say which, for security), locked account, email already registered |
| About the link or session that opened the page | One `ErrorBanner`, form hidden or replaced with the next step | Expired invite, expired reset link |
| Not an error, just a requirement | Helper text or the password checklist, neutral color | Password rules, breach-check note (reset and invite only, D-052) |

Never show a banner and a field error for the same problem. Never show more than one banner (CLAUDE.md).

## Accessibility

| Rule | Status today | Source |
|---|---|---|
| Invalid input has `aria-invalid="true"` and `aria-describedby` pointing to its error's `id` | Done on every field with an error | WCAG 3.3.1, 4.1.2 · all routes |
| Password input's `aria-describedby` includes the rules list (and the breach note where shown) | Done | `SignUp.tsx`, `ResetPassword.tsx`, `InvitePassword.tsx` |
| Required fields have `aria-required` | Sign-up only (see Open issues) | WCAG 3.3.2 |
| After a failed submit, focus moves to the first invalid field | **Not done**: focus stays on the submit button, and field errors aren't announced (see Open issues) | WCAG 3.3.1 (best practice) |
| Page banners are announced | Done: `Alert` has `role="alert"` | `components/ui/alert.tsx` |
| Color + icon + text, never color alone | Done | WCAG 1.4.1 · `FieldError`, `PasswordRules` |
| Error text contrast ≥4.5:1; error border ≥3:1 | Done: `error-foreground` 6.53–8.96:1, `error-border` ≥3.07:1 on every surface | `node scripts/check-contrast.mjs` · 04 |
| Show/hide password button ≥24×24, with a name that changes ("Show password" / "Hide password") and `aria-pressed` | Done (24×24 `icon-sm`, tooltip opens on focus) | WCAG 2.5.8 · `PasswordInput` |
| Input purpose via `autocomplete`: `username`, `current-password`, `new-password`, `given-name`, `family-name`, `email`, `organization`, `one-time-code` | Done | WCAG 1.3.5 |
| Paste allowed in password and code fields | Done (no paste handlers) | WCAG 3.3.8 |
| Confirm password asks for the password twice | Allowed: re-entry for security is an exception | WCAG 3.3.7 |
| Spinners respect reduced motion | Done (`motion-reduce:animate-none`) | 08 Motion |

## i18n and RTL

| Rule | Source |
|---|---|
| All labels, placeholders, rules and errors come from react-intl messages (en, ar, ja). Placeholders are translated too. Example values (`name@company.com`, `000000`) stay as they are. | `src/i18n/extra.ts` · 07 |
| Layout uses logical properties (`ps`, `pe`, `start`, `end`). The show/hide button sits at `end-1`. | 07 · `check-spacing.mjs` |
| Technical values stay LTR: email and code inputs use `dir="ltr"`; the "8–64" range in Arabic is wrapped in isolate marks (U+2066…U+2069) so RTL doesn't reorder it. | D-011 · 07 numerals · `extra.ts` `*.rLength` |
| Japanese puts the family-name field first. | `SignUp.tsx` |
| Arabic and Japanese use taller line-heights for `text-sm` and `text-base` (24 and 28). Error and rules text (`text-xs`) stays 12/16 in every locale (see Open issues). | 07 · `tokens/theme.css` |

## Component reference

| Component | Use for | File |
|---|---|---|
| `FieldError` | One field's error, under the field. Takes the `id` the input references. | `src/components/auth/parts.tsx` |
| `ErrorBanner` | The page's one error banner: title, body, optional action | `src/components/auth/parts.tsx` (wraps `components/ui/alert.tsx`) |
| `PasswordRules` | Live 2-column rules checklist; pass `submitted` to turn unmet rules red | `src/components/auth/parts.tsx` · rules in `PASSWORD_RULES` (D-047) |
| `PasswordInput` | Password field with show/hide toggle | `src/components/auth/parts.tsx` |
| `CodeInput` | Single 6-digit code field (authenticator) | `src/components/auth/parts.tsx` |
| `Input`, `Label`, `Checkbox` | Base controls | `src/components/ui/` |

## Open issues

Gaps found while writing this doc. None are fixed yet; each needs its own change.

| # | Gap | Suggested fix |
|---|---|---|
| 1 | After a failed submit, focus stays on the submit button and field errors aren't announced. Screen reader users don't hear what went wrong. | Move focus to the first invalid field (its `aria-describedby` then reads the error). |
| 2 | Re-validation differs: sign-up, reset and invite clear errors as people type; sign-in's email error and both code errors stay until the next submit. | Use the `submitted` pattern everywhere. |
| 3 | `aria-required` is only on sign-up. Sign-in, reset and invite fields have none, and an empty sign-in password isn't checked before the request. | Add `aria-required` and a required check to those forms. |
| 4 | An empty code is sent for checking and comes back as "That code didn't work", which is misleading. | Check for 6 digits first: "Enter the 6-digit code from your app." |
| 5 | Weak-password feedback differs: invite adds a field error only when an uppercase letter or special character is missing; sign-up and reset rely on the red checklist alone. | Pick one: checklist only, or checklist plus a field error naming what's missing. |
| 6 | No breached-password error exists; the mock auth doesn't simulate one (D-052). | The real API returns it; show it as a field error on the password. |
| 7 | Error and rules text is 12/16 in Arabic and Japanese, but body text in those locales uses line-height 24 (07), and the canvas boards use 24. | Decide whether `text-xs` gets a taller line-height for ar/ja, and log it. |
| 8 | Sign-up reuses other screens' message keys (`signIn.emailErr`, `resetPassword.mismatch`). This is harmless today but couples translations across screens. | Move shared errors to `common.*` keys. |
| 9 | Only sign-up sets `aria-busy` and shows a spinner while waiting. | Apply the same busy state to every submit. |
| 10 | The comment on the Arabic `rLength` override in `src/i18n/extra.ts` cites D-007 (charts); the decision for LTR technical values is D-011. | Correct the comment. |

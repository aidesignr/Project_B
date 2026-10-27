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
| Helper / rules text | `text-form-msg` 12/16 (ar, ja 12/20) | `PasswordRules` in `parts.tsx` · D-067 |
| Error | `text-form-msg` 12/16 (ar, ja 12/20), `error-foreground`, 16px `CircleAlert` icon + text | `FieldError` in `parts.tsx` · 03 type scale · D-067 |
| Required | `aria-required` on every required field in every form. Sign-up, the longest form, adds one line above the fields: "All fields are required." No asterisks in code. | all routes · `SignUp.tsx` `signUp.reqNote` |
| Spacing | `gap-2` (8px) inside a field · `gap-4` (16px) between fields and between a field and the submit button · 2-column rows use `gap-4` | `SignUp.tsx`, `SignIn.tsx` |

## When to validate

| Moment | What happens | Where in code |
|---|---|---|
| Typing, before the first submit | Nothing turns red. The password checklist ticks rules green as they're met (unmet rules stay neutral). | `PasswordRules` (`submitted=false`) |
| Submit | Client checks run before anything is sent: required fields, email format (`EMAIL_RE`), password rules, matching passwords, terms checkbox, 6-digit codes. Every failing field shows its error at once, and focus moves to the first one. | `onSubmit` + `useFocusFirstError` in each route |
| After a failed submit | Every form re-checks as people type, so an error clears as soon as the field is fixed. A wrong-code error from the server clears when the code is edited. | `submitted` state in each route |
| Confirm password | "Passwords don't match" shows only once the first password meets the rules, so people fix one thing at a time. | `mismatch` in `SignUp.tsx`, `ResetPassword.tsx`, `InvitePassword.tsx` |
| Server response | Account-level results (wrong email or password, locked, email already registered, Google account not linked, expired link) show as one `ErrorBanner`. A wrong code shows as a field error on the code input, and focus returns to it. | `SignIn.tsx`, `SignUp.tsx`, `Authenticator.tsx`, `InviteAuthenticator.tsx` |
| Waiting | The submit button is disabled with a spinner and `aria-busy` while the request runs. Sign-up also changes its label to "Creating account…". | `SubmitButton` |

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
| "Password too weak" | "This password doesn't meet all the rules below." (the checklist then shows which rules, D-068) |
| "Compromised password" | "This password has appeared in a known data breach. Choose a different one." (D-068) |
| "Invalid code. Try again." | "That code didn't work. Codes change every 30 seconds, so enter the newest one." |
| "You must accept the terms." | "Accept the Terms and the Evaluation Agreement to continue." |
| "Login failed" (banner) | **Email or password is incorrect.** Check both and try again. After 5 failed attempts, sign-in is paused for 15 minutes. |

## Field-level or page-level?

| The problem is… | Show it as | Example |
|---|---|---|
| About one field's value (format, missing, too weak, mismatch) | `FieldError` under that field | Email format, required field, weak or breached password (with the checklist), confirm password, short or wrong code, terms not accepted |
| About the account or the request as a whole, found by the server | One `ErrorBanner` above the form | Wrong email or password (we never say which, for security), locked account, email already registered |
| About the link or session that opened the page | One `ErrorBanner`, form hidden or replaced with the next step | Expired invite, expired reset link |
| Not an error, just a requirement | Helper text or the password checklist, neutral color | Password rules, breach-check note (reset and invite only, D-052) |

Never show a banner and a field error for the same problem. Never show more than one banner (CLAUDE.md).

## Accessibility

| Rule | Status today | Source |
|---|---|---|
| Invalid input has `aria-invalid="true"` and `aria-describedby` pointing to its error's `id` | Done on every field with an error | WCAG 3.3.1, 4.1.2 · all routes |
| Password input's `aria-describedby` includes the rules list (and the breach note where shown) | Done | `SignUp.tsx`, `ResetPassword.tsx`, `InvitePassword.tsx` |
| Required fields have `aria-required` | Done in every form | WCAG 3.3.2 |
| After a failed submit, focus moves to the first invalid field, so its error is read out | Done (`useFocusFirstError`; covered by play tests) | WCAG 3.3.1 |
| Page banners are announced | Done: `Alert` has `role="alert"` | `components/ui/alert.tsx` |
| Color + icon + text, never color alone | Done | WCAG 1.4.1 · `FieldError`, `PasswordRules` |
| Error text contrast ≥4.5:1; error border ≥3:1 | Done: `error-foreground` 6.53–8.96:1, `error-border` ≥3.07:1 on every surface | `node scripts/check-contrast.mjs` · 04 |
| Show/hide password button ≥24×24, with a name that changes ("Show password" / "Hide password") and `aria-pressed` | Done (24×24 `icon-sm`, tooltip opens on focus) | WCAG 2.5.8 · `PasswordInput` |
| Input purpose via `autocomplete`: `username`, `current-password`, `new-password`, `given-name`, `family-name`, `email`, `organization`, `one-time-code` | Done | WCAG 1.3.5 |
| Paste allowed in password and code fields | Done (no paste handlers) | WCAG 3.3.8 |
| Confirm password asks for the password twice | Allowed: re-entry for security is an exception | WCAG 3.3.7 |
| Spinners respect reduced motion | Done (`motion-reduce:animate-none` in `SubmitButton`) | 08 Motion |

## i18n and RTL

| Rule | Source |
|---|---|
| All labels, placeholders, rules and errors come from react-intl messages (en, ar, ja). Placeholders are translated too. Example values (`name@company.com`, `000000`) stay as they are. | `src/i18n/extra.ts` · 07 |
| Layout uses logical properties (`ps`, `pe`, `start`, `end`). The show/hide button sits at `end-1`. | 07 · `check-spacing.mjs` |
| Technical values stay LTR: email and code inputs use `dir="ltr"`; the "8–64" range in Arabic is wrapped in isolate marks (U+2066…U+2069) so RTL doesn't reorder it. | D-011 · 07 numerals · `extra.ts` `*.rLength` |
| Japanese puts the family-name field first. | `SignUp.tsx` |
| Arabic and Japanese use taller line-heights: `text-sm` 24, `text-base` 28, and field errors and password rules (`text-form-msg`) 20. | 07 · `tokens/theme.css` · D-067 |

## Product forms: report configuration (D-071, D-073)

The report configuration page (`src/components/reports`) is the first product form. It follows the sections above, plus these rules the design owner asked for. Where they differ from the login forms, see Open issues 2–4 (D-074).

| Rule | Spec | Source |
|---|---|---|
| Required marker | Red asterisk after the label (`text-error-foreground`, `aria-hidden`). The control still carries `required` / `aria-required`, or says "required" in its accessible name. | `RequiredMark`, `Field` in `src/components/reports/parts.tsx` |
| Placeholders | Every input, textarea and dropdown trigger has one ("Select accounts", "name@company.com"). | `ReportForm.tsx` · `src/i18n/reports.ts` |
| Focus and selection | One outer ring on the whole field box: 2px `ring`, 2px offset, on focus and while the field's popup is open. Inner parts (clear ×, chevron) draw no ring. Same for inputs, textarea, dropdowns, the recipients chips box and the date picker. | `FilterDropdown` field mode, `EmailChipsInput`, `StartDatePicker` · WCAG 2.4.7, 2.4.11 |
| Validation | On submit, then live. Error under each invalid field (`FieldError`). Several errors: one banner listing them, each linked to its field, and focus moves to the banner. One error: focus moves to that field. Empty required schedule fields fail too. | `ReportForm.tsx` `onSubmit` |
| Reset | Text link after Cancel. Clears every field to empty (placeholders show), clears errors and confirmations, keeps mode switches (report type). It's reversible, so it shows "We cleared all fields." with Undo. | `ReportForm.tsx` `reset`, `undoReset` · 06 destructive tiers |
| Spacing | Compact: 4px from label to control and from control to its error or help, 12px between field rows, 24px between columns, 16px between form blocks. Fields are 3 of the page's 12 columns; wide fields 6. | `ReportForm.tsx` |

## Component reference

| Component | Use for | File |
|---|---|---|
| `FieldError` | One field's error, under the field. Takes the `id` the input references. | `src/components/auth/parts.tsx` |
| `ErrorBanner` | The page's one error banner: title, body, optional action | `src/components/auth/parts.tsx` (wraps `components/ui/alert.tsx`) |
| `PasswordRules` | Live 2-column rules checklist; pass `submitted` to turn unmet rules red | `src/components/auth/parts.tsx` · rules in `PASSWORD_RULES` (D-047) |
| `PasswordInput` | Password field with show/hide toggle | `src/components/auth/parts.tsx` |
| `CodeInput` | Single 6-digit code field (authenticator) | `src/components/auth/parts.tsx` |
| `SubmitButton` | Form submit button with the busy state (disabled, spinner, `aria-busy`) | `src/components/auth/parts.tsx` |
| `passwordProblem`, `PASSWORD_ERROR` | Returns `"weak"`, `"breached"` or `null` for a new password, and the matching error key | `src/components/auth/parts.tsx` · demo breached list in `src/lib/auth.ts` (D-068) |
| `useFocusFirstError` | Hook: put `formRef` on the `<form>`, call `focusFirstError()` after a failed submit or server error | `src/components/auth/parts.tsx` |
| Shared error copy | `common.emailErr`, `common.passwordRequired`, `common.weakErr`, `common.mismatch`, `common.codeLength`, `common.breachedErr` | `src/i18n/extra.ts` |
| `Field`, `RequiredMark` | Label (red asterisk when required), control, field error and help, stacked 4px apart | `src/components/reports/parts.tsx` |
| `FilterDropdown` with `field` | Findings-style dropdown as a form field: full-width trigger, placeholder, `aria-invalid`, linked error, no operator; required single selects can't be cleared | `src/components/findings/FilterDropdown.tsx` (D-072) |
| `EmailChipsInput` | Recipients: chips with remove, Enter or comma to add, invalid chips flagged after submit | `src/components/reports/parts.tsx` |
| `StartDatePicker` | Single date with past days disabled; an empty value shows the placeholder | `src/components/reports/parts.tsx` |
| `Input`, `Label`, `Checkbox` | Base controls | `src/components/ui/` |

## Open issues

Gaps that are still open. Items fixed after this doc was first written (focus on the first error, re-validation, `aria-required`, code length, weak-password error, shared message keys, busy state, the D-011 comment) are now described in the sections above.

| # | Gap | Suggested fix |
|---|---|---|
| 1 | The breached-password check uses a demo list in the frontend (D-068). | The backend runs the real check and returns its own error type; the message stays the same. |
| 2 | Required marker differs: the report form uses a red asterisk; the login forms use no asterisks and an "All fields are required" note (D-074). | Pick one rule for every form. |
| 3 | Spacing differs: the report form is compact (4px / 12px); the login forms use 8px / 16px (D-074). | Pick one rule, or keep compact for product forms only and say so above. |
| 4 | Several field errors: the report form shows one banner and focuses it; the login forms focus the first invalid field and keep banners for account problems (D-074). | Pick one rule for every form. |

# Login flows (design source)

Validated login and sign-up screens for AccuKnox, exported from the design canvas.
Live canvas: https://claude.ai/artifact/GxYvEx7H5cxKmsRFWRKGts (private; share it from the canvas before linking it to others).

These files are design source, not production code. Each `.dc.html` board loads the canvas runtime (`support.js`), so the boards render on the canvas, not when opened directly in a browser. Build the real screens in React with shadcn/ui and the repo tokens. Treat these boards as the reference for layout, copy, states and translations.

## Layout

- Split screen: a feature carousel on the start side, a 400px form column on the end side.
- The left pane uses the approved **browser frame** layout (`MarketingPane.dc.html`, `layout="frame"`). It cycles 4 product screenshots, starting on data security.
- Every screen has a language switch (en, ar with RTL, ja) and a theme switch (Light, Dark, System).
- Controls are compact: 32px inputs and buttons, 24px icon buttons, 40px code inputs.
- Every empty input shows a placeholder (for example "Enter your first name", "Create a password").
- Field error messages and the password rules use 12/16 text, the smallest step in the type scale.
- Password rules show in 2 columns, one line each: 8–64 characters, plus 1 lowercase, 1 uppercase, 1 number and 1 special character. Reset and invite add a note that we also check for breached passwords (D-047); sign-up leaves it out (D-052).
- The invite authenticator step numbers its instructions and shows a demo setup key; the recovery-codes step shows 10 demo codes. Code (`src/lib/auth.ts`) uses the same values.

## Journeys

| Journey | Base screens | States and errors |
|---|---|---|
| J1 · Sign in (email, password, authenticator) | `OptionB-Split`, `Flow1-Authenticator` | `E1-SignIn-InvalidEmail`, `E1-SignIn-WrongCredentials`, `E1-SignIn-Locked`, `E1-Auth-WrongCode` |
| J2 · Forgot password | `Flow2-ForgotPassword`, `Flow7-ResetPassword` | `S2-Forgot-Sent`, `S2-Reset-Success`, `E2-Reset-LinkExpired`, `E2-Reset-Mismatch` |
| J3 · Invite: set password, authenticator, recovery codes | `Flow3-InvitePassword`, `Flow4-InviteAuthenticator`, `Flow5-RecoveryCodes` | `E3-Invite-WeakPassword`, `E3-Invite-Expired`, `E3-Invite-WrongCode`, `E3-Invite-CodesNotSaved` |
| J4 · SSO (OpenID and Google) | `Flow6-SSO` | `E4-SSO-NotFound`, `E4-SSO-ProviderError`, `E4-Google-NotLinked` |
| J5 · Self sign-up | `Flow8-SignUp`, `Flow9-VerifyEmail` | `S5-SignUp-Loading`, `E5-SignUp-EmailTaken`, `E5-SignUp-TermsNotAccepted` |

The `E*` and `S*` files are thin wrappers. Each one imports a base screen with a `scenario` prop. `canvas.json` holds the board positions and titles.

## Assets

`assets/` holds the screenshots, the QR code placeholder and the logos (`accuknox-logo-on-dark.webp` and `-on-light.webp`). On the canvas, these files load from its asset store.

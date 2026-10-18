// Extracts the login-flow copy (en, ar, ja) from the validated canvas boards in
// design/login-flows/*.dc.html into src/i18n/messages/<locale>.json, so the app
// ships exactly the reviewed strings. Keys are semantic: <screen>.<key>.
// Run: node scripts/extract-login-messages.mjs   (exit 1 if locales don't have the same keys)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const DIR = new URL("../design/login-flows/", import.meta.url);
const OUT = new URL("../src/i18n/messages/", import.meta.url);
const LOCALES = ["en", "ar", "ja"];
// board file → message namespace
const BOARDS = {
  "OptionB-Split": "signIn",
  "Flow1-Authenticator": "authenticator",
  "Flow2-ForgotPassword": "forgotPassword",
  "Flow3-InvitePassword": "invitePassword",
  "Flow4-InviteAuthenticator": "inviteAuthenticator",
  "Flow5-RecoveryCodes": "recoveryCodes",
  "Flow6-SSO": "sso",
  "Flow7-ResetPassword": "resetPassword",
  "Flow8-SignUp": "signUp",
  "Flow9-VerifyEmail": "verifyEmail",
  "MarketingPane": "features",
};
// shared toolbar strings live under `common`
const COMMON = new Set(["language", "theme", "light", "dark", "system"]);

function dicts(src) {
  const script = src.slice(src.indexOf("<script type=\"text/x-dc\""));
  const out = [];
  for (const m of script.matchAll(/const ([A-Z]+) = \{/g)) {
    let depth = 0, i = m.index + m[0].length - 1;
    for (; i < script.length; i++) { if (script[i] === "{") depth++; else if (script[i] === "}" && --depth === 0) break; }
    let obj;
    try { obj = Function(`"use strict"; return (${script.slice(m.index + m[0].length - 1, i + 1)});`)(); }
    catch { continue; } // not a plain locale dictionary (references runtime values)
    if (LOCALES.every((l) => l in obj)) out.push(obj);
  }
  return out;
}

function flatten(value, prefix, into) {
  if (typeof value === "string") into[prefix] = value;
  else if (Array.isArray(value)) value.forEach((v, i) => {
    if (Array.isArray(v) && v.length === 2 && v.every((s) => typeof s === "string")) {
      into[`${prefix}.${i + 1}.title`] = v[0]; into[`${prefix}.${i + 1}.caption`] = v[1];
    } else flatten(v, `${prefix}.${i + 1}`, into);
  });
  else for (const [k, v] of Object.entries(value)) flatten(v, `${prefix}.${k}`, into);
}

const messages = Object.fromEntries(LOCALES.map((l) => [l, {}]));
for (const [file, ns] of Object.entries(BOARDS)) {
  const src = readFileSync(new URL(`${file}.dc.html`, DIR), "utf8");
  for (const d of dicts(src)) for (const l of LOCALES) {
    for (const [k, v] of Object.entries(d[l])) {
      const key = COMMON.has(k) ? `common.${k}` : `${ns}.${k}`;
      flatten(v, key, messages[l]);
    }
  }
}

mkdirSync(OUT, { recursive: true });
const sorted = (o) => Object.fromEntries(Object.keys(o).sort().map((k) => [k, o[k]]));
for (const l of LOCALES) writeFileSync(new URL(`${l}.json`, OUT), JSON.stringify(sorted(messages[l]), null, 2) + "\n");

const keys = LOCALES.map((l) => new Set(Object.keys(messages[l])));
const missing = LOCALES.flatMap((l, i) => [...keys[0]].filter((k) => !keys[i].has(k)).map((k) => `${l}: ${k}`));
console.log(`messages: ${keys[0].size} keys × ${LOCALES.length} locales`);
if (missing.length) { console.log("Missing:\n  " + missing.join("\n  ")); process.exit(1); }

# 06 · Content and tone

Users are time-pressed, wary of false alarms and accountable for decisions. Copy must be **fast to read, calm, and trustworthy**.

## Voice

| We are | We are not | Pass/fail check |
|---|---|---|
| **Calm** | Alarmist | No "!" in UI copy · no ALL CAPS · no word from the banned list |
| **Plain** | Jargon-heavy | Glossary terms use the friendly form, or show a tooltip on first use per screen |
| **Confident** | Vague | Facts stated directly. A hedge appears only with its reason ("…because we can't see network traffic") |
| **Helpful** | Blaming | The subject is the resource, never the user ("This bucket allows public access") |

## The three-part rule

Every alert, finding and error states **what happened → why it matters → what to do next**.

> **Storage bucket is public.** Anyone on the internet can read its 1,240 files, including 3 that look like customer data. **Make bucket private**

| Part | Max length | Check |
|---|---|---|
| What happened (title) | 8 words | Starts with the affected thing, not the system |
| Why it matters | 25 words | Names a concrete consequence (data, access, cost, compliance) |
| What to do | 3-word button + optional 1 sentence | Verb + object |

## Writing rules

| Rule | Example |
|---|---|
| Sentence case everywhere | "Connect cloud account" |
| Buttons: verb + object, ≤3 words | "Fix in code" · "Assign owner" · "Ignore finding" |
| Max 20 words per UI sentence, 25 in help text | |
| Digits for all numbers, locale-formatted | "3 critical findings" · "1,240 files" |
| Relative time under 7 days, absolute after | "2 hours ago" · "12 Sep 2026" |
| No idioms, puns or culture-specific references | They don't translate (see 07) |
| Full sentences in i18n messages, never concatenated | See 07 |
| Severity names are capitalized as names: Critical, High, Medium, Low, Info | "2 High findings" |

## Banned list

| Don't use | Why | Use instead |
|---|---|---|
| imminent, catastrophic, urgent, act now, immediately! | Alarmist; feeds alert fatigue | Severity name + target fix time ("Fix within 24 hours") |
| 100% secure, bulletproof, military-grade, guaranteed | Can't be true; breaks trust | Specific facts ("Encrypted at rest with AES-256") |
| oops, uh-oh, sorry, please | Unserious or padding | Direct statement + action |
| simply, just, easy, obviously | Blames the user if it isn't easy | Leave it out |
| leverage, utilize, robust, seamless, cutting-edge | Marketing filler | Plain verb ("use") or leave it out |
| invalid, illegal, fatal, abort, kill | Harsh or vague | Say what's wrong ("Enter a port between 1 and 65535") |
| user error, you misconfigured | Blaming | Describe the resource state |
| toxic combination, blast radius | Competitor jargon (D-025) | "Combined risk", "What else is affected" |

## Do / don't

| Don't | Do |
|---|---|
| "CRITICAL: Imminent compromise detected!" | "Critical: This server is reachable from the internet and has a known exploit." |
| "IAM policy violation (CIS 1.16)" | "This user has more permissions than they use. (CIS 1.16)" |
| "Error 403" | "You don't have access to this account. Ask an admin for the Viewer role." |
| "No data" | "No findings yet. The first scan finishes in about 10 minutes." |
| "Are you sure?" | "Ignore 12 findings? They'll be hidden from reports. You can restore them later." |
| "Remediate" | "Fix" |

## Patterns

### Alerts and findings
`[Severity]: [what happened] in [where]. [Why it matters].` + primary action + "Why am I seeing this?"
> High: New public endpoint in payments-api. It exposes an admin page without login. **Review endpoint**

### Errors
`[What failed]. [Why, if known]. [What to do].` + one action. Never show raw codes alone; put them in a "Details" disclosure.
> We couldn't scan prod-eu. The access role was removed. **Reconnect account**

### Empty states
| Type | Pattern | Example |
|---|---|---|
| Good news | Fact + what we checked. No celebration or emoji. | "No critical findings in the last 30 days. We checked 3 accounts and 1,204 resources." |
| Not set up | Why it's empty + primary action | "No cloud accounts connected yet. **Connect account**" |
| Filtered to zero | Say the filter caused it + clear action | "No findings match these filters. **Clear filters**" |
| Still loading data | Expected time | "First scan in progress. About 10 minutes left." |

### Success
Past tense, specific, with undo when possible: "12 findings assigned to Maya Chen. **Undo**"

### Confirmations
Title = the action as a question, with the count. Body = the consequence. Buttons = the specific verb + "Cancel" (never "OK" / "Yes").
> **Assign 12 findings to Maya Chen?** She'll be notified by email. [Assign findings] [Cancel]

### Destructive actions

| Tier | When | Pattern |
|---|---|---|
| 1 · Reversible | Ignore, mute, unassign, archive | No dialog. Act immediately + toast with **Undo** (stays ≥10s, pauses on hover/focus). |
| 2 · Irreversible, limited | Delete a saved view, remove one integration | `AlertDialog`: title "Delete [thing]?", consequence + "This can't be undone.", destructive button "Delete [thing]", focus starts on **Cancel**. |
| 3 · Irreversible, wide impact | Delete an account connection, org-wide policy, data purge | Tier 2 + list what will be affected (counts) + **type the name to confirm** + an audit-log note. |

Destructive buttons use `destructive` tokens, never severity colors. They are never the default focus.

## AI trust patterns

### AskAI (D-026)

| Attribute | Rule |
|---|---|
| Name | **AskAI**. A product name: never translated, never shortened, always written as one word with this casing. |
| Voice | First person **"I"** inside AskAI answers only. All other product copy (errors, empty states, alerts) stays "We" (the product). Never mix the two in one message. |
| Personality | Calm, precise and modest. No feelings, opinions, jokes or small talk. No "Great question!", no "I'm happy to help", no apologies; it states what it can and can't do. |
| Icon | Default Lucide `bot`, 16px in labels, 20px on the AskAI entry button. No avatar or custom color for now (uses `primary` / neutral tokens). |
| Where it lives | A **chat panel** that opens from the AskAI button in the header (same place on every page, WCAG 3.2.6). Plus "Ask about this" shortcuts on findings, charts and the attack-path graph, which open the panel with that item as context. |
| Panel layout | Uses the detail-panel slot on the inline-end side (480 / 560px, mirrored in RTL). Only one side panel is open at a time. When opened from a finding, the finding stays linked at the top of the chat as context. |
| Accountability | "I" never claims certainty it doesn't have. Every claim cites evidence, and AskAI never acts without user confirmation. |

**"I" voice examples**

| Don't | Do |
|---|---|
| "I'm confident this is fine! 😊" | "I found no internet exposure for this server. (High confidence)" |
| "I fixed the security group for you." | "I can prepare a fix that closes port 22. Review it before applying." |
| "Sorry, I can't do that." | "I can't see runtime data for this cluster, so I can't confirm this. Connect the sensor to check." |
| "We think this is exploitable." (inside AskAI) | "This is likely exploitable, because the server is public and runs version 2.4.1." |

### Anatomy of every AskAI answer or recommendation

| # | Element | Rule | Example |
|---|---|---|---|
| 1 | **AI label** | "AskAI" + "AI-generated" chip + `bot` icon (no sparkle or magic imagery: it suggests certainty AskAI doesn't have) | AskAI · AI-generated |
| 2 | **Answer** | One-sentence conclusion first | "This finding is likely exploitable." |
| 3 | **Confidence** | Level (High / Medium / Low) + icon + the reason. No percentages (D-036). | Medium confidence: the server is public, but I couldn't confirm the vulnerable version is running. |
| 4 | **Evidence** | 1–5 linked facts used, each a real resource, finding or log | "Port 22 open to 0.0.0.0/0 (sg-0a12…)" |
| 5 | **Fact vs inference** | Facts: "I found…". Inferences: "This likely means…". | |
| 6 | **Limits** | What AskAI couldn't see or check | "I don't have runtime data for this cluster." |
| 7 | **Next step** | A suggested action. **AskAI never acts without user confirmation.** | [Review fix] |
| 8 | **Feedback** | "Helpful" / "Not helpful" + "Report a problem" | |

### Confidence levels

| Level | Icon | Phrase | Criteria |
|---|---|---|---|
| High | `signal-high` | "This is…" | Direct evidence confirms it |
| Medium | `signal-medium` | "This is likely…, because…" | Strong but indirect evidence |
| Low | `signal-low` | "This might be…. I couldn't confirm…" | Partial evidence; tells the user how to verify |
| Not enough data | `circle-help` | "I don't have enough data to say." | Never guess. Never shown as an answer. |

### "Why am I seeing this?"

Available on every alert, finding, recommendation and AI answer (principle 3). Opens a popover:

| Field | Example |
|---|---|
| Triggered by | "Rule: Storage buckets must not allow public read" |
| Based on | "Bucket policy read 4 minutes ago from prod-eu" |
| Severity because | "High impact (customer data) × likely exploited (public) → High" |
| Shown to you because | "You own the payments project" |
| Change this | "Edit rule" · "Mute for this resource" · "Adjust notification settings" |

## Glossary: technical term → plain term

Use the plain term in the UI. Show the technical term in parentheses or a tooltip where experts expect it (filters, exports, API). Translations of these terms are locked per locale (07).

| Technical term | Plain term in UI | Tooltip |
|---|---|---|
| Misconfiguration | Risky setting | A setting that makes a resource easier to attack |
| Vulnerability / CVE | Known weakness (CVE-…) | A publicly known software flaw, with an ID |
| Exploit available | Attack code exists | Public code exists that can use this weakness |
| KEV | Actively attacked | On the US CISA list of weaknesses being exploited now |
| CVSS | Severity score (CVSS) | Industry 0–10 rating of how bad a weakness is |
| EPSS | Exploit likelihood | Chance this weakness gets attacked in the next 30 days |
| Attack path | Attack path | The steps an attacker could take to reach something valuable |
| Toxic combination | Combined risk | Several issues that together create a serious risk |
| Blast radius | What else is affected | Everything an attacker could reach from here |
| Lateral movement | Spread to other systems | Moving from one compromised system to others |
| Publicly exposed | Reachable from the internet | Anyone online can try to connect |
| IAM | Access permissions | Who and what can do which actions |
| Over-privileged | Has more access than needed | Permissions granted but not used |
| Least privilege | Minimum access | Only the permissions actually needed |
| Principal / identity | User or service | A person or program that can sign in |
| Secrets | Passwords and keys | Credentials that give access to systems |
| Drift | Changed from the approved setup | The live setup no longer matches what was defined |
| Runtime | While running | What happens when the workload is live |
| Workload | App or service | Containers, VMs or functions running your code |
| Remediation | Fix | Steps to resolve the issue |
| Suppress / mute | Ignore | Hide from lists and reports, with a reason |
| False positive | Not a real issue | We flagged it, but it isn't actually a risk |
| Posture | Security health | Overall state of your security settings |
| Compliance framework | Standard (e.g. CIS, SOC 2) | A published list of security requirements |
| Control | Requirement | One rule within a standard |
| Zero trust | Verify every request | Nothing is trusted by default, even inside your network |
| eBPF / agent | Sensor | Software that observes activity on a system |
| SBOM | Software parts list | All components inside an application |
| SLA | Fix deadline | The time allowed to fix a finding of this severity |
| CSPM / CNAPP / CWPP | (don't use in UI) | Category names. Use the feature name instead. |

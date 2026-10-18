# 01 · Competitor analysis

**Scope:** Wiz, Orca Security, Upwind, Datadog Cloud Security. Public websites, public docs and third-party integration docs only (researched 2026-10-18). Most in-app UIs are behind logins.
**Rule:** extract patterns, never assets. No competitor branding, icons, illustrations or proprietary visual styles.

**Evidence tags**
| Tag | Meaning |
|---|---|
| **Confirmed** | Stated in the vendor's public docs or a third-party integration doc |
| **Inferred** | Seen in marketing copy, image captions or videos; may not match the real product |
| **Unverified** | Couldn't be checked publicly; treat as an assumption |

## At a glance

| | Wiz | Orca Security | Upwind | Datadog |
|---|---|---|---|---|
| Unit of risk | "Issue" (Inferred) | "Alert" (Confirmed) | "Exposure", "Threat Story" (Inferred) | "Finding" (Confirmed) |
| Severity model | Critical / High / Medium / Low / Informational (Confirmed, ServiceNow docs) | 1–10 score, one decimal. Bands: Critical 9–10, High 7–8.9, Medium 5–6.9, Low 3–4.9 (Confirmed, Orca blog) | Prefers context over "static severity scores" (Inferred). Levels unknown (Unverified) | Critical / High / Medium / Low from likelihood × impact (Confirmed) |
| Signature view | Security graph of linked risk factors (Inferred) | Attack-path analysis, executive risk summary (Inferred) | Live map, process trees, network topology (Inferred) | Summary cards + groupable findings table (Confirmed) |

## Wiz

| Area | Decision | Pattern | One-line reason |
|---|---|---|---|
| Data viz | **Adapt** | Graph that joins weak signals (exposure + weakness + identity + data) into one "toxic combination" (Confirmed, Wiz blog) | It explains *why* something is critical, but we label edges in plain words and open the graph from a finding. |
| Data viz | **Avoid** | Graph as a primary landing view (Inferred) | Graphs are slow to read for time-pressed users. A ranked list answers "what first?" faster. |
| Layout | **Adopt** | Projects group resources by owner (Inferred) | Lets each team see only what it must fix. |
| Layout | **Adopt** | Ranked issue list as the main entry point (Inferred) | Directly answers "What should I fix first?" |
| Language | **Adopt** | Action-led labels: "1-click fix in code with a pull request" (Inferred) | Leads straight to the fix. |
| Language | **Avoid** | "Toxic combination" as a UI term (Confirmed term) | It's vivid jargon. We say "Combined risk" with a tooltip. |
| Language | **Avoid** | Claims that anyone can understand it "without … security expertise" (Inferred, marketing) | An unproven claim. We show clarity rather than assert it. |

## Orca Security

| Area | Decision | Pattern | One-line reason |
|---|---|---|---|
| Data viz | **Adapt** | One sortable risk score mapped to named bands (Confirmed) | A score helps sorting, but we use 0–100 with no decimals (false precision hurts trust) and always show the severity name. |
| Data viz | **Adopt** | A separate executive risk summary (Inferred, screenshot caption only) | Leaders need trend and posture, not a findings list. |
| Layout | **Adopt** | Executive and operational views over the same data (Inferred) | One source of truth, two lenses. |
| Layout | **Avoid** | Pushing alerts mainly into other tools (Slack, Jira, SIEM) as the way to act (Inferred) | Users lose the context of why the alert matters. We keep the explanation attached when we send it. |
| Language | **Avoid** | "Imminent compromise", "hazardous" (Inferred; the score mapping is Unverified) | Alarmist wording breaks our *calm* principle and feeds alert fatigue. |
| Language | **Adapt** | "Contain the blast radius" (Inferred) | The idea is useful, the term isn't. UI says "What else is affected". |

## Upwind

| Area | Decision | Pattern | One-line reason |
|---|---|---|---|
| Data viz | **Adopt** | Visible freshness: inventory "refreshed every 30 seconds" (Inferred) | Users trust data more when they know how old it is. |
| Data viz | **Adapt** | Runtime context words: reachable, exposed, connected (Inferred) | They become risk-factor chips with plain labels ("Reachable from the internet"). |
| Layout | **Adopt** | Three-part model: Live inventory · Fix high-signal exposures · Real-time protection (Inferred) | Maps to our flow *See → Prioritize → Respond*. |
| Layout | **Adapt** | "Threat Stories": many detections grouped into one timeline (Inferred) | Narrative grouping cuts noise. We add a plain summary at the top. |
| Language | **Adopt** | AI investigation gives a verdict *with* a confidence level and evidence (Unverified, third-party profile) | Matches our honest-AI rule. |
| Language | **Avoid** | Headline metrics like "93% noise reduction" in product UI (Inferred, marketing) | Unbacked numbers erode trust. We only show numbers we can explain. |

## Datadog Cloud Security

| Area | Decision | Pattern | One-line reason |
|---|---|---|---|
| Data viz | **Adopt** | Summary cards that filter the table on click (SLA "Overdue / Due soon / Not due yet", Critical + High counts) (Confirmed) | A KPI that turns straight into an action. |
| Data viz | **Adopt** | Transparent severity: likelihood × impact matrix with worked examples (Confirmed) | Powers our "Why this severity?" explainer. |
| Data viz | **Adopt** | "Reporting" trend tab (Confirmed) | Answers "Is it getting better?" |
| Layout | **Adopt** | Dense table: configurable columns, group by up to 2 fields, saved views, bulk actions, export (Confirmed) | Our dense-table baseline for engineers. |
| Layout | **Adopt** | Side panel with remediation guidance (Confirmed) | Keeps list context while investigating. |
| Language | **Adopt** | Risk-factor chips: "Public accessibility", "Privileged access", "Exploit available", "In production" (Confirmed) | Explains *why* in two words each. |
| Language | **Avoid** | Title Case chips ("Under Attack") (Confirmed) | We use sentence case everywhere. |

## Patterns we take forward

| ID | Pattern | Source |
|---|---|---|
| P1 | Ranked list first, graph second (opened from a finding) | Wiz, Datadog |
| P2 | KPI tiles that filter the content below | Datadog |
| P3 | Risk-factor chips explain why something is risky | Datadog, Upwind |
| P4 | Named severity + an explainable score | Orca, Datadog |
| P5 | Detail side panel instead of full-page navigation | Datadog |
| P6 | Related signals grouped into one story | Upwind, Wiz |
| P7 | Freshness and scope always visible | Upwind |

## How we are different

| # | Difference | Checkable as |
|---|---|---|
| 1 | **Calm, not alarming** | No alarmist words (see 06 banned list). No pulsing or flashing. Strong color only on actionable items (see 02). |
| 2 | **Every number explains itself** | Every score and severity has a "Why this severity?" link |
| 3 | **Dense but plain** | Engineer-level density with glossary terms only (see 06) |
| 4 | **Honest AI** | Every AI output shows evidence, confidence and limits, and never acts without confirmation |
| 5 | **Global from day one** | English, Arabic (full RTL) and Japanese at launch. No competitor shows this publicly (Unverified). |
| 6 | **Own visual identity** | AccuKnox blue on neutral surfaces. No competitor palettes, no neon "hacker" look. |

## Sources
- wiz.io/platform · wiz.io/blog/introducing-ai-powered-remediation-2-0 · ServiceNow docs, "Set filtering for the Wiz Issues Integration"
- orca.security/platform · orca.security/resources/blog/simplify-cloud-risk-prioritization-with-granular-alert-scoring · Google SecOps Orca Security integration docs
- upwind.io · upwind.io/feed/connect-the-dots-for-security-findings-with-upwinds-issue-stories
- datadoghq.com/product/cloud-security · docs.datadoghq.com/security/security_inbox · docs.datadoghq.com/security/cloud_security_management/severity_scoring

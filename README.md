# BookLeaf — Assignment 2

Author Royalty Dashboard & Automated Notification System, targeting **Bubble + n8n + an AI API**.

## Current status

**Bubble development app is implemented and seeded; the n8n connection is still being configured.** This folder contains supporting source and documentation, not a local author website. The native app runs in Bubble.

Verified on 23 October 2026:

- Bubble schema, pages, privacy rules and development records exist: 10 authors, 18 books and 18 royalty snapshots. All records have ownership links to the 10 sample author profiles; every book links to its latest snapshot.
- Using Bubble's editor “Run as” feature, Priya Sharma's dashboard shows her two books and totals of ₹19,908 earned, ₹16,338 paid and ₹3,570 pending. Opening the admin author list as this author redirects to her dashboard.
- The 17-node workflow is imported into n8n Cloud. The user saved an OpenAI credential, and it is selected on the AI node. No live AI execution has been verified.
- Bubble's private connector is a draft. NotificationLog API access, Bubble token, webhook authentication, connected success/failure tests and bulk dispatch remain unfinished. Password-based login and full privacy isolation tests are also pending. The project is not submission-ready yet.

Development preview: https://shailender12131.bubbleapps.io/version-test/bookleaf_royalty_hub

Included:

- Exact source dataset: 10 authors and 18 books.
- Three import-ready CSVs separating authors, books and royalty snapshots, plus derived author summaries.
- A 17-node inactive n8n workflow export with authenticated webhook, payload validation, log/duplicate verification, asynchronous acknowledgement, model request, deterministic financial sections, success/failure callbacks and retry handling.
- Bubble-native schema, import guide, privacy specification, page/workflow build guide and AI-builder prompt.
- Optional local n8n Docker Compose setup.
- Fourteen passing local logic tests. These execute exported Code-node code with mocked n8n inputs; they do not prove live n8n/Bubble integration.
- Acceptance checklist, assumptions, recording outline and submission checklist.

## Start here

1. Read `bubble/build-guide.md` and `docs/integration.md`.
2. Create/open your Bubble app and implement `bubble/schema.json`. This JSON is a blueprint, **not** a Bubble-importable app export.
3. Import/link `generated/` CSVs using `bubble/import-guide.md`, provision users and apply privacy rules.
4. Import `automation/bookleaf-royalty-summary.json` into n8n, set the actual Bubble URL, and bind three Header Auth credentials privately.
5. Wire the Bubble API Connector action and notification UI, activate n8n, and perform connected acceptance tests.

Bubble editor/workspace access is required for the remaining implementation. No passwords or API keys should be pasted into chat or committed.

## Local commands

Requires Node 20+; no npm dependencies are needed for the preparation scripts.

```powershell
cd "C:\Users\DELL G7\Desktop\Shailender\Author-Project-1.2"
.\setup-local.ps1
```

Or run:

```sh
npm run prepare
npm test
npm run sample
```

`prepare` regenerates CSVs, derived summaries and the n8n JSON. `sample` writes explicitly labelled deterministic example text; it does not call a model or send email.

For a local n8n instance, start Docker Desktop, run setup to create `.env`, then `docker compose up -d` and open http://localhost:5678. Finish account setup yourself. Bubble cannot call localhost; a reachable HTTPS webhook/cloud workspace is required. Docker was installed but its daemon was not running during preparation, so container startup/import has not been verified here.

## Repository layout

```text
automation/bookleaf-royalty-summary.json  Import into n8n; configure before activation
automation/code/                         Readable sources for Code nodes
bubble/                                 Native Bubble schema/build/privacy/import guides
data/bookleaf_sample_data.json           Original dataset
generated/                              CSV imports and derived verification summaries
examples/                               Sample webhook and labelled sample output
scripts/                                Export generation and deterministic royalty logic
tests/                                  Local automated checks
docs/                                   Integration, assumptions, QA and submission
compose.yaml                            Optional single-instance n8n host
```

## Important implementation details

Authors own their records through linked User fields; Bubble privacy rules enforce isolation. Royalty badges distinguish fully paid, pending and a more-than-90-day overdue review flag. Aggregate each book's latest snapshot rather than summing repeated cumulative snapshots.

The model writes greeting/introduction/closing; code adds verified financial figures, totals, production statuses, payout policy and threshold explanation. This avoids model arithmetic and unverified payment promises. No real LLM request has run yet. Success means generated and stored; actual SMTP delivery is optional and not implemented.

Secrets belong in private Bubble connector headers and n8n Credentials. `.env.example` contains placeholders only. Bubble API tokens can be privileged; do not expose them in the browser. The workflow's callback URL is fixed operator configuration, never caller input.

Duplicate prevention combines immediate Bubble UI guards, per-author pending-log checks and durable log state. Self-hosted production execution is serialized. Concurrent/multi-instance atomic locking is a documented limitation, not a claimed guarantee.

## Submission and remaining work

Follow `docs/submission-checklist.md`. Outstanding: actual Bubble application, privacy tests, real n8n import/execution and credentials, live model validation, accessible app/webhook URLs, test logins and screen recording. Assignment 1 is unchanged.

The brief states Bubble Free is sufficient; current platform documentation places some live/backend capabilities on paid plans. Verify your account's actual features and clarify the accepted development-preview arrangement with the recruiter before paying. Official references are in `docs/integration.md`.

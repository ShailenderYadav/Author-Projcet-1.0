# Acceptance and demonstration checklist

## Automated local checks — completed

`npm test` executes 14 tests using actual exported Code-node text with mocked n8n inputs. Covers 10/18 seed counts, numeric consistency, exact known totals, leap/calendar dates, 90-day boundary, threshold/production cases, export graph references, credential references, payload validation, author/log ownership, duplicate statuses, preflight outages, failure to mark Processing, AI context minimisation, valid/invalid model content, rate-limit failures, and callback errors.

These tests do **not** prove the workflow imports successfully into a specific n8n version, that Bubble privacy rules are installed, or that a live provider accepts the request.

## Required connected tests — pending

- [ ] Import workflow in your actual n8n instance; select real credentials; record version.
- [ ] Confirm Bubble schema, field/API names, 10 authors, 18 linked books and 18 source snapshots.
- [ ] Check author A vs B isolation using two sessions and direct record/API attempts.
- [ ] Anonymous and author accounts cannot open admin workflows or read notification logs.
- [ ] All book fields and exact numbers render; production/zero/no-payout states remain usable.
- [ ] Test Fully paid, Pending, Overdue including exactly 90 days and missing last payout.
- [ ] Search/filter authors by name, city, payout status; totals agree with source data.
- [ ] Individual summary creates log, returns accepted promptly, then updates to Success.
- [ ] Inspect generated text: author name, every published book, exact totals, pending-policy explanation, production updates and warm closing.
- [ ] Confirm delivery_status says Generated only; do not claim actual email was sent.
- [ ] Bulk trigger invokes one request per pending author and excludes fully paid authors.
- [ ] Repeated click during processing does not create a second log/job.
- [ ] Replay same completed request ID returns duplicate without another model call.
- [ ] Wrong/missing webhook secret is rejected and no AI call occurs.
- [ ] Invalid author/log mismatch is rejected before generation.
- [ ] Invalid AI credential, rate limit or timeout produces Failed in Bubble.
- [ ] Stop/unreachability of n8n gives visible Bubble error, not infinite loading.
- [ ] Bubble callback outage fails visibly in n8n; stale-log timeout updates Bubble once reachable; no late Success is overwritten by timeout logic.
- [ ] Log retry reuses ID and increments attempt count; successful logs are not reprocessed.
- [ ] Confirm live vs version-test database and accessible reviewer URL.
- [ ] Scan exported JSON and screenshots to ensure no secrets or real personal data are included.

## Recording outline (3–5 minutes)

0:00–0:45 — Author login, own books, totals and coloured indicators.

0:45–1:30 — Admin list, search/city/status filters, author detail and source payout data limitations.

1:30–2:45 — Trigger one summary, show the real n8n webhook/validation/model/callback execution, then show Bubble Success and the generated content.

2:45–3:30 — Show bulk trigger and NotificationLog, with no false delivery claim.

3:30–4:30 — Demonstrate duplicate prevention and a controlled error case, show privacy rules/schema, briefly explain the prompt strategy and what you learned.

Keep credentials panels, provider tokens, webhook secrets and browser password managers out of the recording.

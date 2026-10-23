# Build the Bubble application

Status: implementation instructions and prepared imports. The actual editor app still needs to be built in an authenticated Bubble account.

## 1. Project and database

Create a web app named BookLeaf Royalty Hub. Add the types in `schema.json`, load/link records using `import-guide.md`, and apply `privacy-rules.md`. Use a cream/forest-green design, readable type, a collapsible left navigation, and responsive column layouts. The UI should show that these are sample royalty records, not live financial account data.

Suggested pages: `index` (login), `author_dashboard`, `my_books`, `admin_authors`, `admin_author` (type Author), `notification_log`. Add a reusable header/navigation and reusable royalty badge. Use Bubble-native elements, repeating groups, conditions and workflows, not an embedded React app.

## 2. Login and access

Index has email/password fields and a Log in button using Bubble's Log the user in action. On success route author/admin by Current User.role. Show readable login errors. All author pages require Current User logged in and role=author; admin pages require role=admin. Logout logs the user out and returns to index. Do not offer self-service "become admin" signup or editable role fields.

## 3. Author dashboard

- Query Books with owner=Current User. For each book, look up the latest RoyaltySnapshot sorted by as_of descending. Do not sum snapshots from multiple periods as if they were transactions.
- Summary cards: total earned, total paid, total pending, book count. Aggregate only the latest snapshot per book. Initial sample has one snapshot per book.
- Repeating group: title, ISBN (or Awaiting assignment), genre, production status, publication date (or Not published), MRP, platforms, copies sold, earned/paid/pending and last payout (or No payout recorded).
- Indicator condition order: pending<=0 → green Fully paid; published AND pending>0 AND last payout exists and older than 90 days → red Overdue; published AND pending>0 AND last payout empty AND publication date older than 90 days → red Overdue; otherwise pending>0 → yellow Pending.
- Compare actual dates (`Current date/time +(days): -90`), not formatted text or cached generated CSV status. Exactly 90 days is pending; more than 90 is overdue. A production-only book is not overdue under this rule. Clearly describe this as a review flag, not a definitive accounting conclusion.
- Production-only and zero-royalty books should render usable empty/zero states.

## 4. Admin author overview

- Search Author.name (case-insensitive UI search), filter by city, and filter by consolidated payout status.
- For each Author: name, city, total books, earned, pending. Derive consolidated status as any overdue book → Overdue; otherwise total pending>0 → Pending; otherwise Fully paid.
- Recompute status from live dates. For 10 authors an in-memory filtered list is acceptable; for scale maintain cached totals with update workflows and a scheduled daily status refresh.
- Clicking a row opens admin_author with that Author as page data.
- Bulk Generate is enabled only when there are eligible authors with pending totals. Show eligible count. Disable the button immediately while dispatching. Enqueue one request per author using the same integration as the individual button. Process sequentially or with a bounded queue; do not send all authors in one AI prompt.

## 5. Author detail and notification generation

Show every linked book and its latest royalty snapshot. Show source last-payout dates and cumulative paid totals. A Payout repeating group can display real transactions when supplied; the sample has no full ledger. Use the honest empty state described in the import guide.

Individual button: "Generate & Send Royalty Summary" with visible helper "Generates and saves a draft summary; email delivery is not enabled." This avoids claiming delivery when only generation/logging is implemented.

Workflow:

1. Only when Current User.role=admin AND page state `is_generating` is no: set that state yes immediately.
2. Search recent NotificationLogs for this author in Queued/Processing. If one exists and isn't stale, show its status instead of creating another.
3. Create NotificationLog with author, author_external_id, owner=Author.owner, requested_by=Current User, status=Queued, attempt_count=1, payload_as_of=Current date/time, delivery_status=Not sent.
4. Call the private n8n API Connector action, building the full author/book payload from server-side Bubble records. request_id=Result of step 3's unique ID. as_of is today's UTC date in YYYY-MM-DD. Do not accept an arbitrary client-submitted author payload for this action.
5. HTTP 202 accepted: show "Summary generation started" and the log link. HTTP 200 duplicate: show the existing completed log. HTTP 409: show already processing. Other response/error: mark log Failed with safe error text and a timestamp. Enable the API Connector error option that allows workflow handling rather than silently terminating.
6. Clear `is_generating` on completion and error. Never hold an unbounded spinner while awaiting the model.
7. Poll the relevant log every 3–5 seconds while it is Queued/Processing. At 3 minutes, re-read and mark stale unfinished logs Failed with "No completion received; check n8n before retrying". Stop polling terminal states. Preserve an existing successful callback if it arrived before the timeout; terminal updates should be conditional.
8. Retry a known Failed job using the same NotificationLog unique ID, increment attempt_count, set Queued and resend. Never automatically retry an uncertain Processing job while an execution may still be running.

For bulk, use a Bubble backend workflow on a list when supported; each entry applies the same guards and creates/sends one log. If the selected plan lacks that feature, use an explicit sequential custom-event loop while the admin page remains open and document the limitation. Do not pretend that a frontend loop survives closing the page.

## 6. Notification log

Admin-only repeating group sorted newest first. Fields: author, requested time (Bubble Created Date), status, completion timestamp, delivery_status, attempt_count. Select a log to view subject/email_body or safe error_message. Render email_body as plain text, not untrusted HTML. Success means generation+storage, not SMTP delivery.

## 7. Connect and demonstrate

Follow `../docs/integration.md`, then `../docs/acceptance-tests.md`. Record the real Bubble and n8n flow, not the local example fixture. Ensure the test app URL is accessible to reviewers and seed the correct environment before sharing it. Add the reviewer collaborator email only when the company provides it.

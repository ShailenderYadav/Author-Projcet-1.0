# Decisions, assumptions and remaining work

- Assignment 2 is separate from the React/Express Assignment 1 project. The actual application must live in Bubble. Local scripts are preparation/testing tools, not a replacement implementation.
- The original JSON is preserved. Relational imports split Authors, Books and one RoyaltySnapshot per book. Source external IDs remain available for linking and verification.
- Source figures are sample cumulative balances. An import date is not evidence that those balances are a real current financial ledger.
- The source contains no full payout transaction history or sales-period ledger. The UI must show known paid totals/last dates and an honest empty transaction state. No payment events, verified future dates, bank details or delays are invented.
- A 90-day overdue rule is the assignment's visual review heuristic. It is distinct from quarterly eligibility and the ₹1,000 minimum threshold. A flagged historical balance is not automatically a confirmed missed payment.
- Policy window calculation chooses the most recent quarter while its 45-day window remains open; otherwise the current quarter. The summary labels that as a policy window, not a promised payment, because sales-period data is absent.
- When there are no published books, the summary says so and includes in-production statuses. Zero/fully-paid balances get a positive acknowledgement.
- n8n receives a full trusted payload, reducing Bubble API exposure. A protected log read still verifies identity/status before the model call.
- Model-generated prose plus deterministic financial sections protects numeric correctness while retaining a personalised AI-generated email. Invalid output fails explicitly.
- Actual email delivery is not implemented; it is optional in the brief. Required visible content is designed to return to Bubble's log.
- Idempotency is a combined UI guard, durable log status check and serialized single-instance workflow. Concurrent multi-instance exactly-once locking is outside this implementation.
- Current Bubble plans/API availability must be checked against the selected account. The brief's free-plan statement is not treated as permission to purchase anything.
- No Bubble app, Bubble collaborator invitation, reviewer login, cloud n8n workflow, real AI request, public deployment or Loom recording has been created by the local preparation scripts.

## Remaining account-specific work

Create/access the Bubble app; implement the native pages/database/privacy/workflows; import/link the data; provision test accounts; import and run the workflow in n8n; bind secret credentials privately; verify the public HTTPS webhook; run connected acceptance tests; record the final demo and export the workflow again from the tested instance.

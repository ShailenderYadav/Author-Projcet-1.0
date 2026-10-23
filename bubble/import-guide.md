# Import the exact Assignment 1 dataset

These are prepared data files, not a Bubble app export. They must be loaded into your Bubble database after its types exist. Manual entry is also acceptable under the assignment.

1. Create the types/fields in `schema.json`. Use built-in Bubble `User` for login; never implement passwords as text fields. Keep role assignment admin-only.
2. Import `generated/authors.csv` into Author. Preserve `author_id` and all source values. Expect 10 records.
3. Create the author login accounts with Bubble signup/admin provisioning workflows and link each Author.owner to its User. Set User.author_profile to that Author. Set role=author via a trusted workflow. Provision one admin separately. Keep real test passwords outside this repository.
4. Import `generated/books.csv` into Book. Map `author_external_id` to text temporarily, map `available_on` to `availability_raw` (text). Expect 18 records. Blank publication dates stay empty.
5. Resolve each Book.author with `Search for Authors (author_id = This Book's author_external_id):first item`; set Book.owner from that Author.owner. Set Book.available_on to Book.availability_raw:split by `|`. Never rely on a display name alone as a relationship key. If CSV relationship resolution is available in your editor, you can use that instead and verify every link.
6. Import `generated/royalty-snapshots.csv` into RoyaltySnapshot. Map all numeric values as numbers and dates as dates, leaving blank last payout dates empty. Resolve book from `book_external_id`, author from `author_external_id`, and owner from Author.owner. Expect 18 snapshots, one per book. Do not sum multiple snapshots for the same book if new snapshots are later added: select its latest snapshot.
7. Do not create fictitious Payout transactions. The dataset provides cumulative paid totals and only the last payout date. Display those and show "Detailed payout transactions were not supplied" in the empty history state. Any extra transaction fixtures must be labelled as synthetic and kept separate.
8. Verify Priya Sharma: 2 books, total earned ₹19,908, paid ₹16,338, pending ₹3,570, total copies sold 531. Compare every author to `generated/author-summaries.json`.
9. Apply the privacy rules before testing from author accounts. A text `author_external_id` field is not a security boundary. The linked User owner and role rules are.
10. Refresh derived indicators against Current date/time. The prepared `as_of` dates are import/report snapshots, not a live payment ledger. Run `npm run prepare` to regenerate the local derived summaries on another day.

Bubble development and live databases are separate. When deploying, seed/link/verify the target database as well; do not assume development records appear in live automatically. Confirm your plan exposes the required API features before connecting n8n. If CSV import is unavailable on the chosen plan, enter the 28 source records manually and preserve the exact values.

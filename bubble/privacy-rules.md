# Bubble privacy rules to implement and test

These are a specification; privacy rules have not yet been configured in a real Bubble app.

Default: no public access, no "Everyone else" permissions on sensitive data types. Page redirects and hiding elements supplement privacy rules but do not replace them.

| Type | Author rule | Admin rule |
| --- | --- | --- |
| User | Current User is This User: only own safe profile fields; keep role/profile links non-autobindable | Current User.role is admin: required user management fields |
| Author | Current User is logged in AND This Author.owner is Current User: find in searches + own profile fields | Logged in AND role=admin: all necessary fields/searches |
| Book | Logged in AND This Book.owner is Current User: read own book fields/searches | Logged in AND role=admin: all necessary fields/searches |
| RoyaltySnapshot | Logged in AND This Snapshot.owner is Current User: read own royalty values/searches | Logged in AND role=admin: all necessary fields/searches |
| Payout | Logged in AND This Payout.owner is Current User: read own payout data/searches | Logged in AND role=admin: all necessary fields/searches |
| NotificationLog | No author access in this design; notifications are an operations log | Logged in AND role=admin: log content/searches |

Do not enable auto-binding for role, owner, payout amounts, external identifiers, or NotificationLog status. Deny author create/modify/delete via the Data API. Restrict trusted mutation workflows with explicit Current User.role checks; privacy rules for reading do not automatically authorize every workflow write.

Expose only NotificationLog through the Data API for the supplied automation; n8n receives author/book data from a server-side Bubble action. Configure the API name as `notificationlog` and verify it in Bubble's API documentation. Only enable the minimum Create/Modify/Find operations required. n8n needs read/modify of existing logs, not creation or deletion.

The n8n Header Auth credential holds a Bubble API token only on the server. A Bubble app API token may bypass privacy rules and carry broad admin access; never send it to the browser. Prefer an authenticated dedicated service user with appropriately limited access if your environment supports it. Do not claim a privileged app token is scoped merely because other API types are hidden.

## Required checks in two separate browser sessions

1. Anonymous visitor cannot load author/admin records.
2. Author A sees only A's books, snapshots and payouts.
3. Author B cannot retrieve A's records via a guessed page ID, search or API request.
4. An author cannot change their role or open admin actions.
5. An author cannot view NotificationLog or invoke the private n8n connector.
6. Admin can view both A and B and trigger summaries.
7. Removing an owner link fails closed: an unowned record is not exposed to authors.
8. Check Data API access and browser network responses, not just on-screen visibility.

Reference: https://manual.bubble.io/help-guides/data/the-database/protecting-data-with-privacy-rules

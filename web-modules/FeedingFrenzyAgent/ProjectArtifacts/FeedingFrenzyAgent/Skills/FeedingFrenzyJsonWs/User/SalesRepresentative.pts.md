# User/SalesRepresentative.pts

Hand-written. Sales Representative role graph for User sessions, mirroring `../SalesRepresentative.pts`.

## History

### 2026-11-19 - Initial User sales graph

- **What:** Includes `Foundation.pts` and the generated User wrappers that the Root sales graph includes, and nothing admin-only.
- **Why:** New authenticated sales chats must keep the same CRM tools in a User environment.
- **Validation actually performed:** action-name and `Execute`-signature parity with the Root sales graph, and absence of admin-only tools, in the 92/92 `FeedingFrenzy.Agent.Tools.Tests` run.
- **Limitation:** compilation by the Host User composer is proven only by the staging launch.

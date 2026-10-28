# Buffaly/Projects/FeedingFrenzyAgent/Skills/FeedingFrenzyJsonWs/TTGCommerce.Read.pts

## 2026-10-28 — Proposed TTG JsonWs read mirror v3 (not implemented)
23 thin exact JsonWs read mirrors for Customers/scope/destinations/invoices/documents, Sales Orders/packing, Purchase Orders, Products and Vendors. Bounded paging, matching counts and explicit optional-filter transport semantics; same Current service and no business writes.

Validation actually performed at design time: source/route/procedure-contract inspection, proposal structural checks and non-mutating patch applicability are recorded in the v3 design receipt. These are not compiled, live SQL, authorization or browser acceptance. Implementation must append its actual validation, map regenerated descriptors/clients and commit source/history together; no application changes or deployment are claimed by this draft.

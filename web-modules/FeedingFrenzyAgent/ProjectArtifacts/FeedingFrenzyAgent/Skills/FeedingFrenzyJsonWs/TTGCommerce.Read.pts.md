# Buffaly/Projects/FeedingFrenzyAgent/Skills/FeedingFrenzyJsonWs/TTGCommerce.Read.pts

## 2026-10-28 — Proposed TTG JsonWs read mirror v3 (not implemented)
23 thin exact JsonWs read mirrors for Customers/scope/destinations/invoices/documents, Sales Orders/packing, Purchase Orders, Products and Vendors. Bounded paging, matching counts and explicit optional-filter transport semantics; same Current service and no business writes.

Validation actually performed at design time: source/route/procedure-contract inspection, proposal structural checks and non-mutating patch applicability are recorded in the v3 design receipt. These are not compiled, live SQL, authorization or browser acceptance. Implementation must append its actual validation, map regenerated descriptors/clients and commit source/history together; no application changes or deployment are claimed by this draft.

## 2026-10-28 — Implemented exact read-only JsonWs mirrors
Implemented23 thin typed Execute wrappers using the existing Current CallBusinessRoute/CallUiRoute, exact PascalCase arguments, explicit optional nulls and bounded paging/search/count. Customer scope, addresses/invoices/documents; SO/packing; PO/vendor/status; ProductGrid and Vendors are included. No new credentials/auth/data-access layer, HTML scraping, generic loading or write actions.
Actual validation: source graph/exact contracts and focused7/full module70 tests pass; corresponding compiled APIs and canonical descriptors regenerated successfully. Canonical WebModule delivered to staging. Live local compile/tool/SQL/model proof follows activation; no production change.

## 2026-10-28 — Actual runtime rejects arithmetic guards
First real local help conversation succeeded through Wiki, but worker startup diagnostics proved TTGCommerce.Read.pts was skipped at unsupported subtraction in overflow guards. Removed only those unsupported expressions; every existing C# endpoint already enforces exact nonoverflowing page bounds before SQL. Keep basic bounded transport shaping, all23 names/routes/filter semantics and no-write graph. The generic project-relative typed upsert tool cannot target this external owning repository, so scoped owner SmartPatch used, not an installed copy.
Validation: full module tests re-run and canonical package restaged; actual commerce execution/strict runtime diagnostics are required separately below in the final delivery receipt. No server validation weakened, fallback added, SQL changed or production activation.

## 2026-10-28 — Product Boolean filters use typed C# shaping
Actual Help model lookup failed the ProtoScript string-filter guard for valid empty and true values, while the authenticated typed ProductGrid JsonWs endpoint succeeded. Replaced that product-page action body with FeedingFrenzyCommerceReadTools.ProductPageArguments followed by the unchanged Current.CallUiRoute. IDs, exact three-state filters, search/sort/page and the 25-action graph remain the same. No normalization, alternate API shape, new auth or business writes. The external owning repository is outside the project-relative typed upsert tool, so scoped SmartPatch changed the owning file, not installed output.
Actual validation: full module suite 74/74 passed, including exact nullable JSON and rejection checks. Subsequent canonical staging/model/browser proof is recorded in the local delivery receipt, not inferred from these tests.

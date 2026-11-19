# ErrorLogDispatch ProtoScript Skill

Thin pass-through skill exposing exactly two curated dispatch-agent actions:

- `ToGetErrorDispatchSession` creates/reuses and verifies a diagnostic owner and its DispatchTree attachment. It does not accept provider/model/reasoning arguments; the C# facade reads the package-owned shared policy so the dispatching agent cannot override configuration.
- `ToDispatchErrorToSession` validates and queues one bounded assignment.

All business rules and typed validation live in `Buffaly.ErrorLogDispatch.WebModule`.

## Proposed delivery separation — design baseline v1, 2026-10-20

Proposed, not implemented: replace model-authored diagnostic assignments with routing fields and automatic original-turn evidence capture; use saved DiagnosticGuidance as the single investigation/report instruction body. Preserve diagnostic identity, ResetOnLimit, exact attachment/parent validation, collector state and canonical queue relay. Record prompt/evidence provenance and distinguish prepared versus admitted delivery. The diagnostic workflow requires local/remote source resolution, Creator raw-error/debug evidence, causal tracing and concrete code/user-message/configuration choices. Source-structure tests are not runtime acceptance. Validation at design authoring: nonmutating patch applicability only; no build, unit run, live delivery, Creator request or deployment. On implementation, append actual dated validation results before commit; do not reinterpret this entry as executed verification.

## 2026-10-20 — Implement code-owned Markdown diagnostic delivery

Implemented the approved separation: routing-only request/action, original current-turn evidence capture, single saved DiagnosticGuidance, exact diagnostic destination checks, Markdown assigned scope/provenance/instructions/evidence, bounded rejection without evidence truncation, prompt/assignment hashes and real queue receipts. Diagnostic instructions require machine-bound Creator raw/error/debug evidence, causal tracing, actionable code/user-message/configuration choices and a full report. Context no longer duplicates the report workflow. Tests now validate the authoritative guidance and execute deterministic Markdown composition including embedded fences and limit rejection. Validation: Release module build succeeded; package tests passed 15/15. Staging end-to-end diagnosis and screenshots remain pending at this source checkpoint; no runtime acceptance claimed here.

## 2026-10-20 — Explicit destination contract

ToGetErrorDispatchSession adds destinationKind, existingSessionKey and evidenceQuote; no branch logic added to ProtoScript. Prior owner reuse preserves all session settings; new dedicated children alone receive policy. The typed upsert tool only supports files under active OpsAgent root, not this externally owned package source; scoped SmartPatch used here rather than editing the installed package copy. Existing optional string-argument pattern retained. Validation: module/test build passes20/20; runtime ProtoScript compile and all three staging branches pending.


## 2026-11-18 — Explicit original-source parameters on the two thin actions

ToGetErrorDispatchSession and ToDispatchErrorToSession now require sourceMessageKey and pass it directly to their typed request.SourceMessageKey. Descriptions require the original collector User row from this coordinator's persisted history, permit earlier-turn evidence and instruct callers to reuse the same key. Delivery description explicitly keeps AssignedFrame/RoutingReason at 2,000 characters each: full alarm evidence is captured verbatim by code, not pasted into routing fields. No ProtoScript business logic or extra actions added. The typed authoring tool is scoped to the active installed agent root, not this external package; scoped SmartPatch changed only owner source as in the prior contract change.

Validation: serial Release focused tests 13/13 and full package solution tests 32/32 passed, including required parameter/pass-through and exactly-two-actions source assertions plus executable C# evidence/composition tests. No runtime ProtoScript activation/compile or dispatch was performed; installed copies remain unchanged. No deployment, alarm resume or replay. Existing ImageSharp dependency advisories remain.


## 2026-11-18 — Explicit error-assignment title on the thin delivery action
ToDispatchErrorToSession requires errorTitle and forwards request.ErrorTitle; description identifies AssignedFrame as readable reported-error summary and code-owned action/owner/read-only scope, with unchanged separate full evidence/instructions. Retains exactly two thin actions and original SourceMessageKey contract. Source-only scoped patch used because active-root typed authoring cannot target this external package without installed mutation.
Validation: full serial Release package35/35passed. New test compiles the complete actual skill source in a disposable isolated project against current native facade/signatures with zero compiler diagnostics (only expected missing optional Service root notice). No activation or method execution. This also resolves the earlier owning-source compilation evidence gap; it does not claim installed runtime acceptance. Existing valid Version1sidecar has ownership/phrases only, no stale signature field to regenerate. No live dispatch/replay/deployment.

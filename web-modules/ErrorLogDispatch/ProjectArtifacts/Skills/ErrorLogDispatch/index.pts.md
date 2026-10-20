# ErrorLogDispatch ProtoScript Skill

Thin pass-through skill exposing exactly two curated dispatch-agent actions:

- `ToGetErrorDispatchSession` creates/reuses and verifies a diagnostic owner and its DispatchTree attachment. It does not accept provider/model/reasoning arguments; the C# facade reads the package-owned shared policy so the dispatching agent cannot override configuration.
- `ToDispatchErrorToSession` validates and queues one bounded assignment.

All business rules and typed validation live in `Buffaly.ErrorLogDispatch.WebModule`.

## Proposed delivery separation — design baseline v1, 2026-10-20

Proposed, not implemented: replace model-authored diagnostic assignments with routing fields and automatic original-turn evidence capture; use saved DiagnosticGuidance as the single investigation/report instruction body. Preserve diagnostic identity, ResetOnLimit, exact attachment/parent validation, collector state and canonical queue relay. Record prompt/evidence provenance and distinguish prepared versus admitted delivery. The diagnostic workflow requires local/remote source resolution, Creator raw-error/debug evidence, causal tracing and concrete code/user-message/configuration choices. Source-structure tests are not runtime acceptance. Validation at design authoring: nonmutating patch applicability only; no build, unit run, live delivery, Creator request or deployment. On implementation, append actual dated validation results before commit; do not reinterpret this entry as executed verification.

## 2026-10-20 — Implement code-owned Markdown diagnostic delivery

Implemented the approved separation: routing-only request/action, original current-turn evidence capture, single saved DiagnosticGuidance, exact diagnostic destination checks, Markdown assigned scope/provenance/instructions/evidence, bounded rejection without evidence truncation, prompt/assignment hashes and real queue receipts. Diagnostic instructions require machine-bound Creator raw/error/debug evidence, causal tracing, actionable code/user-message/configuration choices and a full report. Context no longer duplicates the report workflow. Tests now validate the authoritative guidance and execute deterministic Markdown composition including embedded fences and limit rejection. Validation: Release module build succeeded; package tests passed 15/15. Staging end-to-end diagnosis and screenshots remain pending at this source checkpoint; no runtime acceptance claimed here.

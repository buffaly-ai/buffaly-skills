# Improve Code Quality And Reduce Redundancy

Goal
- Reduce code volume while preserving behavior.
- Remove duplicate logic paths and compatibility layers that no longer serve active callers.
- Enforce one canonical contract per feature across C#, UI, and ProtoScript.

Primary Principles
1. Prefer one authoritative contract and one execution path.
2. Fix callers at the source rather than adding multi-shape normalization.
3. Keep conversion logic at boundaries only (API ingress/egress, persistence migration).
4. Prefer typed C# models over ad-hoc JSON handling in runtime logic.
5. Fail fast on invalid contract shape.

Execution Workflow
1. Identify the target feature and its current authoritative contract.
2. Inventory all duplicate code paths, fallback branches, and shape-normalization helpers.
3. Classify each branch:
   - keep (authoritative path),
   - migrate caller then delete,
   - boundary-only adapter (temporary and explicitly scoped).
4. Update all active callers (UI, worker, tools, ProtoScript prompts/actions) to canonical shape.
5. Replace internal dynamic/JSON handling with typed classes where feasible.
6. Remove dead code, alias branches, and wrapper-on-wrapper logic.
7. Split oversized services by responsibility if size/duplication prevents clarity.
8. Add or update focused validation checks to lock in the canonical contract.

Required Checks
- Canonical request/response shape is identical across all active callsites.
- No internal multi-shape normalization remains in core runtime flow.
- Boundary conversion points are explicit and minimal.
- Any session/persistence migration path is deterministic and documented.

Deliverable Format
1. Authoritative contract selected.
2. Duplicate paths removed (files and methods).
3. Caller updates completed (UI/C#/ProtoScript).
4. Migration plan and status (if persistence changed).
5. Residual risks and follow-up items.

Guardrails
- Do not add new compatibility layers unless explicitly required and time-boxed.
- Do not hide mismatches with silent fallback logic.
- Prefer small coherent batches that are easy to review and revert.

# Ontology Foundry ProposeBuild — Reviewable ProtoScript Proposals

Use this procedure to turn explicit ontology-construction candidates into exact, reviewable ProtoScript proposals. Session-index `NewCandidate` or `Ambiguous` labels are not construction candidates by default; they require a separate user decision that promotes one exact label into this workflow. This version is propose-only and performs zero source or ontology writes. Legacy Harvest `Build` rows remain accepted during migration.

## Inputs

- `mode` defaults to `propose-only`.
- Optional exact proposal IDs select a subset of explicitly promoted construction candidates or legacy Harvest Build rows.
- `apply-approved` and `apply-all-build-rows` are blocked until the scoped approval coordinator is installed. A mode name or approval prose alone is never executable approval.

## Artifact contract

Read and rewrite only `artifacts/ontology-foundry/evidence-graph.md`. Preserve ranked intake and other coherent sections. Replace or add `## Build Proposals` with one subsection per selected row containing:

- proposal ID, source ranked-resolution row, source Level2 key, rank, importance, and evidence;
- duplicate/bind recheck and disposition;
- exact parent/base and resolved schema evidence;
- exact project-relative reachable `Nodes/Personal/...` target file;
- complete ordered `prototype` or `partial prototype` blocks fenced as `protoscript`;
- hard identities, semantic names, aliases, typed assignments, and provenance;
- collision/ambiguity risks and no-build alternative;
- validation searches/details/schema checks and rollback expectation;
- `ApprovalState=pending|approved|applied|rejected|blocked` plus canonical digest input.

Do not create per-proposal files or a separate write log.

## Procedure

1. Require an explicit construction-candidate section or exact user instruction naming the label to promote. A `NewCandidate` row in `## Ranked entity resolutions` is unresolved session-index evidence and cannot trigger this skill by itself. Never apply or propose an `Ambiguous`, `Existing`, or `Rejected` row. Legacy Harvest `Build` rows may be selected during migration.
2. Re-run focused candidate search immediately before design. Inspect closest plausible objects. If the object now exists, record `skip-existing`; if identity remains ambiguous, record `blocked-for-expand`; never force a new object.
3. Inspect the proposed parent/base details and full resolved schema. Prefer an existing specific base. Propose a new base only when no current base fits and record it as a separately ordered prerequisite.
4. Choose an existing project-reachable personal home from established ownership patterns. Use a project-relative `Nodes/Personal/...` path only. Never target generated output, an installed package, a temporary/recovery copy, or system-owned source. If a new include/index is required, record that prerequisite and do not claim one upsert would activate the object.
5. Emit complete valid ProtoScript blocks in dependency order. Include hard identity only when grounded. Keep ambiguous shorthand out of semantic aliases. Every typed field must exist on the resolved schema or be separated as an explicit base-extension prerequisite.
6. Record one disposition for every selected row: `proposal-ready`, `skip-existing`, `blocked-for-expand`, `rejected-no-build`, or `blocked-placement`.
7. Record canonical digest input: ordered proposal IDs, exact prototype references, target files, exact blocks, source evidence revision, and accepted field IDs. Do not compute or accept a digest in prompt text.
8. In `propose-only`, complete when every selected row has a proposal or explicit disposition.
9. For either apply mode, write the full plan but set `ApprovalState=blocked` and `ApplyBlockedGuardUnavailable`. Do not call backup, authoring, compile, restore, shell, or Codex.

## Grounded example

If the user explicitly promotes an unresolved durable GoDaddy web-module label for construction, re-search using module name plus package/path identity. A `GoDaddySkill` hit does not mean the module exists; it is a neighbor and collision risk. If `BuffalyWebModule#GoDaddy` now resolves by hard identity, use `skip-existing`. Otherwise propose the module under the verified web-module base in an existing personal ontology home, keeping the skill, source project, solution, secret name, and temporary repository separate.

## Done

Done means every explicitly selected construction candidate is accounted for, proposals are duplicate-checked and schema-valid, exact reachable placement and complete ProtoScript are shown, ambiguity is blocked, canonical digest inputs are present, and zero source or ontology writes occurred.

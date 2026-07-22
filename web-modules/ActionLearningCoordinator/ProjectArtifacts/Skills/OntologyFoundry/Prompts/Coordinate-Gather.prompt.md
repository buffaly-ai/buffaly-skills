# Ontology Foundry — Coordinate Gather Through Terminal Collection

Use this coordinator when the user asks the Ontology Foundry agent to gather and rank entities from one exact Level1 or Level2 session and expects the agent to carry Gather through collection without parent shepherding.

This is orchestration only. `ToGatherAndRankLevel2EntitiesSkill` remains authoritative for the exact Level2 instruction, entity-ranking semantics, artifact section, validation, and no-write boundary.

## Input

- `sourceSessionKey`: one exact Level1 source session key. It owns the living EvidenceGraph; derive the observer only by appending `-level-two`.

## Hard boundaries

- Work only in the Level1 source's `artifacts/ontology-foundry/evidence-graph.md`, using the exact `sourceSessionKey` on every artifact call.
- Never write the canonical EvidenceGraph under the worker, Level2, or principal session.
- Never run Resolve, ProposeBuild, Expand-and-Enhance, Generalize, EvidenceGraph, ontology authoring, or Session Entity Index materialization unless the original user instruction explicitly requested that separate operation.
- Never redispatch when the artifact records `Pending` or `GatherComplete` for the same target.
- Do not use shell, HTTP/JsonWs, arbitrary file tools, sleep loops, or repeated turn polling.
- Commentary is not a stopping point when the next safe tool call is immediately available.

## Mandatory execution protocol

- A nonterminal response MUST contain the next `function_call` item. Never return a commentary-only response while any state transition below is available.
- Loading this coordinator is not work completion. In the same active turn, load Gather and read the EvidenceGraph.
- Loading Gather is not work completion. In the same active turn, read state and invoke the permitted next action.
- Reading state is not work completion. In the same active turn, either report an already-terminal state, resume correlated pending work, or invoke the synchronous evaluator.
- Receiving terminal Level2 markdown is not work completion. In the same active turn, validate it, write the artifact, reread it, and then return `final_answer`.
- The only permitted commentary-only terminal is an honest `Pending` state already persisted when no safe tool can observe the external event yet.

## State model

Use the existing `## Ranked Level2 entities` section as the only state carrier:

- `NotStarted`: no state for this exact target.
- `Evaluating`: synchronous typed relay has been invoked.
- `Pending`: asynchronous fallback has correlation metadata and awaits a terminal turn.
- `Collected`: terminal correlated markdown was accepted.
- `GatherComplete`: validated markdown and row count are persisted.
- `Empty`, `Failed`, or `ParseError`: terminal result with an exact reason.

## Procedure

1. Load and follow `ToGatherAndRankLevel2EntitiesSkill`. Do not copy or rewrite its exact Level2 instruction from memory.
2. Read the current EvidenceGraph.
3. If the same target is `GatherComplete`, reread it and return the existing terminal summary. Perform no dispatch.
4. If the same target is `Pending`, inspect only the correlated latest/recent turn allowed by Gather. If terminal, collect it; if still running, preserve `Pending` and stop honestly. Never redispatch.
5. If the target is not started, use the exact instruction from Gather and call `ToOntologyFoundryEvaluateLevel2Harvest` once. This is the preferred coordinated-sync path.
6. Accept only a terminal result for the exact Level2 key. Preserve the returned Level2 markdown verbatim. Validate only Gather's required heading/table constraints; do not repair malformed output.
7. Write or replace exactly `## Ranked Level2 entities` in the single EvidenceGraph. Record target, terminal locator/correlation returned by the relay, status, row count, validation, and explicit zero ontology/index writes.
8. Reread the EvidenceGraph after writing. Return terminal success only when the reread proves `GatherComplete`, `Empty`, `Failed`, or `ParseError` for the exact target.
9. If the synchronous relay is unavailable, times out, or cannot provide a terminal correlated result, use Gather's asynchronous send path once only when no dispatch is already recorded. Persist `Pending` with every returned correlation field and an exact resume note. Do not claim autonomous completion.

## Done

Done means one of the following is proven in the reread single artifact:

- `GatherComplete` with valid verbatim Level2 markdown and a ranked row count from 0 through 10;
- `Empty`, `Failed`, or `ParseError` with the exact reason; or
- honest `Pending` with correlation metadata when an external Level2 event is the only remaining work.

The terminal response must state the target, artifact path, status, row count when known, whether synchronous completion occurred, and that zero ontology and Session Entity Index writes occurred.

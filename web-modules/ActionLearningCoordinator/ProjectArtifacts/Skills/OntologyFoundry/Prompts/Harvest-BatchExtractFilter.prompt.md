# Ontology Foundry Harvest — Level2 Batch Extract and Filter

Use this procedure as the combined orchestration route for a bounded cohort of Level2 observers. For each source it performs the same two canonical stages as the standalone skills: gather/rank durable entities, then resolve those ranked rows as Existing, NewCandidate, Ambiguous, or Rejected. Harvest performs zero ontology writes.

## Inputs

- `batchSize` defaults to 10 and must be 1–10.
- Explicit exact Level1 or Level2 session keys are preferred. Empty input permits selection only from currently active sessions.

## Artifact contract

Read and rewrite only `artifacts/ontology-foundry/evidence-graph.md`. Maintain the batch control sections `## Harvest batch selection` and `## Harvest dispatch log`, then the same canonical data contracts used by the standalone stages: `## Ranked Level2 entities` and `## Ranked entity resolutions`. For a cohort, include the exact Level2 source key on every ranked and resolution row. Do not create batch files, raw exports, indexes, or session-owned artifacts.

## Exact Level2 extraction instruction

Send the following text exactly, including the Level 2 label:

```text
[label: Level 2]

You are doing an inspect-only ontology harvest for the Ontology Foundry.

## Hard rules
- Do NOT modify Plan, Scratch, tasks, ontology, files, or the observed Level1 session.
- Do NOT call tools that write, send work to Level1, or run shell/codex.
- Use only read/inspect tools you already have for the observed Level1 session
  (Plan/Scratch/tasks/session memory/recent turns as available).
- If you cannot inspect enough to answer, return the Empty format below.

## Job
Identify the top durable ontology-worthy entities this Level1 session is actually about.

Durable means: a concrete named object someone would want in ontology later
(system, environment, website, repo/solution/project, installed module/package,
skill/package, provider, durable feature/product surface, secret *name* if stable).

NOT durable: session keys, turn ids, commit hashes, worktrees, one-off tasks,
temporary errors, ad-hoc debug strings, pure chat furniture.

## Method
1. Inspect observed Level1 Plan.md, Scratch.md, tasks, session memory, recent turns.
2. List concrete entities with evidence.
3. Rank by current importance to this session's work (10 = central, 1 = peripheral).
4. Mark Durable yes/no.
5. Prefer specific names over vague words.

## Output format (mandatory)
Return ONLY markdown:

# Level2 entity harvest
- ObservedLevel1SessionKey: <key or unknown>
- Level2SessionKey: <this session key>
- Inspected: plan|scratch|tasks|memory|turns
- Status: ok|empty

## Top entities
| Rank | Entity | Importance | Durable | Evidence |
|---:|---|---:|---|---|
| 1 | <short concrete name> | 10 | yes | <specific evidence> |

Rules: max 10 rows; Rank 1 most important; Importance integer 1-10.

## Empty format
# Level2 entity harvest
- ObservedLevel1SessionKey: ...
- Status: empty
- Reason: <why>
```

## Procedure

1. Read the EvidenceGraph. If the exact cohort has a running Harvest section, resume it and never redispatch a row with a successful dispatch `MessageKey`.
2. Normalize explicit keys only as follows: trim and dedupe case-insensitively; an exact Level1 key becomes `<key>-level-two`; a key already ending exactly `-level-two` is unchanged. Reject malformed derived keys. Preserve input order and cap at `batchSize`.
3. When no keys are supplied, call `ToOntologyFoundryListActiveSessions(100)`, retain only keys ending exactly `-level-two`, sort ordinal-ignore-case, and cap at `batchSize`. If none exist, mark Harvest blocked and request explicit keys; do not scan folders.
4. Write `Harvest batch selection` before dispatch, including Level2 key, derived Level1 key, selection source, batch limit, timestamp, zero writes, and status running.
5. Dispatch the exact instruction once to every selected key with `ToOntologyFoundrySendToSession`. Capture queue item ID, returned `MessageKey`, outcome, and dispatch UTC. Write `Harvest dispatch log` immediately. Record send failure and never retry blindly.
6. Run one bounded collection pass. Call `ToOntologyFoundryGetMostRecentSessionTurn` first. A turn is eligible only when its first user row or explicit correlation field matches the dispatch `MessageKey` and its status is terminal. Use `ToOntologyFoundryGetRecentSessionTurns(sessionKey, 5)` only when a later turn displaced the matching turn. Never busy-loop or sleep.
7. Persist each eligible final markdown verbatim under `## Ranked Level2 entities`, grouped by exact Level2 key, plus status/error for every target. Pending targets keep Harvest running with an explicit resume instruction; stop without redispatch.
8. Strictly parse only the mandatory heading/table contract: at most 10 rows, integer rank/importance ranges, and Durable `yes|no`. Malformed output becomes a parse-error source; do not guess. Normalize labels only by trim plus case-insensitive exact grouping; never fuzzy-merge distinct names.
9. For every distinct durable label, follow the standalone Resolve contract: focused semantic entity search, details confirmation for plausible matches, and exactly one resolution: `Existing`, `NewCandidate`, `Ambiguous`, or `Rejected`.
10. Write all results under `## Ranked entity resolutions`. Preserve each source key, rank, importance, evidence, search evidence, details evidence, and reason. Never fuzzy-merge labels from different sources; exact case-insensitive grouping may contribute a recurrence count but never proves identity.
11. Rank `Existing` and `NewCandidate` rows by maximum importance descending, recurrence descending, then exact label/prototype ordinal-ignore-case. Recurrence boosts priority but never proves identity.
12. For each observed Level1 session, build `## Proposed Session Entity Index` using only confirmed `Existing` rows: exact prototype, local `RelativeValue` from Level2 Importance, evidence, `Source=level2-extract`, and source resolution row. Preserve NewCandidate and Ambiguous labels as unresolved index evidence, not build requests.
13. Complete only when every dispatch is terminal, empty, or failed and both canonical intake sections, proposed session-index mappings, and batch control are coherent. Report selected/dispatched/ok/empty/failed counts, mapped Existing entities, unresolved labels, and Ambiguous rows. Stop; do not auto-run ProposeBuild.

## Done

Done means dispatch/result correlation is explicit, malformed or pending rows are preserved, every ranked row has one canonical resolution, each observed Level1 session has a proposed session-owned `RelatedEntities` map, the one EvidenceGraph is coherent, and zero ontology or session-index writes occurred. Unresolved labels are not automatically routed to ontology construction.

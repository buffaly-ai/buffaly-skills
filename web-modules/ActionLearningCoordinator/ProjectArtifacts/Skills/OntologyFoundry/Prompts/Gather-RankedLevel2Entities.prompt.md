# Ontology Foundry — Gather and Rank Level2 Entities

Use this procedure to ask one existing Level2 observer for a ranked, inspect-only list of the durable entities most important to its observed Level1 work. This skill gathers evidence only. It does not search ontology, resolve prototypes, classify build candidates, or write ontology.

## Input

- `sourceSessionKey`: one exact Level1 source session key. It owns the living EvidenceGraph.
- Derive the observer key only by appending `-level-two` to `sourceSessionKey`.

## Artifact contract

Read and rewrite only the source Level1 session's `artifacts/ontology-foundry/evidence-graph.md` through `ToReadOntologyFoundryEvidenceGraph(sourceSessionKey)` and `ToWriteOntologyFoundryEvidenceGraph(sourceSessionKey, markdown)`. Preserve unrelated coherent sections. Replace or add exactly one section named `## Ranked Level2 entities` containing dispatch metadata and the collected Level2 markdown. Do not create another artifact.

## Exact Level2 instruction

Send the following text exactly, including the Level 2 label:

```text
[label: Level 2]

You are doing an inspect-only entity harvest for the Ontology Foundry.

## Hard rules
- Do NOT modify Plan, Scratch, tasks, ontology, files, or the observed Level1 session.
- Do NOT call tools that write, send work to Level1, or run shell/codex.
- Use only read/inspect tools you already have for the observed Level1 session.
- If you cannot inspect enough to answer, return the Empty format below.

## Job
Identify and rank the top durable entities this Level1 session is actually about.

Durable means a concrete named object someone would want to find again: a system, environment, website, repository, solution, project, module, package, skill, provider, product, durable feature surface, organization, person, or stable secret name.

Not durable: session keys, turn IDs, commit hashes, worktrees, one-off tasks, temporary errors, ad-hoc debug strings, or chat furniture.

## Method
1. Inspect the observed Level1 Plan, Scratch, tasks, session memory, and recent turns as available.
2. Identify concrete entities supported by specific evidence.
3. Rank them by importance to the session's actual work.
4. Prefer precise canonical-looking names over vague categories.

## Output format
Return ONLY markdown:

# Level2 ranked entities
- ObservedLevel1SessionKey: <key or unknown>
- Level2SessionKey: <this session key>
- Inspected: <comma-separated sources>
- Status: ok|empty

## Entities
| Rank | Entity | Importance | Durable | Evidence |
|---:|---|---:|---|---|
| 1 | <short concrete name> | 10 | yes | <specific evidence> |

Maximum 10 rows. Rank 1 is most important. Importance is an integer from 1 through 10.

## Empty format
# Level2 ranked entities
- ObservedLevel1SessionKey: <key or unknown>
- Level2SessionKey: <this session key>
- Status: empty
- Reason: <why>
```

## Procedure

1. Resolve and validate the exact Level1 source and derived Level2 key. Do not enumerate sessions or select a cohort. Never use the worker or Level2 key as artifact owner.
2. Read the current EvidenceGraph. If `## Ranked Level2 entities` already records a pending dispatch for the same key, resume collection and do not redispatch.
3. Select the execution mode from the caller:
   - `coordinated-sync`: when invoked through `ToCoordinateOntologyFoundryGatherSkill`, call `ToOntologyFoundryEvaluateLevel2Harvest` once with the exact instruction and use its bounded terminal result.
   - `async-resume`: otherwise send the exact instruction once with `ToOntologyFoundrySendToSession`, record queue ID, `MessageKey`, target key, and dispatch UTC immediately, then run one bounded collection pass.
4. In `coordinated-sync`, accept only a terminal result for the exact Level2 target. Record every returned message/turn locator available for correlation. If the relay cannot return a terminal correlated result, fall back to `async-resume` only when no dispatch is already recorded.
5. In `async-resume`, read the most recent turn first; read at most five recent turns only if needed to locate the response correlated by `MessageKey`. Do not loop or sleep.
6. Accept only a terminal correlated final answer. Preserve returned markdown verbatim. Pending remains pending with an explicit resume note; send/evaluation failure remains failed.
7. Validate only the required headings and table constraints. Record malformed output as `parse-error`; do not repair it.
8. Write the result and reread the EvidenceGraph before claiming terminal success. A commentary sentence that promises an immediately available next tool call must be followed by that tool call in the same turn.
9. Stop. Do not search candidate entities or run the resolution skill automatically.

## Done

Done means the reread single artifact contains correlation and either one valid ranked Level2 entity response or an explicit empty, pending, failed, or parse-error result. Zero ontology searches and zero ontology writes occurred. `pending` is an honest asynchronous result, not autonomous completion.

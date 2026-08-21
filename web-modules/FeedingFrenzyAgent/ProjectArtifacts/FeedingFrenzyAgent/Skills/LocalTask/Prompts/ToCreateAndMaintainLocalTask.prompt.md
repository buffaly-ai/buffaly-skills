# Trusted Prompt: Create And Maintain A Local Task

You are helping Buffaly maintain a durable local task artifact.

A task is a freeform markdown document in the current session root. It preserves durable work context, references, evidence, decisions, status, and acceptance criteria. A task centers on defining acceptance criteria and reaching them. It is not a plan and not a GitHub ticket.

## Purpose

Use this workflow when the user wants Buffaly to create, resume, update, block, supersede, or close a local markdown task that:

- captures exact requirements and constraints,
- records confirmed problems separately from suspected problems,
- preserves evidence and decisions,
- defines objective acceptance criteria,
- remains in the current session root as durable working memory.

This workflow is specifically for local session task artifacts. Do not convert the task into a GitHub issue, external tracker item, Plan step, or Scratch note unless the user separately asks.

## Core Rules

1. Before creating a new task, inspect existing root-level `task-*.md` files when available.
2. If an existing task covers the same work item, update it. Do not create another task for refinements or continuations.
3. Create a new task only when the work item is clearly separate, the user asks for a new task, or the prior task is closed/superseded.
4. Preserve useful history, evidence, and decisions. Do not delete material context just to make the task look cleaner.
5. Treat task files as editable markdown documents. When requirements, scope, acceptance criteria, or status change, update the relevant section directly and record the reason when it matters.
6. Read the relevant surrounding text and apply targeted edits, preferably SmartPatch-style.
7. Every task should have an explicit status: `Open`, `Blocked`, `Superseded`, or `Closed`.
8. Define acceptance criteria before treating the task as ready to execute.
9. Do not mark a task `Closed` until the task records evidence that each acceptance criterion was met or explicitly waived by the user.
10. When status changes, record the reason and evidence in the task.

## Workflow

1. Define the user's goal in plain language from the request and available evidence.
2. Extract exact requirements, hard constraints, non-goals, and acceptance criteria from the user request, existing task artifacts, files, prompts, code, logs, tool outputs, and prior evidence.
3. Gather direct evidence before recording conclusions. Prefer inspecting relevant artifacts over relying on user recollection when the evidence is locally available.
4. Gather relevant execution guidance before finalizing the task. Look for applicable prompts, context prompts, skills, actions, entities, design docs, source files, related task artifacts, logs, and runtime references.
5. Write or update the markdown task in the current session root using the task as durable anti-drift memory.
6. Maintain the task as work proceeds by updating changed sections directly and adding dated progress, evidence, blockers, decisions, status reasons, and completion notes when useful.
7. Before closing the task, compare the final evidence against the acceptance criteria and record the proof in `## Completion / Blocker / Supersession`.

Resolve missing context with tools first. Ask the user one precise follow-up question only when an essential ambiguity remains and cannot be resolved safely with available tools.

## Inputs To Gather

Gather as much of this as needed before creating or updating a task:

1. Task title / short name.
2. User goal and desired outcome.
3. Confirmed problems and suspected problems.
4. Evidence already available and evidence still needed.
5. Acceptance criteria.
6. Constraints, rules, boundaries, and non-goals.
7. Whether this is a new task, continuation, status update, blocker, supersession, or closure.
8. Relevant guidance Buffaly should use while executing the task.

## Evidence And References

- Inspect relevant files, prompts, session artifacts, runtime behavior, logs, mappings, and tool outputs when they matter to the task.
- Record concrete paths, references, and short observed evidence. Separate confirmed facts from assumptions.
- Capture guidance needed to execute the task: design docs, external information, prompts, context prompts, skills/actions, and related task artifacts.
- Include a `## Guidance To Use` section when guidance items matter. For each item, record what it is, why it is relevant, and how it should be used during execution.
- Resolve missing context with tools before asking the user; ask only when an essential ambiguity remains.

## Status Meanings

- `Open`: work is active or ready to continue.
- `Blocked`: work cannot continue until a blocker is resolved.
- `Superseded`: another task or direction replaced this one.
- `Closed`: acceptance criteria were met and proof is recorded, or the user explicitly waived the remaining criteria.

## Minimal Task Shape

Use this shape for new tasks unless the user requests another format:

# <Task Title>

Status: Open
Status Reason:

## Summary

## Goal

## Exact Problems

Separate confirmed problems from suspected problems.

## Evidence

Include file paths, session paths, observed snippets, tool outputs, mismatches, reproduction notes, and confirmed conclusions.

## Guidance To Use

List relevant prompts, context prompts, skills, entities, actions, source files, docs, logs, and related task artifacts. Note why each matters.

## Constraints / Rules

## Acceptance Criteria

Write concrete verifiable completion checks. These define what it means for the task to be done.

## Progress Log

Add dated updates when they help explain progress, decisions, blockers, or evidence. Preserve prior entries unless the user explicitly asks to clean up or consolidate them.

## Open Questions

Only include unresolved items that still need decisions.

## Completion / Blocker / Supersession

For closure, list each acceptance criterion and the evidence that proves it was met, or note that the user waived it.

## Working Behavior

- Tasks may be freeform and may contain substantial context.
- Keep references to design docs, source files, prompts, logs, external information, and related task files.
- Do not turn the task into a step-by-step execution plan; use Plan for execution steps.
- When resuming, read the task before acting.
- When work completes, blocks, or is replaced, update the task status.

## Output

After creating or updating the task, summarize only the task file path, whether it was created or updated, current status/open items, and the next step.

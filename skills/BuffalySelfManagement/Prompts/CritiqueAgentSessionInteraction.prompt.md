# Critique Agent Session Interaction

Review a concrete Buffaly agent session, turn, or region of a session to understand what happened, why tool calls were chosen, what they returned, and what could have been done better.

## Goal
Produce an evidence-backed critique that helps Buffaly avoid repeated mistakes, reach conclusions faster, use better tools, or recover from poor interactions with less drift.

## Inputs
The user should provide at least one review target:
- session key
- turn ID
- time range
- named session region, such as "the turn after the correction"
- concrete behavior to investigate, such as "why it chose the wrong repository"

If the target is broad, narrow it with tool-assisted inspection before asking the user for clarification.

## Core Workflow

### 1. Bind the review target
Identify whether the review is for a whole session, one turn, several turns, or a behavior inside a session.

Use the smallest useful scope first. Expand only when the evidence requires more context.

### 2. Bootstrap the timeline
Use session-summary tools to identify the important turns:
- `ToGetMostRecentSessionTurn` for quick latest-state inspection.
- `ToGetRecentSessionTurns` for the first bounded review of a named session.
- `ToGetSessionTurnPage` when the important turn is older than the recent-turn window.

Look for user corrections, final answers that contradict evidence, tool failures, repeated searches, premature completion, or route changes.

### 3. Pull turn details
For each important turn, call `ToGetSessionTurnDetail` with a bounded `maxRows`.

Inspect:
- user input to the turn
- assistant route or commentary
- tool names
- tool arguments
- tool results
- truncation markers
- lifecycle or failure rows
- final assistant conclusion

### 4. Inspect artifacts for state drift
Read the target session artifacts when relevant:
- `Plan.md`
- `Scratch.md`
- root-level task artifacts
- generated files or reports mentioned in the turn

Use file tools such as `ToReadTextFileRaw`, `ToGetFileBlock`, and `ToSearchTextInDirectoryWithRipgrep`.

Do not judge a source session's plan or scratch by reading the critic session's own artifacts.

### 5. Inspect logs when turn detail is incomplete
If turn details are summarized, truncated, or missing raw outputs, inspect logs under `C:\logs`, especially `C:\logs\Buffaly`.

Search by:
- session key
- turn ID
- tool name
- target path or entity name
- user correction text
- failure text
- `ToolRegistrar.ToolCall`
- `CodexCompletedSseParse`

Use `ToSearchTextInDirectoryWithRipgrep` first, then `ToGetFileBlock` around relevant lines.

### 6. Build a tool-call timeline
Create a concise table or bullet sequence with:
- turn ID or time
- user instruction
- tool call
- important arguments
- returned result
- assistant interpretation
- critic note

Keep facts separate from interpretation.

### 7. Evaluate each important tool call
For each tool call, ask:
1. Was this the right tool for the moment?
2. Were the arguments scoped correctly?
3. What did the tool actually return?
4. Did the assistant use the result correctly?
5. Was there a safer, faster, or more authoritative next step?

Watch for overloaded semantic queries, stale ontology hits, broad recursive searches, early result caps, ignored warnings, output truncation, and unsupported conclusions.

### 8. Compare actual route to a better route
State:
- Actual route: what the agent did.
- Better route: what it should have done.
- Why better: faster, safer, more authoritative, less error-prone, or easier to validate.

### 9. Classify root causes
Use concrete categories such as:
- missing ontology entity
- bad semantic query shape
- stale semantic index
- wrong tool selected
- weak tool description
- bad fallback algorithm
- output truncation
- premature conclusion
- plan drift
- failure to incorporate user correction
- missing validation step

### 10. Recommend improvements at the right layer
Separate recommendations by layer:
- prompt guidance
- tool descriptions
- ontology or memory
- typed tool implementation
- runtime diagnostics
- validation workflow
- user-facing process

When possible, propose exact small changes rather than abstract advice.

## Output Format
Return markdown with these sections:

## Review Target
Session key, turn IDs, time range, or behavior reviewed.

## Evidence Inspected
Tools, logs, artifacts, and files inspected.

## Timeline
Concise sequence of important turns and tool calls.

## Tool-Call Analysis
What was called, why it was likely called, what it returned, and whether the result was used correctly.

## Better Route
What should have happened instead.

## Root Causes
Layered causes, not just one blame statement.

## Recommended Improvements
Concrete changes grouped by prompt, tool, ontology, runtime, or process.

## Confidence and Open Questions
State confidence and any evidence still missing.

## Guardrails
- Do not critique from summary alone when raw turn details or logs are available.
- Do not invent tool calls or results.
- Do not assume a source-of-truth target without validating it.
- Keep the review evidence-backed and operational.
- Prefer read-only inspection unless the user explicitly asks to apply fixes.
- If fixes are applied, validate and commit only the intended change set.

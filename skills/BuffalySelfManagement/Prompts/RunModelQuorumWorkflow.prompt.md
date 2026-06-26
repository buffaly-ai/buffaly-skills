You are running a model quorum workflow.

A model quorum means: create or reuse multiple child agent sessions, configure each with a user-chosen or agent-selected model/provider/reasoning profile, send each child the same task independently, collect durable outputs, compare or synthesize the results, and report which result is best or how they should be combined.

## Goal
Use multiple models as independent workers on the same prompt so the parent agent can evaluate quality, cost/token use, latency, reasoning style, and practical usefulness.

The workflow is model-agnostic:
- The user may specify exact providers, models, reasoning levels, and child session names.
- The user may ask you to choose an appropriate quorum.
- The quorum may use different providers, different models within one provider, or different reasoning levels for the same model.
- Do not hard-code a fixed quorum such as GPT/Grok/Gemini unless the user asked for it or it is the best available choice.

## Required Workflow

### 1) Clarify and bind the quorum target only when necessary
Extract:
- the parent session key,
- target child sessions,
- provider/model/reasoning choices,
- the shared task prompt,
- expected output artifact name,
- scoring criteria,
- polling interval and timeout expectations.

Prefer discovering available provider/model/session tooling instead of asking the user when safe.
Ask a clarifying question only if the model choices or task are materially ambiguous and choosing incorrectly would invalidate the quorum.

### 2) Verify or create child sessions
Use typed session tools when available:
- inspect existing children before creating duplicates,
- create/attach child sessions under the parent,
- configure provider/model/reasoning selections through the runtime model-selection tool,
- verify each selection succeeded.

If the user uses approximate provider names, bind them to catalog-valid provider/model names when evidence is available. For example, user-facing "Groq/Grok" may map to provider `xai` with a `grok-*` model if that is what the catalog exposes.

### 3) Dispatch the shared task without waiting
Use a fire-and-forget session send when the goal is parallel quorum work.
Prefer a tool equivalent to `ToSendToSession(sessionKey, instruction)` rather than `ToSendToSessionAndWait`, so all children can start before the parent waits.

Dispatch the same task body to each child, with only minimal session-specific metadata if needed.
Do not solve the child task in the parent before dispatching.

### 4) Require durable markdown output from each child
For non-trivial responses, instruct each child to write its final answer to a markdown file in its own session directory, for example:

```text
FinalAnalysis.md
```

Prefer reading these files over scraping or paging through the message stream.

Why:
- message history pages can truncate large responses,
- final messages may require cursor/message-key retrieval,
- a child can complete useful Plan/Scratch work without an easily visible final message,
- markdown artifacts are durable, inspectable, and easy to compare,
- artifact files preserve work across turns and interruptions.

Recommended child instruction:

```text
Write your final analysis to `FinalAnalysis.md` in your session directory. If you already produced a final response, reuse that content and do not restart the investigation. Include your session/model identity at the top. After writing the file, reply briefly that the file is written.
```

### 5) Use timers and polling deliberately
After dispatching, set a sleep timer before polling. A typical first interval is two minutes unless the user specifies otherwise.

Polling loop:
1. Sleep for the requested interval.
2. Check child session statuses.
3. Check whether each expected markdown artifact exists.
4. Read completed artifacts.
5. If a child is still running, continue the timer/poll loop.
6. If a child is loaded but missing the artifact, inspect Plan/Scratch for evidence of completion.
7. If analysis appears complete but no artifact exists, send a minimal nudge asking the child to write the artifact from completed notes rather than restarting.

Do not spin-poll rapidly. Use clear progress updates after each timer/poll cycle.

### 6) Collect outputs from files
Read each child artifact from disk using file tools. For large artifacts, prefer StringRef/file tools or targeted file blocks. Use raw reads only when the content size is manageable.

Record basic metrics when useful:
- file path,
- character count,
- word count,
- approximate token count when exact usage is unavailable,
- completion latency if known,
- whether a nudge was required,
- whether the response followed artifact/output instructions.

Approximate token count may be estimated as characters / 4 when exact billing telemetry is unavailable. Clearly label it as approximate.

### 7) Score, compare, or synthesize
Use the user's rubric if provided. Otherwise score on dimensions such as:
- correctness,
- evidence quality,
- completeness,
- practical usefulness,
- clarity/structure,
- concision/token efficiency,
- instruction following,
- latency/completion reliability,
- ability to avoid unsupported claims.

Report:
- best overall answer,
- best token efficiency,
- best balance of quality and brevity,
- any model that failed, stalled, needed a nudge, or ignored artifact instructions,
- whether synthesis would improve the result.

If synthesis is requested or clearly useful, synthesize from the strongest parts of each artifact and identify which child contributed which insight.

### 8) Preserve continuity
Update Plan and Scratch:
- record child session names and provider/model selections,
- record dispatch time and polling cycles,
- record artifact paths and metrics,
- mark superseded message-history collection steps complete when file artifacts replace them.

For multi-turn or high-value quorum evaluations, prefer a durable local task artifact with acceptance criteria.

## Operational Guidance

### Prefer typed tools
Use typed session/model/file tools before shell or raw HTTP. Use generic shell only when no typed operation can retrieve the needed local evidence.

### Avoid message-stream dependence
Do not rely on session-history pagination for large child outputs when markdown artifacts are possible. Use message history mainly for:
- detecting final message keys,
- diagnosing why a child did not write an artifact,
- checking short completion messages.

### Handle failures gracefully
If one child fails or stalls:
- keep collecting successful children,
- inspect status/history/Plan/Scratch,
- nudge only if safe and useful,
- report the failure as part of the evaluation rather than hiding it.

### Keep the parent neutral
The parent should orchestrate and evaluate. Do not bias children by sharing other children's outputs until the independent phase is complete.

### Do not overfit the quorum
A quorum is a pattern, not a fixed model list. Choose models based on the user's goals:
- high-quality reasoning comparison,
- low-cost/high-speed comparison,
- provider diversity,
- same-provider model-size comparison,
- reasoning-level comparison,
- tool-use reliability comparison.

## Completion Output
When the quorum is complete, return a concise report with:
- child sessions and model selections,
- artifact links,
- metrics and approximate token usage if exact usage is unavailable,
- scores/ranking,
- winner(s),
- recommended synthesis or next step.

End with suggestions only when there are obvious follow-up actions, such as running a second round, synthesizing the best answer, or changing the quorum.


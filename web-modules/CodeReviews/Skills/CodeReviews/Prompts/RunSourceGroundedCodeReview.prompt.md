# Review One Buffaly Code Change Set

Use this workflow when reviewing one specified Buffaly code change set.

## Purpose

- Review one explicitly provided target such as a check-in, commit, commit range, branch diff, patch, or working-tree change.
- When a source session is supplied, determine whether the change correctly and completely implements that session's documented intent.
- Review requirement, design, flow, validation, and documentation conformance before style.
- Use the authoritative language-specific CodeReviews guidance for each touched language.
- Review the requested target directly instead of searching for another commit.
- Use later history only to determine whether a suspected issue was already corrected or made irrelevant.
- For an interactive review requested directly by a user, return specific findings or a clear no-issue result.
- For an attached CodeReviews child, notify the source session only when material actionable findings remain. Complete a clean review silently.

## Approved Tools

Source context and CodeReviews lifecycle:
- `ToGetMostRecentSessionTurn`
- `ToGetRecentSessionTurns`
- `ToGetCodeReviewSourceSessionPlan`
- `ToGetCodeReviewSourceSessionScratch`
- `ToListCodeReviewSourceSessionTasks`
- `ToReadCodeReviewSourceSessionTask`
- `ToListCodeReviewSourceSessionArtifacts`
- `ToReadCodeReviewSourceSessionArtifact`
- `ToSubmitCodeReviewFindings`
- `ToCompleteCodeReviewWithoutFindings`
- `ToMarkCodeReviewFailed`
- `ToSubmitCodeReviewTurnFindings`
- `ToCompleteCodeReviewTurnWithoutFindings`
- `ToMarkCodeReviewTurnFailed`

Other review tools when applicable:
- `ToGetGitHubCommitComments`
- `ToAddGitHubCommitComment`
- `ToGetGitHubAuthStatus`
- `ToCompileProtoScriptProject`
- `ToLoadProtoScriptActionTool`
- typed file, git, build, and test tools available in the active environment

Do not use PowerShell or raw filesystem traversal to inspect another session's artifacts. Use the CodeReviews-native typed source-session tools.

## Authoritative Language Guidance

- C#: `Nodes/Personal/CodeReviews/CodeReviews.CSharp.md`
- ProtoScript: `Nodes/Personal/CodeReviews/CodeReviews.ProtoScript.md`
- JavaScript and kScript: `Nodes/Personal/CodeReviews/CodeReviews.JavaScript.md`

Read and follow every guidance file corresponding to the changed file types. These files govern language-specific review rules. This prompt governs target resolution, source-context discovery, evidence requirements, delivery behavior, and approval gating.

## Resolve the Review Target

1. Resolve the exact requested target from the instruction and supplied bindings.
2. Inspect direct evidence for that target: commit, diff, patch, changed files, tests, and necessary surrounding code.
3. If one commit is named, review that commit rather than searching history for another target.
4. If the target is ambiguous, use safe git and file discovery before asking a question.
5. Do not submit findings for a different commit from a reused child session.

## Source-Session-Grounded Workflow

Apply this section whenever the review instruction supplies a source session.

### 1. Start with the latest source turn

Call `ToGetMostRecentSessionTurn` for the exact source session before reviewing code.

Identify:
- the user's requested outcome,
- what the original agent says it implemented,
- claimed validation,
- repository and file references,
- referenced task or design artifacts,
- unresolved constraints or follow-up work.

Use `ToGetRecentSessionTurns` only when the latest summary is insufficient or clearly describes work after the reviewed commit. Keep the history request bounded.

### 2. Identify the governing task

Call `ToListCodeReviewSourceSessionTasks`. Read the open task most closely related to the repository, commit subject, changed files, and recent-turn goal with `ToReadCodeReviewSourceSessionTask`.

Extract:
- the exact problem,
- confirmed decisions,
- constraints,
- acceptance criteria,
- validation requirements,
- non-goals.

Do not read unrelated historical tasks indiscriminately. If multiple active tasks remain materially plausible, state the ambiguity.

### 3. Read the source Plan

Call `ToGetCodeReviewSourceSessionPlan`.

Use Plan to understand:
- the active implementation step,
- claimed completion and validation state,
- pending or blocked work,
- whether the commit appears premature.

Plan is routing evidence. It does not override the user instruction or task acceptance criteria.

### 4. Identify the governing design

Call `ToListCodeReviewSourceSessionArtifacts`. Prefer an artifact explicitly referenced by the latest turn or task. Otherwise identify a plausible design or implementation document using its title/path and overlap with the repository, feature, symbols, and changed files. Read it with `ToReadCodeReviewSourceSessionArtifact`.

Extract:
- target call chains,
- API and data contracts,
- state transitions,
- expected file changes,
- constraints and prohibited approaches,
- acceptance criteria,
- validation plan,
- non-goals.

If two materially different artifacts remain plausible, read both when bounded and report the ambiguity instead of silently selecting the one that matches the implementation.

### 5. Use Scratch only when necessary

Call `ToGetCodeReviewSourceSessionScratch` only when another governing source references a decision that needs supporting evidence. Scratch can contain discarded hypotheses and never overrides the user instruction, active task, or governing design.

## Governing-Source Priority

Use this order and report conflicts explicitly:

1. Explicit user instruction in the source turn
2. Active task acceptance criteria and confirmed decisions
3. Governing design document
4. Source-session Plan
5. Applicable repository guidance and `AGENTS.md`
6. Language-specific review guidance
7. Scratch and other supporting notes

Do not reinterpret governing sources to make the implementation appear compliant. Do not invent requirements when context is absent.

## Required Review Depth

Review the change for:

### Intended outcome and task coverage
- Does it solve the user's actual problem?
- Does it satisfy each applicable acceptance criterion?
- Is implementation partial, adjacent, or prematurely declared complete?
- Did scope change without authorization?

### Design and architecture conformance
- Does it follow the specified call chain, contract, state model, file plan, and ownership boundary?
- Did it introduce a prohibited HTTP, JsonWs, fallback, normalization, compatibility, or generated-output path?
- Did it materially diverge without updating the governing design?

### End-to-end flow correctness
- Does required data survive host, worker, storage, callback, and UI boundaries?
- Are names and casing consistent?
- Are lifecycle, retry, duplicate, and failure transitions correct?
- Does invalid required input fail explicitly?

### Validation adequacy
- Does the evidence support the original agent's validation claims?
- Were tests, staging checks, and runtime evidence required by the task/design actually performed?
- Do tests prove user-visible behavior rather than only implementation details?

### Documentation conformance
- Were required `.cs.md`, `.pts.md`, design, and task updates made?
- Is documentation now stale or inconsistent with the committed behavior?

### Conventional correctness
- Defects, regressions, security, concurrency, resource handling, performance, and material maintainability risks.

Do not report stylistic preferences unless they have a concrete correctness, consistency, or maintenance consequence.

## Finding Evidence Contract

Every submitted finding must include all of the following:

1. **Finding and consequence** — explain the practical problem and what can fail.
2. **Code evidence** — cite the concrete file, symbol, line/diff, test, or runtime evidence.
3. **Source-document justification** — cite the exact user instruction, task file and section, design artifact and section, Plan constraint, repository rule, or explicit context gap that justifies the finding.
4. **Mismatch explanation** — explain why the implementation fails or risks failing that governing source.
5. **Original-agent guidance** — recommend what the original agent should validate, correct, document, or present to the user.

Do not submit unsupported suspicions, praise, generic summaries, or style-only observations.

A missing governing document is a finding only when it prevents required conformance verification or violates an explicit task/repository documentation requirement.

## Attached CodeReviews Child Delivery

When the instruction supplies an attached turn-level `SourceTurnContextJson`, treat the ordered commit manifest as one delivered implementation:

- Review every listed repository/SHA directly. Do not omit earlier commits because the last commit appears complete.
- Never construct one git range across repositories.
- Evaluate the combined result against the exact completed source turn, active task, governing design, and Plan.
- Use exactly one grouped completion action. Pass the supplied `SourceTurnContextJson` unchanged; it is the authoritative cross-worker binding for the delivered turn. Do not pass separate repository paths, commit SHAs, or source session keys.
- With material findings, call `ToSubmitCodeReviewTurnFindings` once with the unchanged `SourceTurnContextJson` and consolidated findings-only markdown.
- With no material findings, call `ToCompleteCodeReviewTurnWithoutFindings` once with the unchanged `SourceTurnContextJson` and remain silent.
- If review cannot be completed, call `ToMarkCodeReviewTurnFailed` once with the unchanged `SourceTurnContextJson` and a concise failure reason.
- Do not call the single-commit completion actions for a turn manifest.

When the instruction supplies exact `RepositoryPath` and `CommitSha` completion bindings:

- If one or more material actionable findings remain after validation, call `ToSubmitCodeReviewFindings` exactly once with findings-only markdown.
- If no material actionable findings remain, call `ToCompleteCodeReviewWithoutFindings` exactly once. Do not send a no-issue message or generic review summary to the source session.
- If the review cannot be completed, call `ToMarkCodeReviewFailed` with a concise reason.
- Do not include source or child session keys in completion action parameters.
- After the completion action succeeds, return only a short confirmation in the child session.

Use this findings-only format and omit empty sections:

```markdown
# Code Review Findings

## High: <specific finding title>

Source-document justification:
- `<task or artifact path>`, `<section or acceptance criterion>`
- Requirement: "<concise quote or faithful requirement statement>"

Code evidence:
- `<file path>:<line or symbol>`
- <what the committed code does>

Finding:
<the mismatch and practical consequence>

Guidance to the original agent:
<what should be validated, corrected, documented, or presented to the user>
```

## Interactive Approval Workflow

For a direct interactive user review rather than an attached findings submission:

1. Inspect the actual target and applicable language guidance.
2. Present only concrete findings tied to the target.
3. For non-auto-approved findings, show the exact proposed diff before applying changes.
4. Present at most three findings at a time and wait for approval.
5. Use the applicable language guidance for any explicitly requested fix and validation.
6. Compile ProtoScript when ProtoScript changes are made.

## GitHub Comment Policy

Use GitHub commit comments only for a GitHub commit when durable posterity is useful or requested. Read existing comments first. If persisting a marker, use exactly:

- `Buffaly review marker: issue_found`
- `Buffaly review marker: no_issue_found`

GitHub comments do not replace source-session findings delivery or user approval.

## Completion Rules

- Do not claim review completion until the actual target was inspected.
- Do not substitute a history sweep for direct review.
- Do not edit source during an attached CodeReviews child review.
- Do not use language guidance to override this prompt's source-context, evidence, or delivery rules.

# CodeReviews Agent Tools ProtoScript

## Purpose

Defines typed actions used by Code Review child agents. The actions keep lifecycle persistence inside `CodeReviewFindingsService` and expose bounded read-only source-session context through `BuffalyArtifacts`.

`ToRunSourceGroundedCodeReviewSkill` is the package-owned automatic-review prompt action. Its prompt ships at `Skills/CodeReviews/Prompts/RunSourceGroundedCodeReview.prompt.md`, so installed environments receive the review policy without depending on personal OpsAgent content.

## Source-Grounded Review Tools

- `ToGetCodeReviewSourceSessionPlan` reads `Plan.md`.
- `ToGetCodeReviewSourceSessionScratch` reads `Scratch.md` as supporting evidence.
- `ToListCodeReviewSourceSessionTasks` lists validated root `task-*.md` names.
- `ToReadCodeReviewSourceSessionTask` reads one validated task artifact.
- `ToListCodeReviewSourceSessionArtifacts` lists the typed artifact manifest, including discoverable `artifacts/**` entries.
- `ToReadCodeReviewSourceSessionArtifact` reads one exact path returned by the manifest.

All source-session readers call `Buffaly.Agent.Host.BuffalyArtifacts` directly and serialize the existing typed results with `BasicUtilities.JsonUtil`. They do not use PowerShell, filesystem traversal, or Level2 watcher actions.

## Review Completion

- `ToSubmitCodeReviewFindings` is findings-only and notifies the source session through the existing callback path.
- `ToCompleteCodeReviewWithoutFindings` marks a clean review complete without storing findings or notifying the source session.
- `ToMarkCodeReviewFailed` preserves the existing failure path.

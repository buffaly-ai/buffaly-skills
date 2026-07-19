## Diff page`n- Added commit/worktree diff rendering script with 5, 10, 30, and full context support.

## Align diff header script (2026-05-07)
- Updated the diff page script to use the actual diff title and repo metadata elements after the three-page split.

- 2026-05-07: Refined navigation/cards, normalized displayed paths, added CodeMirror read-only diff rendering, aggregate diff summary, and binary-file sorting for the initial code review browser.

## Pending review retry
- Send notes now submits both currently visible page annotations and any locally saved retry payloads from prior transient queue failures.
- Send notes now includes each annotation's full filesystem path in addition to the repository-relative path, line range, selected text, and note.
- The diff toolbar now displays a persistent send status message so users can see when notes are sending, sent successfully, saved locally, or failed.

## Annotation overlay mapping
- Pending and sent annotation highlights map saved file line numbers back to the matching old/new diff gutters before applying CodeMirror line classes.
- Review notes now render as compact CodeMirror line widgets directly below the annotated line instead of separate annotation cards above each file.
- Inline note widgets use icon-only edit/remove controls and a distinct purple annotation treatment so they stand apart from green added-line diff highlights.

## Show Query-Configured Session On Initial Render (2026-05-21)
- Updated the connection summary to render from the current bridge config immediately, so `sourceSessionKey` query values show as connected before target settings finish loading.
- Added the missing pending-review button updater that `renderDiff()` already called, preventing an exception from blocking the first connection-summary refresh.

## Diff check-in navigation (2026-05-21)
- Added check-in list loading on the diff page so users can jump directly to another check-in from the toolbar.
- Moved connection summary rendering to the always-visible top card instead of injecting it into the diff file list.

## Diff check-in source alignment (2026-05-21)
- Updated the diff-page check-in selector to call `GetCheckIns` with the same repository path, branch name, and limit pattern used by the main check-ins page.

## Review toggle click target fix (2026-05-21)
- Updated the diff-page review toggle handler to use `closest("#reviewToggleButton")`, so clicks on the inner icon/text spans still toggle review state after navigating between commits.

## Short SHA direct-link stability (2026-06-23)
- Normalized successfully loaded commit snapshots to the authoritative full SHA returned by the server.
- Stopped using the recent check-in dropdown as a commit existence validator, preventing valid short-SHA links from being overwritten by a false "Commit not found" redirect.
- Added the current commit to the selector when it is outside the recent check-in list, so older direct links remain selectable after the diff loads.

## Manual Code Review Agent Trigger (2026-06-27)
- Added a `Review this commit separately` action to committed diff pages.
- The action sends the current repository, normalized commit SHA, same-origin CodeReviews URL, and `sourceSessionKey` to `TriggerCodeReviewAgent` and displays child-session queue status in the diff toolbar.

## Phase 1 Agent Review Record Panel (2026-06-30)
- Added loading/rendering for `GetCommitReview`, raw review text submission through `SubmitCommitReviewText`, and immediate panel refresh from trigger responses.
- Design Decision: render raw review text as escaped preformatted content and keep agent review state separate from human reviewed state.

## Submit Review Environment Routing (2026-06-30)
- `SubmitCommitReviewText` requests now include the bridge-configured environment so findings callbacks are routed to the selected agent target instead of hardcoding Dev.

## Explicit Per-Commit Agent Findings (2026-06-30)
- Removed automatic `SyncCommitReview` calls when the diff page loads an agent review record with `Status=Running`.
- Design Decision: the diff page is now a read-only display for running agent reviews; findings must be written explicitly through `SubmitCommitReviewText` for the exact repository path and commit SHA instead of inferred from the shared child session's latest final answer.

## Simplified Manual Findings Submit (2026-07-04)
- Manual findings submission now calls SubmitCodeReviewFindings with only repository path, commit SHA, and review text.
- Design Decision: browser/manual compatibility should match the typed agent contract and should not send source/child session keys.

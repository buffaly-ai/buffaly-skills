# code-reviews-semantic-refs.js Change History

## Git Commit Semantic Ref Formatter (2026-05-20)
- Registers a CodeReviews-owned formatter for neutral `[[git-commit:<repo-path>#<sha>|<label>]]` inline refs.
- Resolves local repository path plus commit SHA to the local CodeReviews `diff.html?mode=commit` route so unpushed commits can still open in the local review browser.
- Uses the generic Buffaly web-module config when configured and otherwise falls back to the current Buffaly origin.

## Read Generic Buffaly Web Module Config (2026-05-21)
- Switched base URL lookup to `window.BuffalyWebModuleConfig.CodeReviews.CodeReviewsBaseUrl`.
- Design Decision: the formatter now consumes the module-owned `ClientConfig` emitted by Buffaly Agent's generic `/api/web-modules/{moduleName}/config.js` endpoint without legacy globals or script URL probing.

## Include Source Buffaly Session In Diff Links (2026-05-21)
- Added source session key propagation from `window.BuffalyAgentSessionContext.getActiveSessionKey()` to generated CodeReviews diff links as `sourceSessionKey`.
- Design Decision: carry the originating Buffaly session explicitly in the URL so the standalone CodeReviews page can select the same Dev/local agent session by default.

## Manual Code Review Agent Trigger Button (2026-06-27)
- Added a DOM enhancer that inserts a `Review` button beside rendered CodeReviews `git-commit` links.
- The button reuses the rendered diff URL query data and calls `TriggerCodeReviewAgent` so timeline commit refs can manually start a Code Review child agent without changing the core semantic-ref renderer contract.

## Styled Manual Review Button (2026-06-29)
- Upgraded the injected `Review` button from an unstyled native button to a self-contained gradient pill with sparkle icon, hover/focus polish, and loading/queued/error visual states.
- Design Decision: inject the small style block from this formatter script because the button is added into Buffaly timeline content where the CodeReviews harness stylesheet is not otherwise loaded.
- Added an inline status chip beside the button so click progress and failures are visible in the timeline instead of being hidden in the button title or browser console.
- The formatter uses the generated CodeReviews JsonWs client; `web-module.json` must list the module-owned generated client script before this formatter in `AgentScripts`.

## State-Aware Review Buttons (2026-06-30)
- After inserting a timeline `Review` button, the enhancer now calls `GetCommitReview` using the repository path and commit SHA already present in the rendered CodeReviews diff URL.
- Persisted agent review state changes the button label and style: `Review` for missing/not reviewed records, `Reviewing` for running records, `Reviewed` for completed findings, and `Review failed` for failed records.
- `Running` buttons are disabled to avoid duplicate agent review starts; `Reviewed` buttons navigate to the diff page with `showReview=1`; failed and not-reviewed buttons still trigger or retry the review agent.
- Lookup failures leave the button in its default usable `Review` state so transcript rendering does not become noisy when CodeReviews is unavailable, but they now log `console.warn` diagnostics for debugging.
- Running records no longer call `SyncCommitReview`; the timeline button stays read-only in `Reviewing` state until the child explicitly persists findings through `SubmitCommitReviewText` for that commit.
- Status lookups do not override a button already in `loading` state, preventing the async lookup response from racing with a user click that is currently starting a review.
- The status lookup path uses the PascalCase response contract only and avoids unused/write-only DOM metadata.

## Skip Non-Hex Commit Refs Before Status Lookup (2026-07-01)
- Added client-side hex commit validation before rendering CodeReviews `git-commit` refs and before calling `GetCommitReview` from injected timeline review buttons.
- Design Decision: keep `CodeReviewCommitReviewStore.NormalizeCommitSha(...)` strict and fail-fast for invalid service inputs while preventing malformed timeline refs from generating noisy server errors during opportunistic status lookups.

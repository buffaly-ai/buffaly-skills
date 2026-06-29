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

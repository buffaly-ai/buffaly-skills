## Check-ins page`n- Added repository check-in list script for the separate check-ins page.

- 2026-05-07: Refined navigation/cards, normalized displayed paths, added CodeMirror read-only diff rendering, aggregate diff summary, and binary-file sorting for the initial code review browser.

## Show Worktree State And Colored Stats (2026-05-08)
- Added a visible worktree status card on the check-ins page and color-coded additions/deletions in check-in rows.

## Cache Recent Check-ins (2026-05-21)
- Added `localStorage` caching for the check-ins page keyed by repository path, selected branch, and limit.
- The page now renders cached branch/worktree/check-in data immediately when available, then refreshes from `GetCheckIns` in the background.
- Refresh results replace the cache so back/forward navigation to a recently viewed repository can show the prior commit list without waiting for git log to complete.

## Push Unpushed Check-ins (2026-05-21)
- Added branch sync rendering that uses the typed `AheadBy` and `BehindBy` response fields, so the check-ins page always shows the current unpushed commit count.
- Added a guarded `Push all` button that appears when the current branch is ahead of its upstream, calls `PushRepository`, clears the local check-ins cache, and reloads fresh check-in data after the push attempt.

## Mark Unpushed Check-ins (2026-05-21)
- Added an `Unpushed` badge to the first `AheadBy` check-in rows so commits that have not reached the upstream branch are visible in the commit list.

## Check-ins layout cleanup (2026-05-21)
- Reworked the check-ins list markup so title, badges, date, stats, and review action render in stable columns instead of crowding each other.
- Removed duplicate branch-sync rendering from the worktree status area because the page header already shows the sync summary and push action.

## Phase 1 Agent Review Badges (2026-06-30)
- Added a separate `Agent: ...` badge sourced from `AgentReviewStatus` beside the existing human review badge.
- Design Decision: check-ins now show agent progress without filtering or mutating human reviewed state.


# code-reviews-harness.js Change Notes

## Initial UI behavior
- Added repository loading, check-in loading, worktree mode, and diff rendering behavior.

## Simplify navigation and API errors
- Removed the three-column interaction model and added page-style navigation between repositories, check-ins, and diffs.
- Kept API calls explicit so repository load failures surface as status messages.


## Runtime verification cleanup
- Kept the page script independent of shared Buffaly globals and verified repository/check-in API calls through the standalone stub.


## Shared script compatibility
- Kept the page controller using the generated JsonWs service object now backed by the standard Buffaly JsonMethod client stack.


## Shared script compatibility (2026-05-07 14:47:50)
- Kept page navigation code compatible with the restored shared Buffaly JavaScript stack.

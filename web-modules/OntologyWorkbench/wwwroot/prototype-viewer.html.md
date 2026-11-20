# Prototype Viewer source history

This companion was created on 2026-11-20. Earlier behavior is documented from the observed source and current investigation, not invented historical validation.

## 2026-11-20 — Match the current loaded-only paged inspection contract

- A real staging inspection proved the public `BuffalyAgentService.RunProtoScriptMethod` policy requires `loadedOnly:true`; explicitly requesting false is rejected before worker dispatch. Replaced the incorrect false request introduced in 0024f50 with the required true request. This preserves, rather than bypasses, the current public API's no-indexed-activation guarantee.
- `loadPrototypeDetails` now follows the current `INSPECTION_SNAPSHOT_HASH`, UTF-16 `CharacterOffset`/`NextCharacterOffset`, and `EOF` contract until completion. It validates hash identity, expected offset, returned body length, and advancing continuations. Malformed, changed, and transport-error responses cannot become a successful empty document.
- `parsePrototypeDetails` now reads the actual `VALUES` tree in the complete inspection document instead of treating the header as the prototype root. Missing values fail visibly or take the existing saved ContextPrompt path, never an empty success. The existing assigned-value renderer remains in use.
- Unset property rows now honor the authoritative `HasAssignedValue=False` schema flag; headers and assigned fields are not shown as unset. The retained selected method definition is rendered with `textContent` using the existing section/content styles.
- Preserved originating-session warmup, shared header, ContextPrompt fallback, PromptAction instruction loading, abort behavior, and existing layout/style decisions. This is not a UI redesign. Known inherited UI-standard debt includes page-local styles and client-side property filtering (UI-STD-01 Principles 2/3/5); those are outside this routing/inspection repair.
- Validation actually performed: the current staging public action with `loadedOnly:true` returned the real complete ToGetPrototypeDetails document; `false` returned HTTP 500 with server log `Loaded-only prototype inspection cannot activate indexed modules.` Nine functional Node tests passed against the actual source functions; all 56 .NET tests passed; Release solution build succeeded with dependency/nullability advisories/warnings. Final corrected installed-page/cold-session screenshot proof is pending the Antigravity staging window through 01:23 UTC or earlier explicit release. No installed staging source or Matt-local processes were changed during that hold.

## Related same-day earlier changes

The preceding 3a929d2 commit added the narrow dedicated `ToLoadContextPrompt` fallback, because the exact named reproduction is saved source-backed context guidance rather than a loaded ontology prototype. It retains normal details/schema inspection first and the original failure if dedicated context loading also fails. The exact context loader succeeded on the Matt source session, but that does not prove its personal source exists on staging.

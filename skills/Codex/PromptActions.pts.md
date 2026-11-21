# Codex PromptActions.pts source history

## 2026-11-20 — Remove retired incremental-edit workflow
- Removed ToCoordinateCodexIncrementalEditAndValidateSkill and its prompt after Matt retired the embedded Codex editing/sub-agent tools it calls. Also removed the unregistered EditCodeViaCodex.prompt.md, which teaches those same retired tool calls. Kept ToFindCodexThreadIdByNameSkill and its local read-only workflow; the independent embedded-server installer prompt was not part of this tool runtime retirement.
- Validation: canonical LazySkillIndexGenerator successfully validated the module and regenerated the sidecar with exactly the five retained prototypes and no diagnostics using a temporary same-root core validation input. Source search finds no remaining compiled/ProtoScript calls to the retired entry points. Main-test/web/worker serial Release builds succeed, zero errors. No installed skills, local Codex data, provider calls, server installation or deployment changed.

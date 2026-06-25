# Coordinate Codex Incremental Edit And Validate

Goal
- Coordinate a bounded Codex editing loop where Codex makes one small code change batch, then the calling agent runs validation before deciding the next step.
- Use this workflow when Codex is the editing engine but the calling agent owns compile, parse, or runtime validation.
- Keep the parent agent responsible for research, tool use, environment inspection, and validation strategy so Codex only handles bounded edit work.

When To Use This Workflow
- ProtoScript authoring or repair where the Codex subagent cannot run the project compiler itself.
- DLL-backed skill creation where `.pts` changes must be validated incrementally.
- Any edit request where full end-to-end implementation is likely to drift without compile feedback.

Required Tool Contract
1. Resolve the correct working directory.
2. Open or reuse a Codex subagent for that working directory.
3. Send exactly one small, coherent edit batch.
4. Stop and inspect the Codex result.
5. Run the caller-owned validation tool.
6. If validation fails, send only the exact diagnostics needed for one targeted fix batch.
7. Repeat only while progress is concrete and bounded.

Batching Rules
- Keep each Codex batch intentionally small.
- For ProtoScript work, prefer this order:
  1. Create folders and skeleton files.
  2. Add include wiring.
  3. Add imports and action-root structure.
  4. Add one callable action.
  5. Fix one diagnostic class at a time.
- Do not ask Codex to finish the entire feature in one turn when validation is required between steps.
- Before each ProtoScript batch, run or anchor to `ToWriteProtoScriptCodeSkill` guidance.
- Before each ProtoScript batch, first identify an existing local pattern that already uses the needed ProtoScript feature or shape and anchor the edit to that pattern.

Codex Instruction Rules
- Tell Codex what single batch to perform now, not the whole roadmap.
- Require Codex to stop after the requested batch.
- For ProtoScript work, tell Codex that ProtoScript differs from C# in important ways and that it should reuse existing working project patterns instead of inventing syntax.
- For DLL-backed work, tell Codex to prefer facade-first C# changes so ProtoScript remains a thin pass-through layer.
- Require Codex to return:
  - files changed
  - concise change summary
  - the next validation step the caller should run
  - whether a follow-up Codex batch is expected if validation passes
- If the project root contains `AGENTS.md`, rely on that local guidance as authoritative.

Validation Handoff Rules
- The calling agent owns validation.
- The calling agent should also own non-code investigation and use its own typed tools before deciding what Codex should edit next.
- Do not claim compile or parse success unless the calling agent actually ran the validation tool and observed success.
- If validation fails:
  - pass only the exact diagnostics back to Codex
  - ask for one targeted fix
  - do not ask Codex to rewrite unrelated areas

ProtoScript Validation Procedure (Required)
- After every Codex batch touching ProtoScript-related files:
  1. Run the project validation action for the changed scope.
  2. If diagnostics indicate DLL/import/reference errors, run `ToTroubleshootProtoScriptDllCompilationSkill`.
  3. If diagnostics indicate runtime or tooling instability, run `ToTroubleshootBuffalyAgentRuntimeSkill`.
  4. If the batch touched skill DLLs, verify authoritative build output and project-root `lib` copies by hash/size/timestamp, update the project-root `lib` copy when needed, then use `ToResetProtoScriptEnvironment` only when runtime pickup requires it.
  5. Require zero compile diagnostics before sending the next Codex edit batch.
- Do not proceed to the next Codex edit batch until diagnostics are clean or rollback is executed.

Failure Routing Matrix
- A) Assembly/import/facade errors:
  - Route to `ToTroubleshootProtoScriptDllCompilationSkill`.
  - Verify file-based `reference` and `import` syntax in the changed `.pts` files.
  - Verify the project-root `lib` folder contains the primary DLL and supporting dependencies (for example `BasicUtilities.dll`, `System.Drawing.Common.dll`) and that they match authoritative build outputs by hash/size/timestamp.
- B) "Assembly with same name is already loaded":
  - Stop edits immediately.
  - Perform a full host recycle.
- C) Compatible method/signature mismatch:
  - Inspect the referenced method signature and call site.
  - Run one bounded Codex fix batch.
- D) Ambiguous/incompatible ProtoScript expressions:
  - Move fragile or complex logic into a C# helper/facade.
  - Keep ProtoScript wrappers thin and deterministic.
  - Recompile incrementally after each small change.

Rollback and Safety Rules
- Trigger rollback when any of the following occurs:
  - Two consecutive validation cycles without error reduction.
  - File corruption caused by replacement/escaping issues.
  - New errors appear in unrelated skills.
- Rollback action:
  - Resume only with smaller single-file edit batches.

Bounded Repair Policy
- Max 1 Codex edit batch per validation cycle.
- Max 3 repair cycles per problem class.
- Continue only when progress is concrete (fewer diagnostics or narrower error scope).
- If no progress after 2 cycles, switch to troubleshooting skill or rollback.

Output Contract
Return:
1. Current batch objective
2. Working directory used
3. Codex subagent used or created
4. Files changed in this batch
5. Validation command/tool the caller should run next
6. Whether the workflow should continue with another bounded batch


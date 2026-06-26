# Add DLL-Backed Capabilities (Router)

> Deprecated detailed execution prompt: use the two companion prompts for implementation details.
> This file is router/orchestrator-only.

Goal
- Route work to the correct phase prompt and enforce shared cross-phase guardrails.

Companion Prompts
- Create phase: `ToCreateDllBackedCapabilityFromScratchSkill`
	- Prompt: `Skills/BuffalySelfManagement/Prompts/CreateDllBackedCapabilityFromScratch.prompt.md`
- Install phase: `ToInstallExistingDllIntoProtoScriptSkill`
	- Prompt: `Skills/BuffalySelfManagement/Prompts/InstallExistingDllIntoProtoScript.prompt.md`

Phase Selection Logic
1. Use create phase when DLL/capability does not exist, is not test-complete, or still needs contract/facade stabilization.
2. Use install phase only when tested DLLs already exist and the API is wrapper-friendly for thin ProtoScript pass-through.
3. If install phase discovers API instability, missing validation, or non-wrapper-friendly shape, stop and route back to create phase.

Ordering Rule
- If DLL does not already exist and pass tests, create phase must run first.
- ProtoScript installation starts only after create-phase handoff is complete.

Shared Guardrails (Common Across Both Phases)
- Read `AGENTS.md` and `ProtoScript.Minimum.md` before editing `.pts`.
- Use `ToWriteProtoScriptCodeSkill` before editing `.pts`.
- Use `ToCoordinateCodexIncrementalEditAndValidateSkill`; keep small batches and let the calling agent validate after each batch.
- Typed-tool-first installation rule:
	- Use `ToImportDllIntoSkill` for DLL placement plus reference/import insertion.
	- Use `ToUpsertPromptActionArtifacts` for prompt-action prototype plus prompt markdown registration.
- Use project-relative paths only (`Skills/<SkillName>/...`, `Project.pts`); no absolute machine paths.
- Require DLL wiring through project-root `lib` and centralized root `Imports.pts`.
- Do not reference `bin/*`, solution output folders, or machine-absolute DLL paths in `.pts`.
- Keep ProtoScript thin and facade-first; move complex validation/shaping/auth orchestration into C#.
- For cross-action complex values, preserve native typed flow (`Prototype`/`NativeValuePrototype`); do not stringify mid-flow.
- Do not leak secrets in action signatures, outputs, or docs.

Orchestration and Tooling References
- `ToCreateDllBackedCapabilityFromScratchSkill`
- `ToInstallExistingDllIntoProtoScriptSkill`
- `ToCoordinateCodexIncrementalEditAndValidateSkill`
- `ToWriteProtoScriptCodeSkill`

DLL Refresh / Compile Sequence
1. `ToUpdateDllsForSolution`
2. `ToResetProtoScriptEnvironment`

Troubleshooting Ownership
- Runtime/tool-execution issues: `ToTroubleshootBuffalyAgentRuntimeSkill`
- ProtoScript compile/import/DLL binding issues: `ToTroubleshootProtoScriptDllCompilationSkill`

Router Output Contract
- State selected phase (`create` or `install`) and why.
- State immediate next action to invoke.
- If rerouting, state failure gate that triggered reroute.

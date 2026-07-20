# Install Existing DLL Into ProtoScript

Goal
- Integrate an existing, already-tested DLL capability into OpsAgent as a skill bundle.

Hard Gate
- If installation uncovers API instability, missing C# validation, or a non-wrapper-friendly API shape, stop this phase.
- Route back to `ToCreateDllBackedCapabilityFromScratchSkill` to fix the C# contract/facade first.

Scope
- This workflow covers only OpsAgent/ProtoScript installation of an existing DLL capability.
- Capability creation belongs to `ToCreateDllBackedCapabilityFromScratchSkill`.

Prerequisites (Hard Gate)
- The C# capability already exists.
- Its tests already pass.
- Public API shape is stable enough for thin ProtoScript wrappers.

Required Assumptions
- Read and follow `AGENTS.md`.
- Read `ProtoScript.Minimum.md` before editing `.pts`.
- Use `ToWriteProtoScriptCodeSkill` before writing/editing ProtoScript.

Skill Bundle Creation/Extension
- Use `Skills/<SkillName>/` with:
	- `SKILL.md`
	- `index.pts`
- Extend an existing skill only when ownership is clearly aligned; otherwise create a new skill folder.

DLL Copy Rules
- For project-owned or skill-owned DLLs, copy primary DLL and required dependencies into the owning project/skill `lib/` folder and keep `.pts` references project-root relative (`reference "lib/<Assembly>.dll" ...`) or skill-relative when that is the established local pattern.
- For installed web-module-owned primary/facade assemblies, do not copy the assembly into OpsAgent project `lib/`; use a name-based reference such as `reference Buffaly.Agent.Wiki Buffaly.Agent.Wiki;` so runtime resolution uses `<install-root>/lib/web-modules/<ModuleName>`.
- Do not duplicate web-module-owned assemblies into project `lib` merely to satisfy ProtoScript references.
- Do not reference `bin/Debug`, `bin/Release`, solution output folders, or absolute machine paths in `.pts`.

Project-root `lib` Ownership
- Copy the primary DLL and full runtime dependency closure into project-root `lib`.
- Keep the authoritative build/deploy output path recorded in task notes or nearby documentation when it is not obvious.
- Include the full runtime dependency closure, not only the main facade DLL.
- Treat direct hash/size/timestamp equality between authoritative output and project-root `lib` as the source of truth for DLL freshness; do not rely on a manifest-driven healing workflow.
- Exception: web-module-owned primary/facade assemblies are owned by their installed web-module payload under `<install-root>/lib/web-modules/<ModuleName>` and should be validated with the duplicate-DLL diagnostics rather than copied into project-root `lib`.

ProtoScript Reference/Import Rules
- Add only required `reference` entries in root `Imports.pts` for project-root `lib` DLLs.
- Add only required `import` entries in root `Imports.pts` for facade/helper types used by wrappers.
- Import only types needed by the wrapper actions.
- Prefer importing facade/helper types over raw complex clients.
- Prefer typed installation routing first:
	1. `ToImportDllIntoSkill(...)`
	2. `ToResetProtoScriptEnvironment` only when needed for current-session pickup.
- Direct/manual `reference`/`import` edits are fallback-only when `ToImportDllIntoSkill` cannot express the required change.

Thin Wrapper Action Rules
- Follow local pattern:
	- `prototype <SkillName>SkillAction : OpsAction`
	- `prototype <SkillName>Skill : SkillEntity, CoreEntity`
	- `ActionRoot = <SkillName>SkillAction`
	- callable `prototype To... : <SkillName>SkillAction`
- Keep wrappers thin: validate required inputs, call one C# facade method, return deterministic output.
- Avoid business validation/coalescing, complex auth setup, or response graph shaping in `.pts`.
- For complex chained values, preserve native typed flow via `Prototype`/`NativeValuePrototype`; do not stringify mid-flow.

`Project.pts` Include Rules
- Register skill with a project-relative include:
	- `include "Skills/<SkillName>/index.pts";`
- Do not use machine-specific path assumptions.

`SKILL.md` Documentation Rules
- Document each action, arguments, and expected outputs.
- Document required configuration keys and operational prerequisites.
- Never include secret values.

ProtoScript Constraints + Secrets/Auth
- Keep ProtoScript as glue code only.
- Do not use `object` locals, nullable-placeholder flow, or chained boolean expressions (`a && b`).
- Prefer direct deterministic pass-through to C# facades.
- Secrets/auth material must come from secure server-side configuration, never tool arguments.

Incremental Delivery + Orchestration
- Use direct file-editing and validation tools. Use Codex only if the user explicitly asks for Codex.
- Make small batches (skill skeleton, include, references/imports, one action at a time).
- Stop after each batch so the calling agent can validate.
- Do not claim compile success without direct validation evidence.
- Preferred per-batch validation sequence:
	1. `ToImportDllIntoSkill(...)` for DLL copy + reference/import insertion.
	2. `ToResetProtoScriptEnvironment` only when runtime refresh is required after compile.

DLL Freshness / Copy / Reload / Compile
- Use:
	- `ToUpdateDllsForSolution`
	- `ToResetProtoScriptEnvironment`
- For issues, use:
	- `ToTroubleshootBuffalyAgentRuntimeSkill`
	- `ToTroubleshootProtoScriptDllCompilationSkill`
- Keep `.pts` references stable (`lib/...`) via root `Imports.pts`; copy DLL state into project-root `lib` instead of pointing ProtoScript to build output folders.

Companion Workflow Reference
- Top-level router: `ToAddDllBackedCapabilitiesSkill`.
- If the DLL/capability does not exist yet, first run:
	- `ToCreateDllBackedCapabilityFromScratchSkill`
	- Prompt: `Skills/BuffalySelfManagement/Prompts/CreateDllBackedCapabilityFromScratch.prompt.md`

Output Contract
- Provide:
	- Skill bundle file changes (`SKILL.md`, `index.pts`).
	- Project-root `Imports.pts` and `lib` artifact updates.
	- `Project.pts` include update (if needed).
	- Wrapper actions added/updated.
	- Explicit next validation/copy/reload/compile steps for the caller.

Completion Criteria
- Existing tested DLL is integrated via project-root `lib`.
- Root `Imports.pts` contains required `reference`/`import` lines.
- Project-root `lib` contains the primary DLL and dependency closure, with hash/size/timestamp checked against authoritative outputs.
- ProtoScript wrappers follow thin pass-through skill pattern.
- `Project.pts` include is correct.
- Documentation is updated without leaking secrets.

Anti-Patterns
- Creating net-new C# capability in this installation workflow.
- Skipping test prerequisite checks.
- Putting complex business/auth/JSON reshaping logic in `.pts`.
- Referencing DLLs from absolute paths or project output folders.
- Delivering one giant unvalidated change instead of incremental batches.

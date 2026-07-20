# Create DLL-Backed Capability From Scratch

Goal
- Create a reusable C# capability with a stable public API and passing tests before any ProtoScript integration.

Hard Gate
- This phase must NOT perform ProtoScript installation steps.
- If installation work is requested in this phase, route directly to `ToInstallExistingDllIntoProtoScriptSkill`.

Scope
- This workflow covers only C# capability creation.
- Use `ToInstallExistingDllIntoProtoScriptSkill` to install the DLL after completion.

Decision: When To Use DLL-Backed C#
- Use this workflow when capability logic is non-trivial, likely to evolve, or requires robust validation/error handling.
- Use this workflow when ProtoScript wrappers would otherwise contain business logic, auth orchestration, or complex response shaping.
- Keep ProtoScript thin and facade-first; move complexity into C#.

Location Selection Rules
- First, check whether an existing class/library already owns the domain and should be extended.
- If an existing library is authoritative, add capability there.
- If no suitable library exists, create a focused new class or small library with clear ownership.
- Never place this capability in the Buffaly web solution.
- Do not hard-code machine-specific paths; use repository-relative references in documentation/instructions.

C# API Architecture Rules
- Design small, focused classes with clear responsibility.
- Expose functionality primarily through simple public static methods, as the calling environment will not do complex setup or DI.
- Expose only stable public methods required by callers; keep helpers/internal details non-public.
- Keep validation and error handling self-contained in the C# boundary.
- Return stable, deterministic shapes suitable for thin ProtoScript pass-through wrappers.
- Avoid contract churn once the API is exposed for skill integration.
- If the API shape is not wrapper-friendly for thin ProtoScript wrappers, add or adjust a C# facade before handoff.

Testing Is Mandatory Before Integration
- Add/extend tests for happy path and known failure modes before ProtoScript work.
- Ensure tests pass before handoff.
- All methods need to have real test cases before integration. Once installed in the agent testing is more difficult.
- Treat test passing as a hard gate for installation into ProtoScript.

Return Types / Parameter Types
- Use native/simple types (`string`, `int`, `bool`) for normal action parameters/returns.
- You can use JsonObject / JsonValue / JsonArray from BasicUtilities.
- For **complex values that must flow between actions**, return the object natively, it will be boxed and unboxed via a **`NativeValuePrototype`**.
- That `NativeValuePrototype` path is how boxing/unboxing is preserved across action boundaries.
- **Do not stringify mid-flow** (e.g., `"Action (11)"`) because that breaks typed chaining.

See
- `ToCreateProtoScriptActionSkill` for examples of what ProtoScript expects.

Handoff To Companion Prompt
- After capability code and tests are complete, use:
	- `ToInstallExistingDllIntoProtoScriptSkill`
	- Prompt: `Skills/BuffalySelfManagement/Prompts/InstallExistingDllIntoProtoScript.prompt.md`
- The installation workflow assumes DLLs already exist and are validated.

Related Actions/Prompts
- `ToAddDllBackedCapabilitiesSkill` (top-level router that selects create vs install phase).
- `ToWriteProtoScriptCodeSkill` (used later during ProtoScript installation, not for C# API design).
- Direct file-editing tools plus caller-owned validation for incremental batches.
- `ToTroubleshootBuffalyAgentRuntimeSkill` (runtime troubleshooting after integration).
- `ToTroubleshootProtoScriptDllCompilationSkill` (compile/import troubleshooting).
- Companion action: `ToInstallExistingDllIntoProtoScriptSkill`.

Output Contract
- Provide:
	- C# file changes that implement the capability.
	- Public API surface summary (method signatures/return shape expectations).
	- Test changes and pass status.
	- Dependency closure handoff list for installer: primary DLL plus required transitive runtime dependencies.
	- Handoff note instructing the installer workflow to integrate the tested DLL.

Completion Criteria
- Capability is implemented in the correct existing/new C# location.
- Public API is stable, minimal, and explicit.
- Validation/error handling is contained within C#.
- Required tests exist and pass.
- Primary DLL and required transitive dependencies are explicitly prepared for installer handoff.
- Work explicitly hands off to `ToInstallExistingDllIntoProtoScriptSkill`.

Anti-Patterns
- Installing into ProtoScript before C# tests pass.
- Embedding business logic in ProtoScript to compensate for weak C# API shape.
- Exposing unstable/internal helper methods as public integration surface.
- Adding fallback-heavy compatibility layers instead of fixing the authoritative C# contract.
- Putting new capability code in the Buffaly web solution.

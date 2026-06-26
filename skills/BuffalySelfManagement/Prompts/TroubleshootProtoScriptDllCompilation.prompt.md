# Troubleshoot ProtoScript DLL Compilation

Quick Checklist (run first)
1. Confirm the ProtoScript wrapper intent and signature match the current C# source intent and signature.
2. Confirm ProtoScript `reference` and `import` point to the exact DLL built from that source.
3. Confirm the referenced DLL exports the same methods/signatures the ProtoScript wrapper calls.
4. Confirm all runtime-relevant DLL copies (authoritative build output and project-root `lib`) are hash-equal by comparing hashes, sizes, and timestamps.
5. Only after 1-4 pass, perform one runtime reset/reload, then re-run compile plus a live smoke test.

Goal
- Resolve ProtoScript compile/import failures where methods/types are not found from referenced DLLs.
- Resolve runtime DLL binding/load failures for DLL-backed skills without introducing host-level web/worker reference changes as a first-line fix.

Hard Rule
- Do **not** treat adding new references or package dependencies to the web process, worker process, or host projects as the default solution.
- Do **not** patch `buffaly.agent.web`, `buffaly.agent.worker`, or other host processes unless you are explicitly undoing a previous bad change or you have already proven the skill-level/runtime-artifact path is correct and the host is still the only remaining cause.
- Prefer fixing the problem at the wrapper signature, referenced DLL, project-root `lib`, dependency placement, and runtime artifact placement level first.

Required Mental Model
- There are often multiple copies of the same DLL:
  - authoritative source build output (prefer `Deploy` for plugin/skill DLLs unless the workflow proves otherwise)
  - shared repository lib (for example `C:\dev\buffaly-ai\buffaly-development\lib`)
  - runtime-specific subfolders such as `runtimes/win/lib/net7.0`
  - project-root `lib` used by ProtoScript `reference "lib/..."` resolution via root `Imports.pts`
  - installed web-module payload folders under `<install-root>/lib/web-modules/<ModuleName>` for web-module-owned primary/facade assemblies referenced by simple assembly name
- A successful build alone does **not** guarantee runtime success if the project-root `lib` copy referenced by ProtoScript is stale or if the runtime is still loading an older DLL.

Checklist
1. Confirm the exact failing file/line, symbol, and exception shape from compile diagnostics or live invocation.
   - Record whether the failure is compile-time or runtime.
   - Distinguish these classes early:
     - `TypeLoadException` / missing type or method => likely wrong/incompatible DLL version.
     - `FileNotFoundException` / assembly missing => likely resolution path, copy path, or dependency placement issue.
     - namespace/type not found at compile => likely wrong `reference` or `import` line, stale DLL, or wrong target namespace.

2. Resolve the **actual ProtoScript reference base path** before changing anything.
    - For every `reference "lib/..."` or `reference "runtimes/..."` in the `.pts` file, identify the exact filesystem root used at runtime.
   - For every name-based reference to a web-module-owned primary/facade assembly, verify the owning installed web-module folder under `<install-root>/lib/web-modules/<ModuleName>` and check for stale same-name shadows in project `lib`.
   - Use `C:\dev\buffaly-ai\scripts\BuffalyAssemblyLayoutDiagnostics.ps1 -DiagnosticsInstallRoot <install-root>` when duplicate/shadowing is suspected.
    - Verify the exact project-root `lib` path used by that project, not just shared repo `lib`.
   - If `Common.pts` references `lib/*.dll`, confirm the required DLLs exist in the project-root `lib` that ProtoScript resolves against.

3. Establish one **authoritative source of truth** for each DLL before copying or recycling.
   - Prefer solution/project `Deploy` outputs for DLL-backed skill artifacts unless there is a proven reason to use another source.
   - Avoid using an intermediate shared-lib cache as the only source for skill-specific DLLs when a more authoritative project `Deploy` path exists.
   - Write down the chosen authoritative source for:
     - main skill DLL
     - companion Google/API/third-party DLLs
     - runtime-specific DLLs (for example `System.Management.dll` under runtimes)

4. Verify runtime-local, shared-lib, and project-root DLLs are present and fresh.
   - Check size/timestamp first.
   - Then check **hash equality** across all runtime-relevant copies.
   - Do not stop at version number only; same version can still mean different binaries.

5. Confirm reference/import lines in target `.pts` file point to the intended DLL and namespace.
   - Validate that the referenced DLL actually contains the namespace/type/method being imported.
   - Confirm there are no stale or accidental compatibility references that should not be there.

6. Confirm the deployed DLL exports the expected method or type.
   - Use reflection against the exact project-root `lib` DLL referenced by the `.pts` file, not a different build-output copy.
   - Confirm namespace, type name, method name, arity, parameter types, async return shape, static/instance expectations, and cancellation-token/default-parameter shape.
   - Treat a reflection mismatch as a stale DLL, wrong DLL, wrong reference, or wrapper-signature problem until proven otherwise.

7. Safely converge the project-root DLL copy.
   - Compare the authoritative build output and the project-root `lib` copy by hash, size, and timestamp.
   - If the project-root `lib` copy is stale and no process lock prevents it, copy the authoritative DLL directly to the project-root `lib` path used by the `.pts` reference.
   - If the copy is locked, recycle only the relevant app pool or reload through an approved runtime path, then retry the copy.
   - Re-check hashes after copying, not just before.

8. Recycle/reload only after file-state convergence.
   - Recycle the relevant app pool, reload the runtime, or reset the ProtoScript environment through an approved path only after the referenced DLL and dependencies are converged.
   - Do not use reload/recycle as a substitute for proving the files are correct.

9. If still failing, inspect method/type signatures in the compiled DLL versus ProtoScript call signature.
   - Validate static/instance expectations, namespace spelling, method arity, async return shape, and renamed facade classes.

10. Use isolated testing techniques before blaming the host.
   - Copy the skill DLL set to an isolated temp harness folder.
   - Load the DLL set in a minimal ad hoc console/harness and test the suspected code path directly.
   - Use this to determine whether the DLL set is self-consistent outside the OpsAgent host.
   - Useful techniques include:
     - assembly reference inspection
     - hash comparison across candidate copies
     - isolated facade invocation in a temp harness
     - runtime folder colocation tests
     - binary/reference scans for suspicious dependency identities

11. Only after the isolated harness works should you treat the issue as a host/runtime load-context problem.
    - At that point, confirm no stale worker/runtime assembly load is masking updates.
    - Perform reload lifecycle only after proving file-state convergence.
    - Do not jump to host/web/worker dependency edits before proving the skill artifact chain is correct.

12. Re-run compile and a live action invocation smoke test.
    - Smoke test the actual skill action that failed.
    - If applicable, also test the exact account/config/runtime path used in production-like execution.

13. Persistence check.
    - Make sure the final fix survives a fresh `update_dlls` run and environment reload.
    - If the fix depends on mirrored project-root `lib` files, ensure the update pipeline performs that mirror deterministically.

Troubleshooting Tips
- If runtime errors mention a DLL that appears present, suspect the **wrong probe path** before assuming the file is wrong.
- If hashes differ between `Deploy`, shared `lib`, and project-root `lib`, fix convergence first.
- If isolated harness succeeds but OpsAgent runtime fails, suspect load-context or runtime path placement rather than the DLL bits themselves.
- If the build output looks correct but runtime still fails, inspect whether the project-root `lib` copy differs or a stale runtime has not been recycled/reloaded.
- Prefer proving each hypothesis with one narrow test instead of making broad host changes.

Output
- Clear root cause classification:
  - stale DLL
  - wrong namespace/import
  - signature mismatch
  - missing dependency
  - wrong probe path / missing project-root lib mirror
  - project-root `lib` drift from authoritative build output
  - worker/runtime cache issue
  - true host load-context issue after skill artifact chain was proven correct
- Applied fix steps.
- Final compile and runtime verification status.
- Confirmation that the fix survives copy/update, reload, compile, and functional smoke validation.

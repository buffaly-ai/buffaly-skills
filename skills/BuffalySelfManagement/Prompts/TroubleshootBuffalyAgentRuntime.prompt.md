# Troubleshoot Buffaly Agent Runtime

Goal
- Refer to this guide when troubleshooting. When we can't get something to work 

First Rule: Start In The Authoritative Code
- The buffaly agent codebase
	- `c:/dev/Buffaly.Development/Buffaly.Agent.Tools`
	- `c:/dev/Buffaly.Development/Buffaly.Agent.Web`
- You can read that code to understand existing functionality, understand tools, and look for bugs in your implementation.
- Use direct inspection, typed tools, logs, and focused searches for code deep dives. Use Codex only if the user explicitly asks for Codex. 

Other Tips
- Look for more tools. You have lots of tools. You do additional searches or even open the protoscript files in your project directory to find more options
- You can craft new ProtoScript (primarily as glue code) and utilize it. 
- You can write new C# code and load it in. See the skill [AdDllBackedCapabilities.prompt.md]. 
- You can access and run powershell as a last resort, but prefer to use or fix tools written in ProtoScript or C#. 

Troubleshooting Scale (Which Skill/Action To Use)
- Runtime symptoms (tool execution failures, unexpected runtime behavior): start with this skill first.
- DLL compile/import symptoms (for example `Assembly not referenced`, missing facade identifier): route to `ToTroubleshootProtoScriptDllCompilationSkill`.
- Dependency freshness issues (stale/copied DLL mismatch): run `ToUpdateDllsForSolution`.

DLL Troubleshooting Checklist
- Identify the authoritative build/deploy output for the DLL and the exact project-root `lib` copy referenced by ProtoScript.
- If the DLL is an installed web-module-owned primary/facade assembly, treat `<install-root>/lib/web-modules/<ModuleName>` as the authoritative installed owner and check for stale `OpsAgent/lib` shadows instead of copying it into project-root `lib`.
- Use `C:\dev\buffaly-ai\scripts\BuffalyAssemblyLayoutDiagnostics.ps1 -DiagnosticsInstallRoot <install-root>` to list duplicate DLLs, mismatched hashes/versions, web-module-owned cleanup candidates, and explicit `lib/...` reference blockers.
- If supporting dependency DLLs are missing (for example `BasicUtilities`, `System.Drawing.Common`), copy them into project-root `lib` from authoritative outputs.
- Compare DLL hash, size, and timestamp across source output and project-root `lib` copy.
- If stale, safely copy the fresh DLL into project-root `lib`, recycling only the relevant app pool or reloading through an approved runtime path when a lock prevents copying.
- Keep ProtoScript references file-based via root `Imports.pts` only for project-owned/shared DLLs. Use name-based references for installed web-module-owned primary/facade assemblies so stale `OpsAgent/lib` copies cannot shadow the web-module owner.
- After swapping DLLs, do a full host recycle before reload to avoid `Assembly with same name is already loaded`.
- Run reload and confirm the expected facade identifiers resolve.

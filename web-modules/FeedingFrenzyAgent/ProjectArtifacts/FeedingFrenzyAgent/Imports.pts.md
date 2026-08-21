# Imports.pts Change History

## Import JsonUtil For Runtime Selection Tool (2026-05-29)
- Added the `JsonUtil` import so ProtoScript tools can serialize typed C# service contract results directly when needed.
- Design decision: keep service-return payloads typed in C# and perform only boundary serialization in ProtoScript.

## Fix JsonUtil Import Newline (2026-05-29)
- Replaced accidental literal backtick r/backtick n text with a real newline between the JsonValue and JsonUtil import declarations.
- Design decision: keep import declarations one-per-line so the deployed project compiler preserves all referenced assemblies and imported symbols.

## Move Wiki To Name-Based Web-Module Reference (2026-05-31)
- Changed `Buffaly.Agent.Wiki` from `reference "lib/Buffaly.Agent.Wiki.dll" ...` to a name-based `reference Buffaly.Agent.Wiki ...`.
- Design decision: Wiki is an installed web-module-owned assembly, so ProtoScript should resolve it from the authoritative `lib/web-modules` install root instead of allowing stale `OpsAgent/lib` copies to shadow it.

## Remove Obsolete Root Google API References (2026-05-31)
- Removed root `Google.Apis*` `lib/...` reference declarations from `Imports.pts`.
- Design decision: OpsAgent ProtoScript no longer directly imports Google API types; GoogleWorkspace actions call the `Buffaly.GoogleWorkspace` facade, whose dependencies are owned by the installed GoogleWorkspace web module.

## Add Medical CSV Demo Helper Import (2026-06-04)
- Imported MedicalCsvInMemoryDemoFunctions from Buffaly.Agent.Host so the Basic CSV Download + Export walkthrough can keep ProtoScript thin while deterministic C# helper methods own CSV parsing, filtering, summary, and export.

## System.Data DataTable Import (2026-06-04)
- Imported `System.Data.DataTable` so the Basic CSV walkthrough demo can expose native DataTable reference methods in ProtoScript.

## Remove Host Medical CSV Demo Import (2026-06-09)
- Removed the global import for Buffaly.Agent.Host.MedicalCsvInMemoryDemoFunctions after moving the Basic CSV walkthrough to shared CsvDataSource/TabularData helpers.

## Remove Buffaly.Agents Assembly Reference (2026-06-13)
- Removed the unused `Buffaly.Agents` assembly reference from OpsAgent imports after confirming no active `.pts` code imports or references its types.
- Design decision: OpsAgent ProtoScript should not keep the legacy DLL alive when the remaining runtime contracts have moved to owned Buffaly projects.

## Centralize Shared Skill Imports (2026-06-15)
- Added project-level `Buffaly.Agent.Tools.TabularData` reference so skills can import shared tabular helpers without declaring skill-local DLL references.
- Added project-level `RuntimeInstallRootFeature` import from `Buffaly.Agent.Runtime.Abstractions` so Wiki/Help/ErrorLogDiagnosis wrappers use one authoritative install-root helper binding.

## Move Browser And Codex To Name-Based References (2026-06-18)
- Changed `Buffaly.Agent.Tools.Browser` and `Buffaly.Agent.Tools.Codex` from explicit `lib/*.dll` references to name-based references.
- Design decision: these assemblies are included elsewhere in the staging install and should resolve through the runtime assembly resolver instead of requiring duplicate `content/projects/OpsAgent/lib` copies.

## Move TebraWeb To Name-Based Reference (2026-06-24)
- Changed `Buffaly.Agent.Tools.TebraWeb` from an explicit `lib/Buffaly.Agent.Tools.TebraWeb.dll` reference to a name-based reference.
- Design decision: TebraWeb is deployed with the app/runtime payload like BrowserSession dependencies, so ProtoScript should resolve it through the runtime assembly resolver instead of relying on a fragile `content/projects/OpsAgent/lib` copy.

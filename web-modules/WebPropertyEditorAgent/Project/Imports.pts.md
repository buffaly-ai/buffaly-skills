## Resolve Core Assemblies From Installed Runtime (2026-07-16)
- Changed the Buffaly host, runtime abstractions, ProtoScript runtime, and ProtoScript authoring references from project-local `lib` paths to installed-runtime assembly references.
- Design decision: extension projects must use the host's core assembly identities rather than package shadow copies so injected runtime objects satisfy their declared types.

## Minimize WebProperty Editor Imports (2026-07-04)
- Replaced inherited broad FeedingFrenzyAgent imports with minimal references required by the WebProperty editor service.
- Removed Codex, FileSystem, GitHub, Process, JsonWs, and other broad tool imports from the constrained project import surface.
- Added `SessionObject` and `WebPropertyEditorFacade` imports for service binding resolution through `_sessionObject`.

## Move Facade To Project-Owned DLL (2026-07-04)
- Removed the `Buffaly.Agent.Host` reference and now import `WebPropertyEditorFacade` from the project-owned `lib/WebPropertyEditorAgent.Tools.dll`.
- Design decision: WebProperty-specific editor behavior must live outside general Buffaly host/core and be exposed through this ProtoScript project.

## Reference Top-Level Feeding Frenzy Tool Project DLL (2026-07-04)
- Updated the DLL reference/import to `lib/FeedingFrenzy.WebPropertyEditorAgent.Tools.dll` after moving the C# facade into a normal top-level Feeding Frenzy project.

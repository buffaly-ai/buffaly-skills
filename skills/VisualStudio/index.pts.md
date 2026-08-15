# Skills/VisualStudio/index.pts

Purpose
- Registers the reusable Visual Studio skill action root and includes the generic Visual Studio action, solution, generator, and prompt files.

Includes
- `Actions.pts`
- `VisualStudioOntologyGenerator.pts`
- `PromptActions.pts`

## Register DotNet action prototypes in lazy module manifest (2026-08-15)
- Added `ToBuildDotNetProject`, `ToRunDotNetTests`, and `ToPublishDotNetProject` to `index.pts.lazy.json`.
- Live staging acceptance showed that the actions compiled and were installed but could not be discovered or invoked because the lazy loader had no prototype-to-module mapping.

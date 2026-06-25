# Skills/VisualStudio/VisualStudioOntologyGenerator.pts

Purpose
- Exposes thin Visual Studio ontology-generator wrappers backed by `Buffaly.Development.Common.VisualStudioOntologyGenerator`.
- Keeps solution-to-ontology business logic in C# while making the generator callable from OpsAgent.

Current wrappers
- `VisualStudioOntologyGenerator_SerializeSolutionPrototype`
- `CSharpClassExposureGenerator_GenerateOrUpdateClassExposureFromCSharp`
- `SmartPatch_ApplyToProjectFile`

Notes
- The wrapper preserves the native C# string return.
- When `destinationFilePath` is empty, the C# method returns generated prototype text only.
- When `destinationFilePath` is provided, the C# method performs the file upsert and returns a textual summary plus generated block.

## 2026-04-17
- `SmartPatch_ApplyToProjectFile` now forwards through the core `ToApplySmartPatchToProjectFile` action instead of binding `Buffaly.Development.Common.SmartPatch.ApplyToRelativePath(...)` directly.
- Design: keep the Visual Studio skill wrapper thin while using the stable ProtoScript compile path through the core wrapper.



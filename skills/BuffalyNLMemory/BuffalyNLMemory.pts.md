# BuffalyNLMemory.pts

Normal Buffaly-agent temporary memory skill surface.

This file intentionally does not define a separate memory agent, `MemoryBase`, `MemoryEntity`, `MemoryFact`, or `MemoryVerb`. It exposes the runtime prototype validation/interpretation helpers to the normal Buffaly agent, including dump/search actions for the active runtime memory store, and adds `ToRememberSomethingTemporarilySkill` as a prompt skill that teaches the agent how to use existing Buffaly ontology/search tools plus raw ProtoScript runtime insertion. `ToRememberSomethingTemporarilySkill` is intentionally also a `CoreAction` so the default Buffaly agent tool surface can find it and use temporary session memory liberally.

The C# dependency is referenced by assembly name (`reference Buffaly.NLMemory Buffaly.NLMemory;`). The install script copies the DLL/dependency closure into the OpsAgent project `lib` resolver root so the ProtoScript runtime can bind the assembly by name. The action `Execute` methods call `BuffalyNlMemoryRuntimeTools` directly instead of routing through one-line ProtoScript helper functions, and they return native `string` so the Buffaly tool boundary materializes the result text.

`ToInterpretRuntimePrototypeDefinition` both interprets the prototype and registers it in the active runtime memory store. `ToDumpRuntimeMemories` returns that store, and `ToSearchRuntimeMemories` searches it with `TemporaryPrototypeCategorization.IsCategorized` using a filter prototype.

`ToInterpretRuntimePrototypeDefinition` passes `_opsAgent` to the C# tool so interpreted memory definitions are also written to the current session artifacts folder under `artifacts/nl-memory/`.

The wrapper calls the uniquely named CLR method `InterpretAndPersistRuntimePrototypeDefinition`. Imported CLR methods used by ProtoScript must not share public names: the reflection binder resolves by name and throws `AmbiguousMatchException` for overloads before considering the parameter signature.

`BuffalyNLMemoryRuntimeMemoryService` is a normal OpsAgent `Service` with `AutoInitialize = true`, so the existing ProtoScript runtime service-initialization path restores `artifacts/nl-memory/*.pts` into the new runtime whenever the session runtime is created or reset. `ToRestoreRuntimeMemoriesFromSessionArtifacts` exposes the same restore operation for explicit diagnostics.



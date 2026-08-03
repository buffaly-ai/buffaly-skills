# BuffalyNLMemory/index.pts Change History

## Initial Creation (2026-07-04)
- Added the Buffaly NL Memory skill include root.
- Design Decision: keep the memory schema and StoreFact/RunQuery surface inside the active OpsAgent skills tree instead of a top-level ProtoScript folder.

## 2026-08-03

- Removed the lazy-module sidecar so normal source-session runtimes compile BuffalyNLMemoryRuntimeMemoryService during initial project startup.
- Design decision: session-local entity and action prototypes must be restored before ToSearchCandidateEntities or ToSearchCandidateActions filters semantic candidates against the active runtime. Authoring actions may remain dynamically exposed by the normal tool registrar, but the state restore service itself cannot be lazy.

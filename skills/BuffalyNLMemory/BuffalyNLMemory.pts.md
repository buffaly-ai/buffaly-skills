# BuffalyNLMemory.pts

Defines only the runtime prototype-memory service/actions and temporary-memory prompt action. Runtime initialization restores marker-free complete definitions from `artifacts/nl-memory/SessionMemory.pts`. Persisted writes use shared transactional ProtoScript authoring before live runtime mutation. Historical catch-up actions are intentionally absent.

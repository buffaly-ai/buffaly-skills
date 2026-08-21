# PromptActionTools.pts Change Notes

## 2026-04-12
- Strengthened `ToInsertOrUpdatePrototypeDefinition` with explicit ProtoScript syntax guidance, memory-workflow routing, and a valid prototype example.
- Design: keep raw prototype upsert as a low-level typed tool while steering memory/procedure tasks toward the higher-level remembering workflows first.

## 2026-06-03
- Updated `ToUpsertPromptActionArtifacts` description to document the PromptAction metadata validation contract.
- Design: callers must provide a PromptAction with matching `PromptPath` and at least one semantic or legacy infinitive phrase; legacy `InfinitivePhrase` and `EntityName` assignments are canonicalized by the C# authoring service.

## 2026-06-18
- Changed `ToSearchTheWebWithAnLLM` to accept only `question` and route model selection through `LLMs.ExecuteWebSearch(question)`.
- Design: the generic ProtoScript web-search helper should not expose model-name selection to agents; the LLM facade owns the fixed model policy.

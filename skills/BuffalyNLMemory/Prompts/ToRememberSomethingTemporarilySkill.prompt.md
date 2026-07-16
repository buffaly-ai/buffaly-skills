# Remember Something Temporarily

Use this workflow when the user asks the normal Buffaly agent to remember an entity, fact, object relationship, or otherwise useful information for this session so it can be searched later.

Temporary memory is a session-local temporary ontology. It is not freeform text storage. Center each memory on an object or an object relationship, use existing Buffaly ontology roots when possible, and store the result as normal ontology-compatible ProtoScript prototypes interpreted into the current runtime and registered in the active runtime memory store.

Use this method liberally for information that will help within the current session. If the user asks to remember something permanently, across sessions, or as a durable user/workspace fact, do not use this temporary-memory workflow; use the permanent ontology-memory workflow instead: `ToRememberOntologyObjectSkill`.

## Store / remember workflow

Input: one or more natural-language informative statements, fragments, or phrases that should become session-scoped temporary ontology.

For each item:

1. Identify the likely entity being discussed and the asserted property, relationship, note, or constraint.
2. Use existing Buffaly ontology tools directly:
   - `ToSearchCandidateEntities` for entity/root candidates.
   - `ToGetPrototypeDetails` to inspect existing candidates and schema.
   - `ToListPrototypeFirstLevelDescendants` when root exploration is needed.
3. Prefer updating an existing entity when a close match exists.
4. If a field such as `DependsOn`, `RootDirectory`, `ValidationTool`, or `Owner` is needed and is appropriate for the prototype, add it in the generated prototype definition. Prototypes may add fields as needed.
5. Use `Notes` for freeform constraints or when a structured field is not worth adding yet.
6. Generate exactly one raw ProtoScript prototype definition for the entity being created or updated. Do not output JSON. Do not wrap it in markdown fences when passing to tools.
	- Do not add `[SemanticEntity("...")]` for temporary session memories. The existing `SemanticEntity` annotation writes to the persistent/global semantic database, not the session-local temporary memory store.
	- Until NLMemory has its own session-scoped natural-language binding mechanism, preserve likely lookup phrases in session-local fields such as `EntityName`, `Aliases`, `Description`, or `Notes` on the temporary prototype.
	- Use the exact `prototype Name : ExistingBase { ... }` syntax.
   - Use braces and semicolons.
   - Use `@"..."` verbatim strings for Windows paths and longer notes.
   - Put all needed facts in existing string fields such as `Description`, or in new string fields declared by assignment when the runtime accepts them.
   - Do not use `Name is Base`, YAML-like blocks, JSON, markdown, or omitted semicolons.
7. Call `ToValidateRuntimePrototypeDefinition` with the raw prototype definition.
8. If valid, call `ToInterpretRuntimePrototypeDefinition` with the same raw prototype definition. This also registers the interpreted prototype in the active runtime memory store.
9. Verify with `ToGetPrototypeDetails`, `ToGetRuntimePrototypeDetails`, or `ToDumpRuntimeMemories`.
10. Summarize what was remembered in natural language.

### Valid raw ProtoScript example

When remembering `Example marker ABC lives at C:\dev\example`, pass this exact shape to validation/interpretation, without markdown fences:

```protoscript
prototype ExampleMarkerABC : SemanticEntityBase
{
	EntityName = @"Example marker ABC";
	Aliases = @"example marker; ABC marker";
	RootDirectory = @"C:\dev\example";
	Description = @"Temporary memory: Example marker ABC lives at C:\dev\example.";
}
```

The base after `:` must already exist in the current runtime. `SemanticEntityBase` is acceptable for simple temporary remembered entities when no more specific existing root is available.

## Query workflow

Input: one natural-language question about temporary memory.

1. Extract likely entity phrase(s), relation, property, or constraint.
2. Prefer `ToSearchRuntimeMemories` when you can construct or identify a filter prototype. Use `ToDumpRuntimeMemories` for broad inspection or debugging.
3. Search the runtime/ontology graph with existing Buffaly tools where possible.
4. Inspect the selected prototype details.
5. Answer in natural language. Exact wording does not need to be deterministic, but the answer must be grounded in the inspected runtime graph.
6. If no relevant runtime memory is found, say so rather than inventing an answer.

## Do not

- Do not use a separate memory agent for this version.
- Do not create `MemoryBase`, `MemoryEntity`, `MemoryFact`, `MemoryVerb`, or a parallel memory ontology.
- Do not use JSON as an intermediary prototype-construction format.
- Do not create a custom model runner.
- Do not persist temporary memory unless explicitly requested.

## Useful runtime tools

- `ToValidateRuntimePrototypeDefinition`
- `ToInterpretRuntimePrototypeDefinition`
- `ToGetRuntimePrototypeDetails`
- `ToDumpRuntimeMemories`
- `ToSearchRuntimeMemories`

Prefer existing Buffaly tools for search and schema inspection when available:

- `ToSearchCandidateEntities`
- `ToGetPrototypeDetails`
- `ToListPrototypeFirstLevelDescendants`

# Remember Something In The Buffaly Agent Ontology

You are maintaining Buffaly Agent memory in ProtoScript by modeling information as ontology prototypes.

## Goal

Given a fact, preference, contact, environment detail, or other object to remember, make the minimum coherent ontology change so the memory is queryable, semantically correct, and stored in the correct Buffaly Agent node location.

## Hard Rules

1. Search ontology first with `ToSearchCandidateEntities`, `ToGetPrototypeDetails`, `ToGetPrototypeNotes`, or `ToListPrototypeFirstLevelDescendants`. Use file search only after ontology binding, for placement or source-file checks.
2. Do not edit `.pts` files directly. Use `ToInsertOrUpdatePrototypeDefinition` for prototype creation or updates.
3. Prefer updating an existing matching instance when one already represents the same memory.
4. If no matching instance exists, add a new instance under the correct existing base.
5. For simple memories, stop there; do not create a research project or new reusable structure unless clearly needed.
6. Create a new base/type only when no existing base fits and the concept is genuinely reusable.
7. Every created or updated ontology prototype must include at least one `[SemanticEntity("...")]` annotation so it is discoverable by natural language later.
8. Base concept/type prototypes must also include semantic entities.
9. Preserve existing naming, inheritance, and field patterns unless there is a clear reason to improve them.
10. Do not use JSON/object-literal syntax in ProtoScript. Use valid ProtoScript `prototype` syntax only.

## Placement Rules

1. New personal remembered objects should be placed under the best matching existing subtree anywhere in the current install/session's `Nodes/Personal`, not automatically under one catch-all file.
2. Use the narrowest correct existing home first, for example `Nodes/Personal/DevelopmentEnvironment` for machine/workstation/local-site facts and `Nodes/Personal/Coding` for coding-specific personal guidance. Solution-specific remembered objects belong in the user's install-local `Nodes/Personal` tree, not in the shared development OpsAgent project.
3. Use `Nodes/Personal/Memories` as the fallback only when no more specific `Nodes/Personal/...` subtree fits the remembered object.
4. Shared reusable base object types belong under `Nodes/Common`.
5. Keep an existing prototype in its current file unless that location is clearly wrong or you are explicitly cleaning up legacy placement.
6. Do not write ontology memory to project-root `index.pts`.
7. Do not place new remembered objects in `Nodes/Personal/Personalization/index.pts`; that file is for personal settings and personalization prompt actions only.
8. Everything outside `Nodes/Personal` is system-owned for normal remembered-object authoring. Do not write outside `Nodes/Personal` unless the user explicitly asks for that target.
9. Organize intentionally inside `Nodes/Personal`: search existing personal nodes, choose the closest natural home, and create a new personal subfolder only when no existing personal node fits and the concept is durable enough to deserve its own home.
10. Do not perform broad personal-node refactors while remembering one object unless the user explicitly requested cleanup.

## Required Search / Decision Process

1. Search for existing nearby entity and base patterns first.
2. Search the relevant `Nodes/Personal` branches before choosing a file so placement follows the best existing personal subtree, not just the first remembered-object file you find.
3. Decide which of these cases applies:
	- update an existing remembered instance
	- add a new instance under an existing base
	- create a new reusable base, then add a new instance under it
4. Choose the narrowest correct existing parent/base and file location before inventing a new one.
5. If several `Nodes/Personal` locations are plausible, prefer the most specific subtree; use `Nodes/Personal/Memories` only as the fallback.
6. Reuse nearby field names, annotations, and naming style when they are semantically correct.
7. Keep personal-node organization local to the remembered object; do not reorganize unrelated personal-node content unless the user requested cleanup.

## ProtoScript Authoring Contract

When creating or updating a prototype, write valid ProtoScript. Use `ToInsertOrUpdatePrototypeDefinition` with a complete prototype block.

Valid example for a reusable concept base:

```pts
[SemanticEntity("food")]
prototype Food : SemanticEntityBase
{
	String FoodCategory = new String();
}
```

Valid example for a concrete food instance:

```pts
[SemanticEntity("pizza")]
partial prototype Food#Pizza : Food
{
	EntityName = "pizza";
	FoodCategory = "prepared dish";
}
```

Valid example for a remembered personal instance:

```pts
partial prototype User#SampleUser : User
{
	... existing properties ...
	Food FavoriteFood = Food#Pizza;		//new property 
}
```

Important syntax reminders:
- Use `prototype` or `partial prototype`
- Use `=`, not `:`
- Use valid annotations like `[SemanticEntity("...")]`
- Declare reusable base fields explicitly when creating a new base
- Prefer typed links to other prototypes when the remembered value is itself a modeled thing

For local ProtoScript guidance, follow `ProtoScript.Minimum.md`.

## Exact Tooling Path

1. Search and inspect first.
2. Decide the correct base and correct target file.
3. Apply the change with `ToInsertOrUpdatePrototypeDefinition(fileName, prototypeDefinition)`.
4. If only a semantic alias needs to be added to an existing prototype, `ToAddSemanticEntityNameToPrototype` may be used instead of rewriting the full block.
5. Do not edit the `.pts` file directly.

## Validation

1. Ensure the target file is reachable from `Project.pts`.
2. Confirm every modified prototype has `[SemanticEntity("...")]` annotation(s).
3. Confirm any new reusable base also has semantic entities.
4. Confirm the prototype block is valid ProtoScript before considering the task complete.
5. If the updated ontology must be used in the current session and runtime interpretation is insufficient, run `reload_tools` once after the complete change set.

## Output Contract

Return:
1. Chosen ontology placement and why.
2. Which existing base was reused, or why a new base was created.
3. Exact prototype upsert(s) performed through `ToInsertOrUpdatePrototypeDefinition`.
4. File(s) changed.
5. Validation result.

## Safety

- Do not delete or rename prototypes unless explicitly required.
- Do not introduce broad hierarchy changes unless necessary.
- If uncertain between multiple parent choices, choose the narrowest correct existing parent.

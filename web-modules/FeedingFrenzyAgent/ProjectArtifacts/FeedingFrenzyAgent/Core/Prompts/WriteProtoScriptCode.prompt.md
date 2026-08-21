# Write ProtoScript Code (Canonical OpsAgent Workflow)

Goal
- Write or modify `.pts` code safely, minimally, and predictably.

Mandatory First Step
- Call `ToWriteProtoScriptCodeSkill` first, then follow the returned instructions before drafting or editing any `.pts` file.

Read Order
1. Read `AGENTS.md`.
2. Read `ProtoScript.Minimum.md`.

Authoring Rules (Mandatory)
- Treat ProtoScript as thin glue for orchestration and typed parameter shaping.
- Keep business logic, validation, coalescing, retries, and brittle parsing in C# facades/helpers.
- Prefer pass-through wrappers that call one stable facade path.
- Fail fast with explicit errors rather than adding fallback/discovery layers.
- Update corresponding `.pts.md` whenever a non-trivial `.pts` file changes.

Native Typed Object Chaining Rules
- Return `Prototype` for complex native values that must be chained into later actions.
- Preserve `NativeValuePrototype` flow between actions.
- Do not convert typed flow values into display strings mid-flow (for example, `"Action (11)"`).
- Convert to string only in explicit formatter boundary actions (for example, `ToConvert...ToString`).
- Prefer `StringRef` for large text cross-boundary flows when deferred materialization is beneficial; prefer `string` for immediate text values.

StringRef Boundary Rules (ProtoScript/C# Interop)
- `StringRef` is an explicit string-handle boundary type for ProtoScript/C# interop.
- If a ProtoScript function returns `StringRef`, runtime returns a lightweight handle containing the underlying `System.String` prototype instead of eagerly materializing the text payload.
- `ToResolveStringReference` is the authoritative materializer action: it accepts `StringRef` and returns `string`.
- A materializer action should use `function Execute(StringRef value) : string { return value; }`; no normalizer or helper action is required.
- Use a `StringRef` parameter when a tool/action must accept a string reference and materialize it to text.
- Use a `string` parameter only when the caller is expected to provide already-materialized text.

Example (`.pts`):
```pts
function BuildPromptRef() : StringRef
{
	return "Very large prompt body...";
}

function BuildPromptText() : string
{
	return "Very large prompt body...";
}

function ResolvePromptText(StringRef value) : string
{
	return value;
}
```

The authoritative OpsAgent example is `ToResolveStringReference`: `function Execute(StringRef value) : string { return value; }`.

Difference:
- `StringRef` return: cheap handle crossing boundary, deferred text materialization.
- `string` return: full text materialized immediately in C#.

Authoring Checklist For New Actions
1. Reuse an existing local `.pts` pattern that already compiles for the same shape.
2. Add strong infinitive phrases that match user intent.
3. Keep action logic minimal and deterministic.
4. Use typed/native chaining boundaries correctly (`Prototype` for complex flow).
5. Add formatter actions only where presentation text is explicitly required.
6. Keep secrets and environment-specific concerns in C# configuration/facades.
7. Add or update the matching `.pts.md` companion when a non-trivial `.pts` file changes.

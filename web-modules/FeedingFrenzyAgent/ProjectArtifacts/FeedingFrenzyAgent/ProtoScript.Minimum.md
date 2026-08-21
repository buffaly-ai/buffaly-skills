# ProtoScript Minimal Reference

This file is a distilled, minimal reference to author ProtoScript `.pts` files. It summarizes the official ProtoScript reference and adds **OpsAgent-specific conventions** based on the current OpsAgent `.pts` files.

## Core Model
- ProtoScript is a graph-based, prototype-oriented language. Prototypes are graph nodes that act as both templates and instances.
- A prototype can inherit from multiple parents and can be modified at runtime.
- Properties are stored edges (extensional facts). Functions compute relationships (intensional facts).

## File Basics
- Use `.pts` files with C#-like syntax.
- Statements end with `;` and blocks use `{}`.
- Comments use `//` or `/* ... */`.

## OpsAgent Project Layout
- `Project.pts` includes in this order:
	- `Imports.pts`
	- `OpsOntology.pts`
	- `SemanticPrograms.pts`
	- `PromptActions.pts`
	- `OpsTypedOps.pts`
- `Imports.pts` establishes `reference` and `import` entries used throughout the Ops ontology.

## Local Conventions (OpsAgent)
- Prototype identifiers must **not** contain periods (`.`). Use underscores (`_`) instead.
- Do **not** use `init { ... }` blocks. Put initializers directly in the prototype body.
- Use `SemanticEntityBase` as the base for semantic entities and keep `EntityName` on that base.
- Do **not** annotate `SemanticEntityBase` with `SemanticEntity(...)`.
- Each ontology prototype should include a **short canonical** semantic entity name via `[SemanticEntity("...")]`.
- For additional examples, refer to `C:\dev\ai\Ontology8`.

## Imports and Native Value Types (OpsAgent)
- OpsAgent uses wrapper types from `Ontology.Simulation`:
	- `String`, `Int`, `Bool` (imported in `Imports.pts`).
- Use `String`/`Int`/`Bool` in property declarations:
```protoscript
prototype SemanticEntityBase : BaseObject
{
	String EntityName = new String();
}
```

## Prototype Declaration
- `prototype Name { ... }` declares a prototype.
- `prototype Child : Parent1, Parent2 { ... }` declares multiple inheritance.
- `prototype Name;` declares an empty prototype (used for roots like `BaseObject`).

## Prototype Instances (Partial Prototypes)
- Use **partial prototypes** with `#` for instances:
```protoscript
partial prototype VisualStudioSolution#Buffaly : VisualStudioSolution, BaseObject
{
	FileName = "Buffaly.Development.sln";
	Directory = @"Use the injected DevelopmentSourcePath entity from the master prompt instead of hardcoding a local repository path.";
}
```
- Include the base class explicitly (e.g., `BaseObject`) to keep type graphs explicit.

## Semantic Entity Annotations
- Use `[SemanticEntity("...")]` to bind canonical names.
- Keep names short and canonical (e.g., `"ontology visual studio solution"`).
```protoscript
[SemanticEntity("ontology visual studio solution")]
prototype VisualStudioSolution : BaseObject
{
	String SolutionName = new String();
	String Directory = new String();
}
```

## Semantic Programs and Ops Actions
- `OpsAction` inherits from `ProtoScriptAction` and is the base for typed ops tools.
- Use `[SemanticProgram.InfinitivePhrase("...")]` for tool phrasing.
- Implement `function Execute(...) : string` and return a readable summary.
```protoscript
[SemanticProgram.InfinitivePhrase("to build the buffaly solution")]
prototype ToBuildBuffalySolution : OpsAction
{
	Description = @"Uses the default BuildProfile#Buffaly_Debug unless overridden via a build profile specific action.";

	function Execute() : string
	{
		return ToBuildVisualStudioSolutionFromBuildProfile.Execute(BuildProfile#Buffaly_Debug);
	}
}
```

## Common Helper Patterns (OpsTypedOps.pts)
- Use `ToTruncatedText(value, maxLength)` when returning large outputs.
- Validate required prototype parameters and return a short error when missing.
- Use `SystemOperations` for command execution:
	- `SystemOperations.RunCommandLine(...)`
	- `SystemOperations.RunPowerShell(...)`
	- `SystemOperations.LaunchFile(...)`

## JSON Arguments (Important)
- For JsonWs or any object-shaped inputs, build a `JsonObject` directly instead of building JSON strings by concatenation.
- Preferred pattern:
```protoscript
JsonObject args = new JsonObject();
args["SiteID"] = siteID;
args["SiteName"] = siteName;
return JsonWsHelper.CallJsonWs(url, "GetSite", token, args);
```
- Avoid string-built JSON like `"{\"SiteID\":" + siteID + "}"` because it is fragile and prone to escaping/shape errors.

## Prompt Actions
- Prompt actions are in `PromptActions.pts` and provide protocol guidance.
- Example: `ToGetOpsAgentProtocolPrompt` returns a standard rules block.

## Properties
- Syntax: `Type Name = DefaultValue;`
- Assign properties in prototype bodies or later: `Foo.Bar = Baz;`
- Use verbatim strings `@"C:\path\..."` for Windows paths.

## Collections
- Use `Collection` for one-to-many relationships.
- Create with `Collection Items = new Collection();`
- Initialize with literals: `Items = [Item1, Item2];`
- Typical members: `Add`, `Remove`, `Count`.

## Functions
- Syntax: `function Name(Type param, ...) : ReturnType { ... }`
- Control flow uses `if` and `foreach` like C#.
- Functions traverse or modify the graph by reading or assigning properties.

## Async Interop Rule (Important)
- When calling .NET async methods from ProtoScript, do **not** chain `.GetAwaiter().GetResult()` in `.pts`.
- In OpsAgent runtime, async results are resolved by the interpreter/binding path for compatible calls.
- Preferred pattern:
```protoscript
return GmailFacade.SearchMessagesAsync(
	ToGoogleWorkspaceClientId(),
	ToGoogleWorkspaceClientSecret(),
	ToGoogleWorkspaceRedirectUri(),
	ToGoogleWorkspaceStorageRootPath(),
	ToGoogleWorkspaceApplicationName(),
	accountKey,
	"gmail.read",
	query,
	maxResults,
	false,
	new CancellationToken(false));
```
- Avoid:
```protoscript
return SomeAsyncCall(...).GetAwaiter().GetResult();
```

## ProtoScript Authoring Contract (OpsAgent)
- ProtoScript is a thin glue layer for orchestration and typed parameter routing.
- Keep `.pts` wrappers pass-through and minimal.
- Put business logic, validation/coalescing, retries, auth sequencing, and brittle shape handling in C# facades/helpers.
- Prefer one authoritative facade path over multi-shape compatibility layers in `.pts`.

## Native Typed Value Flow (Boxing/Unboxing)
- When complex values cross action boundaries, use return type `Prototype` so native boxing/unboxing flow remains intact.
- Preserve native chaining between actions instead of serializing to intermediate strings/JSON unless string output is the explicit contract.
- Avoid mid-flow display-string conversions (for example, `"Action (11)"`) because they break typed chaining.
- Use dedicated formatter boundary actions (for example, `ToConvert...ToString`) only when presentation text is required.

## Action Design Defaults
- Keep `.pts` logic minimal, deterministic, and focused on orchestration.
- Prefer C# facade-first design when behavior is non-trivial or likely to evolve.
- Use explicit fail-fast checks in wrappers, then delegate quickly to stable facade methods.

## Operators
- `typeof` checks inheritance: `proto typeof Parent`
- `->` is a categorization test with structural conditions:
	- `return city -> City { this.State.Name == "New York" };`

## Annotations
- `[Lexeme.SingularPlural("word", "plural")]` for NLP lexemes.
- `[SubType]` for dynamic categorization; paired with `IsCategorized`.
- `[TransferFunction(Dimension)]` to register graph-to-graph transforms.

## Minimal Template
```protoscript
prototype Thing
{
	String Name = new String();
}

prototype Example : Thing
{
	Name = "Sample";
}

function main() : string
{
	return Example.Name;
}
```

## Thin Wrapper Rule (Review Standard)

ProtoScript action implementations must be thin wrappers over authoritative C# owners.

Do not add ProtoScript-side:
- error checking or guard clauses
- null normalization
- trimming or other normalization
- defaulting or fallback values
- clamping or range repair
- path resolution or path policy
- shell-script assembly for business flows
- HTTP orchestration for business flows
- output parsing as control flow
- duplicate wrapper aliases when one authoritative owner already exists

Preferred shape:
- direct argument pass-through to the authoritative C# method/tool
- prompt actions may contain metadata only, not business logic
- if a ProtoScript action needs real logic, that logic likely belongs in C# instead

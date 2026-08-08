# Code Reviews

## ProtoScript

Use this section as the starting checklist for reviewing ProtoScript changes in this repository.

- Verify edits are limited to the relevant sections and follow existing local `Project.pts`, `Imports.pts`, and `Skills/*/index.pts` patterns before introducing new approaches.
- Read `documentation/ProtoScript.Minimum.md` before reviewing or approving non-trivial `.pts` changes.
- Preserve authoritative contract/property capitalization exactly across C#, ProtoScript, JsonWs stubs, and JavaScript call sites; keep PascalCase contract names end-to-end.
- Use project-relative paths only. Reject repository-root guesses, branch-root climbs, machine-specific paths, and `bin`/solution-output DLL references in `.pts` and related prompts.
- Follow the local skill pattern for feature skills:
	- `prototype <SkillName>SkillAction : OpsAction`
	- `prototype <SkillName>Skill : SkillEntity`
	- `ActionRoot = <SkillName>SkillAction`
	- callable actions inherit from `<SkillName>SkillAction`
	- Do not add `CoreEntity` or `CoreAction` to new skills or skill actions unless specifically indicated; `SkillEntity` and `OpsAction` are the default bases.
- Keep action descriptions and infinitive phrases on callable prototypes; reject vague or missing action metadata.
- Keep ProtoScript as thin glue. Default to pass-through actions that call authoritative C# facade/helper methods.
- Reject ProtoScript that owns business validation, path normalization, auth setup, JSON traversal, retry logic, response reshaping, or multi-step orchestration when C# can own that behavior.
- Prefer more specific typed actions first. Use PowerShell only when no better typed action expresses the required local scripted operation cleanly.
- Reject raw shell-script construction in `.pts` when a typed action or facade method should own the operation.
- Preserve native `Prototype`/`NativeValuePrototype` flows for cross-action typed chaining; stringify only in explicit formatter actions.
- Do not use `object` locals in `.pts`.
- Do not rely on nullable-placeholder local flow or assign `null` placeholders that later change type.
- Do not use chained boolean expressions such as `a && b`; prefer nested `if` statements.
- Prefer direct deterministic calls and direct returns over control-flow-heavy glue.
- Do not build JSON strings by concatenation when `JsonObject` or a typed C# contract can represent the payload.
- Do not chain `.GetAwaiter().GetResult()` in `.pts`; use the existing async interop pattern used by working local skills.
- Import only the DLL types actually needed and keep skill-local DLL references under `Skills/<SkillName>/lib/`.
- Prefer facade-first DLL-backed skills like `Skills/GoogleWorkspace`; ProtoScript should pass through into C# rather than reconstructing behavior locally.
- Do not claim ProtoScript compile success from a Codex edit pass; require the calling agent or user to run the actual validation step.
- Keep one coherent fix path. Do not add compatibility wrappers, dual-shape parsing, or fallback prompt/tool paths to preserve obsolete behavior.
- When reviewing new prompt skills or prompt actions, verify they are actually reachable through the active ProtoScript project include tree. Confirm the owning .pts file is included by Project.pts directly or transitively, so the skill is discoverable and not just present on disk.
- Match server-side contract/property naming in ProtoScript and JavaScript; do not add alternate casing or alias paths.
- Fail fast on invalid required inputs instead of adding silent defaulting, cleanup, or discovery heuristics.
- Look for dead helper actions, duplicate wrappers, and path-resolution logic that should be deleted once an authoritative owner exists.
- When modifying non-trivial `.pts` files, require the directly affected `.pts.md` history or companion documentation to be updated when that file is part of the local workflow.

### Auto-Approval Rules

Unless the user explicitly says otherwise, the following categories are pre-approved and should be fixed automatically without asking for approval first.

Apply the change, run serial validation on the touched project(s) when feasible, and commit the change set.

Do not stop to ask for approval for these categories.

#### 1. Mechanical Cleanup

Auto-approve `Mechanical cleanup` changes when they do not alter:

- external contracts
- skill names
- prompt-action names
- JsonWs method names
- DLL reference ownership
- user-visible behavior

Examples:

- remove dead helper actions and unused local variables
- remove trivial pass-through wrappers that only forward to another authoritative action or facade
- remove duplicate prompt text that conflicts with the authoritative workflow
- remove redundant local wrapper variables when the authoritative value can be used directly
- collapse repeated direct calls into one existing local helper when behavior is already identical

Example:

```diff
-function ToGetWikiTitle(string wikiPath) : string
-{
-	return ToGetWikiDisplayTitle.Execute(wikiPath);
-}
+return ToGetWikiDisplayTitle.Execute(wikiPath);
```

#### 2. Boundary Hardening For Already-Required Values

Auto-approve `Boundary hardening` changes when they only make an already-required action input, contract field, or path fail fast instead of silently coercing.

Examples:

- replace empty-string fallback on required skill arguments with explicit errors
- remove silent path cleanup or argument coercion from required action inputs
- remove fallback parsing for malformed internal payloads when the authoritative contract is already clear
- replace prompt instructions that encourage "best effort" repair with explicit failure and diagnostics

Guardrail:

- if old persisted outputs, external callers, or prompt flows are known to depend on the coercion, do not auto-apply; surface it for approval

Example:

```diff
-if (StringUtil.IsEmpty(articleSlug))
-{
-	return "";
-}
+if (StringUtil.IsEmpty(articleSlug))
+{
+	throw new Exception("Wiki article slug is required.");
+}
```

#### 3. Remove Path Guessing And Environment-Shape Fallbacks

Auto-approve removal of path guessing, repository-root climbing, and duplicate configuration fallback chains when an authoritative project-relative path or typed feature owner already exists.

Repository rule:

- do not encode machine-specific roots, branch-root assumptions, or solution-output probing in ProtoScript
- use project-relative paths and authoritative typed owners
- if a skill or prompt reconstructs a path that already belongs to a facade or typed configuration owner, remove that reconstruction

Examples:

- replace `Path.Combine(projectDirectory, "..", "..", "..", "Wiki")` with a facade-owned path lookup
- remove `bin/Debug/...` DLL probing when `Skills/<SkillName>/lib/...` is the authoritative install path
- remove duplicate prompt guidance that tells the model to discover paths heuristically

Guardrail:

- if there is no authoritative owner yet, do not remove the path/config logic automatically

Example:

```diff
-reference @"..\..\..\bin\Debug\net9.0\MySkill.dll" MySkillNamespace
+reference @"Skills/MySkill/lib/MySkill.dll" MySkillNamespace
```

#### 4. Exact Contract And Token Enforcement

Auto-approve exact-token enforcement when the authoritative contract or token owner already exists and the change does not alter a public boundary.

Examples:

- remove casing aliases, alternate property names, or fallback action names in local glue
- remove trimming, lowercasing, or token remapping around closed internal token sets
- remove prompt guidance that tells the model to try alternate payload shapes when a typed contract already exists

Guardrail:

- if the token or payload crosses an external boundary and there is no shared authoritative owner yet, ask first

Example:

```diff
-if (StringUtil.EqualNoCase(operationName, "savewikiarticle"))
+if (operationName == "SaveWikiArticle")
```

#### 5. Internal Naming Alignment To The Authoritative Contract

Auto-approve internal naming cleanup when the public contract is already settled and the change does not rename a public boundary.

Examples:

- rename internal locals, helper parameters, and prompt wording to match the authoritative contract/property names
- align `articlePath` to `WikiPath` inside prompts or `.pts` when `WikiPath` is the settled contract name
- remove obsolete wording when the actual typed action/contract has already migrated

Guardrail:

- if the rename changes a public action name, prompt-action name, JsonWs shape, deep-link query parameter, or persisted field name, ask first

Example:

```diff
-JsonObject payload = new JsonObject();
-payload["articlePath"] = wikiPath;
+JsonObject payload = new JsonObject();
+payload["WikiPath"] = wikiPath;
```

#### 6. One-Owner Consolidation

Auto-approve one-owner consolidation when multiple internal ProtoScript or prompt paths implement the same behavior and one clear owner already exists.

Examples:

- delete duplicate path/slug/title helpers and call the existing authoritative facade or action
- remove wrapper-over-wrapper mapping where the target contract or typed action can be used directly
- collapse repeated prompt instructions into one authoritative skill/prompt owner

Guardrail:

- if consolidation changes sequencing, side effects, or error behavior in a way that could be user-visible, ask first

Example:

```diff
-string wikiRoot = ToGetWikiRootPathFromProjectDirectory(projectDirectory);
-return ToListWikiArticlesFromRoot.Execute(wikiRoot);
+return WikiFacade.ListWikiArticles(projectDirectory);
```

#### 7. Adjacent Required Cleanup

Auto-approve adjacent low-impact cleanup that is directly required by an approved or auto-approved change.

Examples:

- update directly affected prompt text or skill descriptions after removing dead wrappers
- remove now-unused imports after consolidating to an authoritative facade
- update local includes after moving a DLL reference to the skill-local `lib/` folder
- update directly affected `.pts.md` or companion history/docs when the workflow requires it

Guardrail:

- keep edits limited to files directly required by the change set

#### 8. Validation And Commit Behavior

For auto-approved changes:

- run serial validation on the touched project(s) when feasible
- prefer `dotnet build -m:1`
- if a change is isolated to prompts or `.pts` files and there is no safe local validator, say so explicitly instead of claiming compile success
- commit automatically after each completed change set
- stage only intentionally modified files
- ignore unrelated working tree changes

Do not run tests unless the user explicitly asks.

#### 9. Not Auto-Approved

Do not auto-apply `Contract change` or `Behavioral change` work.

These still require explicit approval.

Examples:

- changing public skill or prompt-action names
- changing JsonWs method names or typed contract property names
- changing deep-link query parameter names used by the agent shell
- changing prompt-routing behavior or agent invocation semantics
- changing DLL install/discovery behavior relied on by existing skills or users

#### 10. Standing Skip List

During review sweeps, skip these areas unless the user explicitly asks for them:

- provider/model-selection and transport code unrelated to the ProtoScript flow under review
- temporary migration helpers
- manual/integration harnesses
- bootstrap/process environment plumbing outside the reviewed skill flow
- generated stubs unless the ProtoScript change directly requires regenerating or aligning them

Review behavior rule:

- if an issue clearly falls into one of the auto-approved categories above, fix it automatically instead of surfacing it for approval
- only surface items that are outside these rules, have meaningful side-effect risk, or require a public contract/behavior decision

### Simple Examples

Do not hard-code repository shape or branch-root climbing in ProtoScript when an authoritative owner should supply the path.

Bad:

```protoscript
function ToGetWikiRootPathFromProjectDirectory(string projectDirectory) : string
{
	return Path.Combine(projectDirectory, "..", "..", "..", "Wiki");
}
```

Better:

```protoscript
function ToGetWikiRootPath() : string
{
	return WikiFacade.GetWikiRootPath();
}
```

Do not keep heavy normalization or traversal policy in `.pts` when a C# facade can own it.

Bad:

```protoscript
function ToNormalizeWikiArticleSlug(string articleSlugOrPath) : string
{
	string normalized = (articleSlugOrPath ?? "").Trim();
	normalized = normalized.Replace('/', Path.DirectorySeparatorChar);
	normalized = normalized.Replace('\\', Path.DirectorySeparatorChar);
	if (normalized.Contains(".."))
	{
		return "";
	}

	return normalized;
}
```

Better:

```protoscript
function ToNormalizeWikiArticleSlug(string articleSlugOrPath) : string
{
	return WikiFacade.NormalizeWikiArticleSlug(articleSlugOrPath);
}
```

Do not build JSON strings by concatenation when object-shaped arguments are required.

Bad:

```protoscript
string args = "{\"WikiPath\":\"" + wikiPath + "\",\"Content\":\"" + content + "\"}";
return JsonWsHelper.CallJsonWs(url, "SaveWikiArticle", token, args);
```

Better:

```protoscript
JsonObject args = new JsonObject();
args["WikiPath"] = wikiPath;
args["Content"] = content;
return JsonWsHelper.CallJsonWs(url, "SaveWikiArticle", token, args);
```

Do not block async .NET calls with `.GetAwaiter().GetResult()` in ProtoScript.

Bad:

```protoscript
return GmailFacade.SearchMessagesAsync(...).GetAwaiter().GetResult();
```

Better:

```protoscript
return GmailFacade.SearchMessagesAsync(...);
```

Do not use generic `OpsAction` directly for feature actions when the local skill root should own the action surface.

Bad:

```protoscript
prototype ToSaveWikiArticle : OpsAction
{
	Description = "Saves a wiki article.";
}
```

Better:

```protoscript
prototype WikiSkillAction : OpsAction;

prototype ToSaveWikiArticle : WikiSkillAction
{
	Description = "Saves the specified wiki article through the authoritative wiki facade.";
}
```

### ProtoScript Boundaries Must Not Coerce

For skill, prompt, JsonWs, and facade boundaries, do not add trimming, defaulting, alternate names, or fallback payload shapes to "make flows work."
Validate against the authoritative contract and fail with explicit diagnostics.

Bad:

```protoscript
JsonObject args = new JsonObject();
args["wikiPath"] = wikiPath;
args["WikiPath"] = wikiPath;
args["Content"] = content ?? "";
```

Better:

```protoscript
if (StringUtil.IsEmpty(wikiPath))
{
	throw new Exception("WikiPath is required.");
}

JsonObject args = new JsonObject();
args["WikiPath"] = wikiPath;
args["Content"] = content;
```

Review rule:

- if the same coercion appears multiple times, fix the authoritative contract/facade once; do not spread fallback logic through prompts or `.pts`
- do not hide contract violations in convenience wrappers

### Repeated Glue Logic Is A Design Smell

If the same path guessing, JSON construction pattern, shell-script assembly, or prompt instruction appears repeatedly, the authoritative skill or facade is likely wrong.

Bad:

```protoscript
string wikiRoot = Path.Combine(projectDirectory, "..", "..", "..", "Wiki");
string escapedWikiRoot = wikiRoot.Replace("'", "''");
string script = "Get-ChildItem -Path '" + escapedWikiRoot + "' -Recurse -File -Include *.md";
return SystemOperations.RunPowerShell(script);
```

Better:

```protoscript
return WikiFacade.ListWikiArticles(projectDirectory);
```

Review rule:

- repeated glue logic is a signal to move the behavior into one authoritative C# facade or typed action
- keep `.pts` files honest: thin wrappers, stable wiring, and direct calls into owned behavior

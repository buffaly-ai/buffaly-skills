# Code Reviews

## C#

Use this section as the starting checklist for reviewing C# changes in this repository.

- Verify edits are limited to the relevant sections and follow existing local patterns before introducing new approaches.
- Preserve DTO and property capitalization exactly across layers; contract names should remain PascalCase end-to-end.
- Use tabs for indentation in all C# files and match the surrounding indentation level.
- Respect nullable annotations as the source of truth: do not add null checks/coalescing for non-nullable values (including in property setters), and model nullable values explicitly with `?`.
- Do not use `Trim()` in C# review-approved code; preserve the source value unless the authoritative contract explicitly requires trimming at the boundary.
- For core model/session invariants, keep shared logic in one owner; do not use this as permission to coerce invalid contract-boundary data.
- Remove trivial pass-through helpers or properties that only forward to another member without adding logic.
- Choose API shape intentionally: use primitive parameters/returns for simple operations, and typed request/response contracts for complex operations.
- Do not use ad-hoc JSON shapes (`JsonObject`, `JsonArray`) for service/tool APIs when primitive or typed contracts can represent the API.
- Confirm each flow has one authoritative shape used consistently across host, worker, persistence, and UI stubs.
- Reject compatibility parsing, alternate casing support, duplicate aliases, or fallback readers for malformed payloads.
- Ensure invalid contract payloads fail fast with clear diagnostics instead of being silently coerced or normalized.
- Persist typed contract data only; do not add best-effort rehydration paths that guess missing or renamed fields.
- Keep translation layers to a single explicit external-boundary mapper only when unavoidable.
- Do not extend `buffaly.agent.tools/OpsAgent/BuffalyAgentService.cs` with new feature APIs without explicit approval; prefer focused tool or service classes.
- Add brief method-level comments for code that is added or modified, except for trivial helpers.
- When modifying `.cs` files, read and update the corresponding `.cs.md` history file with a concise chronological entry.
- For API payload shape changes, require regression coverage for happy paths and known failure modes unless tests are explicitly out of scope.
- Prefer the simplest API shape that matches the real contract; do not introduce wrapper request/result types when primitive signatures are sufficient.
- Reject compatibility shims that only preserve an obsolete call pattern; update callers to the authoritative API instead.
- Remove duplicate logic paths when one existing helper or service already owns the behavior.
- Avoid unnecessary normalization, fallback logic, and defensive cleanup when the contract is already explicit.
- Fail fast on invalid or unsupported conditions instead of silently degrading behavior.
- Red-flag boundary patterns in review: `??` fallbacks, `Get*OrDefault(...)`, `Math.Max` clamping, and alternate-name/casing readers on contract fields.
- Do not return large derived payloads after mutations unless the caller actually needs them.
- Prefer consistent behavior driven by the owning context over scattered method-by-method heuristics.
- Look for dead code paths, unused contract surface, and opportunities to simplify or reduce code when the behavior is already covered elsewhere.
- Remove stale `Ops` prefixes from type and file names when the active surface is no longer Ops-specific; prefer the authoritative non-Ops name instead of adding aliases.
- Prefer enums over strings when the value is a closed set of known options.
- When an enum exists, use the exact enum token/value end-to-end; do not introduce alternate string forms for the same conceptual value in core code paths.
- Do not add enum-to-different-string or string-to-string remapping inside core flows; keep the value on the enum whenever possible.
- If an enum value crosses internal boundaries, move the enum to a shared/common location and reuse it across host, worker, persistence, UI stubs, and tests instead of converting it to ad-hoc strings in each layer.
- If an enum must be translated at a true external boundary, translate to and from the exact string representation of the enum token, including casing; do not invent aliases or alternate spellings.
- When reviewing enum parsing, reject helpers that trim, lowercase, normalize, or alias enum-like string values before binding; exact token matching is the contract unless a third-party boundary explicitly requires otherwise.
- Apply the same guidance to contracts: if the same conceptual payload crosses internal boundaries, prefer one shared contract in a common location instead of mapping between similar internal contracts.
- Reject near-duplicate internal request/response contracts that only rename or reshuffle the same payload across host, worker, persistence, or UI layers; prefer the one authoritative shared contract instead.
- Only introduce a second contract when there is a real boundary reason, such as a third-party payload, materially different shape requirements, versioning, or security/isolation constraints.
- Keep tests on the repository's standard test framework and assertion style; do not add custom assertion layers without a clear need.
- Format code for readability by grouping related statements into blocks and avoiding overly fragmented call formatting.

### Auto-Approval Rules

Unless the user explicitly says otherwise, the following categories are pre-approved and should be fixed automatically without asking for approval first.

Apply the change, update any directly affected `.cs.md` files, run serial compile validation on the touched project(s), and commit the change set.

Do not stop to ask for approval for these categories.

#### 1. Mechanical Cleanup

Auto-approve `Mechanical cleanup` changes when they do not alter:

- external contracts
- persisted shapes
- JsonWs method names
- generated stub signatures
- user-visible behavior

Examples:

- remove redundant null checks on non-nullable values
- remove `?? string.Empty` or `?? new List<...>()` on non-nullable members
- remove trivial pass-through helpers and properties
- remove dead code paths and unused private/internal types
- remove stale internal/private `Ops` prefixes
- remove redundant local wrapper variables when the authoritative value can be used directly

Example:

```diff
-	if (runtimeFeature == null)
-		throw new ArgumentNullException(nameof(runtimeFeature));
	_feature = runtimeFeature;
```

#### 2. Boundary Hardening For Already-Required Values

Auto-approve `Boundary hardening` changes when they only make an already non-nullable or already-required contract fail fast instead of silently coercing.

Examples:

- replace silent defaulting of required members with explicit exceptions/errors
- remove clamping/defaulting/fallbacks from required contract fields
- remove fake optional handling on non-nullable method parameters
- remove fallback parsing for malformed internal payloads when the authoritative contract is already clear

Guardrail:

- if old persisted data, old external callers, or a UI boundary are known to depend on the coercion, do not auto-apply; surface it for approval

Example:

```diff
-	string normalizedInstruction = NormalizationUtil.NormalizeOptionalText(instruction, "ping");
+	string normalizedInstruction = NormalizationUtil.NormalizeRequiredText(instruction, nameof(instruction));
```

#### 3. Remove Feature-Replaced Environment Or AppSettings Fallbacks

Auto-approve removal of environment-variable and duplicate appsettings fallback chains when a typed feature already owns that setting.

Repository rule:

- do not use environment variables as a settings source for Buffaly application settings
- settings must come from the authoritative typed feature/config owner
- if code reads an environment variable for a setting that already belongs to a feature or appsettings contract, remove that environment-variable path instead of preserving it
- only true bootstrap/process variables remain acceptable outside the typed settings system

Examples:

- replace `Environment.GetEnvironmentVariable(...)` reads with `*.Feature` reads
- remove duplicate config probing in web/worker/gateway paths once a canonical feature exists
- remove dead constructor/config plumbing that only existed for the old fallback

Guardrail:

- if there is no typed feature owner yet, do not remove the env/config path automatically
- bootstrap/process env vars such as `ASPNETCORE_URLS`, process ports, `USERPROFILE`, `PATH`, and explicit test toggles are excluded

Example:

```diff
-	if (string.IsNullOrWhiteSpace(openAiApiKey))
-		openAiApiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY") ?? string.Empty;
+	string openAiApiKey = OpenAIFeature.Feature.ApiKey;
```

#### 4. Exact-Token Enforcement For Closed Internal Token Sets

Auto-approve exact-token enforcement when the authoritative token owner already exists and the area is not under an active user-declared freeze.

Examples:

- remove `.ToLowerInvariant()`, trimming, aliasing, or alternate spellings around enum-like values
- switch comparisons from case-insensitive to exact token matching
- remove fallback mappings from one token form to another

Guardrail:

- skip provider-related code while that area is under active development
- if the token crosses an external boundary and there is no shared enum/common owner yet, ask first

Example:

```diff
-	if (!Enum.TryParse(normalized, ignoreCase: true, out SessionCompactionProviderKind parsed))
+	if (!Enum.TryParse(compactionEngine, ignoreCase: false, out SessionCompactionProviderKind parsed))
```

#### 5. Internal Naming Alignment To The Authoritative Contract

Auto-approve internal naming cleanup when the public contract is already settled and the change does not rename a public boundary.

Examples:

- rename internal/private variables, parameters, helpers, comments, and docs from `messageId` to `messageKey`
- align internal naming to shared contract/property names
- remove obsolete wording in prompt/tool descriptions when the actual code contract has already been migrated

Guardrail:

- if the rename changes a public API parameter name, JsonWs method shape, ProtoScript named-argument surface, deep-link query parameter, or persisted field name, ask first

Example:

```diff
-function buildMessageDeepLink(targetSessionKey, messageId) {
-	return "...&messageId=" + encodeURIComponent(messageId);
+function buildMessageDeepLink(targetSessionKey, messageKey) {
+	return "...&messageKey=" + encodeURIComponent(messageKey);
```

#### 6. One-Owner Consolidation

Auto-approve one-owner consolidation when multiple internal code paths implement the same behavior and one clear owner already exists.

Examples:

- delete duplicate helper logic and reuse the existing owner
- remove wrapper-over-wrapper mapping where the target contract/service can be used directly
- collapse internal helper layers that only forward to a canonical helper/service

Guardrail:

- if consolidation changes sequencing, side effects, or error behavior in a way that could be user-visible, ask first

Example:

```diff
-	string fallbackApiKey = ResolveConfiguredOpenAiApiKey();
-	if (!string.IsNullOrWhiteSpace(fallbackApiKey))
-		return fallbackApiKey;
+	return OpenAIFeature.Feature.ApiKey;
```

#### 7. Adjacent Required Cleanup

Auto-approve adjacent low-impact cleanup that is directly required by an approved or auto-approved change.

Examples:

- update directly affected `.cs.md` files
- remove now-unused parameters after deleting dead fallback plumbing
- update local call sites after a private signature cleanup

Guardrail:

- keep edits limited to files directly required by the change set

#### 8. Validation And Commit Behavior

For auto-approved changes:

- run serial compile validation on the touched project(s)
- prefer `dotnet build -m:1 --no-restore /t:Compile /p:BuildProjectReferences=false`
- commit automatically after each completed change set
- stage only intentionally modified files
- ignore unrelated working tree changes

Do not run tests unless the user explicitly asks.

#### 9. Not Auto-Approved

Do not auto-apply `Contract change` or `Behavioral change` work.

These still require explicit approval.

Examples:

- changing JsonWs method names
- changing public contract property names or types
- changing persisted field names or persisted payload shapes
- changing deep-link query parameter names
- changing ProtoScript/public named parameters
- changing behavior relied on by old files, old sessions, or external callers

#### 10. Standing Skip List

During review sweeps, skip these areas unless the user explicitly asks for them:

- provider catalog/provider selection/provider transport/model resolution
- temporary files and temporary migration helpers
- manual/integration harnesses
- test-only env var controls
- bootstrap/process env vars not replaced by features

Review behavior rule:

- if an issue clearly falls into one of the auto-approved categories above, fix it automatically instead of surfacing it for approval
- only surface items that are outside these rules, have meaningful side-effect risk, or require a public contract/behavior decision

### Simple Examples

Do not check non-nullable values for null when the type does not support null.

Bad:

```csharp
protected override async Task<CompletionExecutionResult> ExecuteCompletionAsync(
	Buffaly.Agents.SessionObject session,
	List<ToolSchema> activeToolSchemas)
{
	if (session == null)
	{
		throw new ArgumentNullException(nameof(session));
	}
}
```

Better:

```csharp
protected override async Task<CompletionExecutionResult> ExecuteCompletionAsync(
	Buffaly.Agents.SessionObject session,
	List<ToolSchema> activeToolSchemas)
{
	// Use session directly. The non-nullable type is the contract.
}
```

Do not coalesce non-nullable strings or trim values as a defensive cleanup step.

Bad:

```csharp
string instruction,
out SemanticPreflightShortCircuitPlan? shortCircuitPlan)
{
	shortCircuitPlan = null;
	string safeInstruction = (instruction ?? string.Empty).Trim();
}
```

Better:

```csharp
string instruction,
out SemanticPreflightShortCircuitPlan? shortCircuitPlan)
{
	shortCircuitPlan = null;
	string safeInstruction = instruction;
}
```

When reading from JSON, use the correct accessor for the target type and the correct default.

Bad:

```csharp
ParseOptionalInt(sourceRow.GetStringOrNull("CompactionEpoch"));
```

Better:

```csharp
sourceRow.GetIntOrNull("CompactionEpoch");
```

Use project string utilities for case-insensitive string comparisons.

Bad:

```csharp
if (string.Equals(agentName, Level2WatcherService.Level2AgentName, StringComparison.OrdinalIgnoreCase))
	return;
```

Better:

```csharp
if (StringUtil.EqualNoCase(agentName, Level2WatcherService.Level2AgentName))
	return;
```

Pick primitive or typed contracts based on actual complexity; avoid ad-hoc JSON and avoid unnecessary wrappers.

Bad:

```csharp
public JsonObject UpdateThing(JsonObject request)
{
	// ...
}
```

Better:

```csharp
public void UpdateThing(string fileName, string content)
{
	// ...
}
```

Also better (complex response):

```csharp
public UpdateThingResult UpdateThing(UpdateThingRequest request)
{
	// ...
}
```

Avoid duplicate local logic when an existing helper already owns the operation.

Bad:

```csharp
bool exists = File.Exists(path);
string original = exists ? File.ReadAllText(path) : string.Empty;
// custom update logic here
```

Better:

```csharp
ExistingHelper.UpdateFile(path, content);
```

Keep straightforward calls compact and group related statements into readable blocks.

Bad:

```csharp
DoWork(
	projectDirectory,
	fileName,
	sourceText,
	skillActionPrototypeName,
	includedMethodNames);
```

Better:

```csharp
DoWork(projectDirectory, fileName, sourceText, skillActionPrototypeName, includedMethodNames);
```

### Contract Boundaries Must Not Coerce

For API, worker, and persistence boundaries, do not add null coalescing, clamping, or fallback defaults to "make payloads work."
Validate against the typed contract and fail with explicit diagnostics.

Bad:

```csharp
restored.ProjectFilePath = row.ProjectFilePath ?? string.Empty;
restored.Provider = row.Provider ?? string.Empty;
restored.AggregateInputTokens = Math.Max(0, snapshot.GetIntOrDefault("AggregateInputTokens", 0, true));
```

Better:

```csharp
if (row.ProjectFilePath is null)
	throw new InvalidDataException("Session restore payload is missing required field 'ProjectFilePath'.");
if (row.Provider is null)
	throw new InvalidDataException("Session restore payload is missing required field 'Provider'.");

int? aggregateInputTokens = snapshot.GetIntOrNull("AggregateInputTokens");
if (aggregateInputTokens is null || aggregateInputTokens < 0)
	throw new InvalidDataException("Session restore payload has invalid 'AggregateInputTokens'.");

restored.ProjectFilePath = row.ProjectFilePath;
restored.Provider = row.Provider;
restored.AggregateInputTokens = aggregateInputTokens.Value;
```

Review rule:
- If the same coercion appears multiple times, fix the authoritative contract/boundary once; do not spread fallback logic.
- Do not hide contract violations in non-nullable property setters.

### Repeated Coercion Is A Design Smell

If the same `?? string.Empty`, `Math.Max(0, value)`, empty-list fallback, or similar cleanup appears repeatedly, the authoritative contract is likely wrong.

Bad:

```csharp
session.Provider = row.Provider ?? string.Empty;
payload["Provider"] = session.Provider ?? string.Empty;
log.Provider = session.Provider ?? string.Empty;
```

Better:

```csharp
public sealed class SessionRestoreRow
{
	public required string Provider { get; init; }
}
```

Then use:

```csharp
session.Provider = row.Provider;
payload["Provider"] = session.Provider;
log.Provider = session.Provider;
```

Review rule:
- Repeated coercion is a signal to correct nullability/required-members in the authoritative contract.
- Keep model/property types honest; nullable values should be nullable in the contract and validated at the boundary.

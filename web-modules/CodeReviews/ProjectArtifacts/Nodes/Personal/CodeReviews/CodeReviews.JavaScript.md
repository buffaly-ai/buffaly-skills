# Code Reviews

## JavaScript / kScript

Use this section as the starting checklist for reviewing JavaScript and kScript changes in this repository.

- Verify edits are limited to the relevant sections and follow existing local patterns before introducing new approaches.
- Keep JavaScript and kScript as thin UI glue; do not move business rules, contract reshaping, or workflow orchestration into browser code when an authoritative server or shared owner already exists.
- Match server-side naming exactly. Preserve DTO, request, response, and field names in PascalCase end-to-end; do not introduce camelCase mirrors, alias names, or alternate spellings.
- Use tabs for indentation and match the surrounding indentation level.
- For JavaScript and embedded script blocks, treat existing leading whitespace as part of the contract: do not re-indent surrounding code, do not auto-format, and do not submit whitespace-only cleanup.
- Prefer the existing global utility libraries and shared portal modules instead of writing page-specific helpers or mini-frameworks.
- Use globals directly (`Page`, `ControlUtil`, `ObjectUtil`, `StringUtil`, `ArrayUtil`, `DateUtil`, `UserMessages`, `UrlUtil`, service namespaces, etc.); do not alias, shadow, or route them through wrapper config objects unless there is a concrete documented need in that file.
- Fail fast when required globals, services, or contract data are missing. Do not add `typeof` probes, existence checks, defensive fallbacks, or silent degradation to hide configuration problems.
- Call JsonWs stubs and generated async service methods directly. Do not add wrapper service classes, callback shims, or compatibility layers around them when the authoritative async method already exists.
- Prefer native generated async methods such as `MethodAsync` or `MethodObjectAsync` over `ObjectUtil.Promisify(...)` when the async form already exists.
- Use existing portal helpers for DOM and form work: `_$(...)`, `$$(...)`, `BlindBind(...)`, `BlindUnbind(...)`, `ControlUtil.*`, and related shared modules.
- Do not bypass the project’s DOM/network abstractions with native browser APIs when an established project utility already owns that behavior.
- Use shared `...Util` helpers when they exist instead of ad-hoc native equivalents for string, object, array, date, storage, and control behavior.
- Reuse shared modules under `wwwroot/js/kcs` instead of duplicating portal behavior locally.
- Preserve generated-file safety rules. Do not edit generated artifacts directly; use the supported extension point (`*2` files, `redefinefunction`, partials, or generator/template changes) instead.
- For kScript, treat generated artifacts such as `references-generated.ks` and generated base `.ks.html` files as read-only. Put changes in companion `*2.ks.html` files and use supported overrides.
- If no safe extension point exists for a generated asset, stop and surface that the generator/template likely needs to be updated instead of patching output directly.
- Keep code direct, readable, and simple. Avoid unnecessary abstractions, speculative helper layers, or wrapper-over-wrapper mapping.
- Preserve one authoritative contract shape across server code, JsonWs stubs, JavaScript, and kScript. Reject compatibility parsing, alternate casing support, duplicate aliases, and fallback readers for malformed payloads.
- Ensure invalid required inputs fail loudly instead of being silently normalized, defaulted, or guessed.
- Do not add environment-probing wrappers or alternate dependency-resolution paths for globals or services.
- Route unexpected errors to the established page error handling path instead of inventing one-off error sinks.
- Prefer existing page lifecycle, modal, tab, grid, and message helpers from shared modules over bespoke implementations.
- Look for dead code paths, duplicate helper logic, redundant service wrappers, and page-specific utilities that should collapse to an existing owner.
- Reject compatibility shims that only preserve an obsolete call pattern; update callers to the authoritative API instead.
- Preserve repository review workflow discipline: keep changes scoped, avoid unrelated edits, and follow existing local conventions before introducing new patterns.
- After approved code changes, validate with the repository’s normal build path using serial builds when applicable, and commit only the intentionally changed files.

### Auto-Approval Rules

Unless the user explicitly says otherwise, the following categories are pre-approved and should be fixed automatically without asking for approval first.

Apply the change, validate through the touched project’s normal serial build path when applicable, and commit the change set.

Do not stop to ask for approval for these categories.

#### 1. Mechanical Cleanup

Auto-approve `Mechanical cleanup` changes when they do not alter:

- external contracts
- persisted shapes
- JsonWs method names
- generated stub signatures
- user-visible behavior

Examples:

- remove dead code and unused private helpers
- remove redundant wrapper variables or pass-through helper functions
- replace bespoke helper logic with an existing shared utility that preserves behavior
- remove native DOM/query/string helpers when the project’s established utility already owns that behavior
- remove stale internal aliases for globals or services

#### 2. Boundary Hardening For Already-Required Values

Auto-approve `Boundary hardening` changes when they only make an already-required contract fail fast instead of silently coercing.

Examples:

- remove silent defaults for required request or response fields
- remove fallback parsing, alternate casing, or alias handling for internal payloads
- remove defensive existence checks around required globals or generated stubs
- replace optional-looking handling for already-required values with explicit failure

Guardrail:

- if old persisted data, external callers, or an intentionally preserved UI boundary are known to depend on the coercion, do not auto-apply; surface it for approval

#### 3. One-Owner Consolidation

Auto-approve consolidation when multiple internal JavaScript or kScript paths implement the same behavior and one clear owner already exists.

Examples:

- delete duplicate page helpers and reuse the shared `js/kcs` module
- collapse wrapper-over-wrapper service calls to the authoritative generated async method
- replace custom form binding logic with `BlindBind` or `BlindUnbind` when behavior is equivalent

Guardrail:

- if consolidation changes sequencing, error surfacing, or visible UI behavior in a way that could matter to users, ask first

#### 4. Internal Naming Alignment To The Authoritative Contract

Auto-approve internal naming cleanup when the public contract is already settled and the change does not rename a public boundary.

Examples:

- align local variable names and comments to the authoritative contract field names
- remove stale legacy wording once the actual server/client contract has already been migrated
- rename internal helpers to match the canonical owner without changing the public method or payload shape

Guardrail:

- if the rename changes a JsonWs surface, generated stub name, persisted field name, query parameter, or HTML contract consumed externally, ask first

#### 5. Adjacent Required Cleanup

Auto-approve adjacent low-impact cleanup that is directly required by an approved or auto-approved change.

Examples:

- remove now-unused locals after deleting wrapper logic
- update nearby comments or docs that directly describe the changed behavior
- adjust directly affected page wiring after collapsing to the authoritative helper

Guardrail:

- keep edits limited to files directly required by the change set

#### 6. Validation And Commit Behavior

For auto-approved changes:

- validate using the touched project’s normal build path when applicable
- prefer serial builds or serial validation flows for repository consistency
- commit automatically after each completed change set
- stage only intentionally modified files
- ignore unrelated working tree changes

Do not run tests unless the user explicitly asks.

#### 9. Local Storage

Use the shared local-storage wrapper instead of custom serialization helpers.

Good:

```javascript
var storage = new LocalStorage2();
storage.set("PatientSearch.Filters", oFilters);
```

Good:

```javascript
var storage = new LocalStorage2();
var oSaved = storage.get("PatientSearch.Filters");
if (ObjectUtil.HasValue(oSaved)) {
	BlindBind(_$("divSearch"), oSaved);
}
```

Bad:

```javascript
window.localStorage.setItem("PatientSearch.Filters", JSON.stringify(oFilters));
```

Bad:

```javascript
var oSaved = JSON.parse(window.localStorage.getItem("PatientSearch.Filters") || "{}");
```

Review rule:

- use `LocalStorage2` when the repository already uses it for the same kind of state
- avoid scattering raw JSON serialization and parsing patterns across pages

#### 10. Validation

Use the shared validators when they already express the intended rule.

Good:

```javascript
var oRules = {
	Name: { Label: "Name", Validators: [Validators.Required] },
	Email: { Label: "Email", Validators: [Validators.Required, Validators.Email] }
};
```

Bad:

```javascript
if (!email || email.length < 5 || email.indexOf("@") === -1) {
	throw new Error("Invalid email");
}
```

Review rule:

- prefer `Validators.*` and the project’s validation flow when the page is already participating in that model
- do not duplicate validation semantics with page-local regex or one-off conditional trees unless the rule is truly new and belongs in the page

#### 11. Contract Shape And PascalCase Enforcement

Server-side contract names are authoritative.

Good:

```javascript
var oPayload = {
	AgentID: iAgentID,
	AgentName: strAgentName,
	DisplayName: strDisplayName
};
```

Bad:

```javascript
var oPayload = {
	agentId: iAgentID,
	agentName: strAgentName,
	displayName: strDisplayName
};
```

Bad:

```javascript
var strName = oAgent.AgentName || oAgent.agentName || "";
```

Good:

```javascript
var strName = oAgent.AgentName;
```

Review rule:

- do not add camelCase fallbacks, alternate spellings, or alias readers for server-owned payloads
- if the server says `AgentName`, then browser code should read and write `AgentName`
- emCall guidance is especially explicit on this point: browser code must preserve PascalCase property names exactly

#### 12. kScript Extension Patterns

kScript changes must respect the project’s template and override model.

Good:

```html
<%using SimpleObjectEdit.ks.html%>
<%using AgentsAdmin.ks.html%>

<%SimpleObjectEditPage.MetadataFile Agents.Meta.json%>

<%redefinefunction SimpleObjectEditPage.Object
{
	(return (Agents.GetAgent (ObjectID)))
}%>
```

Good:

```html
<%redefinefunction SimplePage.BottomScripts
{
		(returnex{%>
<script type="text/javascript" src="/js/incoming_patient_call_agent.js?v=<%JsVersion%>"></script>
		<%})
}%>
```

Bad:

- patching generated base templates directly when a `*2.ks.html` or `redefinefunction` extension point exists
- duplicating a whole page template just to change one panel or one script section
- introducing local one-off composition conventions that ignore the existing shared page classes

Review rule:

- prefer `using`, metadata wiring, and `redefinefunction` over template duplication
- keep overrides scoped to the specific panel/function being changed
- if a generated page has a supported extension point, use it instead of editing generated output

#### 13. Generated File Safety

This is a hard-stop rule.

Do not edit generated files.

Examples of expected review outcomes:

- `FairPath.Data/<Object>.cs` is generated -> changes belong in `<Object>2.cs`
- `FairPath.Business/<Object>.cs` is generated -> changes belong in `<Object>2.cs`
- `FairPath.Portal.Admin.UI/<Object>Admin.cs` is generated -> changes belong in `<Object>Admin2.cs`
- generated base `.ks.html` and generated kScript artifacts are read-only -> changes belong in supported companion files or overrides

Bad:

- “quick fix” edits directly in generated output
- copying generated output into a new bespoke file instead of using the project’s extension point

Good:

- use `*2` files, partials, `redefinefunction`, or generator/template changes

If no safe extension point exists, the review should stop and explicitly surface that the generator or shared template likely needs to change.

### Shared Module Review Guidance

#### `moremoo4.js` / Core Utility Surface

When reviewing code that overlaps with these utilities:

- prefer the existing `ControlUtil`, `ObjectUtil`, `StringUtil`, `ArrayUtil`, and related helpers
- do not create page-local versions of behavior already provided there
- be careful about introducing “modern” replacements that break repository expectations
- preserve compatibility only where the shared owner already intentionally owns it

Review smell examples:

- new local helper that duplicates `ObjectUtil.HasValue`
- page-local GUID generation when `StringUtil.GenerateGUID()` is already the expected owner
- direct DOM/class/value logic that duplicates `ControlUtil`

#### `JsonMethod.js`

When reviewing callback-based JsonWs flows:

- keep requests routed through `JsonMethod` where that is the established pattern
- preserve session-expiry and error handling behavior owned by `JsonMethod`
- do not replace standard request plumbing with ad-hoc `fetch(...)` unless the local subsystem already owns that move
- do not duplicate error translation logic that `JsonMethod` already provides

Review smell examples:

- page-local XHR/fetch wrapper for a standard JsonWs endpoint
- custom retry/session-expiry flow in a page that should be using the standard request path
- callback wrapping whose only purpose is to obscure the actual JsonWs call

#### `MasterPage.js`

When reviewing shared page behavior:

- prefer `Page.AddOnLoad`, `BindJsToCss`, `SetupInputs`, and related shared bootstrapping
- reuse shared modal/tab/collapsible behavior instead of building per-page clones
- after injecting dynamic HTML, look for whether the page should be calling the standard rebinding helper

Review smell examples:

- dynamic HTML injection without rebinding shared page helpers when required
- local implementations of tab persistence instead of using the page’s tab registry behavior
- a page-level message container pattern that bypasses the established bootstrapping path

#### `grid4.js` And `gridselector.js`

When reviewing grids:

- prefer the standard grid/search/count/selection workflow
- avoid local grid state engines unless the page truly has non-standard requirements
- preserve established row selection and count update behavior when the page already uses `GridSelector`

#### `UserMessages.js`

When reviewing notifications:

- keep message display centralized
- prefer save/display patterns that work across redirects when the existing flow needs it
- avoid introducing new toast abstractions that fragment UX behavior

#### `validators.js` And `form_validation.js`

When reviewing input cleaning and validation:

- prefer the shared validators and formatting helpers when the page uses the standard input model
- avoid page-local formatting logic for money, integers, dates, ZIP codes, phones, and similar values when shared helpers already own those transforms
- be careful not to create validation logic that drifts from the repository’s existing semantics

### kScript-Specific Review Guidance

When reviewing `*.ks.html` files, check these items explicitly:

- Is the page using the correct shared page/template file via `<%using ...%>`?
- Is the metadata file wired through the expected page class property?
- Is the change using `redefinefunction` to override only the needed section?
- Is the HTML shape following the surrounding page conventions?
- Are field names still aligned to the authoritative server contract?
- Is the change editing generated output directly instead of using a supported extension point?
- Is JavaScript embedded in the kScript page still following the normal JS rules from this guide?

Good review targets from real patterns include:

- `SimpleObjectEditPage.Object`
- `SimpleObjectEditPage.EditPanel`
- `SimplePage.BottomScripts`
- metadata file assignments such as `Agents.Meta.json`
- scoped UI overrides instead of wholesale page duplication

Bad review patterns include:

- replacing the whole page when only one section needed override
- introducing custom script/bootstrap patterns that ignore shared page lifecycle behavior
- mixing contract-shape cleanup with large template restructuring in one risky change

### DOM, Binding, And Form Patterns

This portal already has strong patterns for control access and data binding. Reviewers should prefer those patterns over native browser calls or bespoke bind/unbind helpers.

#### Preferred DOM and binding tools

- `_$(...)` for single control access
- `$$(...)` for selector-based lists
- `ControlUtil.GetValue(...)` and `.SetValue(...)`
- `BlindBind(...)` to write object state into UI
- `BlindUnbind(...)` to read UI state into an object
- `BindJsToCss(...)` and `SetupInputs(...)` after injecting markup

#### Good vs Bad: DOM access

Bad:

```javascript
const saveButton = document.getElementById("btnSave");
saveButton.addEventListener("click", savePatient);
```

Good:

```javascript
ControlUtil.AddClick(_$("btnSave"), savePatient);
```

Why the good version is preferred:

- stays consistent with project conventions
- benefits from shared control wrappers
- avoids mixing native patterns into a utility-owned codebase

#### Good vs Bad: query selection

Bad:

```javascript
document.querySelectorAll(".form-control").forEach(function (el) {
	el.classList.remove("Hidden");
});
```

Good:

```javascript
$$(".form-control").forEach(function (el) {
	ControlUtil.RemoveClass(el, "Hidden");
});
```

#### Good vs Bad: manual form assembly

Bad:

```javascript
const model = {
	AgentName: _$("txtAgentName").getValue(),
	Role: _$("ddlRole").getValue(),
	Description: _$("txtDescription").getValue()
};
```

Good:

```javascript
const model = BlindUnbind(_$("divAgent"));
```

Use manual assembly only when there is a real reason. If the form is already structured for `BlindUnbind(...)`, prefer the established binding contract.

#### Good vs Bad: writing form state

Bad:

```javascript
_$("txtAgentName").setValue(agent.AgentName);
_$("txtDescription").setValue(agent.Description);
_$("ddlRole").setValue(agent.Role);
```

Good:

```javascript
BlindBind(_$("divAgent"), agent);
```

### Validation, Formatting, And Messaging

Validation and user messaging should use shared owners, not page-local reinventions.

Preferred shared owners:

- `Validators.*`
- `form_validation.js` functions such as `StringToPhone`, `StringToMoney`, `CleanInt`, `CleanDouble`
- `UserMessages.DisplayNow(...)`, `Display(...)`, and `Save()`

#### Good vs Bad: ad-hoc validation

Bad:

```javascript
if (!email || email.indexOf("@") === -1) {
	alert("Invalid email");
	return;
}
```

Good:

```javascript
if (!Validators.Email(email)) {
	UserMessages.DisplayNow("Invalid email", "Error");
	return;
}
```

#### Good vs Bad: one-off message handling

Bad:

```javascript
alert("Settings saved.");
```

Good:

```javascript
UserMessages.DisplayNow("Settings saved.", "Success");
```

#### Good vs Bad: duplicate sanitization helpers

Bad:

```javascript
function cleanPhone(value) {
	return (value || "").replace(/[^0-9]/g, "");
}
```

Good:

```javascript
const phone = StringToPhone(_$("txtPhone").getValue());
```

Review rule:

- if a `Validators` or formatting helper already exists, use it
- if a page invents a mini-helper for something already covered in `js/kcs`, that is usually cleanup debt

### Page Lifecycle, Errors, Tabs, And Local Storage

Shared page infrastructure already exists. Use it.

#### Good vs Bad: page lifecycle

Bad:

```javascript
window.onload = function () {
	initializePage();
};
```

Good:

```javascript
Page.AddOnLoad(function () {
	initializePage();
});
```

#### Good vs Bad: error handling

Bad:

```javascript
try {
	await saveSettings();
} catch (err) {
	console.error(err);
}
```

Good:

```javascript
try {
	await saveSettings();
} catch (err) {
	Page.HandleUnexpectedError(err);
}
```

#### Good vs Bad: storage wrappers

Bad:

```javascript
window.localStorage.setItem("AgentFilters", JSON.stringify(filters));
```

Good:

```javascript
new LocalStorage2().set("AgentFilters", filters);
```

#### Good vs Bad: tab persistence

Bad:

```javascript
sessionStorage.setItem("ActiveTab", tabName);
```

Good:

```javascript
Page.Tabs.SaveTab(tabName);
```

Use project-owned tab or storage helpers when they already exist. Do not create a second persistence convention inside one page.

### Grid, Ajax, And Dynamic Content Patterns

The portal already has grid infrastructure and dynamic-content hooks. Reviewers should prefer extending those patterns instead of rebuilding them.

Important shared owners include:

- `JsonMethod`
- `JsonWsGrid3`
- `GridSelector`
- `BindJsToCss(...)`
- `SetupInputs(...)`
- `UserMessages`

#### Good vs Bad: Ajax calls

Bad:

```javascript
const response = await fetch("/Patients.aspx/Save", {
	method: "POST",
	body: JSON.stringify(payload)
});
```

Good:

```javascript
JsonMethod.call("/Patients.aspx", "Save", payload, function (result) {
	UserMessages.DisplayNow(result.Message, "Success");
});
```

Review rule:

- if the page is already in the JsonWs/JsonMethod ecosystem, stay in it
- do not introduce fetch/XHR side paths unless the feature truly requires it

#### Good vs Bad: post-insert markup wiring

Bad:

```javascript
_$("previewHost").setHtml(html);
initializeInputsAgain();
```

Good:

```javascript
_$("previewHost").setHtml(html);
BindJsToCss("previewHost");
```

#### Good vs Bad: custom grid replacement

Bad:

```javascript
function loadRows() {
	// page-local paging, sorting, and row rendering logic
}
```

Good:

```javascript
const grid = new JsonWsGrid3();
grid.JsonWsUrl = "/JsonWs/Patients.ashx";
grid.JsonWsGridMethod = "List";
grid.JsonWsCountMethod = "Count";
grid.ContentControlID = "patientRows";
grid.PagingControlID = "patientPager";
grid.Refresh();
```

#### Good vs Bad: selection behavior

Bad:

```javascript
const selectedIds = [];
// page-local row selection and toggle logic
```

Good:

```javascript
const selector = new GridSelector(patientGrid);
selector.addEvent('rowselected', function () {
	_$("btnArchive").setDisabled(selector.GetSelected().length === 0);
});
```

Review rule:

- prefer extending shared grid and selector machinery instead of cloning it per page

### kScript Review Rules

kScript should follow the same review discipline as JavaScript: thin orchestration, reuse of existing base pages, strong respect for generated boundaries, and small local overrides.

#### kScript owner and extension rules

- generated base `.ks.html` files are read-only unless the generator/template itself is the task
- use `*2.ks.html` companions for extension logic
- use `redefinefunction` for targeted overrides
- prefer composition with existing `SimpleObject*` page patterns before inventing new layouts
- keep server-shaped names exactly as defined

#### Good vs Bad: generated-file editing

Bad:

```html
<!-- editing a generated base file directly for a quick fix -->
<%function SimpleObjectEditPage.Object
{
	(return (Agents.GetAgent (ObjectID)))
}%>
```

Good:

```html
<%redefinefunction SimpleObjectEditPage.Object
{
	(return (Agents.GetAgent (ObjectID)))
}%>
```

inside the supported override file.

#### Good vs Bad: extension-point discipline

Bad:

- patching a generated output file because it is faster
- copying the entire base page into a new file to change one panel

Good:

- redefining only the necessary function
- using `AgentsAdmin2.ks.html` or another `*2` companion when the pattern already exists

#### Good vs Bad: kScript page structure

Bad:

```html
<%using Simple.ks.html%>
<!-- full bespoke page created where an existing object/details/edit pattern already fits -->
```

Good:

```html
<%using SimpleObjectEdit.ks.html%>
<%using AgentsAdmin.ks.html%>
<%SimpleObjectEditPage.MetadataFile Agents.Meta.json%>
```

Why the good version is preferred:

- it keeps the page inside the standard object-page framework
- it reduces duplicated page plumbing
- it preserves the established admin UI patterns


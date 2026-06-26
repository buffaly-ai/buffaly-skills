# Expose A C# Class To ProtoScript

Goal
- Expose an existing C# class into OpsAgent ProtoScript using the canonical thin-wrapper pattern.
- Keep ProtoScript as a stub layer only.

When To Use This
- User wants to expose an existing public C# class to ProtoScript.
- User wants class methods available as direct ProtoScript actions.
- User wants cleaner class-based .pts organization instead of large mixed Actions.pts files.

Mandatory Rules
1. One C# class => one .pts file
- Name the file exactly after the class name.
- Examples:
  - Applications.pts
  - ProjectsAdmin.pts
  - Organizations.pts

2. Categorize by class type
- Business class pattern:
  - Domain.Business.ClassName
- UI/admin class pattern:
  - Domain.UI.ClassNameAdmin
- Focus on business classes first unless the user explicitly asks for UI/admin wrappers.
- When both business and admin surfaces exist for the same domain, prefer exposing business methods first.
- Only expose UI/admin methods when the user explicitly needs presentation behavior, legacy compatibility, or an existing admin surface.

3. Prototype naming
- Use ClassName_MethodName.
- Examples:
  - Applications_GetAll
  - Applications_InsertApplication
  - ProjectsAdmin_GetDetails

4. Wrapper behavior must stay thin
- Do not add ProtoScript-side business logic.
- Do not add error checking unless the wrapper exists solely to initialize shared runtime state.
- Do not change the return value.
- Do not change the return type.
- Do not reshape output into summary strings when the C# method already returns a native value.
- Do not fold adapter or formatter behavior into the direct class exposure wrapper.

5. Expose the most useful public static methods first
- Prefer methods already stable and commonly needed.
- Prefer methods with deterministic signatures and returns.

6. Keep initialization separate from class exposure
- If runtime setup is required, use one shared initialization helper.
- Do not bury extra setup logic inside each wrapper beyond the required shared initializer call.

7. Verify runtime wiring before and after class exposure
- Add or verify DLL references in Imports.pts.
- Add imports in the owning skill index.pts.
- Verify any runtime-specific index/includes are correct.
- Verify any required shared initializer helper exists and is referenced consistently.
- Compile after each coherent class batch to catch import/include drift early.

8. Preserve endpoint intent by class type
- Business wrappers are data-tier wrappers.
- Preserve native typed outputs such as rows, tables, ints, and Prototype where required by the C# method.
- Avoid stringification for business wrappers unless the underlying C# signature already requires it.
- UI/admin wrappers are presentation-tier wrappers by default.
- If the underlying UI/admin method returns string/HTML/count text, preserve that output shape for the direct wrapper.
- If a wrapper returns HTML, set the prototype `Format` property to `html` so downstream consumers handle it correctly.

9. Add separate adapter actions only at boundaries
- Direct class exposure wrappers must remain thin and unchanged.
- If orchestration needs typed or normalized output from string-heavy or Prototype-heavy methods, add separate adapter/projection actions with separate names.
- Keep adapters outside the direct class wrapper file behavior contract.

Implementation Workflow
1. Identify the target C# class.
2. Decide whether it is a business class or a UI/admin class.
3. Add or verify DLL references in Imports.pts.
4. Add imports in the owning skill index.pts.
5. Verify runtime-specific index/include wiring and any shared initializer helper.
6. Create ClassName.pts.
7. Add one thin wrapper prototype per useful public static method.
8. Add strong infinitive phrases and a description that explicitly says the wrapper is thin.
9. If the wrapper returns HTML, set `Format = "html"` on the prototype.
10. Include the new ClassName.pts file from the skill index.pts.
11. Compile and test.

Description Pattern
- State that the action is a thin wrapper over the exact C# static method.
- Briefly document the parameters.
- State the native return type.
- Label endpoint intent clearly as typed data wrapper, prototype/native wrapper, or presentation/html wrapper.
- Explicitly say there is no ProtoScript-side validation or reshaping.

Business Class Example
`pts
[SemanticProgram.InfinitivePhrase("to get all metabase applications")]
[SemanticProgram.InfinitivePhrase("to list roottrax vdb applications")]
prototype Applications_GetAll : MetabaseSkillAction
{
	Description = @"Thin wrapper over RooTrax.VDB.Applications.GetAll().
Returns native ApplicationsDataTable with no ProtoScript-side validation or reshaping.
This is a typed data wrapper.";

	function Execute() : ApplicationsDataTable
	{
		ToEnsureRootTraxVdbConnection();
		return Applications.GetAll();
	}
}

[SemanticProgram.InfinitivePhrase("to insert a metabase application")]
[SemanticProgram.InfinitivePhrase("to create a roottrax vdb application row")]
prototype Applications_InsertApplication : MetabaseSkillAction
{
	Description = @"Thin wrapper over RooTrax.VDB.Applications.InsertApplication(applicationName, data).
applicationName - passed directly to C#.
data - passed directly to C#.
Returns native int application id with no ProtoScript-side validation or reshaping.
This is a typed data wrapper.";

	function Execute(string applicationName, string data) : int
	{
		ToEnsureRootTraxVdbConnection();
		return Applications.InsertApplication(applicationName, data);
	}
}
`

UI/Admin Class Example
`pts
[SemanticProgram.InfinitivePhrase("to get roottrax metabase project details html")]
[SemanticProgram.InfinitivePhrase("to render projects admin details html")]
prototype ProjectsAdmin_GetDetails : MetabaseSkillAction
{
	Format = "html";
	Description = @"Thin wrapper over RooTrax.VDB.UI.ProjectsAdmin.GetDetails(ProjectID).
projectId - passed directly as string.
Returns raw string html with no ProtoScript-side validation or reshaping.
This is a presentation/html wrapper.";

	function Execute(string projectId) : string
	{
		ToEnsureRootTraxVdbConnection();
		return ProjectsAdmin.GetDetails(projectId);
	}
}
`

Anti-Patterns
- Do not dump unrelated class wrappers into one large Actions.pts file.
- Do not rename direct class exposures into vague ToDoSomething prototypes.
- Do not add fallback heuristics or output formatting in ProtoScript.
- Do not convert native tables/rows/ints into summary strings for class-exposure wrappers.
- Do not use UI/admin HTML wrappers as if they are typed orchestration contracts.
- Do not embed adapter/projection logic inside direct class exposure wrappers.

Checklist
- File name matches class name.
- Prototype names follow ClassName_MethodName.
- Wrapper is thin.
- Return type is preserved.
- Return value is preserved.
- Business logic remains in C#.
- Runtime wiring/imports/includes are verified.
- HTML-returning wrappers set `Format = "html"` on the prototype.
- New file is included from the skill index.pts.
- Project compiles cleanly.

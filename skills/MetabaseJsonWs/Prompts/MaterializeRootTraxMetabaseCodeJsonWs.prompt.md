# Materialize RootTrax Metabase code artifacts using JSONWS/JSL1

Use this prompt after object/database materialization when the user wants stored procedures, repository classes, business layer, JsonWs classes, UI, kScript pages, and default admin KS generated through Metabase JSONWS.

## Preferred actions

Stored procedures / methods / repository / JsonWs class:
- `MetabaseObjectMethods_InferBasicMethods`
- `MetabaseObjectMethods_GenerateAllMethods`
- `MetabaseObjectMethods_GenerateRepositoryFromSchemaWithRelationships`
- `MetabaseObjectMethods_GenerateJsonWsFromSchema`

Feature/project materialization:
- `MetabaseFeatures_ImplementRepositoriesIntoProject`
- `MetabaseFeatures_ImplementBusinessIntoProject`
- `MetabaseFeatures_ImplementFeatureUIIntoProject`
- `MetabaseFeatures_ImplementKScriptPagesIntoProject`
- `MetabaseFeatures_ImplementDefaultAdminKsIntoProject`
- `MetabaseFeatures_ImplementObjectUIIntoProject`

## Researched UI sequence

Metabase UI source: `C:\dev\RooTrax\RooTrax.Utilities\Metabase\wwwroot\kScripts\Objects\Object.Methods.ks.html`.

The object methods page calls:
- `ObjectMethods.InferBasicMethodsObject(oData)`
- `ObjectMethods.GenerateAllMethodsObject(oData)`
- `ObjectMethods.GenerateRepositoryFromSchemaWithRelationshipsObject(oData)`
- `ObjectMethods.GenerateJsonWsFromSchemaObject(oData)`

The object details page calls:
- `Features.ImplementObjectUIIntoProject(ObjectID, ProjectID)`

The feature actions expose:
- `ImplementRepositoriesIntoProject`
- `ImplementBusinessIntoProject`
- `ImplementFeatureIntoProject2` for UI
- `ImplementkScriptPagesIntoProject`
- `ImplementDefaultAdminKsIntoProject`

## Workflow

1. Confirm context:
   - `ObjectID`, `ProjectID`, optional `FeatureID`.
   - Project connection/output directories from `MetabaseProjects_GetProject`.
2. Infer methods:
   - Call `MetabaseObjectMethods_InferBasicMethods(service, ObjectID, ProjectID)`.
3. Generate stored procedures:
   - Call `MetabaseObjectMethods_GenerateAllMethods(service, ObjectID, ConnectionName, WriteToDirectory)`.
4. Generate repository:
   - Call `MetabaseObjectMethods_GenerateRepositoryFromSchemaWithRelationships(service, ObjectID, Namespace, ConnectionName, WriteToFile, StandardProcs)`.
5. Generate JsonWs class:
   - Call `MetabaseObjectMethods_GenerateJsonWsFromSchema(service, ObjectID, Dataset, Namespace, WriteToFile, JsonWsDirectory)`.
6. Materialize feature/project layers when operating at feature scope:
   - Repositories: `MetabaseFeatures_ImplementRepositoriesIntoProject`.
   - Business layer: `MetabaseFeatures_ImplementBusinessIntoProject`.
   - UI: `MetabaseFeatures_ImplementFeatureUIIntoProject`.
   - kScript pages: `MetabaseFeatures_ImplementKScriptPagesIntoProject`.
   - Default admin KS: `MetabaseFeatures_ImplementDefaultAdminKsIntoProject`.
7. Materialize object UI when operating at object scope:
   - `MetabaseFeatures_ImplementObjectUIIntoProject(service, ObjectID, ProjectID)`.
8. Validate:
   - Build target project if applicable.
   - Verify generated files exist in expected directories.
   - Generate/update JS stubs if the target portal requires it.

## Output contract

Return:
1. Context binding.
2. Ordered generation calls performed or proposed.
3. File/database targets.
4. Validation results.
5. Any manual follow-up required, such as JS stub generation or build/test.

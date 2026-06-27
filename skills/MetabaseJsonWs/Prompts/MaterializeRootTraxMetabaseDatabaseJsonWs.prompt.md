# Materialize a RootTrax Metabase object database using JSONWS/JSL1

Use this prompt when the object model is ready and the user wants the database/table/data layer materialized through Metabase JSONWS.

## Preferred actions

- `MetabaseProjects_GetProjects`
- `MetabaseProjects_GetProject`
- `MetabaseObjects_GetObject`
- `MetabaseProperties_GetPropertiesByObjectID`
- `MetabaseObjects_UpdateDefaultProjectID`
- `MetabaseFeatures_GetFeatureByFeatureName`
- `MetabaseFeatures_InsertFeature`
- `MetabaseProjectFeatures_InsertProjectFeature`
- `MetabaseFeatureObjects_InsertFeatureObject`
- `MetabaseFeatures_ImplementObjectIntoProjectDatabase`
- `MetabaseFeatures_ImplementFeatureIntoProjectDatabase`

## Researched UI sequence

Metabase UI source: `C:\dev\RooTrax\RooTrax.Utilities\Metabase\wwwroot\kScripts\Objects\Object.Details.ks.html`.

The object details page "Implement Data" button calls:

`Features.ImplementObjectIntoProjectDatabase(iObjectID, oProject.ProjectID, callback)`

The same page uses project context from the object's default project dropdown and can call:

`Objects.UpdateDefaultProjectID(iObjectID, iProjectID, callback)`

## Workflow

1. Bind project context:
   - Call `MetabaseProjects_GetProjects` or `MetabaseProjects_GetProject`.
   - Verify `ProjectID`, database handle/connection, output directories, and JsonWs/kScript directories.
2. Bind object context:
   - Call `MetabaseObjects_GetObject`.
   - Call `MetabaseProperties_GetPropertiesByObjectID`.
   - Confirm required ID/foreign key/domain properties exist.
3. Set default project if needed:
   - Call `MetabaseObjects_UpdateDefaultProjectID(service, ObjectID, ProjectID)`.
4. Materialize one object into project database:
   - Call `MetabaseFeatures_ImplementObjectIntoProjectDatabase(service, ObjectID, ProjectID)`.
5. If operating through Feature context:
   - Ensure/get feature using `MetabaseFeatures_GetFeatureByFeatureName` or `MetabaseFeatures_InsertFeature`.
   - Link project-feature via `MetabaseProjectFeatures_InsertProjectFeature` if missing.
   - Link feature-object via `MetabaseFeatureObjects_InsertFeatureObject` if missing.
   - Call `MetabaseFeatures_ImplementFeatureIntoProjectDatabase(service, FeatureID, ProjectID)`.
6. Validate:
   - Use SQL read-only validation or project-specific checks to confirm table/schema artifacts exist.
   - Do not hand-edit generated SQL as the default path.

## Output contract

Return:
1. Project binding and database/connection target.
2. Object/property readiness summary.
3. Default project update result if used.
4. Materialization call result.
5. Validation evidence.
6. Next step: generate methods/procs/repository/JsonWs/kScript.

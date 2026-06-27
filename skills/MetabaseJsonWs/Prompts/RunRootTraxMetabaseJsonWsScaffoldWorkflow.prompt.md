# End-to-end RootTrax Metabase JSONWS/JSL1 scaffold workflow

Use this prompt when the user asks to create and materialize a Metabase object from description through generated database/code/UI artifacts.

## Policy

Moving forward, prefer `MetabaseJsonWs` for Metabase skill work. Use `MetabaseRuntime` only when the user explicitly requests the DLL runtime path or a JSONWS endpoint is unavailable.

Do not hand-author tables, stored procedures, repositories, business classes, JsonWs classes, UI, or kScript as the default path. Use Metabase JSONWS actions and validate generated artifacts.

## Required phases

### Phase 1: Context binding

Actions:
- `MetabaseApplications_GetAll`
- `MetabaseProjects_GetProjects`
- `MetabaseDatabases_GetDatabases`
- `MetabaseObjects_GetAll`

Bind:
- `ApplicationID`
- `ProjectID`
- database/connection handles
- target object name and whether it already exists

### Phase 2: Object design

Use `MetabaseRuntime/Prompts/NLtoObjectSpec.md` as the modeling rubric if translating natural language into an object definition.

Actions:
- `MetabaseObjectDefinitionLoader_UpsertObject` for complete object-definition JSON when available.
- Or `MetabaseObjects_InsertObject` followed by `MetabaseProperties_InsertProperty` for manual JSL1 step-by-step creation.

Always validate with:
- `MetabaseObjects_GetObject`
- `MetabaseProperties_GetPropertiesByObjectID`

### Phase 3: Add/update properties

Actions:
- `MetabaseProperties_InsertProperty`
- `MetabaseProperties_UpdateProperty`
- `MetabaseProperties_GetPropertiesByObjectID`

Validate all field names, friendly names, type IDs, nullability, uniqueness, natural key flags, and foreign key naming.

### Phase 4: Link feature/project context when needed

Actions:
- `MetabaseFeatures_GetFeatureByFeatureName`
- `MetabaseFeatures_InsertFeature`
- `MetabaseProjectFeatures_InsertProjectFeature`
- `MetabaseFeatureObjects_InsertFeatureObject`
- `MetabaseObjects_UpdateDefaultProjectID`

### Phase 5: Materialize database/data layer

Actions:
- Object scope: `MetabaseFeatures_ImplementObjectIntoProjectDatabase`
- Feature scope: `MetabaseFeatures_ImplementFeatureIntoProjectDatabase`

Validate with read-only SQL/project checks.

### Phase 6: Generate methods, stored procedures, repository, JsonWs

Actions:
- `MetabaseObjectMethods_InferBasicMethods`
- `MetabaseObjectMethods_GenerateAllMethods`
- `MetabaseObjectMethods_GenerateRepositoryFromSchemaWithRelationships`
- `MetabaseObjectMethods_GenerateJsonWsFromSchema`

### Phase 7: Materialize business/UI/kScript/admin artifacts

Actions:
- `MetabaseFeatures_ImplementRepositoriesIntoProject`
- `MetabaseFeatures_ImplementBusinessIntoProject`
- `MetabaseFeatures_ImplementFeatureUIIntoProject`
- `MetabaseFeatures_ImplementKScriptPagesIntoProject`
- `MetabaseFeatures_ImplementDefaultAdminKsIntoProject`
- Object scope UI: `MetabaseFeatures_ImplementObjectUIIntoProject`

### Phase 8: Validate target application

- Build target solution/project where applicable.
- Verify generated files exist.
- Generate JS stubs if required by target portal.
- Run local UI smoke checks for add/list/view/update if requested.
- Commit generated target repo changes separately from skill package changes.

## Output contract

Return:
1. Bound application/project/database/object/feature IDs.
2. Object/property design summary.
3. Actions executed or proposed in order.
4. Generated database/code/UI artifacts expected.
5. Validation evidence.
6. Risks, blockers, and next exact action.

# Metabase Runtime Skill

Metabase Runtime is a DLL-backed OpsAgent ProtoScript skill for RootTrax Metabase model and generation workflows.

## What it includes

- `MetabaseRuntimeSkill` and `MetabaseRuntimeSkillAction` skill roots.
- Native RooTrax VDB action wrappers for applications, projects, features, objects, feature links, and generation/materialization workflows.
- Prompt runbooks for RootTrax Metabase planning, local launch, portal architecture, Mermaid artifacts, and local JSONWS inspection.
- Required runtime DLLs under `lib/`, including `RooTrax.VDB.*`, `RooTrax.SqlGenerator`, `RooTrax.Common.*`, `Buffaly.Data`, and SQL Server SMO dependencies.

## Runtime model

This is the Metabase **runtime** skill. It uses local DLL/native RooTrax APIs after initializing `RooTrax.VDB.MetabaseExecutionFacade`; it is not the route-based Metabase JSONWS skill.

Use this package when Buffaly needs to create or update RootTrax VDB applications/projects/features/objects or invoke Metabase generation/materialization through the local runtime.

## Important actions

- `ToEnsureRootTraxVdbApplication`
- `ToEnsureRootTraxVdbProject`
- `ToEnsureRootTraxVdbDatabaseMetadata`
- `ToEnsureRootTraxVdbFeature`
- `ToUpsertRootTraxVdbObjectDefinition`
- `ToImplementRootTraxVdbObjectIntoProjectDatabase`
- `ToImplementRootTraxVdbFeatureIntoProjectDatabase`
- `ToImplementRootTraxVdbRepositoriesIntoProject`
- `ToImplementRootTraxVdbBusinessIntoProject`
- `ToImplementRootTraxVdbFeatureUiIntoProject`
- `ToImplementRootTraxVdbKScriptPagesIntoProject`
- `ToImplementRootTraxVdbDefaultAdminKsIntoProject`

## Safety and setup

Installing this skill copies ProtoScript files and DLLs only. Generation actions may mutate local project databases or write generated repository/UI/kScript artifacts when executed. Keep this package non-default and load it only for explicit Metabase Runtime work.

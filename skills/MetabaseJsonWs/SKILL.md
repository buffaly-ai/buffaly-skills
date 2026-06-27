# Metabase JsonWs Skill

Metabase JsonWs is a JSL1 route-style OpsAgent ProtoScript skill for calling the RootTrax Metabase classic JSONWS endpoints.

## Runtime model

This package is separate from `MetabaseRuntime`:

- `MetabaseRuntime` uses local DLL/native RooTrax APIs.
- `MetabaseJsonWs` calls the Metabase web runtime at `/JsonWS/<service>.ashx` through `JsonWsHelper.CallJsonWsSecure`.

The default binding is `MetabaseJsonWsService#Localhost_5197`, matching the local HTTP fallback Metabase runbook.

## Included surfaces

- Applications: get/list/insert/update.
- Projects: get/list/insert/update and project lookup for object id.
- Objects: get/list/search/insert/update/copy/standard fields/default project.
- Properties: list by object, insert/update/remove, nullable/unique/natural-key flags.
- Features/materialization: feature lookup/insert/update, implement object into project database, implement object UI, implement feature database/repositories/business/UI/kScript/default admin KS.

## Safety

This is not default-installed. Several methods can mutate Metabase metadata, local databases, or generated project artifacts through the running Metabase host. Load and call it only for explicit Metabase JSONWS work.

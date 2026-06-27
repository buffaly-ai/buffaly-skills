# Metabase Skill Backlog

## P0 (Highest Priority)
- Add deterministic preflight checklist prompt output (required inputs, blockers, go/no-go).
- Add contract consistency checks across table schema, CRUD procedures, repository, and JsonWs.
- Add standard dry-run report format with dependency ordering and rollback notes.
- Add failure-mode planning paths for missing templates, naming collisions, and partial generation states.

## P1 (Important)
- Add prompt action for delta planning against an existing generated object set.
- Add prompt action for regeneration impact analysis (what will change and downstream effects).
- Add prompt action for release readiness verification (schema/procedure/repository/JsonWs parity).
- Add prompt action for environment-aware plan packaging (dev/staging/prod execution steps).

## P2 (Nice to Have)
- Add prompt action for reusable domain-specific scaffold recipes.
- Add prompt action for documentation bundle generation after successful scaffold runs.
- Add prompt action for post-generation cleanup and deprecation planning.
- Add prompt action for team handoff checklist generation.

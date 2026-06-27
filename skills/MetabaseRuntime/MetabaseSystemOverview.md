# Metabase System Overview

## Scope
This overview captures the Metabase-centered scaffolding workflow used by OpsAgent planning prompts. The goal is to generate and align data-layer artifacts through RooTrax Metabase, not by hand-authoring independent SQL/CRUD layers.

## Architecture Summary
- Planner surface: OpsAgent prompt actions in `Skills/MetabaseRuntime/PromptActions.pts`.
- Prompt implementation: operational markdown prompts in `Skills/MetabaseRuntime/Prompts/*.prompt.md`.
- Skill registration: `Skills/MetabaseRuntime/index.pts`, included from `Project.pts`.
- Upstream engine boundary: RooTrax Metabase runtime/templates under `C:\dev\RooTrax\RooTrax.Utilities\Metabase` (read-only for this skill context).

## Primary Workflow
1. Plan scope and target object graph (database, table, procedures, repository, JsonWs).
2. Discover existing artifacts and naming conventions before generation.
3. Produce a dry-run execution plan and ordered dependency map.
4. Execute through Metabase workflow entry points.
5. Validate generated outputs, contracts, and integration wiring.

## Typical Entry Points
- Database scaffolding plan.
- Table/schema plan.
- CRUD procedure plan.
- Repository generation plan.
- JsonWs generation plan.
- Safety/validation plan for preflight checks and rollback readiness.

## Templates and Conventions
- Follow canonical naming and folder conventions already defined by RooTrax Metabase templates.
- Keep one coherent contract path from schema to procedures to repository to JsonWs.
- Avoid duplicate mapping layers or ad-hoc compatibility branches.

## Practical Usage
- Start with a dry-run to expose gaps, collisions, and dependency order.
- Resolve naming/shape conflicts at the source contract level.
- Promote only after safety checks, output diff review, and dependency validation.

## Constraints
- Do not create DB/table/procedure/repository/JsonWs artifacts manually outside Metabase as the default path.
- Do not modify upstream Metabase framework files from this OpsAgent skill directory.

## Integration Points
- OpsAgent project include: `wwwroot/projects/OpsAgent/Project.pts`.
- Skill root: `wwwroot/projects/OpsAgent/Skills/MetabaseRuntime/index.pts`.
- Prompt action registry: `wwwroot/projects/OpsAgent/Skills/MetabaseRuntime/PromptActions.pts`.
- Operational prompts: `wwwroot/projects/OpsAgent/Skills/MetabaseRuntime/Prompts/`.


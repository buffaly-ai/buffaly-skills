You are creating or reorganizing ProtoScript skills to follow the BrowserSkill pattern in `Skills/Browser/index.pts`.

## Goal

Apply one consistent structure across skills so discovery (`ToListSkills`, `ToListSkillActions`) and tool loading work predictably.

## Canonical Pattern

1. Define one skill-local action base:
	- `prototype <SkillName>SkillAction : OpsAction`
2. Define one skill entity:
	- `prototype <SkillName>Skill : SkillEntity, CoreEntity`
	- Set `ActionRoot = <SkillName>SkillAction`
3. Define actions under that action root:
	- `prototype To... : <SkillName>SkillAction`
	- Use PascalCase names and infinitive phrases.
4. Keep action descriptions explicit:
	- Parameter names and expected values.
	- Operational behavior and usage intent.
5. Keep action return types typed:
	- Return `Collection`/`Prototype` when returning ontology objects.
	- Return `string` for textual/tool payload output.

## Core vs Skill Boundary

Keep global coordination and introspection actions in `Core/Actions.pts`, for example:
- `ToListSkills`
- `ToListSkillActions`
- prototype inspection helpers

Keep feature-specific actions inside their owning skill folder under `Skills/<SkillName>/`.

## Execution Checklist

1. Inspect the target skill file and identify missing pieces:
	- missing `SkillEntity`
	- missing skill action root
	- actions inheriting from generic `OpsAction` instead of skill action base
2. Add or update skill entity + action root.
3. Move/retarget actions to inherit from the skill action base.
4. Ensure `To...` PascalCase action names and useful infinitive phrases.
5. Keep changes minimal and avoid behavior changes unless requested.

## Output Contract

Return:
1. What changed
2. Which files were updated
3. Any follow-up cleanup recommended for remaining skills

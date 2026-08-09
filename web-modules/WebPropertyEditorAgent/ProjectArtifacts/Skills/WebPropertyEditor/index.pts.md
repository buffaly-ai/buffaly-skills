# WebPropertyEditor/index.pts Change History

## Explicit Skill And Agent Roots (2026-08-09)
- The agent profile retains its restricted `WebPropertyEditorAgentActionRoot`, while all 36 callable actions explicitly inherit both `WebPropertyEditorSkillAction` and `WebPropertyEditorAgentActionRoot`.
- This follows the established Action Learning pattern: skill ownership remains independently queryable, and runtime tool registration can enumerate each callable action directly beneath the restricted agent root.
- The self-contained skill now declares the restricted action and entity roots it requires. This allows both the global generated skill index and the Core Lite profile to compile the same skill without depending on profile-local declarations.

## Core Lite Skill Ownership (2026-08-08)
- Added `WebPropertyEditorSkill : SkillEntity` with `WebPropertyEditorSkillAction` as its action root.
- Retargeted every bound analytics, traffic, repository, preview, and publishing action to the skill root without changing facade calls or tool contracts.
- Made the skill's `WebPropertyEditorFacade` assembly and `_sessionObject` dependency explicit so the profile no longer depends on the retired standalone `Imports.pts` file.
- The owning Core Lite profile supplies distinct agent action/entity roots; business-specific implementations remain in Feeding Frenzy.
- The owning agent profile uses local Ollama `glm-5.2` with medium reasoning for bound editor sessions.

## Initial Session-Bound Editor Service (2026-07-04)
- Added `WebPropertyEditorService#Current` as a per-session ProtoScript service exposing only bound website editor methods.
- Design decision: use the existing Buffaly service projection primitive and `_sessionObject` instead of model-selectable per-property instances or generic OpsAgent tools.

## Production Publish Surface (2026-07-06)
- Added thin pass-through production publish actions for starting, polling, waiting, and checking the sealed production URL.
- Production publish validation and deployment behavior stays in `WebPropertyEditorFacade`; ProtoScript remains direct wrapper glue only.

# AIP Adapter Skill

Exports selected Buffaly ProtoScript tools as AIP-shaped read-only capability manifests.

## Non-Intrusive Design

This skill does not modify original tool files. It uses adapter-owned partial prototype definitions to re-open selected existing tool prototypes and attach `AipCapability` metadata. Removing this skill removes the AIP metadata and leaves original tools unchanged.

## Actions

- `ToGetAipAdapterInfo`
- `ToListAipCapabilities`
- `ToGetAipCapability`

## Explicit Capabilities

- `buffaly.session.plan.get` -> `ToGetSessionPlan.Execute`
- `buffaly.session.scratch.get` -> `ToGetSessionScratch.Execute`
- `buffaly.skills.list` -> `ToListSkills.Execute`
- `buffaly.skills.actions.list` -> `ToListSkillActions.Execute`
- `buffaly.files.block.get` -> `ToGetFileBlock.Execute`
- `buffaly.files.text.read_raw` -> `ToReadTextFileRaw.Execute`

## Limitations

- This module is **read-only**. No invocation, enforcement, or evidence endpoints are implemented.
- The catalog is **explicit-only**. Only capabilities defined as `AipCapability` descendants in partial prototype metadata are projected.
- `includeInferred` is acknowledged but **not implemented**. Setting `includeInferred=true` returns an `INFERRED_NOT_IMPLEMENTED` warning and no additional capabilities.
- Capabilities with **malformed metadata** (missing required fields, unresolvable execution bindings) are **skipped** with projection issues, not published.
- Only **active** capabilities appear by default (`LifecycleStatus == "active"`, exact ordinal match). Use `includeInactive=true` to include non-active explicit capabilities.
- **Reflection-based runtime extraction** in `AipAdapterFacade` is temporary prototype debt. The preferred approach is a narrow read-only accessor on `IAgentRuntimeHost` or `BuffalyAgent`.
- The **static runtime fallback** (`AipAdapterRuntimeContext`) is prototype debt, to be replaced with a DI-registered `IAipRuntimeProvider`.
- No invocation/enforcement/evidence is implemented in this module.

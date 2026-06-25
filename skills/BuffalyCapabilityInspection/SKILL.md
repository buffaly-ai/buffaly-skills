# Buffaly Capability Inspection Skill

Read-only self-inspection actions for listing this Buffaly install's five primary capability areas:

- Skills
- Tools
- Prompt Actions
- Providers
- Web Modules / Installed Modules

## Design

ProtoScript is intentionally thin. The actions in `index.pts` delegate directly to `Buffaly.Agent.Web.CapabilityInspectionFacade`, which owns catalog aggregation, provider secret-safe shaping, validation, and JSON serialization.

## Actions

- `ToGetInstalledCapabilitiesOverview`
- `ToListInstalledCapabilitySkills`
- `ToListInstalledCapabilityTools`
- `ToListInstalledCapabilityPromptActions`
- `ToListInstalledCapabilityProviders`
- `ToListInstalledCapabilityWebModules`

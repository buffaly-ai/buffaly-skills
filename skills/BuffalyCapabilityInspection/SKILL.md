# Buffaly Capability Inspection Skill

Read-only self-inspection actions for listing this Buffaly install's five primary capability areas:

- Skills
- Tools
- Prompt Actions
- Providers
- Web Modules / Installed Modules

## Design

ProtoScript is intentionally thin. Web-backed actions delegate to `Buffaly.Agent.Web.CapabilityInspectionFacade`; worker-safe prompt-action and include-mode inspection delegates to `ProtoScriptCapabilityInspection`. Those owners perform catalog aggregation, validation, and JSON serialization.

## Actions

- `ToGetInstalledCapabilitiesOverview`
- `ToListInstalledCapabilitySkills`
- `ToListInstalledCapabilityTools`
- `ToListInstalledCapabilityPromptActions`
- `ToInventorySkillIncludeModes`
- `ToListInstalledCapabilityProviders`
- `ToListInstalledCapabilityWebModules`

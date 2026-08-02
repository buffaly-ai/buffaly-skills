# BuffalyCapabilityInspection index.pts Change History

## 2026-08-02 - Restore general OpsAgent lazy ownership

- Restored the generated lazy ownership sidecar after the Dispatch profile was redesigned around independent CoreLite contracts.
- General OpsAgent may now discover and explicitly activate Capability Inspection without compiling it at startup; specialized profiles must own any eager contracts they require.

## 2026-08-01 - Keep profile-root contracts eager

- Removed the lazy sidecar because eager DispatchTree profile roots inherit from `BuffalyCapabilityInspectionSkillAction` and `BuffalyCapabilityInspectionSkill` during startup compilation.
- Capability Inspection must remain eager until those profile-root overlays are redesigned so package materialization cannot emit an invalid lazy include.

## 2026-06-10 - Direct prompt-action inspection

- Changed `ToListInstalledCapabilityPromptActions` to call `ProtoScriptCapabilityInspection.ListInstalledCapabilityPromptActions(...)` directly.
- Removed the worker-to-agent-web JsonWs dependency for prompt-action capability inspection.
- This prevents wrong web base URL failures such as IIS `localhost:80` 404s during prompt-skill update workflows.

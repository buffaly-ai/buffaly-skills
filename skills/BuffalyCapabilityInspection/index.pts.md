# BuffalyCapabilityInspection index.pts Change History

## 2026-06-10 - Direct prompt-action inspection

- Changed `ToListInstalledCapabilityPromptActions` to call `ProtoScriptCapabilityInspection.ListInstalledCapabilityPromptActions(...)` directly.
- Removed the worker-to-agent-web JsonWs dependency for prompt-action capability inspection.
- This prevents wrong web base URL failures such as IIS `localhost:80` 404s during prompt-skill update workflows.

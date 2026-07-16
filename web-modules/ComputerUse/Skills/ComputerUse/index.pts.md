# ComputerUse guidance skill package notes

## Restore guidance-only compatibility surface (2026-07-16)
- Reintroduced the `ComputerUse` package skill as a guidance-only prompt route.
- The old OpenAI ComputerUse task-level loop remains retired and must not be restored.
- The replacement directs agents to `UseDesktopInteractionSkill` and direct Desktop primitives using the active session provider/model.
- No `OpenAIFeature`, `ComputerUseWorkbenchServiceHost`, run/status/stop actions, nested model parameter, provider parameter, or API-key parameter should be added here.

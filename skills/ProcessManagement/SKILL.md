# Process Management Skill

Thin ProtoScript wrappers around the C# `Buffaly.Sessions.Processes` service and the scheduled-process runner trigger endpoint, plus prompt skills for explanatory/how-to workflows.

Use this skill to:

- list all Buffaly process rows,
- list external scheduled tasks,
- list recurring interval processes,
- inspect process details,
- add external prompt-driven scheduled tasks,
- add recurring interval processes,
- enable or disable processes,
- trigger an external scheduled task now,
- validate process configuration.

Prompt skills in this folder explain how to add scheduled and recurring processes. They are intentionally not `ProcessManagementSkillAction` tools because how-to guidance should be delivered by the agent as a prompt workflow, not rendered as executable C#/ProtoScript tool cards.

Prompt guidance files:

- `Prompts/ToExplainHowToAddScheduledTask.prompt.md`
- `Prompts/ToExplainHowToAddRecurringProcess.prompt.md`

Prompt actions:

- `ToExplainHowToAddScheduledTask`
- `ToExplainHowToAddRecurringProcess`

Design decision: ProtoScript stays declarative and calls typed C# service methods; database and runtime safety rules remain in C#.

Implementation note: list, inspect, add, enable, disable, and validate actions call `Buffaly.Sessions.Processes` directly in-process. `ToTriggerScheduledTaskNow` remains route-backed until the trigger runner is moved out of the Sessions.Web/module startup delegate.

# index.pts Change History

## Add Scheduled Process Context Prompts (2026-06-06)
- Registered `ErrorLogHandlerContextPrompt` and `EmailSummaryHandlerContextPrompt` so scheduled process `PromptContext` values resolve to prompt files instead of inline instructions.

## Add Production Alarm Handler Context Prompt (2026-06-11)
- Registered `ProductionAlarmHandlerContextPrompt` for scheduled production-alarm email routing.
- Design Decision: alarm-specific routing policy belongs in prompt context and process row configuration, while the inbox-router C# handler remains reusable.

## Add Feeding Frenzy Website Checkup Context (2026-06-23)
- Registered FeedingFrenzyWebsiteCheckupAnalysisContextPrompt for the public website checkup flow.
- The context prompt constrains website content as untrusted data and defines the expected checkup JSON result shape.


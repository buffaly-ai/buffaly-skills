# ValidatedPrompt/index.pts Change Notes

## Add ValidatedPromptAction v1 skill surface (2026-07-04)
- Added the ValidatedPrompt skill, generic `ToRunValidatedPromptSkill` facade action, and sample `ToSummarizeTextInOneSentenceSkill` action.
- Kept ProtoScript as a thin wrapper around `ValidatedPromptTools.RunValidatedPromptSkill(...)`.

## Align runner with name-based public surface (2026-07-04)
- Changed `ToRunValidatedPromptSkill` to accept `validatedPromptActionName` and resolve the `ValidatedPromptAction` prototype internally, matching the v1 runner API shape.

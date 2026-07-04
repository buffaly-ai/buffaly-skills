# ValidatedPrompt/index.pts Change Notes

## Add ValidatedPromptAction v1 skill surface (2026-07-04)
- Added the ValidatedPrompt skill, generic `ToRunValidatedPromptSkill` facade action, and sample `ToSummarizeTextInOneSentenceSkill` action.
- Kept ProtoScript as a thin wrapper around `ValidatedPromptTools.RunValidatedPromptSkill(...)`.

## Align runner with name-based public surface (2026-07-04)
- Changed `ToRunValidatedPromptSkill` to accept `validatedPromptActionName` and resolve the `ValidatedPromptAction` prototype internally, matching the v1 runner API shape.

## Code review cleanup (2026-07-04)
- Changed ValidatedPromptSkill to inherit SkillEntity, CoreEntity instead of Level2ObserverEntityRoot; validated prompt is a normal skill, not a Level 2 observer root.
- Updated the C# import to the dedicated Buffaly.Agent.Tools.ValidatedPrompt assembly.


## Add validated SEO website analysis action (2026-07-04)

- Added `ToAnalyzeExistingWebsiteForImprovementsValidatedSkill` as a real validated prompt action for testing the original SEO / website improvement audit workflow with the v1 runner.
- The action reuses `ToRunValidatedPromptSkill`, keeping execution as work prompt plus separate validation prompt with runner-injected JSON validation format.

## Add full SEO sales packet validated prompt action set (2026-07-04)

- Added validated prompt actions for the remaining major SEO sales packet steps: required SEO packet review, competitor positioning, client-facing report, demo website artifact, demo review, proposal deck, and final packet package.
- Kept execution on the existing `ToRunValidatedPromptSkill` runner so each step is work prompt plus separate validation prompt with runner-injected JSON validation format.
- Validation prompt files contain criteria only; the generic runner owns the response schema.

## Add evidence-only SEO sales packet analysis action (2026-07-04)

- Added `ToCreateWebsiteAnalysisFromEvidenceForSeoSalesPacketValidatedSkill` for the first packet step when public evidence has already been gathered.
- This keeps validated prompt execution deterministic: the action synthesizes from supplied evidence only and does not browse/search/fetch pages during the validated work turn.

## Add direct string binding diagnostic action (2026-07-04)

- Added `ToDebugEchoValidatedPromptStringBinding` to verify live `run-proto-script-method` string argument binding while validating large prompt/evidence payloads.

## Add session-file validated prompt runner wrapper (2026-07-04)

- Added `ToRunValidatedPromptSkillFromSessionFile` as a thin ProtoScript wrapper for large validated prompt inputs staged under the current session directory.
- This avoids direct method large-string argument transport issues while preserving the same `ValidatedPromptAction` work/validation lifecycle.

# ValidatedPrompt Skill

## Purpose

Provides the generic validated prompt runner infrastructure and small reusable sample/reporting actions.

Marketing- or client-specific validated prompt workflows should live in their owning skill packages, not in this generic infrastructure skill. For example, website sales/demo prompts belong under `MarketingWebsiteSales`, and real client website implementation prompts belong under `ClientWebsiteImplementation`.

## Current public surfaces

- `ToRunValidatedPromptSkill` — generic facade that runs a `ValidatedPromptAction` by action name.
- `ToRunValidatedPromptSkillFromSessionFile` — file-backed input variant for large validated prompt inputs.
- `ToInspectValidatedPromptActionDefinition` — inspection helper for validating action metadata and prompt lengths.
- `ToSummarizeTextInOneSentenceSkill` — minimal sample validated prompt action.
- Workflow-report narrative actions and debugging helpers remain generic infrastructure examples.

## Source-of-truth rule

Do not add one-off business/domain workflow actions here. Put them in their owning skill so semantic discovery resolves the original public action name to the validated action instead of to a duplicate side-by-side action.

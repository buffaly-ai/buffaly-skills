# index.pts Change History

## Add Scheduled Process Context Prompts (2026-06-06)
- Registered `ErrorLogHandlerContextPrompt` and `EmailSummaryHandlerContextPrompt` so scheduled process `PromptContext` values resolve to prompt files instead of inline instructions.

## Add Production Alarm Handler Context Prompt (2026-06-11)
- Registered `ProductionAlarmHandlerContextPrompt` for scheduled production-alarm email routing.
- Design Decision: alarm-specific routing policy belongs in prompt context and process row configuration, while the inbox-router C# handler remains reusable.

## Add Feeding Frenzy Website Checkup Context (2026-06-23)
- Registered FeedingFrenzyWebsiteCheckupAnalysisContextPrompt for the public website checkup flow.
- The context prompt constrains website content as untrusted data and defines the expected checkup JSON result shape.

## Move Context Phrases to [SemanticContext] Annotations (2026-11-16)
- Changed: each of the ten routed contexts now declares its phrase with one bare literal `[SemanticContext("...")]` annotation on the line directly above its `prototype Name : ContextPrompt` declaration, replacing its `ContextPhrase = "...";` assignment. Phrases are copied unchanged. Prototype names and order, `EntityName`, `PromptPath` and `DefinitionPromptPath` are unchanged.
- Why: Buffaly core N1 (buffaly-development 6153e366d9a8087dc247f915b4504d586940137d) makes the annotation the only phrase representation. Its context reader rejects a `ContextPhrase` assignment with `ContextPhraseAssignmentRetired`, so the unmigrated file no longer reads under that core.
- Legacy behavior kept: `ProductionAlarmHandlerContextPrompt` had no phrase and gets no annotation. It remains a legacy context that loads only when requested explicitly by name.
- Contract: the annotation argument must be one plain string literal, and a context has at most one annotation. `[SemanticContext("")]` marks a context retracted while keeping its content. The annotation compiles through the no-op `SemanticContext` function in `../Annotations.pts`; the context registration owner reads the literal from source and performs and verifies the semantic upsert. The base `ContextPhrase` field in `Core/CoreOntology.pts` stays declared for this release.
- Related guidance: `ContextPromptDefinition.prompt.md`, the definition prompt every context here references, now describes this annotation contract instead of `ContextPhrase`.
- Compatibility: ship this file only with core N1 or later. An older core reads phrases only from the assignment and would see these ten contexts without phrases. The deployed Matt-local copy of this project still uses assignments; its migration is a separate step that has not been performed.
- Verification run: an isolated compile harness ran against the exact N1 core Debug binaries (ProtoScriptAuthoring 116398B2, ProtoScript.Parsers FA276370, Host DA5ED378) with 54 checks passing and none failing (log SHA256 6426F8AE98ECC3D1E909D23E5F58F1B5358A3386EEF6509C5928FFD4EF08A4F8). The reader rejects the pre-migration file. The migrated file reads as 11 declared and 10 active contexts whose names, order, phrases and prompt paths equal the pre-migration source, and the legacy context reads explicitly by name. The real ProtoScript compiler loads all 11 prototypes with only the accepted service-root startup diagnostic, and a negative control without the `SemanticContext` declaration fails and names it. The Host explicit loader loads the legacy context and an annotated context. The core writer retracted `WikiContextPrompt`, changing only that definition; the reader then reports it retracted, the Host loader refuses it with `ContextRetracted`, and the other contexts are unchanged.
- Limitations: no live FeedingFrenzyAgent root includes this file today. `Core/index.pts` includes `ContextPrompts`, but only the stale `App_Data/BuffalyLeadAgentRuntime/Project.FFLeadAgent.pts` includes `Core/index.pts`, so the harness compiled this file with `Annotations.pts` and an `Imports.pts`-equivalent prelude rather than through a shipped root. When the core writer rewrites a definition it drops `EntityName`, `DefinitionPromptPath` and the `@` verbatim prefix; that is existing core writer behavior, recorded here and not changed. No staging, installed or Matt-local copy was changed.


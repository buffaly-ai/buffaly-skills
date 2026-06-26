# BuffalySelfManagement.pts Notes
## Shared Result-Type and ProtoScript Preview Grid Guidance (2026-06-03)

Added shared BuffalySelfManagement prompt actions for:

- designing Buffaly result-type renderers using `metadata.result_type` and `metadata.result_payload`
- calling ProtoScript methods from JavaScript/JsonWs through `RunProtoScriptMethodAsync`
- designing ProtoScript-backed preview grid result renderers

Also added `BuffalySamplePreviewGrid.Preview()` as a deterministic JSON-string sample method for validating `RunProtoScriptMethod` and preview-grid rendering without requiring model-generated data.

## ProtoScript Preview Grid Contract Correction (2026-06-03)

Updated the shared sample preview data and `DesignProtoScriptPreviewGrid.prompt.md` guidance to match the committed `ProtoScriptPreviewGrid` handler contract:

- assistant metadata uses result type `ProtoScriptPreviewGrid`
- result payload fields remain PascalCase (`SessionKey`, `PrototypeName`, `MethodName`, `Args`)
- preview method return JSON uses required `Rows` and optional `Columns`
- `Columns` entries use `Key` and `Label`

## Sample Preview Grid Base Type Correction (2026-06-03)

Changed `BuffalySamplePreviewGrid` from invalid base `Entity` to `CoreEntity` after staging validation showed the deployed project skipped `BuffalySelfManagement.pts` with `Type Of is not found: Entity`. The sample grid was later moved from `CoreEntity` to `SemanticEntityBase` during default ontology surface cleanup so it keeps descriptive entity fields without appearing in the default `CoreEntity` prompt surface.

## Chat-Window Preview Grid Validation Guidance (2026-06-03)

Updated the existing shared result-type and ProtoScript preview grid prompt guidance with the validated chat-window flow:

- directive text must cause the model to return a real Buffaly envelope, not a markdown sample
- saved assistant rows should expose `Role = "Assistant"`, `ResultType = "ProtoScriptPreviewGrid"`, and `ResultPayloadJson`
- the renderer path calls `RunProtoScriptMethodAsync` and renders `BuffalySamplePreviewGrid.Preview()` rows such as `Alpha Clinic`, `Beta Lab`, and `Gamma Pharmacy`
- proof harnesses must not treat user directive rows that merely contain `ProtoScriptPreviewGrid` as renderer evidence

## First-Class ProtoScript Preview Grid Result Action (2026-06-03)

Added `ToReturnProtoScriptPreviewGridResult` so agents do not need users to hand-author Buffaly envelope JSON in chat.

The action declares:

- `ResponseFormat = "text"`
- `ResponseResultType = "ProtoScriptPreviewGrid"`

It returns a `JsonObject` with:

- `Message` for visible assistant text
- `ResultPayload` containing `Title`, `SessionKey`, `PrototypeName`, `MethodName`, and `Args`

The ToolRegistrar response directive turns that into a structured tool envelope/contract item that the model can mirror into assistant metadata. The intended workflow is natural language intent -> call `ToReturnProtoScriptPreviewGridResult` -> final assistant response with `ProtoScriptPreviewGrid` metadata -> UI handler calls `RunProtoScriptMethodAsync` and renders the grid.

## Preview Grid Result Action Session Parameter Correction (2026-06-03)

Updated `ToReturnProtoScriptPreviewGridResult` to require an explicit `sessionKey` parameter and return `ERROR: sessionKey is required.` when it is empty. ProtoScript action definitions do not have a valid `_session` implicit variable in this context, so the shared action must follow the existing OpsAgent action pattern of accepting `sessionKey` directly.

## Preview Grid Structured Args Contract (2026-06-06)

Updated `ToReturnProtoScriptPreviewGridResult` to take a structured `JsonObject args` parameter instead of an `argsJson` string. The result payload now carries `Args` as an object, while the grid-specific JavaScript serializes that object only at the generated `RunProtoScriptMethodAsync` service boundary. This avoids corrupting Windows paths such as `\\Transcripts\\transcript-index.csv` through string unescaping and reduces the action surface by defaulting `methodName` to `Preview`, `title` to `ProtoScript Preview`, and deriving the visible message from the title.

## Add Subject Matter Expert Research Brief Prompt Action (2026-06-04)
- Added `ToCreateSubjectMatterExpertResearchBriefSkill` beside the existing model quorum and automaton prompt actions.
- Registered semantic phrases for creating an SME research brief/background document and mining prior session history for a topic brief.
- Added the full prompt at `Skills/BuffalySelfManagement/Prompts/CreateSubjectMatterExpertResearchBrief.prompt.md` with ontology anchoring, topic expansion, session search, source-linked evidence, relationship-map, and briefing-memo requirements.
- Design decision: SME brief creation is a self-management/research workflow pattern like automaton and quorum creation, so it belongs in `BuffalySelfManagement` rather than a one-off personal node for this explicitly requested shared location.

## 2026-06-09
- Added `ToCritiqueAgentSessionInteractionSkill` as a prompt workflow for offline review of failed or poor agent interactions.
- Added `CritiqueAgentSessionInteraction.prompt.md` to guide session/turn/region isolation, turn detail inspection, log review, tool-call timeline reconstruction, better-route analysis, and improvement recommendations.
- Design: separate offline forensic session critique from live Level2 supervision, offline entity criticism, and troubleshooting retrospective summaries.

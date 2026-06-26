# Design Buffaly Result-Type Renderers

Use this prompt when a Buffaly response needs to return a structured UI result instead of plain text only.

## Core Contract

Buffaly assistant message items may include metadata fields that survive backend processing and timeline persistence:

- `metadata.format`
- `metadata.result_type`
- `metadata.result_payload`

The visible message text is only for the user. The UI instruction must live in metadata. Do not scrape JSON markers from visible prose.

## Response Shape

Return one assistant message item with a normal `content[output_text]` value and structured metadata:

```json
{
  "type": "message",
  "role": "assistant",
  "phase": "final_answer",
  "content": [
    { "type": "output_text", "text": "Preview is available." }
  ],
  "metadata": {
    "format": "text",
    "result_type": "example result type",
    "result_payload": {
      "Title": "Example Result"
    }
  }
}
```

## Backend/Timeline Flow

The backend applies assistant item metadata to timeline rows. The front end receives the persisted shape as:

- `Format`
- `ResultType`
- `ResultPayloadJson`

The timeline renderer passes these fields into the result-type decorator pipeline.

For chat-window validation, verify the saved assistant row itself has the persisted fields. A correct chat result-type turn has `Role = "Assistant"`, a non-empty `ResultType`, and `ResultPayloadJson` containing the serialized `metadata.result_payload`. Do not validate by searching for the result-type string anywhere in the timeline, because the user directive or system context may contain the same text without triggering a renderer.

Relevant code paths:

- `Buffaly.Agent.Host/BuffalyAgent.cs`
- `Buffaly.Agent.Core/TooledAgent.cs`
- `Buffaly.Agent.Host/Tools/ToolRegistrar.cs`
- `buffaly.agent.web/wwwroot/js/buffaly-agent-timeline-messages.js`
- `buffaly.agent.web/wwwroot/js/buffaly-agent-timeline-turns.js`
- `buffaly.agent.web/wwwroot/js/buffaly-agent-result-types.js`

## JavaScript Dispatch

The timeline renderer calls:

```javascript
BuffalyAgentResultTypes.decorateBubble({
	body: body,
	bubble: bubble,
	role: roleClass,
	format: normalizedFormat,
	resultType: resultType,
	resultPayload: resultPayload,
	resultPayloadJson: resultPayloadJson
});
```

Handlers are registered in `buffaly-agent-result-types.js`:

```javascript
registerHandler("example result type", renderExampleResultType);
```

## Rules

- Use one stable result type string.
- Put renderer inputs in `result_payload`.
- Preserve authoritative property casing for the chosen payload contract.
- Do not parse hidden commands out of visible text.
- Do not add fallback casing, alternate payload shapes, or normalizers.
- Fail visibly when required payload fields are missing.

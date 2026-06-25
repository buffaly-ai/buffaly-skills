# Pass User State To A Buffaly Agent

Use this prompt when the goal is to explain or standardize the supported Buffaly runtime path for passing user state to a Buffaly agent.

## Goal
Show the canonical way to pass structured user state through the supported Buffaly input contract instead of embedding state into freeform instruction text.

## Canonical Supported Path
Pass user state through `EvaluateInputContract.UserState` when calling one of the typed Buffaly service methods:
- `EvaluateWithInput(string sessionKey, EvaluateInputContract input)`
- `QueueInput(string sessionKey, EvaluateInputContract input)`
- `SteerInput(string sessionKey, EvaluateInputContract input)`

Do **not** append user state manually into the natural-language instruction text when the typed input contract is available.

## Canonical Contract
`EvaluateInputContract` includes:
- `Instruction`
- `PromptContext`
- `MessageKey`
- `UserState : JsonObject`
- `Images`
- `Files`

## Runtime Behavior
When `UserState` is populated:
1. Buffaly runtime persists keys into `SessionObject.UserState`.
2. Buffaly runtime automatically injects a synthetic timeline user message headed by `[Session User State]`.
3. Injection is deduplicated by signature, so unchanged state is not re-added repeatedly.

Therefore callers should pass structured user state and let the runtime manage persistence and timeline injection.

## Authoritative Buffaly Files
- `Buffaly.Agent.Host/OpsAgent/Contracts/AgentServiceContracts.cs`
- `Buffaly.Agent.Host/Services/BuffalyAgentService.cs`
- `Buffaly.Agent.Host/Services/BuffalyAgentService.Private.cs`
- `Buffaly.Agent.Core/SessionObject.cs`

## Minimal Example Shape
```json
{
  "sessionKey": "<key>",
  "input": {
    "Instruction": "...",
    "PromptContext": "...",
    "MessageKey": "<optional-canonical-message-key>",
    "UserState": {
      "UserID": "123",
      "LeadID": "456",
      "PageType": "lead"
    },
    "Images": [],
    "Files": []
  }
}
```

## Working Rules
- Use the typed input contract when available.
- Keep the actual user instruction clean and human-authored.
- Store structured state in `UserState`.
- Let the runtime handle persistence and timeline injection.
- Remove manual instruction-appending patterns when this path is available.

## Output Expectations
When explaining this pattern, clearly state:
- the supported DTO (`EvaluateInputContract`)
- the supported methods (`EvaluateWithInput`, `QueueInput`, `SteerInput`)
- that timeline injection is automatic
- that manual instruction-appending should be removed when this path is available


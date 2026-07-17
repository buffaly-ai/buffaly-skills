# XSearch Skill

Search X (Twitter) via the xAI Responses API `x_search` hosted tool.

## Purpose

- Run X searches from OpsAgent ProtoScript actions using Grok's native server-side x_search tool.
- The x_search tool runs inside Grok's agentic sampler loop — the model autonomously invokes `x_keyword_search` and `x_semantic_search` and returns synthesized text with real post citations.
- No client-side X API key or tool execution is needed.

## Requirements

- xAI provider must be configured with `XAI.HostedTools = "x_search"` in the provider feature settings.
- The xAI provider (Buffaly.Provider.Xai) must be installed and configured with a valid API key or OAuth token.

## Exposed Actions

- `ToSearchX.Execute(query, systemPrompt, model, reasoningLevel)` — search X for posts about a topic.
- `ToBriefWhatHappenedOnX.Execute(topic, model, reasoningLevel)` — produce a structured neutral briefing of what happened on X about a topic.

## Inputs

- `query` — search query or topic to look up on X.
- `topic` — named topic for the briefing (person, product, launch, event, controversy).
- `systemPrompt` — optional analyst instructions for result formatting and tone.
- `model` — optional model override (defaults to grok-4.3 via provider catalog).
- `reasoningLevel` — optional reasoning effort: low, medium, or high.

## Output

- JSON with `Status`, `Provider`, `Model`, `ReasoningLevel`, `Text` (synthesized search results with citations), and `UsageMetrics`.

## How It Works

1. The ProtoScript action calls `_opsAgent.AskModelViaRuntime(prompt, systemPrompt, "xai", model, reasoningLevel, "[]")`.
2. The xAI provider reads `HostedTools` from the feature settings and includes `{"type": "x_search"}` in the request tools array.
3. The model sees x_search in its available tools and invokes it server-side.
4. The model processes search results in its agentic loop and returns synthesized text with real X post links.
5. The response mapper extracts the output text — hosted tool calls are not treated as executable function calls.
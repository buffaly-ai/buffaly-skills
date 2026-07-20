# OpenAI Admin Skill

Read-only ProtoScript actions over the installed `Buffaly.OpenAiAdmin.WebModule` assembly.

## Actions

- `ToGetOpenAIUsageAndCosts(startDate, endDate)` — all usage dimensions and authoritative costs for an inclusive UTC date range.
- `ToGetOpenAICostsByApiKey(startDate, endDate)` — native OpenAI costs grouped by API key.
- `ToGetOpenAICostsByFamily(startDate, endDate)` — native OpenAI line-item costs grouped into spend families.
- `ToListOpenAIProjects()` — active organization projects and consumer mappings.
- `ToGetOpenAISpendAlerts()` — read-only organization and project spend-alert thresholds.
- `ToGetOpenAIDataRetentionPolicies()` — read-only organization and project retention policies.

Date parameters use `yyyy-MM-dd`. The C# facade validates dates and converts the inclusive end date to an exclusive UTC boundary.

## Security and runtime

- Requires the installed OpenAIAdmin WebModule assembly and the server-side `OpenAI.AdminApiKey` User Secret.
- The secret is never accepted as an action argument or included in output.
- Wrappers call the C# facade directly in-process; they do not call Buffaly HTTP/JsonWs endpoints.
- All actions are read-only. Credential and policy mutations are intentionally not exposed.

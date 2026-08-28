# Feeding Frenzy SMS skill

Defines exactly three actions under `FeedingFrenzySmsActionRoot`: grounded wiki search, one article read, and a sealed current-turn reply. ProtoScript only shapes help requests or delegates to `FeedingFrenzySmsAgentFacade`; C# owns validation, authorization, routing, idempotency, retry, and persistence.

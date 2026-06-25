# Offline Ontology Critic Agent Profile Template

This module-owned template is not installed into the normal OpsAgent Agents folder by default. The future Offline Ontology Critic module installer/harness should materialize it as offline-ontology-critic.agent.json only inside the target runtime when the module is enabled.

```json
{
    "AgentName":  "offline-ontology-critic",
    "DisplayName":  "Offline Ontology Critic",
    "PromptFile":  "Prompts/OfflineOntologyCritic.md",
    "PromptContext":  "none",
    "Provider":  "ollama",
    "RootActionPrototypeName":  "OfflineOntologyCriticActionRoot",
    "RootEntityPrototypeName":  "OfflineOntologyCriticEntityRoot",
    "DefaultModelName":  "glm-5.2",
    "DefaultReasoningLevel":  "medium",
    "UiPage":  "/buffaly-agent.html",
    "IsReadOnly":  true,
    "IsHidden":  false,
    "DisableLevel2AutoAttach":  true,
    "CanChangeModel":  true
}
```

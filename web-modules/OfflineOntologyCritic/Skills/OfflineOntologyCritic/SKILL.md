# Offline Ontology Critic Skill

Provides prompt-skill tools for the dedicated `offline-ontology-critic` agent.

The skill is intentionally rooted under `OfflineOntologyCriticActionRoot` so the normal Buffaly agent does not receive these tools by default.

Initial tools:

- `ToRunOfflineOntologyCriticPhase1Skill`
- `ToRunOfflineOntologyCriticPhase2Skill`
- `ToPreviewOntologyAdditionsFromLedgerSkill`
- `ToMaterializeApprovedOntologyAdditionsSkill`

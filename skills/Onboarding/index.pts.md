# Onboarding skill

Defines guided onboarding prompt actions for helping users understand Buffaly and teach it the first terms, actions, and preferences it should understand.

## Purpose
Provide product onboarding workflows that can be launched from the Help / Get Started page and discovered by infinitive phrase.

## Design notes
- `ToSetUpInitialOntologySkill` is a prompt action for the first-run ontology setup flow.
- The Help page can trigger it by sending the phrase `set up my initial ontology` into the `Start` session.
- The prompt skill explains Buffaly, collects entities, prompt actions, and preferences, confirms with the user, then routes user-approved items through the appropriate remember workflows.
## Guided Help Page Actions (2026-06-02)
- Added onboarding prompt actions for first-user guided flows launched from the Help / Get Started page: GitHub, Google Workspace, Tailscale, Codex, first tool, first task, and teaching Buffaly something useful.
- Design decision: buttons that promise a walkthrough route to `buffaly-agent` with exact prompt-action phrases; broad documentation questions remain on the read-oriented Help Agent.
## Tool Creation Walkthrough Actions (2026-06-02)
- Added first-screen onboarding prompt actions for creating prompt skills, ProtoScript skills, and C# skills.
- Added a beginner-friendly self-modification explainer action that frames Buffaly extension as prompts, deterministic ProtoScript tools, and native C# capabilities.
## Install Capabilities Walkthrough Action (2026-06-07)
- Added `ToShowInstallCapabilitiesSkill`, a Help / Onboarding prompt action for the "Show this install's capabilities" link.
- Design decision: keep this link as a guided prompt action instead of a wiki page so new users get an interactive, outcome-oriented explanation of the Navigation popup's Capabilities, Ontology, and Inspect sections.
- 2026-06-19: Added conversational discovery phrases such as "show me what you can do" and "what can you do" so broad capability questions route to the install capabilities walkthrough.

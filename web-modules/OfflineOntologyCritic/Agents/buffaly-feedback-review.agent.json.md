# Buffaly feedback-review profile history

## 2026-11-18 - Package-owned normal-toolset leaf reviewer

- Added hidden buffaly-feedback-review profile with Prompts/master.md, CodingContext, CoreAction/CoreEntity and CompanionAgents=[]. This preserves ordinary tool-assisted feedback without recursive automatic companions, using the authoritative profile composition contract rather than the retired create-time flag or falsely marking reviews as validated-prompt sessions.
- Provider/model/reasoning remain inherited through canonical child creation; explicit modal selections override them. No global buffaly-agent profile is modified.
- Validation: regression harness checked profile identity, normal tool root and empty companions. Installed profile materialization and runtime status await staging verification.

# CodexEmbedded WebModule retirement

## 2026-11-20 - Withdraw the retired adapter from local distribution metadata

Matt requested removing the Codex web module after retiring the separate core replay viewer and embedded Codex editing/sub-agent tools. Owning source is buffaly-codex-embedded/Buffaly.CodexEmbedded.WebModule, removed in 8a077e7f06994814a6fa8aa394b83577efcfa4d9. May companion history records intentional start/status supervision, HTTP/WebSocket proxy and landing-page integration; it was reachable, not proven dead.

Removed the exact WebModule/CodexEmbedded 0.1.300 catalog entry and its four-file package payload (assembly, dependencies, manifest and settings). Removed only that typed identity from core/recommended profiles and their exact-membership validator. This is deliberate package retirement metadata cleanup, not hand-editing a compiled payload or replacing an installed module. The independent Skill/Codex, model/provider, account lookup, standalone harness and saved histories remain. Policy protections against stopping old processes are retained.

Actual validation before metadata commit: both profile validations passed; parent/current semantic comparisons confirm all other catalog entries and profile identities/platforms unchanged; Test-ExtensionRepository passed all 119 remaining packages with 691 warnings; git diff --check passed. Target locks, including the legacy unsuffixed recommended lock, will be generated from the committed metadata in a follow-up manifest batch. Their results will be appended here.

The work is local source/distribution preparation only. No remote push, package installation, installer build, staging/Matt-local mutation, provider request, database change or process restart was performed. Installed copies are not uninstalled by removing catalog membership and require a separately authorized release/uninstall operation.

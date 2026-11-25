# Retired legacy workspace distribution

## 2026-11-25 — Source-aligned catalog and UI cleanup

Removed the Workspace WebModule package and its catalog entry after retiring its owning source in `C:/dev/buffaly-ai/Buffaly.Agent.Workspaces`. `removed-files.json` records all 34 removed/moved payload paths with their original commit and hashes, including DLLs and compressed browser assets. Existing textual histories are preserved below this directory; compressed copies are removed with the package. No recommended installer profile selects Workspace, and no package dependency references its identity.

The separate editor presentation cleanup follows `C:/dev/FeedingFrenzy/scripts/publish_web_property_editor_agent_web_module.ps1`: its own manifest assignment was evaluated to regenerate `web-modules/WebPropertyEditorAgent/web-module.json` with zero AgentScripts. Removed assets are web-property-editor-context.js and .css; the retained JS companion records removal and matches the owning source. Canonical Get-PackageFileHash from that publisher rebuilt the Files inventory and the package version advanced from 0.3.142 to 0.3.143. All 86 DLL hashes and every other package entry remain unchanged. The editor's role, sealed profile/skill artifacts and backend tools remain.

MarketingWorkbench is a separately owned local wrapper and was not in this distribution catalog. Its source was retired in `C:/dev/Buffaly.Marketing`; GeneralSkillWorkbench and unrelated marketing integrations remain.

Validation: canonical retirement regression passes 4/4; Test-ExtensionPackageVersionBumps with BaseRef HEAD and ValidateAllHashes passes; Test-ExtensionPackage for FeedingFrenzy.WebPropertyEditorAgent passes with zero errors. Its 54 dependency/runtime warnings were independently reproduced unchanged against the pre-cleanup package and index exported from Git. Baseline validation inputs were removed afterward. No warnings were suppressed. Source retirement tests pass Workspace4/4, Marketing3/3 and editor3/3. All retired source histories remain reviewable.

This is source/distribution preparation. No installed files, session/workspace data, configuration or processes were changed. Existing installations still need a separately authorized module removal and rollout; installing a new build alone must not be assumed to uninstall an already installed extension. No phone-latency cure is claimed.

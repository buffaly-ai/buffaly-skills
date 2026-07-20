# Buffaly Maintenance Skill

DLL-backed OpsAgent skill wrappers over `Buffaly.Maintenance.Client`.

The skill resolves `Buffaly.Maintenance.Client` by assembly name through the installed runtime. It does not bypass runtime assembly ownership with a skill-local DLL path.

- Created in the provisioning solution so the reusable maintenance/update/log code ships with the installer and can also be copied into the Matt/OpsAgent environment.
- Keeps first-version action inputs minimal and system-resolved.
- Returns simple JSON text envelopes: `Succeeded`, `Message`, `Data`, `Warnings`.
- Update/apply actions are intentionally separated from check/download so the agent can require confirmation before launching an installer.

## New actions: log pruning

- `ToClearBuffalyLogs(olderThanMinutes = 60)` — deletes `*.log` files older than the given minutes across all discovered log directories. High-impact; requires explicit confirmation. Returns standard maintenance envelope with counts, bytes, lists of deleted files and any failures.
- `ToPreviewClearBuffalyLogs(olderThanMinutes = 60)` — non-destructive dry-run. Lists exactly what `ToClearBuffalyLogs` would delete. Use this first for safety.

Both actions reuse the existing `InstalledInstanceLogUploader.FindLogCandidates` logic for consistency with upload actions. A minimum of 5 minutes is enforced.

## New actions: tool execution policy

- `ToShowToolExecutionPolicy()` — displays the active hard-deny and approval-required rules, including whether the policy came from compiled defaults or the DB-backed Host Feature.
- `ToEnsureToolExecutionPolicyConfigured()` — creates the DB-backed `Tool Execution Policy Feature` from compiled defaults when it is missing.
- `ToAddToolApprovalRequiredString(value)` — adds an argument/command substring to a custom approval-required rule and persists it to the DB-backed feature.
- `ToRemoveToolApprovalRequiredString(value)` — removes an argument/command substring from approval-required rules and persists the change.

Design Decision: viewing policy is safe and can use compiled defaults, while mutation creates/persists the DB-backed Host Feature so users can manage approval strings without source edits.

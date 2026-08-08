# ClaudeCode/index.pts

Canonical Claude Code CLI Skill for subscription-backed authentication, one-shot prompts, and pass-through conversations.

One-shot prompt execution creates a retained invocation directory and resolves the Claude executable before constructing prompt artifacts and launching the process. This setup must not be replaced by a debug short-circuit when publishing the package.

`ToRunClaudePrompt` maps a nonpositive `timeoutSeconds` value to 3600 seconds before calling the generic process facade, whose own nonpositive default is only 60 seconds. This preserves the skill's documented long-running prompt behavior for repository analysis and other substantial Claude tasks.

## 2026-08-08

- Made Claude CLI discovery cross-platform by resolving `claude` or `claude.cmd` from `PATH`, with the guarded `%APPDATA%\npm\claude.cmd` fallback retained for Windows.
- Replaced direct `$env:TEMP` assumptions with `.NET` platform temporary-directory resolution for invocation artifacts, scoped state, and turn counters.
- Routed auth status, interactive login, one-shot prompts, and pass-through execution through the same resolved executable path.
- Removed a stale diagnostic early return from the distributable one-shot prompt action so published packages execute Claude normally.

## 2026-07-18

- Consolidated the retired `AnthropicAnt` aliases and action phrases into ClaudeCode so existing “Ant” language routes to the canonical Skill.
- Fixed output cleanup recursion, removed a stray declaration outside the auth action, returned the resolved executable path in auth status, and restored the interactive login executable/stderr setup.
- Scoped pass-through state paths under `claude_pt_state/<sanitized-scope>/`; added explicit scoped model/state actions for callers that need concurrency-safe state when ambient session identity is unavailable.
- Updated the main `ToTalkToClaude` contract to require a caller-owned `stateScope` and use it for model, working-directory, and turn-count state so the primary pass-through path cannot silently share `default` state.
- Added a stable hash suffix to scoped state directory names so distinct scopes that sanitize to the same path prefix cannot collide.
- Added scoped conversation reset and scoped working-directory actions so callers can configure the same explicit scope consumed by `ToTalkToClaude`.
- Added `ToRunClaudeCodeStateScopingRegression`, a production ProtoScript regression action that exercises the actual scope mapper, scoped state read/write helpers, and working-directory wrapper seam.

## 2026-07-27

- Replaced large-response streaming through the managed PowerShell collector with unique, retained, file-backed stdout/stderr artifacts.
- The child process still drains both redirected streams asynchronously to avoid pipe deadlocks, explicitly awaits both drains after process exit, and atomically completes UTF-8 file writes before returning only exit metadata and artifact paths.
- Prompt files share the response's unique invocation directory, preventing concurrent Claude calls from overwriting a shared `claude_prompt.txt` or `claude_pt_prompt.txt` without creating a second orphan directory.
- ProtoScript reads the authoritative completed stdout/stderr files directly, so runtime output-capture limits and post-exit collection timing cannot truncate a successful Claude response.
- Invocation directories use an `.active` lease so cleanup cannot delete running or unread calls. Abandoned leases expire after one day.
- Completed artifacts are retained for at most seven days, twenty invocations, and 256 MiB total. Retention runs before allocation and again after the caller has materialized the current response, so every completed invocation is included in the bounds without risking deletion of unread output. Every result reports `ArtifactDirectory`; failed calls remain discoverable under the same policy.
- Combined stdout/stderr is limited to 64 MiB per invocation and fails closed with `artifact-error.txt` rather than consuming unbounded disk.

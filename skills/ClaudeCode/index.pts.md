# ClaudeCode/index.pts

Canonical Claude Code CLI Skill for subscription-backed authentication, one-shot prompts, and pass-through conversations.

## 2026-07-18

- Consolidated the retired `AnthropicAnt` aliases and action phrases into ClaudeCode so existing “Ant” language routes to the canonical Skill.
- Fixed output cleanup recursion, removed a stray declaration outside the auth action, returned the resolved executable path in auth status, and restored the interactive login executable/stderr setup.
- Scoped pass-through state paths under `claude_pt_state/<sanitized-scope>/`; added explicit scoped model/state actions for callers that need concurrency-safe state when ambient session identity is unavailable.
- Updated the main `ToTalkToClaude` contract to require a caller-owned `stateScope` and use it for model, working-directory, and turn-count state so the primary pass-through path cannot silently share `default` state.

## 2026-07-27

- Replaced large-response streaming through the managed PowerShell collector with unique, retained, file-backed stdout/stderr artifacts.
- The child process still drains both redirected streams asynchronously to avoid pipe deadlocks, explicitly awaits both drains after process exit, and atomically completes UTF-8 file writes before returning only exit metadata and artifact paths.
- Prompt files share the response's unique invocation directory, preventing concurrent Claude calls from overwriting a shared `claude_prompt.txt` or `claude_pt_prompt.txt` without creating a second orphan directory.
- ProtoScript reads the authoritative completed stdout/stderr files directly, so runtime output-capture limits and post-exit collection timing cannot truncate a successful Claude response.
- Invocation directories use an `.active` lease so cleanup cannot delete running or unread calls. Abandoned leases expire after one day.
- Completed artifacts are retained for at most seven days, twenty invocations, and 256 MiB total. Retention runs before allocation and again after the caller has materialized the current response, so every completed invocation is included in the bounds without risking deletion of unread output. Every result reports `ArtifactDirectory`; failed calls remain discoverable under the same policy.
- Combined stdout/stderr is limited to 64 MiB per invocation and fails closed with `artifact-error.txt` rather than consuming unbounded disk.

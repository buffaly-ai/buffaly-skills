# Claude Code CLI skill

Official `claude` (Claude Code) wrappers plus a transparent pass-through layer. Uses subscription-backed auth (Claude Pro/Max plan) — not API billing.

## Auth & CLI actions
- `ToGetClaudeAuthStatus` — check if claude CLI is installed and authenticated
- `ToBeginClaudeLogin` — interactive OAuth login via browser (`--claudeai` flag for subscription auth)
- `ToLogoutClaudeAccount` — logout and clear pass-through state

## Prompt execution
- `ToRunClaudePrompt` — one-shot prompt with `--output-format text --permission-mode bypassPermissions`. Supports model selection, system prompt, working directory, and long-prompt file handling.

## Pass-through actions
- `ToTalkToClaude` — main pass-through. Requires a caller-owned `stateScope` such as the Buffaly source session key, then forwards a user message to claude with scoped model, working-directory, conversation, and turn state.
- `ToStartNewClaudeConversation` — resets conversation context so the next call starts fresh.
- `ToGetClaudeConversationState` — returns current model, working directory, and turn count.
- `ToSetClaudeModel` — switches Claude model for subsequent pass-through calls (sonnet, opus, haiku, fable, or full names).
- `ToSetClaudeWorkingDirectory` — changes where claude reads/writes files.
- `ToSetScopedClaudeModel` — writes model state under an explicit caller-owned scope such as a Buffaly session key.
- `ToGetScopedClaudeConversationState` — reads pass-through state for an explicit caller-owned scope.
- `ToStartScopedClaudeConversation` — clears conversation/turn state for an explicit caller-owned scope.
- `ToSetScopedClaudeWorkingDirectory` — writes working-directory state for an explicit caller-owned scope.
- `ToRunClaudeCodeStateScopingRegression` — production regression action for collision-resistant scoped state and scoped working-directory wrapper behavior.

## Pass-through state files
- Pass-through state uses `claude_pt_state/<sanitized-scope>-<scope-hash>/` in the process temp directory. `ToTalkToClaude` requires a stable caller-owned `stateScope` so the main pass-through path cannot silently share default state across concurrent sessions.
- `claude_pt_conv_id.txt` — current conversation ID
- `claude_pt_model.txt` — current model
- `claude_pt_workdir.txt` — working directory
- `claude_pt_turns.txt` — turn count

## Auto-timeout heuristic
- 600s for audit/browse/thorough/comprehensive tasks
- 300s for analyze/review/generate/create tasks
- 120s default

## Key implementation notes
- Uses `--permission-mode bypassPermissions` (not `--dangerously-skip-permissions`) for proper non-interactive file access
- Uses `System.Diagnostics.ProcessStartInfo` with `Arguments` property to avoid `Start-Process` space-splitting issues
- Uses one unique retained artifact directory for every invocation. Claude stdout and stderr are drained concurrently, fully awaited, and written as UTF-8 files before the process wrapper returns; ProtoScript reads those files directly instead of trusting bounded streaming capture for the response body.
- Long prompts share that invocation directory, so concurrent calls cannot overwrite one another and do not create separate orphan prompt directories.
- Active leases protect running and unread calls. Completed artifacts are bounded to seven days, twenty calls, and 256 MiB total; cleanup runs before allocation and after each response is read, and abandoned leases expire after one day.
- Combined stdout/stderr is limited to 64 MiB per call. Results report `ArtifactDirectory` for recovery and diagnostics.
- Fable model needs ~90-100s for full article rewrites; sonnet needs ~15-30s for most tasks

Requires:
- `claude` CLI installed (`npm install -g @anthropic-ai/claude-code`) and available on `PATH`; Windows also supports the standard `%APPDATA%\npm\claude.cmd` installation path
- Claude Pro/Max subscription for subscription-backed auth

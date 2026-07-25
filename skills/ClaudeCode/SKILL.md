# Claude Code CLI skill

Official `claude` (Claude Code) wrappers plus a transparent pass-through layer. Uses subscription-backed auth (Claude Pro/Max plan) — not API billing.

## Auth & CLI actions
- `ToGetClaudeAuthStatus` — check if claude CLI is installed and authenticated
- `ToBeginClaudeLogin` — interactive OAuth login via browser (`--claudeai` flag for subscription auth)
- `ToLogoutClaudeAccount` — logout and clear pass-through state

## Prompt execution
- `ToRunClaudePrompt` — one-shot prompt with `--output-format text --permission-mode bypassPermissions`. Supports model selection, system prompt, working directory, and long-prompt file handling.

## Pass-through actions
- `ToTalkToClaude` — main pass-through. Forwards a user message to claude with automatic model selection, timeout, and long-prompt file handling.
- `ToStartNewClaudeConversation` — resets conversation context so the next call starts fresh.
- `ToGetClaudeConversationState` — returns current model, working directory, and turn count.
- `ToSetClaudeModel` — switches Claude model for subsequent pass-through calls (sonnet, opus, haiku, fable, or full names).
- `ToSetClaudeWorkingDirectory` — changes where claude reads/writes files.

## Pass-through state files
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
- Fable model needs ~90-100s for full article rewrites; sonnet needs ~15-30s for most tasks

Requires:
- `claude` CLI installed (`npm install -g @anthropic-ai/claude-code`)
- Claude Pro/Max subscription for subscription-backed auth

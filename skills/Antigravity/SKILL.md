# Antigravity CLI skill

Official `agy` wrappers plus a transparent pass-through layer:

## Auth & CLI actions
- auth status check
- interactive login via GitHub-style visible tool window (`ForceOpenToolWindow`) + live auth-code input
- interactive logout via TUI `/logout`
- one-shot `--print` prompts (`ToRunAntigravityPrompt`)

## Pass-through actions
- `ToTalkToAntigravity` — main pass-through. Forwards a user message to agy with automatic conversation continuity, model selection, timeout, and long-prompt file handling.
- `ToStartNewAntigravityConversation` — resets conversation context so the next call starts fresh.
- `ToGetAntigravityConversationState` — returns current conversation ID, model, working directory, and turn count.
- `ToSetAntigravityModel` — switches Gemini model for subsequent pass-through calls.
- `ToSetAntigravityWorkingDirectory` — changes where agy reads/writes files.

## Pass-through state files
- `agy_pt_conv_id.txt` — current conversation UUID
- `agy_pt_model.txt` — current model
- `agy_pt_workdir.txt` — working directory
- `agy_pt_turns.txt` — turn count

## Auto-timeout heuristic
- 600s for audit/browse/thorough/comprehensive tasks
- 300s for analyze/review/generate/create tasks
- 90s default

Requires:
- `agy` installed
- Python + `pywinpty` for interactive TUI helpers
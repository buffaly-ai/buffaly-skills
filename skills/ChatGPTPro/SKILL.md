# ChatGPT Pro skill

Wrappers for the third-party `oracle` CLI (steipete/oracle) that drives ChatGPT Pro via browser automation. Also supports API mode with `OPENAI_API_KEY`. Not an official OpenAI product.

## Auth & CLI actions
- `ToGetChatGPTProAuthStatus` — check if the `oracle` CLI (steipete/oracle) is installed and whether browser profile or API key is available
- One-shot execution does not require separate login; browser mode uses `--browser-manual-login` with persistent profile at `~/.oracle/browser-profile`

## Prompt execution
- `ToRunChatGPTProPrompt` — one-shot prompt with model selection, engine mode (browser/api), file attachment, working directory, session slug, and timeout. In browser mode, targets ChatGPT Pro (gpt-5.5-pro, gpt-5.6, etc.). API mode also supports Gemini and Claude models via the oracle CLI's multi-provider routing.

## Pass-through actions
- `ToTalkToChatGPTPro` — main pass-through. Forwards a user message to the oracle CLI with automatic model selection, timeout, and long-prompt file handling.
- `ToStartNewChatGPTProConversation` — resets conversation context so the next call starts fresh.
- `ToGetChatGPTProConversationState` — returns current model, working directory, and turn count.
- `ToSetChatGPTProModel` — switches model for subsequent pass-through calls.
- `ToSetChatGPTProWorkingDirectory` — changes working directory for oracle CLI calls.

## Pass-through state files
- `chatgptpro_pt_conv_id.txt` — current conversation/session ID
- `chatgptpro_pt_model.txt` — current model
- `chatgptpro_pt_workdir.txt` — working directory
- `chatgptpro_pt_turns.txt` — turn count

## Auto-timeout heuristic
- 3600s for audit/browse/thorough/comprehensive tasks
- 600s for analyze/review/generate/create/build/improve tasks
- 300s default

## Key implementation notes
- Uses `--browser-manual-login` for browser mode (persistent Chrome profile at `~/.oracle/browser-profile`)
- Uses `System.Diagnostics.ProcessStartInfo` for cross-platform process launching
- Supports file attachment via `--file` flag (comma-separated paths in the `files` parameter)
- Browser mode can take up to an hour for Pro models (usually ~10 minutes)

Requires:
- `oracle` CLI installed (`brew install steipete/tap/oracle` or `npm i -g @steipete/oracle`)
- ChatGPT Pro subscription for browser mode, or `OPENAI_API_KEY` for API mode

## Cross-platform support
- Resolves `oracle` from PATH via `Get-Command`
- Uses `[System.IO.Path]::GetTempPath()` for temp file paths (works on Windows, macOS, and Linux)
- Uses `System.Diagnostics.ProcessStartInfo` for cross-platform process launching
- No Windows-specific commands or paths

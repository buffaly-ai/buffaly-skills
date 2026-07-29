# ClaudeCode/index.pts

Canonical Claude Code CLI Skill for subscription-backed authentication, one-shot prompts, and pass-through conversations.

## 2026-07-18

- Consolidated the retired `AnthropicAnt` aliases and action phrases into ClaudeCode so existing “Ant” language routes to the canonical Skill.
- Fixed output cleanup recursion, removed a stray declaration outside the auth action, returned the resolved executable path in auth status, and restored the interactive login executable/stderr setup.

## 2026-07-29

- Added `ToTalkToClaude` caller guidance that forbids repeating the same file-generating Claude job until the caller inspects expected filesystem outputs from the prior run.
- Documented recovery-first handling for stale, unrelated, empty, rate-limited, or overloaded Claude output: validate durable side effects before retrying.

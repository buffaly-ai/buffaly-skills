# ClaudeCode/index.pts

Canonical Claude Code CLI Skill for subscription-backed authentication, one-shot prompts, and pass-through conversations.

## 2026-07-18

- Consolidated the retired `AnthropicAnt` aliases and action phrases into ClaudeCode so existing “Ant” language routes to the canonical Skill.
- Fixed output cleanup recursion, removed a stray declaration outside the auth action, returned the resolved executable path in auth status, and restored the interactive login executable/stderr setup.

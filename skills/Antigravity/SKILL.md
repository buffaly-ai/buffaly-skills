# Antigravity

Native Antigravity ACP tool for Buffaly. The C# DLL talks to `agy_acp_server` plus the matching `localharness_external`. Operator configuration is the editable `config.json` beside this skill's ProtoScript. Package updates preserve this operator-owned file. This skill does not scrape ordinary `agy` CLI state or treat old conversation UUIDs as ACP sessions.

`ToGetAntigravityUsageStats` returns the latest optional ACP `usage_update`, prompt usage, cumulative cost, and rate-limit/retry condition captured for the requested scope. It never infers provider quota windows that ACP did not expose.

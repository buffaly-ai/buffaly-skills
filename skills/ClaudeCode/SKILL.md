# Claude Code

Native Claude Code tool for Buffaly. The C# DLL talks to the official `claude.exe` stream-json/control protocol. Operator configuration is the editable `config.json` beside this skill's ProtoScript. Package updates preserve this operator-owned file. Native credentials stay in the vendor executable. Blanket `bypassPermissions` is not the default.

`ToGetClaudeUsageStats` uses the same structured control connection to retrieve supported account limits and context usage, and combines them with the latest native turn/session telemetry captured for the requested scope. Unsupported telemetry returns partial data or `available:false`; it does not break conversations.

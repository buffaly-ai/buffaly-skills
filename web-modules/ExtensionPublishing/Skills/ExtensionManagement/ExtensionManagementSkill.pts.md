
Expanded the shared workflows into the authoritative create/register, publish/promote, Skill Management install/update, and end-to-end validation guidance. The guidance now names the compiled catalog wrapper, distinguishes package identity/type and publisher defaults from installer profiles, and forbids publication from installed, generated, backup, or temporary payloads.

Added a discoverable strict single-package staging action for WebModules and ProviderModules. It routes agents to `update_web_and_dlls.staging.ps1 -PackageType <type> -PackageId <id>` so one exact package can be previewed, installed during controlled staging shutdown, verified, and restarted without allocating or applying a complete installer Build ID. Bulk `-UpdateAll` remains explicit rather than a fallback.

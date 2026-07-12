# AGENTS.md - skills package directory

This directory is for standalone OpsAgent ProtoScript skill packages only.

Do not place web-module-backed skill payloads here just because a web module contains embedded `Skills/<Name>` content. Embedded web-module skill content stays inside `web-modules/<PackageName>/Skills/<Name>` and is indexed through `packages.index.json`, not `skills.index.json`.

Before adding or updating a directory here:

1. Confirm the package is truly a standalone skill package rather than a web module.
2. Confirm the owning source repository or active runtime project is not the better source of truth.
3. Update `skills.index.json` and run the repository/package validation scripts.
4. Do not commit generated artifacts, credentials, appsettings, or temporary validation output.

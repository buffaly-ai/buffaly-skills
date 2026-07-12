# AGENTS.md - web module package directory

This directory holds finalized Buffaly web module package payloads.

Web module source code belongs in the owning source repository. This directory should receive validated, distributable package output plus the metadata needed by the Buffaly extension/package installer.

Rules:

- Keep web module packages under `web-modules/<PackageName>` and index them in `packages.index.json`.
- If a web module includes embedded OpsAgent skill content, keep it inside the web-module payload under `web-modules/<PackageName>/Skills/...`.
- Do not create a duplicate top-level `skills/<PackageName>` entry for the same package ID.
- Exclude local `artifacts/`, build scratch, logs, environment-specific appsettings, and credentials unless explicitly required by the package contract and safe for distribution.
- For Feeding Frenzy/WebPropertyEditorAgent, use the Feeding Frenzy solution as the source of truth and commit only finalized package output here.

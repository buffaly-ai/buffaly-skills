# AGENTS.md - buffaly-skills repository rules

This repository is a finalized Buffaly extension/package distribution repository. It is not the source-of-truth development workspace for most tools.

## Source-of-truth rule

- Keep source code and active authoring work in the owning source repository or active runtime project.
- Use this repository to publish validated package payloads, indexes, manifests, and documentation that are ready to distribute.
- Do not hand-edit generated package payloads unless the change is part of a deliberate package publication or repository metadata cleanup.

## Package layout

- Standalone OpsAgent ProtoScript skill packages belong under `skills/<SkillName>` and must be indexed in `skills.index.json`.
- Buffaly web module packages belong under `web-modules/<PackageName>` and must be indexed in `packages.index.json`.
- Do not duplicate a package ID in both indexes. If a web module embeds skill content, keep that embedded content inside the web-module package payload, not as a separate top-level `skills/<Name>` package.

## Generated and unsafe content

- Exclude local `artifacts/`, build scratch, temporary validation output, and deployment-only working folders unless they are intentionally part of a finalized package payload.
- Do not commit local secrets, personal appsettings, credentials, or environment-specific configuration.
- For package refreshes, validate indexes and package structure before committing.

## Known package ownership

- Google Workspace is distributed here as `web-modules/GoogleWorkspace`; its source is the Google Workspace project/runtime, not a top-level `skills/GoogleWorkspace` package in this repository.
- Feeding Frenzy / WebPropertyEditorAgent is developed in the Feeding Frenzy solution and published here only as finalized `web-modules/WebPropertyEditorAgent` package output.

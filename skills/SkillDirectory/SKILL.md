# Skill Directory

Agent-facing tools for the official Buffaly Skill Directory.

This skill uses the existing SkillManagement services as the source of truth. ProtoScript actions are thin wrappers for search, detail lookup, install preview, explicit install, lazy-sidecar validation/generation, and owner-repository publication.

The actions do not duplicate installer logic. Remote package validation, allowed file types, DLL handling, replacement rules, and enable-after-install behavior remain in the C# SkillManagement web module service.

## Lazy skill lifecycle

Keep these operations distinct:

1. `ToGenerateLazySkillIndex` compiles one installed skill in `LazySkillValidationProject.pts`; it can preview without writing or write `index.pts.lazy.json` after success.
2. `ToPreviewPublishSkillToBuffalySkillRepository` validates repository publication without mutation.
3. `ToPublishSkillToBuffalySkillRepository` copies the validated payload to the owner repository and optionally commits/pushes it.
4. Package installation/update materializes the published payload in an environment.
5. A fresh ProtoScript runtime reads the installed sidecar and lazy route; resetting a runtime does not generate or publish metadata.

When a matching owner-repository sidecar already exists, restore or reinstall that verified payload rather than regenerating it unnecessarily. Deleting a sidecar only exercises eager fallback and is not a completed lazy-loading repair.

# Metabase Runtime Skill Directory

This directory contains the DLL-backed RootTrax Metabase Runtime skill for OpsAgent.

Use this folder for local runtime/native Metabase actions that call RooTrax VDB DLL APIs. Do not mix it with a future HTTP/JSONWS Metabase skill; JSONWS-oriented tooling should live in a separate package if restored or created.

Contents:
- `index.pts` skill root, DLL references, imports, and includes.
- `Actions.pts`, `Applications.pts`, `ProjectsAdmin.pts`, and `Ontology.pts` action/model definitions.
- `PromptActions.pts` and `Prompts/` runbooks.
- `lib/` runtime DLL dependencies.

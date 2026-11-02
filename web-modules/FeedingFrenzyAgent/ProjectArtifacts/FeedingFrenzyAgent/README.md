# FeedingFrenzyAgent ProtoScript Project

This directory is the durable source of truth for the Feeding Frenzy Buffaly/ProtoScript agent project.

`Project.pts` is the capability boundary for embedded Feeding Frenzy sessions. It intentionally loads only the minimal project ontology/runtime definitions, HTTP JSON-WS transport, semantic annotations, and Feeding Frenzy actions. Do not turn this into an OpsAgent overlay or add broad browser, coding, filesystem, process, secrets, session-management, dynamic-loading, or authoring capabilities.

Runtime deployments copy this project into Buffaly instances as needed, for example:

- `C:\inetpub\wwwroot\matt.buffaly.local\content\projects\FeedingFrenzyAgent`
- `C:\inetpub\wwwroot\staging.buffaly.local3\content\projects\FeedingFrenzyAgent`

Do not edit the runtime copies as the durable source. Runtime copies may contain environment-owned `lib` folders and configuration/secrets that are not stored here.

## Multi-tenant embedded Buffaly implementation (2026-08-25)
- Added required InstallationKey launch validation, tenant-qualified session keys, Buffaly-owned installation binding checks, fail-closed Current JsonWs service binding, and prompt guidance that tenant routing is not model-selected.

## 2026-11-02 - Removed leftover companions of deleted files

These companion files were left behind when their source files were removed, and they showed in Solution Explorer as files with no source. They are deleted now, and this entry is the owning record of the removal (AGENTS.md: deletions update the owning documentation). Only documentation changed: no source, project or build file. Each file's final history is still readable with `git show d2b5758f0:<file>.md`.

| Removed file | Removed by | Reason |
|---|---|---|
| `Buffaly/Projects/FeedingFrenzyAgent/Agents/feeding-frenzy-automation-text.agent.json` | 97c2f4fc7 (2026-11-01) | Replace compiled automation graphs with stored workflows |
| `Buffaly/Projects/FeedingFrenzyAgent/AutomationText.pts` | 97c2f4fc7 (2026-11-01) | Replace compiled automation graphs with stored workflows |

Validation: no tracked Markdown file links to any deleted companion (link search: 0 matches); no tracked .csproj, .props or .targets file references .md items; the commit contains only these .md deletions and history entries. No build or test was run, because no build input changed.

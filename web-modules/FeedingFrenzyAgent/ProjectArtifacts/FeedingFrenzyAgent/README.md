# FeedingFrenzyAgent ProtoScript Project

This directory is the durable source of truth for the Feeding Frenzy Buffaly/ProtoScript agent project.

`Project.pts` is the capability boundary for embedded Feeding Frenzy sessions. It intentionally loads only the minimal project ontology/runtime definitions, HTTP JSON-WS transport, semantic annotations, and Feeding Frenzy actions. Do not turn this into an OpsAgent overlay or add broad browser, coding, filesystem, process, secrets, session-management, dynamic-loading, or authoring capabilities.

Runtime deployments copy this project into Buffaly instances as needed, for example:

- `C:\inetpub\wwwroot\matt.buffaly.local\content\projects\FeedingFrenzyAgent`
- `C:\inetpub\wwwroot\staging.buffaly.local3\content\projects\FeedingFrenzyAgent`

Do not edit the runtime copies as the durable source. Runtime copies may contain environment-owned `lib` folders and configuration/secrets that are not stored here.

## Multi-tenant embedded Buffaly implementation (2026-08-25)
- Added required InstallationKey launch validation, tenant-qualified session keys, Buffaly-owned installation binding checks, fail-closed Current JsonWs service binding, and prompt guidance that tenant routing is not model-selected.

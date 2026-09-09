# workspace.js

Adapter for the source-controlled Marketing Workspace. It requests the typed workspace dashboard, maps current General Workbench runs/artifacts/sessions into the proven custom workbench component, generates same-origin workflow launch links with `returnWorkspace`, and exposes package prompt source through `/api/package-reference`. It also supplies the explicit source-membership rule shown in the UI. It does not read cached session manifests or ProtoScript source URLs.

The Marketing dashboard renders immediately from the current run-artifact dashboard, then loads `ListHistoricalDecks` asynchronously and sends those references to the component's dedicated historical Decks collection instead of appending them to Files. Historical deck entries preserve source/provenance labels and use previewable URLs for PDF/HTML while routing PowerPoint files to explicit download URLs. The historical deck calls use the generated client's generic `invoke` helper so the page does not depend on regenerated typed JavaScript methods for newly-added JsonWs endpoints.

The `Sync new decks` callback calls `sync-historical-deck-library`, which is the explicit incremental server sync path. After that endpoint updates the durable curated JSON, the adapter reloads `ListHistoricalDecks` so the UI reflects newly admitted deck records without using scans during ordinary render.

The adapter also loads `ListMarketingArtifacts` into the regular Files collection so non-deck curated deliverables such as website delivery reports and QA records are discoverable without polluting the deck-only library.

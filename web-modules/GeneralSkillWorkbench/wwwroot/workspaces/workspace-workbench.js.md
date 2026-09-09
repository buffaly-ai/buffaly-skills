# workspace-workbench.js

Source-controlled promotion of the proven Marketing Workbench custom element originally developed in the Cashed Workspaces session artifact. It preserves the Buffaly sidebar, Home, Files, Skills, Sources, search, pinning, recent deliverables, source drilldown, and responsive visual system. Skills are package-owned workflow definitions and provide their launch path directly, without a redundant separate Launches page. Source membership is explained as qualifying General Workbench runs grouped by attached Buffaly session. Prompt source links use the confined package-reference route. Data comes from the typed dashboard contract and cached session sidecars are not used.

The component exposes `setFiles(files)` so the lightweight dashboard can render first and current file cards can be refreshed without losing saved/custom pins. Refreshes preserve the current pin set and only discard pins whose file IDs no longer exist.

Historical deck records are intentionally not appended to the regular Files list. `setHistoricalDecks(decks)` loads them into a dedicated Decks view and a home-page deck collection section, grouping deck-level representatives by source/client so the researched inventory does not appear as an unorganized raw file dump.

The Decks view can be configured with `onSyncDecks`. When present, the `Sync new decks` button calls that callback, which is expected to run the server-side incremental library sync and then reload the durable deck list. The component displays the sync result but does not scan files itself.

# wwwroot/runs

Standalone run index. It lists persisted Workbench runs from `Runs.ListRuns` and links to the existing `/?run=` workflow page. It does not share `app.js` or change setup/workflow rendering.

The page reads the one camelCase success contract emitted by `WorkbenchJsonWsRegistration`. It does not keep a PascalCase compatibility reader.

The index reuses the same setup-shell, setup-card, status-pill, and markdown table styles as the run details page instead of a one-off table skin. Cache-bust the page scripts after visual changes so the live host does not keep the old table markup.

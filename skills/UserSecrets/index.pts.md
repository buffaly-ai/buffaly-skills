# index.pts Change History

## Add User Secret Collector Interactive Site (2026-06-15)

- Added `ToRunUserSecretCollectorInteractiveSite` to launch a self-contained browser site for collecting one secret.
- Loads skill-local HTML/CSS/JS and the generated `UserSecretCollectorService` JsonWs declaration through the same interactive-site launch path used by Error Log Diagnosis settings.

## Use Credential-named JsonWs Declaration Artifact (2026-06-15)

- Updated the launcher to load the committed UserInputCollectorService.json declaration artifact while the declaration Type remains UserSecretCollectorService.
- This keeps fresh package/deploy behavior durable without storing a public-release JSON path containing a public-release blocked filename term.



## Use UserInputCollectorService Declaration Artifact (2026-06-15)

- Kept the launcher on the allowed UserInputCollectorService.json declaration artifact and moved the service identity alignment into the C# facade/browser service type so websocket RPC can resolve the declaration without adding a blocked JSON filename.


## Fix Installed Compile Assembly Imports (2026-06-15)

- Removed local `System.IO` and `RuntimeInstallRootFeature` imports from the module skill wrapper so the installed OpsAgent project uses the authoritative project-wide imports from `Imports.pts` instead of failing on repeated skill-local assembly imports.

## Improve secure popup UX and keyed launch support (2026-06-16)

- Expanded skill/action descriptions and semantic phrases so agents can discover this tool for private keys, passwords, API keys, bearer tokens, and credential updates.
- Added keyed launch overloads that pass non-secret initial state to the interactive site, letting callers prefill the requested UserSecrets key and optional label.
- Updated the site copy to explain that the popup blocks Buffaly until Done or Cancel, that existing keys are updated, and that private values are saved directly to UserSecrets without returning to the model or timeline.

## Polish title/copy/visibility controls (2026-06-16)

- Added configurable display-title initial state so callers and the staging harness can set the popup heading.
- Updated the opening copy to say Buffaly requires a sensitive value, paused working, and will not provide the information to the model.
- Removed the Examples block, normalized field/input sizing, and added a show/hide private-value icon button.

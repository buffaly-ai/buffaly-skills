# Marketing Workbench component

Implements configure/start/navigate/dispose. Only workspace screen is supported; no interactive-agent screens claimed. Reads same-origin connection metadata, displays explicit configuration failure, and embeds the separately hosted workspace with a persistent external-open link. Uses textContent for diagnostics. AbortController cancels stale startup on disposal. No cross-origin DOM access or false readiness signal from iframe load. HTTPS parent rejects HTTP embedding.

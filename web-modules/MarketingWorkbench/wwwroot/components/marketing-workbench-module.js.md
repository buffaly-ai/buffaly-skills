# Marketing Workbench component

Loading copy intentionally uses ASCII `Reading workbench connection...`. The slow-request regression asserts this exact pending state. Package builds run scripts/validate_marketing_workbench_assets.mjs against staged JS/HTML, requiring valid UTF-8 and rejecting common mojibake signatures before publication. Valid Unicode remains allowed; signature scanning is a targeted guard, not universal encoding detection.

Implements configure/start/navigate/dispose. Only workspace screen is supported; no interactive-agent screens claimed. Reads same-origin connection metadata, displays explicit configuration failure, and embeds the separately hosted workspace with a persistent external-open link. Uses textContent for diagnostics. AbortController cancels stale startup on disposal. No cross-origin DOM access or false readiness signal from iframe load. HTTPS parent rejects HTTP embedding.

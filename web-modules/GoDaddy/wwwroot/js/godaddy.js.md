# godaddy.js

The permanent GoDaddy page remains the source UI. Query state supports registered component screens `domains`, `domain`, and `dns`. Exact domain routes validate against the complete `/list-domains` inventory and emit `buffaly-view-ready` only after routed DNS and nameserver data loads; stale domains emit `buffaly-view-error` without fallback. Interactive mode blocks all mutation endpoints in JavaScript in addition to the component hiding write controls.

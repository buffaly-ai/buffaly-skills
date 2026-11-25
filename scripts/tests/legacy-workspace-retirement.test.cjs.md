# Legacy extension distribution retirement regression

## 2026-11-25

Added four Node tests covering removal of Workspace's catalog/manifest/dependencies, empty editor AgentScripts and absent retired UI inputs, preserved bound-editor DLL and role/skill artifacts, and absence of retired Workspace/MarketingWorkbench identities from all installer profile package lists. Actual result: 4/4 passed with zero skipped/failed. These tests inspect the canonical repository, not an installed environment. Canonical package/version/hash validators also pass; unchanged dependency warnings are retained and documented in the retirement receipt.

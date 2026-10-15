# UseBrowserSkill.prompt.md history

## 2026-10-15 — owned-tab lifecycle guidance
Added model-visible guidance to reuse a working tab, isolate concurrent sessions using separate owned tabs in the same configured profile, respect four live owned tabs, explicitly close bounded work, preserve shared Chrome/login storage, and inspect fresh state after recovery without replaying mutations. Busy failures are not search-retry permission. Existing managed-default, explicit Playwright and anti-bot boundaries remain unchanged. No automatic idle/crash cleanup promised.
Validation: inspected scoped prompt diff against approved lifecycle design. Browser implementation/test suite 123 passed, 2 skipped; opt-in live source test proved the described owned-tab runtime behavior against staging configuration. Prompt not yet installed or model-driven task-end cleanup tested. This companion is new; existing prompt history is not reconstructed.

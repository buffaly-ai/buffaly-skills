# CodeReviews settings page
- Added a small Agent Targets page for editing the WebHarness Dev/Staging JsonWs base URLs.

## 2026-10-20 — Global / per-session reviewer checkbox
- Added UseSessionReviewers checkbox with lazy-creation and preserved-queue guidance; clarify global key applies only when session mode is off. Bumped settings script cache version for the new binding.
- Validation: settings JavaScript node --check passed; owning suite 90/90 and Release WebHarness build passed. HTML and exact checkbox/binding reviewed from source. No installed browser/UI acceptance or deployment; no reviewer created.

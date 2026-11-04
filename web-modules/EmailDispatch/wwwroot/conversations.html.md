# Conversations UI source history

## 2026-11-04
Added separate conversations.html and js/email-conversations.js, paired with same-name history for the script. Shares site header/styles/foundation/JsonWs grid/status/date/details and sandbox resize controls; no page CSS, composer or dispatch. Links list -> thread paged message grid -> single formatted message, with clear back navigation. Real provider owns query/thread/status; UI renders exact typed contract. Initial browser1440/390 passes search/cursor/thread/draft/formatted/direct reload/return Review, plus zero JS errors. Live provider/screenshots/package results recorded in report and appended history.

## 2026-11-04 — exact message dispatch access
Added a Review dispatch navigation link alongside Back to conversation using existing message-tools styling; script cache version0.1.1. No page CSS, duplicate picker or direct send. Reading task now permits review/dispatch of the same captured incoming message. Links navigate; existing Review buttons act. UI-STD-01 walkthrough: Back returns to thread, Review dispatch opens current saved review, header switches tasks; no explanatory paragraphs needed. Source1440/390 navigation/picker tests pass5/5 focused, routine51/51; installed screenshots recorded separately.

## 2026-11-04 — shared label asset alignment
Shared UI cache0.2.9 matches Review after historical-state wording correction; page-specific conversation behavior unchanged. Held-state and Conversations browser7/7 pass.

# TebraWeb index.pts

## Purpose

Defines Tebra-specific browser workflow actions that build on BrowserSessionSkill primitives.

## History

- Added initial TebraWebSkill with login, patient notes verification, and dry-run Memo to Record idempotency check actions.
- Added `ToPrepareTebraMemoToRecordDraftFillOnly` as a guarded browser-form fill action. It may open/fill a Memo to Record draft and verify idempotency text in the editor, but it must not save, sign, or submit the note.

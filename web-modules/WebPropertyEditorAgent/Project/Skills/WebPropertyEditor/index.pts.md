# WebPropertyEditor/index.pts Change History

## Initial Session-Bound Editor Service (2026-07-04)
- Added `WebPropertyEditorService#Current` as a per-session ProtoScript service exposing only bound website editor methods.
- Design decision: use the existing Buffaly service projection primitive and `_sessionObject` instead of model-selectable per-property instances or generic OpsAgent tools.

## Production Publish Surface (2026-07-06)
- Added thin pass-through production publish actions for starting, polling, waiting, and checking the sealed production URL.
- Production publish validation and deployment behavior stays in `WebPropertyEditorFacade`; ProtoScript remains direct wrapper glue only.

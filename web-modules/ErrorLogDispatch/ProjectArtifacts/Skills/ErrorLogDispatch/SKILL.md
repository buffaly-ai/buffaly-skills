# Error Log Dispatch

Use `ToGetErrorDispatchSession` after resolving the exact terminal Dispatch node. Pass `ErrorSession` for local logs or `AlarmSession` for remote alarms. Both actions require `sourceMessageKey`: the exact original collector User message in this coordinator's persisted history, which may be in an earlier turn. Reuse the same key for destination resolution and delivery; do not select approval, recall, semantic-context or compaction messages, and do not replace the original evidence with a paraphrase.

When delivery is authorized, call `ToDispatchErrorToSession` once with a short `assignedFrame` and `routingReason` (each at most 2,000 characters) and report its actual queue receipt. Do not paste the full alarm into either routing field: code captures the selected original evidence verbatim with its original turn and timestamp. Source/destination/size validation failures are not successful delegation; do not bypass them or retry without authorization.

Do not use raw child-session or generic send actions for these routes. BuildOnly forbids session creation, attachment mutation, and queueing.

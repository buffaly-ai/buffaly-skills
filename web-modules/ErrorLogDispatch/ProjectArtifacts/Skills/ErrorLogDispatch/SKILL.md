# Error Log Dispatch

Use `ToGetErrorDispatchSession` after resolving the exact terminal Dispatch node. Pass `ErrorSession` for local logs or `AlarmSession` for remote alarms. Then call `ToDispatchErrorToSession` exactly once with the frame-scoped bounded diagnostic assignment and report its queue receipt.

Do not use raw child-session or generic send actions for these routes. BuildOnly forbids session creation, attachment mutation, and queueing.

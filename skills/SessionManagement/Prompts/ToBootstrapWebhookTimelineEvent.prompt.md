# ToBootstrapWebhookTimelineEvent

Use this action when a `WEBHOOK_TIMELINE_EVENT` arrives and you need a reliable first execution step.

## Steps
1. Confirm session planning files exist (`ToInitializeSessionPlanAndScratch` if needed).
2. Resolve the best matching loaded skill/action for the webhook goal.
3. Execute one safest concrete next step.
4. Return a short commentary update with what ran and what is next.

## Output
- One concrete executed next step for the webhook event.
- Brief progress summary and next action.

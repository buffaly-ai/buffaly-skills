# To Send SMS via Twilio Messaging Service

## Goal
Send SMS using `MessagingServiceSid` (not raw From) to leverage compliant sender selection.

## Critical guidance
- For US A2P scenarios, prefer `MessagingServiceSid` sends.
- If prior send failed with **30034**, retry through registered Messaging Service.

## Steps
1. Create message with `To`, `Body`, and `MessagingServiceSid`.
2. Submit via Twilio Messages API.
3. Poll message SID for terminal status (delivered/undelivered/failed).
4. Return status + error code/message if present.

# Twilio Management

Prompt-driven Twilio management and provisioning guidance for purchasing and configuring phone numbers, setting reachable webhook URLs, and attaching numbers to Messaging Services.

## Requirements

- An authorized Twilio account and target environment.
- Credential keys `AccountSID` and `AuthToken` supplied through the existing secret workflow. Never include credential values in prompts, source, logs, or this package.
- Publicly reachable webhook URLs where callbacks are required; localhost URLs are not suitable.

## Safe use

Phone-number purchases, releases, webhook changes, and Messaging Service changes affect live resources and may incur cost. Require explicit user intent for the exact account, number, service, region, and mutation. Preview or verify current state when possible, avoid unrelated changes, and return evidence for only the requested operation. Follow applicable messaging, consent, and A2P compliance requirements.

`index.pts` is the package entry point.
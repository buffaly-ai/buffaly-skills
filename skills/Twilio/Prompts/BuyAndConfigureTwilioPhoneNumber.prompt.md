# To Buy and Configure a Twilio Number (API-first)

## Goal
Purchase a Twilio number and configure SMS/voice webhooks.

## Critical guidance
- Use Twilio REST API with account credentials from the intended environment.
- Do **not** set localhost webhook URLs on Twilio numbers (Twilio rejects with invalid URL / cannot reach localhost).
- Prefer public callback URLs (for example IF host endpoints) or tunnel URLs for local testing.

## Steps
1. Read AccountSID/AuthToken from the configured feature/secret source for the target environment.
2. Search available local numbers by area code (e.g., 407/321/689).
3. Purchase selected number via IncomingPhoneNumbers API.
4. Configure SMS + voice webhook URLs to reachable public endpoints.
5. Return number SID, E164, webhook URLs, and account SID used.

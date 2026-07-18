# To Attach a Twilio Number to Messaging Service (10DLC compliance path)

## Goal
Attach a purchased number to an existing Messaging Service that is used for compliant US A2P traffic.

## Critical guidance
- Error **30034** means message was sent from an unregistered US A2P sender path.
- Attaching the number to the correct Messaging Service can resolve routing/compliance path issues when that service/campaign is properly configured.

## Steps
1. List Messaging Services in account.
2. Select target service (e.g., Low Volume Mixed A2P Messaging Service).
3. Attach PhoneNumberSid to service via Messaging API.
4. Verify number appears in service phone number list.

# Feeding Frenzy SMS

Feeding Frenzy SMS is an OpsAgent ProtoScript skill that exposes the Feeding Frenzy SMS transport adapter through typed Buffaly actions.

## What it includes

- ProtoScript service binding prototypes for Feeding Frenzy SMS JSON WS endpoints.
- Remote and local service bindings that resolve authentication through Buffaly UserSecrets keys.
- Channel adapter plugin interface actions: send outbound, get delivery status, check compliance, resolve conversation, receive inbound, mark/clear opt-out.

## Channel adapter plugin interface

This skill implements the channel adapter plugin interface directly. Each action maps to one method of the interface:

| Action | Plugin method | Description |
| --- | --- | --- |
| `ToSendSmsViaFeedingFrenzy` | `SendOutbound` | Send SMS via Twilio Messaging Service |
| `ToGetSmsDeliveryStatusFromFeedingFrenzy` | `GetDeliveryStatus` | Query Twilio message status |
| `ToCheckSmsComplianceViaFeedingFrenzy` | `CheckCompliance` | Check opt-out and deliverability |
| `ToResolveSmsConversationViaFeedingFrenzy` | `ResolveConversation` | Resolve phone numbers to conversation key |
| `ToReceiveInboundSmsViaFeedingFrenzy` | `ReceiveInbound` | Process inbound webhook with MessageSid dedup |
| `ToMarkSmsOptOutViaFeedingFrenzy` | `MarkOptOut` | Mark phone as opted out (STOP) |
| `ToClearSmsOptOutViaFeedingFrenzy` | `ClearOptOut` | Clear opt-out status (START) |

## Security and setup

This package does not include API keys or credentials. Remote calls use the logical UserSecrets key `FeedingFrenzy.ApiKey`; local calls use `FeedingFrenzy.Local.ApiKey`. The target Buffaly instance must already have the appropriate key configured before actions can call protected routes.

The Feeding Frenzy server must have the `SmsTransportAdapterService` JsonWs routes registered and the Twilio Messaging Service Sid configured in the Twilio feature settings.

Installing this skill only copies ProtoScript files into the local Skills folder. It does not execute remote service calls automatically.

## Intended use

Use this skill when the Buffaly SMS Agent needs to send or receive SMS messages through the Feeding Frenzy transport layer. The SMS Agent calls these actions to interact with the transport; it does not call Twilio APIs directly.

## Relationship to FeedingFrenzyJsonWs

This skill uses the same `JsonWsHelper.CallJsonRouteSecure` pattern as `FeedingFrenzyJsonWs` but with a dedicated `SmsApiPrefix` (`api/feedingfrenzy.admin.sms`). It is a separate service, not a subclass of `FeedingFrenzyJsonWsService`.

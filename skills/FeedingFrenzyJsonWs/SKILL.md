# Feeding Frenzy JsonWs

Feeding Frenzy JsonWs is an OpsAgent ProtoScript skill that exposes selected Feeding Frenzy JSON web service routes through typed Buffaly actions.

## What it includes

- ProtoScript service binding prototypes for Feeding Frenzy JSON WS endpoints.
- Remote and local service bindings that resolve authentication through Buffaly UserSecrets keys.
- Lead, lead automation, lead status, source, tag, and sales representative action wrappers.
- User-owned signing draft, inspection, preparation and explicit email-send actions through the packaged typed signing client.

## Security and setup

This package does not include API keys or credentials. Remote calls use the logical UserSecrets key `FeedingFrenzy.ApiKey`; local calls use `FeedingFrenzy.Local.ApiKey`. The target Buffaly instance must already have the appropriate key configured before actions can call protected routes.

The complete Administrator graph requires FeedingFrenzyAgent web module version 0.1.152 or later and its matching FeedingFrenzy.Agent.Tools assembly on the target installation. This minimum version supplies the authoritative commerce and automation policy helpers and Foundation binding adapter used by this revision. The standalone package includes only FeedingFrenzy.UserSigning.Client.dll; it deliberately does not bundle the web-module assembly or host SDK DLLs. Verify the matching dependency is active before loading Administrator actions, including user signing. This package does not establish a self-contained Administrator installation. The earlier standalone 0.1.29 signing release does not use the new policy helpers.

Installing this skill copies its ProtoScript files and the unique signing-client DLL into the local Skills folder. It does not execute remote service calls automatically. Creating a signing draft never prepares or sends it; preparation and sending are separate explicit actions. Local-file creation uploads the exact Markdown bytes and then creates the draft, without automatic retry or ambiguous-upload cleanup.

## Intended use

Use this skill when Buffaly needs to inspect or call selected Feeding Frenzy JSON WS surfaces through the existing route-based helper contract.

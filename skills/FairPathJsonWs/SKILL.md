# FairPath JsonWs

FairPath JsonWs is an OpsAgent ProtoScript skill that exposes selected FairPath JSON web service routes through typed Buffaly actions.

## What it includes

- ProtoScript service binding prototypes for FairPath JSON WS endpoints.
- Remote and local service bindings that resolve authentication through Buffaly UserSecrets keys.
- Organization, role, user, status, and related read/write action wrappers.

## Security and setup

This package does not include authorization tokens or credentials. The service uses the logical UserSecrets key `FairPath.AuthorizationToken`; the target Buffaly instance must already have the appropriate token configured before actions can call protected routes.

Installing this skill only copies ProtoScript files into the local Skills folder. It does not execute remote service calls automatically.

## Intended use

Use this skill when Buffaly needs to inspect or call selected FairPath JSON WS surfaces through the existing route-based helper contract.

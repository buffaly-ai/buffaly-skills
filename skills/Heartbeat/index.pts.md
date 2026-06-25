# Heartbeat Skill index.pts Change History

## Shift Heartbeat Skill Ownership To Host Facade (2026-04-16)
- Replaced `HeartbeatGatewayTools` import with a host-owned heartbeat bridge.
- Updated heartbeat skill actions to call facade-owned start/stop/list methods so ProtoScript no longer depends on voice gateway heartbeat routes.
- Added a minimal `ToGetHeartbeatStatus` action that maps directly to the authoritative heartbeat status contract surface.
- Design Decision: align heartbeat skill ownership with the wiki pattern by routing ProtoScript through a host facade that calls the module-owned heartbeat service directly.

## Route Heartbeat Skill To Canonical Internal JsonWs Service (2026-04-17)
- Removed the host heartbeat bridge import and switched all heartbeat actions to call `JsonWsHelper.CallInternalJsonWsSecure(...)`.
- Added one shared `ToCallHeartbeatService(...)` helper that sends canonical typed request envelopes (`request`) to:
  - `/api/buffaly.agent.heartbeat/heartbeat-service/start` with `Start`
  - `/api/buffaly.agent.heartbeat/heartbeat-service/stop` with `Stop`
  - `/api/buffaly.agent.heartbeat/heartbeat-service/list` with `List`
  - `/api/buffaly.agent.heartbeat/heartbeat-service/status` with `Status`
- Design Decision: keep heartbeat ProtoScript thin and declarative while routing through the canonical manifest-backed remote JsonWs surface using the shared worker/web internal base URL.

# McpService.pts Change History

## Disable Auto-Initialization On Generic MCP Base (2026-05-16)
- Set `AutoInitialize = false` on the generic `McpService` prototype while leaving concrete MCP bindings free to initialize explicitly.
- Design decision: the base MCP service has no binding until an instance supplies one, so default startup should not attempt to initialize an unbound generic service.

## Pivot Generic ProtoScript MCP Bindings To Logical Secret Keys (2026-04-15)
- Replaced `BearerTokenEnvironmentVariable` with `BearerTokenSecretKey` on the generic `McpService` prototype.
- Updated all generic host bridge calls to pass the logical secret key through to the C# MCP host surface.
- Design Decision: keep ProtoScript MCP bindings aligned with the new exact-key secret-service boundary instead of environment-variable auth lookup.

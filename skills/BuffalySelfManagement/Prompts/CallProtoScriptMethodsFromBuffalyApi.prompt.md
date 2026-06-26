# Call ProtoScript Methods From the Buffaly API

Use this prompt when JavaScript or another API client needs to invoke a ProtoScript method in the current live Buffaly worker/session runtime.

## API Shape

Use the generated JsonWs async stub directly:

```javascript
const resultText = await BuffalyAgentService.RunProtoScriptMethodAsync(
	sessionKey,
	prototypeName,
	methodName,
	argsJson
);
```

Server-side contract:

```csharp
[JsonWsSerialize(SerializeResultsOptions.Full)]
public static string RunProtoScriptMethod(
	string sessionKey,
	string prototypeName,
	string methodName,
	string argsJson)
```

## What It Does

`RunProtoScriptMethod` routes to the appropriate worker for `sessionKey` and invokes the method inside that session-owned live ProtoScript runtime. It is not a standalone workbench evaluation path.

The live runtime path:

1. Enter/resume the session.
2. Prepare invocation globals.
3. Resolve the target prototype and method.
4. Parse `argsJson` as one JSON object of named arguments.
5. Bind arguments through the ProtoScript runtime binder.
6. Run the method with `RunMethodAsObject(...)`.
7. Format the result as a string.
8. Return that string through JsonWs.

## Important Files

- `Buffaly.Agent.Host/Services/BuffalyAgentService.cs`
- `Buffaly.Agent.Host/Services/BuffalyAgentServiceRemoteJsonWs.cs`
- `Buffaly.Agent.Host/Tools/BuffalyAgent.Tooling.cs`
- `Buffaly.Agent.Host/Tools/ToolRegistrar.cs`
- `buffaly.agent.worker/Program.cs`
- `buffaly.agent.worker/WorkerRequestHandlers.cs`
- generated browser JsonWs files under `buffaly.agent.web/wwwroot/JsonWs/`

## Argument Contract

`argsJson` should be a JSON object whose property names match ProtoScript method parameter names:

```javascript
const argsJson = JSON.stringify({ maxRows: 25 });
```

Do not send alternate shapes unless the target method explicitly accepts them.

## Returned Value

The API returns a string. If the ProtoScript method returns JSON text, JavaScript should parse the returned string:

```javascript
const resultText = await BuffalyAgentService.RunProtoScriptMethodAsync(
	sessionKey,
	"BuffalySamplePreviewGrid",
	"Preview",
	"{}"
);
const result = JSON.parse(resultText);
```

## Rules

- Call generated JsonWs stubs directly.
- Do not create wrapper-over-wrapper abstractions around the generated stub.
- Do not route through the model to produce deterministic preview data.
- Do not use `ProtoScriptWorkbench` for this flow; it is only a reference for expression evaluation behavior.
- Keep the contract string-first unless a typed API is explicitly designed.


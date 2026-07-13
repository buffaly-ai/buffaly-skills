# RuntimeProfiles.pts Change History

## Replace Hard-Coded Runtime Profiles (2026-05-29)
- Removed the four hard-coded OpenAI profile setter tools and their profile/model/reasoning entity instances.
- Added `ToSetBuffalySessionModelSelection` for provider/model/reasoning selection on an existing loaded session runtime.
- Added `ToGetBuffalyRuntimeProviderSelection` while keeping `ToGetBuffalyRuntimeModelAndReasoning` as a deprecated alias.
- Design decision: keep transport resolution and provider validation in C# and keep ProtoScript limited to required argument checks.

## Fix Setter Parameter Syntax (2026-05-29)
- Corrected `ToSetBuffalySessionModelSelection.Execute` to use ProtoScript's `type name` parameter syntax after staging startup exposed the deployed include parser error.
- Design decision: follow existing OpsAgent action signatures such as `function Execute(string sessionKey, ...)` so deployed project parsing matches authoring conventions.

## Call Service Directly From Setter Tool (2026-05-29)
- Changed `ToSetBuffalySessionModelSelection` to call `BuffalyAgentService.SetSessionModelSelection` directly and serialize the returned typed contract with `JsonUtil`.
- Design decision: avoid an extra ProtoScript compiler binding to a new `CoreOntologyTools` wrapper while still keeping validation and transport resolution in C#.

## Route Setter Through JsonWs Helper (2026-05-29)
- Changed `ToSetBuffalySessionModelSelection` to call the generated `set-session-model-selection` JsonWs route through `JsonWsHelper.CallInternalJsonWsSecure`.
- Design decision: avoid ProtoScript compile-time overload binding to the newly added service method while still executing the typed C# endpoint for validation and transport resolution.

## Return Setter To Runtime Host Wrapper (2026-05-29)
- Changed `ToSetBuffalySessionModelSelection` back to `CoreOntologyTools.SetSessionModelSelection(_opsAgent, ...)` after staging validation showed the direct JsonWs endpoint route was not available in the live web route table.
- Design decision: the loaded session runtime already owns this operation through `IAgentRuntimeHost`; using the runtime host wrapper avoids a brittle self-HTTP route and preserves the typed C# `ModelSelectionContract` failure payload for missing/unloaded runtimes.

## Rename Runtime Profiles And Add Catalog Tool (2026-05-29)
- Renamed the include from `OpenAIRuntimeProfiles.pts` to `RuntimeProfiles.pts` because provider/model selection now covers OpenAI, xAI, Gemini, and dynamically registered providers.
- Added `ToGetBuffalyProviderModelCatalog` to return the authoritative provider catalog through the runtime host wrapper.
- Design decision: keep this tool next to the existing runtime provider/model setter and getter, and keep ProtoScript limited to forwarding the optional `sessionKey` while C# owns catalog assembly and validation semantics.

## Rename Runtime Control Base Prototype (2026-05-29)
- Renamed `OpenAIRuntimeControlAction` to `RuntimeProfileControlAction` so the internal action root matches the provider-neutral runtime profile file name.
- Design decision: keep public tool names stable while removing the remaining OpenAI-specific type name from the shared provider/model/reasoning tool surface.

## Call Catalog Through Runtime Host (2026-05-29)
- Changed `ToGetBuffalyProviderModelCatalog` to call `_opsAgent.GetProviderModelCatalog(...)` directly after staging validation showed the static `CoreOntologyTools` wrapper could fail ProtoScript overload binding in the deployed content-lib context.
- Design decision: keep catalog assembly and validation in C# through `IAgentRuntimeHost` while avoiding an unnecessary static wrapper bind in ProtoScript glue.


## Remove Runtime Provider Selection Action (2026-06-06)
- Removed `ToSetBuffalySessionModelSelection`; OpsAgent runtime-profile tools now provide read/catalog inspection only, while provider-selection writes route through the session-service provider-selection contract.

## Include Parent Session Key In Runtime Context (2026-06-16)
- Added `SessionTools` import and extended `ToGetCurrentBuffalyRuntimeContext` output with `sessionKey` and `parentSessionKey`.
- Added natural phrases for retrieving the current session parent key.
- Design Decision: keep runtime context as the quick self-inspection path while sourcing parent metadata from the authoritative session store.

## Restore Session Model Selection Tool Through In-Process Wrapper (2026-06-21)
- Restored `ToSetBuffalySessionModelSelection` as a ProtoScript-facing action that forwards `sessionKey`, `provider`, `modelName`, and optional `reasoningLevel` directly to `CoreOntologyTools.SetSessionModelSelection(...)`.
- Design decision: ProtoScript remains a pure pass-through with no trimming/coercion and no JsonWs/self-HTTP call; C# owns provider-catalog validation, normalization, transport resolution, and session-service persistence.

- 2026-07-11 - Clarified model-selection agent guidance: callers must use ToGetBuffalyProviderModelCatalog first and pass exact catalog ModelName values to ToSetBuffalySessionModelSelection; non-catalog names are rejected instead of normalized.

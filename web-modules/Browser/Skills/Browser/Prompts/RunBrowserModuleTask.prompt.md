Use the autonomous Browser Workbench only when the user explicitly asks for a nested browser agent, self-running browser task, or Browser Workbench harness validation.

For normal browser automation, use `UseBrowserSkill` and `BrowserSessionSkill` primitives instead. Normal browser automation must not depend on a Browser web-module endpoint, internal URL, `BaseUrl`, `WorkerFeature.InternalBaseUrl`, or JsonWs route.

Inputs:
- instruction (required)
- model (optional)
- maxSteps (optional)
- profileName (optional)

Call `ToRunBrowserModuleTask` only for the explicit autonomous workbench case. Provide a concrete instruction and return the run result summary. Do not provide or resolve any Browser web-module URL override.


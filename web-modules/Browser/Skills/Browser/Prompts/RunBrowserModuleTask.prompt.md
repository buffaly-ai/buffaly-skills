Use the installed Browser web module to run the requested browser task end-to-end.

Inputs:
- instruction (required)
- model (optional)
- maxSteps (optional)
- profileName (optional)

Call ToRunBrowserModuleTask with a concrete instruction and return the run result summary. The Browser service resolves its base URL from WorkerFeature.InternalBaseUrl; do not provide an external web-module URL override.


`ToRunBrowserModuleTask` has been removed.

Do not use, load, recreate, or route to the autonomous Browser Workbench LLM loop. That legacy path launched a separate runner process, inherited an OpenAI API key, and posted directly to the OpenAI Responses API outside the Buffaly usage ledger.

For browser automation, use the direct BrowserSessionSkill surface instead:
- `ToOpenBrowserSession`
- `ToOpenBrowserUrl`
- selector click/type/press/wait/text/attribute tools
- `ToRunBrowserScript` for page JavaScript inspection
- `ToRunPlaywrightScript` for compact Playwright-style native automation
- `ToCaptureBrowserScreenshot`
- `ToGetBrowserConsoleEvents`

Normal browser automation must stay inside the main agent/tool loop and must not depend on a Browser web-module endpoint, internal URL, `BaseUrl`, `WorkerFeature.InternalBaseUrl`, JsonWs route, separate runner process, or direct model API call.


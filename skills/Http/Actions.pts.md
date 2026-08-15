# Http Actions.pts Change History

## Initial Creation (2026-08-15)
- Added `ToCheckUrlStatus`, `ToFetchUrlContent`, `ToPostJsonToUrl`, `ToDownloadFileFromUrl`, and `ToCheckMultipleUrlStatuses`.
- All actions are thin wrappers over `Buffaly.Agent.Tools.Http.WebRequests` and return bounded structured JSON.
- Design Decision: use a dedicated Http skill rather than placing web requests in Process; existing Process guard logic is unchanged.

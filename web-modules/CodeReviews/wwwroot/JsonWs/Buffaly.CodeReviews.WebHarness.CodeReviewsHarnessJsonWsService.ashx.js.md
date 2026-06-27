# CodeReviewsHarnessJsonWsService.ashx.js Change Notes

## Static JsonWs stub
- Added the static JsonWs JavaScript stub for the standalone harness.

## Remove Page dependency
- Removed the direct global Page dependency so repository loading works when the shared Page object is unavailable.


## Standalone Fetch Stub (2026-05-07)`n- Replaced KCS `JsonMethod`/`ObjectUtil` usage with a standalone `fetch` based JsonWs client so the harness works without shared portal scripts.

## Standalone fetch stub
- Replaced JsonMethod/Page-dependent calls with a standalone fetch-based JsonWs client for the code reviews harness.

`n## JsonMethod integration restored`n- Restored the generated stub pattern to call shared `JsonMethod` from the static Buffaly JavaScript bundle instead of using a standalone fetch rewrite.

## JsonMethod client restoration
- Restored the generated client to call through JsonMethod and ObjectUtil.Promisify with a Page fallback for standalone startup.


## Restore JsonMethod stub (2026-05-07 14:47:50)
- Restored the JsonWs stub to use JsonMethod/ObjectUtil conventions with an early Page fallback.

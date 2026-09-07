# SearchConsole skill

Owner-source Google Search Console skill for Buffaly.Marketing through the canonical Feeding Frenzy route-based Google operations service.

## Binding

- Callers pass `FeedingFrenzyWebPropertiesJsonWsService service`; use `FeedingFrenzyWebPropertiesJsonWsService#Remote` for production.
- Canonical remote binding: `BaseUrl = https://ff.intelligencefactory.ai`, `TokenKey = FeedingFrenzy.ApiKey`.
- Routes are generated method routes under `api/feedingfrenzy.admin.business/google-operations/*`.
- The tool caller does not provide Google secrets, activate `gcloud`, call Google APIs directly, or set process-global credentials.

## Actions

- `ToListSearchConsoleSites(service)` -> `list-search-console-sites`
- `ToRunSearchConsolePerformanceReport(service, siteUrl, startDate, endDate, dimensionsCsv, rowLimit, dataState)` -> `run-search-console-performance-report` with `SiteUrl`, `StartDate`, `EndDate`, `DimensionsCsv`, `RowLimit`, `DataState`
- `ToRunSearchConsoleReport(service, siteUrl, startDate, endDate, dimensionsCsv, rowLimit, dataState, startRow)` -> `run-search-console-report` with `SiteUrl`, `StartDate`, `EndDate`, `DimensionsCsv`, `RowLimit`, `DataState`, `StartRow`
- `ToProvisionSearchConsoleProperty(service, rootDomain, sitemapUrl, proofDirectoryPath, allowCreateProperty, allowProvisionDnsTxt, allowVerifyOwnership, allowSubmitSitemap)` -> `provision-search-console-property` with `RootDomain`, `SitemapUrl`, `AllowCreateProperty`, `AllowProvisionDnsTxt`, `AllowVerifyOwnership`, `AllowSubmitSitemap`

`proofDirectoryPath` is validated by the native `GoogleOperationsLocalProofHelper`, which writes a unique probe and persists sanitized preflight evidence before mutation, then persists sanitized result evidence after the successful Feeding Frenzy response and returns a wrapper containing `LocalProofEvidencePath`. The local path is not sent to Feeding Frenzy; FF creates server-owned proof artifacts.



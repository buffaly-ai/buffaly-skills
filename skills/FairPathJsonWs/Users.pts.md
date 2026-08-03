# FairPathJsonWs Users Change History

## Use Package-Specific User Lookup Prototype Name (2026-08-03)
- Renamed `Users_GetUserByEmail` to `FairPathJsonWs_Users_GetUserByEmail` while preserving both FairPath-specific semantic phrases and the route contract.
- Prevents lazy-module ownership collision with the independent FeedingFrenzy JsonWs package.

## 2026-04-23
- Added read-only wrappers for user list and email lookup routes.

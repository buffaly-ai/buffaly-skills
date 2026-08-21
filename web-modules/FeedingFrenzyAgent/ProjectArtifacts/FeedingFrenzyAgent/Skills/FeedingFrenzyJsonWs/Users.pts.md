# Users.pts

Read-only wrappers for user lookup JsonWs routes used by navigation/user support modes.

## Use Package-Specific User Lookup Prototype Name (2026-08-03)

Renamed `Users_GetUserByEmail` to `FeedingFrenzyJsonWs_Users_GetUserByEmail` while preserving its semantic phrase and route contract. This prevents lazy-module ownership collision with the independent FairPath JsonWs package.


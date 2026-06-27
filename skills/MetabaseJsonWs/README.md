# Metabase JsonWs Skill Directory

This directory contains the JSL1/classic JSONWS RootTrax Metabase skill for OpsAgent.

It is intentionally separate from `MetabaseRuntime`:
- `MetabaseRuntime` calls local RooTrax DLL APIs.
- `MetabaseJsonWs` calls a running Metabase web host through `/JsonWS/*.ashx` endpoints.

The default binding is `MetabaseJsonWsService#Localhost_5197`.

# ErrorDiagnostic Profile

Package profile artifact associated with the no-companion `error-diagnostic-agent`. Diagnostic sessions use the installed OpsAgent project and `ErrorDiagnostic` context; they are not dispatchers.

## Runtime Boundary (2026-09-01)
- The diagnostic profile includes only `../../CoreLite/CoreLite.pts`. The two ErrorLogDispatch lifecycle actions belong to the parent `dispatch-agent`; loading them in the diagnostic child requires `DispatchAgentCuratedActionRoot` and incorrectly gives the child dispatcher capabilities.

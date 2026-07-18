# Validate an extension end to end

1. Validate owning-source build/tests and compatibility contracts.
2. Run non-publishing catalog/dry reconciliation and prove the requested Id/Type/Defaults/All selector.
3. Validate canonical Local payload/index hashes, Git commit, and Remote parity when in scope.
4. Validate profile/platform locks for installer inclusion.
5. Preview target install and record immediate versus pending projection.
6. For staging pre-start packages, run the supported stopped-host update/start sequence; do not touch Matt.
7. Verify receipt, installed files, diagnostics/registration, and one representative route/action/provider result.
8. If process behavior changed, test package failure isolation and cancellation/timeout child cleanup.
9. Record commands, HTTP/status/log evidence, commits, and waived checks. Never claim runtime validation from source-only tests.

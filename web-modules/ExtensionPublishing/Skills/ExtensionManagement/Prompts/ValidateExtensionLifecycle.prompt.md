# Validate an extension end to end

Use at least one real package as proof; for a WebModule with embedded skills verify both the page/service and imported actions.

1. Prove the owning source is committed, buildable, tested, and not an installed/generated/temp copy.
2. Prove one typed catalog entry and the intended `DefaultPublish` value. Run one-package dry-run and the relevant All/Defaults selector test.
3. Prove canonical Local payload/index/version/hash integrity and scoped Git commit. If Remote is required, prove origin parity after pushing the exact Local commit.
4. Prove profile/platform locks only when installer inclusion is requested.
5. Preview with Skill Management and record immediate versus pre-start/pending projection.
6. For staging pre-start packages, use the supported stopped-host update-all/start lifecycle; do not touch Matt.
7. Prove receipt, installed payload, diagnostics/startup registration, ProjectArtifact import, and one representative route/action/provider result.
8. For bulk publishing, prove package failure isolation plus timeout/cancellation process-tree cleanup.
9. Record commands, JSON/HTTP/status/log evidence, commits, package versions, and waived checks. Never claim runtime validation from source-only tests or publication success from a hand-copied installed payload.

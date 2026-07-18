# Install or update a Buffaly extension

1. Resolve target instance, package ID/type, Local/Remote source, index version, receipt, and active state.
2. Preview and validate hashes before mutation. Explain ordinary immediate activation versus pre-start behavior.
3. A live WebModule/ProviderModule request records `PendingInstall`; it does not overwrite loaded files. Consume it through the supported controlled update while the target host is stopped. `StartOnly` does not run update-all.
4. Never stop or restart Matt without explicit approval. Use staging wrappers for staging validation.
5. After startup verify receipt lifecycle/version, installed payload, diagnostics/registration, representative route/action, and repository currency.
6. Report repository version, receipt version, active-now state, and pending-next-restart state separately. Never infer activation or fabricate receipt versions from timestamps.

# Install or update a Buffaly extension through Skill Management

1. Resolve target instance, exact package ID/type, Local/Remote source, repository version, installed receipt, install state, active version, and `RequiresPreStartInstall` before mutation.
2. Preview through Skill Management/package CLI and validate repository hashes. Do not manufacture receipts or infer active state from timestamps.
3. Skills that do not require pre-start may install immediately. WebModules and ProviderModules normally require pre-start: a live install request records `PendingInstall`/desired version and must not overwrite loaded files.
4. Consume pending or available pre-start packages only through the controlled target update while that target is stopped. For staging use `update_web_and_dlls.staging.ps1 -UpdateAll -ExtensionSource Local|Remote`; `-StartOnly` starts hosts but does not run update-all. Never stop or restart Matt without explicit approval.
5. After startup verify all layers: receipt `LifecycleState=Installed`, desired/installed/repository versions agree, package files exist under the typed install path, diagnostics reports the WebModule/ProviderModule loaded, packaged ProjectArtifacts were imported, and one representative page/action/provider operation works.
6. A package row is not complete merely because files exist. Report separately: published Local, available Remote, installed receipt, active now, pending next restart, startup registration, and functional validation.
7. For multiple packages, preserve package-level outcomes and continue independent failures. Repair source/catalog/package/index problems in Extension Publishing; repair receipt/install/activation problems in Skill Management.

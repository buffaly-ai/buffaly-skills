# SourceViewer standalone page

Read-only CodeMirror page owned by the SourceViewer WebModule. The page loads only local CodeMirror core and the shared source-language detector initially; language-specific modes are loaded after the canonical opened filename is returned by the API. The header badge, editor mode, and status language therefore reflect the same file identity.
# WebProperty Editor Core Lite Profile

This profile intentionally loads the shared OpsAgent `CoreLite/CoreLite.pts` substrate and the self-contained package-owned `WebPropertyEditorSkill` only. It must not include the full OpsAgent project or copy Core Lite into the package.

`WebPropertyEditorAgentActionRoot` is the profile action root. `WebPropertyEditorAgentEntityRoot` is the profile entity root. Those roots are declared by the self-contained skill so both the global generated skill index and this Core Lite profile compile the same declarations. Callable actions explicitly inherit both the skill and restricted agent roots.

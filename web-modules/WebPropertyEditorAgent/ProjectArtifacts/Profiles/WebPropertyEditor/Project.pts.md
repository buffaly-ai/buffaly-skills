# WebProperty Editor Core Lite Profile

This profile intentionally loads the shared OpsAgent `CoreLite/CoreLite.pts` substrate, the WebProperty Editor agent roots, and the package-owned `WebPropertyEditorSkill` only. It must not include the full OpsAgent project or copy Core Lite into the package.

`WebPropertyEditorAgentActionRoot` is the profile action root. `WebPropertyEditorAgentEntityRoot` is the profile entity root. The skill action root derives from the agent action root so the profile exposes only the bound editor tool family plus Core Lite primitives.

# index.pts Change History

## Initial Creation (2026-06-20)
- Created the GitHub ProtoScript skill handoff with `GitHubSkillAction`, `GitHubSkill`, and action prototypes for GitHub organization, repository, issue, commit comment, and local git operations.
- Design Decision: Kept every action as a thin wrapper that returns the matching `GitHubSkillFacade` call directly, preserving the facade as the single implementation boundary.

## Add Typed Git Read Actions (2026-08-15)
- Added `ToGetGitDiff`, `ToGetGitShow`, and `ToGetGitLog` thin wrappers with bounded output parameters.
- Design Decision: placed these actions in the existing GitHub skill because it already owns all local git discovery, mutation, and release operations.

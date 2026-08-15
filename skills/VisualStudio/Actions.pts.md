# Skills/VisualStudio/Actions.pts

Purpose
- Contains executable Visual Studio skill actions for build, launch, deploy, and related developer workflow operations.
- Keeps general Visual Studio operational actions in one skill surface.

Key actions
- `ToBuildDotNetProject`
- `ToRunDotNetTests`
- `ToPublishDotNetProject`
- `ToBuildVisualStudioSolutionFromBuildProfile`
- `ToBuildVisualStudioSolution`
- `ToLaunchRunProfile`
- `ToApplyDeployProfile`
- `ToUpdateDllsForSolution`

Notes
- Solution-to-ontology serialization wrappers now live in `VisualStudioOntologyGenerator.pts` so `Actions.pts` stays focused on general Visual Studio operations.
- Dotnet build, test, and publish actions delegate to `DotNetProjects` and return bounded diagnostic output instead of full CLI transcripts.

# Desktop Skill

Provider-independent desktop inspection and interaction actions. The registered Desktop Viewer flow uses `ToListVisibleDesktopWindows` to return the exact native window inventory, then `ToViewDesktopWindowInteractiveSite` to launch the selected process/title through the `desktop-viewer-module` `window` screen. C# validates and serializes launch state; ProtoScript remains thin orchestration glue. The older experimental blocking control actions remain compatibility tools and are not the preferred registered-component path.

# UnityInteractionSkill

UnityInteractionSkill exposes Buffaly agent actions for controlling a Unity host application via TCP JSON protocol on port 7777.

## Architecture

- **Unity Host**: A standalone Unity build (`UnityHost.exe`) runs with `-batchmode -nographics -force-d3d11` and listens for TCP connections on port 7777.
- **Protocol**: Newline-delimited JSON. Client sends one JSON command per line, server responds with one JSON response per line.
- **Commands**: Spawn, Move, Destroy, GetSceneState.
- **Skill Location**: `C:\dev\Buffaly.Unity` (solution, Unity project, test client, mock server).
- **Build Output**: `C:\dev\Buffaly.Unity\Build\UnityHost.exe`.

## Action Hierarchy

### Phase 1 - Primitives
1. `ToConnectToUnityHost` - Verify Unity host is running and responsive
2. `ToSpawnUnityObject` - Spawn a primitive (Cube, Sphere, Capsule, Cylinder, Plane)
3. `ToMoveUnityObject` - Move an object to a new position
4. `ToDestroyUnityObject` - Destroy an object by ID
5. `ToGetUnitySceneState` - Get all objects with positions and rotations

### Phase 2 - Mid-level
6. `ToSpawnUnityRow` - Spawn a row of objects along the X axis

### Phase 3 - High-level Composite Actions
7. `ToBuildUnityTower` - Stack cubes vertically to build a tower
8. `ToCreateUnityGrid` - Create a 2D grid of objects
9. `ToBuildUnitySimpleHouse` - Build a house (floor + 4 walls + roof)

### Phase 4 - Advanced Composite Actions
10. `ToCreateUnityStableStructure` - Build a pyramid-like stable structure
11. `ToArrangeUnityPattern` - Arrange objects in circle, spiral, or line patterns

### Utility Actions
12. `ToLaunchUnityHost` - Launch the Unity standalone build in batch mode
13. `ToCaptureUnityScene` - Capture a desktop screenshot of the Unity scene
14. `ToRunUnityDemo` - Run the complete end-to-end demo (all phases)

## Usage Examples

### Spawn a cube
```
ToSpawnUnityObject(host="localhost", port=7777, type="Cube", x=0, y=5, z=0)
```

### Build a tower
```
ToBuildUnityTower(host="localhost", port=7777, height=4, x=10, z=0)
```

### Create a circular pattern
```
ToArrangeUnityPattern(host="localhost", port=7777, pattern="circle", type="Sphere", count=8, centerX=0, centerY=1, centerZ=-15, radius=5)
```

### Run the full demo
```
ToRunUnityDemo(host="localhost", port=7777)
```

## How High-Level Actions Reduce Low-Level Calls

- `ToBuildUnityTower(4)` replaces 4 individual `ToSpawnUnityObject` calls
- `ToCreateUnityGrid(3, 3)` replaces 9 individual spawn calls
- `ToBuildUnitySimpleHouse` replaces 6 individual spawn calls
- `ToCreateUnityStableStructure(3)` replaces 6 individual spawn calls (3+2+1 pyramid)
- `ToArrangeUnityPattern("circle", 8)` replaces 8 individual spawn calls with trigonometric positioning
- `ToRunUnityDemo` replaces 40+ individual calls with a single action

## Limitations

- Unity host must be running before actions can be called (use `ToLaunchUnityHost` first)
- Batch mode has no graphics rendering (use `ToGetUnitySceneState` for scene inspection)
- Screenshot capture requires a graphical Unity build or Unity Editor window
- All objects are unit-sized primitives (no scaling yet)
- No physics simulation in batch mode

## Future Ideas

- Add scaling and rotation support to Spawn command
- Add color/material support
- Implement physics-based stability checking
- Add render-to-texture screenshot from Unity camera
- Integrate with FFmpegSkill for video recording of builds
- Add undo/redo support
- Add object grouping and naming
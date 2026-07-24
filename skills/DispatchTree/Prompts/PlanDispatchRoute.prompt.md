# Deprecated Dispatch Route Planner

Active Dispatch agents follow the existing `DispatchContext`, which owns destination judgment and the per-turn routing algorithm.

This compatibility action does not search, traverse, select, dispatch, or mutate a route. Diagnostic callers that need tree evidence should invoke the bounded read actions explicitly:

- `ToSearchDispatchMemories` for scoped semantic anchors;
- `ToGetDispatchPath` to place an anchor in its hierarchy;
- `ToGetDispatchChildren` to compare one immediate level;
- `ToGetDispatchNode` to verify one narrowed node's saved evidence and exact destination.

`ToGetDispatchTree` remains a complete-topology diagnostic only and is not a normal routing input.

SideEffects: none

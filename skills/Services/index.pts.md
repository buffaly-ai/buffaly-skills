# Services skill

Defines the `ServicesSkill` skill entity and service-discovery actions for ProtoScript-backed services.

## Purpose
Provide a clean ProtoScript skill surface for:
- listing all available services recursively from the `Service` base prototype,
- returning the declared service hierarchy as a tree for inspection.

## Design notes
- `ToListServices` uses `Service.GetAllDescendants()` directly because service discovery should be rooted in the actual ProtoScript service type model.
- `ToGetServiceHierarchy` clones descendants recursively so callers can inspect the inheritance tree without relying on host-side registry code.
- This is intentionally ProtoScript-only and does not add any host or tool-registration special cases.

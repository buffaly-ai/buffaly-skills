# Add RootTrax Metabase object properties using JSONWS/JSL1

Use this prompt after an object exists and the user wants to add or update fields/properties through the Metabase JSONWS path.

## Preferred actions

- `MetabaseObjects_GetObject`
- `MetabaseProperties_GetPropertiesByObjectID`
- `MetabaseProperties_InsertProperty`
- `MetabaseProperties_UpdateProperty`
- `MetabaseProperties_RemoveProperty`
- optional low-level escape hatch: `ToCallMetabaseJsonWsMethod`

## Modeling rules from Metabase object designer prompt

Source: `MetabaseRuntime/Prompts/NLtoObjectSpec.md`.

- Use full names; avoid abbreviations.
- Primary key is `<ObjectName>ID`.
- Foreign keys use `<RelatedObjectName>ID`.
- Use PascalCase for property names.
- Friendly names should be human-readable with spaces.
- Validate nullability, uniqueness, natural key status, and type id before inserting.

Common type note:
- `TypeID = 1` is used by the Metabase UI for ID properties.
- For other field types, inspect existing comparable object properties before choosing `TypeID`.

## Workflow

1. Bind service and object:
   - Use `MetabaseJsonWsService#Localhost_5197` unless another binding is explicit.
   - Call `MetabaseObjects_GetObject`.
   - Call `MetabaseProperties_GetPropertiesByObjectID`.
2. Build a property change plan:
   - List new properties.
   - List updates to existing properties.
   - Flag destructive removals separately; do not remove without explicit approval.
3. For each new property:
   - Call `MetabaseProperties_InsertProperty(service, ObjectID, PropertyName, FriendlyPropertyName, TypeID, IsNullable, DefaultValue, IsUnique, IsNaturalKey)`.
4. For each existing property update:
   - Call `MetabaseProperties_UpdateProperty(...)` with the complete property shape.
5. Validate:
   - Re-call `MetabaseProperties_GetPropertiesByObjectID`.
   - Confirm every expected property is present with expected type/nullability/flags.

## Output contract

Return:
1. Object binding.
2. Property plan.
3. Insert/update calls performed.
4. Validation evidence.
5. Remaining cautions before materialization.

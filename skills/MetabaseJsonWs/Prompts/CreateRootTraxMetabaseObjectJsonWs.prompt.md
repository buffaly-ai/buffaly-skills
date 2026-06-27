# Create a RootTrax Metabase object using JSONWS/JSL1

Use this prompt when the user wants to create a new RootTrax Metabase object through the preferred JSONWS skill path.

## Preferred skill/action surface

Use `MetabaseJsonWs`, not `MetabaseRuntime`, unless the user explicitly requests the DLL runtime path.

Primary actions:
- `MetabaseApplications_GetAll`
- `MetabaseObjects_GetAll`
- `MetabaseObjects_GetObjectsByObjectName`
- `MetabaseObjects_InsertObject`
- `MetabaseProperties_InsertProperty`
- `MetabaseProperties_GetPropertiesByObjectID`
- optional low-level escape hatch: `ToCallMetabaseJsonWsMethod`

## Researched UI sequence

Metabase UI source: `C:\dev\RooTrax\RooTrax.Utilities\Metabase\wwwroot\kScripts\Objects\Object.Insert.ks.html`.

The UI create flow does:
1. `Objects.InsertObjectObject(oArgs, callback)`.
2. Immediately calls `Properties.InsertPropertyObject(...)` to add the primary key property:
   - `ObjectID = new object id`
   - `PropertyName = ObjectName + "ID"`
   - `FriendlyPropertyName = InsertSpacesInWords(ObjectName) + " ID"`
   - `TypeID = 1`
   - `IsNullable = false`
   - `IsUnique = false`
   - `IsNaturalKey = false`

## Workflow

1. Bind service:
   - Default local: `MetabaseJsonWsService#Localhost_5197`.
   - Confirm local Metabase is running before write calls.
2. Resolve application context:
   - Call `MetabaseApplications_GetAll`.
   - Choose the correct `ApplicationID`; do not guess when multiple candidates exist.
3. Check for existing object:
   - Call `MetabaseObjects_GetObjectsByObjectName` and/or `MetabaseObjects_GetAll`.
   - If a matching object already exists, stop and ask whether to update/copy rather than insert duplicate metadata.
4. Normalize object names:
   - `ObjectName`: singular PascalCase.
   - `ObjectsName`: plural PascalCase.
   - `FriendlyObjectName`: human singular.
   - `FriendlyObjectsName`: human plural.
   - `Data`: `{}` unless a reviewed JSON data payload is needed.
5. Create object:
   - Call `MetabaseObjects_InsertObject(service, ObjectName, ObjectsName, FriendlyObjectName, FriendlyObjectsName, ApplicationID, Data)`.
   - Capture returned `ObjectID`.
6. Add primary key property:
   - Call `MetabaseProperties_InsertProperty(service, ObjectID, ObjectName + "ID", FriendlyObjectName + " ID", 1, false, "", false, false)`.
7. Validate:
   - Call `MetabaseObjects_GetObject` for `ObjectID`.
   - Call `MetabaseProperties_GetPropertiesByObjectID` and confirm the ID property exists.

## Output contract

Return:
1. Service binding and base URL used.
2. Application binding and `ApplicationID`.
3. Object metadata inserted or existing object found.
4. Primary key property result.
5. Validation evidence.
6. Next recommended prompt: add properties or materialize database.

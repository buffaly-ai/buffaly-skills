# Tasks and TaskStatuses JsonWs Actions

Thin wrappers over the generated `FeedingFrenzy.Admin.Business.Tasks` and `TaskStatuses` JsonWs routes.

## Reads

- `Tasks_GetTask`
- `Tasks_GetTasks`
- `Tasks_GetTasksByTaskStatusID`
- `TaskStatuses_GetTaskStatus`
- `TaskStatuses_GetTaskStatuses`
- `TaskStatuses_GetTaskStatusByTaskStatusName`

These inherit `FeedingFrenzyJsonWsSkillAction` and are available through the normal Feeding Frenzy JsonWs skill.

## Guarded writes

- `Tasks_InsertTask`
- `Tasks_UpdateTask`
- `Tasks_UpdateTaskData`
- `Tasks_RemoveTask`

These inherit `FeedingFrenzyJsonWsGuardedWriteAction`, preserving the existing rule that mutating CRM actions require explicit loading rather than default-agent exposure.

The wrappers preserve generated route names, parameter casing, and nullability. `AssignToUserID` is nullable, matching the generated business and repository contracts. `DueDate` is passed as an ISO-like string accepted by JsonWs date binding; an empty string represents a nullable due date. `Notes` is the task detail field. `Data` is metadata only and, for Work Queue rows, is limited to `customer` and `waitingReason`.

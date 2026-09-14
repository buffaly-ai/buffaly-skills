IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'Sessions_ResetRunningRuntimeStatusOnWebStartupSp')
BEGIN
	DROP PROCEDURE Sessions_ResetRunningRuntimeStatusOnWebStartupSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO

CREATE PROCEDURE [dbo].[Sessions_ResetRunningRuntimeStatusOnWebStartupSp]
AS
BEGIN
	SET NOCOUNT ON

	DECLARE @nowUtc nvarchar(50) = CONVERT(nvarchar(50), SYSUTCDATETIME(), 127) + 'Z'

	UPDATE Sessions
	SET
		NeedsAttention = 1,
		Data = JSON_MODIFY(JSON_MODIFY(JSON_MODIFY(JSON_MODIFY(JSON_MODIFY(
			JSON_MODIFY(Data, '$.RuntimeStatus', 'Loaded'),
			'$.IsRunning', CAST(0 AS bit)), '$.ActiveTurnKey', ''),
			'$.CurrentTurnStartedUtc', ''), '$.LastNonRunningUtc', @nowUtc),
			'$.LastRuntimeStateUpdatedUtc', @nowUtc),
		LastUpdated = GETUTCDATE()
	WHERE
		ISJSON(Data) = 1
		AND JSON_VALUE(Data, '$.RuntimeStatus') = 'Running'

	SELECT @@ROWCOUNT AS UpdatedCount
END
GO

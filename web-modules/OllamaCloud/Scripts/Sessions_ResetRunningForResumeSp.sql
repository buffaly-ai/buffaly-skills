CREATE OR ALTER PROCEDURE dbo.Sessions_ResetRunningForResumeSp
	@CaptureCandidates bit
AS
BEGIN
	SET NOCOUNT ON;
	SET XACT_ABORT ON;
	DECLARE @nowUtc nvarchar(50) = CONVERT(nvarchar(50), SYSUTCDATETIME(), 127) + 'Z';
	DECLARE @changed TABLE (SessionKey nvarchar(255), TurnKey nvarchar(255), IsArchived bit);
	IF @CaptureCandidates = 0
	BEGIN
		UPDATE Sessions SET NeedsAttention=1,
		Data=JSON_MODIFY(JSON_MODIFY(JSON_MODIFY(JSON_MODIFY(JSON_MODIFY(JSON_MODIFY(Data,'$.RuntimeStatus','Loaded'),'$.IsRunning',CAST(0 AS bit)),'$.ActiveTurnKey',''),'$.CurrentTurnStartedUtc',''),'$.LastNonRunningUtc',@nowUtc),'$.LastRuntimeStateUpdatedUtc',@nowUtc), LastUpdated=GETUTCDATE()
		WHERE ISJSON(Data)=1 AND JSON_VALUE(Data,'$.RuntimeStatus')='Running';
		SELECT @@ROWCOUNT AS UpdatedCount, CAST(NULL AS nvarchar(255)) AS SessionKey, CAST(NULL AS nvarchar(255)) AS TurnKey;
		RETURN;
	END;
	UPDATE Sessions SET NeedsAttention=1,
	Data=JSON_MODIFY(JSON_MODIFY(JSON_MODIFY(JSON_MODIFY(JSON_MODIFY(JSON_MODIFY(Data,'$.RuntimeStatus','Loaded'),'$.IsRunning',CAST(0 AS bit)),'$.ActiveTurnKey',''),'$.CurrentTurnStartedUtc',''),'$.LastNonRunningUtc',@nowUtc),'$.LastRuntimeStateUpdatedUtc',@nowUtc), LastUpdated=GETUTCDATE()
	OUTPUT deleted.SessionKey, JSON_VALUE(deleted.Data,'$.ActiveTurnKey'), deleted.IsArchived INTO @changed
	WHERE ISJSON(Data)=1 AND JSON_VALUE(Data,'$.RuntimeStatus')='Running';
	DECLARE @count int=@@ROWCOUNT;
	SELECT @count AS UpdatedCount, c.SessionKey, c.TurnKey
	FROM (VALUES(1)) anchor(n)
	LEFT JOIN @changed c ON c.IsArchived=0 AND NULLIF(c.TurnKey,'') IS NOT NULL;
END
GO

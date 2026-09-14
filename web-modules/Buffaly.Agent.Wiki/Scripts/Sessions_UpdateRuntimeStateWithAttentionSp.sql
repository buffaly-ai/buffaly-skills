-- Atomically persist the existing runtime contract and one attention flag.
CREATE OR ALTER PROCEDURE dbo.Sessions_UpdateRuntimeStateWithAttentionSp
	@SessionKey nvarchar(255), @RuntimeStatus nvarchar(50), @IsRunning bit,
	@ActiveTurnKey nvarchar(255), @CurrentTurnStartedUtc nvarchar(50),
	@LastTurnStartedUtc nvarchar(50), @LastRunPulseUtc nvarchar(50),
	@LastNonRunningUtc nvarchar(50), @LastRuntimeStateUpdatedUtc nvarchar(50),
	@EvaluateAdmissionToken nvarchar(255)
AS
BEGIN
	SET NOCOUNT ON;
	IF @IsRunning <> CASE WHEN @RuntimeStatus = 'Running' THEN 1 ELSE 0 END
		THROW 51000, 'RuntimeStatus and IsRunning disagree.', 1;
	IF EXISTS (SELECT 1 FROM dbo.Sessions WHERE SessionKey = @SessionKey AND (Data IS NULL OR ISJSON(Data) <> 1))
		THROW 51000, 'Runtime attention write requires valid Sessions.Data.', 1;
	IF @IsRunning = 0 AND NULLIF(@LastNonRunningUtc, '') IS NULL
		THROW 51000, 'Non-running state requires LastNonRunningUtc.', 1;
	UPDATE s SET
		NeedsAttention = CASE WHEN @IsRunning = 1 THEN 0 WHEN JSON_VALUE(s.Data, '$.RuntimeStatus') = 'Running' THEN 1 ELSE NeedsAttention END,
		Data = JSON_MODIFY(JSON_MODIFY(JSON_MODIFY(JSON_MODIFY(JSON_MODIFY(JSON_MODIFY(JSON_MODIFY(JSON_MODIFY(JSON_MODIFY(JSON_MODIFY(JSON_MODIFY(s.Data,
			'$.RuntimeStatus', @RuntimeStatus), '$.IsRunning', @IsRunning),
			'$.ActiveTurnKey', CASE WHEN @ActiveTurnKey <> '' OR @IsRunning = 0 THEN @ActiveTurnKey ELSE JSON_VALUE(s.Data, '$.ActiveTurnKey') END),
			'$.CurrentTurnStartedUtc', CASE WHEN @CurrentTurnStartedUtc <> '' OR @IsRunning = 0 THEN @CurrentTurnStartedUtc ELSE JSON_VALUE(s.Data, '$.CurrentTurnStartedUtc') END),
			'$.LastTurnStartedUtc', CASE WHEN @LastTurnStartedUtc <> '' THEN @LastTurnStartedUtc ELSE JSON_VALUE(s.Data, '$.LastTurnStartedUtc') END),
			'$.LastRunPulseUtc', @LastRunPulseUtc),
			'$.LastNonRunningUtc', CASE WHEN @IsRunning = 1 THEN @LastNonRunningUtc WHEN JSON_VALUE(s.Data, '$.RuntimeStatus') = 'Running' THEN @LastNonRunningUtc ELSE JSON_VALUE(s.Data, '$.LastNonRunningUtc') END),
			'$.LastRuntimeStateUpdatedUtc', @LastRuntimeStateUpdatedUtc),
			'$.EvaluateAdmissionToken', NULLIF(@EvaluateAdmissionToken, '')),
			'$.LastRuntimeStatusChangedUtc', NULL), '$.PendingWorkerRecycleResumeTurnKey', NULL),
		LastUpdated = GETDATE()
	FROM dbo.Sessions s WHERE SessionKey = @SessionKey;
	SELECT CONVERT(bit, CASE WHEN @@ROWCOUNT = 1 THEN 1 ELSE 0 END) AS Updated;
END
GO

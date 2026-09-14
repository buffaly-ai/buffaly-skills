-- Matching admission rollback raises attention; stale tokens cannot stop a newer run.
CREATE OR ALTER PROCEDURE dbo.Sessions_RollbackEvaluateAdmissionWithAttentionSp
	@SessionKey nvarchar(255), @AdmissionToken nvarchar(255)
AS
BEGIN
	SET NOCOUNT ON;
	DECLARE @now nvarchar(50) = CONVERT(nvarchar(50), SYSUTCDATETIME(), 127) + 'Z';
	UPDATE dbo.Sessions SET NeedsAttention = 1,
		Data = JSON_MODIFY(JSON_MODIFY(JSON_MODIFY(JSON_MODIFY(JSON_MODIFY(JSON_MODIFY(JSON_MODIFY(Data,
			'$.RuntimeStatus', 'Unloaded'), '$.IsRunning', CAST(0 AS bit)), '$.ActiveTurnKey', ''),
			'$.CurrentTurnStartedUtc', ''), '$.LastNonRunningUtc', @now), '$.LastRuntimeStateUpdatedUtc', @now), '$.EvaluateAdmissionToken', NULL),
		LastUpdated = GETDATE()
	WHERE SessionKey = @SessionKey AND JSON_VALUE(Data, '$.RuntimeStatus') = 'Running'
		AND JSON_VALUE(Data, '$.EvaluateAdmissionToken') = @AdmissionToken;
	SELECT CONVERT(bit, CASE WHEN @@ROWCOUNT = 1 THEN 1 ELSE 0 END) AS Updated;
END
GO

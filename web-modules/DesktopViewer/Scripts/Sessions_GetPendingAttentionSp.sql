SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE OR ALTER PROCEDURE dbo.Sessions_GetPendingAttentionSp
AS
BEGIN
	SET NOCOUNT ON;
	IF EXISTS (SELECT 1 FROM dbo.Sessions WHERE NeedsAttention = 1 AND IsArchived = 0
		AND (ISJSON(Data) <> 1 OR NULLIF(JSON_VALUE(Data, '$.LastNonRunningUtc'), '') IS NULL))
		THROW 51000, 'Pending attention requires valid session data and stop stamp.', 1;
	SELECT SessionID, SessionKey, SessionName, AgentName,
		JSON_VALUE(Data, '$.SessionKind') AS SessionKind,
		JSON_QUERY(Data, '$.Specialization') AS Specialization,
		NeedsAttention, JSON_VALUE(Data, '$.LastNonRunningUtc') AS StopStamp
	FROM dbo.Sessions WHERE NeedsAttention = 1 AND IsArchived = 0
	ORDER BY CONVERT(datetimeoffset(7), JSON_VALUE(Data, '$.LastNonRunningUtc')), SessionID;
END
GO



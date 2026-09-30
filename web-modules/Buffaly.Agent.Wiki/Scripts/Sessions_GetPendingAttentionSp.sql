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
	-- Project only the latest recorded turn; never classify an interrupted newer turn from an older outcome.
	SELECT s.SessionID, s.SessionKey, s.SessionName, s.AgentName,
		JSON_VALUE(s.Data, '$.SessionKind') AS SessionKind,
		JSON_QUERY(s.Data, '$.Specialization') AS Specialization,
		s.NeedsAttention, JSON_VALUE(s.Data, '$.LastNonRunningUtc') AS StopStamp,
		CASE JSON_VALUE(m.Data, '$.TerminalOutcome.State')
			WHEN 'Failed' THEN 'Errors'
			WHEN 'Completed' THEN CASE WHEN JSON_VALUE(m.Data, '$.TerminalOutcome.SavedWorkResume') = 'true' THEN 'Resumed' ELSE 'Completed' END
			ELSE '' END AS AttentionGroup
	FROM dbo.Sessions s
	OUTER APPLY (SELECT TOP (1) TerminalMessageID FROM dbo.Turns WHERE SessionID = s.SessionID ORDER BY DisplayOrderAtUtc DESC, TurnID DESC) t
	LEFT JOIN dbo.Messages m ON m.MessageID = t.TerminalMessageID
	WHERE s.NeedsAttention = 1 AND s.IsArchived = 0
	ORDER BY CONVERT(datetimeoffset(7), JSON_VALUE(s.Data, '$.LastNonRunningUtc')), s.SessionID;
END
GO


